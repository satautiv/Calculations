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
    roundPanArea,
    rectangularPanArea,
    panSizeCookingTime,
    batchQuantityCookingTime,
  };
}
