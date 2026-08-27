const {
  epleyOneRepMax,
  percentageTable,
  wilksScore,
  calculatePlates,
  trainingMax,
  trainingMaxIncrement,
  projectedTrainingMax,
  roundToIncrement,
  wendler531Sets,
  compoundInterest,
  scaleRecipe,
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
} = require('../js/calc-lib');

describe('epleyOneRepMax', () => {
  test('returns weight unchanged for 1 rep', () => {
    expect(epleyOneRepMax(100, 1)).toBe(100);
  });

  test('estimates a higher max for more reps', () => {
    expect(epleyOneRepMax(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe('percentageTable', () => {
  test('computes weight at each requested percentage of one-rep max', () => {
    expect(percentageTable(100, [50, 100])).toEqual([
      { percent: 50, weight: 50 },
      { percent: 100, weight: 100 },
    ]);
  });
});

describe('wilksScore', () => {
  test('produces a positive score for valid inputs', () => {
    expect(wilksScore(80, 300, 'male')).toBeGreaterThan(0);
  });

  test('differs between male and female coefficients', () => {
    const male = wilksScore(80, 300, 'male');
    const female = wilksScore(80, 300, 'female');
    expect(male).not.toBeCloseTo(female, 5);
  });
});

describe('calculatePlates', () => {
  test('splits target minus bar evenly per side using available plates', () => {
    const { used, leftover } = calculatePlates(100, 20);
    expect(used).toEqual([
      { plate: 25, count: 1 },
      { plate: 15, count: 1 },
    ]);
    expect(leftover).toBeCloseTo(0);
  });

  test('reports leftover weight that cannot be made with standard plates', () => {
    const { leftover } = calculatePlates(100.3, 20);
    expect(leftover).toBeGreaterThan(0);
  });
});

describe('trainingMax', () => {
  test('defaults to 90% of one-rep max', () => {
    expect(trainingMax(100)).toBe(90);
  });
});

describe('trainingMaxIncrement', () => {
  test('lower body lifts increase more than upper body lifts', () => {
    expect(trainingMaxIncrement('squat', 'lb')).toBe(10);
    expect(trainingMaxIncrement('deadlift', 'lb')).toBe(10);
    expect(trainingMaxIncrement('bench', 'lb')).toBe(5);
    expect(trainingMaxIncrement('press', 'lb')).toBe(5);
  });

  test('kg increments are the exact lb-to-kg conversion', () => {
    expect(trainingMaxIncrement('squat', 'kg')).toBeCloseTo(4.5359237, 5);
    expect(trainingMaxIncrement('bench', 'kg')).toBeCloseTo(2.2679618, 5);
  });
});

describe('projectedTrainingMax', () => {
  test('cycle 1 returns the base training max unchanged', () => {
    expect(projectedTrainingMax(200, 'squat', 'lb', 1)).toBe(200);
  });

  test('adds one increment per additional cycle', () => {
    expect(projectedTrainingMax(200, 'squat', 'lb', 3)).toBe(220);
  });
});

describe('roundToIncrement', () => {
  test('rounds to the nearest multiple of the increment', () => {
    expect(roundToIncrement(92.7, 5)).toBe(95);
    expect(roundToIncrement(91, 5)).toBe(90);
    expect(roundToIncrement(91.3, 2.5)).toBeCloseTo(92.5, 5);
  });
});

describe('wendler531Sets', () => {
  test('week 1 has 3 warmup sets plus 5/5/5+ work sets with the top set marked AMRAP', () => {
    const sets = wendler531Sets(300, 1);
    expect(sets).toHaveLength(6);
    expect(sets.filter(s => s.warmup)).toHaveLength(3);
    const work = sets.filter(s => !s.warmup);
    expect(work.map(s => s.reps)).toEqual([5, 5, 5]);
    expect(work.map(s => s.amrap)).toEqual([false, false, true]);
    expect(work[2].weight).toBeCloseTo(255, 5);
  });

  test('week 4 deload has no warmup sets and no AMRAP', () => {
    const sets = wendler531Sets(300, 4);
    expect(sets).toHaveLength(3);
    expect(sets.every(s => !s.amrap && !s.warmup)).toBe(true);
  });

  test('rounds set weights to the given increment when provided', () => {
    const sets = wendler531Sets(93, 1, 5);
    expect(sets.every(s => s.weight % 5 === 0)).toBe(true);
  });

  test('throws for an invalid week', () => {
    expect(() => wendler531Sets(300, 5)).toThrow();
  });
});

describe('compoundInterest', () => {
  test('matches the worked example: €1000 at 5% monthly for 10 years', () => {
    const { futureValue, interestEarned } = compoundInterest(1000, 5, 12, 10);
    expect(futureValue).toBeCloseTo(1647.01, 1);
    expect(interestEarned).toBeCloseTo(647.01, 1);
  });

  test('annual compounding for one year adds exactly the rate', () => {
    const { futureValue } = compoundInterest(1000, 10, 1, 1);
    expect(futureValue).toBeCloseTo(1100, 5);
  });

  test('0% rate leaves the principal unchanged', () => {
    const { futureValue, interestEarned } = compoundInterest(1000, 0, 12, 10);
    expect(futureValue).toBeCloseTo(1000, 5);
    expect(interestEarned).toBeCloseTo(0, 5);
  });
});

describe('scaleRecipe', () => {
  test('matches the worked example: 4 servings scaled to 10', () => {
    const { scaleFactor, ingredients } = scaleRecipe(4, 10, [
      { name: 'flour', quantity: 300, unit: 'g' },
      { name: 'eggs', quantity: 2, unit: '' },
      { name: 'milk', quantity: 150, unit: 'ml' },
      { name: 'salt', quantity: 5, unit: 'g' },
    ]);

    expect(scaleFactor).toBe(2.5);
    expect(ingredients).toEqual([
      { name: 'flour', quantity: 300, unit: 'g', scaledQuantity: 750 },
      { name: 'eggs', quantity: 2, unit: '', scaledQuantity: 5 },
      { name: 'milk', quantity: 150, unit: 'ml', scaledQuantity: 375 },
      { name: 'salt', quantity: 5, unit: 'g', scaledQuantity: 12.5 },
    ]);
  });

  test('scaling down uses a factor below 1', () => {
    const { scaleFactor, ingredients } = scaleRecipe(4, 2, [{ name: 'flour', quantity: 300, unit: 'g' }]);
    expect(scaleFactor).toBe(0.5);
    expect(ingredients[0].scaledQuantity).toBe(150);
  });
});

describe('investmentGrowth', () => {
  test('matches the closed-form ordinary annuity formula: €5000 + €200/mo at 7% for 20 years', () => {
    const { futureValue, totalContributed, totalGrowth, yearly } = investmentGrowth(5000, 200, 12, 7, 20);
    expect(futureValue).toBeCloseTo(124379.03, 1);
    expect(totalContributed).toBe(53000);
    expect(totalGrowth).toBeCloseTo(71379.03, 1);
    expect(yearly).toHaveLength(20);
    expect(yearly[19].endingBalance).toBeCloseTo(futureValue, 6);
  });

  test('0% rate leaves growth at zero (FV = P + C*n)', () => {
    const { futureValue, totalGrowth } = investmentGrowth(1000, 100, 12, 0, 1);
    expect(futureValue).toBeCloseTo(2200, 5);
    expect(totalGrowth).toBeCloseTo(0, 5);
  });

  test('negative rate models a loss scenario', () => {
    const { futureValue } = investmentGrowth(1000, 0, 1, -10, 1);
    expect(futureValue).toBeCloseTo(900, 5);
  });

  test('year-by-year breakdown accumulates contributions and growth', () => {
    const { yearly } = investmentGrowth(0, 100, 1, 10, 3);
    expect(yearly[0].cumulativeContributions).toBe(100);
    expect(yearly[2].cumulativeContributions).toBe(300);
    expect(yearly[2].endingBalance).toBeCloseTo(yearly[2].cumulativeContributions + yearly[2].cumulativeGrowth, 6);
  });
});

describe('bakersPercentagesFromWeights', () => {
  test('matches the worked example: flour 500g, water 350g, salt 10g, yeast 5g', () => {
    const { totalFlourWeight, ingredients } = bakersPercentagesFromWeights([
      { name: 'Flour', weight: 500, isFlour: true },
      { name: 'Water', weight: 350, isFlour: false },
      { name: 'Salt', weight: 10, isFlour: false },
      { name: 'Yeast', weight: 5, isFlour: false },
    ]);

    expect(totalFlourWeight).toBe(500);
    expect(ingredients.map(i => i.percent)).toEqual([100, 70, 2, 1]);
  });

  test('sums multiple flour types into the 100% base', () => {
    const { totalFlourWeight, ingredients } = bakersPercentagesFromWeights([
      { name: 'Bread flour', weight: 400, isFlour: true },
      { name: 'Whole wheat', weight: 100, isFlour: true },
      { name: 'Water', weight: 350, isFlour: false },
    ]);

    expect(totalFlourWeight).toBe(500);
    expect(ingredients.map(i => i.percent)).toEqual([80, 20, 70]);
  });

  test('throws when there is no flour weight to use as the base', () => {
    expect(() => bakersPercentagesFromWeights([{ name: 'Water', weight: 350, isFlour: false }])).toThrow();
  });
});

describe('bakersWeightsFromPercentages', () => {
  test('matches the worked example: flour weight given directly', () => {
    const { totalFlourWeight, ingredients } = bakersWeightsFromPercentages([
      { name: 'Flour', percent: 100, isFlour: true },
      { name: 'Water', percent: 70, isFlour: false },
      { name: 'Salt', percent: 2, isFlour: false },
      { name: 'Yeast', percent: 1, isFlour: false },
    ], { flourWeight: 800 });

    expect(totalFlourWeight).toBe(800);
    expect(ingredients.map(i => i.weight)).toEqual([800, 560, 16, 8]);
  });

  test('back-solves flour weight from a target total dough weight', () => {
    const { totalFlourWeight, totalDoughWeight, ingredients } = bakersWeightsFromPercentages([
      { name: 'Flour', percent: 100, isFlour: true },
      { name: 'Water', percent: 70, isFlour: false },
      { name: 'Salt', percent: 2, isFlour: false },
      { name: 'Yeast', percent: 1, isFlour: false },
    ], { targetDoughWeight: 1384 });

    expect(totalFlourWeight).toBeCloseTo(800, 5);
    expect(totalDoughWeight).toBeCloseTo(1384, 5);
    expect(ingredients.map(i => Math.round(i.weight))).toEqual([800, 560, 16, 8]);
  });

  test('throws when neither a flour weight nor a target dough weight is given', () => {
    expect(() => bakersWeightsFromPercentages([{ name: 'Flour', percent: 100, isFlour: true }], {})).toThrow();
  });
});

describe('loanMonthlyPayment', () => {
  test('matches the worked example: €200,000 at 5% annual for 30 years (360 months)', () => {
    expect(loanMonthlyPayment(200000, 5, 360)).toBeCloseTo(1073.64, 2);
  });

  test('0% rate divides principal evenly across the term', () => {
    expect(loanMonthlyPayment(1200, 0, 12)).toBeCloseTo(100, 5);
  });
});

describe('amortizationSchedule', () => {
  test('matches the worked example: €200,000 at 5% annual for 30 years (360 months)', () => {
    const { totalPaid, totalInterest, monthsToPayoff, monthlyPayment, schedule } =
      amortizationSchedule(200000, 5, 360);

    expect(monthlyPayment).toBeCloseTo(1073.64, 2);
    expect(totalPaid).toBeCloseTo(386511.57, 1);
    expect(totalInterest).toBeCloseTo(186511.57, 1);
    expect(monthsToPayoff).toBe(360);
    expect(schedule).toHaveLength(360);
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 5);
  });

  test('first month interest and principal split correctly', () => {
    const { schedule, monthlyPayment } = amortizationSchedule(200000, 5, 360);
    const first = schedule[0];
    expect(first.interest).toBeCloseTo(200000 * (0.05 / 12), 5);
    expect(first.principal).toBeCloseTo(monthlyPayment - first.interest, 5);
    expect(first.payment).toBeCloseTo(monthlyPayment, 5);
  });

  test('0% rate: fixed payment applies entirely to principal', () => {
    const { totalInterest, totalPaid, monthsToPayoff, schedule } = amortizationSchedule(1200, 0, 12);
    expect(totalInterest).toBeCloseTo(0, 5);
    expect(totalPaid).toBeCloseTo(1200, 5);
    expect(monthsToPayoff).toBe(12);
    expect(schedule.every(row => row.interest === 0)).toBe(true);
  });

  test('a positive overpayment reduces total interest and payoff time versus no overpayment', () => {
    const base = amortizationSchedule(200000, 5, 360, 0);
    const withExtra = amortizationSchedule(200000, 5, 360, 200);

    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest);
    expect(withExtra.monthsToPayoff).toBeLessThan(base.monthsToPayoff);
    expect(withExtra.monthsToPayoff).toBe(256);
    expect(withExtra.totalInterest).toBeCloseTo(125351.06, 1);
  });

  test('the last payment caps the principal portion so the balance never goes negative', () => {
    const { schedule } = amortizationSchedule(200000, 5, 360, 200);
    const last = schedule[schedule.length - 1];
    expect(last.balance).toBeCloseTo(0, 5);
    expect(last.payment).toBeLessThanOrEqual(1073.64 + 200 + 1e-6);
  });
});

describe('roundPanArea', () => {
  test('area = pi * (d/2)^2', () => {
    expect(roundPanArea(8)).toBeCloseTo(Math.PI * 16, 5);
  });
});

describe('rectangularPanArea', () => {
  test('area = length * width', () => {
    expect(rectangularPanArea(9, 13)).toBe(117);
  });
});

describe('panSizeCookingTime', () => {
  test('moving from an 8-inch to a 10-inch round pan shrinks the estimated time (bigger pan bakes faster)', () => {
    const { areaRatio, newTime } = panSizeCookingTime(30, roundPanArea(8), roundPanArea(10));
    expect(areaRatio).toBeCloseTo(1.5625, 4);
    expect(newTime).toBeCloseTo(19.2, 4);
    expect(newTime).toBeLessThan(30);
  });

  test('moving to a smaller pan increases the estimated time', () => {
    const { areaRatio, newTime } = panSizeCookingTime(30, roundPanArea(10), roundPanArea(8));
    expect(areaRatio).toBeCloseTo(0.64, 4);
    expect(newTime).toBeCloseTo(46.875, 3);
    expect(newTime).toBeGreaterThan(30);
  });

  test('identical pan size returns the original time unchanged (ratio = 1)', () => {
    const area = rectangularPanArea(9, 13);
    const { areaRatio, newTime } = panSizeCookingTime(45, area, area);
    expect(areaRatio).toBe(1);
    expect(newTime).toBe(45);
  });
});

describe('batchQuantityCookingTime', () => {
  test('matches the worked example: doubling a stew (60 min -> ~75.6 min)', () => {
    const { quantityRatio, newTime } = batchQuantityCookingTime(60, 1, 2);
    expect(quantityRatio).toBe(2);
    expect(newTime).toBeCloseTo(75.6, 1);
  });

  test('identical quantity returns the original time unchanged (ratio = 1)', () => {
    const { quantityRatio, newTime } = batchQuantityCookingTime(50, 4, 4);
    expect(quantityRatio).toBe(1);
    expect(newTime).toBe(50);
  });

  test('a smaller batch shortens the estimated time', () => {
    const { newTime } = batchQuantityCookingTime(60, 2, 1);
    expect(newTime).toBeLessThan(60);
  });
});

describe('caloriesPerServing', () => {
  test('matches the worked example: 412.5 + 132.6 + 390 kcal over 4 servings', () => {
    const { totalCalories, caloriesPerServing: perServing, ingredients } = caloriesPerServing([
      { name: 'Ingredient A', calories: 412.5 },
      { name: 'Ingredient B', calories: 132.6 },
      { name: 'Ingredient C', calories: 390 },
    ], 4);

    expect(totalCalories).toBeCloseTo(935.1, 5);
    expect(perServing).toBeCloseTo(233.775, 5);
    expect(ingredients).toHaveLength(3);
  });

  test('a single ingredient equals total calories divided by servings', () => {
    const { totalCalories, caloriesPerServing: perServing } = caloriesPerServing(
      [{ name: 'Solo', calories: 500 }], 2
    );

    expect(totalCalories).toBe(500);
    expect(perServing).toBe(250);
  });

  test('servings that do not divide evenly still produce the exact quotient', () => {
    const { caloriesPerServing: perServing } = caloriesPerServing([
      { name: 'A', calories: 100 },
      { name: 'B', calories: 50 },
    ], 3);

    expect(perServing).toBeCloseTo(50, 5);
  });
});
