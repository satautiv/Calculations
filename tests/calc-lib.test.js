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
  creditCardPayoffFixed,
  creditCardPayoffMinimum,
  requiredSavingsContribution,
  emergencyFundTarget,
  inflationImpact,
  drivingTripTime,
  hoursToHoursMinutes,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  gasMarkToTemps,
  celsiusToGasMark,
  meatPullTemperature,
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

  test('matches the net worth projection worked example: €20,000 + €500/mo at 6% over 15 years', () => {
    const { futureValue, totalContributed, totalGrowth } = investmentGrowth(20000, 500, 12, 6, 15);
    expect(futureValue).toBeCloseTo(194491.23, 1);
    expect(totalContributed).toBe(110000);
    expect(totalGrowth).toBeCloseTo(84491.23, 1);
  });

  test('supports a negative starting balance (net debt) and negative contributions (net worth shrinking)', () => {
    const { futureValue } = investmentGrowth(-5000, -100, 12, 5, 1);
    expect(Number.isFinite(futureValue)).toBe(true);
    expect(futureValue).toBeLessThan(-5000);
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

describe('creditCardPayoffFixed', () => {
  test('matches a precise simulation: €3,000 at 22% APR paying €150/month', () => {
    const { months, totalInterest, totalPaid } = creditCardPayoffFixed(3000, 22, 150);
    expect(months).toBe(26);
    expect(totalInterest).toBeCloseTo(771.43, 1);
    expect(totalPaid).toBeCloseTo(3771.43, 1);
  });

  test('returns null when the payment does not cover the first month interest', () => {
    // first month interest = 3000 * (22/100/12) ≈ 55
    expect(creditCardPayoffFixed(3000, 22, 50)).toBeNull();
  });

  test('a larger payment pays off faster with less total interest', () => {
    const slower = creditCardPayoffFixed(3000, 22, 150);
    const faster = creditCardPayoffFixed(3000, 22, 300);
    expect(faster.months).toBeLessThan(slower.months);
    expect(faster.totalInterest).toBeLessThan(slower.totalInterest);
  });
});

describe('creditCardPayoffMinimum', () => {
  test('the minimum-payment trap takes far longer and costs far more interest than a fixed payment', () => {
    const fixed = creditCardPayoffFixed(3000, 22, 150);
    const minimum = creditCardPayoffMinimum(3000, 22);
    expect(minimum.months).toBeGreaterThan(fixed.months);
    expect(minimum.totalInterest).toBeGreaterThan(fixed.totalInterest);
    expect(minimum.months).toBe(662);
    expect(minimum.totalInterest).toBeCloseTo(21419.5, 0);
  });

  test('a higher minPercent pays off faster than the default', () => {
    const defaultRate = creditCardPayoffMinimum(3000, 22);
    const higherRate = creditCardPayoffMinimum(3000, 22, 5, 25);
    expect(higherRate.months).toBeLessThan(defaultRate.months);
  });
});

describe('requiredSavingsContribution', () => {
  test('matches the worked example: €10,000 goal in 36 months, €1,000 already saved, 4% annual return', () => {
    const { requiredContribution, goalAlreadyMet, finalBalance } = requiredSavingsContribution(10000, 1000, 4, 12, 36);
    expect(goalAlreadyMet).toBe(false);
    expect(requiredContribution).toBeCloseTo(232.38, 1);
    expect(finalBalance).toBeCloseTo(10000, 5);
  });

  test('0% return divides the shortfall evenly across the periods', () => {
    const { requiredContribution, totalGrowth } = requiredSavingsContribution(1000, 0, 0, 12, 10);
    expect(requiredContribution).toBeCloseTo(100, 5);
    expect(totalGrowth).toBeCloseTo(0, 5);
  });

  test('reports the goal as already met when current savings alone will exceed it', () => {
    const { requiredContribution, goalAlreadyMet, finalBalance } = requiredSavingsContribution(5000, 6000, 4, 12, 12);
    expect(goalAlreadyMet).toBe(true);
    expect(requiredContribution).toBe(0);
    expect(finalBalance).toBeGreaterThan(5000);
  });
});

describe('emergencyFundTarget', () => {
  test('matches the worked example: €1,800/month expenses, 6 months coverage, €4,000 already saved', () => {
    const { target, shortfall, percentFunded } = emergencyFundTarget(1800, 6, 4000);
    expect(target).toBe(10800);
    expect(shortfall).toBe(6800);
    expect(percentFunded).toBeCloseTo(37.037, 2);
  });

  test('defaults current savings to 0, giving the full target as the shortfall', () => {
    const { target, shortfall, percentFunded } = emergencyFundTarget(1800, 6);
    expect(target).toBe(10800);
    expect(shortfall).toBe(10800);
    expect(percentFunded).toBe(0);
  });

  test('caps percentFunded at 100 and shortfall at 0 when already fully funded', () => {
    const { shortfall, percentFunded } = emergencyFundTarget(1800, 6, 20000);
    expect(shortfall).toBe(0);
    expect(percentFunded).toBe(100);
  });
});

describe('inflationImpact', () => {
  test('matches the worked example: €10,000, 3% inflation, 20 years', () => {
    const { futureCost, realValue, percentPurchasingPowerLost } = inflationImpact(10000, 3, 20);
    expect(futureCost).toBeCloseTo(18061.11, 1);
    expect(realValue).toBeCloseTo(5536.76, 1);
    expect(percentPurchasingPowerLost).toBeCloseTo(44.63, 1);
  });

  test('futureCost and realValue are inverse: realValue of a futureCost recovers the original amount', () => {
    const { futureCost } = inflationImpact(10000, 3, 20);
    const { realValue } = inflationImpact(futureCost, 3, 20);
    expect(realValue).toBeCloseTo(10000, 5);
  });

  test('0% inflation leaves both values unchanged', () => {
    const { futureCost, realValue, percentPurchasingPowerLost } = inflationImpact(5000, 0, 10);
    expect(futureCost).toBe(5000);
    expect(realValue).toBe(5000);
    expect(percentPurchasingPowerLost).toBe(0);
  });
});

describe('drivingTripTime', () => {
  test('matches the worked example: 450 km at 90 km/h with a 45-minute stop', () => {
    const { drivingHours, totalHours } = drivingTripTime(450, 90, 45);
    expect(drivingHours).toBe(5);
    expect(totalHours).toBe(5.75);
  });

  test('defaults stop time to 0', () => {
    const { drivingHours, totalHours } = drivingTripTime(100, 50);
    expect(drivingHours).toBe(2);
    expect(totalHours).toBe(2);
  });
});

describe('hoursToHoursMinutes', () => {
  test('matches the worked example: 5.75 hours -> 5h 45m', () => {
    expect(hoursToHoursMinutes(5.75)).toEqual({ hours: 5, minutes: 45 });
  });

  test('a whole number of hours has 0 minutes', () => {
    expect(hoursToHoursMinutes(5)).toEqual({ hours: 5, minutes: 0 });
  });

  test('rounds minutes that land on 60 up into the next hour', () => {
    expect(hoursToHoursMinutes(5.9992)).toEqual({ hours: 6, minutes: 0 });
  });
});

describe('celsiusToFahrenheit / fahrenheitToCelsius', () => {
  test('200°C converts exactly to 392°F, matching the worked example', () => {
    expect(celsiusToFahrenheit(200)).toBe(392);
  });

  test('round-trips back to the original value', () => {
    expect(fahrenheitToCelsius(celsiusToFahrenheit(180))).toBeCloseTo(180, 10);
  });
});

describe('gasMarkToTemps', () => {
  test('matches the worked example: Gas Mark 4 -> 180°C / 350°F (the table value, not raw 356°F)', () => {
    expect(gasMarkToTemps(4)).toEqual({ celsius: 180, fahrenheit: 350 });
  });

  test('supports fractional marks (1/4 and 1/2)', () => {
    expect(gasMarkToTemps(0.25)).toEqual({ celsius: 110, fahrenheit: 225 });
    expect(gasMarkToTemps(0.5)).toEqual({ celsius: 120, fahrenheit: 250 });
  });

  test('returns null for a non-standard mark', () => {
    expect(gasMarkToTemps(10)).toBeNull();
  });
});

describe('celsiusToGasMark', () => {
  test('200°C is exactly Gas Mark 6, matching the worked example', () => {
    expect(celsiusToGasMark(200)).toBe(6);
  });

  test('snaps to the nearest mark for an in-between value', () => {
    expect(celsiusToGasMark(175)).toBe(4);
  });

  test('returns null below the table range (under 110°C)', () => {
    expect(celsiusToGasMark(100)).toBeNull();
  });

  test('returns null above the table range (over 240°C)', () => {
    expect(celsiusToGasMark(250)).toBeNull();
  });
});

describe('meatPullTemperature', () => {
  test('matches the worked example: medium-rare steak pulls at 130°F, rests 5 min, final 135°F', () => {
    const { target, pullTemperature, restMinutes } = meatPullTemperature('medium-rare', 'steak', 'f');
    expect(target).toBe(135);
    expect(pullTemperature).toBe(130);
    expect(restMinutes).toBe('5');
  });

  test('a roast has a larger carryover rise than a steak for the same doneness', () => {
    const steak = meatPullTemperature('medium', 'steak', 'f');
    const roast = meatPullTemperature('medium', 'roast', 'f');
    expect(roast.rise).toBeGreaterThan(steak.rise);
    expect(roast.pullTemperature).toBeLessThan(steak.pullTemperature);
  });

  test('works in Celsius too', () => {
    const { target, pullTemperature } = meatPullTemperature('medium-rare', 'steak', 'c');
    expect(target).toBe(57);
    expect(pullTemperature).toBe(54);
  });

  test('throws for an unknown doneness level', () => {
    expect(() => meatPullTemperature('extra-crispy', 'steak', 'f')).toThrow();
  });
});

describe('coffeeWaterForDose / coffeeDoseForWater', () => {
  test('matches the pour-over worked example: 20 g @ 1:16 -> 320 g water', () => {
    expect(coffeeWaterForDose(20, 16)).toBe(320);
  });

  test('matches the espresso worked example: 18 g @ 1:2 -> 36 g yield', () => {
    expect(coffeeWaterForDose(18, 2)).toBe(36);
  });

  test('matches the cold brew worked example: 100 g @ 1:7 -> 700 g water', () => {
    expect(coffeeWaterForDose(100, 7)).toBe(700);
  });

  test('coffeeDoseForWater is the inverse of coffeeWaterForDose', () => {
    expect(coffeeDoseForWater(320, 16)).toBe(20);
    expect(coffeeDoseForWater(36, 2)).toBe(18);
  });
});

describe('convertTimeZone / minutesToTimeLabel', () => {
  test('matches the worked example: 22:00 UTC-5 -> UTC+9 is 12:00 next day', () => {
    const { destinationMinutes, dayOffset } = convertTimeZone(22, 0, -5, 9);
    expect(minutesToTimeLabel(destinationMinutes)).toBe('12:00');
    expect(dayOffset).toBe(1);
  });

  test('supports fractional offsets (e.g. UTC+5:30)', () => {
    const { destinationMinutes, dayOffset } = convertTimeZone(12, 0, 0, 5.5);
    expect(minutesToTimeLabel(destinationMinutes)).toBe('17:30');
    expect(dayOffset).toBe(0);
  });

  test('rolls back to the previous day when the result is negative', () => {
    const { destinationMinutes, dayOffset } = convertTimeZone(1, 0, 9, -5);
    expect(minutesToTimeLabel(destinationMinutes)).toBe('11:00');
    expect(dayOffset).toBe(-1);
  });

  test('same offset is a no-op (same time, same day)', () => {
    const { destinationMinutes, dayOffset } = convertTimeZone(9, 15, 2, 2);
    expect(minutesToTimeLabel(destinationMinutes)).toBe('09:15');
    expect(dayOffset).toBe(0);
  });
});

describe('doughHydrationPercent / doughWaterForHydration', () => {
  test('matches the worked example: 1000 g flour, 700 g water -> 70%', () => {
    expect(doughHydrationPercent(1000, 700)).toBe(70);
  });

  test('matches the worked example: 65% hydration, 500 g flour -> 325 g water', () => {
    expect(doughWaterForHydration(65, 500)).toBe(325);
  });

  test('the two functions are inverses of each other', () => {
    const hydration = doughHydrationPercent(800, 560);
    expect(doughWaterForHydration(hydration, 800)).toBeCloseTo(560, 10);
  });
});

const SALARY_TAX_BRACKETS = [
  { from: 0, rate: 0 },
  { from: 10000, rate: 0.20 },
  { from: 30000, rate: 0.35 },
];

describe('calculateProgressiveTax', () => {
  test('matches the worked example: €40,000 income across three brackets', () => {
    expect(calculateProgressiveTax(40000, SALARY_TAX_BRACKETS)).toBe(7500);
  });

  test('income entirely within the first (0%) bracket owes no tax', () => {
    expect(calculateProgressiveTax(5000, SALARY_TAX_BRACKETS)).toBe(0);
  });

  test('is unaffected by bracket input order', () => {
    const shuffled = [SALARY_TAX_BRACKETS[2], SALARY_TAX_BRACKETS[0], SALARY_TAX_BRACKETS[1]];
    expect(calculateProgressiveTax(40000, shuffled)).toBe(7500);
  });
});

describe('salaryAfterTax', () => {
  test('matches the worked example: €40,000 gross, 9% social security -> €28,900 net', () => {
    const { tax, socialSecurity, netIncome, netMonthly, effectiveRate } = salaryAfterTax(40000, SALARY_TAX_BRACKETS, 9);
    expect(tax).toBe(7500);
    expect(socialSecurity).toBe(3600);
    expect(netIncome).toBe(28900);
    expect(netMonthly).toBeCloseTo(2408.33, 2);
    expect(effectiveRate).toBeCloseTo(27.75, 2);
  });

  test('clamps net income at 0 instead of going negative for an over-deducting bracket table', () => {
    const { netIncome } = salaryAfterTax(10000, [{ from: 0, rate: 0.9 }], 50);
    expect(netIncome).toBe(0);
  });
});

describe('convertSalary', () => {
  test('matches the worked example: €25/hr, 40 hrs/week, 52 weeks/year -> €52,000/year', () => {
    const { annual, monthly } = convertSalary(25, 'hourly', 40, 52);
    expect(annual).toBe(52000);
    expect(monthly).toBeCloseTo(4333.33, 2);
  });

  test('fewer paid weeks per year lowers the annual figure', () => {
    const { annual, monthly } = convertSalary(25, 'hourly', 40, 48);
    expect(annual).toBe(48000);
    expect(monthly).toBe(4000);
  });

  test('converts from monthly to hourly and annual', () => {
    const { annual, hourly } = convertSalary(4333.33, 'monthly', 40, 52);
    expect(annual).toBeCloseTo(51999.96, 2);
    expect(hourly).toBeCloseTo(25, 1);
  });

  test('converts from annual to monthly and hourly', () => {
    const { monthly, hourly } = convertSalary(52000, 'annual', 40, 52);
    expect(monthly).toBeCloseTo(4333.33, 2);
    expect(hourly).toBe(25);
  });
});

const RENT_VS_BUY_BASE = {
  homePrice: 300000,
  downPayment: 60000,
  closingCosts: 5000,
  mortgageRatePercent: 4.5,
  mortgageTermYears: 30,
  annualOwnershipCostPercent: 2,
  appreciationRatePercent: 3,
  monthlyRent: 1200,
  rentGrowthRatePercent: 2,
  investmentReturnRatePercent: 6,
  horizonYears: 10,
};

describe('rentVsBuyComparison', () => {
  test('matches a precise computation of the issue\'s own formulas over a 10-year horizon', () => {
    const result = rentVsBuyComparison(RENT_VS_BUY_BASE);
    expect(result.netCostBuy).toBeCloseTo(70811.87, 1);
    expect(result.netCostRent).toBeCloseTo(110225.12, 1);
    expect(result.homeValueAtHorizon).toBeCloseTo(403174.91, 1);
    expect(result.remainingLoanBalance).toBeCloseTo(192214.64, 1);
  });

  test('remaining loan balance is 0 once the horizon exceeds the mortgage term', () => {
    const { remainingLoanBalance } = rentVsBuyComparison({ ...RENT_VS_BUY_BASE, horizonYears: 35 });
    expect(remainingLoanBalance).toBe(0);
  });

  test('a longer horizon builds more home equity', () => {
    const shortHorizon = rentVsBuyComparison({ ...RENT_VS_BUY_BASE, horizonYears: 5 });
    const longHorizon = rentVsBuyComparison({ ...RENT_VS_BUY_BASE, horizonYears: 20 });
    expect(longHorizon.equity).toBeGreaterThan(shortHorizon.equity);
  });

  test('0% mortgage rate does not throw (division-by-zero guard in the underlying amortization)', () => {
    const { netCostBuy } = rentVsBuyComparison({ ...RENT_VS_BUY_BASE, mortgageRatePercent: 0 });
    expect(Number.isFinite(netCostBuy)).toBe(true);
  });
});

describe('fuelCostMetric', () => {
  test('matches the worked example: 500 km, 6.5 L/100km, €1.55/L', () => {
    const { fuelUsed, totalCost } = fuelCostMetric(500, 6.5, 1.55);
    expect(fuelUsed).toBeCloseTo(32.5, 5);
    expect(totalCost).toBeCloseTo(50.375, 5);
  });
});

describe('fuelCostImperial', () => {
  test('30 mpg over 300 miles at $3.50/gal', () => {
    const { fuelUsed, totalCost, costPerDistance } = fuelCostImperial(300, 30, 3.5);
    expect(fuelUsed).toBe(10);
    expect(totalCost).toBe(35);
    expect(costPerDistance).toBeCloseTo(0.1167, 3);
  });
});

describe('retirementProjection', () => {
  test('matches the worked example: age 35 -> 65, €40,000 + €400/mo at 6%', () => {
    const { yearsRemaining, futureValue, totalContributed, totalGrowth } = retirementProjection(35, 65, 40000, 400, 6);
    expect(yearsRemaining).toBe(30);
    expect(futureValue).toBeCloseTo(642709.03, 1);
    expect(totalContributed).toBe(184000);
    expect(totalGrowth).toBeCloseTo(458709.03, 1);
  });
});

describe('retirementCountdown', () => {
  test('matches the worked example: 30 years remaining is about 10,957-10,958 days', () => {
    const { retirementDate, daysRemaining } = retirementCountdown(new Date('2024-01-01T00:00:00Z'), 30);
    expect(retirementDate.toISOString()).toBe('2054-01-01T00:00:00.000Z');
    expect(daysRemaining).toBe(10958);
  });

  test('0 years remaining is today, with 0 days left', () => {
    const from = new Date('2024-06-15T00:00:00Z');
    const { daysRemaining } = retirementCountdown(from, 0);
    expect(daysRemaining).toBe(0);
  });
});

describe('jetLagRecoveryDays', () => {
  test('matches the worked example: 6 zones eastward -> 6 days, westward -> 3 days', () => {
    expect(jetLagRecoveryDays(6, 'east')).toBe(6);
    expect(jetLagRecoveryDays(6, 'west')).toBe(3);
  });

  test('rounds up to a whole day', () => {
    expect(jetLagRecoveryDays(9, 'west')).toBe(5);
  });
});

describe('jetLagDirectionFromOffsets', () => {
  test('matches the worked example: Paris (+1) to Los Angeles (-8) is 9 zones west', () => {
    const { direction, zonesCrossed } = jetLagDirectionFromOffsets(1, -8);
    expect(direction).toBe('west');
    expect(zonesCrossed).toBe(9);
  });

  test('identical offsets mean no jet lag', () => {
    const { direction, zonesCrossed } = jetLagDirectionFromOffsets(2, 2);
    expect(direction).toBe('none');
    expect(zonesCrossed).toBe(0);
  });

  test('wraps around the 24-hour circle to find the shorter direction', () => {
    const { direction, zonesCrossed } = jetLagDirectionFromOffsets(-10, 11);
    expect(direction).toBe('west');
    expect(zonesCrossed).toBe(3);
  });
});

describe('evFullChargeCost / evRange', () => {
  test('matches the worked example: 60 kWh battery, 16 kWh/100km, €0.30/kWh, 90% charging efficiency', () => {
    const { energyFromWall, cost } = evFullChargeCost(60, 0.30, 90);
    expect(energyFromWall).toBeCloseTo(66.6667, 3);
    expect(cost).toBeCloseTo(20, 5);
    expect(evRange(60, 16)).toBe(375);
  });
});

describe('evTripCost / evCostPer100km', () => {
  test('cost per 100km matches efficiency times price', () => {
    expect(evCostPer100km(16, 0.30)).toBeCloseTo(4.8, 5);
  });

  test('a specific trip cost scales linearly with distance', () => {
    const { energyUsed, cost } = evTripCost(100, 16, 0.30);
    expect(energyUsed).toBe(16);
    expect(cost).toBeCloseTo(4.8, 5);
  });
});

describe('fireCalculator', () => {
  test('matches the worked example: €60k income, €30k expenses, €50k savings, 6% return, 4% SWR', () => {
    const { fiTarget, yearsToFI, annualSavings, savingsRatePercent, alreadyFI } =
      fireCalculator(60000, 30000, 50000, 6, 4);

    expect(fiTarget).toBe(750000);
    expect(annualSavings).toBe(30000);
    expect(savingsRatePercent).toBeCloseTo(50, 5);
    expect(alreadyFI).toBe(false);
    expect(yearsToFI).toBeCloseTo(14.09, 2);
  });

  test('r = 0 falls back to linear years (no compounding)', () => {
    const { yearsToFI } = fireCalculator(60000, 30000, 50000, 0, 4);
    expect(yearsToFI).toBeCloseTo((750000 - 50000) / 30000, 5);
  });

  test('already financially independent when current savings meet or exceed the FI target', () => {
    const result = fireCalculator(60000, 30000, 750000, 6, 4);
    expect(result.alreadyFI).toBe(true);
    expect(result.yearsToFI).toBe(0);

    const overshoot = fireCalculator(60000, 30000, 900000, 6, 4);
    expect(overshoot.alreadyFI).toBe(true);
    expect(overshoot.yearsToFI).toBe(0);
  });

  test('FI never reached when annual savings is zero or negative', () => {
    const zeroSavings = fireCalculator(30000, 30000, 10000, 6, 4);
    expect(zeroSavings.annualSavings).toBe(0);
    expect(zeroSavings.alreadyFI).toBe(false);
    expect(zeroSavings.yearsToFI).toBe(Infinity);

    const overspending = fireCalculator(30000, 40000, 10000, 6, 4);
    expect(overspending.annualSavings).toBe(-10000);
    expect(overspending.alreadyFI).toBe(false);
    expect(overspending.yearsToFI).toBe(Infinity);
  });
});

describe('petrolDieselBreakEven', () => {
  test('matches the worked example with annual mileage: €2000 premium, 7.0L/100km @ €1.60 vs 5.5L/100km @ €1.50, 15000 km/year', () => {
    const result = petrolDieselBreakEven(2000, 7.0, 1.60, 5.5, 1.50, 15000);

    expect(result.costPerKmPetrol).toBeCloseTo(0.112, 5);
    expect(result.costPerKmDiesel).toBeCloseTo(0.0825, 5);
    expect(result.savingsPerKm).toBeCloseTo(0.0295, 5);
    expect(result.breakEvenDistanceKm).toBeCloseTo(67796.61, 1);
    expect(result.breakEvenYears).toBeCloseTo(4.52, 1);
    expect(result.neverBreaksEven).toBe(false);
  });

  test('matches the worked example without annual mileage: breakEvenYears is null', () => {
    const result = petrolDieselBreakEven(2000, 7.0, 1.60, 5.5, 1.50);

    expect(result.breakEvenDistanceKm).toBeCloseTo(67796.61, 1);
    expect(result.breakEvenYears).toBeNull();
  });

  test('diesel never breaks even when it costs the same or more per km than petrol', () => {
    const sameCost = petrolDieselBreakEven(2000, 6.0, 2.00, 6.0, 2.00, 15000);
    expect(sameCost.neverBreaksEven).toBe(true);
    expect(sameCost.breakEvenDistanceKm).toBeNull();
    expect(sameCost.breakEvenYears).toBeNull();

    const dieselPricier = petrolDieselBreakEven(2000, 7.0, 1.60, 7.0, 1.90, 15000);
    expect(dieselPricier.neverBreaksEven).toBe(true);
    expect(dieselPricier.breakEvenDistanceKm).toBeNull();
  });

  test('a negative price premium (diesel cheaper upfront) breaks even immediately', () => {
    const result = petrolDieselBreakEven(-500, 7.0, 1.60, 5.5, 1.50, 15000);

    expect(result.neverBreaksEven).toBe(false);
    expect(result.breakEvenDistanceKm).toBe(0);
    expect(result.breakEvenYears).toBe(0);
  });
});

describe('ruleOf72', () => {
  test('matches the worked example at 8%: 72/8, 69.3/8, 70/8, and the exact log formula', () => {
    const result = ruleOf72(8);

    expect(result.rule72Years).toBeCloseTo(9.0, 5);
    expect(result.rule693Years).toBeCloseTo(8.6625, 5);
    expect(result.rule70Years).toBeCloseTo(8.75, 5);
    expect(result.exactYears).toBeCloseTo(9.006, 2);
  });

  test('at a low rate, the rule-of-thumb approximations are close to the exact value (in relative terms)', () => {
    const result = ruleOf72(2);

    expect(result.rule72Years).toBeCloseTo(36, 5);
    expect(result.rule693Years).toBeCloseTo(34.65, 5);
    expect(result.rule70Years).toBeCloseTo(35, 5);

    const relativeDivergence = Math.abs(result.rule72Years - result.exactYears) / result.exactYears;
    expect(relativeDivergence).toBeLessThan(0.03);
  });

  test('at a high rate, the approximations diverge more noticeably from the exact value than at a low rate', () => {
    const low = ruleOf72(2);
    const high = ruleOf72(30);

    expect(high.rule72Years).toBeCloseTo(2.4, 5);
    expect(high.rule693Years).toBeCloseTo(2.31, 5);
    expect(high.rule70Years).toBeCloseTo(2.3333, 3);

    // Rule of 72's error grows with the rate in relative terms (absolute
    // years-to-double shrinks fast at high rates, so relative divergence is
    // the meaningful, monotonically-increasing comparison here).
    const lowDivergence = Math.abs(low.rule72Years - low.exactYears) / low.exactYears;
    const highDivergence = Math.abs(high.rule72Years - high.exactYears) / high.exactYears;
    expect(highDivergence).toBeGreaterThan(lowDivergence);
  });
});
