// --- Calculator index, search, and hash-based routing ---
function groupCalculatorsByCategory(calculators) {
  const groups = new Map();
  calculators.forEach(calc => {
    if (!groups.has(calc.category)) groups.set(calc.category, []);
    groups.get(calc.category).push(calc);
  });
  return groups;
}

function renderCalculatorIndex() {
  const groups = groupCalculatorsByCategory(CALCULATOR_REGISTRY);
  const html = [...groups.entries()].map(([category, calcs]) => `
    <div class="category-group" data-category="${category}">
      <h2 class="category-title">${category}</h2>
      <div class="calc-grid">
        ${calcs.map(c => `
          <button class="calc-card" data-calc-id="${c.id}" data-search-text="${(c.name + ' ' + c.description + ' ' + c.category + ' ' + c.keywords.join(' ')).toLowerCase()}">
            <h3>${c.name}</h3>
            <p>${c.description}</p>
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.getElementById('calc-categories').innerHTML = html;
}

function filterCalculatorIndex(query) {
  const term = query.trim().toLowerCase();
  let anyVisible = false;

  document.querySelectorAll('.category-group').forEach(group => {
    let groupHasVisibleCard = false;
    group.querySelectorAll('.calc-card').forEach(card => {
      const matches = !term || card.dataset.searchText.includes(term);
      card.hidden = !matches;
      if (matches) groupHasVisibleCard = true;
    });
    group.hidden = !groupHasVisibleCard;
    if (groupHasVisibleCard) anyVisible = true;
  });

  document.getElementById('calc-no-results').hidden = anyVisible;
}

function showView(calcId) {
  const isValidCalc = calcId && CALCULATOR_REGISTRY.some(c => c.id === calcId);

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(isValidCalc ? calcId : 'calculator-index').classList.add('active');
  document.getElementById('back-to-index').hidden = !isValidCalc;

  if (!isValidCalc) window.scrollTo(0, 0);
}

function currentCalcIdFromHash() {
  const match = /^#calc\/(.+)$/.exec(window.location.hash);
  return match ? decodeURIComponent(match[1]) : null;
}

renderCalculatorIndex();
showView(currentCalcIdFromHash());
window.addEventListener('hashchange', () => showView(currentCalcIdFromHash()));

document.getElementById('calc-categories').addEventListener('click', (e) => {
  const card = e.target.closest('.calc-card');
  if (!card) return;
  window.location.hash = `#calc/${encodeURIComponent(card.dataset.calcId)}`;
});

document.getElementById('calc-search').addEventListener('input', (e) => {
  filterCalculatorIndex(e.target.value);
});

document.getElementById('back-to-index').addEventListener('click', () => {
  if (window.location.hash) {
    window.location.hash = '';
  } else {
    showView(null);
  }
});

function showError(elId, message) {
  document.getElementById(elId).innerHTML = `<span class="error">${message}</span>`;
}

// --- One-Rep Max (Epley formula) ---
document.getElementById('orm-calc').addEventListener('click', () => {
  const weight = parseFloat(document.getElementById('orm-weight').value);
  const reps = parseInt(document.getElementById('orm-reps').value, 10);
  const unit = document.getElementById('orm-unit').value;

  if (!weight || weight <= 0 || !reps || reps < 1) {
    showError('orm-result', 'Enter a valid weight and rep count.');
    return;
  }

  const oneRepMax = epleyOneRepMax(weight, reps);

  document.getElementById('orm-result').innerHTML = `
    <div class="headline">${oneRepMax.toFixed(1)} ${unit}</div>
    <div>Estimated one-rep max (Epley formula)</div>
  `;
});

// --- Percentage-based training table ---
document.getElementById('pct-calc').addEventListener('click', () => {
  const orm = parseFloat(document.getElementById('pct-orm').value);
  const unit = document.getElementById('pct-unit').value;

  if (!orm || orm <= 0) {
    showError('pct-result', 'Enter a valid one-rep max.');
    return;
  }

  const rows = percentageTable(orm)
    .map(({ percent, weight }) => `<tr><td>${percent}%</td><td>${weight.toFixed(1)} ${unit}</td></tr>`)
    .join('');

  document.getElementById('pct-result').innerHTML = `
    <table>
      <thead><tr><th>Percent</th><th>Weight</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

// --- Wilks strength score ---
document.getElementById('wilks-calc').addEventListener('click', () => {
  const bw = parseFloat(document.getElementById('wilks-bw').value);
  const lift = parseFloat(document.getElementById('wilks-lift').value);
  const sex = document.getElementById('wilks-sex').value;

  if (!bw || bw <= 0 || !lift || lift <= 0) {
    showError('wilks-result', 'Enter a valid bodyweight and total lifted.');
    return;
  }

  const score = wilksScore(bw, lift, sex);

  document.getElementById('wilks-result').innerHTML = `
    <div class="headline">${score.toFixed(1)}</div>
    <div>Wilks score (relative strength)</div>
  `;
});

// --- Plate loading calculator ---
document.getElementById('plate-calc').addEventListener('click', () => {
  const target = parseFloat(document.getElementById('plate-target').value);
  const bar = parseFloat(document.getElementById('plate-bar').value);

  if (!target || target <= 0 || bar === undefined || isNaN(bar) || bar < 0) {
    showError('plate-result', 'Enter a valid target weight and bar weight.');
    return;
  }

  if (target < bar) {
    showError('plate-result', 'Target weight is less than the bar weight.');
    return;
  }

  const { used, leftover } = calculatePlates(target, bar);

  const rows = used.map(u => `
    <div class="plate-row"><span>${u.plate} kg</span><span>x${u.count} per side</span></div>
  `).join('');

  const leftoverHtml = leftover > 1e-6
    ? `<div class="hint">Remaining ${leftover.toFixed(2)} kg per side can't be made with standard plates.</div>`
    : '';

  document.getElementById('plate-result').innerHTML = `
    <div class="headline">${target} kg total</div>
    ${rows || '<div>No plates needed.</div>'}
    ${leftoverHtml}
  `;
});

// --- 5/3/1 Training Planner ---
const WENDLER_DAYS = [
  { lift: 'squat', label: 'Squat' },
  { lift: 'bench', label: 'Bench Press' },
  { lift: 'deadlift', label: 'Deadlift' },
  { lift: 'press', label: 'Overhead Press' },
];

const WENDLER_WEEK_SCHEMES = ['5 / 5 / 5+', '3 / 3 / 3+', '5 / 3 / 1+', null];
const WENDLER_CYCLE_COUNT = 7;

function wendlerRoundingIncrement(unit) {
  return unit === 'kg' ? 2.5 : 5;
}

function readWendlerInputs() {
  const unit = document.getElementById('wendler-unit').value;
  const tmPercent = parseFloat(document.getElementById('wendler-tm-percent').value) || 90;

  const lifts = {};
  WENDLER_DAYS.forEach(({ lift }) => {
    lifts[lift] = {
      weight: parseFloat(document.getElementById(`wendler-${lift}-weight`).value),
      reps: parseInt(document.getElementById(`wendler-${lift}-reps`).value, 10),
    };
  });

  return { unit, tmPercent, lifts };
}

function wendlerInputsAreValid(lifts) {
  return WENDLER_DAYS.every(({ lift }) => {
    const { weight, reps } = lifts[lift];
    return weight > 0 && reps >= 1;
  });
}

function buildWendlerDayPlans({ unit, tmPercent, cycle, lifts }) {
  const roundingIncrement = wendlerRoundingIncrement(unit);

  return WENDLER_DAYS.map(({ lift, label }) => {
    const { weight, reps } = lifts[lift];
    const oneRepMax = epleyOneRepMax(weight, reps);
    const baseTrainingMax = trainingMax(oneRepMax, tmPercent);
    const currentTrainingMax = projectedTrainingMax(baseTrainingMax, lift, unit, cycle);
    const weeks = [1, 2, 3, 4].map(week => wendler531Sets(currentTrainingMax, week, roundingIncrement));
    const warmup = weeks[0].filter(s => s.warmup);
    const workByWeek = weeks.map(sets => sets.filter(s => !s.warmup));
    return { lift, label, oneRepMax, currentTrainingMax, warmup, workByWeek };
  });
}

function buildWendlerAllCycles({ unit, tmPercent, lifts }) {
  const cycles = [];
  for (let cycle = 1; cycle <= WENDLER_CYCLE_COUNT; cycle++) {
    cycles.push({ cycle, dayPlans: buildWendlerDayPlans({ unit, tmPercent, cycle, lifts }) });
  }
  return cycles;
}

function formatWendlerWeight(weight, unit) {
  return `${weight % 1 === 0 ? weight : weight.toFixed(1)}<span class="unit">${unit}</span>`;
}

function renderWendlerCard(d, unit) {
  const warmupText = d.warmup
    .map(s => `${s.weight % 1 === 0 ? s.weight : s.weight.toFixed(1)} ${unit} &times; ${s.reps}`)
    .join(' &nbsp;&middot;&nbsp; ');

  const weekHeads = WENDLER_WEEK_SCHEMES.map((scheme, i) => `
    <div class="wendler-week-head">
      <span class="wk">Week ${i + 1}</span>
      ${scheme ? `<span class="scheme">${scheme}</span>` : '<span class="wendler-badge wendler-badge-deload">Deload</span>'}
    </div>
  `).join('');

  const setRows = [0, 1, 2].map(setIndex => {
    const cells = d.workByWeek.map((sets, weekIndex) => {
      const s = sets[setIndex];
      const isDeload = weekIndex === 3;
      const cellClass = s.amrap ? 'amrap' : (isDeload ? 'deload' : '');
      const repsLabel = s.amrap ? `${s.reps}+ reps` : `${s.reps} reps`;
      const badge = s.amrap ? '<span class="wendler-badge wendler-badge-amrap">AMRAP</span>' : '';
      return `
        <div class="wendler-set-cell ${cellClass}">
          <span class="weight">${formatWendlerWeight(s.weight, unit)}</span>
          <span class="reps">${repsLabel}</span>
          ${badge}
        </div>
      `;
    }).join('');
    return `<div class="wendler-set-label">Set ${setIndex + 1}</div>${cells}`;
  }).join('');

  return `
    <div class="wendler-card">
      <div class="wendler-card-head">
        <h3>${d.label}</h3>
        <div class="wendler-card-stats">
          <div><span class="stat-label">Training Max</span><span class="stat-tm">${formatWendlerWeight(d.currentTrainingMax, unit)}</span></div>
          <div><span class="stat-label">Est. 1RM</span><span class="stat-1rm">${formatWendlerWeight(d.oneRepMax, unit)}</span></div>
        </div>
      </div>
      <div class="wendler-warmup-strip">
        <span class="wendler-badge wendler-badge-warmup">Warm-up</span>
        <span>${warmupText} &nbsp;<span class="dim">(weeks 1&ndash;3)</span></span>
      </div>
      <div class="wendler-set-grid">
        <div></div>
        ${weekHeads}
        ${setRows}
      </div>
    </div>
  `;
}

function renderWendlerPlan(dayPlans, unit) {
  return dayPlans.map(d => renderWendlerCard(d, unit)).join('');
}

let wendlerAllCycles = [];
let wendlerActiveCycleIndex = 0;
let wendlerUnit = 'kg';

function renderWendlerCyclesUI() {
  const tabs = wendlerAllCycles.map((c, i) => `
    <button class="wendler-cycle-tab ${i === wendlerActiveCycleIndex ? 'active' : ''}" data-cycle-index="${i}">Cycle ${c.cycle}</button>
  `).join('');

  const active = wendlerAllCycles[wendlerActiveCycleIndex];
  const panel = active ? renderWendlerPlan(active.dayPlans, wendlerUnit) : '';

  return `
    <div class="wendler-cycle-tabs">${tabs}</div>
    <div class="wendler-cycle-panel">${panel}</div>
  `;
}

function csvEscape(value) {
  const str = String(value);
  return /[",\r\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportWendlerCycleCsv(dayPlans, cycle) {
  const rows = [['Week', 'Day', 'Set Type', '% TM', 'Weight', 'Reps']];

  dayPlans.forEach(d => {
    for (let week = 1; week <= 4; week++) {
      if (week <= 3) {
        d.warmup.forEach(s => {
          rows.push([`Week ${week}`, d.label, 'Warmup', `${s.percent}%`, s.weight.toFixed(1), s.reps]);
        });
      }
      d.workByWeek[week - 1].forEach(s => {
        const setType = s.amrap ? 'Work (AMRAP)' : 'Work';
        const repsLabel = s.amrap ? `${s.reps}+` : s.reps;
        rows.push([`Week ${week}`, d.label, setType, `${s.percent}%`, s.weight.toFixed(1), repsLabel]);
      });
    }
  });

  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  downloadFile(`531-cycle-${cycle}.csv`, csv, 'text/csv;charset=utf-8');
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function xlsCell(data, styleId, mergeAcross) {
  const type = typeof data === 'number' ? 'Number' : 'String';
  const style = styleId ? ` ss:StyleID="${styleId}"` : '';
  const merge = mergeAcross ? ` ss:MergeAcross="${mergeAcross}"` : '';
  return `<Cell${style}${merge}><Data ss:Type="${type}">${xmlEscape(data)}</Data></Cell>`;
}

function xlsRow(cells, height) {
  const h = height ? ` ss:Height="${height}"` : '';
  return `<Row${h}>${cells.join('')}</Row>`;
}

function formatPlainWeight(weight, unit) {
  return `${weight % 1 === 0 ? weight : weight.toFixed(1)} ${unit}`;
}

function buildWendlerLiftRows(d, unit) {
  const warmupText = d.warmup
    .map(s => `${formatPlainWeight(s.weight, unit)} × ${s.reps}`)
    .join('  ·  ');

  const rows = [];

  rows.push(xlsRow([xlsCell(d.label, 'sTitle', 4)]));

  rows.push(xlsRow([
    xlsCell('Training Max', 'sStatLabel'),
    xlsCell(formatPlainWeight(d.currentTrainingMax, unit), 'sStatValue'),
    xlsCell('Est. 1RM', 'sStatLabel'),
    xlsCell(formatPlainWeight(d.oneRepMax, unit), 'sStatValue'),
    xlsCell(''),
  ]));

  rows.push(xlsRow([
    xlsCell('Warm-up (wks 1–3)', 'sWarmupLabel'),
    xlsCell(warmupText, 'sWarmupText', 3),
  ]));

  rows.push(xlsRow([
    xlsCell(''),
    ...WENDLER_WEEK_SCHEMES.map((scheme, i) => xlsCell(
      scheme ? `Week ${i + 1} (${scheme})` : `Week ${i + 1} (Deload)`,
      scheme ? 'sWeekHead' : 'sWeekHeadDeload'
    )),
  ]));

  for (let setIndex = 0; setIndex < 3; setIndex++) {
    const cells = [xlsCell(`Set ${setIndex + 1}`, 'sSetLabel')];
    d.workByWeek.forEach((sets, weekIndex) => {
      const s = sets[setIndex];
      const isDeload = weekIndex === 3;
      const repsLabel = s.amrap ? `${s.reps}+` : s.reps;
      const style = s.amrap ? 'sCellAmrap' : (isDeload ? 'sCellDeload' : 'sCell');
      cells.push(xlsCell(`${formatPlainWeight(s.weight, unit)} × ${repsLabel}`, style));
    });
    rows.push(xlsRow(cells));
  }

  rows.push(xlsRow([], 8));

  return rows;
}

const XLS_STYLES = `
<Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Center"/><Borders/><Font ss:FontName="Calibri" ss:Size="11"/><Interior/><NumberFormat/><Protection/></Style>
<Style ss:ID="sTitle"><Font ss:Bold="1" ss:Size="14" ss:Color="#FFFFFF"/><Interior ss:Color="#4F8CFF" ss:Pattern="Solid"/><Alignment ss:Vertical="Center"/></Style>
<Style ss:ID="sStatLabel"><Font ss:Bold="1" ss:Color="#4B5563"/></Style>
<Style ss:ID="sStatValue"><Font ss:Bold="1"/></Style>
<Style ss:ID="sWarmupLabel"><Font ss:Bold="1" ss:Color="#6B7280"/></Style>
<Style ss:ID="sWarmupText"><Font ss:Color="#6B7280" ss:Italic="1"/></Style>
<Style ss:ID="sWeekHead"><Font ss:Bold="1"/><Interior ss:Color="#E8F0FE" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/></Borders></Style>
<Style ss:ID="sWeekHeadDeload"><Font ss:Bold="1" ss:Color="#6B7280"/><Interior ss:Color="#ECECEC" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/></Borders></Style>
<Style ss:ID="sSetLabel"><Font ss:Bold="1" ss:Color="#6B7280"/></Style>
<Style ss:ID="sCell"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/></Borders></Style>
<Style ss:ID="sCellAmrap"><Font ss:Bold="1" ss:Color="#1D5FD6"/><Interior ss:Color="#DCE9FF" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C7D2E0"/></Borders></Style>
<Style ss:ID="sCellDeload"><Font ss:Color="#8A8F98"/><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E5EA"/></Borders></Style>
`.trim();

function buildWendlerWorksheetXml(cycle, dayPlans, unit) {
  const rows = dayPlans.flatMap(d => buildWendlerLiftRows(d, unit));

  return `<Worksheet ss:Name="${xmlEscape(`Cycle ${cycle}`)}">
  <Table>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   <Column ss:Width="110"/>
   ${rows.join('\n   ')}
  </Table>
  <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
   <PageSetup>
    <Layout x:Orientation="Landscape"/>
    <PageMargins x:Bottom="0.5" x:Left="0.5" x:Right="0.5" x:Top="0.5"/>
   </PageSetup>
   <Print>
    <FitWidth>1</FitWidth>
    <FitHeight>0</FitHeight>
   </Print>
  </WorksheetOptions>
 </Worksheet>`;
}

function exportWendlerAllCyclesExcel(allCycles, unit) {
  const worksheets = allCycles.map(({ cycle, dayPlans }) => buildWendlerWorksheetXml(cycle, dayPlans, unit)).join('\n ');

  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>${XLS_STYLES}</Styles>
 ${worksheets}
</Workbook>`;

  downloadFile('531-plan.xls', xml, 'application/vnd.ms-excel');
}

document.getElementById('wendler-calc').addEventListener('click', () => {
  const input = readWendlerInputs();
  const exportBtn = document.getElementById('wendler-export');
  const exportExcelBtn = document.getElementById('wendler-export-excel');

  if (!wendlerInputsAreValid(input.lifts)) {
    showError('wendler-result', 'Enter a valid weight and rep count for all four lifts.');
    exportBtn.style.display = 'none';
    exportExcelBtn.style.display = 'none';
    return;
  }

  wendlerAllCycles = buildWendlerAllCycles(input);
  wendlerActiveCycleIndex = 0;
  wendlerUnit = input.unit;
  document.getElementById('wendler-result').innerHTML = renderWendlerCyclesUI();

  exportBtn.style.display = 'block';
  exportBtn.onclick = () => {
    const active = wendlerAllCycles[wendlerActiveCycleIndex];
    exportWendlerCycleCsv(active.dayPlans, active.cycle);
  };

  exportExcelBtn.style.display = 'block';
  exportExcelBtn.onclick = () => exportWendlerAllCyclesExcel(wendlerAllCycles, wendlerUnit);
});

document.getElementById('wendler-result').addEventListener('click', (e) => {
  const tab = e.target.closest('.wendler-cycle-tab');
  if (!tab) return;
  wendlerActiveCycleIndex = parseInt(tab.dataset.cycleIndex, 10);
  document.getElementById('wendler-result').innerHTML = renderWendlerCyclesUI();
});

// --- Compound interest calculator ---
document.getElementById('compound-calc').addEventListener('click', () => {
  const principal = parseFloat(document.getElementById('compound-principal').value);
  const rate = parseFloat(document.getElementById('compound-rate').value);
  const frequency = parseInt(document.getElementById('compound-frequency').value, 10);
  const years = parseFloat(document.getElementById('compound-years').value);

  const isValidFrequency = COMPOUNDING_FREQUENCIES.some(f => f.value === frequency);

  if (!principal || principal <= 0 || isNaN(rate) || rate < 0 || !isValidFrequency || !years || years <= 0) {
    showError('compound-result', 'Enter a valid principal, rate, and time period.');
    return;
  }

  const { futureValue, interestEarned } = compoundInterest(principal, rate, frequency, years);

  document.getElementById('compound-result').innerHTML = `
    <div class="headline">${futureValue.toFixed(2)}</div>
    <div>Future value after ${years} year${years === 1 ? '' : 's'}</div>
    <div class="hint">Interest earned: ${interestEarned.toFixed(2)}</div>
  `;
});

// --- Recipe scaling calculator ---
const RECIPE_INITIAL_ROWS = 3;

function addRecipeIngredientRow() {
  const row = document.createElement('div');
  row.className = 'recipe-ingredient-row';
  row.innerHTML = `
    <input type="text" class="recipe-ing-name" aria-label="Ingredient name" placeholder="e.g. Flour">
    <input type="number" class="recipe-ing-qty" aria-label="Quantity" min="0" step="0.1" placeholder="e.g. 300">
    <input type="text" class="recipe-ing-unit" aria-label="Unit" placeholder="g">
    <button type="button" class="recipe-remove-btn" aria-label="Remove ingredient">&times;</button>
  `;
  document.getElementById('recipe-ingredient-list').appendChild(row);
}

for (let i = 0; i < RECIPE_INITIAL_ROWS; i++) addRecipeIngredientRow();

document.getElementById('recipe-add-ingredient').addEventListener('click', () => addRecipeIngredientRow());

document.getElementById('recipe-ingredient-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.recipe-remove-btn');
  if (!btn) return;
  btn.closest('.recipe-ingredient-row').remove();
});

function formatRecipeQuantity(qty) {
  return qty % 1 === 0 ? String(qty) : qty.toFixed(2);
}

document.getElementById('recipe-calc').addEventListener('click', () => {
  const originalServings = parseFloat(document.getElementById('recipe-original-servings').value);
  const targetServings = parseFloat(document.getElementById('recipe-target-servings').value);

  if (!originalServings || originalServings <= 0 || !targetServings || targetServings <= 0) {
    showError('recipe-result', 'Enter a valid original and target number of servings.');
    return;
  }

  const rows = document.querySelectorAll('#recipe-ingredient-list .recipe-ingredient-row');
  const ingredients = [];
  let hasInvalidRow = false;

  rows.forEach(row => {
    const name = row.querySelector('.recipe-ing-name').value.trim();
    const qtyRaw = row.querySelector('.recipe-ing-qty').value;
    const unit = row.querySelector('.recipe-ing-unit').value.trim();
    const quantity = parseFloat(qtyRaw);

    if (!name && qtyRaw === '') return; // blank row, skip silently

    if (!name || qtyRaw === '' || isNaN(quantity) || quantity < 0) {
      hasInvalidRow = true;
      return;
    }

    ingredients.push({ name, quantity, unit });
  });

  if (hasInvalidRow) {
    showError('recipe-result', 'Enter a valid name and non-negative quantity for every ingredient row, or leave the row blank.');
    return;
  }

  if (ingredients.length === 0) {
    showError('recipe-result', 'Add at least one ingredient.');
    return;
  }

  const { scaleFactor, ingredients: scaled } = scaleRecipe(originalServings, targetServings, ingredients);

  const rowsHtml = scaled.map(ing => `
    <tr>
      <td>${ing.name}</td>
      <td>${formatRecipeQuantity(ing.quantity)} ${ing.unit}</td>
      <td>${formatRecipeQuantity(ing.scaledQuantity)} ${ing.unit}</td>
    </tr>
  `).join('');

  document.getElementById('recipe-result').innerHTML = `
    <div class="headline">${formatRecipeQuantity(scaleFactor)}x</div>
    <div>Scale factor (${targetServings} &divide; ${originalServings} servings)</div>
    <table>
      <thead><tr><th>Ingredient</th><th>Original</th><th>Scaled</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
});

// --- Investment / DCA growth calculator ---
function formatMoney(value) {
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

document.getElementById('invest-calc').addEventListener('click', () => {
  const lumpSum = parseFloat(document.getElementById('invest-lump-sum').value) || 0;
  const contribution = parseFloat(document.getElementById('invest-contribution').value) || 0;
  const frequency = parseInt(document.getElementById('invest-frequency').value, 10);
  const rate = parseFloat(document.getElementById('invest-rate').value);
  const years = parseInt(document.getElementById('invest-years').value, 10);

  const isValidFrequency = CONTRIBUTION_FREQUENCIES.some(f => f.value === frequency);

  if (lumpSum < 0 || contribution < 0 || (lumpSum === 0 && contribution === 0)) {
    showError('invest-result', 'Enter an initial lump sum or a recurring contribution greater than zero.');
    return;
  }

  if (!isValidFrequency || isNaN(rate) || !years || years < 1 || !Number.isInteger(years)) {
    showError('invest-result', 'Enter a valid contribution frequency, expected return, and a whole number of years.');
    return;
  }

  const { futureValue, totalContributed, totalGrowth, yearly } = investmentGrowth(lumpSum, contribution, frequency, rate, years);

  const rows = yearly.map(y => `
    <tr>
      <td>${y.year}</td>
      <td>${formatMoney(y.endingBalance)}</td>
      <td>${formatMoney(y.cumulativeContributions)}</td>
      <td>${formatMoney(y.cumulativeGrowth)}</td>
    </tr>
  `).join('');

  document.getElementById('invest-result').innerHTML = `
    <div class="headline">${formatMoney(futureValue)}</div>
    <div>Projected balance after ${years} year${years === 1 ? '' : 's'}</div>
    <div class="hint">Contributed: ${formatMoney(totalContributed)} &middot; Growth: ${formatMoney(totalGrowth)}</div>
    <table>
      <thead><tr><th>Year</th><th>Balance</th><th>Contributed</th><th>Growth</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

// --- Baker's percentage calculator ---
const BAKER_INITIAL_ROWS = 4;

function addBakerIngredientRow() {
  const row = document.createElement('div');
  row.className = 'baker-ingredient-row';
  row.innerHTML = `
    <input type="text" class="baker-ing-name" aria-label="Ingredient name" placeholder="e.g. Flour">
    <input type="checkbox" class="baker-ing-flour" aria-label="Is flour">
    <input type="number" class="baker-ing-value" aria-label="Weight or percent" min="0" step="0.1" placeholder="e.g. 500">
    <button type="button" class="baker-remove-btn" aria-label="Remove ingredient">&times;</button>
  `;
  document.getElementById('baker-ingredient-list').appendChild(row);
}

for (let i = 0; i < BAKER_INITIAL_ROWS; i++) addBakerIngredientRow();

document.getElementById('baker-add-ingredient').addEventListener('click', () => addBakerIngredientRow());

document.getElementById('baker-ingredient-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.baker-remove-btn');
  if (!btn) return;
  btn.closest('.baker-ingredient-row').remove();
});

document.getElementById('baker-mode').addEventListener('change', (e) => {
  const isPercentToWeights = e.target.value === 'percent-to-weights';
  document.getElementById('baker-basis-fields').hidden = !isPercentToWeights;
  document.getElementById('baker-value-col-label').textContent = isPercentToWeights ? 'Percent (%)' : 'Weight (g)';
});

function formatBakerNumber(value) {
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

function readBakerIngredientRows() {
  const rows = document.querySelectorAll('#baker-ingredient-list .baker-ingredient-row');
  const ingredients = [];
  let hasInvalidRow = false;

  rows.forEach(row => {
    const name = row.querySelector('.baker-ing-name').value.trim();
    const isFlour = row.querySelector('.baker-ing-flour').checked;
    const valueRaw = row.querySelector('.baker-ing-value').value;
    const value = parseFloat(valueRaw);

    if (!name && valueRaw === '') return; // blank row, skip silently

    if (!name || valueRaw === '' || isNaN(value) || value < 0) {
      hasInvalidRow = true;
      return;
    }

    ingredients.push({ name, isFlour, value });
  });

  return { ingredients, hasInvalidRow };
}

document.getElementById('baker-calc').addEventListener('click', () => {
  const mode = document.getElementById('baker-mode').value;
  const { ingredients, hasInvalidRow } = readBakerIngredientRows();

  if (hasInvalidRow) {
    showError('baker-result', 'Enter a valid name and non-negative number for every ingredient row, or leave the row blank.');
    return;
  }

  if (ingredients.length === 0) {
    showError('baker-result', 'Add at least one ingredient.');
    return;
  }

  try {
    if (mode === 'weights-to-percent') {
      const { totalFlourWeight, ingredients: computed } = bakersPercentagesFromWeights(
        ingredients.map(i => ({ name: i.name, isFlour: i.isFlour, weight: i.value }))
      );

      const rows = computed.map(i => `
        <tr><td>${i.name}${i.isFlour ? ' (flour)' : ''}</td><td>${formatBakerNumber(i.weight)} g</td><td>${formatBakerNumber(i.percent)}%</td></tr>
      `).join('');

      document.getElementById('baker-result').innerHTML = `
        <div class="headline">${formatBakerNumber(totalFlourWeight)} g flour</div>
        <div>Total flour weight (100% base)</div>
        <table>
          <thead><tr><th>Ingredient</th><th>Weight</th><th>Baker's %</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    } else {
      const flourWeightRaw = document.getElementById('baker-flour-weight').value;
      const doughWeightRaw = document.getElementById('baker-dough-weight').value;
      const flourWeight = parseFloat(flourWeightRaw);
      const targetDoughWeight = parseFloat(doughWeightRaw);

      if ((flourWeightRaw === '' || isNaN(flourWeight)) && (doughWeightRaw === '' || isNaN(targetDoughWeight))) {
        showError('baker-result', 'Enter a total flour weight or a target total dough weight.');
        return;
      }

      const { totalFlourWeight, totalDoughWeight, ingredients: computed } = bakersWeightsFromPercentages(
        ingredients.map(i => ({ name: i.name, isFlour: i.isFlour, percent: i.value })),
        {
          flourWeight: flourWeightRaw !== '' && !isNaN(flourWeight) ? flourWeight : undefined,
          targetDoughWeight: doughWeightRaw !== '' && !isNaN(targetDoughWeight) ? targetDoughWeight : undefined,
        }
      );

      const rows = computed.map(i => `
        <tr><td>${i.name}${i.isFlour ? ' (flour)' : ''}</td><td>${formatBakerNumber(i.percent)}%</td><td>${formatBakerNumber(i.weight)} g</td></tr>
      `).join('');

      document.getElementById('baker-result').innerHTML = `
        <div class="headline">${formatBakerNumber(totalDoughWeight)} g dough</div>
        <div>Total flour weight used: ${formatBakerNumber(totalFlourWeight)} g</div>
        <table>
          <thead><tr><th>Ingredient</th><th>Baker's %</th><th>Weight</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  } catch (err) {
    showError('baker-result', err.message);
  }
});

// --- Loan / Mortgage Amortization calculator ---
document.getElementById('loan-calc').addEventListener('click', () => {
  const principal = parseFloat(document.getElementById('loan-principal').value);
  const rate = parseFloat(document.getElementById('loan-rate').value);
  const years = parseInt(document.getElementById('loan-years').value, 10);
  const extraRaw = document.getElementById('loan-extra-payment').value;
  const extraPayment = extraRaw === '' ? 0 : parseFloat(extraRaw);

  if (!principal || principal <= 0) {
    showError('loan-result', 'Enter a valid loan principal greater than zero.');
    return;
  }

  if (isNaN(rate) || rate < 0) {
    showError('loan-result', 'Enter a valid annual interest rate (0 or greater).');
    return;
  }

  if (!years || years < 1 || !Number.isInteger(years)) {
    showError('loan-result', 'Enter a valid whole number of years for the loan term.');
    return;
  }

  if (isNaN(extraPayment) || extraPayment < 0) {
    showError('loan-result', 'Enter a valid extra monthly payment (0 or greater).');
    return;
  }

  const termMonths = years * 12;
  const base = amortizationSchedule(principal, rate, termMonths, 0);

  if (!isFinite(base.monthlyPayment) || base.monthlyPayment <= 0) {
    showError('loan-result', 'This rate and term combination does not produce a valid monthly payment. Try different values.');
    return;
  }

  const withExtra = extraPayment > 0 ? amortizationSchedule(principal, rate, termMonths, extraPayment) : null;
  const active = withExtra || base;

  const rows = active.schedule.map(row => `
    <tr>
      <td>${row.month}</td>
      <td>${formatMoney(row.payment)}</td>
      <td>${formatMoney(row.interest)}</td>
      <td>${formatMoney(row.principal)}</td>
      <td>${formatMoney(row.balance)}</td>
    </tr>
  `).join('');

  const monthsSaved = withExtra ? base.monthsToPayoff - withExtra.monthsToPayoff : 0;
  const savingsHtml = withExtra ? `
    <div class="hint">Overpaying ${formatMoney(extraPayment)}/month saves ${formatMoney(base.totalInterest - withExtra.totalInterest)} in interest and pays off the loan ${monthsSaved} month${monthsSaved === 1 ? '' : 's'} sooner (${withExtra.monthsToPayoff} vs ${base.monthsToPayoff} months).</div>
  ` : '';

  document.getElementById('loan-result').innerHTML = `
    <div class="headline">${formatMoney(base.monthlyPayment)} / month</div>
    <div>Fixed monthly payment over ${years} year${years === 1 ? '' : 's'} (${termMonths} months)</div>
    <div class="hint">Total paid: ${formatMoney(active.totalPaid)} &middot; Total interest: ${formatMoney(active.totalInterest)}</div>
    ${savingsHtml}
    <div class="hint">Full ${active.schedule.length}-month amortization schedule below &mdash; it can get long for longer terms.</div>
    <div class="table-scroll">
      <table>
        <thead><tr><th>#</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
});

// --- Cooking time conversion calculator ---
document.getElementById('cooktime-mode').addEventListener('change', (e) => {
  const isBatch = e.target.value === 'batch';
  document.getElementById('cooktime-pan-fields').hidden = isBatch;
  document.getElementById('cooktime-batch-fields').hidden = !isBatch;
});

document.getElementById('cooktime-shape').addEventListener('change', (e) => {
  const isRectangular = e.target.value === 'rectangular';
  document.getElementById('cooktime-round-fields').hidden = isRectangular;
  document.getElementById('cooktime-rectangular-fields').hidden = !isRectangular;
});

function formatCooktimeMinutes(minutes) {
  return minutes % 1 === 0 ? String(minutes) : minutes.toFixed(1);
}

const COOKTIME_DONENESS_HINT = 'This is a rule-of-thumb estimate &mdash; start checking for doneness about 15&ndash;25% before the estimated new time.';

document.getElementById('cooktime-calc').addEventListener('click', () => {
  const mode = document.getElementById('cooktime-mode').value;

  if (mode === 'pan') {
    const shape = document.getElementById('cooktime-shape').value;
    const originalTime = parseFloat(document.getElementById('cooktime-pan-time').value);

    if (isNaN(originalTime) || originalTime <= 0) {
      showError('cooktime-result', 'Enter a valid original cooking time.');
      return;
    }

    let originalArea, newArea;

    if (shape === 'round') {
      const origDiameter = parseFloat(document.getElementById('cooktime-orig-diameter').value);
      const newDiameter = parseFloat(document.getElementById('cooktime-new-diameter').value);

      if (isNaN(origDiameter) || origDiameter <= 0 || isNaN(newDiameter) || newDiameter <= 0) {
        showError('cooktime-result', 'Enter valid original and new pan diameters.');
        return;
      }

      originalArea = roundPanArea(origDiameter);
      newArea = roundPanArea(newDiameter);
    } else {
      const origLength = parseFloat(document.getElementById('cooktime-orig-length').value);
      const origWidth = parseFloat(document.getElementById('cooktime-orig-width').value);
      const newLength = parseFloat(document.getElementById('cooktime-new-length').value);
      const newWidth = parseFloat(document.getElementById('cooktime-new-width').value);

      if ([origLength, origWidth, newLength, newWidth].some(v => isNaN(v) || v <= 0)) {
        showError('cooktime-result', 'Enter valid original and new pan lengths and widths.');
        return;
      }

      originalArea = rectangularPanArea(origLength, origWidth);
      newArea = rectangularPanArea(newLength, newWidth);
    }

    const { areaRatio, newTime } = panSizeCookingTime(originalTime, originalArea, newArea);

    document.getElementById('cooktime-result').innerHTML = `
      <div class="headline">${formatCooktimeMinutes(newTime)} min</div>
      <div>Estimated new cooking time (area ratio: ${areaRatio.toFixed(2)}x)</div>
      <div class="hint">${COOKTIME_DONENESS_HINT}</div>
    `;
  } else {
    const originalQuantity = parseFloat(document.getElementById('cooktime-orig-qty').value);
    const newQuantity = parseFloat(document.getElementById('cooktime-new-qty').value);
    const originalTime = parseFloat(document.getElementById('cooktime-batch-time').value);

    if (
      isNaN(originalQuantity) || originalQuantity <= 0 ||
      isNaN(newQuantity) || newQuantity <= 0 ||
      isNaN(originalTime) || originalTime <= 0
    ) {
      showError('cooktime-result', 'Enter valid original and new quantities and an original cooking time.');
      return;
    }

    const { quantityRatio, newTime } = batchQuantityCookingTime(originalTime, originalQuantity, newQuantity);

    document.getElementById('cooktime-result').innerHTML = `
      <div class="headline">${formatCooktimeMinutes(newTime)} min</div>
      <div>Estimated new cooking time (quantity ratio: ${quantityRatio.toFixed(2)}x)</div>
      <div class="hint">${COOKTIME_DONENESS_HINT}</div>
    `;
  }
});

// --- Calories per serving calculator ---
const CALORIE_INITIAL_ROWS = 3;

function addCalorieIngredientRow() {
  const row = document.createElement('div');
  row.className = 'calorie-ingredient-row';
  row.innerHTML = `
    <input type="text" class="calorie-ing-name" aria-label="Ingredient name" placeholder="e.g. Chicken breast">
    <input type="number" class="calorie-ing-cal" aria-label="Calories" min="0" step="0.1" placeholder="e.g. 412.5">
    <button type="button" class="calorie-remove-btn" aria-label="Remove ingredient">&times;</button>
  `;
  document.getElementById('calorie-ingredient-list').appendChild(row);
}

for (let i = 0; i < CALORIE_INITIAL_ROWS; i++) addCalorieIngredientRow();

document.getElementById('calorie-add-ingredient').addEventListener('click', () => addCalorieIngredientRow());

document.getElementById('calorie-ingredient-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.calorie-remove-btn');
  if (!btn) return;
  btn.closest('.calorie-ingredient-row').remove();
});

function formatCalorieValue(cal) {
  return cal % 1 === 0 ? String(cal) : cal.toFixed(1);
}

document.getElementById('calorie-calc').addEventListener('click', () => {
  const servings = parseFloat(document.getElementById('calorie-servings').value);

  if (!servings || servings <= 0) {
    showError('calorie-result', 'Enter a valid number of servings.');
    return;
  }

  const rows = document.querySelectorAll('#calorie-ingredient-list .calorie-ingredient-row');
  const ingredients = [];
  let hasInvalidRow = false;

  rows.forEach(row => {
    const name = row.querySelector('.calorie-ing-name').value.trim();
    const calRaw = row.querySelector('.calorie-ing-cal').value;
    const calories = parseFloat(calRaw);

    if (!name && calRaw === '') return; // blank row, skip silently

    if (!name || calRaw === '' || isNaN(calories) || calories < 0) {
      hasInvalidRow = true;
      return;
    }

    ingredients.push({ name, calories });
  });

  if (hasInvalidRow) {
    showError('calorie-result', 'Enter a valid name and non-negative calorie value for every ingredient row, or leave the row blank.');
    return;
  }

  if (ingredients.length === 0) {
    showError('calorie-result', 'Add at least one ingredient.');
    return;
  }

  const { totalCalories, caloriesPerServing: perServing, ingredients: listed } = caloriesPerServing(ingredients, servings);

  const rowsHtml = listed.map(ing => `
    <tr>
      <td>${ing.name}</td>
      <td>${formatCalorieValue(ing.calories)} kcal</td>
    </tr>
  `).join('');

  document.getElementById('calorie-result').innerHTML = `
    <div class="headline">&asymp;${Math.round(perServing)} kcal / serving</div>
    <div>Total recipe calories: ${formatCalorieValue(totalCalories)} kcal &divide; ${servings} servings</div>
    <table>
      <thead><tr><th>Ingredient</th><th>Calories</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
});

// --- Credit card interest & payoff calculator ---
document.getElementById('cc-mode').addEventListener('change', (e) => {
  const isMinimum = e.target.value === 'minimum';
  document.getElementById('cc-fixed-fields').hidden = isMinimum;
  document.getElementById('cc-minimum-fields').hidden = !isMinimum;
});

function formatCcMonths(months) {
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${months} month${months === 1 ? '' : 's'}`;
  const yearsLabel = `${years} year${years === 1 ? '' : 's'}`;
  if (remMonths === 0) return yearsLabel;
  return `${yearsLabel}, ${remMonths} month${remMonths === 1 ? '' : 's'}`;
}

document.getElementById('cc-calc').addEventListener('click', () => {
  const balance = parseFloat(document.getElementById('cc-balance').value);
  const apr = parseFloat(document.getElementById('cc-apr').value);
  const mode = document.getElementById('cc-mode').value;

  if (!balance || balance <= 0) {
    showError('cc-result', 'Enter a valid balance greater than zero.');
    return;
  }

  if (isNaN(apr) || apr < 0) {
    showError('cc-result', 'Enter a valid APR (0 or greater).');
    return;
  }

  if (mode === 'fixed') {
    const payment = parseFloat(document.getElementById('cc-payment').value);

    if (!payment || payment <= 0) {
      showError('cc-result', 'Enter a valid fixed monthly payment greater than zero.');
      return;
    }

    const result = creditCardPayoffFixed(balance, apr, payment);

    if (!result) {
      showError('cc-result', 'This payment does not even cover the first month’s interest, so the balance will never be paid off. Enter a larger payment.');
      return;
    }

    document.getElementById('cc-result').innerHTML = `
      <div class="headline">${formatCcMonths(result.months)}</div>
      <div>Time to pay off the balance at ${formatMoney(payment)}/month</div>
      <div class="hint">Total interest: ${formatMoney(result.totalInterest)} &middot; Total paid: ${formatMoney(result.totalPaid)}</div>
    `;
  } else {
    const minPercent = parseFloat(document.getElementById('cc-min-percent').value);
    const minFloor = parseFloat(document.getElementById('cc-min-floor').value);

    if (isNaN(minPercent) || minPercent <= 0 || isNaN(minFloor) || minFloor <= 0) {
      showError('cc-result', 'Enter a valid minimum payment percentage and floor amount, both greater than zero.');
      return;
    }

    const result = creditCardPayoffMinimum(balance, apr, minPercent, minFloor);

    if (!result) {
      showError('cc-result', 'This minimum payment does not even cover the first month’s interest, so the balance will never be paid off.');
      return;
    }

    document.getElementById('cc-result').innerHTML = `
      <div class="headline">${formatCcMonths(result.months)}</div>
      <div>Time to pay off the balance paying only the minimum (${minPercent}% of balance, ${formatMoney(minFloor)} floor)</div>
      <div class="hint">Total interest: ${formatMoney(result.totalInterest)} &middot; Total paid: ${formatMoney(result.totalPaid)}</div>
      <div class="hint">Paying only the minimum can take years and cost far more in interest than a fixed higher payment &mdash; try the fixed-payment mode to compare.</div>
    `;
  }
});

// --- Savings goal calculator ---
document.getElementById('savings-calc').addEventListener('click', () => {
  const goal = parseFloat(document.getElementById('savings-goal-amount').value);
  const current = parseFloat(document.getElementById('savings-current').value) || 0;
  const months = parseInt(document.getElementById('savings-months').value, 10);
  const rate = parseFloat(document.getElementById('savings-rate').value) || 0;

  if (!goal || goal <= 0) {
    showError('savings-result', 'Enter a valid savings goal greater than zero.');
    return;
  }

  if (current < 0) {
    showError('savings-result', 'Current savings cannot be negative.');
    return;
  }

  if (!months || months < 1 || !Number.isInteger(months)) {
    showError('savings-result', 'Enter a valid whole number of months until the target date.');
    return;
  }

  const { requiredContribution, goalAlreadyMet, finalBalance, totalContributed, totalGrowth } =
    requiredSavingsContribution(goal, current, rate, 12, months);

  if (goalAlreadyMet) {
    document.getElementById('savings-result').innerHTML = `
      <div class="headline">No further contributions needed</div>
      <div>Your current savings alone are projected to reach ${formatMoney(finalBalance)} by then, meeting the ${formatMoney(goal)} goal.</div>
    `;
    return;
  }

  document.getElementById('savings-result').innerHTML = `
    <div class="headline">${formatMoney(requiredContribution)} / month</div>
    <div>Required monthly contribution to reach ${formatMoney(goal)} in ${months} month${months === 1 ? '' : 's'}</div>
    <div class="hint">Total contributed: ${formatMoney(totalContributed)} &middot; Growth earned: ${formatMoney(totalGrowth)}</div>
  `;
});

// --- Emergency fund calculator ---
document.getElementById('ef-calc').addEventListener('click', () => {
  const expenses = parseFloat(document.getElementById('ef-expenses').value);
  const months = parseFloat(document.getElementById('ef-months').value);
  const current = parseFloat(document.getElementById('ef-current').value) || 0;

  if (!expenses || expenses <= 0) {
    showError('ef-result', 'Enter a valid monthly expenses amount greater than zero.');
    return;
  }

  if (!months || months <= 0) {
    showError('ef-result', 'Enter a valid number of months of coverage greater than zero.');
    return;
  }

  if (current < 0) {
    showError('ef-result', 'Amount already saved cannot be negative.');
    return;
  }

  const { target, shortfall, percentFunded } = emergencyFundTarget(expenses, months, current);

  const progressHtml = current > 0 ? `
    <div class="hint">Already saved: ${formatMoney(current)} (${percentFunded.toFixed(1)}% funded) &middot; Shortfall: ${formatMoney(shortfall)}</div>
  ` : '';

  document.getElementById('ef-result').innerHTML = `
    <div class="headline">${formatMoney(target)}</div>
    <div>Recommended emergency fund (${months} month${months === 1 ? '' : 's'} of expenses)</div>
    ${progressHtml}
  `;
});

// --- Inflation impact calculator ---
document.getElementById('inflation-calc').addEventListener('click', () => {
  const amount = parseFloat(document.getElementById('inflation-amount').value);
  const rate = parseFloat(document.getElementById('inflation-rate').value);
  const years = parseFloat(document.getElementById('inflation-years').value);
  const direction = document.getElementById('inflation-direction').value;

  if (!amount || amount <= 0) {
    showError('inflation-result', 'Enter a valid amount greater than zero.');
    return;
  }

  if (isNaN(rate) || rate < 0) {
    showError('inflation-result', 'Enter a valid inflation rate (0 or greater).');
    return;
  }

  if (!years || years <= 0) {
    showError('inflation-result', 'Enter a valid number of years greater than zero.');
    return;
  }

  const { futureCost, realValue, percentPurchasingPowerLost } = inflationImpact(amount, rate, years);

  const resultHtml = direction === 'futureCost'
    ? `
      <div class="headline">${formatMoney(futureCost)}</div>
      <div>You'd need this much in ${years} year${years === 1 ? '' : 's'} to match the buying power of ${formatMoney(amount)} today</div>
    `
    : `
      <div class="headline">${formatMoney(realValue)}</div>
      <div>${formatMoney(amount)} received in ${years} year${years === 1 ? '' : 's'} would have this much buying power in today's terms</div>
    `;

  document.getElementById('inflation-result').innerHTML = `
    ${resultHtml}
    <div class="hint">Purchasing power lost over the period: ${percentPurchasingPowerLost.toFixed(1)}%</div>
  `;
});

// --- Driving distance & time calculator ---
function formatHM({ hours, minutes }) {
  return `${hours}h ${minutes}m`;
}

document.getElementById('drive-calc').addEventListener('click', () => {
  const distance = parseFloat(document.getElementById('drive-distance').value);
  const speed = parseFloat(document.getElementById('drive-speed').value);
  const stopMinutesRaw = document.getElementById('drive-stop-minutes').value;
  const stopMinutes = stopMinutesRaw === '' ? 0 : parseFloat(stopMinutesRaw);

  if (!distance || distance <= 0) {
    showError('drive-result', 'Enter a valid distance greater than zero.');
    return;
  }

  if (!speed || speed <= 0) {
    showError('drive-result', 'Enter a valid average speed greater than zero.');
    return;
  }

  if (isNaN(stopMinutes) || stopMinutes < 0) {
    showError('drive-result', 'Stop time cannot be negative.');
    return;
  }

  const { drivingHours, totalHours } = drivingTripTime(distance, speed, stopMinutes);
  const drivingHM = hoursToHoursMinutes(drivingHours);

  const totalHtml = stopMinutes > 0 ? `
    <div class="hint">Total trip time including stops: ${formatHM(hoursToHoursMinutes(totalHours))}</div>
  ` : '';

  document.getElementById('drive-result').innerHTML = `
    <div class="headline">${formatHM(drivingHM)}</div>
    <div>Estimated driving time</div>
    ${totalHtml}
  `;
});

// --- Oven temperature converter ---
document.getElementById('oven-unit').addEventListener('change', (e) => {
  const isGasMark = e.target.value === 'gasmark';
  document.getElementById('oven-value-field').hidden = isGasMark;
  document.getElementById('oven-gasmark-field').hidden = !isGasMark;
});

function formatGasMarkLabel(mark) {
  if (mark === 0.25) return '&frac14;';
  if (mark === 0.5) return '&frac12;';
  return String(mark);
}

document.getElementById('oven-calc').addEventListener('click', () => {
  const unit = document.getElementById('oven-unit').value;
  let celsius, fahrenheit, gasMark;

  if (unit === 'gasmark') {
    const mark = parseFloat(document.getElementById('oven-gasmark-value').value);
    const temps = gasMarkToTemps(mark);
    celsius = temps.celsius;
    fahrenheit = temps.fahrenheit;
    gasMark = mark;
  } else {
    const value = parseFloat(document.getElementById('oven-value').value);

    if (isNaN(value)) {
      showError('oven-result', 'Enter a valid temperature.');
      return;
    }

    if (unit === 'celsius') {
      celsius = value;
      fahrenheit = celsiusToFahrenheit(value);
    } else {
      fahrenheit = value;
      celsius = fahrenheitToCelsius(value);
    }
    gasMark = celsiusToGasMark(celsius);
  }

  const gasMarkLine = gasMark === null
    ? '<div>Gas Mark: outside standard range</div>'
    : `<div>Gas Mark: ${formatGasMarkLabel(gasMark)}</div>`;

  document.getElementById('oven-result').innerHTML = `
    <div class="headline">${celsius.toFixed(0)}&deg;C / ${fahrenheit.toFixed(0)}&deg;F</div>
    ${gasMarkLine}
  `;
});

// --- Meat doneness guide ---
const USDA_SAFE_MINIMUM_FAHRENHEIT = 145;

document.getElementById('meat-calc').addEventListener('click', () => {
  const donenessId = document.getElementById('meat-doneness-level').value;
  const cutSize = document.getElementById('meat-cut-size').value;
  const unit = document.getElementById('meat-unit').value;

  const doneness = MEAT_DONENESS_LEVELS.find(d => d.id === donenessId);
  const { target, pullTemperature, restMinutes } = meatPullTemperature(donenessId, cutSize, unit);
  const unitLabel = unit === 'f' ? '&deg;F' : '&deg;C';
  const rangeLabel = unit === 'f' ? doneness.rangeLabelF : doneness.rangeLabelC;

  const safetyNote = doneness.targetFahrenheit < USDA_SAFE_MINIMUM_FAHRENHEIT ? `
    <div class="hint">${doneness.label} beef falls below the USDA safe minimum internal temperature (145&deg;F / 63&deg;C). This is a personal risk tolerance choice, not a food-safety recommendation.</div>
  ` : '';

  document.getElementById('meat-result').innerHTML = `
    <div class="headline">Pull at ${pullTemperature}${unitLabel}</div>
    <div>${doneness.label} target: ${rangeLabel} &middot; Rest ${restMinutes} minutes to coast up to temperature</div>
    ${safetyNote}
  `;
});

// --- Coffee brew ratio calculator ---
document.getElementById('coffee-method').addEventListener('change', (e) => {
  const method = COFFEE_BREW_METHODS.find(m => m.id === e.target.value);
  document.getElementById('coffee-ratio').value = method.defaultRatio;
});

document.getElementById('coffee-direction').addEventListener('change', (e) => {
  const isDoseToWater = e.target.value === 'doseToWater';
  document.getElementById('coffee-amount-label').textContent = isDoseToWater ? 'Coffee dose (g)' : 'Water/yield (g)';
});

document.getElementById('coffee-calc').addEventListener('click', () => {
  const ratio = parseFloat(document.getElementById('coffee-ratio').value);
  const direction = document.getElementById('coffee-direction').value;
  const amount = parseFloat(document.getElementById('coffee-amount').value);

  if (!ratio || ratio <= 0) {
    showError('coffee-result', 'Enter a valid ratio greater than zero.');
    return;
  }

  if (!amount || amount <= 0) {
    showError('coffee-result', 'Enter a valid amount greater than zero.');
    return;
  }

  if (direction === 'doseToWater') {
    const water = coffeeWaterForDose(amount, ratio);
    document.getElementById('coffee-result').innerHTML = `
      <div class="headline">${water % 1 === 0 ? water : water.toFixed(1)} g water/yield</div>
      <div>${amount} g coffee at a 1:${ratio} ratio</div>
    `;
  } else {
    const dose = coffeeDoseForWater(amount, ratio);
    document.getElementById('coffee-result').innerHTML = `
      <div class="headline">${dose % 1 === 0 ? dose : dose.toFixed(1)} g coffee dose</div>
      <div>${amount} g water/yield at a 1:${ratio} ratio</div>
    `;
  }
});

// --- Time zone converter ---
function formatDayOffsetLabel(dayOffset) {
  if (dayOffset === 0) return 'same day';
  if (dayOffset === 1) return 'next day';
  if (dayOffset === -1) return 'previous day';
  return dayOffset > 0 ? `${dayOffset} days later` : `${Math.abs(dayOffset)} days earlier`;
}

document.getElementById('tz-calc').addEventListener('click', () => {
  const sourceTimeRaw = document.getElementById('tz-source-time').value;
  const sourceOffset = parseFloat(document.getElementById('tz-source-offset').value);
  const destOffset = parseFloat(document.getElementById('tz-dest-offset').value);

  if (!sourceTimeRaw) {
    showError('tz-result', 'Enter a valid source time.');
    return;
  }

  const [sourceHour, sourceMinute] = sourceTimeRaw.split(':').map(Number);

  const isValidOffset = (offset) => !isNaN(offset) && offset >= -12 && offset <= 14;

  if (!isValidOffset(sourceOffset) || !isValidOffset(destOffset)) {
    showError('tz-result', 'Enter valid UTC offsets between -12 and +14.');
    return;
  }

  const { destinationMinutes, dayOffset } = convertTimeZone(sourceHour, sourceMinute, sourceOffset, destOffset);

  document.getElementById('tz-result').innerHTML = `
    <div class="headline">${minutesToTimeLabel(destinationMinutes)}</div>
    <div>Destination time (${formatDayOffsetLabel(dayOffset)})</div>
  `;
});

// --- Dough hydration calculator ---
document.getElementById('hydration-mode').addEventListener('change', (e) => {
  const isPercentMode = e.target.value === 'percent-to-weight';
  document.getElementById('hydration-weights-fields').hidden = isPercentMode;
  document.getElementById('hydration-percent-fields').hidden = !isPercentMode;
});

document.getElementById('hydration-calc').addEventListener('click', () => {
  const mode = document.getElementById('hydration-mode').value;

  if (mode === 'weights-to-percent') {
    const flourWeight = parseFloat(document.getElementById('hydration-flour-weight').value);
    const waterWeight = parseFloat(document.getElementById('hydration-water-weight').value);

    if (!flourWeight || flourWeight <= 0) {
      showError('hydration-result', 'Enter a valid flour weight greater than zero.');
      return;
    }

    if (isNaN(waterWeight) || waterWeight < 0) {
      showError('hydration-result', 'Enter a valid, non-negative water weight.');
      return;
    }

    const hydration = doughHydrationPercent(flourWeight, waterWeight);

    document.getElementById('hydration-result').innerHTML = `
      <div class="headline">${hydration.toFixed(1)}%</div>
      <div>Hydration (${waterWeight} g water &divide; ${flourWeight} g flour)</div>
    `;
  } else {
    const targetPercent = parseFloat(document.getElementById('hydration-target-percent').value);
    const flourWeight = parseFloat(document.getElementById('hydration-flour-weight-2').value);

    if (isNaN(targetPercent) || targetPercent < 0) {
      showError('hydration-result', 'Enter a valid, non-negative target hydration percentage.');
      return;
    }

    if (!flourWeight || flourWeight <= 0) {
      showError('hydration-result', 'Enter a valid flour weight greater than zero.');
      return;
    }

    const water = doughWaterForHydration(targetPercent, flourWeight);

    document.getElementById('hydration-result').innerHTML = `
      <div class="headline">${water.toFixed(1)} g water</div>
      <div>Needed for ${targetPercent}% hydration with ${flourWeight} g flour</div>
    `;
  }
});

// --- Salary after tax calculator ---
const DEFAULT_TAX_BRACKETS = [
  { from: 0, rate: 0 },
  { from: 10000, rate: 20 },
  { from: 30000, rate: 35 },
];

function addTaxBracketRow(from = '', rate = '') {
  const row = document.createElement('div');
  row.className = 'tax-bracket-row';
  row.innerHTML = `
    <input type="number" class="tax-bracket-from" aria-label="Bracket starts at" min="0" step="0.01" value="${from}" placeholder="e.g. 10000">
    <input type="number" class="tax-bracket-rate" aria-label="Bracket rate percent" min="0" max="100" step="0.1" value="${rate}" placeholder="e.g. 20">
    <button type="button" class="tax-bracket-remove-btn" aria-label="Remove bracket">&times;</button>
  `;
  document.getElementById('tax-bracket-list').appendChild(row);
}

DEFAULT_TAX_BRACKETS.forEach(b => addTaxBracketRow(b.from, b.rate));

document.getElementById('tax-bracket-add').addEventListener('click', () => addTaxBracketRow());

document.getElementById('tax-bracket-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.tax-bracket-remove-btn');
  if (!btn) return;
  btn.closest('.tax-bracket-row').remove();
});

document.getElementById('salary-calc').addEventListener('click', () => {
  const grossRaw = parseFloat(document.getElementById('salary-gross').value);
  const period = document.getElementById('salary-period').value;
  const ssRate = parseFloat(document.getElementById('salary-ss-rate').value);

  if (!grossRaw || grossRaw <= 0) {
    showError('salary-result', 'Enter a valid gross salary greater than zero.');
    return;
  }

  if (isNaN(ssRate) || ssRate < 0 || ssRate > 100) {
    showError('salary-result', 'Enter a valid social security rate between 0 and 100%.');
    return;
  }

  const rows = document.querySelectorAll('#tax-bracket-list .tax-bracket-row');
  const brackets = [];
  let hasInvalidRow = false;

  rows.forEach(row => {
    const from = parseFloat(row.querySelector('.tax-bracket-from').value);
    const rate = parseFloat(row.querySelector('.tax-bracket-rate').value);

    if (isNaN(from) || from < 0 || isNaN(rate) || rate < 0 || rate > 100) {
      hasInvalidRow = true;
      return;
    }

    brackets.push({ from, rate: rate / 100 });
  });

  if (hasInvalidRow) {
    showError('salary-result', 'Enter a valid, non-negative "from" amount and a rate between 0 and 100% for every bracket.');
    return;
  }

  if (brackets.length === 0) {
    showError('salary-result', 'Add at least one tax bracket.');
    return;
  }

  for (let i = 1; i < brackets.length; i++) {
    if (brackets[i].from <= brackets[i - 1].from) {
      showError('salary-result', 'Bracket "from" amounts must be in strictly ascending order.');
      return;
    }
  }

  const grossAnnual = period === 'monthly' ? grossRaw * 12 : grossRaw;
  const { tax, socialSecurity, netIncome, netMonthly, effectiveRate } = salaryAfterTax(grossAnnual, brackets, ssRate);

  document.getElementById('salary-result').innerHTML = `
    <div class="headline">${formatMoney(netIncome)} / year net</div>
    <div>${formatMoney(netMonthly)} / month &middot; Effective tax + social security rate: ${effectiveRate.toFixed(1)}%</div>
    <div class="hint">Income tax: ${formatMoney(tax)} &middot; Social security: ${formatMoney(socialSecurity)}</div>
  `;
});

// --- Salary converter ---
document.getElementById('sc-calc').addEventListener('click', () => {
  const period = document.getElementById('sc-period').value;
  const amount = parseFloat(document.getElementById('sc-amount').value);
  const hoursPerWeek = parseFloat(document.getElementById('sc-hours-per-week').value);
  const weeksPerYear = parseFloat(document.getElementById('sc-weeks-per-year').value);

  if (!amount || amount <= 0) {
    showError('sc-result', 'Enter a valid amount greater than zero.');
    return;
  }

  if (!hoursPerWeek || hoursPerWeek <= 0 || hoursPerWeek > 168) {
    showError('sc-result', 'Enter a valid hours-per-week value between 1 and 168.');
    return;
  }

  if (!weeksPerYear || weeksPerYear <= 0 || weeksPerYear > 52) {
    showError('sc-result', 'Enter a valid weeks-per-year value between 1 and 52.');
    return;
  }

  const { annual, monthly, hourly } = convertSalary(amount, period, hoursPerWeek, weeksPerYear);

  document.getElementById('sc-result').innerHTML = `
    <div class="headline">${formatMoney(annual)} / year</div>
    <div>${formatMoney(monthly)} / month &middot; ${formatMoney(hourly)} / hour</div>
  `;
});

// --- Rent vs Buy calculator ---
document.getElementById('rvb-calc').addEventListener('click', () => {
  const homePrice = parseFloat(document.getElementById('rvb-home-price').value);
  const downPayment = parseFloat(document.getElementById('rvb-down-payment').value);
  const closingCosts = parseFloat(document.getElementById('rvb-closing-costs').value) || 0;
  const mortgageRatePercent = parseFloat(document.getElementById('rvb-mortgage-rate').value);
  const mortgageTermYears = parseInt(document.getElementById('rvb-mortgage-term').value, 10);
  const annualOwnershipCostPercent = parseFloat(document.getElementById('rvb-ownership-cost').value);
  const appreciationRatePercent = parseFloat(document.getElementById('rvb-appreciation').value);
  const monthlyRent = parseFloat(document.getElementById('rvb-rent').value);
  const rentGrowthRatePercent = parseFloat(document.getElementById('rvb-rent-growth').value);
  const investmentReturnRatePercent = parseFloat(document.getElementById('rvb-investment-return').value);
  const horizonYears = parseInt(document.getElementById('rvb-horizon').value, 10);

  if (!homePrice || homePrice <= 0) {
    showError('rvb-result', 'Enter a valid home price greater than zero.');
    return;
  }

  if (isNaN(downPayment) || downPayment < 0 || downPayment > homePrice) {
    showError('rvb-result', 'Down payment must be between 0 and the home price.');
    return;
  }

  if (isNaN(mortgageRatePercent) || mortgageRatePercent < 0) {
    showError('rvb-result', 'Enter a valid mortgage interest rate (0 or greater).');
    return;
  }

  if (!mortgageTermYears || mortgageTermYears < 1 || !Number.isInteger(mortgageTermYears)) {
    showError('rvb-result', 'Enter a valid whole number of years for the mortgage term.');
    return;
  }

  if (isNaN(annualOwnershipCostPercent) || annualOwnershipCostPercent < 0) {
    showError('rvb-result', 'Enter a valid ownership cost percentage (0 or greater).');
    return;
  }

  if (isNaN(appreciationRatePercent)) {
    showError('rvb-result', 'Enter a valid home appreciation rate.');
    return;
  }

  if (!monthlyRent || monthlyRent <= 0) {
    showError('rvb-result', 'Enter a valid comparable monthly rent greater than zero.');
    return;
  }

  if (isNaN(rentGrowthRatePercent) || isNaN(investmentReturnRatePercent)) {
    showError('rvb-result', 'Enter valid rent growth and investment return rates.');
    return;
  }

  if (!horizonYears || horizonYears < 1 || !Number.isInteger(horizonYears)) {
    showError('rvb-result', 'Enter a valid whole number of years for the comparison horizon.');
    return;
  }

  const { netCostBuy, netCostRent, difference } = rentVsBuyComparison({
    homePrice, downPayment, closingCosts, mortgageRatePercent, mortgageTermYears,
    annualOwnershipCostPercent, appreciationRatePercent, monthlyRent,
    rentGrowthRatePercent, investmentReturnRatePercent, horizonYears,
  });

  const verdict = difference > 0
    ? `Buying is cheaper by ${formatMoney(Math.abs(difference))} over ${horizonYears} years`
    : `Renting is cheaper by ${formatMoney(Math.abs(difference))} over ${horizonYears} years`;

  document.getElementById('rvb-result').innerHTML = `
    <div class="headline">${verdict}</div>
    <div class="hint">Net cost of buying: ${formatMoney(netCostBuy)} &middot; Net cost of renting: ${formatMoney(netCostRent)}</div>
  `;
});

// --- Net worth growth projection calculator ---
// Net worth projection is the same lump-sum-plus-contribution compound
// formula as the Investment/DCA Growth calculator, applied to net worth
// instead of a specific investment account.
document.getElementById('nw-calc').addEventListener('click', () => {
  const current = parseFloat(document.getElementById('nw-current').value);
  const monthlySavings = parseFloat(document.getElementById('nw-monthly-savings').value) || 0;
  const rate = parseFloat(document.getElementById('nw-rate').value);
  const years = parseInt(document.getElementById('nw-years').value, 10);

  if (isNaN(current)) {
    showError('nw-result', 'Enter a valid current net worth (it may be negative).');
    return;
  }

  if (isNaN(rate)) {
    showError('nw-result', 'Enter a valid expected annual growth rate.');
    return;
  }

  if (!years || years < 1 || !Number.isInteger(years)) {
    showError('nw-result', 'Enter a valid whole number of years for the projection horizon.');
    return;
  }

  const { futureValue, totalContributed, totalGrowth, yearly } = investmentGrowth(current, monthlySavings, 12, rate, years);

  const rows = yearly.map(y => `
    <tr>
      <td>${y.year}</td>
      <td>${formatMoney(y.endingBalance)}</td>
      <td>${formatMoney(y.cumulativeContributions)}</td>
      <td>${formatMoney(y.cumulativeGrowth)}</td>
    </tr>
  `).join('');

  document.getElementById('nw-result').innerHTML = `
    <div class="headline">${formatMoney(futureValue)}</div>
    <div>Projected net worth after ${years} year${years === 1 ? '' : 's'}</div>
    <div class="hint">Contributed: ${formatMoney(totalContributed)} &middot; Growth: ${formatMoney(totalGrowth)}</div>
    <table>
      <thead><tr><th>Year</th><th>Net worth</th><th>Contributed</th><th>Growth</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

// --- Fuel cost calculator ---
document.getElementById('fuel-unit-system').addEventListener('change', (e) => {
  const isImperial = e.target.value === 'imperial';
  document.getElementById('fuel-metric-fields').hidden = isImperial;
  document.getElementById('fuel-imperial-fields').hidden = !isImperial;
});

document.getElementById('fuel-calc').addEventListener('click', () => {
  const unitSystem = document.getElementById('fuel-unit-system').value;

  if (unitSystem === 'metric') {
    const distance = parseFloat(document.getElementById('fuel-distance-km').value);
    const consumption = parseFloat(document.getElementById('fuel-consumption-l100').value);
    const price = parseFloat(document.getElementById('fuel-price-l').value);

    if (!distance || distance <= 0) {
      showError('fuel-result', 'Enter a valid distance greater than zero.');
      return;
    }

    if (!consumption || consumption <= 0) {
      showError('fuel-result', 'Enter a valid fuel consumption greater than zero.');
      return;
    }

    if (!price || price <= 0) {
      showError('fuel-result', 'Enter a valid fuel price greater than zero.');
      return;
    }

    const { fuelUsed, totalCost, costPerDistance } = fuelCostMetric(distance, consumption, price);

    document.getElementById('fuel-result').innerHTML = `
      <div class="headline">${formatMoney(totalCost)}</div>
      <div>${fuelUsed.toFixed(1)} L used over ${distance} km</div>
      <div class="hint">Cost per km: ${formatMoney(costPerDistance)}</div>
    `;
  } else {
    const distance = parseFloat(document.getElementById('fuel-distance-mi').value);
    const mpg = parseFloat(document.getElementById('fuel-mpg').value);
    const price = parseFloat(document.getElementById('fuel-price-gal').value);

    if (!distance || distance <= 0) {
      showError('fuel-result', 'Enter a valid distance greater than zero.');
      return;
    }

    if (!mpg || mpg <= 0) {
      showError('fuel-result', 'Enter a valid mpg greater than zero.');
      return;
    }

    if (!price || price <= 0) {
      showError('fuel-result', 'Enter a valid fuel price greater than zero.');
      return;
    }

    const { fuelUsed, totalCost, costPerDistance } = fuelCostImperial(distance, mpg, price);

    document.getElementById('fuel-result').innerHTML = `
      <div class="headline">${formatMoney(totalCost)}</div>
      <div>${fuelUsed.toFixed(2)} gal used over ${distance} mi</div>
      <div class="hint">Cost per mile: ${formatMoney(costPerDistance)}</div>
    `;
  }
});

// --- Retirement savings calculator ---
document.getElementById('retire-calc').addEventListener('click', () => {
  const currentAge = parseFloat(document.getElementById('retire-current-age').value);
  const retirementAge = parseFloat(document.getElementById('retire-target-age').value);
  const currentSavings = parseFloat(document.getElementById('retire-current-savings').value) || 0;
  const monthlyContribution = parseFloat(document.getElementById('retire-monthly-contribution').value) || 0;
  const rate = parseFloat(document.getElementById('retire-rate').value);

  if (isNaN(currentAge) || currentAge < 0 || currentAge > 120) {
    showError('retire-result', 'Enter a valid current age between 0 and 120.');
    return;
  }

  if (isNaN(retirementAge) || retirementAge < 0 || retirementAge > 120 || retirementAge <= currentAge) {
    showError('retire-result', 'Enter a valid retirement age greater than your current age.');
    return;
  }

  if (currentSavings < 0 || monthlyContribution < 0) {
    showError('retire-result', 'Current savings and monthly contribution cannot be negative.');
    return;
  }

  if (isNaN(rate)) {
    showError('retire-result', 'Enter a valid expected annual growth rate.');
    return;
  }

  const { yearsRemaining, futureValue, totalContributed, totalGrowth } =
    retirementProjection(currentAge, retirementAge, currentSavings, monthlyContribution, rate);
  const { daysRemaining } = retirementCountdown(new Date(), yearsRemaining);

  document.getElementById('retire-result').innerHTML = `
    <div class="headline">${formatMoney(futureValue)}</div>
    <div>Projected savings at age ${retirementAge}</div>
    <div class="hint">Contributed: ${formatMoney(totalContributed)} &middot; Growth: ${formatMoney(totalGrowth)}</div>
    <div class="hint">Time remaining: ${yearsRemaining} year${yearsRemaining === 1 ? '' : 's'} (&asymp;${daysRemaining.toLocaleString()} days)</div>
  `;
});

// --- Jet lag recovery calculator ---
document.getElementById('jetlag-mode').addEventListener('change', (e) => {
  const isOffsets = e.target.value === 'offsets';
  document.getElementById('jetlag-direct-fields').hidden = isOffsets;
  document.getElementById('jetlag-offsets-fields').hidden = !isOffsets;
});

document.getElementById('jetlag-calc').addEventListener('click', () => {
  const mode = document.getElementById('jetlag-mode').value;
  let direction, zonesCrossed;

  if (mode === 'direct') {
    zonesCrossed = parseFloat(document.getElementById('jetlag-zones').value);
    direction = document.getElementById('jetlag-direction').value;

    if (!zonesCrossed || zonesCrossed <= 0) {
      showError('jetlag-result', 'Enter a valid number of time zones crossed, greater than zero.');
      return;
    }
  } else {
    const originOffset = parseFloat(document.getElementById('jetlag-origin-offset').value);
    const destOffset = parseFloat(document.getElementById('jetlag-dest-offset').value);
    const isValidOffset = (o) => !isNaN(o) && o >= -12 && o <= 14;

    if (!isValidOffset(originOffset) || !isValidOffset(destOffset)) {
      showError('jetlag-result', 'Enter valid UTC offsets between -12 and +14.');
      return;
    }

    ({ direction, zonesCrossed } = jetLagDirectionFromOffsets(originOffset, destOffset));

    if (direction === 'none') {
      document.getElementById('jetlag-result').innerHTML = `
        <div class="headline">No jet lag expected</div>
        <div>Origin and destination share the same UTC offset.</div>
      `;
      return;
    }
  }

  const recoveryDays = jetLagRecoveryDays(zonesCrossed, direction);

  document.getElementById('jetlag-result').innerHTML = `
    <div class="headline">${recoveryDays} day${recoveryDays === 1 ? '' : 's'} to recover</div>
    <div>${zonesCrossed} time zone${zonesCrossed === 1 ? '' : 's'} crossed ${direction === 'east' ? 'eastward' : 'westward'}</div>
    <div class="hint">Eastward jet lag tends to be worse than westward for the same number of zones.</div>
  `;
});

// --- EV charging cost calculator ---
document.getElementById('ev-calc').addEventListener('click', () => {
  const battery = parseFloat(document.getElementById('ev-battery').value);
  const efficiency = parseFloat(document.getElementById('ev-efficiency').value);
  const price = parseFloat(document.getElementById('ev-price').value);
  const chargingEfficiency = parseFloat(document.getElementById('ev-charging-efficiency').value);
  const distanceRaw = document.getElementById('ev-distance').value;
  const distance = distanceRaw === '' ? null : parseFloat(distanceRaw);

  if (!battery || battery <= 0) {
    showError('ev-result', 'Enter a valid battery capacity greater than zero.');
    return;
  }

  if (!efficiency || efficiency <= 0) {
    showError('ev-result', 'Enter a valid efficiency greater than zero.');
    return;
  }

  if (!price || price <= 0) {
    showError('ev-result', 'Enter a valid electricity price greater than zero.');
    return;
  }

  if (isNaN(chargingEfficiency) || chargingEfficiency <= 0 || chargingEfficiency > 100) {
    showError('ev-result', 'Enter a valid charging efficiency between 0 (exclusive) and 100%.');
    return;
  }

  if (distance !== null && distance <= 0) {
    showError('ev-result', 'Distance, if provided, must be greater than zero.');
    return;
  }

  const { cost: fullChargeCost } = evFullChargeCost(battery, price, chargingEfficiency);
  const range = evRange(battery, efficiency);
  const costPer100km = evCostPer100km(efficiency, price);

  const tripHtml = distance !== null ? `
    <div class="hint">Cost for a ${distance} km trip: ${formatMoney(evTripCost(distance, efficiency, price).cost)}</div>
  ` : '';

  document.getElementById('ev-result').innerHTML = `
    <div class="headline">${formatMoney(fullChargeCost)} to fully charge</div>
    <div>Estimated range on a full charge: ${range.toFixed(0)} km</div>
    <div class="hint">Cost per 100 km: ${formatMoney(costPer100km)}</div>
    ${tripHtml}
  `;
});

// --- FIRE (Financial Independence, Retire Early) calculator ---
document.getElementById('fire-calc').addEventListener('click', () => {
  const annualIncome = parseFloat(document.getElementById('fire-annual-income').value);
  const annualExpenses = parseFloat(document.getElementById('fire-annual-expenses').value);
  const currentSavings = parseFloat(document.getElementById('fire-current-savings').value) || 0;
  const returnRate = parseFloat(document.getElementById('fire-return-rate').value);
  const withdrawalRate = parseFloat(document.getElementById('fire-withdrawal-rate').value);

  if (!annualExpenses || annualExpenses <= 0) {
    showError('fire-result', 'Enter valid annual expenses greater than zero.');
    return;
  }

  if (isNaN(annualIncome)) {
    showError('fire-result', 'Enter a valid annual income.');
    return;
  }

  if (currentSavings < 0) {
    showError('fire-result', 'Current invested savings cannot be negative.');
    return;
  }

  if (isNaN(returnRate)) {
    showError('fire-result', 'Enter a valid expected annual investment return.');
    return;
  }

  if (isNaN(withdrawalRate) || withdrawalRate <= 0) {
    showError('fire-result', 'Enter a valid safe withdrawal rate greater than zero.');
    return;
  }

  const { fiTarget, yearsToFI, annualSavings, savingsRatePercent, alreadyFI } =
    fireCalculator(annualIncome, annualExpenses, currentSavings, returnRate, withdrawalRate);

  if (annualSavings <= 0 && !alreadyFI) {
    document.getElementById('fire-result').innerHTML = `
      <div class="headline">FI is never reached</div>
      <div>Annual income doesn't exceed annual expenses, so there's nothing left to invest.</div>
      <div class="hint">FI target: ${formatMoney(fiTarget)} &middot; Savings rate: ${savingsRatePercent.toFixed(1)}%</div>
    `;
    return;
  }

  if (alreadyFI) {
    document.getElementById('fire-result').innerHTML = `
      <div class="headline">Already financially independent</div>
      <div>Current savings already meet or exceed the FI target.</div>
      <div class="hint">FI target: ${formatMoney(fiTarget)} &middot; Savings rate: ${savingsRatePercent.toFixed(1)}%</div>
    `;
    return;
  }

  document.getElementById('fire-result').innerHTML = `
    <div class="headline">${yearsToFI.toFixed(1)} year${yearsToFI === 1 ? '' : 's'} to FI</div>
    <div>FI target: ${formatMoney(fiTarget)}</div>
    <div class="hint">Annual savings: ${formatMoney(annualSavings)} &middot; Savings rate: ${savingsRatePercent.toFixed(1)}%</div>
  `;
});

// --- Petrol vs Diesel Break-Even calculator ---
document.getElementById('pdbe-calc').addEventListener('click', () => {
  const pricePremium = parseFloat(document.getElementById('pdbe-premium').value);
  const petrolConsumption = parseFloat(document.getElementById('pdbe-petrol-consumption').value);
  const petrolPrice = parseFloat(document.getElementById('pdbe-petrol-price').value);
  const dieselConsumption = parseFloat(document.getElementById('pdbe-diesel-consumption').value);
  const dieselPrice = parseFloat(document.getElementById('pdbe-diesel-price').value);
  const annualMileageRaw = document.getElementById('pdbe-annual-mileage').value;
  const annualMileage = annualMileageRaw === '' ? null : parseFloat(annualMileageRaw);

  if (isNaN(pricePremium)) {
    showError('pdbe-result', 'Enter a valid price premium for the diesel car (can be negative if diesel is cheaper upfront).');
    return;
  }

  if (!petrolConsumption || petrolConsumption <= 0) {
    showError('pdbe-result', 'Enter a valid petrol consumption greater than zero.');
    return;
  }

  if (!petrolPrice || petrolPrice <= 0) {
    showError('pdbe-result', 'Enter a valid petrol price greater than zero.');
    return;
  }

  if (!dieselConsumption || dieselConsumption <= 0) {
    showError('pdbe-result', 'Enter a valid diesel consumption greater than zero.');
    return;
  }

  if (!dieselPrice || dieselPrice <= 0) {
    showError('pdbe-result', 'Enter a valid diesel price greater than zero.');
    return;
  }

  if (annualMileage !== null && annualMileage <= 0) {
    showError('pdbe-result', 'Annual mileage, if provided, must be greater than zero.');
    return;
  }

  const {
    costPerKmPetrol, costPerKmDiesel, savingsPerKm, breakEvenDistanceKm, breakEvenYears, neverBreaksEven,
  } = petrolDieselBreakEven(pricePremium, petrolConsumption, petrolPrice, dieselConsumption, dieselPrice, annualMileage);

  if (neverBreaksEven) {
    document.getElementById('pdbe-result').innerHTML = `
      <div class="headline">Diesel never breaks even</div>
      <div>Diesel's cost per km (${formatMoney(costPerKmDiesel)}) is not lower than petrol's (${formatMoney(costPerKmPetrol)}), so the higher upfront price is never recouped in fuel savings.</div>
    `;
    return;
  }

  const yearsHtml = breakEvenYears !== null
    ? `<div class="hint">At ${annualMileage.toLocaleString()} km/year: about ${breakEvenYears.toFixed(2)} years to break even.</div>`
    : '';

  document.getElementById('pdbe-result').innerHTML = `
    <div class="headline">${breakEvenDistanceKm.toFixed(0)} km to break even</div>
    <div>Diesel saves ${formatMoney(savingsPerKm)} per km driven (${formatMoney(costPerKmPetrol)}/km petrol vs ${formatMoney(costPerKmDiesel)}/km diesel).</div>
    ${yearsHtml}
  `;
});

// --- Rule of 72 calculator ---
document.getElementById('rule72-calc').addEventListener('click', () => {
  const ratePercent = parseFloat(document.getElementById('rule72-rate').value);
  const principalRaw = document.getElementById('rule72-principal').value;
  const principal = principalRaw === '' ? null : parseFloat(principalRaw);

  if (isNaN(ratePercent) || ratePercent <= 0) {
    showError('rule72-result', 'Enter a valid annual rate greater than zero (0% or negative rates never double).');
    return;
  }

  if (principalRaw !== '' && (isNaN(principal) || principal <= 0)) {
    showError('rule72-result', 'Starting amount, if provided, must be greater than zero.');
    return;
  }

  const { rule72Years, rule693Years, rule70Years, exactYears } = ruleOf72(ratePercent);

  const sanityNoteHtml = ratePercent > 100
    ? '<div class="hint">Note: rates above 100% are unrealistic for typical investments, though the math still holds.</div>'
    : '';

  const doubledAmountHtml = principal !== null
    ? `<div class="hint">${formatMoney(principal)} doubles to ${formatMoney(principal * 2)} after about ${exactYears.toFixed(2)} years (exact) at ${ratePercent}%.</div>`
    : '';

  document.getElementById('rule72-result').innerHTML = `
    <div class="headline">${rule72Years.toFixed(2)} years to double (Rule of 72)</div>
    <table>
      <thead><tr><th>Method</th><th>Years to double</th></tr></thead>
      <tbody>
        <tr><td>Rule of 72</td><td>${rule72Years.toFixed(2)}</td></tr>
        <tr><td>Rule of 69.3</td><td>${rule693Years.toFixed(2)}</td></tr>
        <tr><td>Rule of 70</td><td>${rule70Years.toFixed(2)}</td></tr>
        <tr><td>Exact (logarithmic)</td><td>${exactYears.toFixed(2)}</td></tr>
      </tbody>
    </table>
    ${doubledAmountHtml}
    ${sanityNoteHtml}
  `;
});

// --- EV vs Petrol Total Cost of Ownership calculator ---
document.getElementById('evtco-calc').addEventListener('click', () => {
  const years = parseFloat(document.getElementById('evtco-years').value);
  const annualMileageKm = parseFloat(document.getElementById('evtco-annual-mileage').value);

  const evPurchasePrice = parseFloat(document.getElementById('evtco-ev-price').value);
  const evResaleValue = parseFloat(document.getElementById('evtco-ev-resale').value);
  const evEfficiencyKWh100km = parseFloat(document.getElementById('evtco-ev-efficiency').value);
  const electricityPricePerKWh = parseFloat(document.getElementById('evtco-electricity-price').value);
  const evMaintenancePerYear = parseFloat(document.getElementById('evtco-ev-maintenance').value);

  const petrolPurchasePrice = parseFloat(document.getElementById('evtco-petrol-price').value);
  const petrolResaleValue = parseFloat(document.getElementById('evtco-petrol-resale').value);
  const petrolConsumptionL100km = parseFloat(document.getElementById('evtco-petrol-consumption').value);
  const petrolPricePerL = parseFloat(document.getElementById('evtco-petrol-price-per-l').value);
  const petrolMaintenancePerYear = parseFloat(document.getElementById('evtco-petrol-maintenance').value);

  if (!years || years <= 0) {
    showError('evtco-result', 'Enter a valid ownership period (years) greater than zero.');
    return;
  }

  if (!annualMileageKm || annualMileageKm <= 0) {
    showError('evtco-result', 'Enter a valid annual mileage greater than zero.');
    return;
  }

  if (!evPurchasePrice || evPurchasePrice <= 0) {
    showError('evtco-result', 'Enter a valid EV purchase price greater than zero.');
    return;
  }

  if (isNaN(evResaleValue) || evResaleValue < 0) {
    showError('evtco-result', 'Enter a valid EV resale value (zero or more).');
    return;
  }

  if (evResaleValue > evPurchasePrice) {
    showError('evtco-result', "The EV's resale value cannot exceed its purchase price.");
    return;
  }

  if (!evEfficiencyKWh100km || evEfficiencyKWh100km <= 0) {
    showError('evtco-result', 'Enter a valid EV efficiency (kWh/100km) greater than zero.');
    return;
  }

  if (!electricityPricePerKWh || electricityPricePerKWh <= 0) {
    showError('evtco-result', 'Enter a valid electricity price greater than zero.');
    return;
  }

  if (isNaN(evMaintenancePerYear) || evMaintenancePerYear < 0) {
    showError('evtco-result', "Enter a valid EV annual maintenance estimate (zero or more).");
    return;
  }

  if (!petrolPurchasePrice || petrolPurchasePrice <= 0) {
    showError('evtco-result', 'Enter a valid petrol car purchase price greater than zero.');
    return;
  }

  if (isNaN(petrolResaleValue) || petrolResaleValue < 0) {
    showError('evtco-result', 'Enter a valid petrol car resale value (zero or more).');
    return;
  }

  if (petrolResaleValue > petrolPurchasePrice) {
    showError('evtco-result', "The petrol car's resale value cannot exceed its purchase price.");
    return;
  }

  if (!petrolConsumptionL100km || petrolConsumptionL100km <= 0) {
    showError('evtco-result', 'Enter a valid petrol consumption (L/100km) greater than zero.');
    return;
  }

  if (!petrolPricePerL || petrolPricePerL <= 0) {
    showError('evtco-result', 'Enter a valid petrol price greater than zero.');
    return;
  }

  if (isNaN(petrolMaintenancePerYear) || petrolMaintenancePerYear < 0) {
    showError('evtco-result', "Enter a valid petrol car annual maintenance estimate (zero or more).");
    return;
  }

  const { evTCO, petrolTCO, difference, evBreakdown, petrolBreakdown, cheaper } = evVsPetrolTCO({
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
  });

  const verdict = cheaper === 'ev'
    ? `The EV is cheaper overall by ${formatMoney(Math.abs(difference))} over ${years} year${years === 1 ? '' : 's'}.`
    : `The petrol car is cheaper overall by ${formatMoney(Math.abs(difference))} over ${years} year${years === 1 ? '' : 's'}.`;

  document.getElementById('evtco-result').innerHTML = `
    <div class="headline">${cheaper === 'ev' ? 'EV' : 'Petrol'} wins</div>
    <div>${verdict}</div>
    <table>
      <thead><tr><th></th><th>Net purchase</th><th>Energy/fuel</th><th>Maintenance</th><th>Total TCO</th></tr></thead>
      <tbody>
        <tr><td>EV</td><td>${formatMoney(evBreakdown.netPurchase)}</td><td>${formatMoney(evBreakdown.energyOrFuel)}</td><td>${formatMoney(evBreakdown.maintenance)}</td><td>${formatMoney(evTCO)}</td></tr>
        <tr><td>Petrol</td><td>${formatMoney(petrolBreakdown.netPurchase)}</td><td>${formatMoney(petrolBreakdown.energyOrFuel)}</td><td>${formatMoney(petrolBreakdown.maintenance)}</td><td>${formatMoney(petrolTCO)}</td></tr>
      </tbody>
    </table>
  `;
});

// --- Car Depreciation calculator ---
document.getElementById('cardep-method').addEventListener('change', (e) => {
  const isStraightLine = e.target.value === 'straight-line';
  document.getElementById('cardep-declining-fields').hidden = isStraightLine;
  document.getElementById('cardep-straightline-fields').hidden = !isStraightLine;
});

document.getElementById('cardep-calc').addEventListener('click', () => {
  const purchasePrice = parseFloat(document.getElementById('cardep-price').value);
  const method = document.getElementById('cardep-method').value;
  const years = parseInt(document.getElementById('cardep-years').value, 10);
  const yearsRaw = document.getElementById('cardep-years').value;

  if (!purchasePrice || purchasePrice <= 0) {
    showError('cardep-result', 'Enter a valid purchase price greater than zero.');
    return;
  }

  if (yearsRaw === '' || isNaN(years) || years <= 0 || !Number.isInteger(parseFloat(yearsRaw))) {
    showError('cardep-result', 'Enter a valid whole number of years to project, greater than zero.');
    return;
  }

  let result;

  if (method === 'straight-line') {
    const residualValue = parseFloat(document.getElementById('cardep-residual').value);
    const usefulLife = parseFloat(document.getElementById('cardep-useful-life').value);

    if (isNaN(residualValue) || residualValue < 0) {
      showError('cardep-result', 'Enter a valid residual value (zero or more).');
      return;
    }

    if (residualValue >= purchasePrice) {
      showError('cardep-result', 'Residual value must be less than the purchase price.');
      return;
    }

    if (!usefulLife || usefulLife <= 0) {
      showError('cardep-result', 'Enter a valid useful life greater than zero years.');
      return;
    }

    result = carDepreciationStraightLine(purchasePrice, residualValue, usefulLife, years);
  } else {
    const rate = parseFloat(document.getElementById('cardep-rate').value);

    if (isNaN(rate) || rate <= 0 || rate >= 100) {
      showError('cardep-result', 'Enter a valid annual depreciation rate strictly between 0% and 100%.');
      return;
    }

    result = carDepreciationDecliningBalance(purchasePrice, rate, years);
  }

  const { valueAtYearN, totalDepreciation, totalDepreciationPercent, yearly } = result;

  const rows = yearly.map(y => `
    <tr><td>${y.year}</td><td>${formatMoney(y.value)}</td></tr>
  `).join('');

  document.getElementById('cardep-result').innerHTML = `
    <div class="headline">${formatMoney(valueAtYearN)}</div>
    <div>Projected value after ${years} year${years === 1 ? '' : 's'}</div>
    <div class="hint">Total depreciation: ${formatMoney(totalDepreciation)} (${totalDepreciationPercent.toFixed(1)}%)</div>
    <table>
      <thead><tr><th>Year</th><th>Value</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

// --- Trip Budget calculator ---
document.getElementById('tripbudget-calc').addEventListener('click', () => {
  const daysRaw = document.getElementById('tripbudget-days').value;
  const days = parseInt(daysRaw, 10);

  if (daysRaw === '' || isNaN(days) || days <= 0 || !Number.isInteger(parseFloat(daysRaw))) {
    showError('tripbudget-result', 'Enter a valid whole number of days, greater than zero.');
    return;
  }

  const accommodationPerDay = parseFloat(document.getElementById('tripbudget-accommodation').value) || 0;
  const foodPerDay = parseFloat(document.getElementById('tripbudget-food').value) || 0;
  const activitiesPerDay = parseFloat(document.getElementById('tripbudget-activities').value) || 0;
  const transportPerDay = parseFloat(document.getElementById('tripbudget-transport').value) || 0;
  const flights = parseFloat(document.getElementById('tripbudget-flights').value) || 0;
  const insurance = parseFloat(document.getElementById('tripbudget-insurance').value) || 0;
  const otherFixed = parseFloat(document.getElementById('tripbudget-other').value) || 0;
  const travelersRaw = document.getElementById('tripbudget-travelers').value;
  const travelers = travelersRaw === '' ? 1 : parseFloat(travelersRaw);

  const costFields = [accommodationPerDay, foodPerDay, activitiesPerDay, transportPerDay, flights, insurance, otherFixed];
  if (costFields.some(value => value < 0)) {
    showError('tripbudget-result', 'Enter valid cost values — none of them can be negative.');
    return;
  }

  if (isNaN(travelers) || travelers <= 0) {
    showError('tripbudget-result', 'Enter a valid number of travelers, greater than zero.');
    return;
  }

  const { dailyTotal, variableCost, fixedCost, totalTripCost, averageCostPerDay } = tripBudget({
    days,
    accommodationPerDay,
    foodPerDay,
    activitiesPerDay,
    transportPerDay,
    flights,
    insurance,
    otherFixed,
    travelers,
  });

  document.getElementById('tripbudget-result').innerHTML = `
    <div class="headline">${formatMoney(totalTripCost)}</div>
    <div>Total projected trip cost${travelers !== 1 ? ` for ${travelers} travelers` : ''}</div>
    <div class="hint">Daily cost: ${formatMoney(dailyTotal)}/day &times; ${days} day${days === 1 ? '' : 's'} = ${formatMoney(variableCost)} variable cost, plus ${formatMoney(fixedCost)} in fixed costs.</div>
    <table>
      <thead><tr><th></th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Variable (per-day) cost</td><td>${formatMoney(variableCost)}</td></tr>
        <tr><td>Fixed cost</td><td>${formatMoney(fixedCost)}</td></tr>
        <tr><td>Total trip cost</td><td>${formatMoney(totalTripCost)}</td></tr>
        <tr><td>Average cost per day</td><td>${formatMoney(averageCostPerDay)}</td></tr>
      </tbody>
    </table>
  `;
});

// --- Car Loan/Lease Payment calculator ---
document.getElementById('carloan-mode').addEventListener('change', (e) => {
  document.getElementById('carloan-lease-fields').hidden = e.target.value !== 'lease';
});

document.getElementById('carloan-calc').addEventListener('click', () => {
  const mode = document.getElementById('carloan-mode').value;
  const price = parseFloat(document.getElementById('carloan-price').value);
  const downPayment = parseFloat(document.getElementById('carloan-downpayment').value) || 0;
  const tradeIn = parseFloat(document.getElementById('carloan-tradein').value) || 0;
  const apr = parseFloat(document.getElementById('carloan-apr').value);
  const termRaw = document.getElementById('carloan-term').value;
  const term = parseInt(termRaw, 10);

  if (!price || price <= 0) {
    showError('carloan-result', 'Enter a valid vehicle price greater than zero.');
    return;
  }

  if (downPayment < 0 || tradeIn < 0) {
    showError('carloan-result', 'Down payment and trade-in value cannot be negative.');
    return;
  }

  if (isNaN(apr) || apr < 0) {
    showError('carloan-result', 'Enter a valid APR (zero or greater).');
    return;
  }

  if (termRaw === '' || isNaN(term) || term <= 0 || !Number.isInteger(parseFloat(termRaw))) {
    showError('carloan-result', 'Enter a valid whole number of months for the term, greater than zero.');
    return;
  }

  const netAmount = price - downPayment - tradeIn;

  if (mode === 'loan') {
    const principal = netAmount > 0 ? netAmount : 0;
    const monthlyPayment = loanMonthlyPayment(principal, apr, term);
    const totalPaid = monthlyPayment * term;
    const totalInterest = totalPaid - principal;

    document.getElementById('carloan-result').innerHTML = `
      <div class="headline">${formatMoney(monthlyPayment)}/month</div>
      <div>Loan payment over ${term} month${term === 1 ? '' : 's'}</div>
      <table>
        <thead><tr><th></th><th>Amount</th></tr></thead>
        <tbody>
          <tr><td>Principal financed</td><td>${formatMoney(principal)}</td></tr>
          <tr><td>Total paid</td><td>${formatMoney(totalPaid)}</td></tr>
          <tr><td>Total interest</td><td>${formatMoney(totalInterest)}</td></tr>
        </tbody>
      </table>
    `;
    return;
  }

  if (netAmount <= 0) {
    showError('carloan-result', 'Down payment and trade-in must be less than the vehicle price.');
    return;
  }

  const residualValue = parseFloat(document.getElementById('carloan-residual').value);

  if (isNaN(residualValue) || residualValue < 0) {
    showError('carloan-result', 'Enter a valid residual value (zero or more).');
    return;
  }

  if (residualValue >= netAmount) {
    showError('carloan-result', 'Residual value must be less than the cap cost (price minus down payment and trade-in).');
    return;
  }

  const { depreciationFee, financeFee, monthlyPayment, totalPaid } = carLeasePayment(netAmount, residualValue, term, apr);
  const totalFinanceCharges = financeFee * term;

  document.getElementById('carloan-result').innerHTML = `
    <div class="headline">${formatMoney(monthlyPayment)}/month</div>
    <div>Lease payment over ${term} month${term === 1 ? '' : 's'}</div>
    <table>
      <thead><tr><th></th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Depreciation fee (monthly)</td><td>${formatMoney(depreciationFee)}</td></tr>
        <tr><td>Finance fee (monthly)</td><td>${formatMoney(financeFee)}</td></tr>
        <tr><td>Total paid</td><td>${formatMoney(totalPaid)}</td></tr>
        <tr><td>Total finance charges</td><td>${formatMoney(totalFinanceCharges)}</td></tr>
      </tbody>
    </table>
  `;
});

// --- Engine Power & Torque Converter calculator ---
document.getElementById('engpt-calc').addEventListener('click', () => {
  const powerRaw = document.getElementById('engpt-power-value').value;
  const powerUnit = document.getElementById('engpt-power-unit').value;
  const torqueRaw = document.getElementById('engpt-torque-value').value;
  const torqueUnit = document.getElementById('engpt-torque-unit').value;
  const rpmRaw = document.getElementById('engpt-rpm').value;

  const hasPower = powerRaw !== '';
  const hasTorque = torqueRaw !== '';

  if (!hasPower && !hasTorque) {
    showError('engpt-result', 'Enter a power value, a torque value, or both.');
    return;
  }

  let power = null;
  if (hasPower) {
    power = parseFloat(powerRaw);
    if (isNaN(power) || power < 0) {
      showError('engpt-result', 'Enter a valid power value (zero or more).');
      return;
    }
  }

  let torque = null;
  if (hasTorque) {
    torque = parseFloat(torqueRaw);
    if (isNaN(torque) || torque < 0) {
      showError('engpt-result', 'Enter a valid torque value (zero or more).');
      return;
    }
  }

  let rpm = null;
  if (rpmRaw !== '') {
    rpm = parseFloat(rpmRaw);
    if (isNaN(rpm) || rpm <= 0) {
      showError('engpt-result', 'Enter a valid RPM greater than zero.');
      return;
    }
  }

  const rows = [];
  let headline = '';
  let subheadline = '';

  let pairedKw = null;
  let pairedHp = null;
  if (hasTorque && rpm !== null) {
    const torqueNm = torqueUnit === 'nm' ? torque : lbftToNm(torque);
    pairedKw = powerFromTorqueNmAndRpm(torqueNm, rpm);
    pairedHp = kwToHp(pairedKw);
  }

  if (hasPower) {
    const hp = powerUnit === 'hp' ? power : kwToHp(power);
    const kw = powerUnit === 'kw' ? power : hpToKw(power);
    rows.push(`<tr><td>Power</td><td>${hp.toFixed(2)} HP</td><td>${kw.toFixed(2)} kW</td></tr>`);

    if (!headline) {
      headline = `${hp.toFixed(2)} HP / ${kw.toFixed(2)} kW`;
      subheadline = 'Power conversion';
    }
  }

  if (hasTorque) {
    const nm = torqueUnit === 'nm' ? torque : lbftToNm(torque);
    const lbft = torqueUnit === 'lbft' ? torque : nmToLbft(torque);
    rows.push(`<tr><td>Torque</td><td>${nm.toFixed(2)} Nm</td><td>${lbft.toFixed(2)} lb-ft</td></tr>`);

    if (pairedKw !== null) {
      rows.push(`<tr><td>Power at ${rpm} RPM</td><td>${pairedHp.toFixed(2)} HP</td><td>${pairedKw.toFixed(2)} kW</td></tr>`);
      headline = `${pairedHp.toFixed(2)} HP / ${pairedKw.toFixed(2)} kW`;
      subheadline = `Power implied by this torque at ${rpm} RPM`;
    } else if (!headline) {
      headline = `${nm.toFixed(2)} Nm / ${lbft.toFixed(2)} lb-ft`;
      subheadline = 'Torque conversion';
    }
  }

  document.getElementById('engpt-result').innerHTML = `
    <div class="headline">${headline}</div>
    <div>${subheadline}</div>
    <table>
      <thead><tr><th></th><th></th><th></th></tr></thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
});

// --- 0-100 km/h Acceleration Estimator calculator ---
document.getElementById('accel-calc').addEventListener('click', () => {
  const mass = parseFloat(document.getElementById('accel-mass').value);
  const powerKw = parseFloat(document.getElementById('accel-power').value);
  const efficiencyRaw = document.getElementById('accel-efficiency').value;
  const targetSpeedRaw = document.getElementById('accel-target-speed').value;

  if (isNaN(mass) || mass <= 0) {
    showError('accel-result', 'Enter a valid vehicle mass greater than zero.');
    return;
  }

  if (isNaN(powerKw) || powerKw <= 0) {
    showError('accel-result', 'Enter a valid engine power greater than zero.');
    return;
  }

  const efficiency = efficiencyRaw === '' ? 0.40 : parseFloat(efficiencyRaw);
  if (isNaN(efficiency) || efficiency <= 0 || efficiency > 1) {
    showError('accel-result', 'Enter a valid efficiency factor greater than 0 and up to 1.');
    return;
  }

  const targetSpeedKmh = targetSpeedRaw === '' ? 100 : parseFloat(targetSpeedRaw);
  if (isNaN(targetSpeedKmh) || targetSpeedKmh <= 0) {
    showError('accel-result', 'Enter a valid target speed greater than zero.');
    return;
  }

  const efficiencyWarning = (efficiency < 0.35 || efficiency > 0.45)
    ? '<div class="hint">Note: typical efficiency factors are 0.35-0.45; this value is outside that range.</div>'
    : '';

  const powerWatts = powerKw * 1000;
  const { timeSeconds } = accelerationTimeEstimate(mass, powerWatts, efficiency, targetSpeedKmh);

  document.getElementById('accel-result').innerHTML = `
    <div class="headline">${timeSeconds.toFixed(2)} s</div>
    <div>Estimated 0-${targetSpeedKmh} km/h time</div>
    ${efficiencyWarning}
    <div class="hint">This is a rough estimate, not a precise prediction &mdash; actual acceleration depends heavily on gearing, traction, and the engine's torque curve.</div>
  `;
});

// --- Gear Ratio / RPM calculator ---
document.getElementById('gearrpm-mode').addEventListener('change', (e) => {
  const isRpmMode = e.target.value === 'rpm';
  document.getElementById('gearrpm-speed-fields').hidden = isRpmMode;
  document.getElementById('gearrpm-rpm-fields').hidden = !isRpmMode;
});

document.getElementById('gearrpm-calc').addEventListener('click', () => {
  const mode = document.getElementById('gearrpm-mode').value;
  const gearRatio = parseFloat(document.getElementById('gearrpm-gear-ratio').value);
  const finalDrive = parseFloat(document.getElementById('gearrpm-final-drive').value);
  const tyreDiameterMm = parseFloat(document.getElementById('gearrpm-tyre-diameter').value);

  if (isNaN(gearRatio) || gearRatio <= 0) {
    showError('gearrpm-result', 'Enter a valid gear ratio greater than zero.');
    return;
  }

  if (isNaN(finalDrive) || finalDrive <= 0) {
    showError('gearrpm-result', 'Enter a valid final drive ratio greater than zero.');
    return;
  }

  if (isNaN(tyreDiameterMm) || tyreDiameterMm <= 0) {
    showError('gearrpm-result', 'Enter a valid tyre diameter greater than zero.');
    return;
  }

  if (mode === 'speed') {
    const engineRpm = parseFloat(document.getElementById('gearrpm-engine-rpm').value);
    if (isNaN(engineRpm) || engineRpm <= 0) {
      showError('gearrpm-result', 'Enter a valid engine RPM greater than zero.');
      return;
    }

    const { wheelRpm, speedKmh } = speedFromRpm(engineRpm, gearRatio, finalDrive, tyreDiameterMm);

    document.getElementById('gearrpm-result').innerHTML = `
      <div class="headline">${speedKmh.toFixed(2)} km/h</div>
      <div>Speed at ${engineRpm} engine RPM</div>
      <div class="hint">Wheel RPM: ${wheelRpm.toFixed(1)}</div>
    `;
  } else {
    const targetSpeed = parseFloat(document.getElementById('gearrpm-target-speed').value);
    if (isNaN(targetSpeed) || targetSpeed <= 0) {
      showError('gearrpm-result', 'Enter a valid target speed greater than zero.');
      return;
    }

    const { wheelRpm, engineRpm } = rpmFromSpeed(targetSpeed, gearRatio, finalDrive, tyreDiameterMm);

    document.getElementById('gearrpm-result').innerHTML = `
      <div class="headline">${engineRpm.toFixed(0)} RPM</div>
      <div>Engine RPM needed for ${targetSpeed} km/h</div>
      <div class="hint">Wheel RPM: ${wheelRpm.toFixed(1)}</div>
    `;
  }
});

// --- Tire Size & Speedometer Error calculator ---
document.getElementById('tse-calc').addEventListener('click', () => {
  const origWidth = parseFloat(document.getElementById('tse-orig-width').value);
  const origAspect = parseFloat(document.getElementById('tse-orig-aspect').value);
  const origRim = parseFloat(document.getElementById('tse-orig-rim').value);
  const newWidth = parseFloat(document.getElementById('tse-new-width').value);
  const newAspect = parseFloat(document.getElementById('tse-new-aspect').value);
  const newRim = parseFloat(document.getElementById('tse-new-rim').value);
  const displayedSpeedRaw = document.getElementById('tse-displayed-speed').value;

  if (isNaN(origWidth) || origWidth <= 0) {
    showError('tse-result', 'Enter a valid original tyre width greater than zero.');
    return;
  }

  if (isNaN(origAspect) || origAspect <= 0) {
    showError('tse-result', 'Enter a valid original tyre aspect ratio greater than zero.');
    return;
  }

  if (isNaN(origRim) || origRim <= 0) {
    showError('tse-result', 'Enter a valid original rim diameter greater than zero.');
    return;
  }

  if (isNaN(newWidth) || newWidth <= 0) {
    showError('tse-result', 'Enter a valid new tyre width greater than zero.');
    return;
  }

  if (isNaN(newAspect) || newAspect <= 0) {
    showError('tse-result', 'Enter a valid new tyre aspect ratio greater than zero.');
    return;
  }

  if (isNaN(newRim) || newRim <= 0) {
    showError('tse-result', 'Enter a valid new rim diameter greater than zero.');
    return;
  }

  let displayedSpeed = null;
  if (displayedSpeedRaw !== '') {
    displayedSpeed = parseFloat(displayedSpeedRaw);
    if (isNaN(displayedSpeed) || displayedSpeed <= 0) {
      showError('tse-result', 'Enter a valid displayed speed greater than zero, or leave it blank.');
      return;
    }
  }

  const aspectWarning = (origAspect > 100 || newAspect > 100)
    ? '<div class="hint">Note: an aspect ratio above 100 is unusual &mdash; double check the tyre code.</div>'
    : '';

  const origDiameterMm = tyreDiameterMm(origWidth, origAspect, origRim);
  const newDiameterMm = tyreDiameterMm(newWidth, newAspect, newRim);
  const origCircumferenceMm = tyreCircumferenceMm(origDiameterMm);
  const newCircumferenceMm = tyreCircumferenceMm(newDiameterMm);
  const { diameterChangePercent, actualSpeed } = tyreSizeComparison(origDiameterMm, newDiameterMm, displayedSpeed);

  const sign = diameterChangePercent > 0 ? '+' : '';
  const speedRow = actualSpeed !== null
    ? `<tr><td>Actual speed</td><td>${actualSpeed.toFixed(2)} km/h</td><td>vs. ${displayedSpeed} km/h displayed</td></tr>`
    : '';

  document.getElementById('tse-result').innerHTML = `
    <div class="headline">${sign}${diameterChangePercent.toFixed(2)}% diameter change</div>
    <div>New tyre overall diameter is ${sign}${diameterChangePercent.toFixed(2)}% vs. the original</div>
    ${aspectWarning}
    <table>
      <thead><tr><th></th><th>Diameter</th><th>Circumference</th></tr></thead>
      <tbody>
        <tr><td>Original tyre</td><td>${origDiameterMm.toFixed(1)} mm</td><td>${origCircumferenceMm.toFixed(1)} mm</td></tr>
        <tr><td>New tyre</td><td>${newDiameterMm.toFixed(1)} mm</td><td>${newCircumferenceMm.toFixed(1)} mm</td></tr>
        ${speedRow}
      </tbody>
    </table>
  `;
});

// --- Currency Converter calculator ---
document.getElementById('currency-calc').addEventListener('click', () => {
  const amountRaw = document.getElementById('currency-amount').value;
  const rateRaw = document.getElementById('currency-rate').value;
  const sourceLabel = document.getElementById('currency-source').value.trim() || 'Source';
  const targetLabel = document.getElementById('currency-target').value.trim() || 'Target';
  const swap = document.getElementById('currency-swap').checked;

  const amount = parseFloat(amountRaw);
  if (amountRaw.trim() === '' || isNaN(amount) || amount < 0) {
    showError('currency-result', 'Enter a valid amount, zero or greater.');
    return;
  }

  const rate = parseFloat(rateRaw);
  if (rateRaw.trim() === '' || isNaN(rate) || rate <= 0) {
    showError('currency-result', 'Enter a valid exchange rate greater than zero.');
    return;
  }

  const effectiveRate = swap ? inverseExchangeRate(rate) : rate;
  const convertedAmount = convertCurrency(amount, effectiveRate);

  const fromLabel = swap ? targetLabel : sourceLabel;
  const toLabel = swap ? sourceLabel : targetLabel;

  document.getElementById('currency-result').innerHTML = `
    <div class="headline">${convertedAmount.toFixed(2)} ${toLabel}</div>
    <div>${amount.toFixed(2)} ${fromLabel} converted at the effective rate below</div>
    <div class="hint">Effective rate used: 1 ${fromLabel} = ${effectiveRate.toFixed(6)} ${toLabel}</div>
  `;
});

// --- Wheel Offset & Clearance (ET) calculator ---
document.getElementById('woc-calc').addEventListener('click', () => {
  const oldWidth = parseFloat(document.getElementById('woc-old-width').value);
  const oldET = parseFloat(document.getElementById('woc-old-et').value);
  const newWidth = parseFloat(document.getElementById('woc-new-width').value);
  const newET = parseFloat(document.getElementById('woc-new-et').value);

  if (isNaN(oldWidth) || oldWidth <= 0) {
    showError('woc-result', 'Enter a valid old wheel width greater than zero.');
    return;
  }

  if (isNaN(oldET)) {
    showError('woc-result', 'Enter a valid old wheel offset (ET) in mm.');
    return;
  }

  if (isNaN(newWidth) || newWidth <= 0) {
    showError('woc-result', 'Enter a valid new wheel width greater than zero.');
    return;
  }

  if (isNaN(newET)) {
    showError('woc-result', 'Enter a valid new wheel offset (ET) in mm.');
    return;
  }

  const etWarning = (Math.abs(oldET) > 60 || Math.abs(newET) > 60)
    ? '<div class="hint">Note: an offset (ET) beyond &plusmn;60mm is unusual &mdash; double check the value.</div>'
    : '';

  const { outwardShiftMm, inwardShiftMm } = wheelOffsetShift(oldWidth, oldET, newWidth, newET);

  const outwardDescription = outwardShiftMm > 0
    ? `sits ${outwardShiftMm.toFixed(1)} mm further out toward the fender`
    : outwardShiftMm < 0
      ? `tucks ${Math.abs(outwardShiftMm).toFixed(1)} mm further in, away from the fender`
      : 'stays in the same place relative to the fender';

  const inwardDescription = inwardShiftMm > 0
    ? `sits ${inwardShiftMm.toFixed(1)} mm further in toward the suspension/strut`
    : inwardShiftMm < 0
      ? `sits ${Math.abs(inwardShiftMm).toFixed(1)} mm further out, away from the suspension/strut`
      : 'stays in the same place relative to the suspension/strut';

  document.getElementById('woc-result').innerHTML = `
    <div class="headline">${outwardShiftMm >= 0 ? '+' : ''}${outwardShiftMm.toFixed(1)} mm outward / ${inwardShiftMm >= 0 ? '+' : ''}${inwardShiftMm.toFixed(1)} mm inward</div>
    <div>The new wheel ${outwardDescription}, and ${inwardDescription}.</div>
    ${etWarning}
    <div class="hint">This is an approximation, not a fitment guarantee &mdash; it doesn't account for suspension travel, steering lock, or fender rolling.</div>
  `;
});

// --- Roof Box Fuel Penalty calculator ---
document.getElementById('rbfp-calc').addEventListener('click', () => {
  const baseConsumption = parseFloat(document.getElementById('rbfp-base-consumption').value);
  const penaltyPercent = parseFloat(document.getElementById('rbfp-penalty').value);
  const distance = parseFloat(document.getElementById('rbfp-distance').value);
  const fuelPrice = parseFloat(document.getElementById('rbfp-fuel-price').value);

  if (!baseConsumption || baseConsumption <= 0) {
    showError('rbfp-result', 'Enter a valid base fuel consumption greater than zero.');
    return;
  }

  if (isNaN(penaltyPercent) || penaltyPercent < 0) {
    showError('rbfp-result', 'Enter a valid roof box consumption penalty of zero or more.');
    return;
  }

  if (!distance || distance <= 0) {
    showError('rbfp-result', 'Enter a valid trip distance greater than zero.');
    return;
  }

  if (!fuelPrice || fuelPrice <= 0) {
    showError('rbfp-result', 'Enter a valid fuel price greater than zero.');
    return;
  }

  const penaltyWarning = penaltyPercent > 100
    ? '<div class="hint">Note: a penalty above 100% is unusually high &mdash; double check the value.</div>'
    : '';

  const { newConsumption, extraConsumption, extraFuel, extraCost } = roofBoxFuelPenalty(
    baseConsumption, penaltyPercent, distance, fuelPrice
  );

  document.getElementById('rbfp-result').innerHTML = `
    <div class="headline">${formatMoney(extraCost)} extra for this trip</div>
    <div>New consumption: ${newConsumption.toFixed(2)} L/100km (+${extraConsumption.toFixed(2)} L/100km) &middot; Extra fuel: ${extraFuel.toFixed(2)} L over ${distance} km</div>
    ${penaltyWarning}
    <div class="hint">Real-world roof box penalties are roughly 10-20% at ~100km/h, up to 25-35% for large boxes at higher speeds.</div>
  `;
});

// --- Percentage calculator ---
document.getElementById('pct-mode').addEventListener('change', (e) => {
  const mode = e.target.value;
  document.getElementById('pct-of-fields').hidden = mode !== 'percent-of';
  document.getElementById('pct-what-fields').hidden = mode !== 'what-percent';
  document.getElementById('pct-change-fields').hidden = mode !== 'percent-change';
});

document.getElementById('pct-calc').addEventListener('click', () => {
  const mode = document.getElementById('pct-mode').value;

  if (mode === 'percent-of') {
    const percent = parseFloat(document.getElementById('pct-of-percent').value);
    const base = parseFloat(document.getElementById('pct-of-base').value);

    if (isNaN(percent) || isNaN(base)) {
      showError('pct-result', 'Enter valid numbers for both fields.');
      return;
    }

    const result = percentOf(percent, base);

    document.getElementById('pct-result').innerHTML = `
      <div class="headline">${result.toFixed(2)}</div>
      <div>${percent}% of ${base} = ${result.toFixed(2)}</div>
    `;
  } else if (mode === 'what-percent') {
    const part = parseFloat(document.getElementById('pct-part').value);
    const whole = parseFloat(document.getElementById('pct-whole').value);

    if (isNaN(part) || isNaN(whole)) {
      showError('pct-result', 'Enter valid numbers for both fields.');
      return;
    }

    if (whole === 0) {
      showError('pct-result', 'The whole value must not be zero.');
      return;
    }

    const result = whatPercentOf(part, whole);

    document.getElementById('pct-result').innerHTML = `
      <div class="headline">${result.toFixed(2)}%</div>
      <div>${part} is ${result.toFixed(2)}% of ${whole}</div>
    `;
  } else {
    const oldValue = parseFloat(document.getElementById('pct-old').value);
    const newValue = parseFloat(document.getElementById('pct-new').value);

    if (isNaN(oldValue) || isNaN(newValue)) {
      showError('pct-result', 'Enter valid numbers for both fields.');
      return;
    }

    if (oldValue === 0) {
      showError('pct-result', 'The old value must not be zero.');
      return;
    }

    const result = percentageChange(oldValue, newValue);
    const direction = result < 0 ? 'decrease' : 'increase';

    document.getElementById('pct-result').innerHTML = `
      <div class="headline">${Math.abs(result).toFixed(2)}% ${direction}</div>
      <div>From ${oldValue} to ${newValue} is a ${Math.abs(result).toFixed(2)}% ${direction}</div>
    `;
  }
});

// --- Fraction calculator ---
const FRACTION_OPERATION_SYMBOLS = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

document.getElementById('frac-calc').addEventListener('click', () => {
  const aNum = parseFloat(document.getElementById('frac-a-num').value);
  const aDen = parseFloat(document.getElementById('frac-a-den').value);
  const bNum = parseFloat(document.getElementById('frac-b-num').value);
  const bDen = parseFloat(document.getElementById('frac-b-den').value);
  const operation = document.getElementById('frac-operation').value;

  if (
    isNaN(aNum) || isNaN(aDen) || isNaN(bNum) || isNaN(bDen) ||
    !Number.isInteger(aNum) || !Number.isInteger(aDen) ||
    !Number.isInteger(bNum) || !Number.isInteger(bDen)
  ) {
    showError('frac-result', 'Enter whole numbers for both fractions’ numerators and denominators.');
    return;
  }

  if (aDen === 0 || bDen === 0) {
    showError('frac-result', 'Denominators must not be zero.');
    return;
  }

  if (operation === 'divide' && bNum === 0) {
    showError('frac-result', 'Cannot divide by a fraction with a numerator of zero.');
    return;
  }

  const { numerator, denominator, decimal, wholePart, remainderNumerator } =
    fractionArithmetic(aNum, aDen, bNum, bDen, operation);

  const fractionLabel = numerator === 0
    ? '0'
    : denominator === 1
      ? `${numerator}`
      : `${numerator}/${denominator}`;

  const mixedLabel = wholePart !== 0 && remainderNumerator !== 0
    ? `${wholePart} ${remainderNumerator}/${denominator}`
    : null;

  const decimalLabel = parseFloat(decimal.toFixed(4)).toString();
  const symbol = FRACTION_OPERATION_SYMBOLS[operation];

  document.getElementById('frac-result').innerHTML = `
    <div class="headline">${fractionLabel}</div>
    <div>${aNum}/${aDen} ${symbol} ${bNum}/${bDen} = ${fractionLabel}</div>
    ${mixedLabel ? `<div>Mixed number: ${mixedLabel}</div>` : ''}
    <div>Decimal: ${decimalLabel}</div>
  `;
});
