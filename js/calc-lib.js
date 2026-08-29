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

function percentageTable(orm, percentages = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]) {
  return percentages.map(percent => ({ percent, weight: orm * (percent / 100) }));
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
  return { futureValue, interestEarned: futureValue - principal };
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

  while (bal > 1e-8 && months < maxMonths) {
    months++;
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
  }

  return { months, totalInterest, totalPaid: balance + totalInterest };
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

  while (bal > 1e-8 && months < maxMonths) {
    const payment = Math.max(bal * (minPercent / 100), minFloor);
    const interest = bal * monthlyRate;
    if (payment <= interest) return null;

    months++;
    let principal = payment - interest;
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
  }

  return { months, totalInterest, totalPaid: balance + totalInterest };
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

  return { requiredContribution, goalAlreadyMet, finalBalance, totalContributed, totalGrowth };
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

// Progressive ("marginal") bracket tax: each bracket's rate applies only to
// the slice of income between its own `from` and the next bracket's `from`
// (or to everything above `from` for the top bracket), not the whole income.
// `brackets` is [{ from, rate }] where rate is a decimal (0.2 for 20%).
function calculateProgressiveTax(grossIncome, brackets) {
  const sorted = [...brackets].sort((a, b) => a.from - b.from);
  let tax = 0;

  for (let i = 0; i < sorted.length; i++) {
    const { from, rate } = sorted[i];
    if (grossIncome <= from) break;

    const nextFrom = i + 1 < sorted.length ? sorted[i + 1].from : Infinity;
    const sliceTop = Math.min(grossIncome, nextFrom);
    tax += (sliceTop - from) * rate;
  }

  return tax;
}

// Net take-home pay after progressive income tax and a flat social-security
// style deduction on gross income. Net income is clamped at 0 rather than
// going negative if a misconfigured bracket table over-deducts.
function salaryAfterTax(grossAnnualIncome, brackets, socialSecurityRatePercent) {
  const tax = calculateProgressiveTax(grossAnnualIncome, brackets);
  const socialSecurity = grossAnnualIncome * (socialSecurityRatePercent / 100);
  const netIncome = Math.max(0, grossAnnualIncome - tax - socialSecurity);
  const effectiveRate = grossAnnualIncome > 0 ? ((tax + socialSecurity) / grossAnnualIncome) * 100 : 0;

  return { tax, socialSecurity, netIncome, netMonthly: netIncome / 12, effectiveRate };
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
  for (let year = 1; year <= horizonYears; year++) {
    const homeValueThatYear = homePrice * Math.pow(1 + appreciationRatePercent / 100, year);
    totalOwnershipCosts += (annualOwnershipCostPercent / 100) * homeValueThatYear;
  }

  const homeValueAtHorizon = homePrice * Math.pow(1 + appreciationRatePercent / 100, horizonYears);
  const equity = homeValueAtHorizon - remainingLoanBalance;
  const netCostBuy = downPayment + closingCosts + totalMortgagePayments + totalOwnershipCosts - equity;

  let totalRent = 0;
  let rent = monthlyRent;
  for (let year = 1; year <= horizonYears; year++) {
    totalRent += rent * 12;
    rent *= 1 + rentGrowthRatePercent / 100;
  }

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
  const { futureValue, totalContributed, totalGrowth } = investmentGrowth(
    currentSavings, monthlyContribution, 12, annualRatePercent, yearsRemaining
  );

  return { yearsRemaining, futureValue, totalContributed, totalGrowth };
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

  return {
    evTCO,
    petrolTCO,
    difference,
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

  return { dailyTotal, variableCost, fixedCost, totalTripCost, averageCostPerDay };
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    epleyOneRepMax,
    brzyckiOneRepMax,
    lombardiOneRepMax,
    mayhewOneRepMax,
    percentageTable,
    wilksCoefficient,
    wilksScore,
    calculatePlates,
    AVAILABLE_PLATES,
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
    calculateProgressiveTax,
    salaryAfterTax,
    convertSalary,
    rentVsBuyComparison,
    fuelCostMetric,
    fuelCostImperial,
    retirementCountdown,
    retirementProjection,
    jetLagRecoveryDays,
    jetLagDirectionFromOffsets,
    evFullChargeCost,
    evRange,
    evTripCost,
    evCostPer100km,
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
    roofBoxFuelPenalty,
    percentOf,
    whatPercentOf,
    percentageChange,
    gcd,
    simplifyFraction,
    fractionArithmetic,
    simplifyRatio,
    solveProportion,
    luggageWeightCheck,
    simpleAverage,
    weightedAverage,
    ageBreakdown,
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
    timeToSeconds,
    secondsToHMS,
    addSubtractDurations,
    timeOfDayDuration,
    GL_COEFFICIENTS,
    glCoefficient,
    glPoints,
    UNIT_CONVERSION_CATEGORIES,
    convertLinearUnit,
    convertTemperature,
    convertUnit,
    ffmi,
    ffmiCategory,
    leanBodyMassFromBodyFat,
    leanBodyMassBoer,
    navyBodyFatPercent,
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
  };
}
