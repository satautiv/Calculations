// Pure calculation functions, shared between the browser (plain <script> include)
// and Node-based tests (via the CommonJS export guard below).

function epleyOneRepMax(weight, reps) {
  return reps === 1 ? weight : weight * (1 + reps / 30);
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    epleyOneRepMax,
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
  };
}
