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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    epleyOneRepMax,
    percentageTable,
    wilksCoefficient,
    wilksScore,
    calculatePlates,
    AVAILABLE_PLATES,
  };
}
