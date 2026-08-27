// Metadata describing every calculator on the site: which panel id it maps to,
// which category it belongs to, and text the search box matches against.
// Adding a new calculator = add a panel in index.html + wiring in calculators.js
// + one entry here so it shows up in the index/search.
const CALCULATOR_REGISTRY = [
  {
    id: 'orm',
    name: 'One-Rep Max',
    category: 'Fitness & Strength',
    description: 'Estimate your one-rep max from a lift weight and rep count.',
    keywords: ['1rm', 'epley', 'strength', 'max'],
  },
  {
    id: 'percent',
    name: 'Training %',
    category: 'Fitness & Strength',
    description: 'Suggested weights at common training percentages of your one-rep max.',
    keywords: ['training max', 'percentage', 'table'],
  },
  {
    id: 'wilks',
    name: 'Strength Score (Wilks)',
    category: 'Fitness & Strength',
    description: 'Compare relative strength across different bodyweights.',
    keywords: ['wilks', 'score', 'powerlifting'],
  },
  {
    id: 'plates',
    name: 'Plate Loading',
    category: 'Fitness & Strength',
    description: 'See exactly which plates to load per side for a target weight.',
    keywords: ['plates', 'barbell', 'loading'],
  },
  {
    id: 'wendler',
    name: '5/3/1 Planner',
    category: 'Fitness & Strength',
    description: "Generate a full training cycle plan using Jim Wendler's 5/3/1.",
    keywords: ['531', 'wendler', 'training plan', 'cycle'],
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest',
    category: 'Finance',
    description: 'See how a lump sum grows over time when interest compounds on itself.',
    keywords: ['compound interest', 'future value', 'savings', 'investing'],
  },
  {
    id: 'recipe-scaling',
    name: 'Recipe Scaling',
    category: 'Cooking',
    description: 'Scale every ingredient in a recipe up or down to a new serving size.',
    keywords: ['recipe', 'scale', 'servings', 'cooking', 'baking'],
  },
  {
    id: 'investment-growth',
    name: 'Investment / DCA Growth',
    category: 'Finance',
    description: 'Project how a lump sum plus regular contributions grows over time.',
    keywords: ['investment', 'dca', 'dollar cost averaging', 'etf', 'future value', 'compounding'],
  },
  {
    id: 'bakers-percentage',
    name: "Baker's Percentage",
    category: 'Cooking',
    description: "Convert a recipe between ingredient weights and baker's percentages.",
    keywords: ['bakers percentage', 'baking', 'hydration', 'dough', 'bread formula'],
  },
  {
    id: 'calories-per-serving',
    name: 'Calories Per Serving',
    category: 'Cooking',
    description: 'Sum the calories of every ingredient in a recipe and divide by the number of servings.',
    keywords: ['calories', 'kcal', 'servings', 'nutrition', 'cooking', 'recipe'],
  },
];

if (typeof module !== 'undefined') {
  module.exports = { CALCULATOR_REGISTRY };
}
