// Pure calculation functions, shared between the browser (plain <script> include)
// and Node-based tests (via the CommonJS export guard below).

function epleyOneRepMax(weight, reps) {
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

function brzyckiOneRepMax(weight, reps) {
  return weight * 36 / (37 - reps);
}

function lombardiOneRepMax(weight, reps) {
  return weight * reps ** 0.10;
}

function mayhewOneRepMax(weight, reps) {
  return (100 * weight) / (52.2 + 41.9 * Math.exp(-0.055 * reps));
}

// Estimated reps to failure at a given %1RM, by inverting the Epley formula
// (orm = weight * (1 + reps/30)) at weight = orm * (percent/100): reps =
// 30 * (100/percent - 1). Floored at 1 rep (100% must be at least a single).
function estimatedRepsAtPercent(percent) {
  return Math.max(1, Math.floor(30 * (100 / percent - 1)));
}

function percentageTable(orm, percentages = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]) {
  return percentages.map(percent => ({
    percent,
    weight: orm * (percent / 100),
    estimatedReps: estimatedRepsAtPercent(percent),
  }));
}

function wilksCoefficient(bw, sex) {
  const coeffs = sex === 'male'
    ? [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8]
    : [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];

  const [a, b, c, d, e, f] = coeffs;
  const denom = a + b * bw + c * bw ** 2 + d * bw ** 3 + e * bw ** 4 + f * bw ** 5;
  return 500 / denom;
}

function wilksScore(bw, lift, sex) {
  return lift * wilksCoefficient(bw, sex);
}

const WENDLER_LIFTS = ['squat', 'bench', 'deadlift', 'press'];

const WENDLER_WARMUP_SETS = [
  { percent: 40, reps: 5 },
  { percent: 50, reps: 5 },
  { percent: 60, reps: 3 },
];

const WENDLER_WEEKS = {
  1: { label: 'Week 1 (5/5/5+)', deload: false, sets: [
    { percent: 65, reps: 5 }, { percent: 75, reps: 5 }, { percent: 85, reps: 5, amrap: true },
  ] },
  2: { label: 'Week 2 (3/3/3+)', deload: false, sets: [
    { percent: 70, reps: 3 }, { percent: 80, reps: 3 }, { percent: 90, reps: 3, amrap: true },
  ] },
  3: { label: 'Week 3 (5/3/1+)', deload: false, sets: [
    { percent: 75, reps: 5 }, { percent: 85, reps: 3 }, { percent: 95, reps: 1, amrap: true },
  ] },
  4: { label: 'Week 4 (Deload)', deload: true, sets: [
    { percent: 40, reps: 5 }, { percent: 50, reps: 5 }, { percent: 60, reps: 5 },
  ] },
};

// +10 lb / +4.5359237 kg for squat & deadlift, +5 lb / +2.2679618 kg for bench & press,
// matching Wendler's standard per-cycle training max progression.
function trainingMaxIncrement(lift, unit) {
  const lowerBody = lift === 'squat' || lift === 'deadlift';
  if (unit === 'kg') return lowerBody ? 4.5359237 : 2.2679618;
  return lowerBody ? 10 : 5;
}

function trainingMax(oneRepMax, percent = 90) {
  return oneRepMax * (percent / 100);
}

function projectedTrainingMax(baseTrainingMax, lift, unit, cycle) {
  return baseTrainingMax + trainingMaxIncrement(lift, unit) * (cycle - 1);
}

function roundToIncrement(weight, increment) {
  return Math.round(weight / increment) * increment;
}

function wendler531Sets(trainingMaxValue, week, roundingIncrement) {
  const weekDef = WENDLER_WEEKS[week];
  if (!weekDef) throw new Error(`Invalid week: ${week}`);

  const toSet = (set, isWarmup) => {
    const rawWeight = trainingMaxValue * (set.percent / 100);
    return {
      percent: set.percent,
      reps: set.reps,
      amrap: !!set.amrap,
      warmup: isWarmup,
      weight: roundingIncrement ? roundToIncrement(rawWeight, roundingIncrement) : rawWeight,
    };
  };

  const warmup = weekDef.deload ? [] : WENDLER_WARMUP_SETS.map(s => toSet(s, true));
  const work = weekDef.sets.map(s => toSet(s, false));
  return [...warmup, ...work];
}

const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];
const AVAILABLE_PLATES_LB = [45, 35, 25, 10, 5, 2.5];

function calculatePlates(target, bar, availablePlates = AVAILABLE_PLATES) {
  let perSide = (target - bar) / 2;
  const used = [];

  for (const plate of availablePlates) {
    let count = 0;
    while (perSide + 1e-9 >= plate) {
      perSide -= plate;
      count++;
    }
    if (count > 0) used.push({ plate, count });
  }

  return { used, leftover: perSide };
}

const COMPOUNDING_FREQUENCIES = [
  { label: 'Annually', value: 1 },
  { label: 'Semi-annually', value: 2 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  { label: 'Daily', value: 365 },
];

// FV = P * (1 + r/n)^(n*t)
function compoundInterest(principal, annualRatePercent, compoundsPerYear, years) {
  const rate = annualRatePercent / 100;
  const futureValue = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * years);

  const yearly = [];
  for (let year = 1; year <= Math.floor(years); year++) {
    const balance = principal * Math.pow(1 + rate / compoundsPerYear, compoundsPerYear * year);
    yearly.push({ year, balance, interestEarned: balance - principal });
  }

  return { futureValue, interestEarned: futureValue - principal, yearly };
}

// scale factor = target servings / original servings, applied independently to every ingredient
function scaleRecipe(originalServings, targetServings, ingredients) {
  const scaleFactor = targetServings / originalServings;
  return {
    scaleFactor,
    ingredients: ingredients.map(ing => ({ ...ing, scaledQuantity: ing.quantity * scaleFactor })),
  };
}

const CONTRIBUTION_FREQUENCIES = [
  { label: 'Monthly', value: 12 },
  { label: 'Quarterly', value: 4 },
  { label: 'Annually', value: 1 },
];

// Ordinary annuity: each period, the running balance compounds first, then that
// period's contribution is added (so the first contribution starts growing the
// following period). Equivalent to FV = P*(1+i)^n + C*[((1+i)^n - 1) / i].
function investmentGrowth(initialLumpSum, contribution, periodsPerYear, annualRatePercent, years) {
  const periodicRate = annualRatePercent / 100 / periodsPerYear;
  const totalPeriods = periodsPerYear * years;

  let balance = initialLumpSum;
  let contributed = initialLumpSum;
  const yearly = [];

  for (let period = 1; period <= totalPeriods; period++) {
    balance = periodicRate === 0 ? balance : balance * (1 + periodicRate);
    balance += contribution;
    contributed += contribution;

    if (period % periodsPerYear === 0) {
      yearly.push({
        year: period / periodsPerYear,
        endingBalance: balance,
        cumulativeContributions: contributed,
        cumulativeGrowth: balance - contributed,
      });
    }
  }

  return { futureValue: balance, totalContributed: contributed, totalGrowth: balance - contributed, yearly };
}

// --- Cooking measurement converter ---

// Approximate grams per US cup for common baking ingredients. Actual weight
// varies with how an ingredient is packed/sifted, so these are reference
// values, not a precision measurement.
const INGREDIENT_GRAMS_PER_CUP = {
  allPurposeFlour: 120,
  granulatedSugar: 200,
  brownSugar: 220,
  powderedSugar: 120,
  butter: 227,
  honey: 340,
  milk: 245,
  water: 236,
  rice: 185,
  cocoaPowder: 85,
  oats: 90,
};

function cookingVolumeToGrams(ingredient, cups) {
  const gramsPerCup = INGREDIENT_GRAMS_PER_CUP[ingredient];
  if (!gramsPerCup) throw new Error('Select a known ingredient.');
  if (cups < 0) throw new Error('Amount must be zero or greater.');

  return cups * gramsPerCup;
}

function cookingGramsToVolume(ingredient, grams) {
  const gramsPerCup = INGREDIENT_GRAMS_PER_CUP[ingredient];
  if (!gramsPerCup) throw new Error('Select a known ingredient.');
  if (grams < 0) throw new Error('Grams must be zero or greater.');

  return grams / gramsPerCup;
}

// Baker's percentage, weights -> percentages: every ingredient (including each
// flour) expressed as a percentage of the combined flour weight.
function bakersPercentagesFromWeights(ingredients) {
  const totalFlourWeight = ingredients.filter(i => i.isFlour).reduce((sum, i) => sum + i.weight, 0);
  if (!(totalFlourWeight > 0)) throw new Error('Add at least one flour ingredient with a weight greater than zero.');

  return {
    totalFlourWeight,
    ingredients: ingredients.map(i => ({ ...i, percent: (i.weight / totalFlourWeight) * 100 })),
  };
}

// Baker's percentage, percentages -> weights: given a flour weight (or a target
// total dough weight, back-solved into a flour weight), apply each percentage.
function bakersWeightsFromPercentages(ingredients, { flourWeight, targetDoughWeight } = {}) {
  let totalFlourWeight = flourWeight;

  if (!totalFlourWeight && targetDoughWeight) {
    const totalPercent = ingredients.reduce((sum, i) => sum + i.percent, 0);
    totalFlourWeight = targetDoughWeight / (totalPercent / 100);
  }

  if (!(totalFlourWeight > 0)) throw new Error('Provide a total flour weight or a target total dough weight.');

  const withWeights = ingredients.map(i => ({ ...i, weight: (i.percent / 100) * totalFlourWeight }));
  const totalDoughWeight = withWeights.reduce((sum, i) => sum + i.weight, 0);

  return { totalFlourWeight, totalDoughWeight, ingredients: withWeights };
}

// Area of a round pan given its diameter (area = pi * (d/2)^2).
function roundPanArea(diameter) {
  return Math.PI * (diameter / 2) ** 2;
}

// Area of a rectangular pan given its length and width.
function rectangularPanArea(length, width) {
  return length * width;
}

// Pan-size / area-based scaling rule of thumb: spreading the same batter/dough
// over a bigger pan makes it thinner, so it bakes faster (and vice versa for a
// smaller pan). new time = original time / area ratio — this one formula
// handles both directions since a smaller new pan gives an area ratio < 1.
function panSizeCookingTime(originalTime, originalArea, newArea) {
  const areaRatio = newArea / originalArea;
  return { areaRatio, newTime: originalTime / areaRatio };
}

// Batch-quantity scaling rule of thumb (same pan/pot shape, more volume, e.g.
// a stew or roast): new time = original time * (new quantity / original quantity)^(1/3).
function batchQuantityCookingTime(originalTime, originalQuantity, newQuantity) {
  const quantityRatio = newQuantity / originalQuantity;
  return { quantityRatio, newTime: originalTime * Math.cbrt(quantityRatio) };
}

// total recipe calories = sum of every ingredient's contributed calories
// calories per serving = total recipe calories / number of servings
function caloriesPerServing(ingredients, servings) {
  const totalCalories = ingredients.reduce((sum, ing) => sum + ing.calories, 0);
  return {
    totalCalories,
    caloriesPerServing: totalCalories / servings,
    ingredients,
  };
}

// Standard amortizing loan payment: M = P * [ r * (1+r)^n ] / [ (1+r)^n - 1 ],
// where r is the monthly rate (decimal) and n is the term in months.
// Handled specially when r = 0, since the formula divides by zero there: M = P / n.
function loanMonthlyPayment(principal, annualRatePercent, termMonths) {
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (principal * monthlyRate * factor) / (factor - 1);
}

// Month-by-month amortization: each month's interest is the prior balance times
// the monthly rate, and the rest of the fixed payment (plus any extra overpayment,
// applied entirely to principal) reduces the balance. The final month is capped so
// the balance never goes negative. A safety cap on iterations guards against a
// non-amortizing rate/term/payment combination that would otherwise never reach zero.
function amortizationSchedule(principal, annualRatePercent, termMonths, extraPayment = 0) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const monthlyPayment = loanMonthlyPayment(principal, annualRatePercent, termMonths);

  const schedule = [];
  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  let month = 0;
  const maxIterations = termMonths + 1200;

  while (balance > 1e-8 && month < maxIterations) {
    month++;
    const interest = balance * monthlyRate;
    let principalPortion = (monthlyPayment - interest) + extraPayment;
    if (principalPortion > balance) principalPortion = balance;
    if (principalPortion < 0) principalPortion = 0;

    const paymentAmount = interest + principalPortion;
    balance -= principalPortion;
    totalInterest += interest;
    totalPaid += paymentAmount;

    schedule.push({
      month,
      payment: paymentAmount,
      interest,
      principal: principalPortion,
      balance: Math.max(balance, 0),
    });
  }

  return { schedule, totalInterest, totalPaid, monthsToPayoff: month, monthlyPayment };
}

// Two-part car lease payment: a depreciation fee (the cap cost minus residual,
// spread evenly over the term) plus a finance fee (a "money factor" applied to
// the sum of cap cost and residual, standing in for interest on a lease).
// The money factor is the APR as a plain percentage number divided by 2400
// (equivalent to (APR/100)/24 — the industry-standard conversion), not
// (APR/100)/2400.
function carLeasePayment(capCost, residualValue, termMonths, annualRatePercent) {
  const depreciationFee = (capCost - residualValue) / termMonths;
  const moneyFactor = annualRatePercent / 2400;
  const financeFee = (capCost + residualValue) * moneyFactor;
  const monthlyPayment = depreciationFee + financeFee;

  return {
    depreciationFee,
    financeFee,
    monthlyPayment,
    totalPaid: monthlyPayment * termMonths,
  };
}

const CREDIT_CARD_MIN_PAYMENT_DEFAULTS = { minPercent: 2, minFloor: 25 };

// Month-by-month credit card payoff simulation with a fixed monthly payment.
// Returns null if the payment doesn't even cover the first month's interest,
// since the balance would never shrink (would loop forever otherwise).
function creditCardPayoffFixed(balance, aprPercent, payment, maxMonths = 1200) {
  const monthlyRate = aprPercent / 100 / 12;
  if (payment <= balance * monthlyRate) return null;

  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  const schedule = [];

  while (bal > 1e-8 && months < maxMonths) {
    months++;
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
    schedule.push({ month: months, balance: Math.max(bal, 0), interest, principal });
  }

  return { months, totalInterest, totalPaid: balance + totalInterest, schedule };
}

// Same simulation, but the payment each month is a shrinking "minimum payment"
// (max of a percentage of the current balance and a floor amount), modeling
// the typical credit card minimum-payment trap. Returns null if even the
// minimum payment never covers a month's interest (balance never shrinks).
function creditCardPayoffMinimum(balance, aprPercent, minPercent = CREDIT_CARD_MIN_PAYMENT_DEFAULTS.minPercent, minFloor = CREDIT_CARD_MIN_PAYMENT_DEFAULTS.minFloor, maxMonths = 1200) {
  const monthlyRate = aprPercent / 100 / 12;

  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  const schedule = [];

  while (bal > 1e-8 && months < maxMonths) {
    const payment = Math.max(bal * (minPercent / 100), minFloor);
    const interest = bal * monthlyRate;
    if (payment <= interest) return null;

    months++;
    let principal = payment - interest;
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
    schedule.push({ month: months, balance: Math.max(bal, 0), interest, principal });
  }

  return { months, totalInterest, totalPaid: balance + totalInterest, schedule };
}

// --- Debt payoff planner (snowball vs. avalanche) ---

// Month-by-month multi-debt payoff simulation. `debts` is a list of
// {name, balance, aprPercent, minimumPayment}. Every month, interest accrues
// on every debt, then every debt's minimum payment is applied, then whatever
// budget remains ("extra") is directed entirely at one debt at a time in
// priority order — smallest balance first for 'snowball', highest APR first
// for 'avalanche' — with a paid-off debt's own minimum payment freed up to
// join the extra pool for the rest of the plan (paid off debts are simply
// skipped, so their old minimum naturally stops being subtracted from budget
// each month). Returns null if the budget can't even cover the combined
// minimum payments, or if the debts aren't fully paid off within maxMonths.
function debtPayoffPlan(debts, monthlyBudget, strategy, maxMonths = 1200) {
  const totalMinimums = debts.reduce((sum, d) => sum + d.minimumPayment, 0);
  if (monthlyBudget < totalMinimums) return null;

  const working = debts.map(d => ({ ...d }));
  const payoffOrder = [];
  let months = 0;
  let totalInterest = 0;

  while (working.some(d => d.balance > 1e-8) && months < maxMonths) {
    months++;
    let budgetLeft = monthlyBudget;

    working.forEach(d => {
      if (d.balance <= 1e-8) return;
      const interest = d.balance * (d.aprPercent / 100 / 12);
      d.balance += interest;
      totalInterest += interest;
    });

    working.forEach(d => {
      if (d.balance <= 1e-8) return;
      const pay = Math.min(d.minimumPayment, d.balance);
      d.balance -= pay;
      budgetLeft -= pay;
    });

    const priorityOrder = working
      .filter(d => d.balance > 1e-8)
      .sort((a, b) => (strategy === 'avalanche' ? b.aprPercent - a.aprPercent : a.balance - b.balance));

    for (const d of priorityOrder) {
      if (budgetLeft <= 0) break;
      const pay = Math.min(budgetLeft, d.balance);
      d.balance -= pay;
      budgetLeft -= pay;
    }

    working.forEach(d => {
      if (d.balance <= 1e-8 && !payoffOrder.some(p => p.name === d.name)) {
        payoffOrder.push({ name: d.name, monthPaidOff: months });
      }
    });
  }

  if (months >= maxMonths && working.some(d => d.balance > 1e-8)) return null;

  return { monthsToPayoff: months, totalInterest, payoffOrder };
}

// --- Freelance/hourly rate calculator ---

// requiredHourlyRate = (targetIncome + annualExpenses) / (weeksPerYear * billableHoursPerWeek).
// billableHoursPerWeek is deliberately distinct from total hours worked per
// week, since it should already exclude admin/unbillable time.
function requiredHourlyRate(targetIncome, annualExpenses, weeksPerYear, billableHoursPerWeek) {
  if (!targetIncome || targetIncome <= 0) throw new Error('Target income must be greater than zero.');
  if (annualExpenses < 0) throw new Error('Annual expenses cannot be negative.');
  if (!weeksPerYear || weeksPerYear <= 0) throw new Error('Weeks worked per year must be greater than zero.');
  if (!billableHoursPerWeek || billableHoursPerWeek <= 0) throw new Error('Billable hours per week must be greater than zero.');

  return (targetIncome + annualExpenses) / (weeksPerYear * billableHoursPerWeek);
}

// Required periodic contribution to reach a savings goal by a target date,
// given current savings and an expected periodic return: the compound-interest
// annuity formula (FV = P*(1+i)^n + C*[((1+i)^n-1)/i]) solved for C. Handles
// i = 0 (C = (goal - P) / n) and the case where current savings alone will
// already meet or exceed the goal (required contribution is 0, not negative).
function requiredSavingsContribution(goal, currentSavings, annualRatePercent, periodsPerYear, periods) {
  const i = annualRatePercent / 100 / periodsPerYear;
  const n = periods;
  const growth = i === 0 ? 1 : Math.pow(1 + i, n);
  const futureValueOfCurrent = currentSavings * growth;
  const goalAlreadyMet = futureValueOfCurrent >= goal;

  const rawContribution = i === 0
    ? (goal - currentSavings) / n
    : (goal - futureValueOfCurrent) * i / (growth - 1);

  const requiredContribution = goalAlreadyMet ? 0 : rawContribution;
  const contributionsFutureValue = i === 0 ? requiredContribution * n : requiredContribution * ((growth - 1) / i);
  const finalBalance = futureValueOfCurrent + contributionsFutureValue;
  const totalContributed = currentSavings + requiredContribution * n;
  const totalGrowth = finalBalance - totalContributed;

  const schedule = [];
  let balance = currentSavings;
  for (let period = 1; period <= n; period++) {
    balance = balance * (1 + i) + requiredContribution;
    schedule.push({ period, balance });
  }

  return { requiredContribution, goalAlreadyMet, finalBalance, totalContributed, totalGrowth, schedule };
}

// Recommended emergency fund = essential monthly expenses * months of coverage.
// If currentSavings is given, also reports the shortfall and percent funded
// (capped at 0/100 so an already-fully-funded case doesn't show a negative
// shortfall or over 100%).
function emergencyFundTarget(monthlyExpenses, monthsOfCoverage, currentSavings = 0) {
  const target = monthlyExpenses * monthsOfCoverage;
  const shortfall = Math.max(0, target - currentSavings);
  const percentFunded = target > 0 ? Math.min(100, (currentSavings / target) * 100) : 0;

  return { target, shortfall, percentFunded };
}

// Inflation impact: the future cost of today's amount and the future
// purchasing power (real value) of today's amount are the same compound
// formula in opposite directions, both derived from one shared calculation.
function inflationImpact(amount, inflationRatePercent, years) {
  const i = inflationRatePercent / 100;
  const growth = Math.pow(1 + i, years);
  const futureCost = amount * growth;
  const realValue = amount / growth;
  const percentPurchasingPowerLost = (1 - realValue / amount) * 100;

  return { futureCost, realValue, percentPurchasingPowerLost };
}

// Basic uniform-motion trip time: driving time plus any stop/rest time on top.
function drivingTripTime(distance, averageSpeed, stopMinutes = 0) {
  const drivingHours = distance / averageSpeed;
  const totalHours = drivingHours + stopMinutes / 60;
  return { drivingHours, totalHours };
}

// Converts a decimal number of hours into whole hours + rounded minutes,
// e.g. 5.75 -> { hours: 5, minutes: 45 }.
function hoursToHoursMinutes(hours) {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return minutes === 60 ? { hours: wholeHours + 1, minutes: 0 } : { hours: wholeHours, minutes };
}

// Standard UK Gas Mark <-> °C/°F lookup table. The °F column is the
// conventionally rounded figure used on every UK recipe/appliance, not a raw
// °C->°F conversion (e.g. Gas Mark 4 is listed as 350°F, not the raw 356°F).
const GAS_MARK_TABLE = [
  { mark: 0.25, celsius: 110, fahrenheit: 225 },
  { mark: 0.5, celsius: 120, fahrenheit: 250 },
  { mark: 1, celsius: 140, fahrenheit: 275 },
  { mark: 2, celsius: 150, fahrenheit: 300 },
  { mark: 3, celsius: 165, fahrenheit: 325 },
  { mark: 4, celsius: 180, fahrenheit: 350 },
  { mark: 5, celsius: 190, fahrenheit: 375 },
  { mark: 6, celsius: 200, fahrenheit: 400 },
  { mark: 7, celsius: 220, fahrenheit: 425 },
  { mark: 8, celsius: 230, fahrenheit: 450 },
  { mark: 9, celsius: 240, fahrenheit: 475 },
];

function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

// Exact table lookup for a standard Gas Mark value. Returns null if the mark
// isn't one of the standard table values.
function gasMarkToTemps(mark) {
  const row = GAS_MARK_TABLE.find(r => r.mark === mark);
  return row ? { celsius: row.celsius, fahrenheit: row.fahrenheit } : null;
}

// Snaps a Celsius temperature to its nearest standard Gas Mark. Returns null
// outside the table's 110-240°C range rather than extrapolating.
function celsiusToGasMark(celsius) {
  if (celsius < GAS_MARK_TABLE[0].celsius || celsius > GAS_MARK_TABLE[GAS_MARK_TABLE.length - 1].celsius) {
    return null;
  }

  return GAS_MARK_TABLE.reduce((closest, row) =>
    Math.abs(row.celsius - celsius) < Math.abs(closest.celsius - celsius) ? row : closest
  ).mark;
}

// Standard doneness-to-temperature bands. targetFahrenheit/targetCelsius is
// the top of each band (the serving temperature used for the pull-temp math),
// with rangeLabel kept separately for display since the bands aren't single
// points.
const MEAT_DONENESS_LEVELS = [
  { id: 'rare', label: 'Rare', targetFahrenheit: 125, targetCelsius: 52, rangeLabelF: '125°F', rangeLabelC: '52°C' },
  { id: 'medium-rare', label: 'Medium-rare', targetFahrenheit: 135, targetCelsius: 57, rangeLabelF: '130-135°F', rangeLabelC: '54-57°C' },
  { id: 'medium', label: 'Medium', targetFahrenheit: 145, targetCelsius: 63, rangeLabelF: '140-145°F', rangeLabelC: '60-63°C' },
  { id: 'medium-well', label: 'Medium-well', targetFahrenheit: 155, targetCelsius: 68, rangeLabelF: '150-155°F', rangeLabelC: '65-68°C' },
  { id: 'well-done', label: 'Well-done', targetFahrenheit: 160, targetCelsius: 71, rangeLabelF: '160°F+', rangeLabelC: '71°C+' },
];

// Carryover (resting) temperature rise, which scales with the mass/thickness
// of the cut and length of the rest — a thin steak resting briefly rises much
// less than a large roast resting longer.
const MEAT_CARRYOVER_RISE = {
  steak: { fahrenheit: 5, celsius: 3, restMinutes: '5' },
  roast: { fahrenheit: 12, celsius: 7, restMinutes: '15-20' },
};

// Pull temperature = target serving temperature - expected carryover rise,
// so the cut is removed from heat before it coasts up to the final doneness.
function meatPullTemperature(donenessId, cutSize, unit) {
  const doneness = MEAT_DONENESS_LEVELS.find(d => d.id === donenessId);
  if (!doneness) throw new Error(`Unknown doneness level: ${donenessId}`);

  const carryover = MEAT_CARRYOVER_RISE[cutSize];
  if (!carryover) throw new Error(`Unknown cut size: ${cutSize}`);

  const target = unit === 'f' ? doneness.targetFahrenheit : doneness.targetCelsius;
  const rise = unit === 'f' ? carryover.fahrenheit : carryover.celsius;

  return { target, pullTemperature: target - rise, rise, restMinutes: carryover.restMinutes };
}

// Standard brew ratios (the "N" in 1:N, dose:water/yield by weight) used as
// selectable per-method presets; the ratio itself is always user-overridable.
const COFFEE_BREW_METHODS = [
  { id: 'pourover', label: 'Pour-over / Drip', defaultRatio: 16 },
  { id: 'espresso', label: 'Espresso', defaultRatio: 2 },
  { id: 'coldbrew', label: 'Cold Brew (concentrate)', defaultRatio: 7 },
];

function coffeeWaterForDose(dose, ratio) {
  return dose * ratio;
}

function coffeeDoseForWater(water, ratio) {
  return water / ratio;
}

// Converts a source time to a destination time zone given fixed UTC offsets
// (in hours, supporting fractional offsets like +5.5 or +5.75). Reports how
// many calendar days the destination time falls from the source's day.
function convertTimeZone(sourceHour, sourceMinute, sourceOffsetHours, destOffsetHours) {
  const sourceMinutes = sourceHour * 60 + sourceMinute;
  const totalMinutes = sourceMinutes + (destOffsetHours - sourceOffsetHours) * 60;
  const dayOffset = Math.floor(totalMinutes / 1440);
  const destinationMinutes = ((totalMinutes % 1440) + 1440) % 1440;

  return { destinationMinutes, dayOffset };
}

function minutesToTimeLabel(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = Math.round(minutes % 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

// Dough hydration = water weight as a percentage of flour weight.
function doughHydrationPercent(flourWeight, waterWeight) {
  return (waterWeight / flourWeight) * 100;
}

function doughWaterForHydration(hydrationPercent, flourWeight) {
  return (hydrationPercent / 100) * flourWeight;
}

// Approximate standard water-content fractions for common enriching
// ingredients, used to fold their liquid contribution into a dough's "true
// hydration" alongside plain water. Rough figures — actual water content
// varies by product (e.g. egg size, milk fat %, butter brand).
const ENRICHING_INGREDIENT_WATER_CONTENT = {
  egg: 0.75,
  milk: 0.87,
  butter: 0.17,
};

// True hydration %, folding in the water-equivalent contribution of
// enriching liquids (eggs, milk, butter, etc.) alongside plain water.
// enrichingIngredients is [{ type, weight }], type keying into
// ENRICHING_INGREDIENT_WATER_CONTENT.
function trueDoughHydrationPercent(flourWeight, waterWeight, enrichingIngredients = []) {
  if (!flourWeight || flourWeight <= 0) throw new Error('Flour weight must be greater than zero.');
  if (waterWeight < 0) throw new Error('Water weight cannot be negative.');

  const enrichingWaterWeight = enrichingIngredients.reduce((sum, { type, weight }) => {
    const waterContent = ENRICHING_INGREDIENT_WATER_CONTENT[type];
    if (waterContent === undefined) throw new Error(`Unknown enriching ingredient: ${type}`);
    if (weight < 0) throw new Error('Enriching ingredient weight cannot be negative.');
    return sum + weight * waterContent;
  }, 0);

  const totalWaterEquivalent = waterWeight + enrichingWaterWeight;

  return {
    enrichingWaterWeight,
    totalWaterEquivalent,
    trueHydrationPercent: (totalWaterEquivalent / flourWeight) * 100,
  };
}

// Progressive ("marginal") bracket tax: each bracket's rate applies only to
// the slice of income between its own `from` and the next bracket's `from`
// (or to everything above `from` for the top bracket), not the whole income.
// `brackets` is [{ from, rate }] where rate is a decimal (0.2 for 20%).
// Computes progressive tax along with a per-bracket breakdown of exactly
// which slices of income were taxed at which rate (only brackets actually
// reached by grossIncome are included).
function progressiveTaxBreakdown(grossIncome, brackets) {
  const sorted = [...brackets].sort((a, b) => a.from - b.from);
  const breakdown = [];
  let tax = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { from, rate } = sorted[i];
    if (grossIncome <= from) break;

    const nextFrom = i + 1 < sorted.length ? sorted[i + 1].from : Infinity;
    const sliceTop = Math.min(grossIncome, nextFrom);
    const taxableAmount = sliceTop - from;
    const taxOwed = taxableAmount * rate;
    tax += taxOwed;
    breakdown.push({ from, to: sliceTop, rate, taxableAmount, taxOwed });
  }

  return { tax, breakdown };
}

function calculateProgressiveTax(grossIncome, brackets) {
  return progressiveTaxBreakdown(grossIncome, brackets).tax;
}

// Net take-home pay after progressive income tax and a flat social-security
// style deduction on gross income. Net income is clamped at 0 rather than
// going negative if a misconfigured bracket table over-deducts.
function salaryAfterTax(grossAnnualIncome, brackets, socialSecurityRatePercent) {
  const { tax, breakdown } = progressiveTaxBreakdown(grossAnnualIncome, brackets);
  const socialSecurity = grossAnnualIncome * (socialSecurityRatePercent / 100);
  const netIncome = Math.max(0, grossAnnualIncome - tax - socialSecurity);
  const effectiveRate = grossAnnualIncome > 0 ? ((tax + socialSecurity) / grossAnnualIncome) * 100 : 0;

  return { tax, socialSecurity, netIncome, netMonthly: netIncome / 12, effectiveRate, breakdown };
}

// Converts a pay rate between hourly, monthly, and annual figures, using the
// annual figure as the common base (see the loan/investment calculators for
// the same "derive everything from one shared base" pattern).
function convertSalary(amount, period, hoursPerWeek, weeksPerYear) {
  let annual;
  if (period === 'hourly') annual = amount * hoursPerWeek * weeksPerYear;
  else if (period === 'monthly') annual = amount * 12;
  else annual = amount;

  return {
    annual,
    monthly: annual / 12,
    hourly: annual / (hoursPerWeek * weeksPerYear),
  };
}

// Compares the net cost of buying vs. renting over a horizon: buying's net
// cost is everything spent (down payment, closing costs, mortgage payments,
// ownership costs) minus the equity built up; renting's net cost is total
// rent paid minus the investment growth earned on the down payment the
// renter didn't have to lock up. Reuses the existing amortization schedule
// rather than re-deriving mortgage math.
function rentVsBuyComparison({
  homePrice, downPayment, closingCosts, mortgageRatePercent, mortgageTermYears,
  annualOwnershipCostPercent, appreciationRatePercent, monthlyRent,
  rentGrowthRatePercent, investmentReturnRatePercent, horizonYears,
}) {
  const loanAmount = homePrice - downPayment;
  const termMonths = mortgageTermYears * 12;
  const horizonMonths = horizonYears * 12;

  const amortization = amortizationSchedule(loanAmount, mortgageRatePercent, termMonths, 0);
  const paymentsInHorizon = amortization.schedule.slice(0, horizonMonths);
  const totalMortgagePayments = paymentsInHorizon.reduce((sum, row) => sum + row.payment, 0);
  const remainingLoanBalance = horizonMonths < amortization.schedule.length
    ? amortization.schedule[horizonMonths - 1].balance
    : 0;

  let totalOwnershipCosts = 0;
  let totalRent = 0;
  let rent = monthlyRent;
  const yearly = [];

  for (let year = 1; year <= horizonYears; year++) {
    const monthsSoFar = Math.min(year * 12, amortization.schedule.length);
    const cumulativeMortgagePayments = amortization.schedule
      .slice(0, monthsSoFar)
      .reduce((sum, row) => sum + row.payment, 0);
    const remainingBalanceThatYear = year * 12 < amortization.schedule.length
      ? amortization.schedule[year * 12 - 1].balance
      : 0;

    const homeValueThatYear = homePrice * Math.pow(1 + appreciationRatePercent / 100, year);
    totalOwnershipCosts += (annualOwnershipCostPercent / 100) * homeValueThatYear;
    const equityThatYear = homeValueThatYear - remainingBalanceThatYear;
    const cumulativeNetCostBuy = downPayment + closingCosts + cumulativeMortgagePayments + totalOwnershipCosts - equityThatYear;

    totalRent += rent * 12;
    rent *= 1 + rentGrowthRatePercent / 100;
    const opportunityInvestmentValueThatYear = downPayment * Math.pow(1 + investmentReturnRatePercent / 100, year);
    const cumulativeNetCostRent = totalRent - (opportunityInvestmentValueThatYear - downPayment);

    yearly.push({ year, cumulativeNetCostBuy, cumulativeNetCostRent });
  }

  const homeValueAtHorizon = homePrice * Math.pow(1 + appreciationRatePercent / 100, horizonYears);
  const equity = homeValueAtHorizon - remainingLoanBalance;
  const netCostBuy = downPayment + closingCosts + totalMortgagePayments + totalOwnershipCosts - equity;
  const opportunityInvestmentValue = downPayment * Math.pow(1 + investmentReturnRatePercent / 100, horizonYears);
  const netCostRent = totalRent - (opportunityInvestmentValue - downPayment);

  return {
    netCostBuy,
    netCostRent,
    difference: netCostRent - netCostBuy,
    homeValueAtHorizon,
    equity,
    totalMortgagePayments,
    totalOwnershipCosts,
    totalRent,
    opportunityInvestmentValue,
    remainingLoanBalance,
    yearly,
  };
}

// Metric fuel cost: consumption given as L/100km.
function fuelCostMetric(distanceKm, consumptionLPer100km, pricePerLiter) {
  const fuelUsed = distanceKm * (consumptionLPer100km / 100);
  const totalCost = fuelUsed * pricePerLiter;
  const costPerDistance = (pricePerLiter * consumptionLPer100km) / 100;

  return { fuelUsed, totalCost, costPerDistance };
}

// Imperial fuel cost: consumption given as mpg.
function fuelCostImperial(distanceMiles, mpg, pricePerGallon) {
  const fuelUsed = distanceMiles / mpg;
  const totalCost = fuelUsed * pricePerGallon;
  const costPerDistance = pricePerGallon / mpg;

  return { fuelUsed, totalCost, costPerDistance };
}

// Calendar countdown to retirement, independent of the money projection.
// Takes fromDate explicitly (rather than defaulting to `new Date()`) so this
// stays a pure, deterministically testable function; callers pass the
// current date themselves.
function retirementCountdown(fromDate, yearsRemaining) {
  const retirementDate = new Date(fromDate.getTime());
  retirementDate.setFullYear(retirementDate.getFullYear() + yearsRemaining);

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysRemaining = Math.round((retirementDate - fromDate) / msPerDay);

  return { retirementDate, daysRemaining };
}

// Projected retirement savings, using the same lump-sum-plus-contribution
// compound formula as the Investment/DCA Growth and Net Worth calculators.
function retirementProjection(currentAge, retirementAge, currentSavings, monthlyContribution, annualRatePercent) {
  const yearsRemaining = retirementAge - currentAge;
  const { futureValue, totalContributed, totalGrowth, yearly } = investmentGrowth(
    currentSavings, monthlyContribution, 12, annualRatePercent, yearsRemaining
  );

  return { yearsRemaining, futureValue, totalContributed, totalGrowth, yearly };
}

// Rule-of-thumb jet lag recovery: ~1 day/zone crossed eastward (harder to
// adapt to), ~0.5 days/zone crossed westward (easier), rounded up.
function jetLagRecoveryDays(zonesCrossed, direction) {
  const perZone = direction === 'east' ? 1 : 0.5;
  return Math.ceil(zonesCrossed * perZone);
}

// Derives direction and zones crossed from two UTC offsets by finding the
// shorter angular direction around the 24-hour circle, so e.g. crossing 21
// zones "east" is treated as 3 zones west instead.
function jetLagDirectionFromOffsets(originOffsetHours, destOffsetHours) {
  const diff = destOffsetHours - originOffsetHours;
  const normalized = (((diff + 12) % 24) + 24) % 24 - 12;

  if (normalized === 0) return { direction: 'none', zonesCrossed: 0 };
  return { direction: normalized > 0 ? 'east' : 'west', zonesCrossed: Math.abs(normalized) };
}

// Spreads the total time-zone shift evenly across the recovery days, so a
// traveler gets a concrete daily target rather than just a total duration.
// Returns one entry per day with that day's incremental and cumulative
// shift (in hours, signed: positive = shift bedtime later, i.e. westward;
// negative = shift bedtime earlier, i.e. eastward).
function jetLagDailySchedule(zonesCrossed, direction, recoveryDays) {
  if (!zonesCrossed || zonesCrossed <= 0) throw new Error('Zones crossed must be greater than zero.');
  if (!recoveryDays || recoveryDays <= 0) throw new Error('Recovery days must be greater than zero.');

  const sign = direction === 'east' ? -1 : 1;
  const perDay = (zonesCrossed / recoveryDays) * sign;

  const schedule = [];
  let cumulative = 0;
  for (let day = 1; day <= recoveryDays; day++) {
    cumulative += perDay;
    schedule.push({ day, dailyShiftHours: perDay, cumulativeShiftHours: cumulative });
  }
  return schedule;
}

// Cost to fully charge an EV battery, accounting for charging losses
// (AC/DC conversion, battery heat) via a charging-efficiency factor.
function evFullChargeCost(batteryCapacityKWh, pricePerKWh, chargingEfficiencyPercent) {
  const energyFromWall = batteryCapacityKWh / (chargingEfficiencyPercent / 100);
  return { energyFromWall, cost: energyFromWall * pricePerKWh };
}

// Estimated range on a full charge, from battery capacity and efficiency.
function evRange(batteryCapacityKWh, efficiencyKWhPer100km) {
  return (batteryCapacityKWh * 100) / efficiencyKWhPer100km;
}

// Cost to drive a specific distance (no charging-loss factor, since this is
// energy actually used while driving, not energy drawn from the wall).
function evTripCost(distanceKm, efficiencyKWhPer100km, pricePerKWh) {
  const energyUsed = distanceKm * (efficiencyKWhPer100km / 100);
  return { energyUsed, cost: energyUsed * pricePerKWh };
}

function evCostPer100km(efficiencyKWhPer100km, pricePerKWh) {
  return efficiencyKWhPer100km * pricePerKWh;
}

// Time to charge, in hours, given the energy to draw from the wall and the
// charger's power output.
function evChargingTimeHours(energyFromWallKWh, chargerPowerKW) {
  if (!chargerPowerKW || chargerPowerKW <= 0) throw new Error('Charger power must be greater than zero.');
  return energyFromWallKWh / chargerPowerKW;
}

// FIRE (Financial Independence, Retire Early): the FI target is the "25x
// expenses" rule generalized to any safe withdrawal rate (FI_Target =
// AnnualExpenses / SafeWithdrawalRate, i.e. AnnualExpenses * (1/rate)).
// Years to reach it solves the compound-growth-with-contributions formula
// for time: n = ln((FI_Target*r + AnnualSavings) / (CurrentSavings*r +
// AnnualSavings)) / ln(1+r), handling r = 0 (no compounding, so the years
// scale linearly) and reporting "never" rather than a nonsensical/negative
// figure when annual savings are zero/negative or FI is already reached.
function fireCalculator(annualIncome, annualExpenses, currentSavings, annualReturnPercent, safeWithdrawalRatePercent = 4) {
  const annualSavings = annualIncome - annualExpenses;
  const savingsRatePercent = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;
  const fiTarget = annualExpenses / (safeWithdrawalRatePercent / 100);
  const r = annualReturnPercent / 100;

  if (currentSavings >= fiTarget) {
    return { fiTarget, yearsToFI: 0, annualSavings, savingsRatePercent, alreadyFI: true };
  }

  if (annualSavings <= 0) {
    return { fiTarget, yearsToFI: Infinity, annualSavings, savingsRatePercent, alreadyFI: false };
  }

  const yearsToFI = r === 0
    ? (fiTarget - currentSavings) / annualSavings
    : Math.log((fiTarget * r + annualSavings) / (currentSavings * r + annualSavings)) / Math.log(1 + r);

  return { fiTarget, yearsToFI, annualSavings, savingsRatePercent, alreadyFI: false };
}

// Break-even distance/time for a pricier-upfront diesel vs. a petrol
// equivalent: how far (and, given an annual mileage, how long) you'd need to
// drive before the diesel's lower cost-per-km recoups its price premium.
// If savingsPerKm <= 0 (diesel is no cheaper, or actually more expensive, per
// km), diesel never breaks even — breakEvenDistanceKm/breakEvenYears are left
// null rather than a nonsensical negative/infinite distance. A negative
// pricePremium (diesel actually cheaper upfront) breaks even immediately, so
// breakEvenDistanceKm is clamped to 0 rather than going negative.
function petrolDieselBreakEven(pricePremium, petrolConsumption, petrolPrice, dieselConsumption, dieselPrice, annualMileage = null) {
  const costPerKmPetrol = (petrolConsumption / 100) * petrolPrice;
  const costPerKmDiesel = (dieselConsumption / 100) * dieselPrice;
  const savingsPerKm = costPerKmPetrol - costPerKmDiesel;

  const neverBreaksEven = savingsPerKm <= 0;
  const breakEvenDistanceKm = neverBreaksEven ? null : Math.max(0, pricePremium / savingsPerKm);
  const breakEvenYears = neverBreaksEven || annualMileage === null
    ? null
    : breakEvenDistanceKm / annualMileage;

  return {
    costPerKmPetrol,
    costPerKmDiesel,
    savingsPerKm,
    breakEvenDistanceKm,
    breakEvenYears,
    neverBreaksEven,
  };
}

// Doubling time estimates at a fixed annual rate: the classic Rule of 72
// approximation, its more precise variants (69.3 and 70), and the exact
// logarithmic doubling time for comparison. Assumes ratePercent > 0 (the
// DOM layer validates this before calling in).
function ruleOf72(ratePercent) {
  const r = ratePercent / 100;
  return {
    rule72Years: 72 / ratePercent,
    rule693Years: 69.3 / ratePercent,
    rule70Years: 70 / ratePercent,
    exactYears: Math.log(2) / Math.log(1 + r),
  };
}

// Total cost of ownership comparison between an EV and a petrol car over a
// chosen ownership period: net purchase cost (price minus resale value) plus
// energy/fuel cost plus maintenance, for each vehicle. Assumes the DOM layer
// has already validated inputs (positive prices/consumption/prices, resale
// value not exceeding purchase price, positive years/mileage, non-negative
// maintenance) before calling in.
function evVsPetrolTCO({
  years,
  annualMileageKm,
  evPurchasePrice,
  evResaleValue,
  evEfficiencyKWh100km,
  electricityPricePerKWh,
  evMaintenancePerYear,
  petrolPurchasePrice,
  petrolResaleValue,
  petrolConsumptionL100km,
  petrolPricePerL,
  petrolMaintenancePerYear,
}) {
  const totalDistanceKm = years * annualMileageKm;

  const evNetPurchase = evPurchasePrice - evResaleValue;
  const evEnergyCost = (totalDistanceKm / 100) * evEfficiencyKWh100km * electricityPricePerKWh;
  const evMaintenanceCost = years * evMaintenancePerYear;
  const evTCO = evNetPurchase + evEnergyCost + evMaintenanceCost;

  const petrolNetPurchase = petrolPurchasePrice - petrolResaleValue;
  const petrolFuelCost = (totalDistanceKm / 100) * petrolConsumptionL100km * petrolPricePerL;
  const petrolMaintenanceCost = years * petrolMaintenancePerYear;
  const petrolTCO = petrolNetPurchase + petrolFuelCost + petrolMaintenanceCost;

  const difference = petrolTCO - evTCO;

  const yearly = [];
  for (let year = 1; year <= years; year++) {
    const distanceKm = year * annualMileageKm;
    const evCumulative = evNetPurchase
      + (distanceKm / 100) * evEfficiencyKWh100km * electricityPricePerKWh
      + year * evMaintenancePerYear;
    const petrolCumulative = petrolNetPurchase
      + (distanceKm / 100) * petrolConsumptionL100km * petrolPricePerL
      + year * petrolMaintenancePerYear;
    yearly.push({ year, evCumulative, petrolCumulative });
  }

  return {
    evTCO,
    petrolTCO,
    difference,
    yearly,
    evBreakdown: {
      netPurchase: evNetPurchase,
      energyOrFuel: evEnergyCost,
      maintenance: evMaintenanceCost,
    },
    petrolBreakdown: {
      netPurchase: petrolNetPurchase,
      energyOrFuel: petrolFuelCost,
      maintenance: petrolMaintenanceCost,
    },
    cheaper: difference >= 0 ? 'ev' : 'petrol',
  };
}

// Declining-balance car depreciation: a fixed percentage of the current
// value is lost each year (value_n = price * (1 - rate)^n). Naturally stays
// positive and approaches (but never reaches) zero for any 0 < rate < 1.
function carDepreciationDecliningBalance(purchasePrice, annualRatePercent, years) {
  const rate = annualRatePercent / 100;

  const yearly = [];
  for (let year = 1; year <= years; year++) {
    yearly.push({ year, value: purchasePrice * Math.pow(1 - rate, year) });
  }

  const valueAtYearN = yearly[yearly.length - 1].value;
  const totalDepreciation = purchasePrice - valueAtYearN;
  const totalDepreciationPercent = (totalDepreciation / purchasePrice) * 100;

  return { valueAtYearN, totalDepreciation, totalDepreciationPercent, yearly };
}

// Straight-line car depreciation: a fixed amount is lost each year, derived
// from the gap between purchase price and an expected residual value spread
// evenly over the useful life (value_n = price - annualDepreciation * n).
function carDepreciationStraightLine(purchasePrice, residualValue, usefulLifeYears, years) {
  const annualDepreciation = (purchasePrice - residualValue) / usefulLifeYears;

  const yearly = [];
  for (let year = 1; year <= years; year++) {
    yearly.push({ year, value: purchasePrice - annualDepreciation * year });
  }

  const valueAtYearN = yearly[yearly.length - 1].value;
  const totalDepreciation = purchasePrice - valueAtYearN;
  const totalDepreciationPercent = (totalDepreciation / purchasePrice) * 100;

  return { valueAtYearN, totalDepreciation, totalDepreciationPercent, yearly };
}

// Trip budget: per-day costs (accommodation, food, activities, local
// transport) scale with trip length, while fixed costs (flights, insurance,
// other one-off costs) don't. Total is optionally multiplied by the number
// of travelers (a flat multiplier, per the simplification in issue #44).
function tripBudget({
  days,
  accommodationPerDay,
  foodPerDay,
  activitiesPerDay,
  transportPerDay,
  flights,
  insurance,
  otherFixed = 0,
  travelers = 1,
}) {
  const dailyTotal = accommodationPerDay + foodPerDay + activitiesPerDay + transportPerDay;
  const variableCost = dailyTotal * days;
  const fixedCost = flights + insurance + otherFixed;
  const totalTripCost = (variableCost + fixedCost) * travelers;
  const averageCostPerDay = totalTripCost / days;

  const categories = [
    { label: 'Accommodation', amount: accommodationPerDay * days * travelers },
    { label: 'Food', amount: foodPerDay * days * travelers },
    { label: 'Activities', amount: activitiesPerDay * days * travelers },
    { label: 'Transport', amount: transportPerDay * days * travelers },
    { label: 'Flights', amount: flights * travelers },
    { label: 'Insurance', amount: insurance * travelers },
    { label: 'Other fixed costs', amount: otherFixed * travelers },
  ].map((category) => ({
    ...category,
    percentOfTotal: totalTripCost > 0 ? (category.amount / totalTripCost) * 100 : 0,
  }));

  return { dailyTotal, variableCost, fixedCost, totalTripCost, averageCostPerDay, categories };
}

// Engine power conversion, HP <-> kW, using the standard mechanical-horsepower
// factor (1 HP = 0.745699872 kW).
function hpToKw(hp) {
  return hp * 0.745699872;
}

function kwToHp(kw) {
  return kw / 0.745699872;
}

// Engine torque conversion, Nm <-> lb-ft, using the standard factor
// (1 lb-ft = 1.35581795 Nm).
function nmToLbft(nm) {
  return nm / 1.35581795;
}

function lbftToNm(lbft) {
  return lbft * 1.35581795;
}

// Power (in kW) implied by a torque figure (in Nm) at a given engine speed
// (RPM): Power_kW = Torque_Nm * RPM / 9548.8. To get the paired HP figure,
// convert the result with kwToHp rather than using a separate lb-ft-based
// formula — 9548.8 and 5252 are independently rounded conventional constants,
// so deriving HP straight from lb-ft/5252 drifts slightly from the HP you'd
// get by converting this kW figure, and kW is the more direct derivation.
function powerFromTorqueNmAndRpm(torqueNm, rpm) {
  return (torqueNm * rpm) / 9548.8;
}

// Rough 0-100 km/h (or other target speed) acceleration time estimate using
// the kinetic-energy method: t = (m * v^2) / (2 * P * eta), treating the
// engine as delivering an effective average power (eta, typically 0.35-0.45)
// over the run rather than modeling gearing/traction/torque curve in detail.
// v is converted from km/h to m/s with the exact factor (/3.6), not a
// rounded intermediate. Assumes the DOM layer has already validated that
// mass, power, efficiency, and target speed are all positive.
function accelerationTimeEstimate(massKg, powerWatts, efficiency = 0.40, targetSpeedKmh = 100) {
  const targetSpeedMs = targetSpeedKmh / 3.6;
  const timeSeconds = (massKg * targetSpeedMs ** 2) / (2 * powerWatts * efficiency);
  return { timeSeconds, targetSpeedKmh };
}

// Gear ratio / RPM <-> speed conversion. wheel_rpm = engine_rpm / (gear_ratio
// * final_drive_ratio); speed_kmh = wheel_rpm * tyre_circumference_m * 60 / 1000.
// Tyre circumference derived from a direct mm diameter input (circumference =
// pi * diameter_m).
function tyreCircumferenceFromDiameterMm(tyreDiameterMm) {
  return Math.PI * (tyreDiameterMm / 1000);
}

function speedFromRpm(engineRpm, gearRatio, finalDriveRatio, tyreDiameterMm) {
  const circumferenceM = tyreCircumferenceFromDiameterMm(tyreDiameterMm);
  const wheelRpm = engineRpm / (gearRatio * finalDriveRatio);
  const speedKmh = (wheelRpm * circumferenceM * 60) / 1000;
  return { wheelRpm, speedKmh };
}

// Inverse of speedFromRpm: given a target speed, find the wheel RPM and the
// engine RPM (in the given gear) needed to produce it.
function rpmFromSpeed(speedKmh, gearRatio, finalDriveRatio, tyreDiameterMm) {
  const circumferenceM = tyreCircumferenceFromDiameterMm(tyreDiameterMm);
  const wheelRpm = (speedKmh * 1000) / (circumferenceM * 60);
  const engineRpm = wheelRpm * gearRatio * finalDriveRatio;
  return { wheelRpm, engineRpm };
}

// Tyre size decoding: WIDTH/ASPECTRRIM (e.g. 225/45R17). Sidewall height is
// the aspect ratio applied to the width; overall diameter adds two sidewalls
// (top and bottom) to the rim diameter (converted from inches to mm).
function tyreDiameterMm(widthMm, aspectRatioPercent, rimDiameterIn) {
  const sidewallHeightMm = widthMm * (aspectRatioPercent / 100);
  return rimDiameterIn * 25.4 + 2 * sidewallHeightMm;
}

function tyreCircumferenceMm(diameterMm) {
  return Math.PI * diameterMm;
}

// Compares an original and a new tyre's overall diameter: how much the
// diameter changed (as a percentage), and, if a displayed speedometer
// reading is given, what the actual speed is (speedometers are calibrated
// to the original tyre's diameter, so a larger new tyre travels further per
// wheel revolution than the speedometer assumes).
function tyreSizeComparison(originalDiameterMm, newDiameterMm, displayedSpeed = null) {
  const diameterChangePercent = ((newDiameterMm - originalDiameterMm) / originalDiameterMm) * 100;
  const actualSpeed = displayedSpeed === null || displayedSpeed === undefined
    ? null
    : displayedSpeed * (newDiameterMm / originalDiameterMm);
  return { diameterChangePercent, actualSpeed };
}

// Converts an amount from a source currency to a target currency using a
// manually-entered exchange rate, where exchangeRate means "1 unit of
// source currency = exchangeRate units of target currency".
function convertCurrency(amount, exchangeRate) {
  return amount * exchangeRate;
}

// Estimates how a wheel width/offset (ET) change shifts fitment: half of the
// width change pushes the wheel outward (toward the fender) while the other
// half pulls it back in, and a change in offset shifts the whole wheel
// outward (lower ET) or inward (higher ET) by that same amount. This is an
// approximation only — it doesn't account for suspension travel, steering
// lock, or fender rolling.
function wheelOffsetShift(oldWidthIn, oldET, newWidthIn, newET) {
  const oldWidthMm = oldWidthIn * 25.4;
  const newWidthMm = newWidthIn * 25.4;
  const widthDeltaMm = newWidthMm - oldWidthMm;
  const etDeltaMm = newET - oldET;
  const outwardShiftMm = widthDeltaMm / 2 - etDeltaMm;
  const inwardShiftMm = widthDeltaMm / 2 + etDeltaMm;
  return { outwardShiftMm, inwardShiftMm };
}

// Compares a computed shift against measured available clearance on that
// side. A shift that's zero or negative moves away from that boundary, so
// there's nothing to check. "Tight" flags a thin (<3mm) margin as a
// rough DIY-measurement tolerance, not a fitment guarantee.
function wheelClearanceFit(shiftMm, availableClearanceMm) {
  if (!availableClearanceMm || availableClearanceMm <= 0) {
    throw new Error('Available clearance must be greater than zero.');
  }

  if (shiftMm <= 0) {
    return { applicable: false, marginMm: null, verdict: 'not applicable' };
  }

  const marginMm = availableClearanceMm - shiftMm;
  const verdict = marginMm < 0 ? 'no fit' : marginMm < 3 ? 'tight fit' : 'fits';
  return { applicable: true, marginMm, verdict };
}

// Inverts an exchange rate, e.g. for a "swap direction" toggle that converts
// target currency back into source currency using the same quoted rate.
function inverseExchangeRate(exchangeRate) {
  return 1 / exchangeRate;
}

// Extra fuel/cost from fitting a roof box, given a user-entered consumption
// penalty percentage: the penalty scales the base L/100km consumption up,
// and that extra consumption (not the full new consumption) is what's
// multiplied out over the trip distance to get the extra fuel and cost.
function roofBoxFuelPenalty(baseConsumption, penaltyPercent, distanceKm, fuelPricePerL) {
  const extraConsumption = baseConsumption * (penaltyPercent / 100);
  const newConsumption = baseConsumption * (1 + penaltyPercent / 100);
  const extraFuel = (distanceKm / 100) * extraConsumption;
  const extraCost = extraFuel * fuelPricePerL;

  return { newConsumption, extraConsumption, extraFuel, extraCost };
}

// --- IPv4 <-> IPv6 converter ---

// Parses a dotted-quad IPv4 string into 4 octets (0-255). Rejects anything
// that isn't exactly 4 decimal segments, leading-zero segments (ambiguous
// with octal in some parsers), or a segment outside 0-255.
function parseIpv4Octets(str) {
  const trimmed = (str || '').trim();
  const segments = trimmed.split('.');

  if (segments.length !== 4) {
    throw new Error(`Invalid IPv4 address: "${str}" must have exactly 4 dot-separated segments.`);
  }

  return segments.map(segment => {
    if (!/^\d{1,3}$/.test(segment) || (segment.length > 1 && segment[0] === '0')) {
      throw new Error(`Invalid IPv4 address: "${str}" contains an invalid segment "${segment}".`);
    }

    const value = parseInt(segment, 10);
    if (value < 0 || value > 255) {
      throw new Error(`Invalid IPv4 address: "${str}" contains an out-of-range segment "${segment}" (must be 0-255).`);
    }

    return value;
  });
}

function ipv4OctetsToHexGroups([a, b, c, d]) {
  const high = ((a << 8) | b).toString(16).padStart(4, '0');
  const low = ((c << 8) | d).toString(16).padStart(4, '0');
  return { high, low };
}

// Builds both the mixed-notation and pure-hex-notation IPv4-mapped IPv6
// address (RFC 4291 §2.5.5.2) for a given IPv4 string.
function ipv4ToIpv6Mapped(ipv4String) {
  const octets = parseIpv4Octets(ipv4String);
  const { high, low } = ipv4OctetsToHexGroups(octets);

  return {
    mixed: `::ffff:${octets.join('.')}`,
    hex: `::ffff:${high}:${low}`,
  };
}

// Builds the deprecated IPv4-compatible IPv6 address (RFC 4291 §2.5.5.1)
// for a given IPv4 string - same idea, without the ffff group.
function ipv4ToIpv6Compatible(ipv4String) {
  const octets = parseIpv4Octets(ipv4String);
  return `::${octets.join('.')}`;
}

// Recognizes only the specific IPv4-mapped/compatible IPv6 forms this tool
// cares about - not a general-purpose IPv6 parser. Accepted forms (all
// case-insensitive):
//   ::ffff:a.b.c.d        (mapped, mixed notation)
//   ::ffff:XXXX:YYYY      (mapped, pure hex notation)
//   ::a.b.c.d             (deprecated compatible, mixed notation)
// Anything else is rejected as "not a recognized" form.
function ipv6ToIpv4(ipv6String) {
  const trimmed = (ipv6String || '').trim().toLowerCase();

  const mappedMixed = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(trimmed);
  if (mappedMixed) {
    const octets = parseIpv4Octets(mappedMixed[1]);
    return { ipv4: octets.join('.'), deprecated: false };
  }

  const mappedHex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(trimmed);
  if (mappedHex) {
    const high = parseInt(mappedHex[1], 16);
    const low = parseInt(mappedHex[2], 16);
    if (high > 0xffff || low > 0xffff) {
      throw new Error(`Invalid IPv6 address: "${ipv6String}" contains a hex group out of range.`);
    }

    const octets = [(high >> 8) & 0xff, high & 0xff, (low >> 8) & 0xff, low & 0xff];
    return { ipv4: octets.join('.'), deprecated: false };
  }

  const compatibleMixed = /^::(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/.exec(trimmed);
  if (compatibleMixed) {
    const octets = parseIpv4Octets(compatibleMixed[1]);
    return { ipv4: octets.join('.'), deprecated: true };
  }

  throw new Error(`"${ipv6String}" is not a recognized IPv4-mapped/compatible IPv6 form (expected ::ffff:a.b.c.d, ::ffff:XXXX:YYYY, or the deprecated ::a.b.c.d).`);
}

// --- Percentage calculator ---
function percentOf(percent, base) {
  return (percent / 100) * base;
}

function whatPercentOf(part, whole) {
  // Assumes caller has already validated whole !== 0.
  return (part / whole) * 100;
}

function percentageChange(oldValue, newValue) {
  // Assumes caller has already validated oldValue !== 0.
  return ((newValue - oldValue) / oldValue) * 100;
}

// Reverse percentage: given a final value and the signed percent change that
// produced it (positive for an increase, negative for a decrease), solves
// back for the original value. Original = finalValue / (1 + percentChange/100).
// Assumes caller has already validated percentChange !== -100 (a -100% change
// means the original value was reduced to 0, which can't be divided back out).
function originalValueFromPercentChange(finalValue, percentChange) {
  return finalValue / (1 + percentChange / 100);
}

// --- Tip calculator / bill splitter ---

function tipCalculation(bill, tipPercent, numPeople) {
  if (!bill || bill <= 0) throw new Error('Bill amount must be greater than zero.');
  if (tipPercent < 0) throw new Error('Tip percentage cannot be negative.');
  if (!numPeople || numPeople < 1) throw new Error('Number of people must be at least 1.');

  const tipAmount = bill * (tipPercent / 100);
  const total = bill + tipAmount;
  const perPerson = total / numPeople;

  return { tipAmount, total, perPerson };
}

// --- Sales tax / VAT calculator ---

function salesTaxForward(preTaxPrice, taxRatePercent) {
  if (!preTaxPrice || preTaxPrice <= 0) throw new Error('Pre-tax price must be greater than zero.');
  if (taxRatePercent < 0) throw new Error('Tax rate cannot be negative.');

  const taxAmount = preTaxPrice * (taxRatePercent / 100);
  return { taxAmount, total: preTaxPrice + taxAmount };
}

// Divides the tax back out of a tax-inclusive price, rather than naively
// multiplying the inclusive price by the tax rate.
function salesTaxFromInclusive(totalPrice, taxRatePercent) {
  if (!totalPrice || totalPrice <= 0) throw new Error('Total price must be greater than zero.');
  if (taxRatePercent < 0) throw new Error('Tax rate cannot be negative.');

  const preTaxPrice = totalPrice / (1 + taxRatePercent / 100);
  return { preTaxPrice, taxAmount: totalPrice - preTaxPrice };
}

// --- Fraction calculator ---

// Euclidean algorithm. Works with any sign/order of inputs and treats
// gcd(0, n) as n (rather than 0), matching the mathematical convention used
// to simplify a fraction whose numerator is 0.
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Reduces a fraction to lowest terms and normalizes sign so the denominator
// is always positive (any negative sign moves onto the numerator).
function simplifyFraction(numerator, denominator) {
  if (denominator < 0) {
    numerator = -numerator;
    denominator = -denominator;
  }

  const divisor = gcd(numerator, denominator);
  return { numerator: numerator / divisor, denominator: denominator / divisor };
}

// Arithmetic on two fractions a/b and c/d. Assumes the DOM layer has already
// validated that b and d are non-zero, and (for 'divide') that c is
// non-zero, since dividing by fraction c/d requires c !== 0.
// wholePart/remainderNumerator support a mixed-number display: for 3/2 that's
// { wholePart: 1, remainderNumerator: 1 } (1 + 1/2), for a proper fraction
// like 1/4 it's { wholePart: 0, remainderNumerator: 1 }, and for a whole
// result like 2/1 it's { wholePart: 2, remainderNumerator: 0 }.
function fractionArithmetic(a, b, c, d, operation) {
  let numerator;
  let denominator;

  switch (operation) {
    case 'add':
      numerator = a * d + c * b;
      denominator = b * d;
      break;
    case 'subtract':
      numerator = a * d - c * b;
      denominator = b * d;
      break;
    case 'multiply':
      numerator = a * c;
      denominator = b * d;
      break;
    case 'divide':
      numerator = a * d;
      denominator = b * c;
      break;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const simplified = simplifyFraction(numerator, denominator);
  const decimal = simplified.numerator / simplified.denominator;
  const wholePart = Math.trunc(simplified.numerator / simplified.denominator);
  const remainderNumerator = Math.abs(simplified.numerator) % simplified.denominator;

  return {
    numerator: simplified.numerator,
    denominator: simplified.denominator,
    decimal,
    wholePart,
    remainderNumerator,
  };
}

// --- Luggage Weight Checker ---

// Sums packed item weights and compares the total against an airline's
// stated weight allowance. difference > 0 means over the allowance (by that
// amount); difference <= 0 means within the allowance (exactly at the
// allowance counts as within, not over), with remainingOrOverage always the
// non-negative magnitude of the gap either way, for direct display.
function luggageWeightCheck(allowance, itemWeights) {
  const totalWeight = itemWeights.reduce((sum, weight) => sum + weight, 0);
  const difference = totalWeight - allowance;
  const isOverAllowance = difference > 0;

  return {
    totalWeight,
    allowance,
    difference,
    isOverAllowance,
    remainingOrOverage: Math.abs(difference),
  };
}

// --- Ratio & Proportion calculator ---

// Reduces a ratio a:b to lowest terms using gcd. Assumes the DOM layer has
// already validated that a and b aren't both zero (a:b is undefined in that
// case). gcd(0, n) = n means a 0:n ratio simplifies to 0:1, which falls out
// naturally without special-casing.
function simplifyRatio(a, b) {
  const divisor = gcd(a, b);
  return { a: a / divisor, b: b / divisor };
}

// Solves a proportion a:b = c:d for whichever single value is unknown, via
// cross-multiplication (a*d = b*c). `values` holds the three known numbers
// keyed by 'a'|'b'|'c'|'d' (the unknown key's own entry is ignored).
// `unknownKey` selects which one to solve for. Assumes the DOM layer has
// already validated that the divisor in the resulting formula isn't zero.
function solveProportion(values, unknownKey) {
  const { a, b, c, d } = values;
  switch (unknownKey) {
    case 'a':
      return (b * c) / d;
    case 'b':
      return (a * d) / c;
    case 'c':
      return (a * d) / b;
    case 'd':
      return (b * c) / a;
    default:
      throw new Error(`Unknown key: ${unknownKey}`);
  }
}

// --- Average / Weighted Average calculator ---

// Simple arithmetic mean of a list of numbers. Assumes the DOM layer has
// already validated that values is non-empty.
function simpleAverage(values) {
  const sum = values.reduce((total, v) => total + v, 0);
  return sum / values.length;
}

// Weighted average = (Σ value*weight) / (Σ weight), given two parallel
// arrays. Assumes the DOM layer has already validated that values and
// weights are the same non-zero length, weights are non-negative, and the
// weights sum to something other than zero.
function weightedAverage(values, weights) {
  const weightedSum = values.reduce((total, v, i) => total + v * weights[i], 0);
  const totalWeight = weights.reduce((total, w) => total + w, 0);
  return weightedSum / totalWeight;
}

// Descriptive stats (mean, median, min, max, range) for a list of numbers.
// Assumes the DOM layer has already validated that values is non-empty.
function descriptiveStats(values) {
  if (values.length === 0) {
    throw new Error('descriptiveStats requires at least one value.');
  }

  const mean = simpleAverage(values);

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  return { mean, median, min, max, range };
}

// --- GPA calculator ---

// Standard US 4.0-scale letter grade to grade-points mapping.
const LETTER_GRADE_POINTS = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

// GPA = (Σ gradePoints*creditHours) / (Σ creditHours), given a list of
// {gradePoints, creditHours} courses. Assumes the DOM layer has already
// validated that courses is non-empty and every creditHours is positive.
function gpaFromCourses(courses) {
  const totalCredits = courses.reduce((sum, c) => sum + c.creditHours, 0);
  const totalPoints = courses.reduce((sum, c) => sum + c.gradePoints * c.creditHours, 0);
  return totalPoints / totalCredits;
}

// --- Age calculator ---

// Number of days in `month` (0-indexed) of `year`, via UTC calendar
// arithmetic (day 0 of the following month is the last day of this one).
function daysInUtcMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

// Calendar-aware age breakdown between two UTC-midnight-normalized Date
// objects. Takes both dates explicitly (rather than defaulting asOfDate to
// `new Date()` internally) so this stays a pure, deterministically testable
// function, the same pattern as retirementCountdown; callers pass today's
// date themselves. Throws if asOfDate is before birthDate.
function ageBreakdown(birthDate, asOfDate) {
  if (asOfDate < birthDate) {
    throw new Error('The as-of date must be on or after the birth date.');
  }

  let years = asOfDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = asOfDate.getUTCMonth() - birthDate.getUTCMonth();
  let days = asOfDate.getUTCDate() - birthDate.getUTCDate();

  if (days < 0) {
    months -= 1;
    let prevMonth = asOfDate.getUTCMonth() - 1;
    let prevMonthYear = asOfDate.getUTCFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      prevMonthYear -= 1;
    }
    days += daysInUtcMonth(prevMonthYear, prevMonth);
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.floor((asOfDate - birthDate) / msPerDay);
  const totalWeeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  return { years, months, days, totalDays, totalWeeks, remainderDays };
}

// Finds the next occurrence of birthDate's month/day on or after
// asOfDate (both UTC-midnight-normalized), rolling to next year if this
// year's birthday has already passed. A Feb 29 birthday falls back to
// Feb 28 in a non-leap target year. Returns the next birthday date, the
// whole number of days until it, and the age turned that day (0 when
// asOfDate is itself the birthday, consistent with ageBreakdown treating
// the exact birthday as the year the new age is reached).
function nextBirthdayCountdown(birthDate, asOfDate) {
  const birthMonth = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();

  const birthdayInYear = (year) => {
    const day = Math.min(birthDay, daysInUtcMonth(year, birthMonth));
    return new Date(Date.UTC(year, birthMonth, day));
  };

  let targetYear = asOfDate.getUTCFullYear();
  let nextBirthdayDate = birthdayInYear(targetYear);
  if (nextBirthdayDate < asOfDate) {
    targetYear += 1;
    nextBirthdayDate = birthdayInYear(targetYear);
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntil = Math.round((nextBirthdayDate - asOfDate) / msPerDay);
  const turningAge = targetYear - birthDate.getUTCFullYear();

  return { nextBirthdayDate, daysUntil, turningAge };
}

// --- Sunrise/Sunset & Daylight calculator ---

// Day-of-year (1-365/366) for a calendar date, via UTC date math so it's
// unaffected by local time zone / DST of the machine running it.
function dayOfYear(year, month, day) {
  return Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000) + 1;
}

// Approximate sunrise/sunset using the standard closed-form solar-position
// approximation (the method behind NOAA's solar calculator / the "sunrise
// equation"), simplified to use solar noon (hour = 12) rather than the
// current time of day. Returns one of three shapes: { polarDay: true },
// { polarNight: true }, or { sunriseMinutesUTC, sunsetMinutesUTC,
// daylightMinutes } (all in minutes from UTC midnight) for a normal day.
function sunriseSunset(dayOfYearValue, latDeg, lonDeg, utcOffsetHours) {
  const gamma = (2 * Math.PI / 365) * (dayOfYearValue - 1);

  const eqtime = 229.18 * (
    0.000075
    + 0.001868 * Math.cos(gamma)
    - 0.032077 * Math.sin(gamma)
    - 0.014615 * Math.cos(2 * gamma)
    - 0.040849 * Math.sin(2 * gamma)
  );

  const decl = 0.006918
    - 0.399912 * Math.cos(gamma)
    + 0.070257 * Math.sin(gamma)
    - 0.006758 * Math.cos(2 * gamma)
    + 0.000907 * Math.sin(2 * gamma)
    - 0.002697 * Math.cos(3 * gamma)
    + 0.00148 * Math.sin(3 * gamma);

  const lat = latDeg * Math.PI / 180;
  const cosHA = Math.cos(90.833 * Math.PI / 180) / (Math.cos(lat) * Math.cos(decl)) - Math.tan(lat) * Math.tan(decl);

  if (cosHA < -1) return { polarDay: true };
  if (cosHA > 1) return { polarNight: true };

  const ha = Math.acos(cosHA);
  const haDeg = ha * 180 / Math.PI;

  const solarNoonUTCmin = 720 - 4 * lonDeg - eqtime;
  const sunriseMinutesUTC = solarNoonUTCmin - 4 * haDeg;
  const sunsetMinutesUTC = solarNoonUTCmin + 4 * haDeg;
  const daylightMinutes = sunsetMinutesUTC - sunriseMinutesUTC;

  return { sunriseMinutesUTC, sunsetMinutesUTC, daylightMinutes };
}

// Converts UTC minutes-from-midnight (which may be negative or beyond 1440
// once a UTC offset is applied) into a local "HH:MM" clock time, wrapping
// around the 24-hour day as needed.
function formatMinutesAsLocalTime(utcMinutes, utcOffsetHours) {
  const localMinutes = ((utcMinutes + utcOffsetHours * 60) % 1440 + 1440) % 1440;
  return minutesToTimeLabel(localMinutes);
}

// Formats a duration given in minutes as "Hh Mm", e.g. 971 -> "16h 11m".
function formatDurationHM(minutes) {
  const totalMinutes = Math.round(minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

// --- Warm-up set calculator ---

// Standard percentage-based ramping scheme (popularized by powerlifting/
// strength coaching, e.g. Jim Wendler's 5/3/1) leading up to a working weight.
const WARMUP_SCHEME = [
  { percent: 40, reps: 5 },
  { percent: 50, reps: 5 },
  { percent: 60, reps: 3 },
  { percent: 70, reps: 3 },
  { percent: 80, reps: 2 },
  { percent: 90, reps: 1 },
];

// Builds a warm-up progression up to targetWeight, rounding each set to the
// nearest loading increment (e.g. 2.5 kg / 5 lb), floored at the empty bar
// weight and capped at the target weight itself (guards rounding the 90%
// set up past 100%). Ends with the working set at 100% / targetWeight.
function warmupSets(targetWeight, barWeight = 0, roundingIncrement = 0) {
  if (!targetWeight || targetWeight <= 0) {
    throw new Error('Target weight must be greater than zero.');
  }

  const sets = WARMUP_SCHEME.map(({ percent, reps }) => {
    const rawWeight = targetWeight * (percent / 100);
    let weight = roundingIncrement ? roundToIncrement(rawWeight, roundingIncrement) : rawWeight;
    weight = Math.max(weight, barWeight);
    weight = Math.min(weight, targetWeight);
    return { percent, reps, weight, warmup: true };
  });

  sets.push({ percent: 100, reps: null, weight: targetWeight, warmup: false });
  return sets;
}

// --- Date Difference / Countdown calculator ---

// Order-independent difference between two UTC-midnight dates: total days,
// total weeks (+ remainder), and a calendar-aware years/months/days
// breakdown (reusing ageBreakdown's borrowing math on the earlier/later
// pair). `reversed` is true when dateA is chronologically after dateB, so
// callers can label the result correctly regardless of input order.
function dateDifference(dateA, dateB) {
  const reversed = dateA.getTime() > dateB.getTime();
  const earlier = reversed ? dateB : dateA;
  const later = reversed ? dateA : dateB;
  const breakdown = ageBreakdown(earlier, later);
  return { ...breakdown, reversed };
}

// --- DOTS score calculator ---

// Coefficients for the DOTS formula (Tim Henriques; IPF-adopted 2020),
// bodyweight (BW) in kg: coefficient = 500 / (A*BW^4 + B*BW^3 + C*BW^2 + D*BW + E).
const DOTS_COEFFICIENTS = {
  male: { a: -0.0000010930, b: 0.0007391293, c: -0.1918759221, d: 24.0900756, e: -307.75076 },
  female: { a: -0.0000010706, b: 0.0005158568, c: -0.1126655495, d: 13.6175032, e: -57.96288 },
};

// The women's coefficients are only validated up to 150 kg bodyweight; the
// official method clamps heavier bodyweights to 150 kg for the calculation.
const DOTS_FEMALE_BW_CAP = 150;

function dotsCoefficient(bodyweightKg, sex) {
  const coeffs = DOTS_COEFFICIENTS[sex];
  if (!coeffs) throw new Error('Sex must be "male" or "female".');

  const bw = sex === 'female' ? Math.min(bodyweightKg, DOTS_FEMALE_BW_CAP) : bodyweightKg;
  const { a, b, c, d, e } = coeffs;
  const denom = a * bw ** 4 + b * bw ** 3 + c * bw ** 2 + d * bw + e;
  return 500 / denom;
}

function dotsScore(bodyweightKg, totalKg, sex) {
  return dotsCoefficient(bodyweightKg, sex) * totalKg;
}

// --- Date Plus/Minus Days calculator ---

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Adds (or, with a negative value, subtracts) a whole number of days to a
// UTC-midnight date. Uses the UTC date-setter so month/year rollovers (and
// leap years) are handled by the Date object itself rather than manual
// month-length tables.
function addDaysToDate(startDate, numberOfDays) {
  const result = new Date(startDate.getTime());
  result.setUTCDate(result.getUTCDate() + numberOfDays);
  return result;
}

function weekdayName(date) {
  return WEEKDAY_NAMES[date.getUTCDay()];
}

// --- Country voltage and plug type checker ---

// Static reference dataset (mains voltage, frequency, and IEC plug type
// letters A-N) for a selection of countries, compiled from standard
// reference sources (e.g. IEC World Plugs). Not a live lookup. Where a
// country genuinely uses more than one voltage/plug combination, one
// representative value is used.
const COUNTRY_ELECTRICITY_DATA = {
  'United States': { voltage: 120, frequency: 60, plugTypes: ['A', 'B'] },
  'Canada': { voltage: 120, frequency: 60, plugTypes: ['A', 'B'] },
  'Mexico': { voltage: 127, frequency: 60, plugTypes: ['A', 'B'] },
  'Brazil': { voltage: 127, frequency: 60, plugTypes: ['C', 'N'] },
  'Colombia': { voltage: 110, frequency: 60, plugTypes: ['A', 'B'] },
  'Peru': { voltage: 220, frequency: 60, plugTypes: ['A', 'C'] },
  'Argentina': { voltage: 220, frequency: 50, plugTypes: ['C', 'I'] },
  'Chile': { voltage: 220, frequency: 50, plugTypes: ['C', 'L'] },
  'United Kingdom': { voltage: 230, frequency: 50, plugTypes: ['G'] },
  'Ireland': { voltage: 230, frequency: 50, plugTypes: ['G'] },
  'France': { voltage: 230, frequency: 50, plugTypes: ['C', 'E'] },
  'Germany': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Spain': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Italy': { voltage: 230, frequency: 50, plugTypes: ['C', 'F', 'L'] },
  'Netherlands': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Belgium': { voltage: 230, frequency: 50, plugTypes: ['C', 'E'] },
  'Switzerland': { voltage: 230, frequency: 50, plugTypes: ['C', 'J'] },
  'Austria': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Portugal': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Greece': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Poland': { voltage: 230, frequency: 50, plugTypes: ['C', 'E'] },
  'Sweden': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Norway': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Denmark': { voltage: 230, frequency: 50, plugTypes: ['C', 'K'] },
  'Finland': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Russia': { voltage: 220, frequency: 50, plugTypes: ['C', 'F'] },
  'Turkey': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'China': { voltage: 220, frequency: 50, plugTypes: ['A', 'C', 'I'] },
  'Japan': { voltage: 100, frequency: 50, plugTypes: ['A', 'B'] },
  'South Korea': { voltage: 220, frequency: 60, plugTypes: ['C', 'F'] },
  'India': { voltage: 230, frequency: 50, plugTypes: ['C', 'D', 'M'] },
  'Australia': { voltage: 230, frequency: 50, plugTypes: ['I'] },
  'New Zealand': { voltage: 230, frequency: 50, plugTypes: ['I'] },
  'South Africa': { voltage: 230, frequency: 50, plugTypes: ['C', 'D', 'M', 'N'] },
  'Egypt': { voltage: 220, frequency: 50, plugTypes: ['C', 'F'] },
  'Nigeria': { voltage: 230, frequency: 50, plugTypes: ['D', 'G'] },
  'Kenya': { voltage: 240, frequency: 50, plugTypes: ['G'] },
  'United Arab Emirates': { voltage: 230, frequency: 50, plugTypes: ['G'] },
  'Saudi Arabia': { voltage: 230, frequency: 60, plugTypes: ['A', 'G'] },
  'Israel': { voltage: 230, frequency: 50, plugTypes: ['C', 'H'] },
  'Thailand': { voltage: 230, frequency: 50, plugTypes: ['A', 'C'] },
  'Vietnam': { voltage: 220, frequency: 50, plugTypes: ['A', 'C'] },
  'Singapore': { voltage: 230, frequency: 50, plugTypes: ['G'] },
  'Malaysia': { voltage: 230, frequency: 50, plugTypes: ['G'] },
  'Indonesia': { voltage: 230, frequency: 50, plugTypes: ['C', 'F'] },
  'Philippines': { voltage: 220, frequency: 60, plugTypes: ['A', 'B', 'C'] },
};

// Default voltage-compatibility tolerance: destination voltage within 10% of
// home voltage is treated as safe for a non-dual-voltage device.
const VOLTAGE_TOLERANCE_FRACTION = 0.10;

// Looks up the home/destination country records and returns a plug-shape and
// voltage comparison plus one of four recommendations: 'none', 'adapter',
// 'converter', or 'both'. Returns { error } instead if either country isn't
// in the dataset. `dualVoltageDevice` (device rated ~100-240V) skips the
// voltage check entirely, since only plug shape matters in that case.
function checkPlugAdapterNeeds(homeCountryName, destinationCountryName, dualVoltageDevice, dataset = COUNTRY_ELECTRICITY_DATA) {
  const home = dataset[homeCountryName];
  const destination = dataset[destinationCountryName];

  if (!home || !destination) {
    return { error: 'Data not available for this country.' };
  }

  const plugMatch = home.plugTypes.some(type => destination.plugTypes.includes(type));
  const voltageCompatible = !!dualVoltageDevice
    || Math.abs(home.voltage - destination.voltage) <= home.voltage * VOLTAGE_TOLERANCE_FRACTION;

  let recommendation;
  if (plugMatch && voltageCompatible) recommendation = 'none';
  else if (!plugMatch && voltageCompatible) recommendation = 'adapter';
  else if (plugMatch && !voltageCompatible) recommendation = 'converter';
  else recommendation = 'both';

  return { home, destination, plugMatch, voltageCompatible, recommendation };
}

// --- Working Days calculator ---

// Counts business days (Mon-Fri) between two UTC-midnight dates, inclusive
// of both endpoints, optionally excluding a list of holiday dates (compared
// by exact UTC-midnight timestamp, so callers must normalize holiday inputs
// the same way). Order-independent: `reversed` reports whether startDate was
// chronologically after endDate, but the day count itself is unaffected.
function workingDaysBetween(startDate, endDate, holidayDates = []) {
  const reversed = startDate.getTime() > endDate.getTime();
  const earlier = reversed ? endDate : startDate;
  const later = reversed ? startDate : endDate;
  const holidaySet = new Set(holidayDates.map(d => d.getTime()));

  let workingDays = 0;
  let weekendDays = 0;
  let holidayWeekdays = 0;
  let totalDays = 0;

  const current = new Date(earlier.getTime());
  while (current.getTime() <= later.getTime()) {
    totalDays++;
    const dayOfWeek = current.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendDays++;
    } else if (holidaySet.has(current.getTime())) {
      holidayWeekdays++;
    } else {
      workingDays++;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return { workingDays, totalDays, weekendDays, holidayWeekdays, reversed };
}

// Steps forward (positive numberOfDays) or backward (negative) one calendar
// day at a time from a UTC-midnight startDate, skipping weekends and any
// date in holidayDates, until numberOfDays business days have been counted.
// Mirrors workingDaysBetween's boundary handling: startDate itself is never
// adjusted, just walked from, so numberOfDays = 0 returns startDate
// unchanged even if it falls on a weekend or holiday.
function addWorkingDays(startDate, numberOfDays, holidayDates = []) {
  const holidaySet = new Set(holidayDates.map(d => d.getTime()));
  const direction = numberOfDays < 0 ? -1 : 1;
  const stepsNeeded = Math.abs(numberOfDays);

  const current = new Date(startDate.getTime());
  let counted = 0;
  while (counted < stepsNeeded) {
    current.setUTCDate(current.getUTCDate() + direction);
    const dayOfWeek = current.getUTCDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (!isWeekend && !holidaySet.has(current.getTime())) {
      counted++;
    }
  }

  return { resultDate: current, weekdayName: weekdayName(current) };
}

// --- Time Duration calculator ---

// Converts an H:M:S triple to total seconds. Hours must be non-negative;
// minutes and seconds must each be in [0, 60). Throws on any violation.
function timeToSeconds(hours, minutes, seconds) {
  if (!Number.isFinite(hours) || hours < 0) throw new Error('Hours must be a non-negative number.');
  if (!Number.isFinite(minutes) || minutes < 0 || minutes >= 60) throw new Error('Minutes must be between 0 and 59.');
  if (!Number.isFinite(seconds) || seconds < 0 || seconds >= 60) throw new Error('Seconds must be between 0 and 59.');
  return hours * 3600 + minutes * 60 + seconds;
}

// Converts total seconds back to an { hours, minutes, seconds } breakdown
// (hours uncapped, since a duration can exceed 24 hours).
function secondsToHMS(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

// Converts total seconds to decimal hours, rounded to 2 decimal places
// (e.g. for payroll use: 29700 seconds -> 8.25). Works for negative
// durations too, rounding towards the nearer hundredth.
function secondsToDecimalHours(totalSeconds) {
  return Math.round((totalSeconds / 3600) * 100) / 100;
}

// Adds or subtracts two durations (in seconds). Throws if a subtraction
// would produce a negative duration, since durations can't be negative.
function addSubtractDurations(secondsA, secondsB, operation) {
  const result = operation === 'subtract' ? secondsA - secondsB : secondsA + secondsB;
  if (result < 0) throw new Error('Subtracting a larger duration from a smaller one is invalid.');
  return result;
}

// Elapsed duration (in seconds) between two times of day (each in seconds
// since midnight). Wraps past midnight when endSeconds < startSeconds (an
// overnight shift), so the result is always in [0, 86400).
function timeOfDayDuration(startSeconds, endSeconds) {
  let diff = endSeconds - startSeconds;
  if (diff < 0) diff += 86400;
  return diff;
}

// --- IPF GL (Goodlift) Points calculator ---

// Coefficients for the IPF GL formula ("GL Coefficients 2020"), bodyweight
// (BW) in kg: coefficient = 100 / (A - B * e^(-C * BW)).
const GL_COEFFICIENTS = {
  male: {
    raw: { a: 1199.72839, b: 1025.18162, c: 0.00921 },
    equipped: { a: 1236.25115, b: 1449.21864, c: 0.01644 },
  },
  female: {
    raw: { a: 610.32796, b: 1045.59282, c: 0.03048 },
    equipped: { a: 758.63878, b: 949.31382, c: 0.02435 },
  },
};

function glCoefficient(bodyweightKg, sex, equipment) {
  const bySex = GL_COEFFICIENTS[sex];
  const coeffs = bySex && bySex[equipment];
  if (!coeffs) throw new Error('Sex must be "male" or "female" and equipment must be "raw" or "equipped".');

  const { a, b, c } = coeffs;
  return 100 / (a - b * Math.exp(-c * bodyweightKg));
}

function glPoints(bodyweightKg, totalKg, sex, equipment) {
  return glCoefficient(bodyweightKg, sex, equipment) * totalKg;
}

// --- Unit Converter calculator ---

// Every non-temperature category converts through a fixed base unit via a
// simple multiply/divide-by-factor; temperature is affine and handled
// separately below.
const UNIT_CONVERSION_CATEGORIES = {
  length: { // base: meters
    mm: 0.001, cm: 0.01, m: 1, km: 1000,
    in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344,
  },
  area: { // base: square meters
    mm2: 0.000001, cm2: 0.0001, m2: 1, hectare: 10000, km2: 1000000,
    in2: 0.00064516, ft2: 0.09290304, yd2: 0.83612736, acre: 4046.8564224, mi2: 2589988.110336,
  },
  volume: { // base: liters
    mL: 0.001, L: 1, m3: 1000,
    usGal: 3.785411784, usQt: 0.946352946, usFlOz: 0.0295735295625, impGal: 4.54609, usCup: 0.2365882365,
  },
  mass: { // base: grams
    mg: 0.001, g: 1, kg: 1000, tonne: 1000000,
    oz: 28.349523125, lb: 453.59237, stone: 6350.29318, usTon: 907184.74,
  },
  speed: { // base: meters per second
    mps: 1, kmh: 0.277777778, mph: 0.44704, knot: 0.514444444, fps: 0.3048,
  },
};

function convertLinearUnit(category, value, fromUnit, toUnit) {
  const table = UNIT_CONVERSION_CATEGORIES[category];
  if (!table) throw new Error(`Unknown category: ${category}`);

  const fromFactor = table[fromUnit];
  const toFactor = table[toUnit];
  if (fromFactor === undefined || toFactor === undefined) {
    throw new Error(`Unknown unit for category ${category}.`);
  }

  return (value * fromFactor) / toFactor;
}

// Temperature is affine (not a simple multiply-through-base-unit), so it
// converts via Celsius as the intermediate step.
function convertTemperature(value, fromUnit, toUnit) {
  let celsius;
  if (fromUnit === 'C') celsius = value;
  else if (fromUnit === 'F') celsius = (value - 32) * 5 / 9;
  else if (fromUnit === 'K') celsius = value - 273.15;
  else throw new Error(`Unknown temperature unit: ${fromUnit}`);

  if (toUnit === 'C') return celsius;
  if (toUnit === 'F') return celsius * 9 / 5 + 32;
  if (toUnit === 'K') return celsius + 273.15;
  throw new Error(`Unknown temperature unit: ${toUnit}`);
}

function convertUnit(category, value, fromUnit, toUnit) {
  if (category === 'temperature') return convertTemperature(value, fromUnit, toUnit);
  return convertLinearUnit(category, value, fromUnit, toUnit);
}

// Converts a value from fromUnit into every unit of the given category,
// reusing convertLinearUnit/convertTemperature for each pair rather than
// reimplementing the conversion math. Temperature isn't listed in
// UNIT_CONVERSION_CATEGORIES (it's affine, not a factor table), so its unit
// set is hardcoded here to match convertTemperature.
function convertToAllUnits(category, value, fromUnit) {
  if (category === 'temperature') {
    return ['C', 'F', 'K'].map(unit => ({ unit, value: convertTemperature(value, fromUnit, unit) }));
  }

  const table = UNIT_CONVERSION_CATEGORIES[category];
  if (!table) throw new Error(`Unknown category: ${category}`);

  return Object.keys(table).map(unit => ({ unit, value: convertLinearUnit(category, value, fromUnit, unit) }));
}

// --- Fuel economy converter ---

const MILES_PER_KM = 1 / 1.609344;
const LITERS_PER_US_GALLON = 3.785411784;
const LITERS_PER_UK_GALLON = 4.54609;

// L/100km is a reciprocal (km-per-liter-based) unit, so it can't be handled
// by the simple multiply-by-factor table UNIT_CONVERSION_CATEGORIES uses for
// linear units — everything here routes through a common km-per-liter base.
function convertFuelEconomy(value, fromUnit) {
  if (!value || value <= 0) throw new Error('Value must be greater than zero.');

  let kmPerLiter;
  if (fromUnit === 'mpgUS') kmPerLiter = (value / MILES_PER_KM) / LITERS_PER_US_GALLON;
  else if (fromUnit === 'mpgUK') kmPerLiter = (value / MILES_PER_KM) / LITERS_PER_UK_GALLON;
  else if (fromUnit === 'l100km') kmPerLiter = 100 / value;
  else if (fromUnit === 'kmL') kmPerLiter = value;
  else throw new Error('Unknown fuel economy unit.');

  return {
    mpgUS: kmPerLiter * LITERS_PER_US_GALLON * MILES_PER_KM,
    mpgUK: kmPerLiter * LITERS_PER_UK_GALLON * MILES_PER_KM,
    l100km: 100 / kmPerLiter,
    kmL: kmPerLiter,
  };
}

// --- FFMI (Fat-Free Mass Index) calculator ---

// Computes fat-free mass, raw FFMI, and height-normalized FFMI (scaled to an
// equivalent 1.8 m height, correcting for FFMI's natural bias toward taller
// people showing a lower raw score for the same muscularity).
function ffmi(weightKg, heightM, bodyFatPercent) {
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (!heightM || heightM <= 0) throw new Error('Height must be greater than zero.');
  if (bodyFatPercent < 0 || bodyFatPercent > 70) throw new Error('Body fat percentage must be between 0 and 70.');

  const fatFreeMass = weightKg * (1 - bodyFatPercent / 100);
  const rawFFMI = fatFreeMass / heightM ** 2;
  const normalizedFFMI = rawFFMI + 6.1 * (1.8 - heightM);

  return { fatFreeMass, rawFFMI, normalizedFFMI };
}

// Common qualitative reference ranges for (normalized) FFMI, as typically
// cited in fitness/bodybuilding contexts for men; the ~25 "natural limit" is
// the Kouri et al. (1995) figure often referenced for drug-free lifters.
function ffmiCategory(normalizedFFMI) {
  if (normalizedFFMI < 18) return 'Below average';
  if (normalizedFFMI < 20) return 'Average';
  if (normalizedFFMI < 22) return 'Above average';
  if (normalizedFFMI < 23) return 'Excellent';
  if (normalizedFFMI < 26) return 'Superior (approaching the commonly cited natural limit)';
  return 'Exceeds the commonly cited natural limit';
}

// --- BMI (Body Mass Index) calculator ---

function bmiValue(weightKg, heightM) {
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (!heightM || heightM <= 0) throw new Error('Height must be greater than zero.');

  return weightKg / heightM ** 2;
}

// Standard WHO adult BMI classification bands.
function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

// --- Lean Body Mass calculator ---

function leanBodyMassFromBodyFat(weightKg, bodyFatPercent) {
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (bodyFatPercent < 0 || bodyFatPercent > 70) throw new Error('Body fat percentage must be between 0 and 70.');

  return weightKg * (1 - bodyFatPercent / 100);
}

// Boer (1984) formula: estimates lean body mass from height/weight/sex alone,
// with no body-fat measurement needed.
function leanBodyMassBoer(weightKg, heightCm, sex) {
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (!heightCm || heightCm <= 0) throw new Error('Height must be greater than zero.');

  let lbm;
  if (sex === 'male') lbm = 0.407 * weightKg + 0.267 * heightCm - 19.2;
  else if (sex === 'female') lbm = 0.252 * weightKg + 0.473 * heightCm - 48.3;
  else throw new Error('Sex must be "male" or "female".');

  if (lbm < 0) {
    throw new Error('This height/weight combination falls outside the Boer formula\'s validated range (produces a negative result).');
  }

  return lbm;
}

// --- Body-fat percentage estimator (US Navy method) ---

// US Navy method (Hodgdon & Beckett, 1984). All measurements in inches;
// callers must convert cm inputs to inches before calling. `hipIn` is
// required for women and ignored for men.
function navyBodyFatPercent(sex, heightIn, neckIn, waistIn, hipIn) {
  if (!heightIn || heightIn <= 0) throw new Error('Height must be greater than zero.');
  if (!neckIn || neckIn <= 0) throw new Error('Neck measurement must be greater than zero.');
  if (!waistIn || waistIn <= 0) throw new Error('Waist measurement must be greater than zero.');

  if (sex === 'male') {
    const diff = waistIn - neckIn;
    if (diff <= 0) throw new Error('Waist measurement must be greater than neck measurement.');
    return 86.010 * Math.log10(diff) - 70.041 * Math.log10(heightIn) + 36.76;
  }

  if (sex === 'female') {
    if (!hipIn || hipIn <= 0) throw new Error('Hip measurement is required for women.');
    const diff = waistIn + hipIn - neckIn;
    if (diff <= 0) throw new Error('Waist plus hip must be greater than neck.');
    return 163.205 * Math.log10(diff) - 97.684 * Math.log10(heightIn) - 78.387;
  }

  throw new Error('Sex must be "male" or "female".');
}

// Standard sex-specific body-fat percentage bands (ACE classification).
const BODY_FAT_CATEGORIES = {
  male: [
    { max: 5, label: 'Essential fat' },
    { max: 13, label: 'Athletes' },
    { max: 17, label: 'Fitness' },
    { max: 24, label: 'Acceptable' },
  ],
  female: [
    { max: 13, label: 'Essential fat' },
    { max: 20, label: 'Athletes' },
    { max: 24, label: 'Fitness' },
    { max: 31, label: 'Acceptable' },
  ],
};

function bodyFatCategory(sex, bodyFatPercent) {
  const bands = BODY_FAT_CATEGORIES[sex];
  if (!bands) throw new Error('Sex must be "male" or "female".');
  if (bodyFatPercent < 0) throw new Error('Body fat percentage cannot be negative.');

  const band = bands.find(b => bodyFatPercent <= b.max);
  return band ? band.label : 'Obese';
}

// --- TDEE (Total Daily Energy Expenditure) calculator ---

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

// Mifflin-St Jeor equation: widely regarded as the most accurate BMR formula
// for the general adult population.
function bmrMifflinStJeor(weightKg, heightCm, age, sex) {
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (!heightCm || heightCm <= 0) throw new Error('Height must be greater than zero.');
  if (!age || age <= 0) throw new Error('Age must be greater than zero.');

  if (sex === 'male') return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  if (sex === 'female') return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  throw new Error('Sex must be "male" or "female".');
}

function tdeeFromBmr(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  if (!multiplier) throw new Error('Select a valid activity level.');
  return bmr * multiplier;
}

// --- Macro calculator ---

// Atwater general energy-density factors (kcal per gram).
const MACRO_KCAL_PER_GRAM = { protein: 4, carb: 4, fat: 9 };

// Converts a daily calorie target and a protein/carb/fat percentage split
// (which must sum to ~100%) into gram targets for each macronutrient.
function macroGrams(totalKcal, proteinPct, carbPct, fatPct) {
  if (!totalKcal || totalKcal <= 0) throw new Error('Calorie target must be greater than zero.');

  [proteinPct, carbPct, fatPct].forEach(pct => {
    if (pct < 0 || pct > 100) throw new Error('Each macro percentage must be between 0 and 100.');
  });

  const sum = proteinPct + carbPct + fatPct;
  if (Math.abs(sum - 100) > 0.5) {
    throw new Error(`Macro percentages must sum to 100% (currently ${sum}%).`);
  }

  return {
    proteinG: (totalKcal * (proteinPct / 100)) / MACRO_KCAL_PER_GRAM.protein,
    carbG: (totalKcal * (carbPct / 100)) / MACRO_KCAL_PER_GRAM.carb,
    fatG: (totalKcal * (fatPct / 100)) / MACRO_KCAL_PER_GRAM.fat,
  };
}

// --- Weight-loss timeline calculator ---

// Standard energy-balance approximations: 1 kg of body fat ~= 7700 kcal,
// 1 lb of body fat ~= 3500 kcal.
const KCAL_PER_KG_FAT = 7700;
const KCAL_PER_LB_FAT = 3500;

function weightLossTimeline(currentWeight, goalWeight, dailyDeficit, unit = 'kg') {
  if (!currentWeight || currentWeight <= 0) throw new Error('Current weight must be greater than zero.');
  if (!goalWeight || goalWeight <= 0) throw new Error('Goal weight must be greater than zero.');
  if (!dailyDeficit || dailyDeficit <= 0) throw new Error('Daily calorie deficit must be greater than zero.');
  if (goalWeight >= currentWeight) {
    throw new Error('Goal weight must be less than current weight (this calculator is for weight loss, not gain).');
  }

  const weightToLose = currentWeight - goalWeight;
  const kcalPerUnit = unit === 'lb' ? KCAL_PER_LB_FAT : KCAL_PER_KG_FAT;
  const totalDeficitNeeded = weightToLose * kcalPerUnit;
  const daysNeeded = totalDeficitNeeded / dailyDeficit;
  const weeksNeeded = daysNeeded / 7;

  return { weightToLose, totalDeficitNeeded, daysNeeded, weeksNeeded };
}

// --- Bulking calorie calculator ---

// Evidence-informed "lean bulk" surplus guidance (~10-20% above TDEE) sized
// to favor muscle growth while limiting excess fat gain.
const BULK_PACE_SURPLUS = { lean: 0.10, moderate: 0.15, aggressive: 0.20 };

function bulkCalories(tdee, surplusFraction) {
  if (!tdee || tdee <= 0) throw new Error('TDEE must be greater than zero.');
  if (surplusFraction < 0 || surplusFraction > 0.5) {
    throw new Error('Surplus must be between 0% and 50%.');
  }
  return tdee * (1 + surplusFraction);
}

// --- Running pace calculator ---

// Given any two of distance (km), total time (seconds), and pace (seconds
// per km), computes the third via the simple rate/time/distance relationship.
function paceFromDistanceTime(distanceKm, timeSeconds) {
  if (!distanceKm || distanceKm <= 0) throw new Error('Distance must be greater than zero.');
  if (!timeSeconds || timeSeconds <= 0) throw new Error('Time must be greater than zero.');
  return timeSeconds / distanceKm;
}

function timeFromDistancePace(distanceKm, paceSecPerKm) {
  if (!distanceKm || distanceKm <= 0) throw new Error('Distance must be greater than zero.');
  if (!paceSecPerKm || paceSecPerKm <= 0) throw new Error('Pace must be greater than zero.');
  return distanceKm * paceSecPerKm;
}

function distanceFromTimePace(timeSeconds, paceSecPerKm) {
  if (!timeSeconds || timeSeconds <= 0) throw new Error('Time must be greater than zero.');
  if (!paceSecPerKm || paceSecPerKm <= 0) throw new Error('Pace must be greater than zero.');
  return timeSeconds / paceSecPerKm;
}

const KM_PER_MILE = 1.609344;

// Converts a pace expressed in seconds-per-unit between km and mi (pace is
// time per unit distance, so it scales the opposite way from a plain
// distance conversion: seconds-per-mile = seconds-per-km * km-per-mile).
function convertPacePerUnit(paceSeconds, fromUnit, toUnit) {
  if (fromUnit !== 'km' && fromUnit !== 'mi') throw new Error('Unit must be "km" or "mi".');
  if (toUnit !== 'km' && toUnit !== 'mi') throw new Error('Unit must be "km" or "mi".');
  if (fromUnit === toUnit) return paceSeconds;
  return fromUnit === 'km' ? paceSeconds * KM_PER_MILE : paceSeconds / KM_PER_MILE;
}

// --- Paint calculator ---

// Paintable area after door/window deductions, total area across all coats,
// and the resulting paint volume needed at a given coverage rate (e.g.
// m² per liter).
function paintNeeded(wallArea, doorCount, doorArea, windowCount, windowArea, coats, coverageRate) {
  if (!wallArea || wallArea <= 0) throw new Error('Wall area must be greater than zero.');
  if (!coats || coats <= 0) throw new Error('Number of coats must be greater than zero.');
  if (!coverageRate || coverageRate <= 0) throw new Error('Coverage rate must be greater than zero.');

  const deduction = (doorCount || 0) * (doorArea || 0) + (windowCount || 0) * (windowArea || 0);
  const paintableArea = wallArea - deduction;
  if (paintableArea <= 0) {
    throw new Error('Door and window deductions leave no paintable area; check your measurements.');
  }

  const totalAreaToPaint = paintableArea * coats;
  const volumeNeeded = totalAreaToPaint / coverageRate;

  return { paintableArea, totalAreaToPaint, volumeNeeded };
}

// Rounds a needed paint volume up to a whole number of same-size cans.
function roundUpToCans(volumeNeeded, canSize) {
  if (!canSize || canSize <= 0) throw new Error('Can size must be greater than zero.');
  const cansNeeded = Math.ceil(volumeNeeded / canSize);
  return { cansNeeded, totalVolume: cansNeeded * canSize };
}

// --- Wallpaper calculator ---

// perimeter/wallHeight/rollWidth/rollLength/patternRepeat all in meters;
// wastePercent as a whole number (e.g. 10 for 10%). patternRepeat of 0 means
// plain paper (no pattern matching / drop rounding).
function wallpaperRollsNeeded(perimeter, wallHeight, rollWidth, rollLength, patternRepeat, wastePercent) {
  if (!perimeter || perimeter <= 0) throw new Error('Wall perimeter must be greater than zero.');
  if (!wallHeight || wallHeight <= 0) throw new Error('Wall height must be greater than zero.');
  if (!rollWidth || rollWidth <= 0) throw new Error('Roll width must be greater than zero.');
  if (!rollLength || rollLength <= 0) throw new Error('Roll length must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');

  const repeat = patternRepeat || 0;
  if (repeat > rollLength) throw new Error('Pattern repeat cannot exceed the roll length.');

  const numberOfStrips = Math.ceil(perimeter / rollWidth);
  const effectiveDrop = repeat > 0 ? Math.ceil(wallHeight / repeat) * repeat : wallHeight;

  const stripsPerRoll = Math.floor(rollLength / effectiveDrop);
  if (stripsPerRoll < 1) {
    throw new Error('Wall height (after pattern-repeat rounding) exceeds the roll length; no strips fit per roll.');
  }

  const rollsNeeded = Math.ceil(numberOfStrips / stripsPerRoll);
  const rollsWithWaste = Math.ceil(rollsNeeded * (1 + wastePercent / 100));

  return { numberOfStrips, effectiveDrop, stripsPerRoll, rollsNeeded, rollsWithWaste };
}

// --- Flooring calculator ---

function flooringNeeded(area, wastePercent, areaPerBox) {
  if (!area || area <= 0) throw new Error('Room area must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');
  if (!areaPerBox || areaPerBox <= 0) throw new Error('Coverage area per box must be greater than zero.');

  const areaWithWaste = area * (1 + wastePercent / 100);
  const boxesNeeded = Math.ceil(areaWithWaste / areaPerBox);
  const totalPurchasedArea = boxesNeeded * areaPerBox;

  return { areaWithWaste, boxesNeeded, totalPurchasedArea };
}

// --- Race time predictor calculator ---

// Riegel formula (Peter Riegel, 1977/1981): predicts finish time at a target
// distance from a known time at a different distance. `exponent` defaults to
// 1.06, the commonly cited value (sometimes tuned 1.05-1.15 per runner).
function riegelPredictedTime(knownTimeSeconds, knownDistanceKm, targetDistanceKm, exponent = 1.06) {
  if (!knownTimeSeconds || knownTimeSeconds <= 0) throw new Error('Known time must be greater than zero.');
  if (!knownDistanceKm || knownDistanceKm <= 0) throw new Error('Known distance must be greater than zero.');
  if (!targetDistanceKm || targetDistanceKm <= 0) throw new Error('Target distance must be greater than zero.');

  return knownTimeSeconds * Math.pow(targetDistanceKm / knownDistanceKm, exponent);
}

// --- Tile calculator ---

// tileWidth/tileLength/groutWidth in meters; area in square meters;
// wastePercent as a whole number (e.g. 10 for 10%).
function tilesNeeded(area, tileWidth, tileLength, groutWidth, wastePercent) {
  if (!area || area <= 0) throw new Error('Area to cover must be greater than zero.');
  if (!tileWidth || tileWidth <= 0) throw new Error('Tile width must be greater than zero.');
  if (!tileLength || tileLength <= 0) throw new Error('Tile length must be greater than zero.');
  if (groutWidth < 0) throw new Error('Grout line width cannot be negative.');
  if (groutWidth >= tileWidth || groutWidth >= tileLength) {
    throw new Error('Grout line width cannot exceed the tile\'s own dimensions.');
  }
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');

  const effectiveArea = (tileWidth + groutWidth) * (tileLength + groutWidth);
  const tilesForArea = area / effectiveArea;
  const tilesNeededCount = Math.ceil(tilesForArea * (1 + wastePercent / 100));

  return { effectiveArea, tilesForArea, tilesNeededCount };
}

// Approximate density of mixed tile grout (varies by type — sanded vs
// unsanded, powder vs pre-mixed — so this is a rough typical figure, not a
// precise claim for any specific product).
const GROUT_DENSITY_KG_PER_LITER = 1.6;

// Estimated grout volume/weight for a tiled area, using the standard
// estimation formula: volume = area × groutWidth × groutDepth ×
// (1/tileWidth + 1/tileLength). All lengths are in meters (and area in m²),
// matching tilesNeeded()'s convention — the DOM layer converts from mm.
// groutDepth is typically the tile thickness.
function groutVolumeNeeded(area, tileWidth, tileLength, groutWidth, groutDepth) {
  if (!area || area <= 0) throw new Error('Area to cover must be greater than zero.');
  if (!tileWidth || tileWidth <= 0) throw new Error('Tile width must be greater than zero.');
  if (!tileLength || tileLength <= 0) throw new Error('Tile length must be greater than zero.');
  if (!groutWidth || groutWidth <= 0) throw new Error('Grout line width must be greater than zero.');
  if (!groutDepth || groutDepth <= 0) throw new Error('Grout depth must be greater than zero.');

  const volumeM3 = area * groutWidth * groutDepth * (1 / tileWidth + 1 / tileLength);
  const volumeLiters = volumeM3 * 1000;
  const weightKg = volumeLiters * GROUT_DENSITY_KG_PER_LITER;

  return { volumeLiters, weightKg };
}

// --- Concrete calculator ---

// All dimensions in meters, volume in cubic meters.
function rectangularConcreteVolume(length, width, thickness) {
  if (!length || length <= 0) throw new Error('Length must be greater than zero.');
  if (!width || width <= 0) throw new Error('Width must be greater than zero.');
  if (!thickness || thickness <= 0) throw new Error('Thickness must be greater than zero.');
  return length * width * thickness;
}

function cylindricalConcreteVolume(diameter, height) {
  if (!diameter || diameter <= 0) throw new Error('Diameter must be greater than zero.');
  if (!height || height <= 0) throw new Error('Height must be greater than zero.');
  return Math.PI * (diameter / 2) ** 2 * height;
}

// volume/yieldPerBag in cubic meters; wastePercent as a whole number.
function concreteBagsNeeded(volume, wastePercent, yieldPerBag) {
  if (!volume || volume <= 0) throw new Error('Volume must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');
  if (!yieldPerBag || yieldPerBag <= 0) throw new Error('Yield per bag must be greater than zero.');

  const volumeWithWaste = volume * (1 + wastePercent / 100);
  const bagsNeeded = Math.ceil(volumeWithWaste / yieldPerBag);

  return { volumeWithWaste, bagsNeeded };
}

// Compares the cost of buying bagged concrete vs. ordering ready-mix
// delivery for the same volumeWithWaste (m³), given a price per bag and a
// price per m³ of ready-mix plus an optional flat delivery fee.
function concreteCostComparison(bagsNeeded, pricePerBag, volumeWithWaste, pricePerReadyMixM3, deliveryFee = 0) {
  if (!pricePerBag || pricePerBag <= 0) throw new Error('Price per bag must be greater than zero.');
  if (!pricePerReadyMixM3 || pricePerReadyMixM3 <= 0) throw new Error('Ready-mix price must be greater than zero.');
  if (deliveryFee < 0) throw new Error('Delivery fee cannot be negative.');

  const bagCost = bagsNeeded * pricePerBag;
  const readyMixCost = volumeWithWaste * pricePerReadyMixM3 + deliveryFee;
  const cheaperOption = bagCost < readyMixCost ? 'bags' : readyMixCost < bagCost ? 'ready-mix' : 'tie';

  return { bagCost, readyMixCost, cheaperOption };
}

// --- Heart-rate training zone calculator (Karvonen method) ---

const HEART_RATE_ZONES = [
  { zone: 1, label: 'Very light (Recovery)', lower: 0.50, upper: 0.60 },
  { zone: 2, label: 'Light (Fat burning / base endurance)', lower: 0.60, upper: 0.70 },
  { zone: 3, label: 'Moderate (Aerobic)', lower: 0.70, upper: 0.80 },
  { zone: 4, label: 'Hard (Threshold)', lower: 0.80, upper: 0.90 },
  { zone: 5, label: 'Maximum (VO2max / anaerobic)', lower: 0.90, upper: 1.00 },
];

// Karvonen method: uses Heart Rate Reserve (HRR = MaxHR - RestingHR) rather
// than a plain percentage of MaxHR, so zones account for individual fitness
// via resting heart rate. `maxHrOverride` lets a measured MaxHR replace the
// age-based `220 - age` estimate.
function karvonenZones(age, restingHr, maxHrOverride) {
  if (!age || age <= 0) throw new Error('Age must be greater than zero.');
  if (!restingHr || restingHr <= 0) throw new Error('Resting heart rate must be greater than zero.');

  const maxHr = maxHrOverride || (220 - age);
  if (restingHr >= maxHr) {
    throw new Error('Resting heart rate must be less than max heart rate.');
  }

  const hrr = maxHr - restingHr;
  const zones = HEART_RATE_ZONES.map(z => ({
    zone: z.zone,
    label: z.label,
    lowerBpm: restingHr + hrr * z.lower,
    upperBpm: restingHr + hrr * z.upper,
  }));

  return { maxHr, hrr, zones };
}

// --- Sleep cycle calculator ---

const SLEEP_CYCLE_MINUTES = 90;

// Candidate bedtimes for a target wake-up time, one per full sleep-cycle
// count (3-6 cycles = 4.5-9h sleep), each wrapped to a valid minutes-since-
// midnight clock time (a bedtime the night before wraps around 0).
function bedtimesForWakeTime(wakeMinutes, fallAsleepMinutes = 14) {
  if (wakeMinutes < 0 || wakeMinutes >= 1440) throw new Error('Enter a valid wake-up time.');
  if (fallAsleepMinutes < 0 || fallAsleepMinutes > 120) {
    throw new Error('Minutes to fall asleep must be between 0 and 120.');
  }

  return [3, 4, 5, 6].map(cycles => {
    const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
    const bedtimeMinutes = ((wakeMinutes - sleepMinutes - fallAsleepMinutes) % 1440 + 1440) % 1440;
    return { cycles, sleepMinutes, bedtimeMinutes };
  });
}

// Candidate wake-up times for a given bedtime, one per full sleep-cycle
// count (4-6 cycles = 6-9h sleep, the range generally recommended for adults).
function wakeTimesForBedtime(bedtimeMinutes, fallAsleepMinutes = 14) {
  if (bedtimeMinutes < 0 || bedtimeMinutes >= 1440) throw new Error('Enter a valid bedtime.');
  if (fallAsleepMinutes < 0 || fallAsleepMinutes > 120) {
    throw new Error('Minutes to fall asleep must be between 0 and 120.');
  }

  return [4, 5, 6].map(cycles => {
    const sleepMinutes = cycles * SLEEP_CYCLE_MINUTES;
    const wakeMinutes = (bedtimeMinutes + fallAsleepMinutes + sleepMinutes) % 1440;
    return { cycles, sleepMinutes, wakeMinutes };
  });
}

// --- VO2max estimator (Cooper 12-minute run test) ---

// Cooper (1968) linear regression against lab-measured VO2max; distance in
// meters covered during a 12-minute run.
function cooperVO2max(distanceMeters) {
  if (!distanceMeters || distanceMeters <= 0) throw new Error('Distance must be greater than zero.');
  if (distanceMeters <= 504.9) {
    throw new Error('Distance must be greater than about 505m; shorter distances produce a non-physiological negative VO2max under this formula.');
  }
  return (distanceMeters - 504.9) / 44.73;
}

// Approximate age/sex-banded VO2max normative ranges (mL/kg/min), in the
// spirit of the widely-cited Cooper Institute fitness-category tables.
// Ages are clamped to the covered 20-69 range, so under-20/over-69 users
// get the nearest band as a rough approximation rather than an error.
const VO2MAX_NORMS = {
  male: [
    { maxAge: 29, poor: 33, fair: 37, good: 42, excellent: 46 },
    { maxAge: 39, poor: 31.5, fair: 35.5, good: 41, excellent: 45 },
    { maxAge: 49, poor: 30.2, fair: 33.6, good: 39, excellent: 43.8 },
    { maxAge: 59, poor: 26.1, fair: 31, good: 35.8, excellent: 41 },
    { maxAge: 69, poor: 20.5, fair: 26.1, good: 32.3, excellent: 36.5 },
  ],
  female: [
    { maxAge: 29, poor: 28, fair: 31.5, good: 35.7, excellent: 40.1 },
    { maxAge: 39, poor: 27, fair: 30.7, good: 34.6, excellent: 38.6 },
    { maxAge: 49, poor: 24.5, fair: 29, good: 32.9, excellent: 36.9 },
    { maxAge: 59, poor: 21, fair: 24.5, good: 29, excellent: 32.9 },
    { maxAge: 69, poor: 18, fair: 21, good: 24.5, excellent: 30.3 },
  ],
};

function vo2maxCategory(vo2max, age, sex) {
  const bands = VO2MAX_NORMS[sex];
  if (!bands) throw new Error('Sex must be "male" or "female" to classify against normative bands.');
  if (!age || age <= 0) throw new Error('Age must be greater than zero.');

  const clampedAge = Math.min(Math.max(age, 20), 69);
  const band = bands.find((b) => clampedAge <= b.maxAge);

  if (vo2max < band.poor) return 'Poor';
  if (vo2max < band.fair) return 'Fair';
  if (vo2max < band.good) return 'Good';
  if (vo2max < band.excellent) return 'Excellent';
  return 'Superior';
}

// --- Daily water intake calculator ---

const WATER_ML_PER_KG = 35;
const WATER_ACTIVITY_BONUS_ML = { sedentary: 0, moderate: 350, high: 700 };
const WATER_CLIMATE_BONUS_ML = { temperate: 0, hot: 350 };

function dailyWaterIntake(weightKg, activityLevel = 'sedentary', climate = 'temperate') {
  if (!weightKg || weightKg < 20 || weightKg > 300) {
    throw new Error('Weight must be within a plausible human range (20-300 kg).');
  }

  const activityBonus = WATER_ACTIVITY_BONUS_ML[activityLevel];
  if (activityBonus === undefined) throw new Error('Select a valid activity level.');

  const climateBonus = WATER_CLIMATE_BONUS_ML[climate];
  if (climateBonus === undefined) throw new Error('Select a valid climate.');

  const baseIntakeMl = weightKg * WATER_ML_PER_KG;
  const totalIntakeMl = baseIntakeMl + activityBonus + climateBonus;

  return { baseIntakeMl, totalIntakeMl };
}

// --- Caffeine half-life calculator ---

// Quick-preset doses (mg) for common caffeine sources.
const CAFFEINE_PRESETS_MG = { coffee: 95, espresso: 63, tea: 47, energyDrink: 80 };

// First-order exponential decay: remaining = dose * 0.5^(elapsed/halfLife).
function caffeineRemaining(doseMg, elapsedHours, halfLifeHours = 5) {
  if (doseMg < 0) throw new Error('Dose must be non-negative.');
  if (elapsedHours < 0) throw new Error('Elapsed hours must be non-negative.');
  if (!halfLifeHours || halfLifeHours <= 0) throw new Error('Half-life must be greater than zero.');

  return doseMg * Math.pow(0.5, elapsedHours / halfLifeHours);
}

// --- Gravel calculator ---

// area in m², depth in m, density in tonnes/m³, wastePercent as a whole number.
function gravelNeeded(area, depth, density, wastePercent) {
  if (!area || area <= 0) throw new Error('Area must be greater than zero.');
  if (!depth || depth <= 0) throw new Error('Depth must be greater than zero.');
  if (!density || density <= 0) throw new Error('Density must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');

  const volume = area * depth;
  const volumeWithWaste = volume * (1 + wastePercent / 100);
  const weight = volumeWithWaste * density;

  return { volume, volumeWithWaste, weight };
}

// --- Blood alcohol content (BAC) calculator (Widmark formula) ---

// Widmark distribution ratio (r), reflecting body water percentage;
// population-average constants, not individually precise.
const WIDMARK_R = { male: 0.68, female: 0.55 };
const STANDARD_DRINK_GRAMS = 14; // US standard drink
const ETHANOL_DENSITY_G_PER_ML = 0.789;
const BAC_ELIMINATION_RATE_PER_HOUR = 0.015;

function alcoholGramsFromDrinkCount(drinkCount) {
  if (drinkCount < 0) throw new Error('Drink count cannot be negative.');
  return drinkCount * STANDARD_DRINK_GRAMS;
}

function alcoholGramsFromVolume(volumeMl, abvPercent) {
  if (volumeMl < 0) throw new Error('Volume cannot be negative.');
  if (abvPercent < 0) throw new Error('ABV cannot be negative.');
  return volumeMl * (abvPercent / 100) * ETHANOL_DENSITY_G_PER_ML;
}

// Estimates BAC (%) via the Widmark formula: BAC = (A / (W*r))*100 - beta*H,
// clamped at 0 since elimination can't produce a negative BAC.
function widmarkBAC(alcoholGrams, weightKg, sex, hoursElapsed) {
  if (alcoholGrams < 0) throw new Error('Alcohol amount cannot be negative.');
  if (!weightKg || weightKg <= 0) throw new Error('Weight must be greater than zero.');
  if (hoursElapsed < 0) throw new Error('Hours elapsed cannot be negative.');

  const r = WIDMARK_R[sex];
  if (!r) throw new Error('Sex must be "male" or "female".');

  const weightGrams = weightKg * 1000;
  const bacRaw = (alcoholGrams / (weightGrams * r)) * 100 - BAC_ELIMINATION_RATE_PER_HOUR * hoursElapsed;

  return Math.max(0, bacRaw);
}

// Hours remaining from right now until BAC (at its current, already-elapsed
// value) drops to thresholdPercent, solving the same linear elimination
// rate for time. Returns 0 if already at or below the threshold.
function bacTimeToThreshold(currentBAC, thresholdPercent, eliminationRatePerHour = BAC_ELIMINATION_RATE_PER_HOUR) {
  if (currentBAC < 0) throw new Error('Current BAC cannot be negative.');
  if (thresholdPercent < 0) throw new Error('Threshold cannot be negative.');
  if (!eliminationRatePerHour || eliminationRatePerHour <= 0) {
    throw new Error('Elimination rate must be greater than zero.');
  }

  if (currentBAC <= thresholdPercent) return 0;
  return (currentBAC - thresholdPercent) / eliminationRatePerHour;
}

// --- Cycling FTP calculator ---

// Coggan's 7 power training zones, as a fraction of FTP. Zone 7 has no
// upper bound (upper: null).
const FTP_ZONES = [
  { zone: 1, label: 'Active Recovery', lower: 0, upper: 0.55 },
  { zone: 2, label: 'Endurance', lower: 0.56, upper: 0.75 },
  { zone: 3, label: 'Tempo', lower: 0.76, upper: 0.90 },
  { zone: 4, label: 'Lactate Threshold', lower: 0.91, upper: 1.05 },
  { zone: 5, label: 'VO2max', lower: 1.06, upper: 1.20 },
  { zone: 6, label: 'Anaerobic Capacity', lower: 1.21, upper: 1.50 },
  { zone: 7, label: 'Neuromuscular Power', lower: 1.51, upper: null },
];

// Coggan's method: a rider can sustain slightly higher average power for 20
// minutes than for a full 60 minutes, hence the 5% reduction.
function estimateFTP(avgPower20min) {
  if (!avgPower20min || avgPower20min <= 0) throw new Error('Average power must be greater than zero.');
  return avgPower20min * 0.95;
}

function ftpPowerZones(ftp) {
  if (!ftp || ftp <= 0) throw new Error('FTP must be greater than zero.');

  return FTP_ZONES.map(z => ({
    zone: z.zone,
    label: z.label,
    lowerWatts: Math.round(ftp * z.lower),
    upperWatts: z.upper === null ? null : Math.round(ftp * z.upper),
  }));
}

// Rough FTP power-to-weight fitness categories (W/kg), in the spirit of the
// widely-cited (Coggan-style) cycling power profile charts. Approximate —
// riders vary by discipline, effort duration, and body composition, so this
// is framed as a rough band, not a precise claim.
const FTP_WKG_CATEGORIES = [
  { maxWattsPerKg: 2.5, label: 'Untrained' },
  { maxWattsPerKg: 3.1, label: 'Fair (Cat 5)' },
  { maxWattsPerKg: 3.7, label: 'Moderate (Cat 4)' },
  { maxWattsPerKg: 4.4, label: 'Good (Cat 3)' },
  { maxWattsPerKg: 4.9, label: 'Very good (Cat 2)' },
  { maxWattsPerKg: 5.5, label: 'Excellent (Cat 1)' },
  { maxWattsPerKg: 6.1, label: 'Exceptional (domestic pro)' },
];

function ftpPowerToWeight(ftp, bodyweightKg) {
  if (!ftp || ftp <= 0) throw new Error('FTP must be greater than zero.');
  if (!bodyweightKg || bodyweightKg <= 0) throw new Error('Bodyweight must be greater than zero.');

  const wattsPerKg = ftp / bodyweightKg;
  const band = FTP_WKG_CATEGORIES.find((b) => wattsPerKg < b.maxWattsPerKg);

  return { wattsPerKg, category: band ? band.label : 'World class (pro/elite)' };
}

// --- Mulch/Soil calculator ---

// area and depth in consistent length units (e.g. m and m, giving m³);
// wastePercent as a whole number. Bag-count conversion reuses roundUpToCans.
function mulchVolumeNeeded(area, depth, wastePercent) {
  if (!area || area <= 0) throw new Error('Area must be greater than zero.');
  if (!depth || depth <= 0) throw new Error('Depth must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');

  const volume = area * depth;
  const volumeWithWaste = volume * (1 + wastePercent / 100);

  return { volume, volumeWithWaste };
}

// --- Roof Area / Roof Pitch calculators ---

// Purely geometric: 1/cos(slope angle), the hypotenuse-to-base ratio of the
// roof cross-section triangle. Shared by the Roof Area and Roof Pitch
// calculators. `run` of 0 is a vertical wall, not a valid roof.
function roofPitchMultiplier(rise, run) {
  if (!run || run <= 0) throw new Error('Run must be greater than zero.');
  if (rise < 0) throw new Error('Rise cannot be negative.');
  return Math.sqrt(1 + (rise / run) ** 2);
}

// Converts a flat footprint area to the actual sloped roofing-material area,
// with an optional waste allowance for hips/valleys/dormers.
function roofArea(footprintArea, rise, run, wastePercent = 0) {
  if (!footprintArea || footprintArea <= 0) throw new Error('Footprint area must be greater than zero.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');

  const multiplier = roofPitchMultiplier(rise, run);
  const area = footprintArea * multiplier * (1 + wastePercent / 100);

  return { multiplier, area };
}

// Converts a roof area (m²) into roofing "squares" (1 square = 100 sq ft)
// and bundles, the units roofing materials are actually ordered in.
// bundlesPerSquare defaults to 3 (typical for asphalt shingles) but varies
// by product, so it's a configurable input.
function roofingSquaresAndBundles(areaM2, bundlesPerSquare = 3) {
  if (!areaM2 || areaM2 <= 0) throw new Error('Area must be greater than zero.');
  if (!bundlesPerSquare || bundlesPerSquare <= 0) throw new Error('Bundles per square must be greater than zero.');

  const areaSqFt = convertUnit('area', areaM2, 'm2', 'ft2');
  const squaresNeeded = areaSqFt / 100;
  const bundlesNeeded = Math.ceil(squaresNeeded * bundlesPerSquare);

  return { squaresNeeded, bundlesNeeded };
}

// --- Roof Pitch calculator ---

// Converts a measured rise/run into the slope ratio, "X-in-12" notation,
// angle in degrees, and (as a cross-reference) the roof pitch multiplier
// from roofArea's formula above.
function roofPitchConversions(rise, run) {
  if (!run || run <= 0) throw new Error('Run must be greater than zero.');
  if (rise < 0) throw new Error('Rise cannot be negative.');

  const slopeRatio = rise / run;
  const xIn12 = slopeRatio * 12;
  const angleDegrees = Math.atan(slopeRatio) * 180 / Math.PI;
  const multiplier = roofPitchMultiplier(rise, run);

  return { slopeRatio, xIn12, angleDegrees, multiplier };
}

// --- Climbing grade converter ---

// Standard V-scale <-> Font bouldering-grade correspondence table, most
// widely cited by climbing gyms/guidebooks/8a.nu.
const BOULDER_GRADE_TABLE = [
  { v: 'VB', font: '3' },
  { v: 'V0', font: '4' },
  { v: 'V1', font: '5' },
  { v: 'V2', font: '5+' },
  { v: 'V3', font: '6A/6A+' },
  { v: 'V4', font: '6B/6B+' },
  { v: 'V5', font: '6C/6C+' },
  { v: 'V6', font: '7A' },
  { v: 'V7', font: '7A+' },
  { v: 'V8', font: '7B/7B+' },
  { v: 'V9', font: '7C' },
  { v: 'V10', font: '7C+' },
  { v: 'V11', font: '8A' },
  { v: 'V12', font: '8A+' },
  { v: 'V13', font: '8B' },
  { v: 'V14', font: '8B+' },
  { v: 'V15', font: '8C' },
  { v: 'V16', font: '8C+' },
  { v: 'V17', font: '9A' },
];

// YDS (Yosemite Decimal System) route grades: a separate reference scale for
// route climbing, not a bouldering scale. There is no standardized numeric
// equivalence between YDS and V-scale/Font, so it isn't cross-converted.
const YDS_GRADES = [
  '5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8', '5.9',
  '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d',
  '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d',
  '5.14a', '5.14b', '5.14c', '5.14d', '5.15a', '5.15b', '5.15c', '5.15d',
];

function isValidClimbingGrade(system, grade) {
  if (system === 'yds') return YDS_GRADES.includes(grade);
  if (system === 'v' || system === 'font') return BOULDER_GRADE_TABLE.some(row => row[system] === grade);
  return false;
}

// Converts a grade between systems. V<->Font is a direct table lookup;
// same-system is the identity case. YDS is a different type of scale (route
// vs. bouldering) with no standardized direct equivalence to V-scale/Font,
// so converting across that boundary throws rather than guessing.
function convertClimbingGrade(system, grade, targetSystem) {
  if (!system || !targetSystem) throw new Error('Select both a source and target grading system.');
  if (!isValidClimbingGrade(system, grade)) throw new Error(`Unrecognized ${system} grade: ${grade}`);

  if (system === targetSystem) return grade;

  const boulderSystems = ['v', 'font'];
  if (boulderSystems.includes(system) && boulderSystems.includes(targetSystem)) {
    const entry = BOULDER_GRADE_TABLE.find(row => row[system] === grade);
    return entry[targetSystem];
  }

  throw new Error('YDS route grades and V-scale/Font bouldering grades are different types of scales with no standardized direct equivalence; compare grades within the same discipline instead.');
}

// --- Ladder Angle/Safety calculator ---

// OSHA/ANSI-cited safe climbing angle range for the 4:1 rule (~75.5°/75.96°
// depending on rounding), with ~68° as the commonly cited lower bound.
const LADDER_SAFE_ANGLE_MIN_DEGREES = 68;
const LADDER_SAFE_ANGLE_MAX_DEGREES = 76;

// If baseDistance is omitted, uses the 4:1 rule default (supportHeight / 4).
// `extension` (default 1, e.g. meters or feet matching the other inputs) is
// the recommended stand-off above the support point for stepping off safely.
function ladderPlan(supportHeight, baseDistance, extension = 1) {
  if (!supportHeight || supportHeight <= 0) throw new Error('Support height must be greater than zero.');
  if (extension < 0) throw new Error('Extension cannot be negative.');

  const distance = (baseDistance === undefined || baseDistance === null) ? supportHeight / 4 : baseDistance;
  if (!distance || distance <= 0) throw new Error('Base distance must be greater than zero.');

  const angleDegrees = Math.atan(supportHeight / distance) * 180 / Math.PI;
  const isSafeAngle = angleDegrees >= LADDER_SAFE_ANGLE_MIN_DEGREES && angleDegrees <= LADDER_SAFE_ANGLE_MAX_DEGREES;
  const lengthToSupport = Math.sqrt(supportHeight ** 2 + distance ** 2);
  const recommendedLength = Math.sqrt((supportHeight + extension) ** 2 + distance ** 2);

  return { baseDistance: distance, angleDegrees, isSafeAngle, lengthToSupport, recommendedLength };
}

// --- UV exposure / sun safety calculator ---

// Fitzpatrick skin-type multipliers for the simplified public-facing
// time-to-burn formula.
const FITZPATRICK_SKIN_FACTORS = { I: 2.5, II: 3, III: 4, IV: 5, V: 8, VI: 15 };

// A UV index of 0 has no meaningful burn risk, so returns Infinity (a
// sentinel the caller should check for) rather than dividing by zero.
// `spf`, if given, multiplies the safe time by roughly that factor.
function timeToBurnMinutes(uvIndex, skinType, spf) {
  if (uvIndex < 0) throw new Error('UV index cannot be negative.');

  const factor = FITZPATRICK_SKIN_FACTORS[skinType];
  if (!factor) throw new Error('Select a valid Fitzpatrick skin type (I-VI).');

  if (spf !== undefined && spf !== null && spf <= 0) {
    throw new Error('SPF must be greater than zero.');
  }

  if (uvIndex === 0) return Infinity;

  const baseMinutes = (200 * factor) / (3 * uvIndex);
  return spf ? baseMinutes * spf : baseMinutes;
}

// --- Pet age calculator ---

const PET_MAX_AGE_YEARS = 30;
// ~3 weeks: below this, the dog formula's ln(age) isn't meaningful (approaches
// -Infinity near 0), so treat it as "too young" instead.
const DOG_MIN_AGE_YEARS = 3 / 52;

// Wang et al. (2019, Cell Systems) epigenetic-clock-based formula, from a
// single-breed (Labrador Retriever) DNA methylation study.
function dogHumanAge(dogAgeYears) {
  if (!dogAgeYears || dogAgeYears <= 0) throw new Error('Age must be greater than zero.');
  if (dogAgeYears > PET_MAX_AGE_YEARS) throw new Error(`Enter a more realistic age (${PET_MAX_AGE_YEARS} years or under).`);
  if (dogAgeYears < DOG_MIN_AGE_YEARS) {
    throw new Error('Too young for this formula (under about 3 weeks old) - this formula applies from a few weeks of age onward.');
  }

  return 16 * Math.log(dogAgeYears) + 31;
}

// AAHA/AAFP-endorsed piecewise life-stage model, replacing the old "x7" rule.
function catHumanAge(catAgeYears) {
  if (!catAgeYears || catAgeYears <= 0) throw new Error('Age must be greater than zero.');
  if (catAgeYears > PET_MAX_AGE_YEARS) throw new Error(`Enter a more realistic age (${PET_MAX_AGE_YEARS} years or under).`);

  if (catAgeYears <= 1) return 15 * catAgeYears;
  if (catAgeYears <= 2) return 15 + 9 * (catAgeYears - 1);
  return 24 + 4 * (catAgeYears - 2);
}

// --- Pregnancy due date calculator ---

const PREGNANCY_DEFAULT_CYCLE_DAYS = 28;
const PREGNANCY_MIN_CYCLE_DAYS = 20;
const PREGNANCY_MAX_CYCLE_DAYS = 45;

// Naegele's rule: LMP + 280 days (40 weeks), assuming ovulation on day 14 of
// a 28-day cycle. Adjusted by the gap between the person's actual average
// cycle length and that 28-day assumption.
function dueDateFromLmp(lmpDate, cycleLengthDays = PREGNANCY_DEFAULT_CYCLE_DAYS) {
  if (cycleLengthDays < PREGNANCY_MIN_CYCLE_DAYS || cycleLengthDays > PREGNANCY_MAX_CYCLE_DAYS) {
    throw new Error(`Cycle length must be between ${PREGNANCY_MIN_CYCLE_DAYS} and ${PREGNANCY_MAX_CYCLE_DAYS} days.`);
  }
  return addDaysToDate(lmpDate, 280 + (cycleLengthDays - PREGNANCY_DEFAULT_CYCLE_DAYS));
}

// Gestation counted from actual conception is ~266 days (280 days minus the
// ~14-day average follicular/pre-ovulation phase from LMP to ovulation).
function dueDateFromConception(conceptionDate) {
  return addDaysToDate(conceptionDate, 266);
}

// Days of gestation as of `asOfDate`, counted the conventional obstetric way
// (from LMP) regardless of which reference date the user supplied - when the
// input was a conception date, gestational age runs ~14 days ahead of days
// since conception.
function gestationalAgeDays(mode, referenceDate, asOfDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceReference = Math.round((asOfDate.getTime() - referenceDate.getTime()) / msPerDay);
  return mode === 'conception' ? daysSinceReference + 14 : daysSinceReference;
}

// Standard obstetric milestones, each just N weeks past the same
// LMP-equivalent reference date used to derive the due date (pass
// `dueDate` minus 280 days so the list stays internally consistent with
// whichever due-date calculation - LMP or conception-based - produced it).
function pregnancyMilestones(lmpEquivalentDate) {
  return {
    endOfFirstTrimester: addDaysToDate(lmpEquivalentDate, 13 * 7),
    anatomyScanStart: addDaysToDate(lmpEquivalentDate, 18 * 7),
    anatomyScanEnd: addDaysToDate(lmpEquivalentDate, 22 * 7),
    viability: addDaysToDate(lmpEquivalentDate, 24 * 7),
    fullTermStart: addDaysToDate(lmpEquivalentDate, 37 * 7),
    dueDate: addDaysToDate(lmpEquivalentDate, 40 * 7),
  };
}

// Classifies gestational age (in days since LMP, per gestationalAgeDays) into
// a pregnancy trimester: 1st through 12w6d, 2nd from 13w0d-27w6d, 3rd from
// 28w0d on.
function pregnancyTrimester(gestDays) {
  if (gestDays < 13 * 7) return 1;
  if (gestDays < 28 * 7) return 2;
  return 3;
}

// --- Earth rotation and orbit distance calculator ---

const EARTH_RADIUS_KM = 6371;
// Sidereal day (Earth's true rotation period relative to distant stars),
// ~4 minutes shorter than the 24h solar day, which is more physically
// correct for computing rotational speed at a fixed latitude.
const EARTH_SIDEREAL_DAY_HOURS = 23.9345;
// Earth's mean orbital speed around the Sun (~29.78 km/s), treated as
// constant even though the orbit is a slight ellipse and real speed varies
// a little through the year.
const EARTH_ORBITAL_SPEED_KMH = 107208;

// Speed due to Earth's rotation at a given latitude: points away from the
// equator trace a smaller circle per rotation, scaled by cos(latitude).
function earthRotationSpeedKmh(latitudeDeg) {
  if (latitudeDeg < -90 || latitudeDeg > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees.');
  }
  const latRad = latitudeDeg * Math.PI / 180;
  return (2 * Math.PI * EARTH_RADIUS_KM * Math.cos(latRad)) / EARTH_SIDEREAL_DAY_HOURS;
}

// Distance traveled over `hours` due to rotation and/or orbit, at a given
// latitude. The combined total is a simple additive approximation for
// user-facing intuition - the two motions aren't generally in the same
// direction, so it isn't a true vector sum.
function earthTravelDistance(latitudeDeg, hours, includeRotation = true, includeOrbit = true) {
  if (latitudeDeg < -90 || latitudeDeg > 90) {
    throw new Error('Latitude must be between -90 and 90 degrees.');
  }
  if (!hours || hours <= 0) throw new Error('Duration must be greater than zero.');
  if (!includeRotation && !includeOrbit) throw new Error('Select at least one motion to include.');

  const rotationKm = includeRotation ? earthRotationSpeedKmh(latitudeDeg) * hours : 0;
  const orbitKm = includeOrbit ? EARTH_ORBITAL_SPEED_KMH * hours : 0;
  return { rotationKm, orbitKm, totalKm: rotationKm + orbitKm };
}

// --- Decking calculator ---

// Deck length/width and joist spacing in meters; board width and gap in
// millimeters (matching how these are commonly sold/specified); board
// length in meters. wastePercent and screwsPerJoist as whole numbers.
// Boards run across the deck's width in parallel rows, each row spanning
// the deck's length; joists run perpendicular to the boards, spanning the
// deck's length, so joist crossings per board are based on deck length.
function deckingMaterialsNeeded(
  deckLengthM, deckWidthM, boardWidthMm, boardLengthM, gapMm, wastePercent, joistSpacingM, screwsPerJoist
) {
  if (!deckLengthM || deckLengthM <= 0) throw new Error('Deck length must be greater than zero.');
  if (!deckWidthM || deckWidthM <= 0) throw new Error('Deck width must be greater than zero.');
  if (!boardWidthMm || boardWidthMm <= 0) throw new Error('Board width must be greater than zero.');
  if (!boardLengthM || boardLengthM <= 0) throw new Error('Board length must be greater than zero.');
  if (gapMm < 0) throw new Error('Gap between boards cannot be negative.');
  if (gapMm >= boardWidthMm) throw new Error('Gap between boards cannot be greater than or equal to the board width.');
  if (wastePercent < 0) throw new Error('Waste percentage cannot be negative.');
  if (!joistSpacingM || joistSpacingM <= 0) throw new Error('Joist spacing must be greater than zero.');
  if (!screwsPerJoist || screwsPerJoist <= 0) throw new Error('Screws per joist crossing must be greater than zero.');

  const effectiveBoardWidthM = (boardWidthMm + gapMm) / 1000;
  const boardRows = Math.ceil(deckWidthM / effectiveBoardWidthM);
  const totalLinearLengthM = boardRows * deckLengthM;
  const boardsByLength = Math.ceil(totalLinearLengthM / boardLengthM);
  const totalBoards = Math.ceil(boardsByLength * (1 + wastePercent / 100));

  const joistsCrossedPerBoard = Math.ceil(deckLengthM / joistSpacingM) + 1;
  const screwsPerBoard = joistsCrossedPerBoard * screwsPerJoist;
  const totalScrews = screwsPerBoard * totalBoards;

  return {
    effectiveBoardWidthM,
    boardRows,
    totalLinearLengthM,
    boardsByLength,
    totalBoards,
    joistsCrossedPerBoard,
    screwsPerBoard,
    totalScrews,
  };
}

// --- Staircase calculator ---

const STAIRCASE_CODE_MAX_RISER_MM = 196;
const STAIRCASE_COMFORT_RISER_MIN_MM = 170;
const STAIRCASE_COMFORT_RISER_MAX_MM = 200;
const STAIRCASE_CODE_MIN_TREAD_MM = 254;
const STAIRCASE_COMFORT_TREAD_MIN_MM = 250;
const STAIRCASE_COMFORT_TREAD_MAX_MM = 355;
const STAIRCASE_DEFAULT_TARGET_RISER_MM = 190;
const STAIRCASE_2R_PLUS_T_MIN_MM = 600;
const STAIRCASE_2R_PLUS_T_MAX_MM = 650;

// A staircase with N risers has N-1 treads when it lands flush with the
// floor above (that top floor itself serves as the final "tread"), so the
// riser count divides the total rise while the tread count is one fewer.
// Using ceil (rather than round) on the target riser height guarantees the
// actual riser height never comes out above what the user asked for.
function staircasePlan(totalHeightMm, availableRunMm, targetRiserHeightMm = STAIRCASE_DEFAULT_TARGET_RISER_MM) {
  if (!totalHeightMm || totalHeightMm <= 0) throw new Error('Total height must be greater than zero.');
  if (!availableRunMm || availableRunMm <= 0) throw new Error('Available run must be greater than zero.');
  if (!targetRiserHeightMm || targetRiserHeightMm <= 0) throw new Error('Target riser height must be greater than zero.');

  const numberOfSteps = Math.ceil(totalHeightMm / targetRiserHeightMm);
  const numberOfTreads = numberOfSteps - 1;
  const riserHeightMm = totalHeightMm / numberOfSteps;
  const treadDepthMm = numberOfTreads > 0 ? availableRunMm / numberOfTreads : null;

  const riserWithinComfort = riserHeightMm >= STAIRCASE_COMFORT_RISER_MIN_MM && riserHeightMm <= STAIRCASE_COMFORT_RISER_MAX_MM;
  const riserExceedsCodeMax = riserHeightMm > STAIRCASE_CODE_MAX_RISER_MM;

  const treadWithinComfort = treadDepthMm !== null && treadDepthMm >= STAIRCASE_COMFORT_TREAD_MIN_MM && treadDepthMm <= STAIRCASE_COMFORT_TREAD_MAX_MM;
  const treadBelowCodeMin = treadDepthMm !== null && treadDepthMm < STAIRCASE_CODE_MIN_TREAD_MM;

  const twoRPlusTMm = treadDepthMm !== null ? 2 * riserHeightMm + treadDepthMm : null;
  const twoRPlusTWithinComfort = twoRPlusTMm !== null && twoRPlusTMm >= STAIRCASE_2R_PLUS_T_MIN_MM && twoRPlusTMm <= STAIRCASE_2R_PLUS_T_MAX_MM;

  return {
    numberOfSteps,
    numberOfTreads,
    riserHeightMm,
    treadDepthMm,
    riserWithinComfort,
    riserExceedsCodeMax,
    treadWithinComfort,
    treadBelowCodeMin,
    twoRPlusTMm,
    twoRPlusTWithinComfort,
  };
}
// --- Fence calculator ---

// Pre-made panels of a fixed width, hung between posts along a straight run.
function panelFenceCalculation(fenceLength, panelWidth) {
  if (!fenceLength || fenceLength <= 0) throw new Error('Fence length must be greater than zero.');
  if (!panelWidth || panelWidth <= 0) throw new Error('Panel width must be greater than zero.');

  const numPanels = Math.ceil(fenceLength / panelWidth);
  const numPosts = numPanels + 1;
  return { numPanels, numPosts };
}

// Posts spaced no further apart than `maxPostSpacing`, then evenly
// redistributed across the run so actual spacing never exceeds the max -
// rails run horizontally between each adjacent pair of posts.
function railFenceCalculation(fenceLength, maxPostSpacing, railLines) {
  if (!fenceLength || fenceLength <= 0) throw new Error('Fence length must be greater than zero.');
  if (!maxPostSpacing || maxPostSpacing <= 0) throw new Error('Max post spacing must be greater than zero.');
  if (!railLines || railLines <= 0) throw new Error('Number of rail lines must be greater than zero.');

  const numSections = Math.ceil(fenceLength / maxPostSpacing);
  const numPosts = numSections + 1;
  const actualSpacing = fenceLength / (numPosts - 1);
  const numRails = railLines * (numPosts - 1);
  return { numPosts, actualSpacing, numRails };
}
// --- Heating cost calculator ---

// Simplified stand-ins for a building's overall heat-loss coefficient (W/m^2*K).
const INSULATION_FACTOR_PRESETS = {
  poor: 2.0,
  average: 1.0,
  'well-insulated': 0.5,
  'passive-house': 0.15,
};

function heatingCost(floorArea, insulationFactor, hdd, systemEfficiency, pricePerKwh) {
  if (!floorArea || floorArea <= 0) throw new Error('Floor area must be greater than zero.');
  if (!insulationFactor || insulationFactor <= 0) throw new Error('Insulation factor must be greater than zero.');
  if (hdd < 0) throw new Error('Heating degree-days cannot be negative.');
  if (!systemEfficiency || systemEfficiency <= 0) throw new Error('System efficiency must be greater than zero.');
  if (!pricePerKwh || pricePerKwh <= 0) throw new Error('Energy price must be greater than zero.');

  const dailyHeatLossFactor = floorArea * insulationFactor * 24 / 1000;
  const totalHeatingEnergyKwh = dailyHeatLossFactor * hdd;
  const energyAfterEfficiencyKwh = totalHeatingEnergyKwh / systemEfficiency;
  const cost = energyAfterEfficiencyKwh * pricePerKwh;

  return { dailyHeatLossFactor, totalHeatingEnergyKwh, energyAfterEfficiencyKwh, cost };
}
// --- Unix timestamp converter ---

// Values this large in magnitude can't be a plausible seconds-since-epoch
// value for the visible future/past (1e12 seconds is year ~33658); treat
// them as milliseconds instead.
const UNIX_TIMESTAMP_MS_THRESHOLD = 1e12;

function detectTimestampUnit(value) {
  return Math.abs(value) >= UNIX_TIMESTAMP_MS_THRESHOLD ? 'milliseconds' : 'seconds';
}

// Sub-second precision (fractional seconds) is preserved by simply scaling,
// not rejected - the JS Date epoch is milliseconds regardless of the input unit.
function timestampToDate(value, unit = 'seconds') {
  if (typeof value !== 'number' || !isFinite(value)) {
    throw new Error('Enter a valid numeric timestamp.');
  }
  const epochMs = unit === 'milliseconds' ? value : value * 1000;
  const date = new Date(epochMs);
  if (isNaN(date.getTime())) {
    throw new Error('Timestamp is out of the representable date range.');
  }
  return date;
}

// Wraps Intl.DateTimeFormat so calc-lib stays a pure function of its
// arguments - the caller (calculators.js) resolves the browser's own zone
// name via Intl.DateTimeFormat().resolvedOptions().timeZone before calling in.
function formatDateInTimeZone(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'long', timeZone }).format(date);
  } catch (err) {
    throw new Error(`Unrecognized timezone: ${timeZone}`);
  }
}

// Converts wall-clock date/time fields to an epoch, in either UTC or the
// "local" zone (meaning: whatever zone the JS engine itself runs in - the
// only zone besides UTC where a Date constructor can resolve wall-clock
// fields without a timezone database). Arbitrary IANA zones aren't
// supported here; see the issue notes for why that's out of scope for a
// pure function.
function dateFieldsToEpoch(fields, zone = 'UTC') {
  const { year, month, day, hour = 0, minute = 0, second = 0 } = fields;
  const parts = [year, month, day, hour, minute, second];
  if (parts.some((v) => typeof v !== 'number' || !isFinite(v))) {
    throw new Error('Enter valid numeric date/time fields.');
  }

  let epochMs;
  let roundTrip;
  if (zone === 'UTC') {
    epochMs = Date.UTC(year, month - 1, day, hour, minute, second);
    const d = new Date(epochMs);
    roundTrip = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()];
  } else if (zone === 'local') {
    epochMs = new Date(year, month - 1, day, hour, minute, second).getTime();
    const d = new Date(epochMs);
    roundTrip = [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
  } else {
    throw new Error('Only UTC and local timezones are supported for date-to-timestamp conversion.');
  }

  if (isNaN(epochMs)) {
    throw new Error('Timestamp is out of the representable date range.');
  }
  // JS Date silently rolls over invalid fields (Feb 30 -> Mar 2) instead of
  // erroring, so an invalid calendar date is only caught by checking that
  // the constructed date's fields still match what was entered.
  if (roundTrip.some((v, i) => v !== parts[i])) {
    throw new Error('Enter a valid calendar date - that date does not exist.');
  }

  return { epochMs, epochSeconds: Math.floor(epochMs / 1000) };
}

// Formats how far `date` is from `now` as a human-readable string, e.g.
// "3 hours ago" or "in 12 minutes". `now` is an explicit parameter (rather
// than reading Date.now() internally) so this stays a pure function of its
// arguments and is unit-testable without mocking global time.
function relativeTimeFromNow(date, now = new Date()) {
  const deltaSeconds = (date.getTime() - now.getTime()) / 1000;
  const absSeconds = Math.abs(deltaSeconds);

  if (absSeconds < 30) {
    return 'just now';
  }

  const UNITS = [
    { unit: 'year', seconds: 365.25 * 24 * 60 * 60 },
    { unit: 'month', seconds: 30.44 * 24 * 60 * 60 },
    { unit: 'day', seconds: 24 * 60 * 60 },
    { unit: 'hour', seconds: 60 * 60 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  const { unit, seconds } = UNITS.find((u) => absSeconds >= u.seconds) || UNITS[UNITS.length - 1];
  const value = Math.round(absSeconds / seconds);
  const label = `${value} ${unit}${value === 1 ? '' : 's'}`;

  return deltaSeconds < 0 ? `${label} ago` : `in ${label}`;
}
// --- Number base converter ---

const BASE_DIGIT_PATTERNS = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

// parseInt/toString(base) don't validate their input strictly (parseInt
// silently stops at the first invalid digit rather than rejecting the whole
// string), so the input is checked against a base-specific digit pattern
// first. Non-negative integers only.
function convertNumberBase(value, fromBase) {
  const pattern = BASE_DIGIT_PATTERNS[fromBase];
  if (!pattern) throw new Error('Unsupported base.');
  if (!value || !pattern.test(value)) throw new Error(`"${value}" is not a valid base-${fromBase} number.`);

  const decimalValue = parseInt(value, fromBase);

  return {
    binary: decimalValue.toString(2),
    octal: decimalValue.toString(8),
    decimal: decimalValue.toString(10),
    hex: decimalValue.toString(16).toUpperCase(),
  };
}

// --- Color format converter ---

// Accepts a 3- or 6-digit hex color, with or without a leading '#'.
function hexToRgb(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(h)) h = h.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error('Enter a valid hex color, e.g. #3366CC.');

  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHex(r, g, b) {
  [r, g, b].forEach(v => {
    if (!Number.isInteger(v) || v < 0 || v > 255) throw new Error('RGB values must be integers between 0 and 255.');
  });

  const toHex = v => v.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Standard RGB -> HSL conversion. Returns hue in degrees (0-360) and
// saturation/lightness as percentages (0-100).
function rgbToHsl(r, g, b) {
  [r, g, b].forEach(v => {
    if (!Number.isInteger(v) || v < 0 || v > 255) throw new Error('RGB values must be integers between 0 and 255.');
  });

  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;

    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

// Standard HSL -> RGB conversion. h in degrees (any value, wrapped mod 360),
// s and l as percentages (0-100).
function hslToRgb(h, s, l) {
  if (s < 0 || s > 100 || l < 0 || l > 100) throw new Error('Saturation and lightness must be between 0 and 100.');

  const sn = s / 100;
  const ln = l / 100;
  const hn = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((hn / 60) % 2 - 1));
  const m = ln - c / 2;

  let r1;
  let g1;
  let b1;
  if (hn < 60) [r1, g1, b1] = [c, x, 0];
  else if (hn < 120) [r1, g1, b1] = [x, c, 0];
  else if (hn < 180) [r1, g1, b1] = [0, c, x];
  else if (hn < 240) [r1, g1, b1] = [0, x, c];
  else if (hn < 300) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

// --- Base64 encoder/decoder ---

// Accepts both standard (+ /) and URL-safe (- _) alphabets on decode, since
// URL-safe Base64 is commonly pasted in by mistake; '=' padding is optional
// on input but always emitted as standard, padded Base64 on encode.
const BASE64_ALPHABET_REGEX = /^[A-Za-z0-9+/]*={0,2}$/;

// Uses Buffer (Node/Jest) when available, falling back to TextEncoder +
// btoa (browser) - btoa alone only handles one-byte-per-char binary strings
// and mangles/throws on multi-byte UTF-8 text, so bytes must be encoded first.
// When urlSafe is true, swaps in the URL-safe alphabet (+ -> -, / -> _) and
// strips trailing '=' padding, matching the alphabet base64Decode already
// accepts on input.
function base64Encode(text, urlSafe = false) {
  if (text === '') return '';
  let encoded;
  if (typeof Buffer !== 'undefined') {
    encoded = Buffer.from(text, 'utf8').toString('base64');
  } else {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    encoded = btoa(binary);
  }
  if (urlSafe) {
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return encoded;
}

function base64Decode(base64Str) {
  // Wrapped/pasted Base64 commonly has embedded newlines (e.g. 76-column MIME wrap).
  const cleaned = base64Str.replace(/\s+/g, '');
  if (cleaned === '') return '';

  const normalized = cleaned.replace(/-/g, '+').replace(/_/g, '/');

  if (!BASE64_ALPHABET_REGEX.test(normalized)) {
    throw new Error('Input contains characters outside the Base64 alphabet.');
  }
  if (normalized.length % 4 !== 0) {
    throw new Error('Base64 input length must be a multiple of 4 - check for missing characters or padding.');
  }

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(normalized, 'base64').toString('utf8');
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
// --- Regex tester ---

const REGEX_MATCH_DISPLAY_CAP = 500;

// Always scans with a 'g' flag internally (forced on even if the user's own
// 'g' checkbox is unchecked) since every output this calculator shows -
// match count, highlighted text, results table - is inherently an "all
// matches" view. The user's 'g' checkbox therefore documents/enables the
// semantic they intend rather than gating how many matches get found;
// matchAll's built-in zero-length-match advancement means we don't need to
// hand-roll an exec() loop either way.
function findRegexMatches(pattern, flags, text) {
  if (!pattern) throw new Error('Enter a regex pattern.');

  const scanFlags = flags.includes('g') ? flags : `${flags}g`;
  let regex;
  try {
    regex = new RegExp(pattern, scanFlags);
  } catch (err) {
    throw new Error(`Invalid regular expression: ${err.message}`);
  }

  return [...text.matchAll(regex)].map((match) => ({
    match: match[0],
    index: match.index,
    groups: match.slice(1),
    namedGroups: match.groups ? { ...match.groups } : {},
  }));
}

// Runs text.replace() with the given pattern/flags/replacement, using the
// same pattern construction and error handling as findRegexMatches so an
// invalid pattern fails the same way in both places. Unlike findRegexMatches,
// this does not force the 'g' flag - replacement follows the flags exactly
// as given, matching standard String.replace() semantics.
function applyRegexReplacement(pattern, flags, text, replacement) {
  if (!pattern) throw new Error('Enter a regex pattern.');

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err) {
    throw new Error(`Invalid regular expression: ${err.message}`);
  }

  return text.replace(regex, replacement);
}

// --- Horizon distance calculator ---

// Standard atmospheric refraction coefficient: light bends slightly toward
// Earth's surface, extending the visible horizon a bit further than pure
// geometry predicts. This varies with weather/temperature gradients, so it's
// a typical-conditions estimate rather than an exact figure.
const HORIZON_REFRACTION_COEFFICIENT = 0.13;

// Distance to the horizon from an observer height `heightM` (meters above
// the surface), via d = sqrt(2 * R * h). Refraction is modeled as an
// effective Earth radius R' = R / (1 - k), which is larger than the true
// radius and so yields a longer horizon distance.
function horizonDistance(heightM, refractionCoefficient = HORIZON_REFRACTION_COEFFICIENT) {
  if (isNaN(heightM) || heightM < 0) {
    throw new Error('Height must be a non-negative number.');
  }
  const earthRadiusM = EARTH_RADIUS_KM * 1000;
  const geometricM = Math.sqrt(2 * earthRadiusM * heightM);
  const effectiveRadiusM = earthRadiusM / (1 - refractionCoefficient);
  const refractedM = Math.sqrt(2 * effectiveRadiusM * heightM);
  return {
    geometricKm: geometricM / 1000,
    refractedKm: refractedM / 1000,
  };
}

// --- Solar panel sizing & ROI calculator ---

// How many panels are needed to cover a target daily energy consumption,
// and the resulting system size.
function solarPanelSizing(targetDailyKwh, panelWattage, peakSunHours, derateFactor) {
  if (!targetDailyKwh || targetDailyKwh <= 0) {
    throw new Error('Target daily energy consumption must be greater than zero.');
  }
  if (!panelWattage || panelWattage <= 0) throw new Error('Panel wattage must be greater than zero.');
  if (!peakSunHours || peakSunHours <= 0) throw new Error('Peak sun hours must be greater than zero.');
  if (!derateFactor || derateFactor <= 0 || derateFactor > 1) {
    throw new Error('Derate factor must be greater than 0 and at most 1.');
  }

  const dailyOutputPerPanelKwh = (panelWattage * peakSunHours * derateFactor) / 1000;
  const numberOfPanels = Math.ceil(targetDailyKwh / dailyOutputPerPanelKwh);
  const systemSizeKw = (numberOfPanels * panelWattage) / 1000;

  return { dailyOutputPerPanelKwh, numberOfPanels, systemSizeKw };
}

// Simplified payback period from the sized system's expected production -
// ignores financing, incentives, price inflation, and panel degradation.
function solarPaybackPeriod(dailyOutputPerPanelKwh, numberOfPanels, systemCost, energyPricePerKwh, annualMaintenanceCost = 0) {
  if (!systemCost || systemCost <= 0) throw new Error('System cost must be greater than zero.');
  if (!energyPricePerKwh || energyPricePerKwh <= 0) throw new Error('Energy price must be greater than zero.');
  if (annualMaintenanceCost < 0) throw new Error('Annual maintenance cost cannot be negative.');

  const annualProductionKwh = dailyOutputPerPanelKwh * numberOfPanels * 365;
  const annualSavings = annualProductionKwh * energyPricePerKwh - annualMaintenanceCost;

  if (annualSavings <= 0) {
    throw new Error('Annual savings must be greater than zero - reduce maintenance cost or check the energy price.');
  }

  const paybackYears = systemCost / annualSavings;

  return { annualProductionKwh, annualSavings, paybackYears };
}

// Rough average car emissions figure (varies widely by vehicle and region;
// this is a commonly-cited rough average for a relatable comparison, not a
// specific vehicle's figure).
const AVERAGE_CAR_KG_CO2_PER_KM = 0.17;

// CO2 avoided per year from solar production offsetting grid electricity,
// given a user-adjustable grid emissions factor (kg CO2/kWh - there's no
// live grid-mix data, so this is a rough, editable estimate). Also reports
// a relatable equivalent in km of average car driving avoided.
function solarCO2Avoided(annualProductionKwh, emissionsFactorKgPerKwh) {
  if (!annualProductionKwh || annualProductionKwh <= 0) {
    throw new Error('Annual production must be greater than zero.');
  }
  if (!emissionsFactorKgPerKwh || emissionsFactorKgPerKwh <= 0) {
    throw new Error('Grid emissions factor must be greater than zero.');
  }

  const annualCO2AvoidedKg = annualProductionKwh * emissionsFactorKgPerKwh;
  const equivalentCarKm = annualCO2AvoidedKg / AVERAGE_CAR_KG_CO2_PER_KM;

  return { annualCO2AvoidedKg, equivalentCarKm };
}
// --- Projectile motion and fall time calculator ---

// Time of flight, max height, and range for a launch at `speed` and
// `angleDeg` from horizontal, starting `initialHeight` above the landing
// surface. Ignores air resistance and assumes flat, level ground and
// constant gravity. Setting angleDeg (and thus vy) to 0 with speed 0
// reduces this to the pure free-fall case; with speed 0, initialHeight 0
// too, there's nothing to fall, so time of flight is legitimately 0.
function projectileMotion(speed, angleDeg, initialHeight, gravity = 9.81) {
  if (speed < 0) throw new Error('Speed must be zero or greater.');
  if (angleDeg < 0 || angleDeg > 90) throw new Error('Angle must be between 0 and 90 degrees.');
  if (initialHeight < 0) throw new Error('Initial height must be zero or greater.');

  const angleRad = angleDeg * Math.PI / 180;
  const vx = speed * Math.cos(angleRad);
  const vy = speed * Math.sin(angleRad);

  const timeOfFlight = (vy === 0 && initialHeight === 0)
    ? 0
    : (vy + Math.sqrt(vy * vy + 2 * gravity * initialHeight)) / gravity;

  const maxHeight = initialHeight + (vy * vy) / (2 * gravity);
  const range = vx * timeOfFlight;

  return { timeOfFlight, maxHeight, range, vx, vy };
}

// --- Stopping distance calculator ---

// Typical emergency-braking deceleration (m/s^2) by road surface condition —
// rough, commonly-cited figures, not a substitute for a vehicle's actual
// tested braking performance.
const ROAD_SURFACE_DECELERATION = { dry: 7.5, wet: 5, icy: 2 };

// reactionDistance = speed * reactionTime (car travels at constant speed
// while the driver reacts); brakingDistance = speed^2 / (2*deceleration)
// (constant-deceleration kinematics), summed to the total stopping distance.
function stoppingDistance(speedMs, reactionTimeSeconds, decelerationMs2) {
  if (speedMs < 0) throw new Error('Speed must be zero or greater.');
  if (reactionTimeSeconds < 0) throw new Error('Reaction time must be zero or greater.');
  if (!decelerationMs2 || decelerationMs2 <= 0) throw new Error('Deceleration must be greater than zero.');

  const reactionDistance = speedMs * reactionTimeSeconds;
  const brakingDistance = (speedMs * speedMs) / (2 * decelerationMs2);

  return { reactionDistance, brakingDistance, totalDistance: reactionDistance + brakingDistance };
}

// --- Electrical load / Ohm's Law calculator ---

function voltageFromOhmsLaw(current, resistance) {
  if (!current || current <= 0) throw new Error('Current must be greater than zero.');
  if (!resistance || resistance <= 0) throw new Error('Resistance must be greater than zero.');
  return current * resistance;
}

function currentFromOhmsLaw(voltage, resistance) {
  if (!voltage || voltage <= 0) throw new Error('Voltage must be greater than zero.');
  if (!resistance || resistance <= 0) throw new Error('Resistance must be greater than zero.');
  return voltage / resistance;
}

function resistanceFromOhmsLaw(voltage, current) {
  if (!voltage || voltage <= 0) throw new Error('Voltage must be greater than zero.');
  if (!current || current <= 0) throw new Error('Current must be greater than zero.');
  return voltage / current;
}

function powerFromWattsLaw(voltage, current) {
  if (!voltage || voltage <= 0) throw new Error('Voltage must be greater than zero.');
  if (!current || current <= 0) throw new Error('Current must be greater than zero.');
  return voltage * current;
}

function currentFromWattsLaw(power, voltage) {
  if (!power || power <= 0) throw new Error('Power must be greater than zero.');
  if (!voltage || voltage <= 0) throw new Error('Voltage must be greater than zero.');
  return power / voltage;
}

function voltageFromWattsLaw(power, current) {
  if (!power || power <= 0) throw new Error('Power must be greater than zero.');
  if (!current || current <= 0) throw new Error('Current must be greater than zero.');
  return power / current;
}

// --- URL Encoder/Decoder ---

// Percent-encodes text per RFC 3986. mode 'component' treats the text as a
// single value in isolation (a query param, a path segment) and escapes
// reserved delimiters too; 'full' treats it as an already-structured URI and
// leaves delimiters like : / ? & = # intact.
function urlEncode(text, mode = 'component') {
  return mode === 'full' ? encodeURI(text) : encodeURIComponent(text);
}

// Reverses urlEncode. Malformed %XX sequences or percent-decoded bytes that
// aren't valid UTF-8 throw a native URIError - rethrown here with a clearer,
// tool-specific message.
function urlDecode(text, mode = 'component') {
  try {
    return mode === 'full' ? decodeURI(text) : decodeURIComponent(text);
  } catch (err) {
    throw new Error('Invalid percent-encoding: the text contains a malformed %XX sequence or decodes to invalid UTF-8.');
  }
}

// --- JWT decoder ---

// Base64URL (RFC 4648 sec.5): standard Base64 with '+'/'/' swapped for
// '-'/'_' and padding stripped; re-pad to a multiple of 4 before decoding.
function base64UrlDecode(str) {
  if (!/^[A-Za-z0-9_-]*$/.test(str)) {
    throw new Error('contains characters outside the Base64URL alphabet');
  }
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);

  if (typeof Buffer !== 'undefined') {
    return Buffer.from(padded, 'base64').toString('utf8');
  }
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function decodeJwtSegment(rawSegment, label) {
  let decoded;
  try {
    decoded = base64UrlDecode(rawSegment);
  } catch (err) {
    throw new Error(`Could not decode the ${label} segment: ${err.message}.`);
  }
  try {
    return JSON.parse(decoded);
  } catch {
    throw new Error(`The ${label} segment did not decode to valid JSON.`);
  }
}

// Decodes (does not verify) a JWT's header/payload and evaluates exp/nbf
// against the current time. A 2-segment token (no signature, e.g. "alg":
// "none") is treated as a valid, if insecure, edge case per RFC 7519.
function decodeJwt(token) {
  const trimmed = token.trim().replace(/^Bearer\s+/i, '');
  const segments = trimmed.split('.');

  if (segments.length !== 2 && segments.length !== 3) {
    throw new Error('A JWT must have 2 or 3 period-separated segments (header.payload[.signature]).');
  }

  const header = decodeJwtSegment(segments[0], 'header');
  const payload = decodeJwtSegment(segments[1], 'payload');
  const signature = segments.length === 3 ? segments[2] : null;

  const now = Date.now() / 1000;
  const claims = {};

  for (const name of ['iat', 'exp', 'nbf']) {
    if (payload[name] === undefined) continue;
    if (typeof payload[name] !== 'number' || Number.isNaN(payload[name])) {
      claims[`${name}Warning`] = `${name} is present but not a valid number.`;
      continue;
    }
    claims[`${name}Date`] = new Date(payload[name] * 1000).toISOString();
  }

  claims.isExpired = typeof payload.exp === 'number' && !Number.isNaN(payload.exp) && payload.exp < now;
  claims.isNotYetValid = typeof payload.nbf === 'number' && !Number.isNaN(payload.nbf) && payload.nbf > now;
  claims.hasNoneAlg = typeof header.alg === 'string' && header.alg.toLowerCase() === 'none';

  return { header, payload, signature, claims };
}
// --- UUID generator ---

const UUID_MAX_QUANTITY = 10000;

function bytesToHex(bytes) {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function generateUuidV4() {
  return crypto.randomUUID();
}

// RFC 9562 v1: a 60-bit timestamp (100ns intervals since the Gregorian epoch,
// 1582-10-15T00:00:00Z) plus a 14-bit clock sequence and a 48-bit node id.
// There's no stable network node id available in this browser/no-backend
// context, so the node id is randomly generated with its multicast bit set,
// which RFC 9562 explicitly permits as a stand-in for a real MAC address.
function generateUuidV1() {
  const GREGORIAN_OFFSET_100NS = 122192928000000000n;
  const timestamp100ns = BigInt(Date.now()) * 10000n + GREGORIAN_OFFSET_100NS;

  const timeLow = timestamp100ns & 0xffffffffn;
  const timeMid = (timestamp100ns >> 32n) & 0xffffn;
  const timeHi = (timestamp100ns >> 48n) & 0x0fffn;

  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);
  const clockSeq = ((BigInt(randomBytes[0]) << 8n) | BigInt(randomBytes[1])) & 0x3fffn;

  const node = randomBytes.slice(2, 8);
  node[0] |= 0x01; // multicast bit set - signals this isn't a real registered node id

  const timeLowHex = timeLow.toString(16).padStart(8, '0');
  const timeMidHex = timeMid.toString(16).padStart(4, '0');
  const timeHiAndVersionHex = (0x1000n | timeHi).toString(16).padStart(4, '0');
  const clockSeqHex = (0x8000n | clockSeq).toString(16).padStart(4, '0');
  const nodeHex = bytesToHex(node);

  return `${timeLowHex}-${timeMidHex}-${timeHiAndVersionHex}-${clockSeqHex}-${nodeHex}`;
}

// RFC 9562 v7: a 48-bit Unix millisecond timestamp, a 4-bit version, a 12-bit
// random rand_a, a 2-bit variant, and a 62-bit random rand_b - built with
// BigInt throughout since native bitwise operators truncate to 32 bits and
// the timestamp alone already exceeds that.
function generateUuidV7() {
  const randomBytes = new Uint8Array(10);
  crypto.getRandomValues(randomBytes);

  let value = BigInt(Date.now()) & 0xffffffffffffn;
  value = (value << 4n) | 0x7n;

  const randA = ((BigInt(randomBytes[0]) << 8n) | BigInt(randomBytes[1])) & 0xfffn;
  value = (value << 12n) | randA;

  value = (value << 2n) | 0x2n; // variant bits '10'

  let randB = 0n;
  for (let i = 2; i < 10; i++) randB = (randB << 8n) | BigInt(randomBytes[i]);
  randB &= (1n << 62n) - 1n;
  value = (value << 62n) | randB;

  const hex = value.toString(16).padStart(32, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Quantity of 0, negative, or non-integer is rejected outright, but an
// overly large request is clamped to UUID_MAX_QUANTITY rather than rejected -
// "generate as many as possible" is a reasonable ask that should still
// produce output. Callers can compare the requested quantity against the
// returned array's length to know whether clamping happened.
function generateUuids(version, quantity, uppercase = false, format = 'hyphenated') {
  if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantity must be a positive whole number.');
  }

  const generators = { v1: generateUuidV1, v4: generateUuidV4, v7: generateUuidV7 };
  const generate = generators[version];
  if (!generate) throw new Error('Unknown UUID version.');

  const formatters = {
    hyphenated: u => u,
    none: u => u.replace(/-/g, ''),
    braced: u => `{${u}}`,
  };
  const applyFormat = formatters[format];
  if (!applyFormat) throw new Error('Unknown output format.');

  const clampedQuantity = Math.min(quantity, UUID_MAX_QUANTITY);
  const uuids = Array.from({ length: clampedQuantity }, generate);
  const cased = uppercase ? uuids.map(u => u.toUpperCase()) : uuids;
  return cased.map(applyFormat);
}
// --- JSON Formatter, Minifier & YAML Converter ---

// Scans outside of quoted strings so a "//" or "/*" inside a JSON string
// value (e.g. a URL) doesn't trigger a false "comments aren't allowed" hint.
function containsJsonComments(input) {
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (inString) {
      if (escapeNext) { escapeNext = false; continue; }
      if (ch === '\\') { escapeNext = true; continue; }
      if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '/' && (input[i + 1] === '/' || input[i + 1] === '*')) return true;
  }
  return false;
}

// Given a 0-based character offset into `input`, returns the 1-based line
// number, 1-based column number, and the (possibly truncated) text of that
// line - used to turn a raw JSON.parse() error position into something a
// developer can actually jump to.
function describeJsonPosition(input, offset) {
  const before = input.slice(0, offset);
  const lastNewline = before.lastIndexOf('\n');
  const line = (before.match(/\n/g) || []).length + 1;
  const column = offset - lastNewline;
  const lineEnd = input.indexOf('\n', offset);
  const lineText = input.slice(lastNewline + 1, lineEnd === -1 ? input.length : lineEnd);
  const truncated = lineText.length > 120 ? `${lineText.slice(0, 120)}...` : lineText;
  return { line, column, lineText: truncated };
}

function parseJsonOrThrow(input) {
  if (input == null || input.trim() === '') {
    throw new Error('Input is empty. Enter some JSON.');
  }
  try {
    return JSON.parse(input);
  } catch (err) {
    if (containsJsonComments(input)) {
      throw new Error('JSON does not support comments (// or /* */). Remove them and try again.');
    }
    const positionMatch = err.message.match(/position (\d+)/);
    if (positionMatch) {
      const offset = parseInt(positionMatch[1], 10);
      const { line, column, lineText } = describeJsonPosition(input, offset);
      throw new Error(`Invalid JSON at line ${line}, column ${column}: ${err.message} — ${lineText}`);
    }
    throw new Error(`Invalid JSON: ${err.message}`);
  }
}

function formatJson(input, indentWidth = 2) {
  return JSON.stringify(parseJsonOrThrow(input), null, indentWidth);
}

function minifyJson(input) {
  return JSON.stringify(parseJsonOrThrow(input));
}

function validateJson(input) {
  parseJsonOrThrow(input);
  return { valid: true };
}

function isYamlContainer(value) {
  return value !== null && typeof value === 'object';
}

function isYamlEmptyContainer(value) {
  return Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;
}

// Per the issue's simplified quoting rule: over-quoting is always safe, so
// bias toward quoting anything that could otherwise be misread as another
// YAML type or a structural token.
function yamlScalarNeedsQuoting(str) {
  if (str === '') return true;
  if (/[:#]/.test(str)) return true;
  if (/^[-?&*!|>%@`]/.test(str)) return true;
  if (/^(true|false|null|yes|no|on|off)$/i.test(str)) return true;
  if (/^[+-]?(\d+(\.\d+)?|\.\d+)([eE][+-]?\d+)?$/.test(str)) return true;
  if (/^\s|\s$/.test(str)) return true;
  return false;
}

function yamlQuoteString(str) {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
  return `"${escaped}"`;
}

function yamlScalarString(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    return yamlScalarNeedsQuoting(value) ? yamlQuoteString(value) : value;
  }
  throw new Error('Unsupported value type for YAML output.');
}

function yamlInlineContainer(value) {
  if (Array.isArray(value)) return '[]';
  return '{}';
}

// Emits `value` (an object or non-empty array) as a block of YAML lines at
// the given indent level (2 spaces per level). Recursive, but realistic JSON
// nesting depths (a few hundred levels) are well within JS's default call
// stack, per the issue's stated scope.
function emitYamlLines(value, indent) {
  const pad = '  '.repeat(indent);
  const lines = [];

  if (Array.isArray(value)) {
    value.forEach(item => {
      if (isYamlContainer(item) && !isYamlEmptyContainer(item)) {
        const childLines = emitYamlLines(item, indent + 1);
        const childPad = '  '.repeat(indent + 1);
        lines.push(`${pad}- ${childLines[0].slice(childPad.length)}`);
        for (let i = 1; i < childLines.length; i++) lines.push(childLines[i]);
      } else if (isYamlContainer(item)) {
        lines.push(`${pad}- ${yamlInlineContainer(item)}`);
      } else {
        lines.push(`${pad}- ${yamlScalarString(item)}`);
      }
    });
    return lines;
  }

  Object.keys(value).forEach(key => {
    const v = value[key];
    const keyStr = yamlScalarString(key);
    if (isYamlContainer(v) && !isYamlEmptyContainer(v)) {
      lines.push(`${pad}${keyStr}:`);
      lines.push(...emitYamlLines(v, indent + 1));
    } else if (isYamlContainer(v)) {
      lines.push(`${pad}${keyStr}: ${yamlInlineContainer(v)}`);
    } else {
      lines.push(`${pad}${keyStr}: ${yamlScalarString(v)}`);
    }
  });
  return lines;
}

function jsonToYaml(input) {
  const parsed = parseJsonOrThrow(input);
  if (isYamlContainer(parsed) && !isYamlEmptyContainer(parsed)) {
    return emitYamlLines(parsed, 0).join('\n') + '\n';
  }
  if (isYamlContainer(parsed)) return `${yamlInlineContainer(parsed)}\n`;
  return `${yamlScalarString(parsed)}\n`;
}

// --- Hand-written YAML subset parser (block style only - see issue #108) ---

// Strips a trailing "# comment", ignoring '#' inside single/double-quoted
// strings so e.g. a URL fragment or literal '#' in a quoted value survives.
function stripYamlComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inSingle) {
      if (ch === "'") {
        if (line[i + 1] === "'") { i++; continue; }
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '\\') { i++; continue; }
      if (ch === '"') inDouble = false;
      continue;
    }
    if (ch === "'") { inSingle = true; continue; }
    if (ch === '"') { inDouble = true; continue; }
    if (ch === '#' && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

function tokenizeYaml(input) {
  const rawLines = input.split(/\r\n|\r|\n/);
  const lines = [];
  rawLines.forEach((raw, idx) => {
    const lineNum = idx + 1;
    if (raw.trim() === '') return;

    const leading = /^[ \t]*/.exec(raw)[0];
    if (leading.includes('\t')) {
      throw new Error(`Line ${lineNum}: tabs are not supported for YAML indentation; use spaces.`);
    }

    const stripped = stripYamlComment(raw);
    if (stripped.trim() === '') return;

    const indentMatch = /^ */.exec(stripped)[0];
    const content = stripped.slice(indentMatch.length).replace(/\s+$/, '');
    if (content === '' || content === '---' || content === '...') return;

    lines.push({ indent: indentMatch.length, content, lineNum });
  });
  return lines;
}

function isYamlSequenceItem(content) {
  return content === '-' || content.startsWith('- ');
}

// Finds the colon that separates a mapping key from its value: only a colon
// followed by a space or end-of-line counts, so plain scalars containing a
// colon (like a URL) don't get misread as "key: value".
function findYamlMappingColon(content) {
  const consumeQuoted = (quote) => {
    let i = 1;
    while (i < content.length) {
      if (quote === '"' && content[i] === '\\') { i += 2; continue; }
      if (content[i] === quote) {
        if (quote === "'" && content[i + 1] === "'") { i += 2; continue; }
        return i + 1;
      }
      i++;
    }
    return -1;
  };

  let start = 0;
  if (content[0] === '"' || content[0] === "'") {
    const afterQuote = consumeQuoted(content[0]);
    if (afterQuote === -1) return -1;
    start = afterQuote;
    while (content[start] === ' ') start++;
    return content[start] === ':' && (start + 1 === content.length || content[start + 1] === ' ') ? start : -1;
  }

  for (let i = start; i < content.length; i++) {
    if (content[i] === ':' && (i + 1 === content.length || content[i + 1] === ' ')) return i;
  }
  return -1;
}

function splitYamlMappingLine(content) {
  const idx = findYamlMappingColon(content);
  if (idx === -1) return null;
  return { rawKey: content.slice(0, idx).trim(), rawValue: content.slice(idx + 1).trim() };
}

function checkYamlUnsupportedToken(token, lineNum) {
  const c = token[0];
  if (c === '"' || c === "'") return;
  // Empty flow collections are the one flow-style exception: they're the only
  // way jsonToYaml can represent an empty array/object, and there's no
  // ambiguity to mis-parse since they carry no content.
  if (token === '[]' || token === '{}') return;
  if (c === '{' || c === '[') {
    throw new Error(`Line ${lineNum}: flow style ("{...}" / "[...]") is not supported; use block style.`);
  }
  if (c === '&') throw new Error(`Line ${lineNum}: anchors ("&") are not supported.`);
  if (c === '*') throw new Error(`Line ${lineNum}: aliases ("*") are not supported.`);
  if (c === '!') throw new Error(`Line ${lineNum}: tags ("!") are not supported.`);
  if (c === '|' || c === '>') {
    throw new Error(`Line ${lineNum}: multi-line block scalars ("|" / ">") are not supported.`);
  }
}

function parseYamlDoubleQuoted(content, lineNum) {
  if (content.length < 2 || content[content.length - 1] !== '"') {
    throw new Error(`Line ${lineNum}: unterminated double-quoted string.`);
  }
  const inner = content.slice(1, -1);
  const escapes = { n: '\n', t: '\t', r: '\r', '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', '0': '\0' };
  let result = '';
  for (let i = 0; i < inner.length; i++) {
    if (inner[i] === '\\' && i + 1 < inner.length) {
      const next = inner[i + 1];
      result += next in escapes ? escapes[next] : next;
      i++;
    } else {
      result += inner[i];
    }
  }
  return result;
}

function parseYamlSingleQuoted(content, lineNum) {
  if (content.length < 2 || content[content.length - 1] !== "'") {
    throw new Error(`Line ${lineNum}: unterminated single-quoted string.`);
  }
  return content.slice(1, -1).replace(/''/g, "'");
}

function parseYamlScalarValue(content, lineNum) {
  if (content[0] === '"') return parseYamlDoubleQuoted(content, lineNum);
  if (content[0] === "'") return parseYamlSingleQuoted(content, lineNum);
  if (content === '[]') return [];
  if (content === '{}') return {};
  if (content === '~' || /^null$/i.test(content)) return null;
  if (/^true$/i.test(content)) return true;
  if (/^false$/i.test(content)) return false;
  if (/^[+-]?\d+$/.test(content)) return parseInt(content, 10);
  if (/^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/.test(content) && /[.eE]/.test(content)) {
    return parseFloat(content);
  }
  return content;
}

function parseYamlScalarToken(content, lineNum) {
  checkYamlUnsupportedToken(content, lineNum);
  return parseYamlScalarValue(content, lineNum);
}

function parseYamlKeyString(rawKey, lineNum) {
  if (rawKey === '') throw new Error(`Line ${lineNum}: missing mapping key before ":".`);
  checkYamlUnsupportedToken(rawKey, lineNum);
  if (rawKey[0] === '"') return parseYamlDoubleQuoted(rawKey, lineNum);
  if (rawKey[0] === "'") return parseYamlSingleQuoted(rawKey, lineNum);
  return rawKey;
}

// lines/pos are shared mutable state threaded through the recursive-descent
// parser below: `pos.i` is the read cursor into the flat, pre-tokenized line
// list, advanced as each block/mapping/sequence/scalar consumes its lines.
function parseYamlBlock(lines, pos, indent) {
  const first = lines[pos.i];
  if (first.indent !== indent) {
    throw new Error(`Line ${first.lineNum}: unexpected indentation (expected ${indent} spaces).`);
  }
  if (isYamlSequenceItem(first.content)) return parseYamlSequenceBlock(lines, pos, indent);
  if (splitYamlMappingLine(first.content)) return parseYamlMappingBlock(lines, pos, indent);

  pos.i++;
  return parseYamlScalarToken(first.content, first.lineNum);
}

function parseYamlSequenceBlock(lines, pos, indent) {
  const result = [];
  while (pos.i < lines.length && lines[pos.i].indent === indent && isYamlSequenceItem(lines[pos.i].content)) {
    const line = lines[pos.i];
    const rest = line.content === '-' ? '' : line.content.slice(2);

    if (rest.trim() === '') {
      pos.i++;
      if (pos.i < lines.length && lines[pos.i].indent > indent) {
        result.push(parseYamlBlock(lines, pos, lines[pos.i].indent));
      } else {
        result.push(null);
      }
      continue;
    }

    // Rewrite "- key: value" / "- - nested" as a synthetic line one indent
    // level in, so the generic mapping/sequence logic above can parse it
    // (and any further real lines at that indent continue the same block).
    lines[pos.i] = { indent: indent + 2, content: rest, lineNum: line.lineNum };
    if (isYamlSequenceItem(rest) || splitYamlMappingLine(rest)) {
      result.push(parseYamlBlock(lines, pos, indent + 2));
    } else {
      pos.i++;
      result.push(parseYamlScalarToken(rest, line.lineNum));
    }
  }
  return result;
}

function parseYamlMappingBlock(lines, pos, indent) {
  const result = {};
  while (pos.i < lines.length && lines[pos.i].indent === indent && !isYamlSequenceItem(lines[pos.i].content)) {
    const line = lines[pos.i];
    const kv = splitYamlMappingLine(line.content);
    if (!kv) throw new Error(`Line ${line.lineNum}: expected a "key: value" mapping entry.`);

    const key = parseYamlKeyString(kv.rawKey, line.lineNum);
    if (kv.rawValue === '') {
      pos.i++;
      if (pos.i < lines.length && lines[pos.i].indent > indent) {
        result[key] = parseYamlBlock(lines, pos, lines[pos.i].indent);
      } else {
        result[key] = null;
      }
    } else {
      pos.i++;
      result[key] = parseYamlScalarToken(kv.rawValue, line.lineNum);
    }
  }
  return result;
}

function parseYamlDocument(input) {
  const lines = tokenizeYaml(input);
  if (lines.length === 0) {
    throw new Error('No YAML content found (input may be empty or only comments).');
  }
  if (lines[0].indent !== 0) {
    throw new Error(`Line ${lines[0].lineNum}: top-level content must not be indented.`);
  }

  const pos = { i: 0 };
  const value = parseYamlBlock(lines, pos, 0);
  if (pos.i !== lines.length) {
    throw new Error(`Line ${lines[pos.i].lineNum}: unexpected content - check indentation.`);
  }
  return value;
}

function yamlToJson(input) {
  if (input == null || input.trim() === '') {
    throw new Error('Input is empty. Enter some YAML.');
  }
  return JSON.stringify(parseYamlDocument(input));
}
// --- Cron expression generator & translator ---

const CRON_MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const CRON_MONTH_FULL_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// Only 7 names because day-of-week runs 0-7 with both 0 and 7 meaning Sunday;
// values are normalized to 0 before ever being looked up here.
const CRON_DOW_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const CRON_DOW_FULL_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const CRON_MACROS = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

// Macros with no 5-field equivalent - flagged separately so the UI can
// explain why translation can't reduce them to a builder-editable schedule.
const CRON_UNSUPPORTED_MACROS = {
  '@reboot': 'Runs once at system startup. This is a nonstandard macro with no 5-field cron equivalent, and is not supported by every cron implementation.',
};

// Resolves a single range/list token (a bare number or a name like "MON")
// to its numeric value, validating it against [min, max].
function parseCronNamedOrNumber(token, min, max, names) {
  if (/^\d+$/.test(token)) {
    const value = parseInt(token, 10);
    if (value < min || value > max) {
      throw new Error(`"${value}" is out of range (expected ${min}-${max}).`);
    }
    return value;
  }
  if (names) {
    const idx = names.indexOf(token.toUpperCase());
    if (idx !== -1) return idx + min;
  }
  throw new Error(`"${token}" is not a valid value.`);
}

// Expands one cron field (e.g. "*/15", "1,15,30", "9-17", "MON-FRI") into a
// sorted array of the distinct numeric values it matches. Throws on any
// malformed syntax or out-of-range value.
function parseCronField(fieldStr, min, max, names) {
  if (typeof fieldStr !== 'string' || fieldStr.trim() === '') {
    throw new Error('Field is empty.');
  }
  if (/\s/.test(fieldStr)) {
    throw new Error(`"${fieldStr}" must not contain spaces.`);
  }

  // Day-of-week is the only field where two different numbers (0 and 7)
  // mean the same day, so it's the only one that needs post-hoc folding.
  const isDayOfWeek = min === 0 && max === 7;
  const parts = fieldStr.split(',');
  const values = new Set();

  for (const part of parts) {
    if (part === '') {
      throw new Error(`"${fieldStr}" has an empty value (check for a stray or doubled comma).`);
    }

    let base = part;
    let step = null;
    if (part.includes('/')) {
      const slashPieces = part.split('/');
      if (slashPieces.length !== 2 || slashPieces[0] === '' || slashPieces[1] === '') {
        throw new Error(`"${part}" is not a valid step expression.`);
      }
      [base] = slashPieces;
      const stepStr = slashPieces[1];
      if (!/^\d+$/.test(stepStr) || parseInt(stepStr, 10) === 0) {
        throw new Error(`Step "${stepStr}" in "${part}" must be a whole number greater than zero.`);
      }
      step = parseInt(stepStr, 10);
    }

    let rangeStart;
    let rangeEnd;
    if (base === '*') {
      rangeStart = min;
      rangeEnd = max;
    } else if (base.includes('-')) {
      const dashPieces = base.split('-');
      if (dashPieces.length !== 2 || dashPieces[0] === '' || dashPieces[1] === '') {
        throw new Error(`"${base}" is not a valid range.`);
      }
      rangeStart = parseCronNamedOrNumber(dashPieces[0], min, max, names);
      rangeEnd = parseCronNamedOrNumber(dashPieces[1], min, max, names);
      if (rangeStart > rangeEnd) {
        throw new Error(`"${base}" is a reversed range (start must not be greater than end).`);
      }
    } else {
      const single = parseCronNamedOrNumber(base, min, max, names);
      rangeStart = single;
      rangeEnd = step !== null ? max : single;
    }

    const effectiveStep = step === null ? 1 : step;
    for (let v = rangeStart; v <= rangeEnd; v += effectiveStep) {
      values.add(isDayOfWeek && v === 7 ? 0 : v);
    }
  }

  return [...values].sort((a, b) => a - b);
}

function parseCronFieldOrThrow(label, fieldStr, min, max, names) {
  try {
    return parseCronField(fieldStr, min, max, names);
  } catch (err) {
    throw new Error(`Invalid ${label} field "${fieldStr}": ${err.message}`);
  }
}

// Classifies a field's raw syntax (not its expanded values) so the
// description logic can phrase steps/ranges/lists differently.
function classifyCronField(fieldStr) {
  if (fieldStr.includes('/')) {
    const [base, stepStr] = fieldStr.split('/');
    return { type: 'step', base, step: parseInt(stepStr, 10) };
  }
  if (fieldStr === '*') return { type: 'all' };
  if (fieldStr.includes(',')) return { type: 'list' };
  if (fieldStr.includes('-')) {
    const [start, end] = fieldStr.split('-');
    return { type: 'range', start, end };
  }
  return { type: 'single', value: fieldStr };
}

function formatEnglishList(items) {
  if (items.length === 1) return `${items[0]}`;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function describeCronMinuteRepeat(minuteStr, minuteClass) {
  if (minuteClass.type === 'all') return 'Every minute';
  if (minuteClass.type === 'step') {
    if (minuteClass.base === '*') return `Every ${minuteClass.step} minutes`;
    if (minuteClass.base.includes('-')) {
      const [s, e] = minuteClass.base.split('-');
      return `Every ${minuteClass.step} minutes, from minute ${s} through ${e}`;
    }
    return `Every ${minuteClass.step} minutes, starting at minute ${minuteClass.base}`;
  }
  if (minuteClass.type === 'range') {
    return `Every minute from ${minuteClass.start} through ${minuteClass.end}`;
  }
  const values = parseCronField(minuteStr, 0, 59);
  return `At minutes ${formatEnglishList(values)}`;
}

// The minute and hour fields are described jointly ("At 09:00", "Every 15
// minutes, between 09:00 and 17:59") rather than as two independent
// sentences, since that's how these schedules actually read in English.
function describeCronTime(minuteStr, hourStr) {
  const pad2 = (n) => String(n).padStart(2, '0');
  const minuteClass = classifyCronField(minuteStr);
  const hourClass = classifyCronField(hourStr);

  if (minuteClass.type === 'single' && hourClass.type === 'single') {
    const minute = parseCronNamedOrNumber(minuteClass.value, 0, 59);
    const hour = parseCronNamedOrNumber(hourClass.value, 0, 23);
    return `At ${pad2(hour)}:${pad2(minute)}`;
  }

  if (minuteClass.type === 'single' && hourClass.type !== 'single') {
    const minute = parseCronNamedOrNumber(minuteClass.value, 0, 59);
    if (hourClass.type === 'all') {
      return `At minute ${minute} past every hour`;
    }
    const hourValues = parseCronField(hourStr, 0, 23);
    return `At minute ${minute} past hours ${formatEnglishList(hourValues)}`;
  }

  const minuteDesc = describeCronMinuteRepeat(minuteStr, minuteClass);

  if (hourClass.type === 'all') {
    return minuteDesc;
  }

  const hourValues = parseCronField(hourStr, 0, 23);
  const hourMin = Math.min(...hourValues);
  const hourMax = Math.max(...hourValues);
  return `${minuteDesc}, between ${pad2(hourMin)}:00 and ${pad2(hourMax)}:59`;
}

function describeCronDayOfMonth(domStr) {
  const cls = classifyCronField(domStr);
  if (cls.type === 'all') return { core: 'every day of the month' };
  if (cls.type === 'single') return { core: `day ${cls.value} of the month` };
  if (cls.type === 'range') return { core: `days ${cls.start} through ${cls.end} of the month` };
  if (cls.type === 'list') {
    const values = parseCronField(domStr, 1, 31);
    return { core: `days ${formatEnglishList(values)} of the month` };
  }
  if (cls.base === '*') return { core: `every ${cls.step} days of the month` };
  if (cls.base.includes('-')) {
    const [s, e] = cls.base.split('-');
    return { core: `every ${cls.step} days of the month, from day ${s} through day ${e}` };
  }
  return { core: `every ${cls.step} days of the month, starting on day ${cls.base}` };
}

// Cron doesn't validate that a day-of-month value actually exists in every
// month (e.g. 31 in a schedule that also runs in February), so we describe
// that accurately instead of rejecting it.
function domHighDayNote(values) {
  if (values.includes(31)) return 'day 31 does not occur in every month';
  if (values.includes(30)) return 'day 30 does not occur in February';
  if (values.includes(29)) return 'day 29 only occurs in February during leap years';
  return null;
}

function describeCronMonth(monthStr) {
  const cls = classifyCronField(monthStr);
  const toName = (tok) => CRON_MONTH_FULL_NAMES[parseCronNamedOrNumber(tok, 1, 12, CRON_MONTH_NAMES) - 1];
  if (cls.type === 'all') return { core: 'every month' };
  if (cls.type === 'single') return { core: toName(cls.value) };
  if (cls.type === 'range') return { core: `${toName(cls.start)} through ${toName(cls.end)}` };
  if (cls.type === 'list') {
    const values = parseCronField(monthStr, 1, 12, CRON_MONTH_NAMES);
    return { core: formatEnglishList(values.map((v) => CRON_MONTH_FULL_NAMES[v - 1])) };
  }
  if (cls.base === '*') return { core: `every ${cls.step} months` };
  if (cls.base.includes('-')) {
    const [s, e] = cls.base.split('-');
    return { core: `every ${cls.step} months, from ${toName(s)} through ${toName(e)}` };
  }
  return { core: `every ${cls.step} months, starting in ${toName(cls.base)}` };
}

// `needsOn` distinguishes phrasing like "on Monday, Wednesday, and Friday"
// (a list/single day) from "Monday through Friday" (a range), which reads
// naturally without a leading "on".
function describeCronDayOfWeek(dowStr) {
  const cls = classifyCronField(dowStr);
  const toName = (tok) => {
    let v = parseCronNamedOrNumber(tok, 0, 7, CRON_DOW_NAMES);
    if (v === 7) v = 0;
    return CRON_DOW_FULL_NAMES[v];
  };
  if (cls.type === 'all') return { core: 'every day of the week', needsOn: false };
  if (cls.type === 'single') return { core: toName(cls.value), needsOn: true };
  if (cls.type === 'range') return { core: `${toName(cls.start)} through ${toName(cls.end)}`, needsOn: false };
  if (cls.type === 'list') {
    const values = parseCronField(dowStr, 0, 7, CRON_DOW_NAMES);
    return { core: formatEnglishList(values.map((v) => CRON_DOW_FULL_NAMES[v])), needsOn: true };
  }
  if (cls.base === '*') return { core: `every ${cls.step} days of the week`, needsOn: true };
  if (cls.base.includes('-')) {
    const [s, e] = cls.base.split('-');
    return { core: `every ${cls.step} days of the week, from ${toName(s)} through ${toName(e)}`, needsOn: true };
  }
  return { core: `every ${cls.step} days of the week, starting on ${toName(cls.base)}`, needsOn: true };
}

// Thin dispatcher matching the field-by-field shape other consumers expect;
// the minute/hour fields are described jointly via describeCronTime instead,
// since they read as one clause ("At 09:00") rather than two.
function describeCronField(fieldStr, kind) {
  switch (kind) {
    case 'minute':
      return describeCronMinuteRepeat(fieldStr, classifyCronField(fieldStr));
    case 'dayOfMonth':
      return describeCronDayOfMonth(fieldStr).core;
    case 'month':
      return describeCronMonth(fieldStr).core;
    case 'dayOfWeek':
      return describeCronDayOfWeek(fieldStr).core;
    default:
      throw new Error(`Unknown cron field kind "${kind}".`);
  }
}

// Expands a recognized @macro to its 5-field form. Returns the (trimmed)
// input unchanged if it isn't a macro, and null for macros like @reboot that
// have no 5-field equivalent. Throws for an unrecognized @macro.
function expandCronMacro(cronString) {
  if (typeof cronString !== 'string') throw new Error('Enter a cron expression.');
  const trimmed = cronString.trim();
  if (!trimmed.startsWith('@')) return trimmed;
  const key = trimmed.toLowerCase();
  if (CRON_UNSUPPORTED_MACROS[key]) return null;
  if (CRON_MACROS[key]) return CRON_MACROS[key];
  throw new Error(`"${trimmed}" is not a recognized cron macro.`);
}

// Parses and validates a 5-field cron expression (or @macro) and composes a
// plain-English description. When both day-of-month and day-of-week are
// restricted, cron fires on EITHER match (OR semantics), which is called
// out explicitly since it's a common point of confusion.
function describeCron(cronString) {
  if (typeof cronString !== 'string' || cronString.trim() === '') {
    throw new Error('Enter a cron expression.');
  }
  const trimmed = cronString.trim();

  if (trimmed.startsWith('@')) {
    const key = trimmed.toLowerCase();
    if (CRON_UNSUPPORTED_MACROS[key]) return CRON_UNSUPPORTED_MACROS[key];
    if (!CRON_MACROS[key]) {
      throw new Error(`"${trimmed}" is not a recognized cron macro.`);
    }
    return describeCron(CRON_MACROS[key]);
  }

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`A cron expression needs exactly 5 space-separated fields (minute hour day-of-month month day-of-week), or a recognized @macro; got ${fields.length}.`);
  }

  const [minuteStr, hourStr, domStr, monthStr, dowStr] = fields;

  parseCronFieldOrThrow('minute', minuteStr, 0, 59);
  parseCronFieldOrThrow('hour', hourStr, 0, 23);
  const domValues = parseCronFieldOrThrow('day-of-month', domStr, 1, 31);
  parseCronFieldOrThrow('month', monthStr, 1, 12, CRON_MONTH_NAMES);
  parseCronFieldOrThrow('day-of-week', dowStr, 0, 7, CRON_DOW_NAMES);

  const domRestricted = domStr !== '*';
  const dowRestricted = dowStr !== '*';

  const fragments = [describeCronTime(minuteStr, hourStr)];

  if (domRestricted && dowRestricted) {
    const domInfo = describeCronDayOfMonth(domStr);
    const dowInfo = describeCronDayOfWeek(dowStr);
    fragments.push(`on ${domInfo.core}, or on ${dowInfo.core}`);
  } else if (domRestricted) {
    fragments.push(`on ${describeCronDayOfMonth(domStr).core}`);
  } else if (dowRestricted) {
    const dowInfo = describeCronDayOfWeek(dowStr);
    fragments.push(dowInfo.needsOn ? `on ${dowInfo.core}` : dowInfo.core);
  }

  if (monthStr !== '*') {
    fragments.push(`only in ${describeCronMonth(monthStr).core}`);
  }

  let sentence = fragments.filter(Boolean).join(', ');

  if (domRestricted) {
    const note = domHighDayNote(domValues);
    if (note) sentence += ` (${note})`;
  }

  return sentence;
}

// Builder mode just validates and joins the 5 fields - reuse describeCron()
// on the result to get its description, so both modes share one description
// engine instead of two.
function buildCronExpression({ minute, hour, dayOfMonth, month, dayOfWeek }) {
  parseCronFieldOrThrow('minute', minute, 0, 59);
  parseCronFieldOrThrow('hour', hour, 0, 23);
  parseCronFieldOrThrow('day-of-month', dayOfMonth, 1, 31);
  parseCronFieldOrThrow('month', month, 1, 12, CRON_MONTH_NAMES);
  parseCronFieldOrThrow('day-of-week', dayOfWeek, 0, 7, CRON_DOW_NAMES);
  return [minute, hour, dayOfMonth, month, dayOfWeek].join(' ');
}

// Upper bound on how far into the future nextCronRunTimes() will search for
// a match, in minutes (~4 years). Guards against a pathological expression
// (e.g. "0 0 30 2 *", which never fires since February never has a 30th)
// spinning forever, and against runaway searches for a huge `count`.
const CRON_MAX_SEARCH_MINUTES = 4 * 365 * 24 * 60;

// Walks forward minute-by-minute from `fromDate` (rounding up to the next
// whole minute first) and returns the next `count` Date objects at which
// `cronString` fires. Reuses the same field parsing as describeCron(), and
// applies the same day-of-month/day-of-week OR semantics: when both fields
// are restricted, a candidate matches if EITHER matches; when only one is
// restricted, that one alone must match.
function nextCronRunTimes(cronString, count, fromDate = new Date()) {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('Number of run times must be a positive integer.');
  }
  if (typeof cronString !== 'string' || cronString.trim() === '') {
    throw new Error('Enter a cron expression.');
  }
  const trimmed = cronString.trim();

  const expanded = expandCronMacro(trimmed);
  if (expanded === null) {
    throw new Error(`"${trimmed}" has no fixed schedule to compute upcoming run times for.`);
  }

  const fields = expanded.split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`A cron expression needs exactly 5 space-separated fields (minute hour day-of-month month day-of-week), or a recognized @macro; got ${fields.length}.`);
  }
  const [minuteStr, hourStr, domStr, monthStr, dowStr] = fields;

  const minuteValues = new Set(parseCronFieldOrThrow('minute', minuteStr, 0, 59));
  const hourValues = new Set(parseCronFieldOrThrow('hour', hourStr, 0, 23));
  const domValues = new Set(parseCronFieldOrThrow('day-of-month', domStr, 1, 31));
  const monthValues = new Set(parseCronFieldOrThrow('month', monthStr, 1, 12, CRON_MONTH_NAMES));
  const dowValues = new Set(parseCronFieldOrThrow('day-of-week', dowStr, 0, 7, CRON_DOW_NAMES));

  const domRestricted = domStr !== '*';
  const dowRestricted = dowStr !== '*';

  const candidate = new Date(fromDate.getTime());
  candidate.setSeconds(0, 0);
  if (candidate.getTime() < fromDate.getTime()) {
    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  const results = [];
  for (let steps = 0; steps <= CRON_MAX_SEARCH_MINUTES && results.length < count; steps += 1) {
    const domMatch = domValues.has(candidate.getDate());
    const dowMatch = dowValues.has(candidate.getDay());
    const dayMatches = domRestricted && dowRestricted
      ? domMatch || dowMatch
      : domRestricted
        ? domMatch
        : dowRestricted
          ? dowMatch
          : true;

    if (
      minuteValues.has(candidate.getMinutes())
      && hourValues.has(candidate.getHours())
      && monthValues.has(candidate.getMonth() + 1)
      && dayMatches
    ) {
      results.push(new Date(candidate.getTime()));
    }

    candidate.setMinutes(candidate.getMinutes() + 1);
  }

  if (results.length < count) {
    throw new Error(`Could not find ${count} upcoming run time(s) within ${Math.round(CRON_MAX_SEARCH_MINUTES / (365 * 24 * 60))} years - this cron expression may never fire (e.g. a day-of-month that never occurs in the given month).`);
  }

  return results;
}

function parseIpv4(str) {
  if (typeof str !== 'string') throw new Error('IP address must be a string.');
  const trimmed = str.trim();
  const parts = trimmed.split('.');
  if (parts.length !== 4) throw new Error('IP address must have 4 dot-separated octets.');

  const octets = parts.map((part) => {
    if (!/^\d+$/.test(part)) throw new Error(`Invalid octet "${part}" - octets must be numeric.`);
    const value = parseInt(part, 10);
    if (value < 0 || value > 255) throw new Error(`Invalid octet "${part}" - must be between 0 and 255.`);
    return value;
  });

  return (((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0);
}

function ipv4IntToString(n) {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function subnetInfo(ipString, prefixLength) {
  if (!Number.isInteger(prefixLength) || prefixLength < 0 || prefixLength > 32) {
    throw new Error('Prefix length must be an integer between 0 and 32.');
  }

  const ipInt = parseIpv4(ipString);
  const mask = prefixLength === 0 ? 0 : (0xFFFFFFFF << (32 - prefixLength)) >>> 0;
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;

  let firstUsable;
  let lastUsable;
  let usableHostCount;

  if (prefixLength === 32) {
    firstUsable = ipv4IntToString(network);
    lastUsable = ipv4IntToString(network);
    usableHostCount = 1;
  } else if (prefixLength === 31) {
    firstUsable = ipv4IntToString(network);
    lastUsable = ipv4IntToString(broadcast);
    usableHostCount = 2;
  } else {
    firstUsable = ipv4IntToString((network + 1) >>> 0);
    lastUsable = ipv4IntToString((broadcast - 1) >>> 0);
    usableHostCount = Math.pow(2, 32 - prefixLength) - 2;
  }

  return {
    networkAddress: ipv4IntToString(network),
    broadcastAddress: ipv4IntToString(broadcast),
    subnetMask: ipv4IntToString(mask),
    wildcardMask: ipv4IntToString((~mask) >>> 0),
    firstUsable,
    lastUsable,
    usableHostCount,
    totalAddresses: Math.pow(2, 32 - prefixLength),
  };
}
// --- Wind chill & heat index calculator ---

// Official NWS (2001) wind chill formula. Only meaningful for T <= 50F and
// V > 3mph - outside that range wind doesn't meaningfully add to the cooling
// effect of the air temperature itself, so no number is calculated.
function windChillFahrenheit(tempF, windSpeedMph) {
  if (typeof tempF !== 'number' || isNaN(tempF)) {
    throw new Error('Enter a valid temperature.');
  }
  if (typeof windSpeedMph !== 'number' || isNaN(windSpeedMph) || windSpeedMph < 0) {
    throw new Error('Wind speed must be a non-negative number.');
  }
  const applicable = tempF <= 50 && windSpeedMph > 3;
  if (!applicable) {
    return { applicable: false, feelsLikeF: null };
  }
  const v016 = Math.pow(windSpeedMph, 0.16);
  const feelsLikeF = 35.74 + 0.6215 * tempF - 35.75 * v016 + 0.4275 * tempF * v016;
  return { applicable: true, feelsLikeF };
}

// Official NWS/NOAA Rothfusz regression. Only valid/appropriate for T >= 80F;
// below that, humidity's contribution to perceived heat is negligible enough
// that the NWS doesn't apply the regression.
function heatIndexFahrenheit(tempF, relativeHumidityPercent) {
  if (typeof tempF !== 'number' || isNaN(tempF)) {
    throw new Error('Enter a valid temperature.');
  }
  if (typeof relativeHumidityPercent !== 'number' || isNaN(relativeHumidityPercent) || relativeHumidityPercent < 0) {
    throw new Error('Relative humidity must be a non-negative number.');
  }
  if (relativeHumidityPercent > 100) {
    throw new Error('Relative humidity cannot exceed 100%.');
  }
  const applicable = tempF >= 80;
  if (!applicable) {
    return { applicable: false, feelsLikeF: null };
  }
  const T = tempF;
  const RH = relativeHumidityPercent;
  const feelsLikeF = -42.379 + 2.04901523 * T + 10.14333127 * RH - 0.22475541 * T * RH
    - 0.00683783 * T * T - 0.05481717 * RH * RH + 0.00122874 * T * T * RH
    + 0.00085282 * T * RH * RH - 0.00000199 * T * T * RH * RH;
  return { applicable: true, feelsLikeF };
}
// --- Hash generator (MD5, SHA-1, SHA-256, SHA-512) ---
// Reuses the bytesToHex helper defined above (UUID generator section).

function md5LeftRotate(value, amount) {
  return ((value << amount) | (value >>> (32 - amount))) >>> 0;
}

const MD5_SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
  5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
  4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
  6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
];

// Per-round additive constants, floor(2^32 * |sin(i+1)|) for i in 0..63 (RFC 1321).
const MD5_K = new Uint32Array(64);
for (let i = 0; i < 64; i++) {
  MD5_K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
}

// RFC 1321 MD5 - no Web Crypto equivalent exists, so this is a hand-rolled
// Merkle-Damgard construction operating on typed arrays (not string
// concatenation) so it stays linear-time on large inputs.
function md5FromBytes(message) {
  const originalLengthBits = message.length * 8;

  let paddedLength = message.length + 1;
  while (paddedLength % 64 !== 56) paddedLength++;
  const totalLength = paddedLength + 8;

  const buffer = new Uint8Array(totalLength);
  buffer.set(message);
  buffer[message.length] = 0x80;

  const view = new DataView(buffer.buffer);
  // 64-bit little-endian bit length; Math.floor(.../2^32) covers inputs
  // beyond 2^32 bits, which JS numbers can still represent exactly here.
  view.setUint32(totalLength - 8, originalLengthBits >>> 0, true);
  view.setUint32(totalLength - 4, Math.floor(originalLengthBits / 4294967296), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const chunkWords = new Uint32Array(16);
  for (let chunkStart = 0; chunkStart < totalLength; chunkStart += 64) {
    for (let j = 0; j < 16; j++) {
      chunkWords[j] = view.getUint32(chunkStart + j * 4, true);
    }

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i++) {
      let f;
      let g;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      f = (f + a + MD5_K[i] + chunkWords[g]) >>> 0;
      const newB = (b + md5LeftRotate(f, MD5_SHIFTS[i])) >>> 0;
      a = d;
      d = c;
      c = b;
      b = newB;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  const digest = new Uint8Array(16);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, a0, true);
  digestView.setUint32(4, b0, true);
  digestView.setUint32(8, c0, true);
  digestView.setUint32(12, d0, true);
  return bytesToHex(digest);
}

// Text entry point: encode to UTF-8 bytes, then run the byte-array algorithm.
function md5Hex(text) {
  return md5FromBytes(new TextEncoder().encode(text));
}

async function digestHexFromBytes(algorithm, bytes) {
  const digestBuffer = await crypto.subtle.digest(algorithm, bytes);
  return bytesToHex(new Uint8Array(digestBuffer));
}

async function digestHex(algorithm, text) {
  const bytes = new TextEncoder().encode(text);
  return digestHexFromBytes(algorithm, bytes);
}

function sha1Hex(text) {
  return digestHex('SHA-1', text);
}

function sha256Hex(text) {
  return digestHex('SHA-256', text);
}

function sha512Hex(text) {
  return digestHex('SHA-512', text);
}

// Byte-array entry points (used to hash raw file contents rather than text).
function sha1FromBytes(bytes) {
  return digestHexFromBytes('SHA-1', bytes);
}

function sha256FromBytes(bytes) {
  return digestHexFromBytes('SHA-256', bytes);
}

function sha512FromBytes(bytes) {
  return digestHexFromBytes('SHA-512', bytes);
}
// --- Unix Permissions (chmod) Calculator ---

// Parses one read or write character ('r'/'w' or '-'), throwing on anything
// else (including a special-bit letter used in the wrong slot).
function parseChmodReadWriteChar(position, expectedChar, char) {
  if (char === expectedChar) return true;
  if (char === '-') return false;
  throw new Error(`Unexpected character "${char}" at position ${position + 1}; expected "${expectedChar}" or "-".`);
}

// Parses one triad's execute character, which may carry a special bit
// (setuid/setgid/sticky) folded into it: lowercase means the special bit AND
// the execute bit are both set, uppercase means the special bit is set but
// execute is not. wrongLetters are the *other* triads' special letters,
// called out specifically since they're a common typo (e.g. sticky's "t" in
// the owner slot instead of "s").
function parseChmodExecChar(position, char, lowerSpecial, upperSpecial, wrongLetters, slotLabel) {
  if (char === 'x') return { bit: true, special: false };
  if (char === '-') return { bit: false, special: false };
  if (char === lowerSpecial) return { bit: true, special: true };
  if (char === upperSpecial) return { bit: false, special: true };
  if (wrongLetters.includes(char)) {
    throw new Error(`"${char}" is not valid at position ${position + 1}; that letter only belongs in the ${slotLabel} slot.`);
  }
  throw new Error(`Unexpected character "${char}" at position ${position + 1}.`);
}

// Symbolic (e.g. "rwxr-xr-x", or "rwsr-xr-x" with setuid folded in) -> numeric
// mode string (e.g. "755", or "4755" when a special bit is set). Accepts an
// optional single leading file-type character (as in a pasted `ls -l` line
// like "drwxr-xr-x" or "lrwxrwxrwx") and strips it before parsing.
function symbolicToOctal(symbolic) {
  if (typeof symbolic !== 'string' || symbolic.trim() === '') {
    throw new Error('Enter a symbolic permission string.');
  }

  let trimmed = symbolic.trim();
  if (trimmed.length === 10) trimmed = trimmed.slice(1);

  if (trimmed.length !== 9) {
    throw new Error('Symbolic permissions must be exactly 9 characters (owner, group, other), optionally prefixed by a single file-type character.');
  }

  const chars = trimmed.split('');

  const ownerRead = parseChmodReadWriteChar(0, 'r', chars[0]);
  const ownerWrite = parseChmodReadWriteChar(1, 'w', chars[1]);
  const ownerExec = parseChmodExecChar(2, chars[2], 's', 'S', ['t', 'T'], "owner's execute (setuid)");

  const groupRead = parseChmodReadWriteChar(3, 'r', chars[3]);
  const groupWrite = parseChmodReadWriteChar(4, 'w', chars[4]);
  const groupExec = parseChmodExecChar(5, chars[5], 's', 'S', ['t', 'T'], "group's execute (setgid)");

  const otherRead = parseChmodReadWriteChar(6, 'r', chars[6]);
  const otherWrite = parseChmodReadWriteChar(7, 'w', chars[7]);
  const otherExec = parseChmodExecChar(8, chars[8], 't', 'T', ['s', 'S'], "other's execute (sticky bit)");

  const ownerDigit = (ownerRead ? 4 : 0) + (ownerWrite ? 2 : 0) + (ownerExec.bit ? 1 : 0);
  const groupDigit = (groupRead ? 4 : 0) + (groupWrite ? 2 : 0) + (groupExec.bit ? 1 : 0);
  const otherDigit = (otherRead ? 4 : 0) + (otherWrite ? 2 : 0) + (otherExec.bit ? 1 : 0);
  const specialDigit = (ownerExec.special ? 4 : 0) + (groupExec.special ? 2 : 0) + (otherExec.special ? 1 : 0);

  return specialDigit > 0
    ? `${specialDigit}${ownerDigit}${groupDigit}${otherDigit}`
    : `${ownerDigit}${groupDigit}${otherDigit}`;
}

// Builds one triad's 3-character symbolic form from its 0-7 digit, folding
// in a special bit (setuid/setgid/sticky) as lowercase (execute also set) or
// uppercase (execute not set) in the execute slot when that bit applies.
function chmodTriadSymbolic(digit, specialOn, lowerSpecial, upperSpecial) {
  const read = digit & 4 ? 'r' : '-';
  const write = digit & 2 ? 'w' : '-';
  const exec = !!(digit & 1);
  const execChar = specialOn ? (exec ? lowerSpecial : upperSpecial) : (exec ? 'x' : '-');
  return read + write + execChar;
}

// Numeric mode (1-4 octal digits, e.g. "755" or "4755") -> 9-character
// symbolic form with any special bits folded into the owner/group/other
// execute slots. A 1- or 2-digit mode is left-padded with zeros (e.g. "5" ->
// "005"), matching standard chmod convention.
function octalToSymbolic(octalStr) {
  if (typeof octalStr !== 'string' || octalStr.trim() === '') {
    throw new Error('Enter an octal permission mode.');
  }

  const trimmed = octalStr.trim();
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error('Octal mode must contain only digits.');
  }
  if (trimmed.length > 4) {
    throw new Error('Octal mode must be 1 to 4 digits.');
  }
  if (!/^[0-7]+$/.test(trimmed)) {
    throw new Error('Octal mode digits must each be 0-7.');
  }

  const padded = trimmed.length <= 2 ? trimmed.padStart(3, '0') : trimmed;
  const digits = padded.length === 4 ? padded.split('').map(Number) : [0, ...padded.split('').map(Number)];
  const [specialDigit, ownerDigit, groupDigit, otherDigit] = digits;

  const setuid = !!(specialDigit & 4);
  const setgid = !!(specialDigit & 2);
  const sticky = !!(specialDigit & 1);

  return (
    chmodTriadSymbolic(ownerDigit, setuid, 's', 'S') +
    chmodTriadSymbolic(groupDigit, setgid, 's', 'S') +
    chmodTriadSymbolic(otherDigit, sticky, 't', 'T')
  );
}

// Decodes one 3-character triad (as produced by chmodTriadSymbolic) into its
// read/write/execute bits plus which special bit (if any) is folded into
// the execute slot.
function decodeChmodTriad(triad, specialLowerChar, specialUpperChar, specialName) {
  const read = triad[0] === 'r';
  const write = triad[1] === 'w';
  const thirdChar = triad[2];
  const hasSpecial = thirdChar === specialLowerChar || thirdChar === specialUpperChar;
  const execute = thirdChar === 'x' || thirdChar === specialLowerChar;
  return { read, write, execute, special: hasSpecial ? specialName : null };
}

// Plain-English breakdown of a 9-character symbolic permission string (a
// leading file-type character, e.g. from "drwxr-xr-x", is stripped if
// present), plus warnings for commonly-flagged risky combinations:
// world-writable, and setuid/setgid combined with world-writable.
function chmodPermissionBreakdown(symbolic) {
  if (typeof symbolic !== 'string') throw new Error('Provide a symbolic permission string.');

  let trimmed = symbolic.trim();
  if (trimmed.length === 10) trimmed = trimmed.slice(1);
  if (trimmed.length !== 9) throw new Error('Symbolic permissions must be exactly 9 characters.');

  const owner = decodeChmodTriad(trimmed.slice(0, 3), 's', 'S', 'setuid');
  const group = decodeChmodTriad(trimmed.slice(3, 6), 's', 'S', 'setgid');
  const other = decodeChmodTriad(trimmed.slice(6, 9), 't', 'T', 'sticky');

  const worldWritable = other.write;
  const warnings = [];
  if (worldWritable) {
    warnings.push('World-writable: anyone on the system can modify this file, not just the owner or group.');
  }
  if (worldWritable && owner.special === 'setuid') {
    warnings.push("Setuid combined with world-writable is a serious risk: anyone can replace the file's contents, and it will still run with the owner's privileges.");
  }
  if (worldWritable && group.special === 'setgid') {
    warnings.push("Setgid combined with world-writable is a serious risk: anyone can replace the file's contents, and it will still run with the group's privileges.");
  }

  return { owner, group, other, worldWritable, warnings };
}
// --- CSS Unit Converter ---

// Everything funnels through a canonical px value first, then fans back out
// to all four units - simpler than writing six separate pairwise formulas,
// and it's what lets the tool report px/rem/vw/vh simultaneously.
function convertCssUnits(value, sourceUnit, rootFontSizePx, viewportWidthPx, viewportHeightPx) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Enter a valid numeric value to convert.');
  }
  if (!rootFontSizePx || rootFontSizePx <= 0) {
    throw new Error('Root font-size must be greater than zero.');
  }
  if (!viewportWidthPx || viewportWidthPx <= 0) {
    throw new Error('Viewport width must be greater than zero.');
  }
  if (!viewportHeightPx || viewportHeightPx <= 0) {
    throw new Error('Viewport height must be greater than zero.');
  }

  let px;
  switch (sourceUnit) {
    case 'px':
      px = value;
      break;
    case 'rem':
      px = value * rootFontSizePx;
      break;
    case 'vw':
      px = (value / 100) * viewportWidthPx;
      break;
    case 'vh':
      px = (value / 100) * viewportHeightPx;
      break;
    case 'pt':
      px = value * (96 / 72);
      break;
    default:
      throw new Error('Unsupported source unit.');
  }

  return {
    px,
    rem: px / rootFontSizePx,
    vw: (px / viewportWidthPx) * 100,
    vh: (px / viewportHeightPx) * 100,
    pt: px * (72 / 96),
  };
}
// --- Docker/Kubernetes resource request/limit calculator ---

// Request comes from observed average usage (the scheduling floor);
// limit comes from observed peak usage plus headroom, so a burst above
// average doesn't immediately get throttled/OOMKilled. See issue #122.
function k8sResourcePlan(avgCpuMillicores, peakCpuMillicores, avgMemoryMiB, peakMemoryMiB, headroomFactor = 1.3) {
  const positiveChecks = [
    ['Average CPU usage', avgCpuMillicores],
    ['Peak CPU usage', peakCpuMillicores],
    ['Average memory usage', avgMemoryMiB],
    ['Peak memory usage', peakMemoryMiB],
  ];
  for (const [label, value] of positiveChecks) {
    if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
      throw new Error(`${label} must be a positive number.`);
    }
  }
  if (typeof headroomFactor !== 'number' || !isFinite(headroomFactor) || headroomFactor <= 1) {
    throw new Error('Headroom factor must be greater than 1 - otherwise the limit would equal or fall below the peak, leaving no burst room.');
  }
  if (peakCpuMillicores < avgCpuMillicores) {
    throw new Error('Peak CPU usage cannot be lower than average CPU usage.');
  }
  if (peakMemoryMiB < avgMemoryMiB) {
    throw new Error('Peak memory usage cannot be lower than average memory usage.');
  }

  const cpuRequestMillicores = Math.round(avgCpuMillicores);
  if (cpuRequestMillicores === 0) {
    throw new Error('Computed CPU request is 0 - a 0 request is effectively unset/meaningless.');
  }
  const memRequestMiB = Math.round(avgMemoryMiB);
  if (memRequestMiB === 0) {
    throw new Error('Computed memory request is 0 - a 0 request is effectively unset/meaningless.');
  }

  const cpuLimitMillicores = Math.round((peakCpuMillicores * headroomFactor) / 10) * 10;
  const memLimitMiB = Math.round(peakMemoryMiB * headroomFactor);

  let qosClass;
  if (cpuRequestMillicores === cpuLimitMillicores && memRequestMiB === memLimitMiB) {
    qosClass = 'Guaranteed';
  } else {
    qosClass = 'Burstable';
  }

  const yamlSnippet = [
    'resources:',
    '  requests:',
    `    cpu: "${cpuRequestMillicores}m"`,
    `    memory: "${memRequestMiB}Mi"`,
    '  limits:',
    `    cpu: "${cpuLimitMillicores}m"`,
    `    memory: "${memLimitMiB}Mi"`,
  ].join('\n');

  return { cpuRequestMillicores, cpuLimitMillicores, memRequestMiB, memLimitMiB, qosClass, yamlSnippet };
}
// --- SQL Formatter ---

// Single-word reserved words. Multi-word clauses (GROUP BY, INNER JOIN, ...)
// are recognized afterward by merging adjacent single-word keyword tokens,
// so e.g. a column literally named `group` stays an identifier until it's
// actually followed by `by`.
const SQL_RESERVED_WORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'CROSS', 'ON',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL', 'AS', 'DISTINCT', 'UNION', 'ALL', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'ASC', 'DESC',
];
const SQL_KEYWORD_SET = new Set(SQL_RESERVED_WORDS);

// Checked longest-first isn't required here since every sequence starts with
// a distinct first word, so a single left-to-right greedy scan is unambiguous.
const SQL_COMPOUND_KEYWORDS = [
  ['LEFT', 'OUTER', 'JOIN'],
  ['RIGHT', 'OUTER', 'JOIN'],
  ['FULL', 'OUTER', 'JOIN'],
  ['INNER', 'JOIN'],
  ['LEFT', 'JOIN'],
  ['RIGHT', 'JOIN'],
  ['FULL', 'JOIN'],
  ['CROSS', 'JOIN'],
  ['GROUP', 'BY'],
  ['ORDER', 'BY'],
  ['INSERT', 'INTO'],
  ['DELETE', 'FROM'],
  ['UNION', 'ALL'],
];

// Keywords that start a new top-level line at the base indent when they
// appear outside of any parentheses (subqueries/function args are left alone).
const SQL_CLAUSE_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
  'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
]);

function mergeSqlCompoundKeywords(tokens) {
  const result = [];
  let i = 0;
  while (i < tokens.length) {
    let matched = null;
    for (const compound of SQL_COMPOUND_KEYWORDS) {
      if (i + compound.length > tokens.length) continue;
      let ok = true;
      for (let k = 0; k < compound.length; k++) {
        const t = tokens[i + k];
        if (t.type !== 'keyword' || t.value.toUpperCase() !== compound[k]) { ok = false; break; }
      }
      if (ok) { matched = compound; break; }
    }
    if (matched) {
      result.push({ type: 'keyword', value: matched.join(' ') });
      i += matched.length;
    } else {
      result.push(tokens[i]);
      i += 1;
    }
  }
  return result;
}

// Tokenizes raw SQL text into { type, value } tokens, respecting quote and
// comment boundaries so content inside them is never re-cased or treated as
// a keyword/clause boundary. Degrades gracefully on unterminated strings,
// identifiers, or comments by consuming to end-of-input instead of throwing,
// so malformed input still gets best-effort normalization rather than a crash.
function tokenizeSql(sql) {
  const tokens = [];
  const text = String(sql == null ? '' : sql);
  const n = text.length;
  let i = 0;

  const isDigit = (ch) => ch >= '0' && ch <= '9';
  const isIdentStart = (ch) => /[A-Za-z_]/.test(ch);
  const isIdentChar = (ch) => /[A-Za-z0-9_$]/.test(ch);

  while (i < n) {
    const ch = text[i];

    if (/\s/.test(ch)) { i += 1; continue; }

    if (ch === '-' && text[i + 1] === '-') {
      let j = i + 2;
      while (j < n && text[j] !== '\n') j += 1;
      tokens.push({ type: 'comment', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === '/' && text[i + 1] === '*') {
      let j = i + 2;
      while (j < n && !(text[j] === '*' && text[j + 1] === '/')) j += 1;
      j = Math.min(j + 2, n);
      tokens.push({ type: 'comment', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (text[j] === "'") {
          if (text[j + 1] === "'") { j += 2; continue; }
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ type: 'string', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === '"') {
      let j = i + 1;
      while (j < n) {
        if (text[j] === '"') {
          if (text[j + 1] === '"') { j += 2; continue; }
          j += 1;
          break;
        }
        j += 1;
      }
      tokens.push({ type: 'identifier', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (ch === '`') {
      let j = i + 1;
      while (j < n && text[j] !== '`') j += 1;
      j = Math.min(j + 1, n);
      tokens.push({ type: 'identifier', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (isDigit(ch) || (ch === '.' && isDigit(text[i + 1]))) {
      let j = i;
      while (j < n && isDigit(text[j])) j += 1;
      if (text[j] === '.') {
        j += 1;
        while (j < n && isDigit(text[j])) j += 1;
      }
      if (text[j] === 'e' || text[j] === 'E') {
        let k = j + 1;
        if (text[k] === '+' || text[k] === '-') k += 1;
        if (isDigit(text[k])) {
          j = k;
          while (j < n && isDigit(text[j])) j += 1;
        }
      }
      tokens.push({ type: 'number', value: text.slice(i, j) });
      i = j;
      continue;
    }

    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < n && isIdentChar(text[j])) j += 1;
      const word = text.slice(i, j);
      const type = SQL_KEYWORD_SET.has(word.toUpperCase()) ? 'keyword' : 'identifier';
      tokens.push({ type, value: word });
      i = j;
      continue;
    }

    const twoChar = text.slice(i, i + 2);
    if (['<=', '>=', '<>', '!=', '||', '::'].includes(twoChar)) {
      tokens.push({ type: 'operator', value: twoChar });
      i += 2;
      continue;
    }

    if (',();'.includes(ch) || ch === '.') {
      tokens.push({ type: 'punctuation', value: ch });
      i += 1;
      continue;
    }

    if ('=<>+-*/%'.includes(ch)) {
      tokens.push({ type: 'operator', value: ch });
      i += 1;
      continue;
    }

    // Unrecognized character (malformed input) - keep it as its own token
    // rather than throwing, so the rest of the query still gets formatted.
    tokens.push({ type: 'operator', value: ch });
    i += 1;
  }

  return mergeSqlCompoundKeywords(tokens);
}

function sqlKeywordCase(value, uppercase) {
  return uppercase ? value.toUpperCase() : value.toLowerCase();
}

function renderSqlToken(token, uppercase) {
  return token.type === 'keyword' ? sqlKeywordCase(token.value, uppercase) : token.value;
}

function sqlNoSpaceBeforeToken(token, prevToken) {
  if (!prevToken) return true;
  if (token.type === 'punctuation' && [',', ')', ';', '.'].includes(token.value)) return true;
  if (prevToken.type === 'punctuation' && ['(', '.'].includes(prevToken.value)) return true;
  if (token.type === 'punctuation' && token.value === '(' && prevToken.type === 'identifier') return true;
  if (token.type === 'operator' && token.value === '::') return true;
  if (prevToken.type === 'operator' && prevToken.value === '::') return true;
  return false;
}

function joinSqlTokens(tokens, uppercase) {
  let result = '';
  let prev = null;
  for (const tok of tokens) {
    if (result !== '' && !sqlNoSpaceBeforeToken(tok, prev)) result += ' ';
    result += renderSqlToken(tok, uppercase);
    prev = tok;
  }
  return result;
}

// Splits a token stream into statements on top-level `;` tokens (ignoring any
// inside parentheses), so each statement can be formatted independently and
// restarts at the base indent level. Records whether each statement was
// actually terminated by `;` in the source so a trailing statement with no
// semicolon doesn't get one invented for it.
function splitSqlStatements(tokens) {
  const statements = [];
  let current = [];
  let parenDepth = 0;
  for (const tok of tokens) {
    if (tok.type === 'punctuation' && tok.value === '(') parenDepth += 1;
    else if (tok.type === 'punctuation' && tok.value === ')') parenDepth = Math.max(0, parenDepth - 1);

    if (tok.type === 'punctuation' && tok.value === ';' && parenDepth === 0) {
      statements.push({ tokens: current, terminated: true });
      current = [];
      continue;
    }
    current.push(tok);
  }
  if (current.length > 0) statements.push({ tokens: current, terminated: false });
  return statements;
}

// Renders one statement's tokens with clause line-breaks and indentation.
// Content inside parentheses (function args, subqueries, tuples) is appended
// inline as-is rather than recursively re-indented - it's preserved correctly
// without disturbing the outer query's formatting, which is enough for this
// implementation's scope.
function formatSqlStatementTokens(tokens, indentWidth, uppercase) {
  const indentUnit = ' '.repeat(indentWidth);
  const lines = [];
  let currentIndent = 0;
  let currentTokens = [];

  function flush() {
    if (currentTokens.length > 0) {
      lines.push(indentUnit.repeat(currentIndent) + joinSqlTokens(currentTokens, uppercase));
      currentTokens = [];
    }
  }

  function startLine(indent) {
    flush();
    currentIndent = indent;
  }

  let clause = null; // 'SELECT' | 'WHERE' | 'OTHER' | null
  let parenDepth = 0;

  for (let idx = 0; idx < tokens.length; idx += 1) {
    const tok = tokens[idx];

    if (tok.type === 'comment') {
      flush();
      lines.push(indentUnit.repeat(currentIndent) + tok.value);
      continue;
    }

    if (tok.type === 'punctuation' && tok.value === '(') {
      parenDepth += 1;
      currentTokens.push(tok);
      continue;
    }
    if (tok.type === 'punctuation' && tok.value === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      currentTokens.push(tok);
      continue;
    }

    if (parenDepth === 0 && tok.type === 'keyword' && SQL_CLAUSE_KEYWORDS.has(tok.value.toUpperCase())) {
      const upper = tok.value.toUpperCase();
      startLine(0);
      currentTokens.push(tok);

      if (upper === 'SELECT') {
        const next = tokens[idx + 1];
        if (next && next.type === 'keyword' && next.value.toUpperCase() === 'DISTINCT') {
          currentTokens.push(next);
          idx += 1;
        }
        clause = 'SELECT';
        startLine(1);
      } else if (upper === 'WHERE') {
        clause = 'WHERE';
        startLine(1);
      } else {
        clause = 'OTHER';
      }
      continue;
    }

    if (parenDepth === 0 && clause === 'SELECT' && tok.type === 'punctuation' && tok.value === ',') {
      currentTokens.push(tok);
      startLine(1);
      continue;
    }

    if (parenDepth === 0 && clause === 'WHERE' && tok.type === 'keyword' && ['AND', 'OR'].includes(tok.value.toUpperCase())) {
      startLine(1);
      currentTokens.push(tok);
      continue;
    }

    currentTokens.push(tok);
  }

  flush();
  return lines.join('\n');
}

function formatSql(sql, options = {}) {
  const indentWidth = options.indentWidth === 4 ? 4 : 2;
  const uppercase = options.uppercase !== false;
  if (sql == null || String(sql).trim() === '') return '';

  const tokens = tokenizeSql(sql);
  const statements = splitSqlStatements(tokens)
    .map((stmt) => ({
      text: formatSqlStatementTokens(stmt.tokens, indentWidth, uppercase),
      terminated: stmt.terminated,
    }))
    .filter((stmt) => stmt.text.trim() !== '');

  return statements
    .map((stmt, idx) => (stmt.terminated || idx < statements.length - 1 ? `${stmt.text};` : stmt.text))
    .join('\n\n');
}

// Minifying and then re-formatting a `--` line comment would swallow the rest
// of the (now single) line as a comment, so comments are dropped in minified
// output rather than kept and silently breaking the query.
function minifySql(sql, options = {}) {
  const uppercase = options.uppercase !== false;
  if (sql == null || String(sql).trim() === '') return '';

  const tokens = tokenizeSql(sql).filter((tok) => tok.type !== 'comment');
  const statements = splitSqlStatements(tokens)
    .map((stmt) => ({
      text: joinSqlTokens(stmt.tokens, uppercase),
      terminated: stmt.terminated,
    }))
    .filter((stmt) => stmt.text.trim() !== '');

  return statements
    .map((stmt, idx) => (stmt.terminated || idx < statements.length - 1 ? `${stmt.text};` : stmt.text))
    .join(' ');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    epleyOneRepMax,
    brzyckiOneRepMax,
    lombardiOneRepMax,
    mayhewOneRepMax,
    percentageTable,
    estimatedRepsAtPercent,
    wilksCoefficient,
    wilksScore,
    calculatePlates,
    AVAILABLE_PLATES,
    AVAILABLE_PLATES_LB,
    WENDLER_LIFTS,
    WENDLER_WEEKS,
    trainingMax,
    trainingMaxIncrement,
    projectedTrainingMax,
    roundToIncrement,
    wendler531Sets,
    COMPOUNDING_FREQUENCIES,
    compoundInterest,
    scaleRecipe,
    INGREDIENT_GRAMS_PER_CUP,
    cookingVolumeToGrams,
    cookingGramsToVolume,
    CONTRIBUTION_FREQUENCIES,
    investmentGrowth,
    bakersPercentagesFromWeights,
    bakersWeightsFromPercentages,
    loanMonthlyPayment,
    amortizationSchedule,
    roundPanArea,
    rectangularPanArea,
    panSizeCookingTime,
    batchQuantityCookingTime,
    caloriesPerServing,
    CREDIT_CARD_MIN_PAYMENT_DEFAULTS,
    creditCardPayoffFixed,
    creditCardPayoffMinimum,
    debtPayoffPlan,
    requiredHourlyRate,
    requiredSavingsContribution,
    emergencyFundTarget,
    inflationImpact,
    drivingTripTime,
    hoursToHoursMinutes,
    GAS_MARK_TABLE,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    gasMarkToTemps,
    celsiusToGasMark,
    MEAT_DONENESS_LEVELS,
    MEAT_CARRYOVER_RISE,
    meatPullTemperature,
    COFFEE_BREW_METHODS,
    coffeeWaterForDose,
    coffeeDoseForWater,
    convertTimeZone,
    minutesToTimeLabel,
    doughHydrationPercent,
    doughWaterForHydration,
    ENRICHING_INGREDIENT_WATER_CONTENT,
    trueDoughHydrationPercent,
    calculateProgressiveTax,
    progressiveTaxBreakdown,
    salaryAfterTax,
    convertSalary,
    rentVsBuyComparison,
    fuelCostMetric,
    fuelCostImperial,
    retirementCountdown,
    retirementProjection,
    jetLagRecoveryDays,
    jetLagDirectionFromOffsets,
    jetLagDailySchedule,
    evFullChargeCost,
    evRange,
    evTripCost,
    evCostPer100km,
    evChargingTimeHours,
    fireCalculator,
    petrolDieselBreakEven,
    ruleOf72,
    evVsPetrolTCO,
    carDepreciationDecliningBalance,
    carDepreciationStraightLine,
    tripBudget,
    carLeasePayment,
    hpToKw,
    kwToHp,
    nmToLbft,
    lbftToNm,
    powerFromTorqueNmAndRpm,
    accelerationTimeEstimate,
    tyreCircumferenceFromDiameterMm,
    speedFromRpm,
    rpmFromSpeed,
    tyreDiameterMm,
    tyreCircumferenceMm,
    tyreSizeComparison,
    convertCurrency,
    inverseExchangeRate,
    wheelOffsetShift,
    wheelClearanceFit,
    roofBoxFuelPenalty,
    percentOf,
    whatPercentOf,
    percentageChange,
    originalValueFromPercentChange,
    tipCalculation,
    salesTaxForward,
    salesTaxFromInclusive,
    gcd,
    simplifyFraction,
    fractionArithmetic,
    simplifyRatio,
    solveProportion,
    luggageWeightCheck,
    simpleAverage,
    weightedAverage,
    descriptiveStats,
    LETTER_GRADE_POINTS,
    gpaFromCourses,
    ageBreakdown,
    nextBirthdayCountdown,
    dayOfYear,
    sunriseSunset,
    formatMinutesAsLocalTime,
    formatDurationHM,
    WARMUP_SCHEME,
    warmupSets,
    dateDifference,
    DOTS_COEFFICIENTS,
    DOTS_FEMALE_BW_CAP,
    dotsCoefficient,
    dotsScore,
    WEEKDAY_NAMES,
    addDaysToDate,
    weekdayName,
    COUNTRY_ELECTRICITY_DATA,
    VOLTAGE_TOLERANCE_FRACTION,
    checkPlugAdapterNeeds,
    workingDaysBetween,
    addWorkingDays,
    timeToSeconds,
    secondsToHMS,
    secondsToDecimalHours,
    addSubtractDurations,
    timeOfDayDuration,
    GL_COEFFICIENTS,
    glCoefficient,
    glPoints,
    UNIT_CONVERSION_CATEGORIES,
    convertLinearUnit,
    convertTemperature,
    convertUnit,
    convertToAllUnits,
    convertFuelEconomy,
    ffmi,
    ffmiCategory,
    bmiValue,
    bmiCategory,
    leanBodyMassFromBodyFat,
    leanBodyMassBoer,
    navyBodyFatPercent,
    bodyFatCategory,
    ACTIVITY_MULTIPLIERS,
    bmrMifflinStJeor,
    tdeeFromBmr,
    MACRO_KCAL_PER_GRAM,
    macroGrams,
    KCAL_PER_KG_FAT,
    KCAL_PER_LB_FAT,
    weightLossTimeline,
    BULK_PACE_SURPLUS,
    bulkCalories,
    paceFromDistanceTime,
    timeFromDistancePace,
    distanceFromTimePace,
    KM_PER_MILE,
    convertPacePerUnit,
    paintNeeded,
    roundUpToCans,
    wallpaperRollsNeeded,
    flooringNeeded,
    riegelPredictedTime,
    tilesNeeded,
    groutVolumeNeeded,
    rectangularConcreteVolume,
    cylindricalConcreteVolume,
    concreteBagsNeeded,
    concreteCostComparison,
    HEART_RATE_ZONES,
    karvonenZones,
    SLEEP_CYCLE_MINUTES,
    bedtimesForWakeTime,
    wakeTimesForBedtime,
    cooperVO2max,
    vo2maxCategory,
    WATER_ML_PER_KG,
    WATER_ACTIVITY_BONUS_ML,
    WATER_CLIMATE_BONUS_ML,
    dailyWaterIntake,
    CAFFEINE_PRESETS_MG,
    caffeineRemaining,
    gravelNeeded,
    WIDMARK_R,
    STANDARD_DRINK_GRAMS,
    ETHANOL_DENSITY_G_PER_ML,
    BAC_ELIMINATION_RATE_PER_HOUR,
    alcoholGramsFromDrinkCount,
    alcoholGramsFromVolume,
    widmarkBAC,
    bacTimeToThreshold,
    FTP_ZONES,
    estimateFTP,
    ftpPowerZones,
    ftpPowerToWeight,
    mulchVolumeNeeded,
    roofPitchMultiplier,
    roofArea,
    roofingSquaresAndBundles,
    roofPitchConversions,
    BOULDER_GRADE_TABLE,
    YDS_GRADES,
    isValidClimbingGrade,
    convertClimbingGrade,
    LADDER_SAFE_ANGLE_MIN_DEGREES,
    LADDER_SAFE_ANGLE_MAX_DEGREES,
    ladderPlan,
    FITZPATRICK_SKIN_FACTORS,
    timeToBurnMinutes,
    PET_MAX_AGE_YEARS,
    DOG_MIN_AGE_YEARS,
    dogHumanAge,
    catHumanAge,
    PREGNANCY_DEFAULT_CYCLE_DAYS,
    PREGNANCY_MIN_CYCLE_DAYS,
    PREGNANCY_MAX_CYCLE_DAYS,
    dueDateFromLmp,
    dueDateFromConception,
    gestationalAgeDays,
    pregnancyMilestones,
    pregnancyTrimester,
    EARTH_RADIUS_KM,
    EARTH_SIDEREAL_DAY_HOURS,
    EARTH_ORBITAL_SPEED_KMH,
    earthRotationSpeedKmh,
    earthTravelDistance,
    deckingMaterialsNeeded,
    STAIRCASE_CODE_MAX_RISER_MM,
    STAIRCASE_COMFORT_RISER_MIN_MM,
    STAIRCASE_COMFORT_RISER_MAX_MM,
    STAIRCASE_CODE_MIN_TREAD_MM,
    STAIRCASE_COMFORT_TREAD_MIN_MM,
    STAIRCASE_COMFORT_TREAD_MAX_MM,
    STAIRCASE_DEFAULT_TARGET_RISER_MM,
    STAIRCASE_2R_PLUS_T_MIN_MM,
    STAIRCASE_2R_PLUS_T_MAX_MM,
    staircasePlan,
    panelFenceCalculation,
    railFenceCalculation,
    INSULATION_FACTOR_PRESETS,
    heatingCost,
    UNIX_TIMESTAMP_MS_THRESHOLD,
    detectTimestampUnit,
    timestampToDate,
    formatDateInTimeZone,
    dateFieldsToEpoch,
    relativeTimeFromNow,
    convertNumberBase,
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    base64Encode,
    base64Decode,
    REGEX_MATCH_DISPLAY_CAP,
    findRegexMatches,
    applyRegexReplacement,
    HORIZON_REFRACTION_COEFFICIENT,
    horizonDistance,
    solarPanelSizing,
    solarPaybackPeriod,
    AVERAGE_CAR_KG_CO2_PER_KM,
    solarCO2Avoided,
    projectileMotion,
    ROAD_SURFACE_DECELERATION,
    stoppingDistance,
    voltageFromOhmsLaw,
    currentFromOhmsLaw,
    resistanceFromOhmsLaw,
    powerFromWattsLaw,
    currentFromWattsLaw,
    voltageFromWattsLaw,
    urlEncode,
    urlDecode,
    base64UrlDecode,
    decodeJwt,
    UUID_MAX_QUANTITY,
    generateUuidV1,
    generateUuidV4,
    generateUuidV7,
    generateUuids,
    formatJson,
    minifyJson,
    validateJson,
    jsonToYaml,
    yamlToJson,
    CRON_MACROS,
    CRON_UNSUPPORTED_MACROS,
    parseCronField,
    describeCronField,
    describeCron,
    buildCronExpression,
    nextCronRunTimes,
    expandCronMacro,
    parseIpv4,
    ipv4IntToString,
    subnetInfo,
    parseIpv4Octets,
    ipv4ToIpv6Mapped,
    ipv4ToIpv6Compatible,
    ipv6ToIpv4,
    windChillFahrenheit,
    heatIndexFahrenheit,
    bytesToHex,
    md5Hex,
    md5FromBytes,
    sha1Hex,
    sha256Hex,
    sha512Hex,
    sha1FromBytes,
    sha256FromBytes,
    sha512FromBytes,
    symbolicToOctal,
    octalToSymbolic,
    chmodPermissionBreakdown,
    convertCssUnits,
    k8sResourcePlan,
    tokenizeSql,
    formatSql,
    minifySql,
  };
}
