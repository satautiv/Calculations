const {
  epleyOneRepMax,
  brzyckiOneRepMax,
  lombardiOneRepMax,
  mayhewOneRepMax,
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
  simpleAverage,
  weightedAverage,
  descriptiveStats,
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
  originalValueFromPercentChange,
  gcd,
  simplifyFraction,
  fractionArithmetic,
  simplifyRatio,
  solveProportion,
  luggageWeightCheck,
  ageBreakdown,
  nextBirthdayCountdown,
  dayOfYear,
  sunriseSunset,
  formatMinutesAsLocalTime,
  formatDurationHM,
  warmupSets,
  dateDifference,
  dotsCoefficient,
  dotsScore,
  addDaysToDate,
  weekdayName,
  checkPlugAdapterNeeds,
  workingDaysBetween,
  addWorkingDays,
  timeToSeconds,
  secondsToHMS,
  secondsToDecimalHours,
  addSubtractDurations,
  timeOfDayDuration,
  glCoefficient,
  glPoints,
  convertUnit,
  convertToAllUnits,
  ffmi,
  ffmiCategory,
  leanBodyMassFromBodyFat,
  leanBodyMassBoer,
  navyBodyFatPercent,
  bmrMifflinStJeor,
  tdeeFromBmr,
  macroGrams,
  weightLossTimeline,
  bulkCalories,
  paceFromDistanceTime,
  timeFromDistancePace,
  distanceFromTimePace,
  convertPacePerUnit,
  paintNeeded,
  roundUpToCans,
  wallpaperRollsNeeded,
  flooringNeeded,
  riegelPredictedTime,
  tilesNeeded,
  rectangularConcreteVolume,
  cylindricalConcreteVolume,
  concreteBagsNeeded,
  karvonenZones,
  bedtimesForWakeTime,
  wakeTimesForBedtime,
  cooperVO2max,
  vo2maxCategory,
  dailyWaterIntake,
  caffeineRemaining,
  gravelNeeded,
  alcoholGramsFromDrinkCount,
  alcoholGramsFromVolume,
  widmarkBAC,
  estimateFTP,
  ftpPowerZones,
  ftpPowerToWeight,
  mulchVolumeNeeded,
  roofPitchMultiplier,
  roofArea,
  roofPitchConversions,
  convertClimbingGrade,
  ladderPlan,
  timeToBurnMinutes,
  dogHumanAge,
  catHumanAge,
  dueDateFromLmp,
  dueDateFromConception,
  gestationalAgeDays,
  pregnancyMilestones,
  pregnancyTrimester,
  earthRotationSpeedKmh,
  earthTravelDistance,
  deckingMaterialsNeeded,
  staircasePlan,
  panelFenceCalculation,
  railFenceCalculation,
  INSULATION_FACTOR_PRESETS,
  heatingCost,
  detectTimestampUnit,
  timestampToDate,
  formatDateInTimeZone,
  dateFieldsToEpoch,
  relativeTimeFromNow,
  base64Encode,
  base64Decode,
  findRegexMatches,
  applyRegexReplacement,
  horizonDistance,
  solarPanelSizing,
  solarPaybackPeriod,
  projectileMotion,
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
  convertCssUnits,
  k8sResourcePlan,
  tokenizeSql,
  formatSql,
  minifySql,
} = require('../js/calc-lib');

describe('epleyOneRepMax', () => {
  test('returns weight unchanged for 1 rep', () => {
    expect(epleyOneRepMax(100, 1)).toBe(100);
  });

  test('estimates a higher max for more reps', () => {
    expect(epleyOneRepMax(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe('brzyckiOneRepMax', () => {
  test('estimates 1RM from weight and reps', () => {
    expect(brzyckiOneRepMax(100, 5)).toBe(112.5);
  });
});

describe('lombardiOneRepMax', () => {
  test('estimates 1RM from weight and reps', () => {
    expect(lombardiOneRepMax(100, 5)).toBeCloseTo(117.46, 2);
  });
});

describe('mayhewOneRepMax', () => {
  test('estimates 1RM from weight and reps', () => {
    // Computed directly from the formula: (100*100) / (52.2 + 41.9 * e^(-0.055*5)).
    expect(mayhewOneRepMax(100, 5)).toBeCloseTo(119.01, 2);
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

  test('yearly breakdown has one entry per whole year, ending at the future value', () => {
    const { futureValue, yearly } = compoundInterest(1000, 5, 12, 10);
    expect(yearly).toHaveLength(10);
    expect(yearly[0].year).toBe(1);
    expect(yearly[9].year).toBe(10);
    expect(yearly[9].balance).toBeCloseTo(futureValue, 5);
    expect(yearly[9].interestEarned).toBeCloseTo(futureValue - 1000, 5);
  });

  test('yearly breakdown only includes whole years for a fractional term', () => {
    const { yearly } = compoundInterest(1000, 5, 12, 2.5);
    expect(yearly).toHaveLength(2);
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

  test('schedule has one entry per month, ending at a near-zero balance', () => {
    const { months, schedule } = creditCardPayoffFixed(3000, 22, 150);
    expect(schedule).toHaveLength(months);
    expect(schedule[0].month).toBe(1);
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 5);
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

  test('schedule has one entry per month, ending at a near-zero balance', () => {
    const { months, schedule } = creditCardPayoffMinimum(3000, 22);
    expect(schedule).toHaveLength(months);
    expect(schedule[schedule.length - 1].balance).toBeCloseTo(0, 5);
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

  test('schedule has one entry per period, ending at the final balance', () => {
    const { finalBalance, schedule } = requiredSavingsContribution(10000, 1000, 4, 12, 36);
    expect(schedule).toHaveLength(36);
    expect(schedule[0].period).toBe(1);
    expect(schedule[35].period).toBe(36);
    expect(schedule[35].balance).toBeCloseTo(finalBalance, 5);
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

describe('progressiveTaxBreakdown', () => {
  test('breaks €40,000 income down into its three reached brackets, summing to the total tax', () => {
    const { tax, breakdown } = progressiveTaxBreakdown(40000, SALARY_TAX_BRACKETS);
    expect(tax).toBe(7500);
    expect(breakdown).toEqual([
      { from: 0, to: 10000, rate: 0, taxableAmount: 10000, taxOwed: 0 },
      { from: 10000, to: 30000, rate: 0.2, taxableAmount: 20000, taxOwed: 4000 },
      { from: 30000, to: 40000, rate: 0.35, taxableAmount: 10000, taxOwed: 3500 },
    ]);
    expect(breakdown.reduce((sum, b) => sum + b.taxOwed, 0)).toBe(tax);
  });

  test('only includes brackets actually reached by income', () => {
    const { breakdown } = progressiveTaxBreakdown(5000, SALARY_TAX_BRACKETS);
    expect(breakdown).toHaveLength(1);
    expect(breakdown[0].to).toBe(5000);
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

  test('exposes the same per-bracket breakdown as progressiveTaxBreakdown', () => {
    const { breakdown } = salaryAfterTax(40000, SALARY_TAX_BRACKETS, 9);
    expect(breakdown).toEqual(progressiveTaxBreakdown(40000, SALARY_TAX_BRACKETS).breakdown);
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

  test('yearly breakdown has one entry per year, ending at the horizon totals', () => {
    const result = rentVsBuyComparison(RENT_VS_BUY_BASE);
    expect(result.yearly).toHaveLength(10);
    expect(result.yearly[0].year).toBe(1);
    expect(result.yearly[9].year).toBe(10);
    expect(result.yearly[9].cumulativeNetCostBuy).toBeCloseTo(result.netCostBuy, 5);
    expect(result.yearly[9].cumulativeNetCostRent).toBeCloseTo(result.netCostRent, 5);
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

describe('jetLagDailySchedule', () => {
  test('spreads 6 zones eastward evenly across 6 recovery days, shifting earlier each day', () => {
    const schedule = jetLagDailySchedule(6, 'east', 6);
    expect(schedule).toHaveLength(6);
    expect(schedule[0]).toEqual({ day: 1, dailyShiftHours: -1, cumulativeShiftHours: -1 });
    expect(schedule[5]).toEqual({ day: 6, dailyShiftHours: -1, cumulativeShiftHours: -6 });
  });

  test('spreads 6 zones westward evenly across 3 recovery days, shifting later each day', () => {
    const schedule = jetLagDailySchedule(6, 'west', 3);
    expect(schedule).toHaveLength(3);
    expect(schedule[0]).toEqual({ day: 1, dailyShiftHours: 2, cumulativeShiftHours: 2 });
    expect(schedule[2]).toEqual({ day: 3, dailyShiftHours: 2, cumulativeShiftHours: 6 });
  });

  test('cumulative shift on the final day equals the total zones crossed', () => {
    const schedule = jetLagDailySchedule(9, 'west', 5);
    expect(schedule[schedule.length - 1].cumulativeShiftHours).toBeCloseTo(9, 10);
  });

  test('throws for non-positive zones or recovery days', () => {
    expect(() => jetLagDailySchedule(0, 'east', 6)).toThrow();
    expect(() => jetLagDailySchedule(6, 'east', 0)).toThrow();
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

describe('evChargingTimeHours', () => {
  test('divides energy needed by charger power', () => {
    expect(evChargingTimeHours(66.6667, 7.4)).toBeCloseTo(9.009, 3);
    expect(evChargingTimeHours(50, 50)).toBe(1);
  });

  test('throws for non-positive charger power', () => {
    expect(() => evChargingTimeHours(50, 0)).toThrow();
    expect(() => evChargingTimeHours(50, -1)).toThrow();
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

describe('evVsPetrolTCO', () => {
  test('matches the worked example: 5 years, 15000 km/year, EV cheaper overall', () => {
    const result = evVsPetrolTCO({
      years: 5,
      annualMileageKm: 15000,
      evPurchasePrice: 35000,
      evResaleValue: 18000,
      evEfficiencyKWh100km: 16,
      electricityPricePerKWh: 0.30,
      evMaintenancePerYear: 400,
      petrolPurchasePrice: 28000,
      petrolResaleValue: 13000,
      petrolConsumptionL100km: 6.5,
      petrolPricePerL: 1.60,
      petrolMaintenancePerYear: 700,
    });

    expect(result.evTCO).toBe(22600);
    expect(result.petrolTCO).toBe(26300);
    expect(result.difference).toBe(3700);
    expect(result.cheaper).toBe('ev');
    expect(result.evBreakdown).toEqual({ netPurchase: 17000, energyOrFuel: 3600, maintenance: 2000 });
    expect(result.petrolBreakdown).toEqual({ netPurchase: 15000, energyOrFuel: 7800, maintenance: 3500 });
  });

  test('petrol comes out cheaper when the EV has a high purchase price and low resale, and petrol is efficient', () => {
    const result = evVsPetrolTCO({
      years: 5,
      annualMileageKm: 15000,
      evPurchasePrice: 45000,
      evResaleValue: 15000,
      evEfficiencyKWh100km: 18,
      electricityPricePerKWh: 0.35,
      evMaintenancePerYear: 300,
      petrolPurchasePrice: 20000,
      petrolResaleValue: 8000,
      petrolConsumptionL100km: 5,
      petrolPricePerL: 1.50,
      petrolMaintenancePerYear: 500,
    });

    expect(result.evTCO).toBe(36225);
    expect(result.petrolTCO).toBe(20125);
    expect(result.difference).toBe(-16100);
    expect(result.cheaper).toBe('petrol');
  });
});

describe('carDepreciationDecliningBalance', () => {
  test('matches the worked example: €30,000 at 15%/year over 5 years', () => {
    const result = carDepreciationDecliningBalance(30000, 15, 5);

    expect(result.valueAtYearN).toBeCloseTo(13311.16, 1);
    expect(result.totalDepreciation).toBeCloseTo(16688.84, 1);
    expect(result.totalDepreciationPercent).toBeCloseTo(55.63, 1);
    expect(result.yearly).toHaveLength(5);
    expect(result.yearly[4].value).toBeCloseTo(result.valueAtYearN, 6);
  });

  test('never goes negative or NaN even at a high rate over many years', () => {
    const result = carDepreciationDecliningBalance(30000, 90, 20);

    expect(result.valueAtYearN).toBeGreaterThan(0);
    expect(result.valueAtYearN).toBeLessThan(30000);
    expect(Number.isNaN(result.valueAtYearN)).toBe(false);
  });
});

describe('carDepreciationStraightLine', () => {
  test('matches the worked example: €30,000 price, €10,000 residual, 8-year life, at year 4', () => {
    const result = carDepreciationStraightLine(30000, 10000, 8, 4);

    expect(result.valueAtYearN).toBeCloseTo(20000, 6);
    expect(result.totalDepreciation).toBeCloseTo(10000, 6);
    expect(result.totalDepreciationPercent).toBeCloseTo((10000 / 30000) * 100, 6);
    expect(result.yearly).toHaveLength(4);
    expect(result.yearly[3].value).toBeCloseTo(result.valueAtYearN, 6);
  });
});

describe('tripBudget', () => {
  test('matches the worked example: 7-day trip with daily and fixed costs', () => {
    const result = tripBudget({
      days: 7,
      accommodationPerDay: 80,
      foodPerDay: 40,
      activitiesPerDay: 25,
      transportPerDay: 10,
      flights: 350,
      insurance: 45,
    });

    expect(result.dailyTotal).toBe(155);
    expect(result.variableCost).toBe(1085);
    expect(result.fixedCost).toBe(395);
    expect(result.totalTripCost).toBe(1480);
    expect(result.averageCostPerDay).toBeCloseTo(211.43, 2);
  });

  test('zero per-day costs with only fixed costs still produces a valid total', () => {
    const result = tripBudget({
      days: 5,
      accommodationPerDay: 0,
      foodPerDay: 0,
      activitiesPerDay: 0,
      transportPerDay: 0,
      flights: 300,
      insurance: 50,
    });

    expect(result.dailyTotal).toBe(0);
    expect(result.variableCost).toBe(0);
    expect(result.fixedCost).toBe(350);
    expect(result.totalTripCost).toBe(350);
    expect(result.averageCostPerDay).toBe(70);
  });

  test('applies a flat multiplier for multiple travelers', () => {
    const result = tripBudget({
      days: 7,
      accommodationPerDay: 80,
      foodPerDay: 40,
      activitiesPerDay: 25,
      transportPerDay: 10,
      flights: 350,
      insurance: 45,
      travelers: 2,
    });

    expect(result.totalTripCost).toBe(2960);
    expect(result.averageCostPerDay).toBeCloseTo(422.86, 2);
  });

  test('per-category breakdown sums to the total trip cost and reports correct percentages', () => {
    const result = tripBudget({
      days: 7,
      accommodationPerDay: 80,
      foodPerDay: 40,
      activitiesPerDay: 25,
      transportPerDay: 10,
      flights: 350,
      insurance: 45,
      travelers: 2,
    });

    const accommodation = result.categories.find((c) => c.label === 'Accommodation');
    expect(accommodation.amount).toBe(1120); // 80 * 7 * 2
    expect(accommodation.percentOfTotal).toBeCloseTo((1120 / 2960) * 100, 5);

    const flights = result.categories.find((c) => c.label === 'Flights');
    expect(flights.amount).toBe(700); // 350 * 2

    const sumOfCategories = result.categories.reduce((sum, c) => sum + c.amount, 0);
    expect(sumOfCategories).toBeCloseTo(result.totalTripCost, 8);
  });

  test('categories default to zero percent when total trip cost is zero', () => {
    const result = tripBudget({
      days: 3,
      accommodationPerDay: 0,
      foodPerDay: 0,
      activitiesPerDay: 0,
      transportPerDay: 0,
      flights: 0,
      insurance: 0,
    });

    expect(result.categories.every((c) => c.amount === 0 && c.percentOfTotal === 0)).toBe(true);
  });
});

describe('car loan/lease payment', () => {
  test('loan mode (via existing loanMonthlyPayment) matches the worked example: €25,000 at 6% for 60 months', () => {
    const principal = 25000;
    const monthlyPayment = loanMonthlyPayment(principal, 6, 60);
    const totalPaid = monthlyPayment * 60;
    const totalInterest = totalPaid - principal;

    expect(monthlyPayment).toBeCloseTo(483.32, 2);
    expect(totalPaid).toBeCloseTo(28999.20, 1);
    expect(totalInterest).toBeCloseTo(3999.20, 1);
  });

  test('carLeasePayment matches the worked example: cap cost €25,000, residual €12,000, 36 months, 6% APR', () => {
    const result = carLeasePayment(25000, 12000, 36, 6);

    expect(result.depreciationFee).toBeCloseTo(361.11, 2);
    expect(result.financeFee).toBeCloseTo(92.5, 2);
    expect(result.monthlyPayment).toBeCloseTo(453.61, 2);
    expect(result.totalPaid).toBeCloseTo(453.61 * 36, 1);
  });

  test('carLeasePayment with 0% APR has zero finance fee, payment is depreciation only', () => {
    const result = carLeasePayment(25000, 12000, 36, 0);

    expect(result.financeFee).toBe(0);
    expect(result.monthlyPayment).toBeCloseTo(361.11, 2);
  });

  test('carLeasePayment does not crash when residual value >= cap cost (DOM layer is responsible for rejecting this)', () => {
    expect(() => carLeasePayment(12000, 12000, 36, 6)).not.toThrow();
    expect(() => carLeasePayment(10000, 12000, 36, 6)).not.toThrow();
  });
});

describe('engine power & torque converter', () => {
  test('hpToKw matches the worked example: 300 HP -> 223.70996159999999 kW', () => {
    expect(hpToKw(300)).toBeCloseTo(223.71, 2);
  });

  test('kwToHp is the inverse of hpToKw (round-trip)', () => {
    expect(kwToHp(hpToKw(300))).toBeCloseTo(300, 6);
  });

  test('nmToLbft matches the worked example: 400 Nm -> 295.02485934782027 lb-ft', () => {
    expect(nmToLbft(400)).toBeCloseTo(295.02, 2);
  });

  test('lbftToNm is the inverse of nmToLbft (round-trip)', () => {
    expect(lbftToNm(nmToLbft(400))).toBeCloseTo(400, 6);
  });

  test('powerFromTorqueNmAndRpm + kwToHp matches the worked example: 400 Nm at 5500 RPM -> 230.39544235924936 kW / 308.96537737269364 HP', () => {
    const kw = powerFromTorqueNmAndRpm(400, 5500);
    expect(kw).toBeCloseTo(230.40, 2);
    expect(kwToHp(kw)).toBeCloseTo(308.97, 2);
  });
});

describe('accelerationTimeEstimate', () => {
  test('matches the worked example: 1600 kg, 375 kW, 0.40 efficiency, 100 km/h -> ~4.115 s', () => {
    const result = accelerationTimeEstimate(1600, 375000, 0.40, 100);
    expect(result.timeSeconds).toBeCloseTo(4.115, 2);
    expect(result.targetSpeedKmh).toBe(100);
  });

  test('higher power gives a shorter time, holding mass/efficiency/speed constant', () => {
    const lowerPower = accelerationTimeEstimate(1600, 200000, 0.40, 100).timeSeconds;
    const higherPower = accelerationTimeEstimate(1600, 400000, 0.40, 100).timeSeconds;
    expect(higherPower).toBeLessThan(lowerPower);
  });

  test('higher mass gives a longer time, holding power/efficiency/speed constant', () => {
    const lighterCar = accelerationTimeEstimate(1200, 300000, 0.40, 100).timeSeconds;
    const heavierCar = accelerationTimeEstimate(1800, 300000, 0.40, 100).timeSeconds;
    expect(heavierCar).toBeGreaterThan(lighterCar);
  });

  test('uses the default efficiency (0.40) and default target speed (100 km/h) when not provided', () => {
    const withDefaults = accelerationTimeEstimate(1600, 375000);
    const withExplicitDefaults = accelerationTimeEstimate(1600, 375000, 0.40, 100);
    expect(withDefaults.timeSeconds).toBeCloseTo(withExplicitDefaults.timeSeconds, 10);
    expect(withDefaults.targetSpeedKmh).toBe(100);
  });

  test('a custom target speed changes the result accordingly', () => {
    const to100 = accelerationTimeEstimate(1600, 375000, 0.40, 100).timeSeconds;
    const to200 = accelerationTimeEstimate(1600, 375000, 0.40, 200).timeSeconds;
    // kinetic energy scales with v^2, so doubling target speed quadruples the time
    expect(to200).toBeCloseTo(to100 * 4, 6);
  });
});

describe('Gear Ratio / RPM calculator', () => {
  test('speedFromRpm matches the worked example: 3000 RPM, 1.310 gear ratio, 3.73 final drive, 650.24 mm tyre -> ~75.25 km/h', () => {
    const { wheelRpm, speedKmh } = speedFromRpm(3000, 1.310, 3.73, 650.24);
    expect(wheelRpm).toBeCloseTo(613.961484149561, 6);
    expect(speedKmh).toBeCloseTo(75.25, 2);
  });

  test('rpmFromSpeed is the inverse of speedFromRpm: recovers ~3000 RPM from the worked example speed', () => {
    const { engineRpm } = rpmFromSpeed(75.25163360265249, 1.310, 3.73, 650.24);
    expect(engineRpm).toBeCloseTo(3000, 1);
  });

  test('a taller (higher) final drive ratio gives a lower speed for the same RPM', () => {
    const lowerFinalDrive = speedFromRpm(3000, 1.310, 3.42, 650.24).speedKmh;
    const higherFinalDrive = speedFromRpm(3000, 1.310, 3.73, 650.24).speedKmh;
    expect(higherFinalDrive).toBeLessThan(lowerFinalDrive);
  });
});

describe('Tire Size & Speedometer Error calculator', () => {
  test('tyreDiameterMm matches the worked example: 225/45R17 -> 634.3mm', () => {
    expect(tyreDiameterMm(225, 45, 17)).toBeCloseTo(634.3, 5);
  });

  test('tyreDiameterMm matches the worked example: 235/40R18 -> 645.2mm', () => {
    expect(tyreDiameterMm(235, 40, 18)).toBeCloseTo(645.2, 5);
  });

  test('tyreCircumferenceMm matches circumference = pi * diameter', () => {
    expect(tyreCircumferenceMm(634.3)).toBeCloseTo(Math.PI * 634.3, 10);
  });

  test('tyreSizeComparison matches the worked example: 225/45R17 vs 235/40R18 at 100 km/h displayed', () => {
    const originalDiameterMm = tyreDiameterMm(225, 45, 17);
    const newDiameterMm = tyreDiameterMm(235, 40, 18);
    const result = tyreSizeComparison(originalDiameterMm, newDiameterMm, 100);

    expect(result.diameterChangePercent).toBeCloseTo(1.7184, 3);
    expect(result.actualSpeed).toBeCloseTo(101.72, 1);
  });

  test('tyreSizeComparison returns a null actualSpeed when no displayed speed is provided', () => {
    const originalDiameterMm = tyreDiameterMm(225, 45, 17);
    const newDiameterMm = tyreDiameterMm(235, 40, 18);
    const result = tyreSizeComparison(originalDiameterMm, newDiameterMm);

    expect(result.actualSpeed).toBeNull();
    expect(result.diameterChangePercent).toBeCloseTo(1.7184, 3);
  });

  test('tyreSizeComparison reports a negative diameterChangePercent for a smaller new tyre', () => {
    const result = tyreSizeComparison(650, 600, 100);
    expect(result.diameterChangePercent).toBeLessThan(0);
    expect(result.actualSpeed).toBeLessThan(100);
  });
});

describe('Currency Converter calculator', () => {
  test('convertCurrency matches the worked example: 250 USD at rate 0.92 -> 230.00 EUR', () => {
    // Note: the source issue states this example as "232.00", but
    // 250 x 0.92 = 230.00 — the correct result of the specified formula.
    expect(convertCurrency(250, 0.92)).toBe(230);
  });

  test('inverseExchangeRate matches the worked example: inverse of 0.92 -> ~1.0869565217391', () => {
    expect(inverseExchangeRate(0.92)).toBeCloseTo(1.0869565217391, 10);
  });

  test('convertCurrency using the swapped inverse rate matches the worked example: 100 EUR -> ~108.70 USD', () => {
    const inverseRate = inverseExchangeRate(0.92);
    expect(convertCurrency(100, inverseRate)).toBeCloseTo(108.70, 1);
  });

  test('convertCurrency with a zero amount converts to zero', () => {
    expect(convertCurrency(0, 0.92)).toBe(0);
  });

  test('convertCurrency computes correctly with a very small rate without special-casing', () => {
    expect(convertCurrency(1000, 0.0001)).toBeCloseTo(0.1, 10);
  });
});

describe('Wheel Offset & Clearance (ET) calculator', () => {
  test('wheelOffsetShift matches the worked example: 8J ET35 -> 9J ET25', () => {
    const { outwardShiftMm, inwardShiftMm } = wheelOffsetShift(8, 35, 9, 25);
    expect(outwardShiftMm).toBeCloseTo(22.7, 5);
    expect(inwardShiftMm).toBeCloseTo(2.7, 5);
  });

  test('wheelOffsetShift flips sign when only ET increases (same width, higher ET tucks the wheel in)', () => {
    const { outwardShiftMm, inwardShiftMm } = wheelOffsetShift(8, 35, 8, 45);
    expect(outwardShiftMm).toBeCloseTo(-10, 5);
    expect(inwardShiftMm).toBeCloseTo(10, 5);
  });

  test('wheelOffsetShift returns zero shift for an identical width and offset', () => {
    const { outwardShiftMm, inwardShiftMm } = wheelOffsetShift(8, 35, 8, 35);
    expect(outwardShiftMm).toBe(0);
    expect(inwardShiftMm).toBe(0);
  });
});

describe('Roof Box Fuel Penalty calculator', () => {
  test('roofBoxFuelPenalty matches the worked example: 6.0 L/100km, 20% penalty, 800 km, €1.60/L', () => {
    const { newConsumption, extraConsumption, extraFuel, extraCost } = roofBoxFuelPenalty(6.0, 20, 800, 1.60);
    expect(extraConsumption).toBeCloseTo(1.2, 5);
    expect(newConsumption).toBeCloseTo(7.2, 5);
    expect(extraFuel).toBeCloseTo(9.6, 5);
    expect(extraCost).toBeCloseTo(15.36, 2);
  });

  test('roofBoxFuelPenalty produces no extra fuel/cost at a 0% penalty, and newConsumption equals base', () => {
    const { newConsumption, extraConsumption, extraFuel, extraCost } = roofBoxFuelPenalty(6.0, 0, 800, 1.60);
    expect(newConsumption).toBe(6.0);
    expect(extraConsumption).toBe(0);
    expect(extraFuel).toBe(0);
    expect(extraCost).toBe(0);
  });

  test('roofBoxFuelPenalty scales extra cost proportionally with a higher penalty percentage', () => {
    const lowerPenalty = roofBoxFuelPenalty(6.0, 10, 800, 1.60);
    const higherPenalty = roofBoxFuelPenalty(6.0, 20, 800, 1.60);
    expect(higherPenalty.extraCost).toBeCloseTo(lowerPenalty.extraCost * 2, 5);
    expect(higherPenalty.extraCost).toBeGreaterThan(lowerPenalty.extraCost);
  });
});

describe('Percentage calculator', () => {
  test('percentOf matches the worked example: 15% of 80 = 12', () => {
    expect(percentOf(15, 80)).toBe(12);
  });

  test('whatPercentOf matches the worked example: 40 is 25% of 160', () => {
    expect(whatPercentOf(40, 160)).toBe(25);
  });

  test('percentageChange matches the worked example: 80 to 100 is a 25% increase', () => {
    expect(percentageChange(80, 100)).toBe(25);
  });

  test('percentageChange matches a decrease example: 100 to 80 is a -20% change', () => {
    expect(percentageChange(100, 80)).toBeCloseTo(-20, 10);
  });

  test('percentageChange handles negative old/new values and returns a correctly-signed result', () => {
    // ((newValue - oldValue) / oldValue) * 100 with oldValue = -50, newValue = -25:
    // (25 / -50) * 100 = -50. Dividing by a negative base flips the sign versus
    // the plain-magnitude case, which is expected behavior for this formula.
    expect(percentageChange(-50, -25)).toBeCloseTo(-50, 10);
  });

  test('originalValueFromPercentChange matches the worked example: $80 after a 20% discount had an $100 original price', () => {
    expect(originalValueFromPercentChange(80, -20)).toBeCloseTo(100, 10);
  });

  test('originalValueFromPercentChange handles an increase: $120 after a 20% raise came from $100', () => {
    expect(originalValueFromPercentChange(120, 20)).toBeCloseTo(100, 10);
  });

  test('originalValueFromPercentChange is non-finite at percentChange = -100, which callers must guard against', () => {
    // finalValue / (1 + percentChange/100) divides by zero when percentChange
    // is -100 (i.e. the original value was reduced to $0), so the DOM layer
    // must reject this case with showError before calling in.
    expect(originalValueFromPercentChange(80, -100)).toBe(Infinity);
  });
});

describe('Fraction calculator', () => {
  describe('gcd', () => {
    test('finds the greatest common divisor of two positive integers', () => {
      expect(gcd(24, 36)).toBe(12);
    });

    test('treats gcd(0, n) as n', () => {
      expect(gcd(0, 5)).toBe(5);
    });

    test('ignores sign, working on magnitudes', () => {
      expect(gcd(-24, 36)).toBe(12);
    });
  });

  describe('simplifyFraction', () => {
    test('reduces a fraction to lowest terms', () => {
      expect(simplifyFraction(6, 24)).toEqual({ numerator: 1, denominator: 4 });
    });

    test('normalizes a negative denominator by moving the sign to the numerator', () => {
      expect(simplifyFraction(3, -4)).toEqual({ numerator: -3, denominator: 4 });
    });

    test('leaves an already-simplified fraction with a positive denominator unchanged', () => {
      expect(simplifyFraction(5, 6)).toEqual({ numerator: 5, denominator: 6 });
    });
  });

  describe('fractionArithmetic', () => {
    test('matches the worked example: 1/2 + 1/3 = 5/6', () => {
      const result = fractionArithmetic(1, 2, 1, 3, 'add');
      expect(result.numerator).toBe(5);
      expect(result.denominator).toBe(6);
      expect(result.decimal).toBeCloseTo(0.8333, 4);
      expect(result.wholePart).toBe(0);
      expect(result.remainderNumerator).toBe(5);
    });

    test('matches the worked example: 2/4 * 3/6 = 1/4 after simplifying', () => {
      const result = fractionArithmetic(2, 4, 3, 6, 'multiply');
      expect(result.numerator).toBe(1);
      expect(result.denominator).toBe(4);
      expect(result.decimal).toBe(0.25);
      expect(result.wholePart).toBe(0);
      expect(result.remainderNumerator).toBe(1);
    });

    test('matches the worked example: 3/4 / 1/2 = 3/2, a mixed number of 1 1/2', () => {
      const result = fractionArithmetic(3, 4, 1, 2, 'divide');
      expect(result.numerator).toBe(3);
      expect(result.denominator).toBe(2);
      expect(result.decimal).toBe(1.5);
      expect(result.wholePart).toBe(1);
      expect(result.remainderNumerator).toBe(1);
    });

    test('subtract simplifies to a whole number result', () => {
      // (5*1 - 1*1) / (1*1) prepared so the raw subtraction lands on a whole
      // number: 5/1 - 3/1 = (5*1 - 3*1)/(1*1) = 2/1.
      const result = fractionArithmetic(5, 1, 3, 1, 'subtract');
      expect(result.numerator).toBe(2);
      expect(result.denominator).toBe(1);
      expect(result.wholePart).toBe(2);
      expect(result.remainderNumerator).toBe(0);
    });

    test('normalizes a negative result so the sign lives on the numerator', () => {
      const result = fractionArithmetic(1, 3, 1, 2, 'subtract');
      expect(result.numerator).toBe(-1);
      expect(result.denominator).toBe(6);
      expect(result.decimal).toBeCloseTo(-0.1667, 4);
    });
  });
});

describe('Ratio & Proportion calculator', () => {
  describe('simplifyRatio', () => {
    test('matches the worked example: 8:12 simplifies to 2:3', () => {
      expect(simplifyRatio(8, 12)).toEqual({ a: 2, b: 3 });
    });

    test('a 0:5 ratio simplifies to 0:1 (gcd(0, n) = n)', () => {
      expect(simplifyRatio(0, 5)).toEqual({ a: 0, b: 1 });
    });

    test('leaves an already-simplified ratio unchanged', () => {
      expect(simplifyRatio(2, 3)).toEqual({ a: 2, b: 3 });
    });
  });

  describe('solveProportion', () => {
    test('matches the worked example: 2:3 = C:12, solve for C', () => {
      const result = solveProportion({ a: 2, b: 3, c: null, d: 12 }, 'c');
      expect(result).toBe(8);
    });

    test('solving 2:3 = 8:D for D gives back 12, consistent with the C example', () => {
      const result = solveProportion({ a: 2, b: 3, c: 8, d: null }, 'd');
      expect(result).toBe(12);
    });

    test('solves for A: A:3 = 8:12 gives A = 2, consistent with the same proportion', () => {
      const result = solveProportion({ a: null, b: 3, c: 8, d: 12 }, 'a');
      expect(result).toBe(2);
    });

    test('solves for B: 2:B = 8:12 gives B = 3, consistent with the same proportion', () => {
      const result = solveProportion({ a: 2, b: null, c: 8, d: 12 }, 'b');
      expect(result).toBe(3);
    });
  });
});

describe('Luggage Weight Checker calculator', () => {
  describe('luggageWeightCheck', () => {
    test('matches the worked example: 23 kg allowance, items totaling 23.2 kg is over by 0.2 kg', () => {
      const result = luggageWeightCheck(23, [3.5, 8.2, 2.1, 1.4, 3.0, 5.0]);
      expect(result.totalWeight).toBeCloseTo(23.2, 5);
      expect(result.allowance).toBe(23);
      expect(result.difference).toBeCloseTo(0.2, 5);
      expect(result.isOverAllowance).toBe(true);
      expect(result.remainingOrOverage).toBeCloseTo(0.2, 5);
    });

    test('within allowance: total weight under the limit reports remaining headroom', () => {
      const result = luggageWeightCheck(23, [10, 5, 3]);
      expect(result.totalWeight).toBe(18);
      expect(result.difference).toBe(-5);
      expect(result.isOverAllowance).toBe(false);
      expect(result.remainingOrOverage).toBe(5);
    });

    test('exactly at allowance is within allowance, not over, with 0 remaining', () => {
      const result = luggageWeightCheck(20, [10, 10]);
      expect(result.totalWeight).toBe(20);
      expect(result.difference).toBe(0);
      expect(result.isOverAllowance).toBe(false);
      expect(result.remainingOrOverage).toBe(0);
    });
  });
});

describe('Average / Weighted Average calculator', () => {
  describe('simpleAverage', () => {
    test('matches the worked example: 4, 8, 6, 10 averages to 7', () => {
      expect(simpleAverage([4, 8, 6, 10])).toBe(7);
    });

    test('a single-value list averages to that value', () => {
      expect(simpleAverage([42])).toBe(42);
    });
  });

  describe('weightedAverage', () => {
    test('matches the worked example: 90 weighted 3, 70 weighted 1 gives 85', () => {
      expect(weightedAverage([90, 70], [3, 1])).toBe(85);
    });

    test('weighting more heavily toward 90 pulls the result above the simple average of the same raw values', () => {
      const simple = simpleAverage([90, 70]);
      expect(simple).toBe(80);

      const weighted = weightedAverage([90, 70], [3, 1]);
      expect(weighted).toBeGreaterThan(simple);
    });

    test('a single value/weight pair averages to that value regardless of weight', () => {
      expect(weightedAverage([55], [7])).toBe(55);
    });
  });

  describe('descriptiveStats', () => {
    test('matches the worked example for an odd-length list: 4, 8, 6, 10, 2', () => {
      expect(descriptiveStats([4, 8, 6, 10, 2])).toEqual({
        mean: 6,
        median: 6,
        min: 2,
        max: 10,
        range: 8,
      });
    });

    test('averages the two middle values for an even-length list', () => {
      expect(descriptiveStats([4, 8, 6, 10])).toEqual({
        mean: 7,
        median: 7,
        min: 4,
        max: 10,
        range: 6,
      });
    });

    test('is unaffected by input order', () => {
      expect(descriptiveStats([10, 2, 8, 4, 6])).toEqual(
        descriptiveStats([4, 8, 6, 10, 2])
      );
    });

    test('a single-value list has that value as mean, median, min, and max, with a range of zero', () => {
      expect(descriptiveStats([42])).toEqual({
        mean: 42,
        median: 42,
        min: 42,
        max: 42,
        range: 0,
      });
    });

    test('throws on an empty list', () => {
      expect(() => descriptiveStats([])).toThrow();
    });
  });
});

describe('ageBreakdown', () => {
  function utc(dateString) {
    return new Date(dateString + 'T00:00:00Z');
  }

  test('matches the worked example: born 2000-03-15, as of 2026-08-25', () => {
    const result = ageBreakdown(utc('2000-03-15'), utc('2026-08-25'));
    expect(result.years).toBe(26);
    expect(result.months).toBe(5);
    expect(result.days).toBe(10);
    expect(result.totalDays).toBe(9659);
    expect(result.totalWeeks).toBe(1379);
    expect(result.remainderDays).toBe(6);
  });

  test('birth date equal to as-of date gives 0/0/0 and 0 total days', () => {
    const result = ageBreakdown(utc('2020-01-01'), utc('2020-01-01'));
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.totalWeeks).toBe(0);
    expect(result.remainderDays).toBe(0);
  });

  // Leap-day birthday (2000-02-29) checked against a non-leap year, using
  // the "resolves to March 1" convention: computed with Node directly from
  // the same borrow logic implemented in ageBreakdown, so a reviewer can
  // verify independently -
  //   years = 2026 - 2000 = 26, months = 2 - 1 = 1 (Mar index 2, Feb index 1)
  //   days = 1 - 29 = -28 -> borrow: months -> 0, days += daysInMonth(Feb
  //     2026) = 28 (non-leap) -> days = 0
  //   result: 26 years, 0 months, 0 days
  //   totalDays = 9497, totalWeeks = 1356, remainderDays = 5
  test('leap-day birthday resolves cleanly against a non-leap-year as-of date (March 1 convention)', () => {
    const result = ageBreakdown(utc('2000-02-29'), utc('2026-03-01'));
    expect(result.years).toBe(26);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.totalDays).toBe(9497);
    expect(result.totalWeeks).toBe(1356);
    expect(result.remainderDays).toBe(5);
  });

  test('throws when the as-of date is before the birth date', () => {
    expect(() => ageBreakdown(utc('2020-06-01'), utc('2020-05-01'))).toThrow();
  });
});

describe('nextBirthdayCountdown', () => {
  function utc(dateString) {
    return new Date(dateString + 'T00:00:00Z');
  }

  test('birthday is still later this year', () => {
    const result = nextBirthdayCountdown(utc('2000-03-15'), utc('2026-01-10'));
    expect(result.nextBirthdayDate).toEqual(utc('2026-03-15'));
    expect(result.daysUntil).toBe(64);
    expect(result.turningAge).toBe(26);
  });

  test('birthday already passed this year rolls to next year', () => {
    const result = nextBirthdayCountdown(utc('1990-06-01'), utc('2026-08-25'));
    expect(result.nextBirthdayDate).toEqual(utc('2027-06-01'));
    expect(result.daysUntil).toBe(280);
    expect(result.turningAge).toBe(37);
  });

  test('as-of date is exactly the birthday: 0 days until, turning the age reached that day', () => {
    const result = nextBirthdayCountdown(utc('1995-11-20'), utc('2026-11-20'));
    expect(result.nextBirthdayDate).toEqual(utc('2026-11-20'));
    expect(result.daysUntil).toBe(0);
    expect(result.turningAge).toBe(31);
  });

  test('Feb 29 birthday falls back to Feb 28 in a non-leap target year', () => {
    const result = nextBirthdayCountdown(utc('2000-02-29'), utc('2026-01-01'));
    expect(result.nextBirthdayDate).toEqual(utc('2026-02-28'));
    expect(result.daysUntil).toBe(58);
    expect(result.turningAge).toBe(26);
  });
});

// --- Sunrise/Sunset & Daylight calculator ---

describe('dayOfYear', () => {
  test('January 1st is day 1', () => {
    expect(dayOfYear(2023, 1, 1)).toBe(1);
  });

  test('June 21st in a non-leap year is day 172', () => {
    expect(dayOfYear(2023, 6, 21)).toBe(172);
  });

  test('December 31st in a non-leap year is day 365', () => {
    expect(dayOfYear(2023, 12, 31)).toBe(365);
  });
});

describe('sunriseSunset', () => {
  // Worked example: Paris (48.8566N, 2.3522E), June 21 (day 172), UTC+2
  // (CEST — Paris observes daylight saving time in June, not its UTC+1
  // standard/winter offset). Precise values below were computed by running
  // this exact implementation with Node, not hand-derived from the formula.
  test('Paris on the June solstice (day 172, UTC+2) matches the worked example', () => {
    const result = sunriseSunset(172, 48.8566, 2.3522, 2);
    expect(result.sunriseMinutesUTC).toBeCloseTo(226.42, 1);
    expect(result.sunsetMinutesUTC).toBeCloseTo(1197.41, 1);
    expect(result.daylightMinutes).toBeCloseTo(970.99, 1);
    expect(formatMinutesAsLocalTime(result.sunriseMinutesUTC, 2)).toBe('05:46');
    expect(formatMinutesAsLocalTime(result.sunsetMinutesUTC, 2)).toBe('21:57');
    expect(formatDurationHM(result.daylightMinutes)).toBe('16h 11m');
  });

  test('polar day near the summer solstice at 70N (day 172)', () => {
    const result = sunriseSunset(172, 70, 0, 0);
    expect(result.polarDay).toBe(true);
    expect(result.polarNight).toBeUndefined();
  });

  test('polar night near the winter solstice at 70N (day 355)', () => {
    const result = sunriseSunset(355, 70, 0, 0);
    expect(result.polarNight).toBe(true);
    expect(result.polarDay).toBeUndefined();
  });
});

describe('formatMinutesAsLocalTime', () => {
  test('wraps a negative UTC-adjusted time into the previous day\'s clock time', () => {
    expect(formatMinutesAsLocalTime(30, -2)).toBe('22:30');
  });

  test('wraps a UTC-adjusted time past midnight into the next day\'s clock time', () => {
    expect(formatMinutesAsLocalTime(1430, 2)).toBe('01:50');
  });
});

describe('formatDurationHM', () => {
  test('formats a whole-minute duration as Hh Mm', () => {
    expect(formatDurationHM(971)).toBe('16h 11m');
  });

  test('rounds a fractional-minute duration before formatting', () => {
    expect(formatDurationHM(970.99)).toBe('16h 11m');
  });
});

// --- Warm-up set calculator ---

describe('warmupSets', () => {
  test('worked example: 100 kg target, 20 kg bar, 2.5 kg rounding', () => {
    const sets = warmupSets(100, 20, 2.5);
    expect(sets).toEqual([
      { percent: 40, reps: 5, weight: 40, warmup: true },
      { percent: 50, reps: 5, weight: 50, warmup: true },
      { percent: 60, reps: 3, weight: 60, warmup: true },
      { percent: 70, reps: 3, weight: 70, warmup: true },
      { percent: 80, reps: 2, weight: 80, warmup: true },
      { percent: 90, reps: 1, weight: 90, warmup: true },
      { percent: 100, reps: null, weight: 100, warmup: false },
    ]);
  });

  test('floors warm-up weights at the empty bar rather than showing an unloadable weight', () => {
    const sets = warmupSets(50, 20, 2.5);
    expect(sets[0].weight).toBe(20); // 40% of 50 = 20, already at the bar
    expect(sets[1].weight).toBe(25); // 50% of 50 = 25
  });

  test('caps warm-up weights at the target so rounding cannot push a set above the working weight', () => {
    const sets = warmupSets(101, 20, 5);
    // 90% of 101 = 90.9, rounds to 90 (below target) - no capping needed here,
    // but a tighter case: target itself not a multiple of the increment.
    expect(sets[5].weight).toBeLessThanOrEqual(101);
    expect(sets[6].weight).toBe(101);
  });

  test('rejects a target weight of zero or less', () => {
    expect(() => warmupSets(0, 20, 2.5)).toThrow();
    expect(() => warmupSets(-10, 20, 2.5)).toThrow();
  });

  test('works without an explicit bar weight or rounding increment', () => {
    const sets = warmupSets(100);
    expect(sets[0].weight).toBe(40);
    expect(sets[6].weight).toBe(100);
  });
});

// --- Date Difference / Countdown calculator ---

describe('dateDifference', () => {
  function utc(dateString) {
    return new Date(`${dateString}T00:00:00Z`);
  }

  test('worked example: 2026-08-25 to 2027-01-01', () => {
    const result = dateDifference(utc('2026-08-25'), utc('2027-01-01'));
    expect(result.totalDays).toBe(129);
    expect(result.totalWeeks).toBe(18);
    expect(result.remainderDays).toBe(3);
    expect(result.years).toBe(0);
    expect(result.months).toBe(4);
    expect(result.days).toBe(7);
    expect(result.reversed).toBe(false);
  });

  test('handles dates given in reverse chronological order transparently', () => {
    const forward = dateDifference(utc('2026-08-25'), utc('2027-01-01'));
    const backward = dateDifference(utc('2027-01-01'), utc('2026-08-25'));
    expect(backward.totalDays).toBe(forward.totalDays);
    expect(backward.years).toBe(forward.years);
    expect(backward.months).toBe(forward.months);
    expect(backward.days).toBe(forward.days);
    expect(backward.reversed).toBe(true);
  });

  test('identical dates produce an all-zero difference', () => {
    const result = dateDifference(utc('2020-05-01'), utc('2020-05-01'));
    expect(result.totalDays).toBe(0);
    expect(result.years).toBe(0);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
    expect(result.reversed).toBe(false);
  });

  test('counts a leap year correctly within the span', () => {
    const result = dateDifference(utc('2024-01-01'), utc('2025-01-01'));
    expect(result.totalDays).toBe(366);
  });

  test('handles dates decades apart without overflow', () => {
    const result = dateDifference(utc('1950-01-01'), utc('2050-01-01'));
    expect(result.years).toBe(100);
    expect(result.totalDays).toBeGreaterThan(36000);
  });
});

// --- DOTS score calculator ---

describe('dotsScore', () => {
  test('worked example: men, 90 kg bodyweight, 600 kg total', () => {
    expect(dotsScore(90, 600, 'male')).toBeCloseTo(387.96, 1);
  });

  test('women, 60 kg bodyweight, 300 kg total', () => {
    expect(dotsScore(60, 300, 'female')).toBeCloseTo(332.56, 1);
  });

  test('clamps women\'s bodyweight to 150 kg for the calculation', () => {
    expect(dotsCoefficient(150, 'female')).toBeCloseTo(dotsCoefficient(200, 'female'), 10);
  });

  test('does not clamp men\'s bodyweight', () => {
    expect(dotsCoefficient(150, 'male')).not.toBeCloseTo(dotsCoefficient(200, 'male'), 5);
  });

  test('throws for a missing or invalid sex', () => {
    expect(() => dotsScore(90, 600, undefined)).toThrow();
    expect(() => dotsScore(90, 600, 'other')).toThrow();
  });
});

// --- Date Plus/Minus Days calculator ---

describe('addDaysToDate / weekdayName', () => {
  function utc(dateString) {
    return new Date(`${dateString}T00:00:00Z`);
  }

  test('worked example: adding 90 days rolls over month and year correctly', () => {
    const result = addDaysToDate(utc('2026-08-25'), 90);
    expect(result.toISOString().slice(0, 10)).toBe('2026-11-23');
    expect(weekdayName(result)).toBe('Monday');
  });

  test('worked example: subtracting 40 days rolls back across a month boundary', () => {
    const result = addDaysToDate(utc('2026-08-25'), -40);
    expect(result.toISOString().slice(0, 10)).toBe('2026-07-16');
    expect(weekdayName(result)).toBe('Thursday');
  });

  test('adding zero days leaves the date unchanged', () => {
    const result = addDaysToDate(utc('2026-08-25'), 0);
    expect(result.toISOString().slice(0, 10)).toBe('2026-08-25');
  });

  test('correctly rolls over a leap-year February', () => {
    const result = addDaysToDate(utc('2024-02-28'), 2);
    expect(result.toISOString().slice(0, 10)).toBe('2024-03-01');
  });

  test('handles very large day counts without overflow', () => {
    const result = addDaysToDate(utc('2000-01-01'), 20000);
    expect(result.toISOString().slice(0, 10)).toBe('2054-10-04');
  });
});

// --- Country voltage and plug type checker ---

describe('checkPlugAdapterNeeds', () => {
  const dataset = {
    Home: { voltage: 120, frequency: 60, plugTypes: ['A', 'B'] },
    Neither: { voltage: 230, frequency: 50, plugTypes: ['G'] },
    SamePlugDiffVoltage: { voltage: 230, frequency: 50, plugTypes: ['A'] },
    DiffPlugSameVoltage: { voltage: 125, frequency: 60, plugTypes: ['C'] },
    BothMatch: { voltage: 120, frequency: 60, plugTypes: ['A'] },
  };

  test('worked example: US to UK, not dual-voltage, needs both adapter and converter', () => {
    const result = checkPlugAdapterNeeds('United States', 'United Kingdom', false);
    expect(result.plugMatch).toBe(false);
    expect(result.voltageCompatible).toBe(false);
    expect(result.recommendation).toBe('both');
  });

  test('a dual-voltage device skips the voltage check, needing only a plug adapter', () => {
    const result = checkPlugAdapterNeeds('United States', 'United Kingdom', true);
    expect(result.voltageCompatible).toBe(true);
    expect(result.recommendation).toBe('adapter');
  });

  test('matching plug and voltage needs neither adapter nor converter', () => {
    const result = checkPlugAdapterNeeds('Home', 'BothMatch', false, dataset);
    expect(result.recommendation).toBe('none');
  });

  test('matching plug shape but incompatible voltage needs a converter only', () => {
    const result = checkPlugAdapterNeeds('Home', 'SamePlugDiffVoltage', false, dataset);
    expect(result.plugMatch).toBe(true);
    expect(result.voltageCompatible).toBe(false);
    expect(result.recommendation).toBe('converter');
  });

  test('mismatched plug shape but compatible voltage needs an adapter only', () => {
    const result = checkPlugAdapterNeeds('Home', 'DiffPlugSameVoltage', false, dataset);
    expect(result.plugMatch).toBe(false);
    expect(result.voltageCompatible).toBe(true);
    expect(result.recommendation).toBe('adapter');
  });

  test('the same country as both home and destination is trivially compatible', () => {
    const result = checkPlugAdapterNeeds('United States', 'United States', false);
    expect(result.recommendation).toBe('none');
  });

  test('returns an error for a country not present in the dataset', () => {
    const result = checkPlugAdapterNeeds('Atlantis', 'United Kingdom', false);
    expect(result.error).toBeDefined();
  });
});

// --- Working Days calculator ---

describe('workingDaysBetween', () => {
  function utc(dateString) {
    return new Date(`${dateString}T00:00:00Z`);
  }

  test('worked example: Mon 2026-08-24 to Fri 2026-09-04, no holidays, is 10 working days', () => {
    const result = workingDaysBetween(utc('2026-08-24'), utc('2026-09-04'));
    expect(result.workingDays).toBe(10);
    expect(result.totalDays).toBe(12);
    expect(result.weekendDays).toBe(2);
    expect(result.holidayWeekdays).toBe(0);
    expect(result.reversed).toBe(false);
  });

  test('worked example: excluding a weekday holiday (2026-08-27, Thursday) drops it to 9', () => {
    const result = workingDaysBetween(utc('2026-08-24'), utc('2026-09-04'), [utc('2026-08-27')]);
    expect(result.workingDays).toBe(9);
    expect(result.holidayWeekdays).toBe(1);
  });

  test('a holiday that falls on a weekend has no effect (not double-counted)', () => {
    const result = workingDaysBetween(utc('2026-08-24'), utc('2026-09-04'), [utc('2026-08-29')]); // Saturday
    expect(result.workingDays).toBe(10);
    expect(result.holidayWeekdays).toBe(0);
  });

  test('a holiday outside the date range is ignored', () => {
    const result = workingDaysBetween(utc('2026-08-24'), utc('2026-09-04'), [utc('2026-01-01')]);
    expect(result.workingDays).toBe(10);
  });

  test('handles start/end given in reverse chronological order transparently', () => {
    const forward = workingDaysBetween(utc('2026-08-24'), utc('2026-09-04'));
    const backward = workingDaysBetween(utc('2026-09-04'), utc('2026-08-24'));
    expect(backward.workingDays).toBe(forward.workingDays);
    expect(backward.reversed).toBe(true);
  });

  test('identical start and end date counts as 1 if a weekday, 0 if a weekend', () => {
    const weekday = workingDaysBetween(utc('2026-08-24'), utc('2026-08-24')); // Monday
    expect(weekday.workingDays).toBe(1);
    expect(weekday.totalDays).toBe(1);

    const weekend = workingDaysBetween(utc('2026-08-29'), utc('2026-08-29')); // Saturday
    expect(weekend.workingDays).toBe(0);
  });

  test('works with no holidays argument at all', () => {
    const result = workingDaysBetween(utc('2026-08-24'), utc('2026-08-24'));
    expect(result.workingDays).toBe(1);
  });
});

describe('addWorkingDays', () => {
  function utc(dateString) {
    return new Date(`${dateString}T00:00:00Z`);
  }

  test('worked example: Mon 2026-08-24 plus 5 business days lands on Mon 2026-08-31', () => {
    const result = addWorkingDays(utc('2026-08-24'), 5);
    expect(result.resultDate.toISOString().slice(0, 10)).toBe('2026-08-31');
    expect(result.weekdayName).toBe('Monday');
  });

  test('worked example: Mon 2026-08-24 minus 3 business days lands on Wed 2026-08-19', () => {
    const result = addWorkingDays(utc('2026-08-24'), -3);
    expect(result.resultDate.toISOString().slice(0, 10)).toBe('2026-08-19');
    expect(result.weekdayName).toBe('Wednesday');
  });

  test('skips a weekend when stepping forward', () => {
    const result = addWorkingDays(utc('2026-08-28'), 1); // Friday + 1 business day
    expect(result.resultDate.toISOString().slice(0, 10)).toBe('2026-08-31'); // Monday, skipping Sat/Sun
    expect(result.weekdayName).toBe('Monday');
  });

  test('skips a holiday that falls on a weekday', () => {
    const result = addWorkingDays(utc('2026-08-24'), 3, [utc('2026-08-27')]); // Thursday holiday
    expect(result.resultDate.toISOString().slice(0, 10)).toBe('2026-08-28');
    expect(result.weekdayName).toBe('Friday');
  });

  test('numberOfDays = 0 returns startDate unchanged, even on a weekend', () => {
    const result = addWorkingDays(utc('2026-08-29'), 0); // Saturday
    expect(result.resultDate.toISOString().slice(0, 10)).toBe('2026-08-29');
    expect(result.weekdayName).toBe('Saturday');
  });
});

// --- Time Duration calculator ---

describe('timeToSeconds', () => {
  test('converts H:M:S to total seconds', () => {
    expect(timeToSeconds(1, 45, 0)).toBe(6300);
    expect(timeToSeconds(0, 20, 0)).toBe(1200);
  });

  test('throws for negative hours', () => {
    expect(() => timeToSeconds(-1, 0, 0)).toThrow();
  });

  test('throws for minutes or seconds out of [0, 60)', () => {
    expect(() => timeToSeconds(1, 60, 0)).toThrow();
    expect(() => timeToSeconds(1, -1, 0)).toThrow();
    expect(() => timeToSeconds(1, 0, 60)).toThrow();
    expect(() => timeToSeconds(1, 0, -1)).toThrow();
  });

  test('throws for non-numeric (NaN) components rather than silently propagating NaN', () => {
    expect(() => timeToSeconds(NaN, 0, 0)).toThrow();
    expect(() => timeToSeconds(1, NaN, 0)).toThrow();
    expect(() => timeToSeconds(1, 0, NaN)).toThrow();
  });
});

describe('secondsToHMS', () => {
  test('breaks total seconds back into hours/minutes/seconds', () => {
    expect(secondsToHMS(7500)).toEqual({ hours: 2, minutes: 5, seconds: 0 });
    expect(secondsToHMS(30300)).toEqual({ hours: 8, minutes: 25, seconds: 0 });
  });

  test('does not cap hours at 24, since durations can exceed a day', () => {
    expect(secondsToHMS(90000)).toEqual({ hours: 25, minutes: 0, seconds: 0 });
  });
});

describe('secondsToDecimalHours', () => {
  test('worked example: 8:25:00 (payroll clock-in/out) is 8.42 decimal hours', () => {
    expect(secondsToDecimalHours(timeToSeconds(8, 25, 0))).toBeCloseTo(8.42, 2);
  });

  test('worked example: 8:15:00 is 8.25 decimal hours', () => {
    expect(secondsToDecimalHours(timeToSeconds(8, 15, 0))).toBe(8.25);
  });

  test('rounds to 2 decimal places', () => {
    expect(secondsToDecimalHours(1)).toBe(0);
    expect(secondsToDecimalHours(30)).toBe(0.01);
  });

  test('handles negative durations, rounding towards the nearer hundredth', () => {
    expect(secondsToDecimalHours(-timeToSeconds(8, 15, 0))).toBe(-8.25);
  });
});

describe('addSubtractDurations', () => {
  test('worked example: 1:45:00 + 0:20:00 = 2:05:00', () => {
    const result = addSubtractDurations(timeToSeconds(1, 45, 0), timeToSeconds(0, 20, 0), 'add');
    expect(secondsToHMS(result)).toEqual({ hours: 2, minutes: 5, seconds: 0 });
  });

  test('subtracts durations', () => {
    const result = addSubtractDurations(timeToSeconds(1, 45, 0), timeToSeconds(0, 20, 0), 'subtract');
    expect(secondsToHMS(result)).toEqual({ hours: 1, minutes: 25, seconds: 0 });
  });

  test('throws when subtraction would go negative', () => {
    expect(() => addSubtractDurations(timeToSeconds(0, 20, 0), timeToSeconds(1, 45, 0), 'subtract')).toThrow();
  });
});

describe('timeOfDayDuration', () => {
  test('worked example: 09:15:00 to 17:40:00 is 8:25:00', () => {
    const result = timeOfDayDuration(timeToSeconds(9, 15, 0), timeToSeconds(17, 40, 0));
    expect(secondsToHMS(result)).toEqual({ hours: 8, minutes: 25, seconds: 0 });
  });

  test('worked example: overnight shift 22:00:00 to 06:00:00 wraps to 8:00:00', () => {
    const result = timeOfDayDuration(timeToSeconds(22, 0, 0), timeToSeconds(6, 0, 0));
    expect(secondsToHMS(result)).toEqual({ hours: 8, minutes: 0, seconds: 0 });
  });

  test('identical start and end time is a zero-length duration, not a full day', () => {
    const result = timeOfDayDuration(timeToSeconds(9, 15, 0), timeToSeconds(9, 15, 0));
    expect(result).toBe(0);
  });
});

// --- IPF GL Points calculator ---

describe('glPoints', () => {
  test('worked example: men, raw, 90 kg bodyweight, 600 kg total', () => {
    expect(glPoints(90, 600, 'male', 'raw')).toBeCloseTo(79.77, 1);
  });

  test('women, equipped, 70 kg bodyweight, 400 kg total', () => {
    expect(glPoints(70, 400, 'female', 'equipped')).toBeCloseTo(68.26, 1);
  });

  test('raw and equipped use different coefficients for the same sex', () => {
    expect(glCoefficient(90, 'male', 'raw')).not.toBeCloseTo(glCoefficient(90, 'male', 'equipped'), 5);
  });

  test('throws for a missing or invalid sex/equipment combination', () => {
    expect(() => glPoints(90, 600, undefined, 'raw')).toThrow();
    expect(() => glPoints(90, 600, 'male', undefined)).toThrow();
    expect(() => glPoints(90, 600, 'other', 'raw')).toThrow();
    expect(() => glPoints(90, 600, 'male', 'other')).toThrow();
  });
});

// --- Unit Converter calculator ---

describe('convertUnit', () => {
  test('worked example: 5 mi to km', () => {
    expect(convertUnit('length', 5, 'mi', 'km')).toBeCloseTo(8.04672, 5);
  });

  test('worked example: 10 lb to kg', () => {
    expect(convertUnit('mass', 10, 'lb', 'kg')).toBeCloseTo(4.5359237, 5);
  });

  test('worked example: 100 F to C', () => {
    expect(convertUnit('temperature', 100, 'F', 'C')).toBeCloseTo(37.78, 2);
  });

  test('same input and output unit passes the value through unchanged', () => {
    expect(convertUnit('length', 42, 'km', 'km')).toBeCloseTo(42, 10);
    expect(convertUnit('temperature', 42, 'C', 'C')).toBe(42);
  });

  test('a small-to-large unit conversion does not round to zero', () => {
    expect(convertUnit('length', 5, 'mm', 'km')).toBeCloseTo(0.000005, 9);
  });

  test('round-trips through Kelvin and Fahrenheit back to Celsius', () => {
    expect(convertUnit('temperature', 0, 'C', 'K')).toBeCloseTo(273.15, 5);
    expect(convertUnit('temperature', 37.78, 'F', 'C') > 0).toBe(true);
  });

  test('throws for an unknown category or unit', () => {
    expect(() => convertUnit('nonsense', 1, 'm', 'km')).toThrow();
    expect(() => convertUnit('length', 1, 'm', 'furlong')).toThrow();
  });
});

describe('convertToAllUnits', () => {
  test('worked example: 5 mi across every length unit', () => {
    const results = convertToAllUnits('length', 5, 'mi');
    const km = results.find(r => r.unit === 'km');
    const m = results.find(r => r.unit === 'm');
    expect(km.value).toBeCloseTo(8.04672, 5);
    expect(m.value).toBeCloseTo(8046.72, 2);
    expect(results.map(r => r.unit)).toEqual(['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi']);
  });

  test('worked example: 100 F across every temperature unit', () => {
    const results = convertToAllUnits('temperature', 100, 'F');
    const celsius = results.find(r => r.unit === 'C');
    const kelvin = results.find(r => r.unit === 'K');
    expect(celsius.value).toBeCloseTo(37.78, 2);
    expect(kelvin.value).toBeCloseTo(310.93, 2);
    expect(results.map(r => r.unit)).toEqual(['C', 'F', 'K']);
  });

  test('throws for an unknown category', () => {
    expect(() => convertToAllUnits('nonsense', 1, 'm')).toThrow();
  });
});

// --- FFMI (Fat-Free Mass Index) calculator ---

describe('ffmi', () => {
  test('worked example: 90 kg, 1.80 m, 15% body fat', () => {
    const result = ffmi(90, 1.8, 15);
    expect(result.fatFreeMass).toBeCloseTo(76.5, 5);
    expect(result.rawFFMI).toBeCloseTo(23.6, 1);
    expect(result.normalizedFFMI).toBeCloseTo(23.6, 1); // no height adjustment at exactly 1.8 m
  });

  test('applies a height adjustment away from 1.8 m', () => {
    const result = ffmi(90, 1.7, 15);
    expect(result.normalizedFFMI).toBeGreaterThan(result.rawFFMI); // shorter than 1.8m -> adjusted up
  });

  test('rejects non-positive weight or height', () => {
    expect(() => ffmi(0, 1.8, 15)).toThrow();
    expect(() => ffmi(90, 0, 15)).toThrow();
  });

  test('rejects body fat percentage outside 0-70%', () => {
    expect(() => ffmi(90, 1.8, -1)).toThrow();
    expect(() => ffmi(90, 1.8, 71)).toThrow();
    expect(() => ffmi(90, 1.8, 100)).toThrow();
  });
});

describe('ffmiCategory', () => {
  test('labels values across the reference ranges', () => {
    expect(ffmiCategory(17)).toBe('Below average');
    expect(ffmiCategory(19)).toBe('Average');
    expect(ffmiCategory(21)).toBe('Above average');
    expect(ffmiCategory(22.5)).toBe('Excellent');
    expect(ffmiCategory(24)).toContain('Superior');
    expect(ffmiCategory(27)).toContain('Exceeds');
  });
});

// --- Lean Body Mass calculator ---

describe('leanBodyMassFromBodyFat', () => {
  test('worked example: 80 kg, 20% body fat', () => {
    expect(leanBodyMassFromBodyFat(80, 20)).toBeCloseTo(64, 5);
  });

  test('rejects non-positive weight', () => {
    expect(() => leanBodyMassFromBodyFat(0, 20)).toThrow();
  });

  test('rejects body fat percentage outside 0-70%', () => {
    expect(() => leanBodyMassFromBodyFat(80, -1)).toThrow();
    expect(() => leanBodyMassFromBodyFat(80, 71)).toThrow();
  });
});

describe('leanBodyMassBoer', () => {
  test('worked example: man, 80 kg, 180 cm', () => {
    expect(leanBodyMassBoer(80, 180, 'male')).toBeCloseTo(61.4, 1);
  });

  test('rejects non-positive weight or height', () => {
    expect(() => leanBodyMassBoer(0, 180, 'male')).toThrow();
    expect(() => leanBodyMassBoer(80, 0, 'male')).toThrow();
  });

  test('throws for a missing or invalid sex', () => {
    expect(() => leanBodyMassBoer(80, 180, undefined)).toThrow();
    expect(() => leanBodyMassBoer(80, 180, 'other')).toThrow();
  });

  test('rejects a height/weight combination that produces a negative estimate', () => {
    expect(() => leanBodyMassBoer(10, 10, 'male')).toThrow();
  });
});

// --- Body-fat percentage estimator (US Navy method) ---

describe('navyBodyFatPercent', () => {
  test('worked example: man, waist 34in, neck 15in, height 70in', () => {
    expect(navyBodyFatPercent('male', 70, 15, 34)).toBeCloseTo(17.5, 1);
  });

  test('women require a hip measurement', () => {
    expect(() => navyBodyFatPercent('female', 65, 13, 30, undefined)).toThrow();
    expect(navyBodyFatPercent('female', 65, 13, 30, 38)).toBeGreaterThan(0);
  });

  test('rejects a non-positive height, neck, or waist', () => {
    expect(() => navyBodyFatPercent('male', 0, 15, 34)).toThrow();
    expect(() => navyBodyFatPercent('male', 70, 0, 34)).toThrow();
    expect(() => navyBodyFatPercent('male', 70, 15, 0)).toThrow();
  });

  test('rejects waist <= neck for men (log argument would be zero or negative)', () => {
    expect(() => navyBodyFatPercent('male', 70, 34, 34)).toThrow();
    expect(() => navyBodyFatPercent('male', 70, 40, 34)).toThrow();
  });

  test('rejects waist + hip <= neck for women', () => {
    expect(() => navyBodyFatPercent('female', 65, 60, 20, 20)).toThrow();
  });

  test('throws for a missing or invalid sex', () => {
    expect(() => navyBodyFatPercent(undefined, 70, 15, 34)).toThrow();
    expect(() => navyBodyFatPercent('other', 70, 15, 34)).toThrow();
  });
});

// --- TDEE (Total Daily Energy Expenditure) calculator ---

describe('bmrMifflinStJeor / tdeeFromBmr', () => {
  test('worked example: man, 80 kg, 180 cm, 30 years, moderately active', () => {
    const bmr = bmrMifflinStJeor(80, 180, 30, 'male');
    expect(bmr).toBeCloseTo(1780, 5);
    expect(tdeeFromBmr(bmr, 'moderate')).toBeCloseTo(2759, 5);
  });

  test('women use a different constant offset than men', () => {
    const bmrMale = bmrMifflinStJeor(70, 170, 25, 'male');
    const bmrFemale = bmrMifflinStJeor(70, 170, 25, 'female');
    expect(bmrFemale).toBeLessThan(bmrMale);
  });

  test('rejects non-positive weight, height, or age', () => {
    expect(() => bmrMifflinStJeor(0, 180, 30, 'male')).toThrow();
    expect(() => bmrMifflinStJeor(80, 0, 30, 'male')).toThrow();
    expect(() => bmrMifflinStJeor(80, 180, 0, 'male')).toThrow();
  });

  test('throws for a missing or invalid sex', () => {
    expect(() => bmrMifflinStJeor(80, 180, 30, undefined)).toThrow();
    expect(() => bmrMifflinStJeor(80, 180, 30, 'other')).toThrow();
  });

  test('throws for an invalid activity level', () => {
    expect(() => tdeeFromBmr(1780, 'super-active')).toThrow();
  });
});

// --- Macro calculator ---

describe('macroGrams', () => {
  test('worked example: 2500 kcal at 40/30/30', () => {
    const result = macroGrams(2500, 40, 30, 30);
    expect(result.proteinG).toBeCloseTo(250, 5);
    expect(result.carbG).toBeCloseTo(187.5, 5);
    expect(result.fatG).toBeCloseTo(83.3, 1);
  });

  test('rejects a non-positive calorie target', () => {
    expect(() => macroGrams(0, 40, 30, 30)).toThrow();
  });

  test('rejects percentages that do not sum to 100%', () => {
    expect(() => macroGrams(2500, 40, 30, 20)).toThrow();
    expect(() => macroGrams(2500, 40, 30, 40)).toThrow();
  });

  test('rejects any individual percentage negative or over 100', () => {
    expect(() => macroGrams(2500, -10, 60, 50)).toThrow();
    expect(() => macroGrams(2500, 110, -20, 10)).toThrow();
  });

  test('tolerates small rounding slack around 100%', () => {
    expect(() => macroGrams(2500, 40, 30, 30.2)).not.toThrow();
  });
});

// --- Weight-loss timeline calculator ---

describe('weightLossTimeline', () => {
  test('worked example: 90 kg to 80 kg at a 500 kcal/day deficit', () => {
    const result = weightLossTimeline(90, 80, 500);
    expect(result.weightToLose).toBeCloseTo(10, 5);
    expect(result.totalDeficitNeeded).toBeCloseTo(77000, 5);
    expect(result.daysNeeded).toBeCloseTo(154, 5);
    expect(result.weeksNeeded).toBeCloseTo(22, 1);
  });

  test('uses the pounds-based fat energy constant when unit is lb', () => {
    const result = weightLossTimeline(200, 190, 500, 'lb');
    expect(result.totalDeficitNeeded).toBeCloseTo(10 * 3500, 5);
  });

  test('rejects non-positive current weight, goal weight, or deficit', () => {
    expect(() => weightLossTimeline(0, 80, 500)).toThrow();
    expect(() => weightLossTimeline(90, 0, 500)).toThrow();
    expect(() => weightLossTimeline(90, 80, 0)).toThrow();
  });

  test('rejects a goal weight greater than or equal to current weight', () => {
    expect(() => weightLossTimeline(80, 90, 500)).toThrow();
    expect(() => weightLossTimeline(80, 80, 500)).toThrow();
  });
});

// --- Bulking calorie calculator ---

describe('bulkCalories', () => {
  test('worked example: TDEE 2800 at lean/moderate/aggressive paces', () => {
    expect(bulkCalories(2800, 0.10)).toBeCloseTo(3080, 5);
    expect(bulkCalories(2800, 0.15)).toBeCloseTo(3220, 5);
    expect(bulkCalories(2800, 0.20)).toBeCloseTo(3360, 5);
  });

  test('rejects a non-positive TDEE', () => {
    expect(() => bulkCalories(0, 0.10)).toThrow();
  });

  test('rejects a surplus fraction outside 0-50%', () => {
    expect(() => bulkCalories(2800, -0.1)).toThrow();
    expect(() => bulkCalories(2800, 0.6)).toThrow();
  });
});

// --- Running pace calculator ---

describe('running pace calculator', () => {
  test('worked example: 10 km in 50:00 gives a 5:00/km pace, ~8:03/mile', () => {
    const paceSecPerKm = paceFromDistanceTime(10, 50 * 60);
    expect(paceSecPerKm).toBe(300); // 5:00/km
    const paceSecPerMile = convertPacePerUnit(paceSecPerKm, 'km', 'mi');
    expect(Math.round(paceSecPerMile)).toBe(483); // 8:03/mile
  });

  test('worked example: solving for time at 4:30/km over a 21.1 km half marathon', () => {
    const time = timeFromDistancePace(21.1, 4 * 60 + 30);
    expect(time).toBeCloseTo(5697, 0); // 1:34:57
  });

  test('solving for distance from time and pace', () => {
    const distance = distanceFromTimePace(5697, 270);
    expect(distance).toBeCloseTo(21.1, 5);
  });

  test('converting a pace to the same unit is a no-op', () => {
    expect(convertPacePerUnit(300, 'km', 'km')).toBe(300);
  });

  test('rejects a non-positive distance, time, or pace', () => {
    expect(() => paceFromDistanceTime(0, 3000)).toThrow();
    expect(() => paceFromDistanceTime(10, 0)).toThrow();
    expect(() => timeFromDistancePace(0, 300)).toThrow();
    expect(() => distanceFromTimePace(3000, 0)).toThrow();
  });

  test('throws for an unknown pace unit', () => {
    expect(() => convertPacePerUnit(300, 'km', 'furlong')).toThrow();
  });
});

// --- Paint calculator ---

describe('paintNeeded', () => {
  test('worked example: 40 m² walls, 1 door, 2 windows, 2 coats, 10 m²/L', () => {
    const result = paintNeeded(40, 1, 1.85, 2, 1.5, 2, 10);
    expect(result.paintableArea).toBeCloseTo(35.15, 5);
    expect(result.totalAreaToPaint).toBeCloseTo(70.3, 5);
    expect(result.volumeNeeded).toBeCloseTo(7.03, 5);
  });

  test('works with no doors or windows', () => {
    const result = paintNeeded(40, 0, 0, 0, 0, 1, 10);
    expect(result.paintableArea).toBe(40);
  });

  test('rejects non-positive wall area, coats, or coverage rate', () => {
    expect(() => paintNeeded(0, 0, 0, 0, 0, 2, 10)).toThrow();
    expect(() => paintNeeded(40, 0, 0, 0, 0, 0, 10)).toThrow();
    expect(() => paintNeeded(40, 0, 0, 0, 0, 2, 0)).toThrow();
  });

  test('rejects deductions that leave no paintable area', () => {
    expect(() => paintNeeded(5, 2, 1.85, 2, 1.5, 2, 10)).toThrow();
  });
});

describe('roundUpToCans', () => {
  test('rounds a needed volume up to whole cans', () => {
    expect(roundUpToCans(7.03, 4)).toEqual({ cansNeeded: 2, totalVolume: 8 });
  });

  test('an exact multiple needs no extra can', () => {
    expect(roundUpToCans(8, 4)).toEqual({ cansNeeded: 2, totalVolume: 8 });
  });

  test('rejects a non-positive can size', () => {
    expect(() => roundUpToCans(7, 0)).toThrow();
  });
});

// --- Wallpaper calculator ---

describe('wallpaperRollsNeeded', () => {
  test('worked example: 4x3.5 room, 2.4m height, European roll, 0.64m repeat, 10% waste', () => {
    const result = wallpaperRollsNeeded(15, 2.4, 0.53, 10.05, 0.64, 10);
    expect(result.numberOfStrips).toBe(29);
    expect(result.effectiveDrop).toBeCloseTo(2.56, 5);
    expect(result.stripsPerRoll).toBe(3);
    expect(result.rollsNeeded).toBe(10);
    expect(result.rollsWithWaste).toBe(11);
  });

  test('plain paper (no pattern repeat) uses the wall height directly as the drop', () => {
    const result = wallpaperRollsNeeded(15, 2.4, 0.53, 10.05, 0, 10);
    expect(result.effectiveDrop).toBe(2.4);
  });

  test('rejects non-positive perimeter, wall height, roll width, or roll length', () => {
    expect(() => wallpaperRollsNeeded(0, 2.4, 0.53, 10.05, 0, 10)).toThrow();
    expect(() => wallpaperRollsNeeded(15, 0, 0.53, 10.05, 0, 10)).toThrow();
    expect(() => wallpaperRollsNeeded(15, 2.4, 0, 10.05, 0, 10)).toThrow();
    expect(() => wallpaperRollsNeeded(15, 2.4, 0.53, 0, 0, 10)).toThrow();
  });

  test('rejects a wall height that exceeds the roll length', () => {
    expect(() => wallpaperRollsNeeded(15, 12, 0.53, 10.05, 0, 10)).toThrow();
  });

  test('rejects a pattern repeat larger than the roll length', () => {
    expect(() => wallpaperRollsNeeded(15, 2.4, 0.53, 10.05, 12, 10)).toThrow();
  });

  test('rejects a negative waste percentage', () => {
    expect(() => wallpaperRollsNeeded(15, 2.4, 0.53, 10.05, 0.64, -5)).toThrow();
  });
});

// --- Flooring calculator ---

describe('flooringNeeded', () => {
  test('worked example: 5x4 room (20 m²), 10% waste, 2.2 m² per box', () => {
    const result = flooringNeeded(20, 10, 2.2);
    expect(result.areaWithWaste).toBeCloseTo(22, 5);
    expect(result.boxesNeeded).toBe(10);
    expect(result.totalPurchasedArea).toBeCloseTo(22, 5);
  });

  test('rejects a non-positive area or area per box', () => {
    expect(() => flooringNeeded(0, 10, 2.2)).toThrow();
    expect(() => flooringNeeded(20, 10, 0)).toThrow();
  });

  test('rejects a negative waste percentage', () => {
    expect(() => flooringNeeded(20, -5, 2.2)).toThrow();
  });

  test('allows a waste percentage over 100%', () => {
    expect(() => flooringNeeded(20, 150, 2.2)).not.toThrow();
  });
});

// --- Race time predictor calculator ---

describe('riegelPredictedTime', () => {
  // The issue's own worked example rounds (4.2195)^1.06 to "~4.556" and the
  // final answer to "~3:25:01", but the precise value of (4.2195)^1.06 is
  // ~4.6002, giving ~12420.5s (~3:27:00.5) - verified by direct computation,
  // not copied from the issue's arithmetic.
  test('worked example: 10K in 45:00 predicts a marathon time', () => {
    const predicted = riegelPredictedTime(2700, 10, 42.195);
    expect(predicted).toBeCloseTo(12420.54, 1);
  });

  test('known distance equal to target distance returns the same time (identity case)', () => {
    expect(riegelPredictedTime(2700, 10, 10)).toBeCloseTo(2700, 5);
  });

  test('rejects a non-positive known time or either distance', () => {
    expect(() => riegelPredictedTime(0, 10, 42.195)).toThrow();
    expect(() => riegelPredictedTime(2700, 0, 42.195)).toThrow();
    expect(() => riegelPredictedTime(2700, 10, 0)).toThrow();
  });

  test('predicts a longer time for a longer target distance', () => {
    const predicted = riegelPredictedTime(2700, 10, 21.0975);
    expect(predicted).toBeGreaterThan(2700);
  });
});

// --- Tile calculator ---

describe('tilesNeeded', () => {
  test('worked example: 12 m² room, 300x300mm tiles, 3mm grout, 10% waste', () => {
    const result = tilesNeeded(12, 0.3, 0.3, 0.003, 10);
    expect(result.effectiveArea).toBeCloseTo(0.091809, 6);
    expect(result.tilesForArea).toBeCloseTo(130.706, 2);
    expect(result.tilesNeededCount).toBe(144);
  });

  test('rejects non-positive area, tile width, or tile length', () => {
    expect(() => tilesNeeded(0, 0.3, 0.3, 0.003, 10)).toThrow();
    expect(() => tilesNeeded(12, 0, 0.3, 0.003, 10)).toThrow();
    expect(() => tilesNeeded(12, 0.3, 0, 0.003, 10)).toThrow();
  });

  test('rejects a grout width that exceeds the tile dimensions', () => {
    expect(() => tilesNeeded(12, 0.3, 0.3, 0.3, 10)).toThrow();
    expect(() => tilesNeeded(12, 0.3, 0.3, 0.5, 10)).toThrow();
  });

  test('rejects a negative grout width or waste percentage', () => {
    expect(() => tilesNeeded(12, 0.3, 0.3, -0.001, 10)).toThrow();
    expect(() => tilesNeeded(12, 0.3, 0.3, 0.003, -5)).toThrow();
  });
});

// --- Concrete calculator ---

describe('rectangularConcreteVolume', () => {
  test('worked example: 3m x 2m x 0.1m slab', () => {
    expect(rectangularConcreteVolume(3, 2, 0.1)).toBeCloseTo(0.6, 5);
  });

  test('rejects non-positive length, width, or thickness', () => {
    expect(() => rectangularConcreteVolume(0, 2, 0.1)).toThrow();
    expect(() => rectangularConcreteVolume(3, 0, 0.1)).toThrow();
    expect(() => rectangularConcreteVolume(3, 2, 0)).toThrow();
  });
});

describe('cylindricalConcreteVolume', () => {
  test('computes a cylindrical column volume', () => {
    expect(cylindricalConcreteVolume(0.3, 1)).toBeCloseTo(Math.PI * 0.15 ** 2, 5);
  });

  test('rejects non-positive diameter or height', () => {
    expect(() => cylindricalConcreteVolume(0, 1)).toThrow();
    expect(() => cylindricalConcreteVolume(0.3, 0)).toThrow();
  });
});

describe('concreteBagsNeeded', () => {
  test('worked example: 0.6 m³, 5% waste, 0.0125 m³ per bag (25kg)', () => {
    const result = concreteBagsNeeded(0.6, 5, 0.0125);
    expect(result.volumeWithWaste).toBeCloseTo(0.63, 5);
    expect(result.bagsNeeded).toBe(51);
  });

  test('rejects a non-positive volume or yield per bag', () => {
    expect(() => concreteBagsNeeded(0, 5, 0.0125)).toThrow();
    expect(() => concreteBagsNeeded(0.6, 5, 0)).toThrow();
  });

  test('rejects a negative waste percentage', () => {
    expect(() => concreteBagsNeeded(0.6, -5, 0.0125)).toThrow();
  });
});

// --- Heart-rate training zone calculator ---

describe('karvonenZones', () => {
  test('worked example: age 30, resting HR 60', () => {
    const result = karvonenZones(30, 60);
    expect(result.maxHr).toBe(190);
    expect(result.hrr).toBe(130);
    const zone2 = result.zones.find(z => z.zone === 2);
    expect(zone2.lowerBpm).toBeCloseTo(138, 5);
    expect(zone2.upperBpm).toBeCloseTo(151, 5);
  });

  test('a measured max HR overrides the age-based estimate', () => {
    const result = karvonenZones(30, 60, 200);
    expect(result.maxHr).toBe(200);
    expect(result.hrr).toBe(140);
  });

  test('rejects non-positive age or resting heart rate', () => {
    expect(() => karvonenZones(0, 60)).toThrow();
    expect(() => karvonenZones(30, 0)).toThrow();
  });

  test('rejects a resting heart rate at or above max heart rate', () => {
    expect(() => karvonenZones(30, 190)).toThrow();
    expect(() => karvonenZones(30, 60, 55)).toThrow();
  });
});

// --- Sleep cycle calculator ---

describe('wakeTimesForBedtime', () => {
  test('worked example: bedtime 23:00, 14min buffer, 5 cycles -> wake 06:44', () => {
    const results = wakeTimesForBedtime(23 * 60, 14);
    const fiveCycles = results.find(r => r.cycles === 5);
    expect(fiveCycles.wakeMinutes).toBe(6 * 60 + 44);
  });

  test('returns 4, 5, and 6 cycle options', () => {
    const results = wakeTimesForBedtime(23 * 60);
    expect(results.map(r => r.cycles)).toEqual([4, 5, 6]);
  });

  test('rejects an invalid bedtime or an out-of-range fall-asleep buffer', () => {
    expect(() => wakeTimesForBedtime(-1)).toThrow();
    expect(() => wakeTimesForBedtime(1440)).toThrow();
    expect(() => wakeTimesForBedtime(23 * 60, -1)).toThrow();
    expect(() => wakeTimesForBedtime(23 * 60, 121)).toThrow();
  });
});

describe('bedtimesForWakeTime', () => {
  test('wraps a bedtime the previous night correctly (e.g. a 7am wake-up)', () => {
    const results = bedtimesForWakeTime(7 * 60, 14);
    const sixCycles = results.find(r => r.cycles === 6);
    // 6 cycles = 540 min + 14 min buffer = 554 min before 07:00 -> previous day
    expect(sixCycles.bedtimeMinutes).toBe(((7 * 60 - 554) % 1440 + 1440) % 1440);
  });

  test('returns 3, 4, 5, and 6 cycle options', () => {
    const results = bedtimesForWakeTime(7 * 60);
    expect(results.map(r => r.cycles)).toEqual([3, 4, 5, 6]);
  });

  test('rejects an invalid wake time or an out-of-range fall-asleep buffer', () => {
    expect(() => bedtimesForWakeTime(-1)).toThrow();
    expect(() => bedtimesForWakeTime(1440)).toThrow();
    expect(() => bedtimesForWakeTime(7 * 60, -1)).toThrow();
    expect(() => bedtimesForWakeTime(7 * 60, 121)).toThrow();
  });
});

// --- VO2max estimator (Cooper 12-minute run test) ---

describe('cooperVO2max', () => {
  test('worked example: 2400m in 12 minutes', () => {
    expect(cooperVO2max(2400)).toBeCloseTo(42.4, 1);
  });

  test('rejects a non-positive distance', () => {
    expect(() => cooperVO2max(0)).toThrow();
    expect(() => cooperVO2max(-100)).toThrow();
  });

  test('rejects a distance at or below ~505m (would produce a negative VO2max)', () => {
    expect(() => cooperVO2max(500)).toThrow();
    expect(() => cooperVO2max(504.9)).toThrow();
  });

  test('accepts an unrealistically high distance rather than rejecting it', () => {
    expect(() => cooperVO2max(4500)).not.toThrow();
    expect(cooperVO2max(4500)).toBeGreaterThan(0);
  });
});

describe('vo2maxCategory', () => {
  test('classifies a 25-year-old male across the band thresholds', () => {
    expect(vo2maxCategory(30, 25, 'male')).toBe('Poor');
    expect(vo2maxCategory(35, 25, 'male')).toBe('Fair');
    expect(vo2maxCategory(40, 25, 'male')).toBe('Good');
    expect(vo2maxCategory(44, 25, 'male')).toBe('Excellent');
    expect(vo2maxCategory(50, 25, 'male')).toBe('Superior');
  });

  test('classifies a 25-year-old female across the band thresholds', () => {
    expect(vo2maxCategory(25, 25, 'female')).toBe('Poor');
    expect(vo2maxCategory(30, 25, 'female')).toBe('Fair');
    expect(vo2maxCategory(38, 25, 'female')).toBe('Excellent');
    expect(vo2maxCategory(41, 25, 'female')).toBe('Superior');
  });

  test('uses an older age band for a 55-year-old', () => {
    expect(vo2maxCategory(36, 55, 'male')).toBe('Excellent');
    expect(vo2maxCategory(33, 55, 'male')).toBe('Good');
  });

  test('clamps ages outside the covered 20-69 range to the nearest band', () => {
    expect(vo2maxCategory(30, 10, 'male')).toBe(vo2maxCategory(30, 20, 'male'));
    expect(vo2maxCategory(30, 90, 'male')).toBe(vo2maxCategory(30, 69, 'male'));
  });

  test('rejects an invalid sex or non-positive age', () => {
    expect(() => vo2maxCategory(40, 25, 'other')).toThrow();
    expect(() => vo2maxCategory(40, 0, 'male')).toThrow();
  });
});

// --- Daily water intake calculator ---

describe('dailyWaterIntake', () => {
  test('worked example: 70 kg, moderate activity, temperate climate', () => {
    const result = dailyWaterIntake(70, 'moderate', 'temperate');
    expect(result.baseIntakeMl).toBeCloseTo(2450, 5);
    expect(result.totalIntakeMl).toBeCloseTo(2800, 5);
  });

  test('defaults to sedentary/temperate when not specified', () => {
    const result = dailyWaterIntake(70);
    expect(result.totalIntakeMl).toBeCloseTo(2450, 5);
  });

  test('stacks activity and climate bonuses', () => {
    const result = dailyWaterIntake(70, 'high', 'hot');
    expect(result.totalIntakeMl).toBeCloseTo(2450 + 700 + 350, 5);
  });

  test('rejects a weight outside the plausible 20-300 kg range', () => {
    expect(() => dailyWaterIntake(10)).toThrow();
    expect(() => dailyWaterIntake(350)).toThrow();
  });

  test('throws for an invalid activity level or climate', () => {
    expect(() => dailyWaterIntake(70, 'extreme', 'temperate')).toThrow();
    expect(() => dailyWaterIntake(70, 'moderate', 'arctic')).toThrow();
  });
});

// --- Caffeine half-life calculator ---

describe('caffeineRemaining', () => {
  test('worked example: 95mg dose, default 5h half-life, checked 8h later', () => {
    expect(caffeineRemaining(95, 8)).toBeCloseTo(31.3, 1);
  });

  test('zero elapsed time returns the full dose', () => {
    expect(caffeineRemaining(95, 0)).toBeCloseTo(95, 5);
  });

  test('a custom half-life changes the decay rate', () => {
    const fast = caffeineRemaining(95, 8, 3);
    const slow = caffeineRemaining(95, 8, 7);
    expect(fast).toBeLessThan(slow);
  });

  test('approaches (but never errors on) zero for very large elapsed times', () => {
    const remaining = caffeineRemaining(95, 1000);
    expect(remaining).toBeGreaterThanOrEqual(0);
    expect(remaining).toBeLessThan(0.001);
  });

  test('rejects a negative dose, negative elapsed hours, or non-positive half-life', () => {
    expect(() => caffeineRemaining(-10, 8)).toThrow();
    expect(() => caffeineRemaining(95, -1)).toThrow();
    expect(() => caffeineRemaining(95, 8, 0)).toThrow();
  });
});

// --- Gravel calculator ---

describe('gravelNeeded', () => {
  test('worked example: 10x1m path, 5cm depth, 1.6 t/m³ density, 10% waste', () => {
    const result = gravelNeeded(10, 0.05, 1.6, 10);
    expect(result.volume).toBeCloseTo(0.5, 5);
    expect(result.volumeWithWaste).toBeCloseTo(0.55, 5);
    expect(result.weight).toBeCloseTo(0.88, 5);
  });

  test('rejects non-positive area, depth, or density', () => {
    expect(() => gravelNeeded(0, 0.05, 1.6, 10)).toThrow();
    expect(() => gravelNeeded(10, 0, 1.6, 10)).toThrow();
    expect(() => gravelNeeded(10, 0.05, 0, 10)).toThrow();
  });

  test('rejects a negative waste percentage', () => {
    expect(() => gravelNeeded(10, 0.05, 1.6, -5)).toThrow();
  });
});

// --- Blood alcohol content (BAC) calculator ---

describe('widmarkBAC', () => {
  test('worked example: 70 kg man, 3 standard drinks (42g), 2 hours elapsed', () => {
    const alcoholGrams = alcoholGramsFromDrinkCount(3);
    expect(alcoholGrams).toBe(42);
    expect(widmarkBAC(alcoholGrams, 70, 'male', 2)).toBeCloseTo(0.0582, 3);
  });

  test('clamps BAC at 0 rather than going negative after full elimination', () => {
    expect(widmarkBAC(14, 70, 'male', 100)).toBe(0);
  });

  test('rejects a non-positive weight or negative alcohol/hours', () => {
    expect(() => widmarkBAC(-1, 70, 'male', 2)).toThrow();
    expect(() => widmarkBAC(42, 0, 'male', 2)).toThrow();
    expect(() => widmarkBAC(42, 70, 'male', -1)).toThrow();
  });

  test('throws for a missing or invalid sex', () => {
    expect(() => widmarkBAC(42, 70, undefined, 2)).toThrow();
    expect(() => widmarkBAC(42, 70, 'other', 2)).toThrow();
  });
});

describe('alcoholGramsFromVolume', () => {
  test('computes grams of alcohol from volume and ABV', () => {
    // A 355 mL beer at 5% ABV: 355 * 0.05 * 0.789 ≈ 14.0g (roughly one standard drink)
    expect(alcoholGramsFromVolume(355, 5)).toBeCloseTo(14.0, 1);
  });

  test('rejects a negative volume or ABV', () => {
    expect(() => alcoholGramsFromVolume(-1, 5)).toThrow();
    expect(() => alcoholGramsFromVolume(355, -1)).toThrow();
  });
});

// --- Cycling FTP calculator ---

describe('estimateFTP / ftpPowerZones', () => {
  test('worked example: 20-minute average power of 280W', () => {
    const ftp = estimateFTP(280);
    expect(ftp).toBeCloseTo(266, 5);

    const zones = ftpPowerZones(ftp);
    const zone2 = zones.find(z => z.zone === 2);
    expect(zone2.lowerWatts).toBe(149);
    expect(zone2.upperWatts).toBe(200);

    const zone4 = zones.find(z => z.zone === 4);
    expect(zone4.lowerWatts).toBe(242);
    expect(zone4.upperWatts).toBe(279);
  });

  test('zone 7 has no upper bound', () => {
    const zones = ftpPowerZones(266);
    const zone7 = zones.find(z => z.zone === 7);
    expect(zone7.upperWatts).toBeNull();
  });

  test('rejects a non-positive average power or FTP', () => {
    expect(() => estimateFTP(0)).toThrow();
    expect(() => ftpPowerZones(0)).toThrow();
  });
});

describe('ftpPowerToWeight', () => {
  test('divides FTP by bodyweight and classifies the result', () => {
    const result = ftpPowerToWeight(266, 70);
    expect(result.wattsPerKg).toBeCloseTo(3.8, 2);
    expect(result.category).toBe('Good (Cat 3)');
  });

  test('classifies across the full range of bands', () => {
    expect(ftpPowerToWeight(140, 70).category).toBe('Untrained'); // 2.0 W/kg
    expect(ftpPowerToWeight(455, 70).category).toBe('World class (pro/elite)'); // 6.5 W/kg
  });

  test('rejects a non-positive FTP or bodyweight', () => {
    expect(() => ftpPowerToWeight(0, 70)).toThrow();
    expect(() => ftpPowerToWeight(266, 0)).toThrow();
  });
});

// --- Mulch/Soil calculator ---

describe('mulchVolumeNeeded', () => {
  test('worked example: 4x2m bed, 7cm depth, 10% waste', () => {
    const result = mulchVolumeNeeded(8, 0.07, 10);
    expect(result.volume).toBeCloseTo(0.56, 5);
    expect(result.volumeWithWaste).toBeCloseTo(0.616, 5);
  });

  test('worked example bag count via roundUpToCans: 0.616 m³ at 0.057 m³/bag', () => {
    const { volumeWithWaste } = mulchVolumeNeeded(8, 0.07, 10);
    expect(roundUpToCans(volumeWithWaste, 0.057).cansNeeded).toBe(11);
  });

  test('rejects non-positive area or depth', () => {
    expect(() => mulchVolumeNeeded(0, 0.07, 10)).toThrow();
    expect(() => mulchVolumeNeeded(8, 0, 10)).toThrow();
  });

  test('rejects a negative waste percentage', () => {
    expect(() => mulchVolumeNeeded(8, 0.07, -5)).toThrow();
  });
});

// --- Roof Area calculator ---

describe('roofPitchMultiplier', () => {
  test('matches the reference table for common pitches', () => {
    expect(roofPitchMultiplier(3, 12)).toBeCloseTo(1.031, 3);
    expect(roofPitchMultiplier(4, 12)).toBeCloseTo(1.054, 3);
    expect(roofPitchMultiplier(6, 12)).toBeCloseTo(1.118, 3);
    expect(roofPitchMultiplier(8, 12)).toBeCloseTo(1.202, 3);
    expect(roofPitchMultiplier(12, 12)).toBeCloseTo(1.414, 3);
  });

  test('rejects a run of zero (a vertical wall, not a roof)', () => {
    expect(() => roofPitchMultiplier(6, 0)).toThrow();
  });

  test('rejects a negative rise', () => {
    expect(() => roofPitchMultiplier(-1, 12)).toThrow();
  });

  test('allows an extremely steep pitch (rise much greater than run)', () => {
    expect(() => roofPitchMultiplier(100, 12)).not.toThrow();
  });
});

describe('roofArea', () => {
  test('worked example: 150 m² footprint, 6-in-12 pitch', () => {
    const result = roofArea(150, 6, 12);
    expect(result.multiplier).toBeCloseTo(1.118, 3);
    expect(result.area).toBeCloseTo(167.7, 1);
  });

  test('applies an optional waste allowance', () => {
    const withWaste = roofArea(150, 6, 12, 10);
    const withoutWaste = roofArea(150, 6, 12);
    expect(withWaste.area).toBeCloseTo(withoutWaste.area * 1.10, 3);
  });

  test('rejects a non-positive footprint area', () => {
    expect(() => roofArea(0, 6, 12)).toThrow();
  });
});

// --- Roof Pitch calculator ---

describe('roofPitchConversions', () => {
  test('worked example: rise 5ft over run 10ft', () => {
    const result = roofPitchConversions(5, 10);
    expect(result.slopeRatio).toBeCloseTo(0.5, 5);
    expect(result.xIn12).toBeCloseTo(6, 5);
    expect(result.angleDegrees).toBeCloseTo(26.57, 2);
    expect(result.multiplier).toBeCloseTo(1.118, 3);
  });

  test('rejects a run of zero', () => {
    expect(() => roofPitchConversions(5, 0)).toThrow();
  });

  test('rejects a negative rise or run', () => {
    expect(() => roofPitchConversions(-5, 10)).toThrow();
    expect(() => roofPitchConversions(5, -10)).toThrow();
  });

  test('handles a pitch steeper than 12/12 (45 degrees) correctly', () => {
    const result = roofPitchConversions(18, 10);
    expect(result.angleDegrees).toBeGreaterThan(45);
  });
});

// --- Climbing grade converter ---

describe('convertClimbingGrade', () => {
  test('converts V-scale to Font per the standard table', () => {
    expect(convertClimbingGrade('v', 'V3', 'font')).toBe('6A/6A+');
    expect(convertClimbingGrade('v', 'V6', 'font')).toBe('7A');
  });

  test('converts Font to V-scale (the reverse direction)', () => {
    expect(convertClimbingGrade('font', '7A', 'v')).toBe('V6');
  });

  test('handles the table endpoints (VB and V17) without interpolation', () => {
    expect(convertClimbingGrade('v', 'VB', 'font')).toBe('3');
    expect(convertClimbingGrade('v', 'V17', 'font')).toBe('9A');
  });

  test('same source and target system returns the grade unchanged (identity)', () => {
    expect(convertClimbingGrade('v', 'V5', 'v')).toBe('V5');
    expect(convertClimbingGrade('yds', '5.10a', 'yds')).toBe('5.10a');
  });

  test('rejects converting between YDS and a bouldering scale', () => {
    expect(() => convertClimbingGrade('yds', '5.10a', 'v')).toThrow();
    expect(() => convertClimbingGrade('v', 'V5', 'yds')).toThrow();
  });

  test('rejects an unrecognized grade string', () => {
    expect(() => convertClimbingGrade('v', 'V99', 'font')).toThrow();
    expect(() => convertClimbingGrade('yds', '5.99', 'yds')).toThrow();
  });

  test('rejects a missing source or target system', () => {
    expect(() => convertClimbingGrade(undefined, 'V5', 'font')).toThrow();
    expect(() => convertClimbingGrade('v', 'V5', undefined)).toThrow();
  });
});

// --- Ladder Angle/Safety calculator ---

describe('ladderPlan', () => {
  // The issue's own worked example rounds the recommended length to "~5.94m",
  // but the precise value (verified by direct computation) is ~5.9228m.
  test('worked example: 4.8m support height, 4:1 rule default base distance', () => {
    const result = ladderPlan(4.8);
    expect(result.baseDistance).toBeCloseTo(1.2, 5);
    expect(result.lengthToSupport).toBeCloseTo(4.9477, 3);
    expect(result.recommendedLength).toBeCloseTo(5.9228, 3);
    expect(result.angleDegrees).toBeCloseTo(75.96, 1);
    expect(result.isSafeAngle).toBe(true);
  });

  test('a manually entered base distance overrides the 4:1 default', () => {
    const result = ladderPlan(4.8, 2);
    expect(result.baseDistance).toBe(2);
    expect(result.angleDegrees).toBeLessThan(75);
  });

  test('flags an unsafe (too shallow) angle', () => {
    const result = ladderPlan(4.8, 4); // base distance too large -> shallow angle
    expect(result.isSafeAngle).toBe(false);
  });

  test('flags an unsafe (too steep) angle', () => {
    const result = ladderPlan(4.8, 0.5); // base distance too small -> steep angle
    expect(result.isSafeAngle).toBe(false);
  });

  test('rejects a non-positive support height or base distance', () => {
    expect(() => ladderPlan(0)).toThrow();
    expect(() => ladderPlan(4.8, 0)).toThrow();
    expect(() => ladderPlan(4.8, -1)).toThrow();
  });

  test('rejects a negative extension', () => {
    expect(() => ladderPlan(4.8, 1.2, -1)).toThrow();
  });
});

// --- UV exposure / sun safety calculator ---

describe('timeToBurnMinutes', () => {
  test('worked example: Fitzpatrick type II at UV index 7', () => {
    expect(timeToBurnMinutes(7, 'II')).toBeCloseTo(28.6, 1);
  });

  test('a UV index of 0 returns Infinity (no meaningful burn risk)', () => {
    expect(timeToBurnMinutes(0, 'II')).toBe(Infinity);
  });

  test('SPF multiplies the safe time', () => {
    const noSpf = timeToBurnMinutes(7, 'II');
    const withSpf = timeToBurnMinutes(7, 'II', 30);
    expect(withSpf).toBeCloseTo(noSpf * 30, 5);
  });

  test('darker skin types (higher factor) have a longer time to burn', () => {
    expect(timeToBurnMinutes(7, 'VI')).toBeGreaterThan(timeToBurnMinutes(7, 'I'));
  });

  test('rejects a negative UV index', () => {
    expect(() => timeToBurnMinutes(-1, 'II')).toThrow();
  });

  test('rejects an invalid skin type', () => {
    expect(() => timeToBurnMinutes(7, 'VII')).toThrow();
    expect(() => timeToBurnMinutes(7, undefined)).toThrow();
  });

  test('rejects a non-positive SPF when provided', () => {
    expect(() => timeToBurnMinutes(7, 'II', 0)).toThrow();
    expect(() => timeToBurnMinutes(7, 'II', -5)).toThrow();
  });
});

// --- Pet age calculator ---

describe('dogHumanAge', () => {
  test('worked example: a 2-year-old dog', () => {
    expect(dogHumanAge(2)).toBeCloseTo(42.1, 1);
  });

  test('rejects a non-positive age', () => {
    expect(() => dogHumanAge(0)).toThrow();
    expect(() => dogHumanAge(-1)).toThrow();
  });

  test('rejects an age too young for the formula (under ~3 weeks)', () => {
    expect(() => dogHumanAge(0.01)).toThrow();
  });

  test('rejects an unreasonably large age', () => {
    expect(() => dogHumanAge(31)).toThrow();
  });
});

describe('catHumanAge', () => {
  test('worked example: a 5-year-old cat', () => {
    expect(catHumanAge(5)).toBeCloseTo(36, 5);
  });

  test('first year of life is 15 human years per cat-year', () => {
    expect(catHumanAge(1)).toBeCloseTo(15, 5);
    expect(catHumanAge(0.5)).toBeCloseTo(7.5, 5);
  });

  test('second year adds 9 more human years (2-year-old cat = 24)', () => {
    expect(catHumanAge(2)).toBeCloseTo(24, 5);
  });

  test('each year after the second adds 4 human years', () => {
    expect(catHumanAge(3)).toBeCloseTo(28, 5);
  });

  test('rejects a non-positive or unreasonably large age', () => {
    expect(() => catHumanAge(0)).toThrow();
    expect(() => catHumanAge(-1)).toThrow();
    expect(() => catHumanAge(31)).toThrow();
  });
});

// --- Pregnancy due date calculator ---

describe('dueDateFromLmp', () => {
  test('worked example: LMP of 2026-01-01 with a default 28-day cycle', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    expect(dueDateFromLmp(lmp).toISOString()).toBe('2026-10-08T00:00:00.000Z');
  });

  test('adjusts for a longer-than-average cycle', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    expect(dueDateFromLmp(lmp, 35).toISOString()).toBe('2026-10-15T00:00:00.000Z');
  });

  test('adjusts for a shorter-than-average cycle', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    expect(dueDateFromLmp(lmp, 21).toISOString()).toBe('2026-10-01T00:00:00.000Z');
  });

  test('rejects an implausible cycle length', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    expect(() => dueDateFromLmp(lmp, 10)).toThrow();
    expect(() => dueDateFromLmp(lmp, 50)).toThrow();
  });
});

describe('dueDateFromConception', () => {
  test('adds 266 days to the conception date', () => {
    const conception = new Date('2026-01-01T00:00:00Z');
    expect(dueDateFromConception(conception).toISOString()).toBe('2026-09-24T00:00:00.000Z');
  });
});

describe('gestationalAgeDays', () => {
  test('LMP mode counts days directly from the reference date', () => {
    const lmp = new Date('2026-01-01T00:00:00Z');
    const asOf = new Date('2026-02-01T00:00:00Z');
    expect(gestationalAgeDays('lmp', lmp, asOf)).toBe(31);
  });

  test('conception mode is offset 14 days ahead of days since conception', () => {
    const conception = new Date('2026-01-01T00:00:00Z');
    const asOf = new Date('2026-02-01T00:00:00Z');
    expect(gestationalAgeDays('conception', conception, asOf)).toBe(45);
  });
});

describe('pregnancyMilestones', () => {
  test('worked example: each milestone is exactly N weeks after the reference date', () => {
    const reference = new Date('2026-01-01T00:00:00Z');
    const milestones = pregnancyMilestones(reference);
    expect(milestones.endOfFirstTrimester.toISOString()).toBe('2026-04-02T00:00:00.000Z');
    expect(milestones.anatomyScanStart.toISOString()).toBe('2026-05-07T00:00:00.000Z');
    expect(milestones.anatomyScanEnd.toISOString()).toBe('2026-06-04T00:00:00.000Z');
    expect(milestones.viability.toISOString()).toBe('2026-06-18T00:00:00.000Z');
    expect(milestones.fullTermStart.toISOString()).toBe('2026-09-17T00:00:00.000Z');
    expect(milestones.dueDate.toISOString()).toBe('2026-10-08T00:00:00.000Z');
  });
});

describe('pregnancyTrimester', () => {
  test('12 weeks 6 days is still the 1st trimester', () => {
    expect(pregnancyTrimester(12 * 7 + 6)).toBe(1);
  });

  test('13 weeks 0 days is the 2nd trimester', () => {
    expect(pregnancyTrimester(13 * 7)).toBe(2);
  });

  test('27 weeks 6 days is still the 2nd trimester', () => {
    expect(pregnancyTrimester(27 * 7 + 6)).toBe(2);
  });

  test('28 weeks 0 days is the 3rd trimester', () => {
    expect(pregnancyTrimester(28 * 7)).toBe(3);
  });
});

// --- Earth rotation and orbit distance calculator ---

describe('earthRotationSpeedKmh', () => {
  test('worked example: equator speed is about 1,674 km/h', () => {
    expect(earthRotationSpeedKmh(0)).toBeCloseTo(1674, -1);
  });

  test('worked example: 45 degrees latitude is about 1,183 km/h', () => {
    expect(earthRotationSpeedKmh(45)).toBeCloseTo(1183, 0);
  });

  test('speed at the poles is ~0 (cos(90deg) = 0)', () => {
    expect(earthRotationSpeedKmh(90)).toBeCloseTo(0, 5);
    expect(earthRotationSpeedKmh(-90)).toBeCloseTo(0, 5);
  });

  test('rejects an out-of-range latitude', () => {
    expect(() => earthRotationSpeedKmh(91)).toThrow();
    expect(() => earthRotationSpeedKmh(-91)).toThrow();
  });
});

describe('earthTravelDistance', () => {
  test('worked example: 45 degrees latitude over 24 hours', () => {
    const { rotationKm, orbitKm, totalKm } = earthTravelDistance(45, 24);
    expect(rotationKm).toBeCloseTo(28392, -2);
    expect(orbitKm).toBeCloseTo(2573000, -3);
    expect(totalKm).toBeCloseTo(rotationKm + orbitKm, 5);
  });

  test('rotation-only excludes orbital distance', () => {
    const { rotationKm, orbitKm, totalKm } = earthTravelDistance(0, 1, true, false);
    expect(orbitKm).toBe(0);
    expect(totalKm).toBe(rotationKm);
  });

  test('orbit-only excludes rotational distance', () => {
    const { rotationKm, orbitKm, totalKm } = earthTravelDistance(0, 1, false, true);
    expect(rotationKm).toBe(0);
    expect(totalKm).toBe(orbitKm);
  });

  test('rejects a non-positive duration', () => {
    expect(() => earthTravelDistance(0, 0)).toThrow();
    expect(() => earthTravelDistance(0, -1)).toThrow();
  });

  test('rejects excluding both motions', () => {
    expect(() => earthTravelDistance(0, 1, false, false)).toThrow();
  });
});

// --- Decking calculator ---

describe('deckingMaterialsNeeded', () => {
  test('worked example: 4m x 3m deck, 140mm x 3.6m boards, 5mm gap, 10% waste, 0.4m joist spacing', () => {
    const result = deckingMaterialsNeeded(4, 3, 140, 3.6, 5, 10, 0.4, 2);
    expect(result.effectiveBoardWidthM).toBeCloseTo(0.145, 5);
    expect(result.boardRows).toBe(21);
    expect(result.totalLinearLengthM).toBeCloseTo(84, 5);
    expect(result.boardsByLength).toBe(24);
    expect(result.totalBoards).toBe(27);
    expect(result.joistsCrossedPerBoard).toBe(11);
    expect(result.screwsPerBoard).toBe(22);
    expect(result.totalScrews).toBe(594);
  });

  test('joist spacing larger than deck length still gives the two end joists', () => {
    const result = deckingMaterialsNeeded(4, 3, 140, 3.6, 5, 10, 10, 2);
    expect(result.joistsCrossedPerBoard).toBe(2);
    expect(result.screwsPerBoard).toBe(4);
  });

  test('zero waste and default single screw crossing still ceil-rounds cleanly', () => {
    const result = deckingMaterialsNeeded(4, 3, 140, 3.6, 5, 0, 0.4, 1);
    expect(result.totalBoards).toBe(24);
    expect(result.screwsPerBoard).toBe(11);
    expect(result.totalScrews).toBe(264);
  });

  test('rejects non-positive deck dimensions', () => {
    expect(() => deckingMaterialsNeeded(0, 3, 140, 3.6, 5, 10, 0.4, 2)).toThrow();
    expect(() => deckingMaterialsNeeded(4, -1, 140, 3.6, 5, 10, 0.4, 2)).toThrow();
  });

  test('rejects non-positive board dimensions', () => {
    expect(() => deckingMaterialsNeeded(4, 3, 0, 3.6, 5, 10, 0.4, 2)).toThrow();
    expect(() => deckingMaterialsNeeded(4, 3, 140, 0, 5, 10, 0.4, 2)).toThrow();
  });

  test('rejects a gap greater than or equal to the board width', () => {
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, 140, 10, 0.4, 2)).toThrow();
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, 200, 10, 0.4, 2)).toThrow();
  });

  test('rejects a negative gap or negative waste percentage', () => {
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, -1, 10, 0.4, 2)).toThrow();
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, 5, -5, 0.4, 2)).toThrow();
  });

  test('rejects non-positive joist spacing or screws per joist crossing', () => {
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, 5, 10, 0, 2)).toThrow();
    expect(() => deckingMaterialsNeeded(4, 3, 140, 3.6, 5, 10, 0.4, 0)).toThrow();
  });
});

// --- Staircase calculator ---

describe('staircasePlan', () => {
  test('worked example: 2700mm height, 3600mm run, 200mm target riser', () => {
    const plan = staircasePlan(2700, 3600, 200);
    expect(plan.numberOfSteps).toBe(14);
    expect(plan.numberOfTreads).toBe(13);
    expect(plan.riserHeightMm).toBeCloseTo(192.9, 1);
    expect(plan.treadDepthMm).toBeCloseTo(276.9, 1);
    expect(plan.twoRPlusTMm).toBeCloseTo(662.6, 1);
    expect(plan.riserWithinComfort).toBe(true);
    expect(plan.riserExceedsCodeMax).toBe(false);
    expect(plan.treadWithinComfort).toBe(true);
    expect(plan.treadBelowCodeMin).toBe(false);
    expect(plan.twoRPlusTWithinComfort).toBe(false);
  });

  test('uses the default target riser height (190mm) when omitted', () => {
    const plan = staircasePlan(2700, 3600);
    expect(plan.numberOfSteps).toBe(15);
    expect(plan.numberOfTreads).toBe(14);
    expect(plan.riserHeightMm).toBeCloseTo(180, 5);
    expect(plan.treadDepthMm).toBeCloseTo(257.1, 1);
    expect(plan.riserWithinComfort).toBe(true);
    expect(plan.treadWithinComfort).toBe(true);
    expect(plan.twoRPlusTWithinComfort).toBe(true);
  });

  test('single-step case has zero treads and a null tread depth', () => {
    const plan = staircasePlan(50, 1000);
    expect(plan.numberOfSteps).toBe(1);
    expect(plan.numberOfTreads).toBe(0);
    expect(plan.riserHeightMm).toBe(50);
    expect(plan.treadDepthMm).toBeNull();
    expect(plan.twoRPlusTMm).toBeNull();
    expect(plan.twoRPlusTWithinComfort).toBe(false);
  });

  test('flags a riser that exceeds the code maximum', () => {
    const plan = staircasePlan(250, 1000, 250);
    expect(plan.riserHeightMm).toBe(250);
    expect(plan.riserExceedsCodeMax).toBe(true);
    expect(plan.riserWithinComfort).toBe(false);
  });

  test('flags a tread depth below the code minimum when the run is too short', () => {
    const plan = staircasePlan(2700, 1000, 190);
    expect(plan.treadDepthMm).toBeCloseTo(71.4, 1);
    expect(plan.treadBelowCodeMin).toBe(true);
    expect(plan.treadWithinComfort).toBe(false);
  });

  test('rejects a non-positive total height', () => {
    expect(() => staircasePlan(0, 3600)).toThrow();
    expect(() => staircasePlan(-100, 3600)).toThrow();
  });

  test('rejects a non-positive available run', () => {
    expect(() => staircasePlan(2700, 0)).toThrow();
    expect(() => staircasePlan(2700, -50)).toThrow();
  });

  test('rejects a non-positive target riser height', () => {
    expect(() => staircasePlan(2700, 3600, 0)).toThrow();
    expect(() => staircasePlan(2700, 3600, -10)).toThrow();
  });
});
// --- Fence calculator ---

describe('panelFenceCalculation', () => {
  test('worked example: 21.6 m run with 1.8 m panels', () => {
    const { numPanels, numPosts } = panelFenceCalculation(21.6, 1.8);
    expect(numPanels).toBe(12);
    expect(numPosts).toBe(13);
  });

  test('panel width greater than fence length still computes (1 panel, 2 posts)', () => {
    const { numPanels, numPosts } = panelFenceCalculation(1, 1.8);
    expect(numPanels).toBe(1);
    expect(numPosts).toBe(2);
  });

  test('rejects a non-positive fence length', () => {
    expect(() => panelFenceCalculation(0, 1.8)).toThrow();
    expect(() => panelFenceCalculation(-5, 1.8)).toThrow();
  });

  test('rejects a non-positive panel width', () => {
    expect(() => panelFenceCalculation(20, 0)).toThrow();
    expect(() => panelFenceCalculation(20, -1.8)).toThrow();
  });

  test('rejects non-numeric input', () => {
    expect(() => panelFenceCalculation(NaN, 1.8)).toThrow();
    expect(() => panelFenceCalculation(20, NaN)).toThrow();
  });
});

describe('railFenceCalculation', () => {
  test('worked example: 20 m run, 2.4 m max spacing, 2 rail lines', () => {
    const { numPosts, actualSpacing, numRails } = railFenceCalculation(20, 2.4, 2);
    expect(numPosts).toBe(10);
    expect(actualSpacing).toBeCloseTo(2.22, 2);
    expect(actualSpacing).toBeLessThanOrEqual(2.4);
    expect(numRails).toBe(18);
  });

  test('max post spacing greater than fence length still computes (2 posts, 1 section)', () => {
    const { numPosts, actualSpacing, numRails } = railFenceCalculation(1, 2.4, 2);
    expect(numPosts).toBe(2);
    expect(actualSpacing).toBeCloseTo(1, 5);
    expect(numRails).toBe(2);
  });

  test('3 rail lines scales the rail count accordingly', () => {
    const { numPosts, numRails } = railFenceCalculation(20, 2.4, 3);
    expect(numRails).toBe(3 * (numPosts - 1));
  });

  test('rejects a non-positive fence length', () => {
    expect(() => railFenceCalculation(0, 2.4, 2)).toThrow();
    expect(() => railFenceCalculation(-5, 2.4, 2)).toThrow();
  });

  test('rejects a non-positive max post spacing', () => {
    expect(() => railFenceCalculation(20, 0, 2)).toThrow();
    expect(() => railFenceCalculation(20, -2.4, 2)).toThrow();
  });

  test('rejects a non-positive number of rail lines', () => {
    expect(() => railFenceCalculation(20, 2.4, 0)).toThrow();
    expect(() => railFenceCalculation(20, 2.4, -2)).toThrow();
  });

  test('rejects non-numeric input', () => {
    expect(() => railFenceCalculation(NaN, 2.4, 2)).toThrow();
    expect(() => railFenceCalculation(20, NaN, 2)).toThrow();
    expect(() => railFenceCalculation(20, 2.4, NaN)).toThrow();
  });
});
// --- Heating cost calculator ---

describe('heatingCost', () => {
  test('worked example: 100 m2 average-insulation home, 2200 HDD, 0.9 efficiency', () => {
    const { dailyHeatLossFactor, totalHeatingEnergyKwh, energyAfterEfficiencyKwh, cost } =
      heatingCost(100, INSULATION_FACTOR_PRESETS.average, 2200, 0.9, 0.30);
    expect(dailyHeatLossFactor).toBeCloseTo(2.4, 5);
    expect(totalHeatingEnergyKwh).toBeCloseTo(5280, 5);
    expect(energyAfterEfficiencyKwh).toBeCloseTo(5866.7, 1);
    expect(cost).toBeCloseTo(1760, 0);
  });

  test('a heat pump COP above 1 divides down the raw heating energy', () => {
    const { energyAfterEfficiencyKwh, cost } = heatingCost(50, INSULATION_FACTOR_PRESETS['passive-house'], 1500, 3.0, 0.25);
    expect(energyAfterEfficiencyKwh).toBeCloseTo(90, 5);
    expect(cost).toBeCloseTo(22.5, 5);
  });

  test('zero HDD yields zero heating energy and cost', () => {
    const { totalHeatingEnergyKwh, cost } = heatingCost(100, 1.0, 0, 0.9, 0.30);
    expect(totalHeatingEnergyKwh).toBe(0);
    expect(cost).toBe(0);
  });

  test('rejects a non-positive floor area', () => {
    expect(() => heatingCost(0, 1.0, 2200, 0.9, 0.30)).toThrow();
    expect(() => heatingCost(-10, 1.0, 2200, 0.9, 0.30)).toThrow();
  });

  test('rejects a non-positive insulation factor', () => {
    expect(() => heatingCost(100, 0, 2200, 0.9, 0.30)).toThrow();
    expect(() => heatingCost(100, -1, 2200, 0.9, 0.30)).toThrow();
  });

  test('rejects negative HDD', () => {
    expect(() => heatingCost(100, 1.0, -1, 0.9, 0.30)).toThrow();
  });

  test('rejects a non-positive system efficiency (avoids division by zero)', () => {
    expect(() => heatingCost(100, 1.0, 2200, 0, 0.30)).toThrow();
    expect(() => heatingCost(100, 1.0, 2200, -0.5, 0.30)).toThrow();
  });

  test('rejects a non-positive energy price', () => {
    expect(() => heatingCost(100, 1.0, 2200, 0.9, 0)).toThrow();
    expect(() => heatingCost(100, 1.0, 2200, 0.9, -0.1)).toThrow();
  });
});
// --- Unix timestamp converter ---

describe('detectTimestampUnit', () => {
  test('a plausible seconds value near the present is detected as seconds', () => {
    expect(detectTimestampUnit(1735689600)).toBe('seconds');
  });

  test('the same instant in milliseconds is detected as milliseconds', () => {
    expect(detectTimestampUnit(1735689600000)).toBe('milliseconds');
  });

  test('values just below the 1e12 boundary are seconds', () => {
    expect(detectTimestampUnit(999999999999)).toBe('seconds');
  });

  test('values at or above the 1e12 boundary are milliseconds', () => {
    expect(detectTimestampUnit(1e12)).toBe('milliseconds');
  });

  test('negative (pre-1970) values use the same magnitude heuristic', () => {
    expect(detectTimestampUnit(-1735689600)).toBe('seconds');
    expect(detectTimestampUnit(-1735689600000)).toBe('milliseconds');
  });
});

describe('timestampToDate', () => {
  test('worked example: seconds timestamp decodes to the expected UTC instant', () => {
    expect(timestampToDate(1735689600, 'seconds').toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  test('worked example: milliseconds timestamp decodes to the same instant', () => {
    expect(timestampToDate(1735689600000, 'milliseconds').toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  test('negative timestamps (before 1970) render correctly rather than being rejected', () => {
    expect(timestampToDate(-86400, 'seconds').toISOString()).toBe('1969-12-31T00:00:00.000Z');
  });

  test('fractional (sub-second) seconds are preserved, not treated as an error', () => {
    expect(timestampToDate(4.5, 'seconds').toISOString()).toBe('1970-01-01T00:00:04.500Z');
  });

  test('defaults to seconds when no unit is given', () => {
    expect(timestampToDate(1735689600).toISOString()).toBe('2025-01-01T00:00:00.000Z');
  });

  test('rejects a value so large it overflows the representable Date range', () => {
    expect(() => timestampToDate(1e21, 'seconds')).toThrow();
  });

  test('rejects a non-numeric or empty value', () => {
    expect(() => timestampToDate(NaN, 'seconds')).toThrow();
    expect(() => timestampToDate(undefined, 'seconds')).toThrow();
  });
});

describe('relativeTimeFromNow', () => {
  const now = new Date('2025-01-01T12:00:00Z');

  test('a moment within 30 seconds of now, in either direction, reads as "just now"', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T11:59:35Z'), now)).toBe('just now');
    expect(relativeTimeFromNow(new Date('2025-01-01T12:00:25Z'), now)).toBe('just now');
  });

  test('a few minutes in the past', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T11:55:00Z'), now)).toBe('5 minutes ago');
  });

  test('a single minute in the past uses the singular unit', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T11:59:00Z'), now)).toBe('1 minute ago');
  });

  test('a few hours in the past', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T09:00:00Z'), now)).toBe('3 hours ago');
  });

  test('a single hour in the past uses the singular unit', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T11:00:00Z'), now)).toBe('1 hour ago');
  });

  test('a moment in the future is phrased as "in X <unit>"', () => {
    expect(relativeTimeFromNow(new Date('2025-01-01T12:12:00Z'), now)).toBe('in 12 minutes');
  });

  test('several days in the past', () => {
    expect(relativeTimeFromNow(new Date('2024-12-29T12:00:00Z'), now)).toBe('3 days ago');
  });

  test('several months in the past', () => {
    expect(relativeTimeFromNow(new Date('2024-09-01T12:00:00Z'), now)).toBe('4 months ago');
  });

  test('more than a year in the past', () => {
    expect(relativeTimeFromNow(new Date('2022-01-01T12:00:00Z'), now)).toBe('3 years ago');
  });

  test('defaults `now` to the current time when omitted', () => {
    const almostNow = new Date(Date.now() - 5000);
    expect(relativeTimeFromNow(almostNow)).toBe('just now');
  });
});

describe('formatDateInTimeZone', () => {
  const instant = new Date('2025-01-01T00:00:00Z');

  test('formats in UTC', () => {
    expect(formatDateInTimeZone(instant, 'UTC')).toBe('Wednesday, January 1, 2025 at 12:00:00 AM UTC');
  });

  test('formats the same instant differently in another IANA zone', () => {
    expect(formatDateInTimeZone(instant, 'America/New_York')).toBe('Tuesday, December 31, 2024 at 7:00:00 PM EST');
  });

  test('rejects an unrecognized timezone name', () => {
    expect(() => formatDateInTimeZone(instant, 'Not/AZone')).toThrow();
  });
});

describe('dateFieldsToEpoch', () => {
  test('worked example: 2025-01-01 00:00:00 UTC is epoch 1735689600', () => {
    const { epochMs, epochSeconds } = dateFieldsToEpoch(
      { year: 2025, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
      'UTC',
    );
    expect(epochSeconds).toBe(1735689600);
    expect(epochMs).toBe(1735689600000);
  });

  test('defaults to UTC when no zone is given', () => {
    expect(dateFieldsToEpoch({ year: 2025, month: 1, day: 1, hour: 0, minute: 0, second: 0 }).epochSeconds).toBe(1735689600);
  });

  test('defaults hour/minute/second to zero', () => {
    expect(dateFieldsToEpoch({ year: 2025, month: 1, day: 1 }, 'UTC').epochSeconds).toBe(1735689600);
  });

  test('"local" zone matches the plain JS Date constructor for the same fields', () => {
    const fields = { year: 2025, month: 6, day: 15, hour: 9, minute: 30, second: 0 };
    const expectedMs = new Date(2025, 5, 15, 9, 30, 0).getTime();
    expect(dateFieldsToEpoch(fields, 'local').epochMs).toBe(expectedMs);
  });

  test('rejects an invalid calendar date (February 30) instead of silently rolling over', () => {
    expect(() => dateFieldsToEpoch({ year: 2025, month: 2, day: 30, hour: 0, minute: 0, second: 0 }, 'UTC')).toThrow();
  });

  test('rejects an invalid month (13) instead of silently rolling over', () => {
    expect(() => dateFieldsToEpoch({ year: 2025, month: 13, day: 1, hour: 0, minute: 0, second: 0 }, 'UTC')).toThrow();
  });

  test('rejects an invalid hour (24) instead of silently rolling over', () => {
    expect(() => dateFieldsToEpoch({ year: 2025, month: 1, day: 1, hour: 24, minute: 0, second: 0 }, 'UTC')).toThrow();
  });

  test('rejects a timezone other than UTC or local', () => {
    expect(() => dateFieldsToEpoch({ year: 2025, month: 1, day: 1, hour: 0, minute: 0, second: 0 }, 'Europe/Paris')).toThrow();
  });

  test('rejects non-numeric fields', () => {
    expect(() => dateFieldsToEpoch({ year: 2025, month: 1, day: NaN, hour: 0, minute: 0, second: 0 }, 'UTC')).toThrow();
  });

  test('accepts a date before 1970 (negative epoch)', () => {
    const { epochSeconds } = dateFieldsToEpoch({ year: 1969, month: 12, day: 31, hour: 0, minute: 0, second: 0 }, 'UTC');
    expect(epochSeconds).toBe(-86400);
  });
});
// --- Base64 encoder/decoder ---

describe('base64Encode', () => {
  test('worked example: "Hello, world!"', () => {
    expect(base64Encode('Hello, world!')).toBe('SGVsbG8sIHdvcmxkIQ==');
  });

  test('empty input encodes to empty string', () => {
    expect(base64Encode('')).toBe('');
  });

  test('round-trips non-ASCII/multi-byte UTF-8 text', () => {
    const text = 'héllo 🌍';
    const encoded = base64Encode(text);
    expect(base64Decode(encoded)).toBe(text);
  });

  test('defaults to standard alphabet (+ / =) when urlSafe is omitted', () => {
    expect(base64Encode('>>>???a')).toBe('Pj4+Pz8/YQ==');
  });

  test('urlSafe=false explicitly still produces the exact standard output', () => {
    expect(base64Encode('>>>???a', false)).toBe('Pj4+Pz8/YQ==');
  });

  test('urlSafe=true swaps + and / and strips padding', () => {
    expect(base64Encode('>>>???a', true)).toBe('Pj4-Pz8_YQ');
  });
});

describe('base64Decode', () => {
  test('worked example: "SGVsbG8sIHdvcmxkIQ=="', () => {
    expect(base64Decode('SGVsbG8sIHdvcmxkIQ==')).toBe('Hello, world!');
  });

  test('empty input decodes to empty string', () => {
    expect(base64Decode('')).toBe('');
  });

  test('strips embedded whitespace and newlines before decoding', () => {
    expect(base64Decode('SGVsbG8s\n IHdv cmxk\tIQ==')).toBe('Hello, world!');
  });

  test('accepts URL-safe alphabet (- and _) and normalizes it', () => {
    const encoded = base64Encode('subjects?_id=1&x>>y').replace(/\+/g, '-').replace(/\//g, '_');
    expect(base64Decode(encoded)).toBe('subjects?_id=1&x>>y');
  });

  test('rejects characters outside the Base64 alphabet', () => {
    expect(() => base64Decode('SGVsbG8s!IHdvcmxkIQ==')).toThrow();
  });

  test('rejects input whose length is not a multiple of 4', () => {
    expect(() => base64Decode('SGVsbG8')).toThrow();
  });

  test('rejects invalid padding placement', () => {
    expect(() => base64Decode('SGVs=G8=')).toThrow();
  });
});
// --- Regex tester ---

describe('findRegexMatches', () => {
  test('worked example: email pattern with numbered capture groups', () => {
    const matches = findRegexMatches('(\\w+)@(\\w+)\\.com', 'g', 'contact: alice@example.com or bob@test.com');

    expect(matches).toHaveLength(2);

    expect(matches[0].match).toBe('alice@example.com');
    expect(matches[0].index).toBe(9);
    expect(matches[0].groups).toEqual(['alice', 'example']);

    expect(matches[1].match).toBe('bob@test.com');
    expect(matches[1].groups).toEqual(['bob', 'test']);
  });

  test('always finds every match even without the g flag checked', () => {
    const matches = findRegexMatches('\\d+', '', 'a1 b22 c333');
    expect(matches.map((m) => m.match)).toEqual(['1', '22', '333']);
  });

  test('captures named groups alongside numbered groups', () => {
    const matches = findRegexMatches('(?<user>\\w+)@(?<domain>\\w+)\\.com', 'g', 'alice@example.com');
    expect(matches[0].namedGroups).toEqual({ user: 'alice', domain: 'example' });
    expect(matches[0].groups).toEqual(['alice', 'example']);
  });

  test('reports undefined for a capture group that did not participate', () => {
    const matches = findRegexMatches('(a)|(b)', 'g', 'b');
    expect(matches[0].groups).toEqual([undefined, 'b']);
  });

  test('the i flag makes matching case-insensitive', () => {
    expect(findRegexMatches('hello', '', 'HELLO')).toHaveLength(0);
    expect(findRegexMatches('hello', 'i', 'HELLO')).toHaveLength(1);
  });

  test('handles a pattern that can match an empty string without hanging', () => {
    const matches = findRegexMatches('a*', 'g', 'baab');
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map((m) => m.match)).toContain('aa');
  });

  test('returns no matches against empty sample text when the pattern requires a character', () => {
    expect(findRegexMatches('a', 'g', '')).toEqual([]);
  });

  test('rejects an empty pattern', () => {
    expect(() => findRegexMatches('', 'g', 'some text')).toThrow();
  });

  test('rejects malformed regex syntax', () => {
    expect(() => findRegexMatches('(unclosed', 'g', 'some text')).toThrow();
  });
});

describe('applyRegexReplacement', () => {
  test('worked example: numbered capture groups reordered', () => {
    const result = applyRegexReplacement('(\\w+)@(\\w+)\\.com', '', 'contact: alice@example.com', '$2 user: $1');
    expect(result).toBe('contact: example user: alice');
  });

  test('worked example: named capture groups', () => {
    const result = applyRegexReplacement('(?<user>\\w+)@(?<domain>\\w+)\\.com', '', 'alice@example.com', '$<user> at $<domain>');
    expect(result).toBe('alice at example');
  });

  test('the g flag replaces every match', () => {
    const result = applyRegexReplacement('\\d+', 'g', 'a1 b22 c333', '#');
    expect(result).toBe('a# b# c#');
  });

  test('without the g flag only the first match is replaced', () => {
    const result = applyRegexReplacement('\\d+', '', 'a1 b22 c333', '#');
    expect(result).toBe('a# b22 c333');
  });

  test('rejects an empty pattern', () => {
    expect(() => applyRegexReplacement('', 'g', 'some text', 'x')).toThrow();
  });

  test('rejects malformed regex syntax', () => {
    expect(() => applyRegexReplacement('(unclosed', 'g', 'some text', 'x')).toThrow();
  });
});

// --- Horizon distance calculator ---

describe('horizonDistance', () => {
  test('worked example: 1.7 m eye height', () => {
    const { geometricKm, refractedKm } = horizonDistance(1.7);
    expect(geometricKm).toBeCloseTo(4.654, 3);
    expect(refractedKm).toBeCloseTo(4.990, 3);
  });

  test('refracted distance is roughly 7% farther than pure geometry', () => {
    const { geometricKm, refractedKm } = horizonDistance(1.7);
    expect((refractedKm - geometricKm) / geometricKm).toBeCloseTo(0.0721, 3);
  });

  test('height of zero yields a horizon distance of zero', () => {
    const { geometricKm, refractedKm } = horizonDistance(0);
    expect(geometricKm).toBe(0);
    expect(refractedKm).toBe(0);
  });

  test('handles large heights such as aircraft cruising altitude', () => {
    const { geometricKm, refractedKm } = horizonDistance(10000);
    expect(geometricKm).toBeCloseTo(356.96, 1);
    expect(refractedKm).toBeCloseTo(382.70, 1);
  });

  test('rejects negative height', () => {
    expect(() => horizonDistance(-1)).toThrow();
  });

  test('rejects non-numeric height', () => {
    expect(() => horizonDistance(NaN)).toThrow();
  });
});

// --- Solar panel sizing & ROI calculator ---

describe('solarPanelSizing', () => {
  test('worked example: 15 kWh/day target, 400W panels, 4.5 sun hours, 0.8 derate', () => {
    const { dailyOutputPerPanelKwh, numberOfPanels, systemSizeKw } = solarPanelSizing(15, 400, 4.5, 0.8);
    expect(dailyOutputPerPanelKwh).toBeCloseTo(1.44, 5);
    expect(numberOfPanels).toBe(11);
    expect(systemSizeKw).toBeCloseTo(4.4, 5);
  });

  test('accepts a derate factor of exactly 1', () => {
    const { dailyOutputPerPanelKwh } = solarPanelSizing(10, 300, 5, 1);
    expect(dailyOutputPerPanelKwh).toBeCloseTo(1.5, 5);
  });

  test('rounds panel count up rather than down', () => {
    const { numberOfPanels } = solarPanelSizing(10, 500, 4, 0.8);
    expect(numberOfPanels).toBe(Math.ceil(10 / 1.6));
  });

  test('rejects non-positive target consumption', () => {
    expect(() => solarPanelSizing(0, 400, 4.5, 0.8)).toThrow();
    expect(() => solarPanelSizing(-5, 400, 4.5, 0.8)).toThrow();
  });

  test('rejects non-positive panel wattage', () => {
    expect(() => solarPanelSizing(15, 0, 4.5, 0.8)).toThrow();
    expect(() => solarPanelSizing(15, -400, 4.5, 0.8)).toThrow();
  });

  test('rejects non-positive sun hours', () => {
    expect(() => solarPanelSizing(15, 400, 0, 0.8)).toThrow();
    expect(() => solarPanelSizing(15, 400, -1, 0.8)).toThrow();
  });

  test('rejects a derate factor outside (0, 1]', () => {
    expect(() => solarPanelSizing(15, 400, 4.5, 0)).toThrow();
    expect(() => solarPanelSizing(15, 400, 4.5, -0.1)).toThrow();
    expect(() => solarPanelSizing(15, 400, 4.5, 1.1)).toThrow();
  });
});

describe('solarPaybackPeriod', () => {
  test('worked example: 11 panels at 1.44 kWh/day, EUR 8000 system, EUR 0.30/kWh', () => {
    const { annualProductionKwh, annualSavings, paybackYears } = solarPaybackPeriod(1.44, 11, 8000, 0.30);
    expect(annualProductionKwh).toBeCloseTo(5781.6, 1);
    expect(annualSavings).toBeCloseTo(1734.48, 2);
    expect(paybackYears).toBeCloseTo(4.61, 2);
  });

  test('subtracts annual maintenance cost from savings before computing payback', () => {
    const withoutMaintenance = solarPaybackPeriod(1.44, 11, 8000, 0.30);
    const withMaintenance = solarPaybackPeriod(1.44, 11, 8000, 0.30, 200);
    expect(withMaintenance.annualSavings).toBeCloseTo(withoutMaintenance.annualSavings - 200, 5);
    expect(withMaintenance.paybackYears).toBeGreaterThan(withoutMaintenance.paybackYears);
  });

  test('rejects non-positive system cost', () => {
    expect(() => solarPaybackPeriod(1.44, 11, 0, 0.30)).toThrow();
    expect(() => solarPaybackPeriod(1.44, 11, -100, 0.30)).toThrow();
  });

  test('rejects non-positive energy price', () => {
    expect(() => solarPaybackPeriod(1.44, 11, 8000, 0)).toThrow();
    expect(() => solarPaybackPeriod(1.44, 11, 8000, -0.1)).toThrow();
  });

  test('rejects a negative maintenance cost', () => {
    expect(() => solarPaybackPeriod(1.44, 11, 8000, 0.30, -50)).toThrow();
  });

  test('rejects when maintenance cost meets or exceeds gross annual savings', () => {
    const grossSavings = 1.44 * 11 * 365 * 0.30;
    expect(() => solarPaybackPeriod(1.44, 11, 8000, 0.30, grossSavings)).toThrow();
    expect(() => solarPaybackPeriod(1.44, 11, 8000, 0.30, grossSavings + 100)).toThrow();
  });

  test('still returns a valid (large) payback period for tiny savings vs. huge cost', () => {
    const { paybackYears } = solarPaybackPeriod(0.5, 1, 1000000, 0.10);
    expect(paybackYears).toBeGreaterThan(1000);
    expect(Number.isFinite(paybackYears)).toBe(true);
  });
});
// --- Projectile motion and fall time calculator ---

describe('projectileMotion', () => {
  test('worked example: 20 m/s at 45 degrees from ground level', () => {
    const { timeOfFlight, maxHeight, range, vx, vy } = projectileMotion(20, 45, 0);
    expect(vx).toBeCloseTo(14.14, 2);
    expect(vy).toBeCloseTo(14.14, 2);
    expect(timeOfFlight).toBeCloseTo(2.88, 2);
    expect(maxHeight).toBeCloseTo(10.2, 1);
    expect(range).toBeCloseTo(40.77, 1);
  });

  test('worked example: pure fall from 20 m with zero speed', () => {
    const { timeOfFlight, maxHeight, range } = projectileMotion(0, 0, 20);
    expect(timeOfFlight).toBeCloseTo(2.02, 2);
    expect(maxHeight).toBe(20);
    expect(range).toBe(0);
  });

  test('zero speed and zero height resolves to a valid zero result, not an error', () => {
    const { timeOfFlight, maxHeight, range } = projectileMotion(0, 0, 0);
    expect(timeOfFlight).toBe(0);
    expect(maxHeight).toBe(0);
    expect(range).toBe(0);
  });

  test('horizontal launch from a height combines drop time with horizontal travel', () => {
    const { timeOfFlight, maxHeight, range, vy } = projectileMotion(10, 0, 5);
    expect(vy).toBe(0);
    expect(timeOfFlight).toBeCloseTo(1.01, 2);
    expect(maxHeight).toBe(5);
    expect(range).toBeCloseTo(10.1, 1);
  });

  test('straight-up launch (90 degrees) has negligible range', () => {
    const { range, maxHeight } = projectileMotion(10, 90, 0);
    expect(range).toBeCloseTo(0, 9);
    expect(maxHeight).toBeCloseTo(5.1, 1);
  });

  test('rejects a negative speed', () => {
    expect(() => projectileMotion(-1, 45, 0)).toThrow();
  });

  test('rejects an out-of-range angle', () => {
    expect(() => projectileMotion(10, -1, 0)).toThrow();
    expect(() => projectileMotion(10, 91, 0)).toThrow();
  });

  test('rejects a negative initial height', () => {
    expect(() => projectileMotion(10, 45, -1)).toThrow();
  });
});
// --- URL Encoder/Decoder ---

describe('urlEncode', () => {
  test('worked example: component mode encodes reserved delimiters like & and =', () => {
    expect(urlEncode('a b&c=d', 'component')).toBe('a%20b%26c%3Dd');
  });

  test('worked example: full mode preserves structural characters, only encodes space', () => {
    expect(urlEncode('https://example.com/a b?c=d&e=f', 'full')).toBe('https://example.com/a%20b?c=d&e=f');
  });

  test('defaults to component mode', () => {
    expect(urlEncode('a b&c=d')).toBe(urlEncode('a b&c=d', 'component'));
  });

  test('encodes space as %20, not +', () => {
    expect(urlEncode('a b')).toBe('a%20b');
  });

  test('handles empty input', () => {
    expect(urlEncode('')).toBe('');
    expect(urlEncode('', 'full')).toBe('');
  });

  test('double-encoding an already-encoded value escapes the percent sign', () => {
    expect(urlEncode('a%20b')).toBe('a%2520b');
  });
});

describe('urlDecode', () => {
  test('worked example: component mode decodes back to the original text', () => {
    expect(urlDecode('a%20b%26c%3Dd', 'component')).toBe('a b&c=d');
  });

  test('full mode decodes a complete URI', () => {
    expect(urlDecode('https://example.com/a%20b?c=d&e=f', 'full')).toBe('https://example.com/a b?c=d&e=f');
  });

  test('defaults to component mode', () => {
    expect(urlDecode('a%20b')).toBe(urlDecode('a%20b', 'component'));
  });

  test('handles empty input', () => {
    expect(urlDecode('')).toBe('');
  });

  test('round-trips through encode then decode', () => {
    const original = 'Héllo, world! 100% sure? yes/no & maybe';
    expect(urlDecode(urlEncode(original, 'component'), 'component')).toBe(original);
  });

  test('throws a clear error on a malformed percent sequence', () => {
    expect(() => urlDecode('100%')).toThrow(/malformed/i);
    expect(() => urlDecode('%zz')).toThrow(/malformed/i);
  });

  test('throws a clear error on percent-decoded bytes that are not valid UTF-8', () => {
    expect(() => urlDecode('%E0%A4%A')).toThrow(/malformed/i);
  });
});
// --- JWT decoder ---

function base64UrlEncode(value) {
  const json = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(json, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Builds a JWT from a header/payload object, base64url-encoding each
// segment ourselves so tests control the exact claims (rather than relying
// on a copied real-world token).
function makeJwt(header, payload, signature = 'sig123') {
  const segments = [base64UrlEncode(header), base64UrlEncode(payload)];
  if (signature !== null) segments.push(signature);
  return segments.join('.');
}

describe('base64UrlDecode', () => {
  test('round-trips a Base64URL-encoded string', () => {
    expect(base64UrlDecode(base64UrlEncode('hello world'))).toBe('hello world');
  });

  test('decodes a string requiring re-added padding', () => {
    expect(base64UrlDecode('aGVsbG8')).toBe('hello');
  });

  test('rejects characters outside the Base64URL alphabet', () => {
    expect(() => base64UrlDecode('not valid base64!')).toThrow();
  });
});

describe('decodeJwt', () => {
  const now = Math.floor(Date.now() / 1000);

  test('decodes a well-formed 3-segment token', () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { sub: '1234567890', name: 'Ada Lovelace', iat: now - 3600, exp: now + 3600 };
    const token = makeJwt(header, payload, 'sig123');

    const result = decodeJwt(token);
    expect(result.header).toEqual(header);
    expect(result.payload).toEqual(payload);
    expect(result.signature).toBe('sig123');
    expect(result.claims.isExpired).toBe(false);
    expect(result.claims.isNotYetValid).toBe(false);
    expect(result.claims.iatDate).toBe(new Date((now - 3600) * 1000).toISOString());
    expect(result.claims.expDate).toBe(new Date((now + 3600) * 1000).toISOString());
  });

  test('flags an expired token', () => {
    const token = makeJwt({ alg: 'HS256' }, { exp: now - 100 });
    expect(decodeJwt(token).claims.isExpired).toBe(true);
  });

  test('flags a not-yet-valid token', () => {
    const token = makeJwt({ alg: 'HS256' }, { nbf: now + 100 });
    expect(decodeJwt(token).claims.isNotYetValid).toBe(true);
  });

  test('accepts a 2-segment unsecured token (alg: none)', () => {
    const header = { alg: 'none', typ: 'JWT' };
    const payload = { sub: 'abc' };
    const token = makeJwt(header, payload, null);

    const result = decodeJwt(token);
    expect(result.signature).toBeNull();
    expect(result.header).toEqual(header);
    expect(result.payload).toEqual(payload);
  });

  test('flags an "alg: none" token as insecure', () => {
    const token = makeJwt({ alg: 'none', typ: 'JWT' }, { sub: 'abc' }, null);
    expect(decodeJwt(token).claims.hasNoneAlg).toBe(true);
  });

  test('does not flag a normally-signed token as "alg: none"', () => {
    const token = makeJwt({ alg: 'HS256', typ: 'JWT' }, { sub: 'abc' });
    expect(decodeJwt(token).claims.hasNoneAlg).toBe(false);
  });

  test('flags "alg: none" case-insensitively', () => {
    expect(decodeJwt(makeJwt({ alg: 'None' }, { sub: 'abc' }, null)).claims.hasNoneAlg).toBe(true);
    expect(decodeJwt(makeJwt({ alg: 'NONE' }, { sub: 'abc' }, null)).claims.hasNoneAlg).toBe(true);
  });

  test('strips a Bearer prefix and surrounding whitespace', () => {
    const token = makeJwt({ alg: 'HS256' }, { sub: 'abc' });
    const result = decodeJwt(`  Bearer ${token}  `);
    expect(result.payload).toEqual({ sub: 'abc' });
  });

  test('omits date claims that are absent rather than erroring', () => {
    const token = makeJwt({ alg: 'HS256' }, { sub: 'abc' });
    const result = decodeJwt(token);
    expect(result.claims.iatDate).toBeUndefined();
    expect(result.claims.expDate).toBeUndefined();
    expect(result.claims.nbfDate).toBeUndefined();
    expect(result.claims.isExpired).toBe(false);
    expect(result.claims.isNotYetValid).toBe(false);
  });

  test('surfaces a warning instead of crashing for a non-numeric exp', () => {
    const token = makeJwt({ alg: 'HS256' }, { exp: 'not-a-number' });
    const result = decodeJwt(token);
    expect(result.claims.expWarning).toMatch(/exp/);
    expect(result.claims.isExpired).toBe(false);
  });

  test('rejects a token with the wrong number of segments', () => {
    expect(() => decodeJwt('onlyonesegment')).toThrow();
    expect(() => decodeJwt('a.b.c.d')).toThrow();
  });

  test('names the header segment when it fails to decode', () => {
    expect(() => decodeJwt('not!valid.eyJhIjoxfQ.sig')).toThrow(/header/);
  });

  test('names the payload segment when it is not valid JSON', () => {
    const badPayload = base64UrlEncode('not json');
    expect(() => decodeJwt(`${base64UrlEncode({ alg: 'HS256' })}.${badPayload}.sig`)).toThrow(/payload/);
  });
});
// --- UUID generator ---

describe('generateUuidV4', () => {
  test('produces a well-formed v4 UUID: version nibble 4, variant 8-b', () => {
    const uuid = generateUuidV4();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('two calls produce different values', () => {
    expect(generateUuidV4()).not.toBe(generateUuidV4());
  });
});

describe('generateUuidV1', () => {
  test('produces a well-formed v1 UUID: version nibble 1, variant 8-b', () => {
    const uuid = generateUuidV1();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('node id has the multicast bit set (no fabricated MAC address)', () => {
    const uuid = generateUuidV1();
    const nodeFirstByte = parseInt(uuid.split('-')[4].slice(0, 2), 16);
    expect(nodeFirstByte & 0x01).toBe(1);
  });

  test('two calls produce different values', () => {
    expect(generateUuidV1()).not.toBe(generateUuidV1());
  });
});

describe('generateUuidV7', () => {
  test('produces a well-formed v7 UUID: version nibble 7, variant 8-b', () => {
    const uuid = generateUuidV7();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  test('leading 48 bits encode a current Unix ms timestamp', () => {
    const before = BigInt(Date.now());
    const uuid = generateUuidV7();
    const after = BigInt(Date.now());
    const hex = uuid.split('-').slice(0, 2).join('');
    const timestamp = BigInt('0x' + hex);
    expect(timestamp >= before && timestamp <= after).toBe(true);
  });

  test('two calls produce different values', () => {
    expect(generateUuidV7()).not.toBe(generateUuidV7());
  });
});

describe('generateUuids', () => {
  test('worked example: generates the requested quantity of v4 UUIDs', () => {
    const uuids = generateUuids('v4', 5, false);
    expect(uuids).toHaveLength(5);
    uuids.forEach(u => expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  });

  test('supports v1 and v7', () => {
    expect(generateUuids('v1', 1, false)[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1/);
    expect(generateUuids('v7', 1, false)[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
  });

  test('applies uppercase output case', () => {
    const [uuid] = generateUuids('v4', 1, true);
    expect(uuid).toBe(uuid.toUpperCase());
  });

  test('clamps an unreasonably huge quantity to UUID_MAX_QUANTITY', () => {
    const uuids = generateUuids('v4', UUID_MAX_QUANTITY + 500, false);
    expect(uuids).toHaveLength(UUID_MAX_QUANTITY);
  });

  test('rejects zero, negative, and non-integer quantities', () => {
    expect(() => generateUuids('v4', 0, false)).toThrow();
    expect(() => generateUuids('v4', -1, false)).toThrow();
    expect(() => generateUuids('v4', 1.5, false)).toThrow();
  });

  test('rejects an unknown version', () => {
    expect(() => generateUuids('v9', 1, false)).toThrow();
  });

  test('a batch of UUIDs has no duplicates for a reasonably sized sample', () => {
    const uuids = generateUuids('v4', 200, false);
    expect(new Set(uuids).size).toBe(200);
  });

  test('defaults to hyphenated format', () => {
    const [uuid] = generateUuids('v4', 1, false);
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  test('strips hyphens for the "none" format', () => {
    const [uuid] = generateUuids('v4', 1, false, 'none');
    expect(uuid).toMatch(/^[0-9a-f]{32}$/);
  });

  test('wraps in braces for the "braced" format', () => {
    const [uuid] = generateUuids('v4', 1, false, 'braced');
    expect(uuid).toMatch(/^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/);
  });

  test('applies uppercase before formatting', () => {
    const [uuid] = generateUuids('v4', 1, true, 'braced');
    expect(uuid).toBe(`{${uuid.slice(1, -1).toUpperCase()}}`);
  });

  test('rejects an unknown format', () => {
    expect(() => generateUuids('v4', 1, false, 'weird')).toThrow();
  });
});
// --- JSON Formatter, Minifier & YAML Converter ---

describe('formatJson', () => {
  test('pretty-prints minified JSON with the requested indent width', () => {
    expect(formatJson('{"a":1,"b":[1,2]}', 2)).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
  });

  test('defaults to 2-space indent', () => {
    expect(formatJson('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  test('supports 4-space indent', () => {
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
  });

  test('rejects empty input', () => {
    expect(() => formatJson('')).toThrow('empty');
    expect(() => formatJson('   ')).toThrow('empty');
  });

  test('rejects trailing commas', () => {
    expect(() => formatJson('{"a":1,}')).toThrow();
  });

  test('gives a clear message for // comments', () => {
    expect(() => formatJson('{"a":1} // comment')).toThrow(/comment/i);
  });

  test('gives a clear message for /* */ comments', () => {
    expect(() => formatJson('{\n/* c */\n"a":1}')).toThrow(/comment/i);
  });

  test('does not false-positive on a string containing "//"', () => {
    expect(formatJson('{"url":"http://example.com"}')).toBe('{\n  "url": "http://example.com"\n}');
  });
});

describe('parseJsonOrThrow line/column reporting', () => {
  test('still parses valid JSON with no error (regression)', () => {
    expect(formatJson('{"a":1,"b":2}')).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  test('reports line 1 and the right column for a single-line error', () => {
    expect(() => formatJson('{"a":1,}')).toThrow(/line 1, column 8/);
  });

  test('reports the correct later line number for multi-line input', () => {
    const input = '{\n  "a": 1,\n  "b": 2,\n}\n';
    expect(() => formatJson(input)).toThrow(/line 4, column 1/);
  });

  test('includes the offending line text in the error message', () => {
    const input = '{\n  "a": 1,\n  "b": 2,\n}\n';
    expect(() => formatJson(input)).toThrow(/}/);
  });

  test('falls back to the plain message when no position can be extracted', () => {
    // Empty input never reaches JSON.parse - covered separately - but this
    // guards that the generic "Invalid JSON:" prefix still exists for any
    // engine message without a "position N" segment.
    expect(() => formatJson('{a:1}')).toThrow(/Invalid JSON/);
  });
});

describe('minifyJson', () => {
  test('collapses formatted JSON to one compact line', () => {
    expect(minifyJson('{\n  "a": 1,\n  "b": [1, 2, 3]\n}')).toBe('{"a":1,"b":[1,2,3]}');
  });

  test('surfaces a useful error for invalid JSON', () => {
    expect(() => minifyJson('{a:1}')).toThrow();
  });
});

describe('validateJson', () => {
  test('returns { valid: true } for well-formed JSON', () => {
    expect(validateJson('{"a":1}')).toEqual({ valid: true });
  });

  test('throws with the underlying error for malformed JSON', () => {
    expect(() => validateJson('{"a":1,}')).toThrow();
  });

  test('does not corrupt precision beyond what JSON.parse already loses', () => {
    const input = '9007199254740993';
    expect(formatJson(input)).toBe(String(JSON.parse(input)));
  });
});

describe('jsonToYaml', () => {
  test('worked example from the issue', () => {
    expect(jsonToYaml('{"name":"Ada","tags":["math","cs"]}')).toBe('name: Ada\ntags:\n  - math\n  - cs\n');
  });

  test('emits nested objects and arrays of objects', () => {
    const yaml = jsonToYaml(JSON.stringify({ items: [{ a: 1, b: 2 }, { a: 3 }] }));
    expect(yaml).toBe('items:\n  - a: 1\n    b: 2\n  - a: 3\n');
  });

  test('quotes strings that would otherwise look like another type', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: 'true', b: '42', c: '', d: 'null' }));
    expect(yaml).toBe('a: "true"\nb: "42"\nc: ""\nd: "null"\n');
  });

  test('quotes strings containing YAML-significant characters', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: 'x: y', b: '#tag', c: '-dash', d: '*star' }));
    expect(yaml).toBe('a: "x: y"\nb: "#tag"\nc: "-dash"\nd: "*star"\n');
  });

  test('escapes internal quotes and backslashes when a string needs quoting', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: 'say "hi": \\ ok' }));
    expect(yaml).toBe('a: "say \\"hi\\": \\\\ ok"\n');
  });

  test('leaves an unquotable-looking plain scalar bare (no ambiguity to escape)', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: 'say "hi" \\ ok' }));
    expect(yaml).toBe('a: say "hi" \\ ok\n');
  });

  test('renders empty arrays and objects inline', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: [], b: {} }));
    expect(yaml).toBe('a: []\nb: {}\n');
  });

  test('renders null, booleans, and numbers bare', () => {
    const yaml = jsonToYaml(JSON.stringify({ a: null, b: true, c: false, d: 3.14, e: -5 }));
    expect(yaml).toBe('a: null\nb: true\nc: false\nd: 3.14\ne: -5\n');
  });

  test('handles a few hundred levels of nesting without blowing the stack', () => {
    let deep = 1;
    for (let i = 0; i < 300; i++) deep = { n: deep };
    expect(() => jsonToYaml(JSON.stringify(deep))).not.toThrow();
  });

  test('rejects invalid JSON input', () => {
    expect(() => jsonToYaml('{a:1}')).toThrow();
  });
});

describe('yamlToJson', () => {
  test('worked example from the issue (reverse of jsonToYaml example)', () => {
    expect(yamlToJson('name: Ada\ntags:\n  - math\n  - cs\n')).toBe('{"name":"Ada","tags":["math","cs"]}');
  });

  test('parses nested mappings and sequences of mappings', () => {
    const json = yamlToJson('items:\n  - a: 1\n    b: 2\n  - a: 3\n');
    expect(JSON.parse(json)).toEqual({ items: [{ a: 1, b: 2 }, { a: 3 }] });
  });

  test('parses quoted strings (single and double)', () => {
    const json = yamlToJson('a: "hello world"\nb: \'it\'\'s fine\'\n');
    expect(JSON.parse(json)).toEqual({ a: 'hello world', b: "it's fine" });
  });

  test('parses bare scalars: true/false/null/numbers/plain strings', () => {
    const json = yamlToJson('a: true\nb: false\nc: null\nd: 5\ne: 3.5\nf: hello\n');
    expect(JSON.parse(json)).toEqual({ a: true, b: false, c: null, d: 5, e: 3.5, f: 'hello' });
  });

  test('strips # comments outside of quoted strings', () => {
    const json = yamlToJson('# leading comment\na: 1 # trailing comment\nb: "value # not a comment"\n');
    expect(JSON.parse(json)).toEqual({ a: 1, b: 'value # not a comment' });
  });

  test('round-trips a value produced by jsonToYaml', () => {
    const original = {
      items: [{ a: 1, b: 2 }, { a: 3 }],
      nested: { x: { y: 'hello world', z: null } },
      emptyArr: [],
      emptyObj: {},
      numStr: '42',
      special: 'a: b',
      bools: [true, false],
      neg: -5,
      flt: 3.14,
    };
    const yaml = jsonToYaml(JSON.stringify(original));
    expect(JSON.parse(yamlToJson(yaml))).toEqual(original);
  });

  test('handles a few hundred levels of nesting without blowing the stack', () => {
    let deep = 1;
    for (let i = 0; i < 300; i++) deep = { n: deep };
    const deepJson = JSON.stringify(deep);
    expect(yamlToJson(jsonToYaml(deepJson))).toBe(deepJson);
  });

  test('rejects empty input', () => {
    expect(() => yamlToJson('')).toThrow('empty');
    expect(() => yamlToJson('   ')).toThrow('empty');
  });

  test('rejects tabs used for indentation', () => {
    expect(() => yamlToJson('a:\n\tb: 1\n')).toThrow(/tab/i);
  });

  test('rejects anchors', () => {
    expect(() => yamlToJson('a: &anchor 1\nb: *anchor\n')).toThrow(/anchor/i);
  });

  test('rejects aliases', () => {
    expect(() => yamlToJson('a: *anchor\n')).toThrow(/alias/i);
  });

  test('rejects flow-style mappings and sequences', () => {
    expect(() => yamlToJson('a: {b: 1}\n')).toThrow(/flow style/i);
    expect(() => yamlToJson('a: [1, 2, 3]\n')).toThrow(/flow style/i);
  });

  test('rejects multi-line block scalars', () => {
    expect(() => yamlToJson('a: |\n  line1\n  line2\n')).toThrow(/block scalar/i);
    expect(() => yamlToJson('a: >\n  folded text\n')).toThrow(/block scalar/i);
  });

  test('rejects tags', () => {
    expect(() => yamlToJson('a: !!str 123\n')).toThrow(/tag/i);
  });
});
// --- Cron expression generator & translator ---

describe('parseCronField', () => {
  test('"*" expands to the full range', () => {
    expect(parseCronField('*', 0, 4)).toEqual([0, 1, 2, 3, 4]);
  });

  test('a single value', () => {
    expect(parseCronField('5', 0, 59)).toEqual([5]);
  });

  test('an inclusive range', () => {
    expect(parseCronField('9-12', 0, 23)).toEqual([9, 10, 11, 12]);
  });

  test('a comma-separated list', () => {
    expect(parseCronField('1,15,30', 0, 59)).toEqual([1, 15, 30]);
  });

  test('"*/S" steps from the field minimum', () => {
    expect(parseCronField('*/15', 0, 59)).toEqual([0, 15, 30, 45]);
  });

  test('"N-M/S" steps within a range', () => {
    expect(parseCronField('10-40/5', 0, 59)).toEqual([10, 15, 20, 25, 30, 35, 40]);
  });

  test('combined ranges, lists, and steps', () => {
    expect(parseCronField('1-5,10,20-25/5', 0, 59)).toEqual([1, 2, 3, 4, 5, 10, 20, 25]);
  });

  test('month names resolve case-insensitively', () => {
    expect(parseCronField('jan-mar', 1, 12, ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'])).toEqual([1, 2, 3]);
  });

  test('day-of-week folds 7 into 0 (both mean Sunday)', () => {
    expect(parseCronField('0,7', 0, 7, ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'])).toEqual([0]);
  });

  test('rejects an out-of-range value', () => {
    expect(() => parseCronField('60', 0, 59)).toThrow();
    expect(() => parseCronField('13', 1, 12)).toThrow();
    expect(() => parseCronField('8', 0, 7)).toThrow();
  });

  test('rejects a reversed range', () => {
    expect(() => parseCronField('5-2', 0, 59)).toThrow();
  });

  test('rejects a zero or negative step', () => {
    expect(() => parseCronField('*/0', 0, 59)).toThrow();
  });

  test('rejects non-numeric text in a field with no names', () => {
    expect(() => parseCronField('abc', 1, 31)).toThrow();
  });

  test('rejects stray or doubled commas', () => {
    expect(() => parseCronField('1,,2', 0, 59)).toThrow();
    expect(() => parseCronField(',1', 0, 59)).toThrow();
    expect(() => parseCronField('1,', 0, 59)).toThrow();
  });

  test('rejects an empty field', () => {
    expect(() => parseCronField('', 0, 59)).toThrow();
  });
});

describe('describeCronField', () => {
  test('day-of-month single value', () => {
    expect(describeCronField('1', 'dayOfMonth')).toBe('day 1 of the month');
  });

  test('month single value uses the full name', () => {
    expect(describeCronField('1', 'month')).toBe('January');
  });

  test('day-of-week range reads as "X through Y"', () => {
    expect(describeCronField('1-5', 'dayOfWeek')).toBe('Monday through Friday');
  });

  test('minute step reads as "every N minutes"', () => {
    expect(describeCronField('*/15', 'minute')).toBe('Every 15 minutes');
  });

  test('throws for an unknown field kind', () => {
    expect(() => describeCronField('*', 'nonsense')).toThrow();
  });
});

describe('describeCron', () => {
  test('worked example: yearly at midnight on Jan 1', () => {
    expect(describeCron('0 0 1 1 *')).toBe('At 00:00, on day 1 of the month, only in January');
  });

  test('worked example: every 15 minutes on weekday business hours', () => {
    expect(describeCron('*/15 9-17 * * 1-5')).toBe('Every 15 minutes, between 09:00 and 17:59, Monday through Friday');
  });

  test('worked example: 09:00 on Monday, Wednesday, and Friday', () => {
    expect(describeCron('0 9 * * 1,3,5')).toBe('At 09:00, on Monday, Wednesday, and Friday');
  });

  test('worked example: monthly on day 1', () => {
    expect(describeCron('30 4 1 * *')).toBe('At 04:30, on day 1 of the month');
  });

  test('@yearly and @annually expand to the same schedule', () => {
    expect(describeCron('@yearly')).toBe(describeCron('0 0 1 1 *'));
    expect(describeCron('@annually')).toBe(describeCron('0 0 1 1 *'));
  });

  test('@monthly expands correctly', () => {
    expect(describeCron('@monthly')).toBe(describeCron('0 0 1 * *'));
  });

  test('@weekly expands correctly', () => {
    expect(describeCron('@weekly')).toBe(describeCron('0 0 * * 0'));
  });

  test('@daily and @midnight expand to the same schedule', () => {
    expect(describeCron('@daily')).toBe(describeCron('0 0 * * *'));
    expect(describeCron('@midnight')).toBe(describeCron('0 0 * * *'));
  });

  test('@hourly expands correctly', () => {
    expect(describeCron('@hourly')).toBe(describeCron('0 * * * *'));
  });

  test('@reboot is flagged as unsupported rather than expanded', () => {
    expect(describeCron('@reboot')).toMatch(/startup/i);
  });

  test('an unrecognized macro throws', () => {
    expect(() => describeCron('@fortnightly')).toThrow();
  });

  test('day-of-month and day-of-week both restricted use OR semantics', () => {
    const result = describeCron('0 0 1 * 1');
    expect(result).toContain('day 1 of the month');
    expect(result).toContain('Monday');
    expect(result).toMatch(/ or /);
  });

  test('day 31 is described accurately, not rejected', () => {
    const result = describeCron('0 0 31 * *');
    expect(result).toContain('day 31 of the month');
    expect(result.toLowerCase()).toContain('not occur in every month');
  });

  test('day 29 gets a leap-year note', () => {
    expect(describeCron('0 0 29 2 *').toLowerCase()).toContain('leap year');
  });

  test('a field with too many segments throws', () => {
    expect(() => describeCron('* * * *')).toThrow();
    expect(() => describeCron('* * * * * *')).toThrow();
  });

  test('an out-of-range value throws with a helpful message', () => {
    expect(() => describeCron('60 0 1 1 *')).toThrow(/minute/i);
    expect(() => describeCron('0 0 1 13 *')).toThrow(/month/i);
    expect(() => describeCron('0 0 1 1 8')).toThrow(/day-of-week/i);
  });

  test('a malformed range or step throws', () => {
    expect(() => describeCron('5-2 0 1 1 *')).toThrow();
    expect(() => describeCron('*/0 0 1 1 *')).toThrow();
    expect(() => describeCron('a 0 1 1 *')).toThrow();
  });

  test('empty input throws', () => {
    expect(() => describeCron('')).toThrow();
    expect(() => describeCron('   ')).toThrow();
  });

  test('every minute has no wildcard fragments', () => {
    expect(describeCron('* * * * *')).toBe('Every minute');
  });
});

describe('buildCronExpression', () => {
  test('joins the 5 fields in order', () => {
    expect(buildCronExpression({
      minute: '30', hour: '4', dayOfMonth: '1', month: '*', dayOfWeek: '*',
    })).toBe('30 4 1 * *');
  });

  test('its output can be fed straight into describeCron', () => {
    const expr = buildCronExpression({
      minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1,3,5',
    });
    expect(describeCron(expr)).toBe('At 09:00, on Monday, Wednesday, and Friday');
  });

  test('rejects an invalid field', () => {
    expect(() => buildCronExpression({
      minute: '60', hour: '4', dayOfMonth: '1', month: '*', dayOfWeek: '*',
    })).toThrow();
  });
});

describe('nextCronRunTimes', () => {
  test('walks forward minute-by-minute for a simple "every N minutes" expression', () => {
    const from = new Date(2024, 0, 1, 10, 5, 0);
    const runs = nextCronRunTimes('*/15 * * * *', 3, from);
    expect(runs.map((d) => d.getTime())).toEqual([
      new Date(2024, 0, 1, 10, 15, 0).getTime(),
      new Date(2024, 0, 1, 10, 30, 0).getTime(),
      new Date(2024, 0, 1, 10, 45, 0).getTime(),
    ]);
  });

  test('skips weekends for a weekdays-only expression', () => {
    // 2024-01-05 is a Friday; its 09:00 run has already passed, so the next
    // 09:00 weekday run should skip Sat/Sun and land on Monday 2024-01-08.
    const from = new Date(2024, 0, 5, 10, 0, 0);
    const runs = nextCronRunTimes('0 9 * * 1-5', 1, from);
    expect(runs[0].getTime()).toBe(new Date(2024, 0, 8, 9, 0, 0).getTime());
  });

  test('applies OR semantics when both day-of-month and day-of-week are restricted', () => {
    // "on the 1st, or on Monday" - Mondays fire independently of the 1st of
    // the month, and the 1st fires even on a Thursday.
    const from = new Date(2024, 0, 1, 0, 1, 0);
    const runs = nextCronRunTimes('0 0 1 * 1', 5, from);
    expect(runs.map((d) => d.getTime())).toEqual([
      new Date(2024, 0, 8, 0, 0, 0).getTime(),
      new Date(2024, 0, 15, 0, 0, 0).getTime(),
      new Date(2024, 0, 22, 0, 0, 0).getTime(),
      new Date(2024, 0, 29, 0, 0, 0).getTime(),
      new Date(2024, 1, 1, 0, 0, 0).getTime(),
    ]);
  });

  test('throws for a schedule that can never fire (Feb 30th does not exist)', () => {
    expect(() => nextCronRunTimes('0 0 30 2 *', 1, new Date(2024, 0, 1, 0, 0, 0))).toThrow();
  });
});

describe('expandCronMacro', () => {
  test('expands a known macro', () => {
    expect(expandCronMacro('@daily')).toBe('0 0 * * *');
  });

  test('is case-insensitive', () => {
    expect(expandCronMacro('@DAILY')).toBe('0 0 * * *');
  });

  test('returns a non-macro expression unchanged (trimmed)', () => {
    expect(expandCronMacro('  30 4 1 * *  ')).toBe('30 4 1 * *');
  });

  test('returns null for an unsupported macro', () => {
    expect(expandCronMacro('@reboot')).toBeNull();
  });

  test('throws for an unrecognized macro', () => {
    expect(() => expandCronMacro('@fortnightly')).toThrow();
  });
});

describe('parseIpv4', () => {
  test('parses a standard address', () => {
    expect(parseIpv4('192.168.1.10')).toBe(0xC0A8010A);
  });

  test('parses 0.0.0.0', () => {
    expect(parseIpv4('0.0.0.0')).toBe(0);
  });

  test('parses 255.255.255.255', () => {
    expect(parseIpv4('255.255.255.255')).toBe(0xFFFFFFFF >>> 0);
  });

  test('parses leading zeros as decimal, not octal', () => {
    expect(parseIpv4('192.168.001.010')).toBe(parseIpv4('192.168.1.10'));
  });

  test('rejects wrong number of octets', () => {
    expect(() => parseIpv4('192.168.1')).toThrow();
    expect(() => parseIpv4('192.168.1.1.1')).toThrow();
  });

  test('rejects an out-of-range octet', () => {
    expect(() => parseIpv4('192.168.1.256')).toThrow();
    expect(() => parseIpv4('192.168.-1.1')).toThrow();
  });

  test('rejects a non-numeric octet', () => {
    expect(() => parseIpv4('192.168.a.1')).toThrow();
  });
});

describe('ipv4IntToString', () => {
  test('converts a 32-bit int back to dotted-quad', () => {
    expect(ipv4IntToString(parseIpv4('192.168.1.10'))).toBe('192.168.1.10');
  });

  test('round-trips 255.255.255.255', () => {
    expect(ipv4IntToString(parseIpv4('255.255.255.255'))).toBe('255.255.255.255');
  });

  test('round-trips 0.0.0.0', () => {
    expect(ipv4IntToString(0)).toBe('0.0.0.0');
  });
});

describe('subnetInfo', () => {
  test('computes the worked example, 192.168.1.10/26', () => {
    const info = subnetInfo('192.168.1.10', 26);
    expect(info.networkAddress).toBe('192.168.1.0');
    expect(info.broadcastAddress).toBe('192.168.1.63');
    expect(info.subnetMask).toBe('255.255.255.192');
    expect(info.wildcardMask).toBe('0.0.0.63');
    expect(info.firstUsable).toBe('192.168.1.1');
    expect(info.lastUsable).toBe('192.168.1.62');
    expect(info.usableHostCount).toBe(62);
    expect(info.totalAddresses).toBe(64);
  });

  test('computes network/broadcast for a /24 with host bits set', () => {
    const info = subnetInfo('192.168.1.10', 24);
    expect(info.networkAddress).toBe('192.168.1.0');
    expect(info.broadcastAddress).toBe('192.168.1.255');
    expect(info.subnetMask).toBe('255.255.255.0');
    expect(info.wildcardMask).toBe('0.0.0.255');
    expect(info.firstUsable).toBe('192.168.1.1');
    expect(info.lastUsable).toBe('192.168.1.254');
    expect(info.usableHostCount).toBe(254);
    expect(info.totalAddresses).toBe(256);
  });

  test('handles /0', () => {
    const info = subnetInfo('10.20.30.40', 0);
    expect(info.networkAddress).toBe('0.0.0.0');
    expect(info.broadcastAddress).toBe('255.255.255.255');
    expect(info.subnetMask).toBe('0.0.0.0');
    expect(info.wildcardMask).toBe('255.255.255.255');
    expect(info.usableHostCount).toBe(Math.pow(2, 32) - 2);
    expect(info.totalAddresses).toBe(Math.pow(2, 32));
  });

  test('computes the wildcard mask for a /30', () => {
    const info = subnetInfo('192.168.1.4', 30);
    expect(info.subnetMask).toBe('255.255.255.252');
    expect(info.wildcardMask).toBe('0.0.0.3');
  });

  test('special-cases /31 as a two-address point-to-point link (RFC 3021)', () => {
    const info = subnetInfo('192.168.1.0', 31);
    expect(info.networkAddress).toBe('192.168.1.0');
    expect(info.broadcastAddress).toBe('192.168.1.1');
    expect(info.firstUsable).toBe('192.168.1.0');
    expect(info.lastUsable).toBe('192.168.1.1');
    expect(info.usableHostCount).toBe(2);
    expect(info.totalAddresses).toBe(2);
  });

  test('special-cases /32 as a single host route', () => {
    const info = subnetInfo('192.168.1.5', 32);
    expect(info.networkAddress).toBe('192.168.1.5');
    expect(info.broadcastAddress).toBe('192.168.1.5');
    expect(info.firstUsable).toBe('192.168.1.5');
    expect(info.lastUsable).toBe('192.168.1.5');
    expect(info.usableHostCount).toBe(1);
    expect(info.totalAddresses).toBe(1);
  });

  test('rejects a malformed IP address', () => {
    expect(() => subnetInfo('192.168.1.256', 24)).toThrow();
    expect(() => subnetInfo('not.an.ip.addr', 24)).toThrow();
  });

  test('rejects an out-of-range prefix length', () => {
    expect(() => subnetInfo('192.168.1.0', -1)).toThrow();
    expect(() => subnetInfo('192.168.1.0', 33)).toThrow();
  });

  test('rejects a non-integer prefix length', () => {
    expect(() => subnetInfo('192.168.1.0', 24.5)).toThrow();
  });
});
describe('parseIpv4Octets', () => {
  test('parses a normal address', () => {
    expect(parseIpv4Octets('192.0.2.1')).toEqual([192, 0, 2, 1]);
  });

  test('parses all-zero and all-max addresses', () => {
    expect(parseIpv4Octets('0.0.0.0')).toEqual([0, 0, 0, 0]);
    expect(parseIpv4Octets('255.255.255.255')).toEqual([255, 255, 255, 255]);
  });

  test('rejects wrong segment count', () => {
    expect(() => parseIpv4Octets('192.0.2')).toThrow();
    expect(() => parseIpv4Octets('192.0.2.1.5')).toThrow();
  });

  test('rejects an out-of-range octet', () => {
    expect(() => parseIpv4Octets('192.0.2.256')).toThrow();
    expect(() => parseIpv4Octets('999.0.2.1')).toThrow();
  });

  test('rejects non-numeric segments', () => {
    expect(() => parseIpv4Octets('192.0.2.abc')).toThrow();
  });

  test('rejects leading-zero segments', () => {
    expect(() => parseIpv4Octets('192.0.2.01')).toThrow();
  });
});

describe('ipv4ToIpv6Mapped', () => {
  test('worked example: 192.0.2.1', () => {
    expect(ipv4ToIpv6Mapped('192.0.2.1')).toEqual({
      mixed: '::ffff:192.0.2.1',
      hex: '::ffff:c000:0201',
    });
  });

  test('handles 0.0.0.0', () => {
    expect(ipv4ToIpv6Mapped('0.0.0.0')).toEqual({
      mixed: '::ffff:0.0.0.0',
      hex: '::ffff:0000:0000',
    });
  });

  test('handles 255.255.255.255', () => {
    expect(ipv4ToIpv6Mapped('255.255.255.255')).toEqual({
      mixed: '::ffff:255.255.255.255',
      hex: '::ffff:ffff:ffff',
    });
  });

  test('throws on malformed IPv4 input', () => {
    expect(() => ipv4ToIpv6Mapped('192.0.2.256')).toThrow();
  });
});

describe('ipv4ToIpv6Compatible', () => {
  test('builds the deprecated form without ffff', () => {
    expect(ipv4ToIpv6Compatible('192.0.2.1')).toBe('::192.0.2.1');
  });

  test('throws on malformed IPv4 input', () => {
    expect(() => ipv4ToIpv6Compatible('not.an.ip.addr')).toThrow();
  });
});

describe('ipv6ToIpv4', () => {
  test('worked example: ::ffff:192.0.2.1', () => {
    expect(ipv6ToIpv4('::ffff:192.0.2.1')).toEqual({ ipv4: '192.0.2.1', deprecated: false });
  });

  test('worked example: ::ffff:c000:0201 matches the mixed form', () => {
    expect(ipv6ToIpv4('::ffff:c000:0201')).toEqual({ ipv4: '192.0.2.1', deprecated: false });
  });

  test('is case-insensitive', () => {
    expect(ipv6ToIpv4('::FFFF:192.0.2.1')).toEqual({ ipv4: '192.0.2.1', deprecated: false });
    expect(ipv6ToIpv4('::ffff:C000:0201')).toEqual({ ipv4: '192.0.2.1', deprecated: false });
  });

  test('recognizes the deprecated ::a.b.c.d form and labels it', () => {
    expect(ipv6ToIpv4('::192.0.2.1')).toEqual({ ipv4: '192.0.2.1', deprecated: true });
  });

  test('handles pure-hex groups without leading zeros', () => {
    expect(ipv6ToIpv4('::ffff:c000:201')).toEqual({ ipv4: '192.0.2.1', deprecated: false });
  });

  test('rejects an address outside the mapped/compatible prefixes', () => {
    expect(() => ipv6ToIpv4('2001:db8::1')).toThrow();
  });

  test('rejects malformed hex groups', () => {
    expect(() => ipv6ToIpv4('::ffff:zzzz:0201')).toThrow();
    expect(() => ipv6ToIpv4('::ffff:12345:0201')).toThrow();
  });

  test('rejects a mixed form with an invalid IPv4 part', () => {
    expect(() => ipv6ToIpv4('::ffff:999.0.2.1')).toThrow();
  });

  test('rejects more than one :: compression', () => {
    expect(() => ipv6ToIpv4('::ffff::192.0.2.1')).toThrow();
  });

  test('rejects an empty or unrelated string', () => {
    expect(() => ipv6ToIpv4('')).toThrow();
    expect(() => ipv6ToIpv4('not an ip')).toThrow();
  });
});
// --- Wind chill & heat index calculator ---

describe('windChillFahrenheit', () => {
  test('worked example: 20F, 15mph', () => {
    const { applicable, feelsLikeF } = windChillFahrenheit(20, 15);
    expect(applicable).toBe(true);
    expect(feelsLikeF).toBeCloseTo(6.2189, 3);
  });

  test('not applicable above 50F even with strong wind', () => {
    const result = windChillFahrenheit(51, 15);
    expect(result.applicable).toBe(false);
    expect(result.feelsLikeF).toBeNull();
  });

  test('not applicable at or below 3mph wind', () => {
    const result = windChillFahrenheit(20, 3);
    expect(result.applicable).toBe(false);
    expect(result.feelsLikeF).toBeNull();
  });

  test('applicable at the boundary: 50F and just above 3mph', () => {
    const { applicable, feelsLikeF } = windChillFahrenheit(50, 3.5);
    expect(applicable).toBe(true);
    expect(feelsLikeF).toBeCloseTo(49.2496, 3);
  });

  test('rejects non-numeric temperature', () => {
    expect(() => windChillFahrenheit(NaN, 15)).toThrow();
  });

  test('rejects negative wind speed', () => {
    expect(() => windChillFahrenheit(20, -1)).toThrow();
  });
});

describe('heatIndexFahrenheit', () => {
  test('worked example: 90F, 60% RH', () => {
    const { applicable, feelsLikeF } = heatIndexFahrenheit(90, 60);
    expect(applicable).toBe(true);
    expect(feelsLikeF).toBeCloseTo(99.6777, 3);
  });

  test('not applicable below 80F', () => {
    const result = heatIndexFahrenheit(79.9, 60);
    expect(result.applicable).toBe(false);
    expect(result.feelsLikeF).toBeNull();
  });

  test('applicable at the 80F boundary', () => {
    const { applicable, feelsLikeF } = heatIndexFahrenheit(80, 0);
    expect(applicable).toBe(true);
    expect(feelsLikeF).toBeCloseTo(77.7801, 3);
  });

  test('rejects non-numeric temperature', () => {
    expect(() => heatIndexFahrenheit(NaN, 50)).toThrow();
  });

  test('rejects negative relative humidity', () => {
    expect(() => heatIndexFahrenheit(90, -1)).toThrow();
  });

  test('rejects relative humidity above 100%', () => {
    expect(() => heatIndexFahrenheit(90, 101)).toThrow();
  });
});
describe('bytesToHex', () => {
  test('converts bytes to lowercase hex, zero-padding single-digit bytes', () => {
    expect(bytesToHex(new Uint8Array([0, 1, 15, 16, 255]))).toBe('00010f10ff');
  });

  test('returns an empty string for an empty array', () => {
    expect(bytesToHex(new Uint8Array([]))).toBe('');
  });
});

describe('md5Hex', () => {
  test('matches the known digest for "hello"', () => {
    expect(md5Hex('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('matches the known digest for the empty string', () => {
    expect(md5Hex('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  test('hashes multi-byte UTF-8 text consistently, not raw UTF-16 code units', () => {
    expect(md5Hex('héllo 世界')).toBe('43bc99102ce99a607b562e210927ab2c');
  });

  test('produces a 32-character lowercase hex digest for large input', () => {
    const digest = md5Hex('a'.repeat(1000000));
    expect(digest).toMatch(/^[0-9a-f]{32}$/);
  });

  test('is sensitive to a single-character change', () => {
    expect(md5Hex('hello')).not.toBe(md5Hex('hellp'));
  });
});

describe('md5FromBytes', () => {
  test('matches md5Hex of the equivalent UTF-8 text for "hello"', () => {
    expect(md5FromBytes(Buffer.from('hello', 'utf8'))).toBe(md5Hex('hello'));
    expect(md5FromBytes(Buffer.from('hello', 'utf8'))).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  test('matches the known digest for an empty byte array', () => {
    expect(md5FromBytes(new Uint8Array([]))).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  test('matches md5Hex for multi-byte UTF-8 text encoded as bytes', () => {
    expect(md5FromBytes(Buffer.from('héllo 世界', 'utf8'))).toBe(md5Hex('héllo 世界'));
  });

  test('accepts a plain Uint8Array (not just a Buffer)', () => {
    const bytes = new Uint8Array(Buffer.from('hello', 'utf8'));
    expect(md5FromBytes(bytes)).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});

describe('sha1Hex', () => {
  test('matches the known digest for "hello"', async () => {
    expect(await sha1Hex('hello')).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  test('matches the known digest for the empty string', async () => {
    expect(await sha1Hex('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  test('produces a 40-character lowercase hex digest', async () => {
    expect(await sha1Hex('hello')).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe('sha256Hex', () => {
  test('matches the known digest for "hello"', async () => {
    expect(await sha256Hex('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  test('matches the known digest for the empty string', async () => {
    expect(await sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  test('produces a 64-character lowercase hex digest', async () => {
    expect(await sha256Hex('hello')).toMatch(/^[0-9a-f]{64}$/);
  });

  test('hashes multi-byte UTF-8 text consistently', async () => {
    expect(await sha256Hex('héllo 世界')).toMatch(/^[0-9a-f]{64}$/);
    expect(await sha256Hex('héllo 世界')).not.toBe(await sha256Hex('hello'));
  });
});

describe('sha512Hex', () => {
  test('matches the known digest for "hello"', async () => {
    expect(await sha512Hex('hello')).toBe('9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043');
  });

  test('produces a 128-character lowercase hex digest for the empty string', async () => {
    expect(await sha512Hex('')).toMatch(/^[0-9a-f]{128}$/);
  });
});

describe('sha1FromBytes', () => {
  test('matches sha1Hex of the equivalent UTF-8 text', async () => {
    expect(await sha1FromBytes(Buffer.from('hello', 'utf8'))).toBe(await sha1Hex('hello'));
    expect(await sha1FromBytes(Buffer.from('hello', 'utf8'))).toBe('aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d');
  });

  test('matches the known digest for an empty byte array', async () => {
    expect(await sha1FromBytes(new Uint8Array([]))).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });
});

describe('sha256FromBytes', () => {
  test('matches sha256Hex of the equivalent UTF-8 text', async () => {
    expect(await sha256FromBytes(Buffer.from('hello', 'utf8'))).toBe(await sha256Hex('hello'));
    expect(await sha256FromBytes(Buffer.from('hello', 'utf8'))).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });

  test('matches the known digest for an empty byte array', async () => {
    expect(await sha256FromBytes(new Uint8Array([]))).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
});

describe('sha512FromBytes', () => {
  test('matches sha512Hex of the equivalent UTF-8 text', async () => {
    expect(await sha512FromBytes(Buffer.from('hello', 'utf8'))).toBe(await sha512Hex('hello'));
    expect(await sha512FromBytes(Buffer.from('hello', 'utf8'))).toBe('9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043');
  });

  test('produces a 128-character lowercase hex digest for an empty byte array', async () => {
    expect(await sha512FromBytes(new Uint8Array([]))).toMatch(/^[0-9a-f]{128}$/);
  });
});

describe('symbolicToOctal', () => {
  test('converts the issue\'s worked examples', () => {
    expect(symbolicToOctal('rwxr-xr-x')).toBe('755');
    expect(symbolicToOctal('rwsr-xr-x')).toBe('4755');
    expect(symbolicToOctal('rwxrwxrwt')).toBe('1777');
  });

  test('handles every permission off', () => {
    expect(symbolicToOctal('---------')).toBe('000');
  });

  test('handles setgid alone', () => {
    expect(symbolicToOctal('rwxr-sr-x')).toBe('2755');
  });

  test('handles setuid without owner execute (uppercase S)', () => {
    expect(symbolicToOctal('rwSr-xr-x')).toBe('4655');
  });

  test('handles sticky bit without other execute (uppercase T)', () => {
    expect(symbolicToOctal('rwxrwxrwT')).toBe('1776');
  });

  test('strips a leading file-type character from a full ls -l line', () => {
    expect(symbolicToOctal('drwxr-xr-x')).toBe('755');
    expect(symbolicToOctal('lrwxrwxrwx')).toBe('777');
    expect(symbolicToOctal('-rw-r--r--')).toBe('644');
  });

  test('trims surrounding whitespace', () => {
    expect(symbolicToOctal('  rwxr-xr-x  ')).toBe('755');
  });

  test('throws on empty input', () => {
    expect(() => symbolicToOctal('')).toThrow();
    expect(() => symbolicToOctal('   ')).toThrow();
  });

  test('throws when not 9 characters after stripping a type character', () => {
    expect(() => symbolicToOctal('rwxr-xr')).toThrow();
    expect(() => symbolicToOctal('rwxr-xr-xrwx')).toThrow();
  });

  test('throws on an invalid character', () => {
    expect(() => symbolicToOctal('rwzr-xr-x')).toThrow();
  });

  test('throws when a special-bit letter appears in the wrong triad', () => {
    expect(() => symbolicToOctal('rwtr-xr-x')).toThrow();
    expect(() => symbolicToOctal('rwxrwtr-x')).toThrow();
    expect(() => symbolicToOctal('rwxr-xrws')).toThrow();
  });
});

describe('octalToSymbolic', () => {
  test('converts the issue\'s worked examples', () => {
    expect(octalToSymbolic('755')).toBe('rwxr-xr-x');
    expect(octalToSymbolic('4755')).toBe('rwsr-xr-x');
    expect(octalToSymbolic('1777')).toBe('rwxrwxrwt');
  });

  test('handles every permission off', () => {
    expect(octalToSymbolic('000')).toBe('---------');
  });

  test('handles setgid alone', () => {
    expect(octalToSymbolic('2755')).toBe('rwxr-sr-x');
  });

  test('handles setuid without owner execute (uppercase S)', () => {
    expect(octalToSymbolic('4655')).toBe('rwSr-xr-x');
  });

  test('left-pads a 1- or 2-digit mode with zeros', () => {
    expect(octalToSymbolic('5')).toBe('------r-x');
    expect(octalToSymbolic('75')).toBe('---rwxr-x');
  });

  test('round-trips with symbolicToOctal', () => {
    expect(symbolicToOctal(octalToSymbolic('4755'))).toBe('4755');
    expect(octalToSymbolic(symbolicToOctal('rwxrwxrwt'))).toBe('rwxrwxrwt');
  });

  test('throws on empty input', () => {
    expect(() => octalToSymbolic('')).toThrow();
    expect(() => octalToSymbolic('   ')).toThrow();
  });

  test('throws on digits outside 0-7', () => {
    expect(() => octalToSymbolic('855')).toThrow();
    expect(() => octalToSymbolic('799')).toThrow();
  });

  test('throws on non-digit characters', () => {
    expect(() => octalToSymbolic('75x')).toThrow();
  });

  test('throws on more than 4 digits', () => {
    expect(() => octalToSymbolic('47551')).toThrow();
  });
});
describe('convertCssUnits', () => {
  test('worked example: 24px, root 16px, viewport 1920x1080', () => {
    const result = convertCssUnits(24, 'px', 16, 1920, 1080);
    expect(result.px).toBe(24);
    expect(result.rem).toBeCloseTo(1.5, 4);
    expect(result.vw).toBeCloseTo(1.25, 4);
    expect(result.vh).toBeCloseTo(2.2222, 4);
  });

  test('px to rem with default root font-size of 16px', () => {
    expect(convertCssUnits(24, 'px', 16, 1920, 1080).rem).toBeCloseTo(1.5, 4);
  });

  test('px to rem with a custom root font-size of 10px', () => {
    expect(convertCssUnits(24, 'px', 10, 1920, 1080).rem).toBeCloseTo(2.4, 4);
  });

  test('vw example: 192px is 10vw of a 1920px-wide viewport', () => {
    expect(convertCssUnits(192, 'px', 16, 1920, 1080).vw).toBeCloseTo(10, 4);
  });

  test('vh example: 108px is 10vh of a 1080px-tall viewport', () => {
    expect(convertCssUnits(108, 'px', 16, 1920, 1080).vh).toBeCloseTo(10, 4);
  });

  test('converts rem source unit back to px', () => {
    expect(convertCssUnits(1.5, 'rem', 16, 1920, 1080).px).toBeCloseTo(24, 4);
  });

  test('converts vw source unit back to px', () => {
    expect(convertCssUnits(10, 'vw', 16, 1920, 1080).px).toBeCloseTo(192, 4);
  });

  test('converts vh source unit back to px', () => {
    expect(convertCssUnits(10, 'vh', 16, 1920, 1080).px).toBeCloseTo(108, 4);
  });

  test('allows a negative value (e.g. a negative margin)', () => {
    expect(convertCssUnits(-16, 'px', 16, 1920, 1080).rem).toBeCloseTo(-1, 4);
  });

  test('rejects a non-numeric value', () => {
    expect(() => convertCssUnits(NaN, 'px', 16, 1920, 1080)).toThrow();
  });

  test('rejects a zero root font-size', () => {
    expect(() => convertCssUnits(24, 'px', 0, 1920, 1080)).toThrow();
  });

  test('rejects a negative root font-size', () => {
    expect(() => convertCssUnits(24, 'px', -16, 1920, 1080)).toThrow();
  });

  test('rejects a zero viewport width', () => {
    expect(() => convertCssUnits(24, 'vw', 16, 0, 1080)).toThrow();
  });

  test('rejects a negative viewport width', () => {
    expect(() => convertCssUnits(24, 'vw', 16, -1920, 1080)).toThrow();
  });

  test('rejects a zero viewport height', () => {
    expect(() => convertCssUnits(24, 'vh', 16, 1920, 0)).toThrow();
  });

  test('rejects a negative viewport height', () => {
    expect(() => convertCssUnits(24, 'vh', 16, 1920, -1080)).toThrow();
  });

  test('rejects an unsupported source unit', () => {
    expect(() => convertCssUnits(24, 'pt', 16, 1920, 1080)).toThrow();
  });
});
describe('k8sResourcePlan', () => {
  test('matches the issue worked example', () => {
    const plan = k8sResourcePlan(200, 600, 256, 700, 1.3);
    expect(plan.cpuRequestMillicores).toBe(200);
    expect(plan.cpuLimitMillicores).toBe(780);
    expect(plan.memRequestMiB).toBe(256);
    expect(plan.memLimitMiB).toBe(910);
    expect(plan.qosClass).toBe('Burstable');
    expect(plan.yamlSnippet).toBe(
      [
        'resources:',
        '  requests:',
        '    cpu: "200m"',
        '    memory: "256Mi"',
        '  limits:',
        '    cpu: "780m"',
        '    memory: "910Mi"',
      ].join('\n')
    );
  });

  test('rounds CPU limit to the nearest 10m', () => {
    const plan = k8sResourcePlan(100, 250, 128, 256, 1.35);
    expect(plan.cpuLimitMillicores).toBe(340);
  });

  test('rounds memory limit to the nearest 1 MiB', () => {
    const plan = k8sResourcePlan(100, 250, 128, 300, 1.33);
    expect(plan.memLimitMiB).toBe(399);
  });

  test('reports Guaranteed QoS when rounding collapses the limit back onto the request', () => {
    // A headroom factor just above 1 can round back down to the same
    // request once CPU snaps to the nearest 10m / memory to the nearest 1Mi.
    const plan = k8sResourcePlan(200, 200, 256, 256, 1.001);
    expect(plan.cpuRequestMillicores).toBe(plan.cpuLimitMillicores);
    expect(plan.memRequestMiB).toBe(plan.memLimitMiB);
    expect(plan.qosClass).toBe('Guaranteed');
  });

  test('throws when peak CPU is lower than average CPU', () => {
    expect(() => k8sResourcePlan(600, 200, 256, 700, 1.3)).toThrow(/peak cpu/i);
  });

  test('throws when peak memory is lower than average memory', () => {
    expect(() => k8sResourcePlan(200, 600, 700, 256, 1.3)).toThrow(/peak memory/i);
  });

  test('throws for zero or negative usage values', () => {
    expect(() => k8sResourcePlan(0, 600, 256, 700, 1.3)).toThrow();
    expect(() => k8sResourcePlan(200, 600, -1, 700, 1.3)).toThrow();
  });

  test('throws when headroom factor is 1 or less', () => {
    expect(() => k8sResourcePlan(200, 600, 256, 700, 1)).toThrow(/headroom/i);
    expect(() => k8sResourcePlan(200, 600, 256, 700, 0.9)).toThrow(/headroom/i);
  });

  test('throws when the computed request rounds to 0', () => {
    expect(() => k8sResourcePlan(0.4, 600, 256, 700, 1.3)).toThrow(/request is 0/i);
    expect(() => k8sResourcePlan(200, 600, 0.4, 700, 1.3)).toThrow(/request is 0/i);
  });
});
describe('tokenizeSql', () => {
  test('tokenizes keywords, identifiers, strings, numbers, operators, and punctuation', () => {
    const tokens = tokenizeSql("SELECT id, age FROM t WHERE age >= 18 AND name = 'Ada'");
    expect(tokens).toEqual([
      { type: 'keyword', value: 'SELECT' },
      { type: 'identifier', value: 'id' },
      { type: 'punctuation', value: ',' },
      { type: 'identifier', value: 'age' },
      { type: 'keyword', value: 'FROM' },
      { type: 'identifier', value: 't' },
      { type: 'keyword', value: 'WHERE' },
      { type: 'identifier', value: 'age' },
      { type: 'operator', value: '>=' },
      { type: 'number', value: '18' },
      { type: 'keyword', value: 'AND' },
      { type: 'identifier', value: 'name' },
      { type: 'operator', value: '=' },
      { type: 'string', value: "'Ada'" },
    ]);
  });

  test('merges adjacent single-word keywords into recognized compound keywords', () => {
    const tokens = tokenizeSql('a INNER JOIN b GROUP BY c ORDER BY d');
    expect(tokens.filter((t) => t.type === 'keyword').map((t) => t.value)).toEqual([
      'INNER JOIN', 'GROUP BY', 'ORDER BY',
    ]);
  });

  test('does not merge or re-case a bare word that only partially matches a compound', () => {
    const tokens = tokenizeSql('SELECT "group" FROM t');
    expect(tokens[1]).toEqual({ type: 'identifier', value: '"group"' });
  });

  test('a keyword-looking word inside a single-quoted string stays a string, not a keyword', () => {
    const tokens = tokenizeSql("SELECT * FROM t WHERE note = 'select from where'");
    const stringToken = tokens.find((t) => t.type === 'string');
    expect(stringToken).toEqual({ type: 'string', value: "'select from where'" });
  });

  test('a column literally named "order" (double-quoted) is an identifier, not a clause boundary', () => {
    const tokens = tokenizeSql('SELECT "order" FROM orders');
    expect(tokens[1]).toEqual({ type: 'identifier', value: '"order"' });
  });

  test('backtick-quoted identifiers are tokenized as identifiers', () => {
    const tokens = tokenizeSql('SELECT `select` FROM t');
    expect(tokens[1]).toEqual({ type: 'identifier', value: '`select`' });
  });

  test('handles escaped quotes inside string and quoted-identifier literals', () => {
    const tokens = tokenizeSql("SELECT '' FROM t WHERE name = 'O''Brien'");
    expect(tokens.find((t) => t.type === 'string' && t.value.includes('Brien'))).toEqual({
      type: 'string', value: "'O''Brien'",
    });
  });

  test('tokenizes -- line comments and /* block */ comments without dropping content', () => {
    const tokens = tokenizeSql('SELECT id -- get the id\nFROM t /* main table */');
    expect(tokens.filter((t) => t.type === 'comment').map((t) => t.value)).toEqual([
      '-- get the id',
      '/* main table */',
    ]);
  });

  test('degrades gracefully on an unterminated string instead of throwing', () => {
    expect(() => tokenizeSql("SELECT id FROM t WHERE name = 'abc")).not.toThrow();
    const tokens = tokenizeSql("SELECT id FROM t WHERE name = 'abc");
    expect(tokens[tokens.length - 1]).toEqual({ type: 'string', value: "'abc" });
  });

  test('degrades gracefully on an unterminated block comment instead of throwing', () => {
    expect(() => tokenizeSql('SELECT id FROM t /* unterminated')).not.toThrow();
  });

  test('empty input tokenizes to an empty array', () => {
    expect(tokenizeSql('')).toEqual([]);
  });
});

describe('formatSql', () => {
  test('the worked example from the issue', () => {
    const input = "select id, name, email from users where status = 'active' and age > 18 order by created_at desc limit 10";
    expect(formatSql(input)).toBe(
      "SELECT\n" +
      "  id,\n" +
      "  name,\n" +
      "  email\n" +
      "FROM users\n" +
      "WHERE\n" +
      "  status = 'active'\n" +
      "  AND age > 18\n" +
      "ORDER BY created_at DESC\n" +
      "LIMIT 10"
    );
  });

  test('uppercases keywords by default and leaves identifiers/strings untouched', () => {
    const output = formatSql("select Name from Users where Name = 'Select'");
    expect(output).toBe(
      "SELECT\n  Name\nFROM Users\nWHERE\n  Name = 'Select'"
    );
  });

  test('lowercase keyword-case option', () => {
    const output = formatSql('SELECT ID FROM USERS', { uppercase: false });
    expect(output).toBe('select\n  ID\nfrom USERS');
  });

  test('supports a 4-space indent width', () => {
    const output = formatSql('select id, name from users');
    const output4 = formatSql('select id, name from users', { indentWidth: 4 });
    expect(output).toBe('SELECT\n  id,\n  name\nFROM users');
    expect(output4).toBe('SELECT\n    id,\n    name\nFROM users');
  });

  test('each top-level AND/OR in WHERE starts its own indented line', () => {
    const output = formatSql("select id from t where a = 1 and b = 2 or c = 3");
    expect(output).toBe(
      "SELECT\n  id\nFROM t\nWHERE\n  a = 1\n  AND b = 2\n  OR c = 3"
    );
  });

  test('formats JOIN variants as their own top-level clause line', () => {
    const output = formatSql(
      'select u.id, o.total from users u inner join orders o on u.id = o.user_id where o.total > 100'
    );
    expect(output).toBe(
      "SELECT\n" +
      "  u.id,\n" +
      "  o.total\n" +
      "FROM users u\n" +
      "INNER JOIN orders o ON u.id = o.user_id\n" +
      "WHERE\n" +
      "  o.total > 100"
    );
  });

  test('a quoted identifier named "order" is never re-cased or treated as a clause boundary', () => {
    const output = formatSql('select "order", name from orders');
    expect(output).toBe('SELECT\n  "order",\n  name\nFROM orders');
  });

  test('a string literal containing a keyword is left untouched', () => {
    const output = formatSql("select id from t where note = 'from where and'");
    expect(output).toBe("SELECT\n  id\nFROM t\nWHERE\n  note = 'from where and'");
  });

  test('preserves a parenthesized subquery inline without recursively re-indenting it', () => {
    const output = formatSql(
      'select id from users where id in (select user_id from orders where total > 100)'
    );
    expect(output).toBe(
      "SELECT\n  id\nFROM users\nWHERE\n  id IN (SELECT user_id FROM orders WHERE total > 100)"
    );
  });

  test('formats multiple ;-separated statements independently, each restarting at base indent', () => {
    const output = formatSql('select 1; select 2;');
    expect(output).toBe('SELECT\n  1;\n\nSELECT\n  2;');
  });

  test('does not invent a trailing semicolon for a final unterminated statement', () => {
    const output = formatSql('select 1; select 2');
    expect(output).toBe('SELECT\n  1;\n\nSELECT\n  2');
  });

  test('keeps -- and /* */ comment content verbatim on their own line', () => {
    const output = formatSql('select id -- get id\nfrom t');
    expect(output).toContain('-- get id');
    expect(output).not.toContain('get id\nfrom');
  });

  test('degrades gracefully on unbalanced parentheses instead of throwing', () => {
    expect(() => formatSql('select id from users where (id = 1')).not.toThrow();
    const output = formatSql('select id from users where (id = 1');
    expect(output).toContain('SELECT');
    expect(output).toContain('(id = 1');
  });

  test('degrades gracefully on an unterminated string instead of throwing', () => {
    expect(() => formatSql("select id from t where name = 'abc")).not.toThrow();
  });

  test('empty input returns an empty string', () => {
    expect(formatSql('')).toBe('');
    expect(formatSql('   ')).toBe('');
  });
});

describe('minifySql', () => {
  test('collapses formatted SQL back to a single line with keyword casing applied', () => {
    const input = "SELECT\n  id,\n  name\nFROM users\nWHERE\n  status = 'active'\n  AND age > 18";
    expect(minifySql(input)).toBe("SELECT id, name FROM users WHERE status = 'active' AND age > 18");
  });

  test('lowercase keyword-case option', () => {
    expect(minifySql('SELECT ID FROM USERS', { uppercase: false })).toBe('select ID from USERS');
  });

  test('drops comments rather than letting a -- comment swallow the rest of the line', () => {
    const output = minifySql('select id -- get id\nfrom t');
    expect(output).toBe('SELECT id FROM t');
  });

  test('minifies multiple ;-separated statements onto one line, each still terminated', () => {
    expect(minifySql('select 1; select 2;')).toBe('SELECT 1; SELECT 2;');
  });

  test('leaves an identifier or string containing a keyword-like word untouched', () => {
    const output = minifySql("select \"order\" from t where note = 'from where'");
    expect(output).toBe('SELECT "order" FROM t WHERE note = \'from where\'');
  });

  test('empty input returns an empty string', () => {
    expect(minifySql('')).toBe('');
    expect(minifySql('   ')).toBe('');
  });
});
