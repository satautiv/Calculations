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

// --- One-Rep Max (multi-formula estimator) ---
document.getElementById('orm-calc').addEventListener('click', () => {
  const weight = parseFloat(document.getElementById('orm-weight').value);
  const reps = parseInt(document.getElementById('orm-reps').value, 10);
  const unit = document.getElementById('orm-unit').value;

  if (!weight || weight <= 0 || !reps || reps < 1 || !Number.isInteger(reps)) {
    showError('orm-result', 'Enter a valid weight and rep count.');
    return;
  }

  const formulas = [
    { name: 'Epley', value: epleyOneRepMax(weight, reps) },
    { name: 'Brzycki', value: reps >= 37 ? null : brzyckiOneRepMax(weight, reps) },
    { name: 'Lombardi', value: lombardiOneRepMax(weight, reps) },
    { name: 'Mayhew', value: mayhewOneRepMax(weight, reps) },
  ];

  const validValues = formulas.filter(f => f.value !== null).map(f => f.value);
  const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;

  const rows = formulas
    .map(f => `<tr><td>${f.name}</td><td>${f.value === null ? 'N/A' : `${f.value.toFixed(1)} ${unit}`}</td></tr>`)
    .join('');

  const highRepNote = reps > 12
    ? '<div class="hint">Rep counts above ~12 reduce the accuracy of all 1RM formulas — treat these estimates as rough guidance.</div>'
    : '';

  document.getElementById('orm-result').innerHTML = `
    <div class="headline">${average.toFixed(1)} ${unit} average</div>
    <table>
      <thead><tr><th>Formula</th><th>Estimated 1RM</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${highRepNote}
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

// --- Ratio & Proportion calculator ---
document.getElementById('ratio-mode').addEventListener('change', (e) => {
  const isProportion = e.target.value === 'proportion';
  document.getElementById('ratio-simplify-fields').hidden = isProportion;
  document.getElementById('ratio-proportion-fields').hidden = !isProportion;
});

// Trims trailing floating-point noise for display (e.g. 2.6666666666666665 -> 2.6667).
function formatRatioValue(value) {
  return parseFloat(value.toFixed(4)).toString();
}

const RATIO_PROPORTION_KEYS = ['a', 'b', 'c', 'd'];

// Whichever key is unknown, cross-multiplication (a*d = b*c) always divides
// by the value diagonally opposite it in the proportion a:b = c:d.
const RATIO_PROPORTION_DIVISOR_KEY = { a: 'd', b: 'c', c: 'b', d: 'a' };

document.getElementById('ratio-calc').addEventListener('click', () => {
  const mode = document.getElementById('ratio-mode').value;

  if (mode === 'simplify') {
    const a = parseFloat(document.getElementById('ratio-simplify-a').value);
    const b = parseFloat(document.getElementById('ratio-simplify-b').value);

    if (isNaN(a) || isNaN(b)) {
      showError('ratio-result', 'Enter valid numbers for both A and B.');
      return;
    }

    if (a === 0 && b === 0) {
      showError('ratio-result', 'A and B cannot both be zero &mdash; the ratio is undefined.');
      return;
    }

    const simplified = simplifyRatio(a, b);

    document.getElementById('ratio-result').innerHTML = `
      <div class="headline">${formatRatioValue(simplified.a)}:${formatRatioValue(simplified.b)}</div>
      <div>${a}:${b} simplifies to ${formatRatioValue(simplified.a)}:${formatRatioValue(simplified.b)}</div>
    `;
  } else {
    const rawValues = {
      a: document.getElementById('ratio-a').value.trim(),
      b: document.getElementById('ratio-b').value.trim(),
      c: document.getElementById('ratio-c').value.trim(),
      d: document.getElementById('ratio-d').value.trim(),
    };

    const blankKeys = RATIO_PROPORTION_KEYS.filter((key) => rawValues[key] === '');

    if (blankKeys.length !== 1) {
      showError('ratio-result', 'Leave exactly one of A, B, C, D blank &mdash; that’s the value to solve for.');
      return;
    }

    const unknownKey = blankKeys[0];
    const values = {};

    for (const key of RATIO_PROPORTION_KEYS) {
      if (key === unknownKey) {
        values[key] = null;
        continue;
      }
      const parsed = parseFloat(rawValues[key]);
      if (isNaN(parsed)) {
        showError('ratio-result', 'Enter valid numbers for the three known values.');
        return;
      }
      values[key] = parsed;
    }

    const divisorKey = RATIO_PROPORTION_DIVISOR_KEY[unknownKey];

    if (values[divisorKey] === 0) {
      showError('ratio-result', 'That combination of values is undefined (it would divide by zero).');
      return;
    }

    const solved = solveProportion(values, unknownKey);
    const resolved = { ...values, [unknownKey]: solved };

    const leftBefore = `${unknownKey === 'a' ? '?' : formatRatioValue(values.a)}:${unknownKey === 'b' ? '?' : formatRatioValue(values.b)}`;
    const rightBefore = `${unknownKey === 'c' ? '?' : formatRatioValue(values.c)}:${unknownKey === 'd' ? '?' : formatRatioValue(values.d)}`;
    const leftAfter = `${formatRatioValue(resolved.a)}:${formatRatioValue(resolved.b)}`;
    const rightAfter = `${formatRatioValue(resolved.c)}:${formatRatioValue(resolved.d)}`;

    document.getElementById('ratio-result').innerHTML = `
      <div class="headline">${unknownKey.toUpperCase()} = ${formatRatioValue(solved)}</div>
      <div>${leftBefore} = ${rightBefore} &rarr; the missing value is ${formatRatioValue(solved)}, so ${leftAfter} = ${rightAfter}</div>
    `;
  }
});

// --- Luggage Weight Checker calculator ---
const LUGGAGE_INITIAL_ROWS = 3;

function addLuggageItemRow() {
  const row = document.createElement('div');
  row.className = 'luggage-item-row';
  row.innerHTML = `
    <input type="text" class="luggage-item-name" aria-label="Item name" placeholder="e.g. Hiking boots">
    <input type="number" class="luggage-item-weight" aria-label="Weight (kg)" min="0" step="0.1" placeholder="e.g. 1.4">
    <button type="button" class="luggage-remove-btn" aria-label="Remove item">&times;</button>
  `;
  document.getElementById('luggage-item-list').appendChild(row);
}

for (let i = 0; i < LUGGAGE_INITIAL_ROWS; i++) addLuggageItemRow();

document.getElementById('luggage-add-item').addEventListener('click', () => addLuggageItemRow());

document.getElementById('luggage-item-list').addEventListener('click', (e) => {
  const btn = e.target.closest('.luggage-remove-btn');
  if (!btn) return;
  btn.closest('.luggage-item-row').remove();
});

function formatLuggageWeight(weight) {
  return weight % 1 === 0 ? String(weight) : weight.toFixed(1);
}

document.getElementById('luggage-calc').addEventListener('click', () => {
  const allowance = parseFloat(document.getElementById('luggage-allowance').value);

  if (!allowance || allowance <= 0) {
    showError('luggage-result', 'Enter a valid weight allowance greater than zero.');
    return;
  }

  const rows = document.querySelectorAll('#luggage-item-list .luggage-item-row');
  const items = [];
  let hasInvalidRow = false;

  rows.forEach(row => {
    const name = row.querySelector('.luggage-item-name').value.trim();
    const weightRaw = row.querySelector('.luggage-item-weight').value;
    const weight = parseFloat(weightRaw);

    if (!name && weightRaw === '') return; // blank row, skip silently

    if (!name || weightRaw === '' || isNaN(weight) || weight < 0) {
      hasInvalidRow = true;
      return;
    }

    items.push({ name, weight });
  });

  if (hasInvalidRow) {
    showError('luggage-result', 'Enter a valid name and non-negative weight for every item row, or leave the row blank.');
    return;
  }

  if (items.length === 0) {
    showError('luggage-result', 'Add at least one packed item.');
    return;
  }

  const { totalWeight, difference, isOverAllowance, remainingOrOverage } = luggageWeightCheck(
    allowance, items.map(item => item.weight)
  );

  const rowsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${formatLuggageWeight(item.weight)} kg</td>
    </tr>
  `).join('');

  const statusHtml = isOverAllowance
    ? `<div class="headline">Over by ${formatLuggageWeight(remainingOrOverage)} kg</div>`
    : `<div class="headline">Within allowance</div>`;

  const detailHtml = isOverAllowance
    ? `<div>Total packed weight ${formatLuggageWeight(totalWeight)} kg exceeds the ${formatLuggageWeight(allowance)} kg allowance by ${formatLuggageWeight(remainingOrOverage)} kg.</div>`
    : `<div>Total packed weight ${formatLuggageWeight(totalWeight)} kg is within the ${formatLuggageWeight(allowance)} kg allowance, with ${formatLuggageWeight(remainingOrOverage)} kg to spare.</div>`;

  document.getElementById('luggage-result').innerHTML = `
    ${statusHtml}
    ${detailHtml}
    <table>
      <thead><tr><th>Item</th><th>Weight</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `;
});

// --- Average / Weighted Average calculator ---
document.getElementById('avgw-mode').addEventListener('change', (e) => {
  const isWeighted = e.target.value === 'weighted';
  document.getElementById('avgw-simple-fields').hidden = isWeighted;
  document.getElementById('avgw-weighted-fields').hidden = !isWeighted;
});

function parseAvgwTokens(raw) {
  return raw.split(',').map(s => s.trim()).filter(s => s !== '');
}

// Trims trailing floating-point noise for display (e.g. 2.6666666666666665 -> 2.6667).
function formatAvgwValue(value) {
  return parseFloat(value.toFixed(4)).toString();
}

document.getElementById('avgw-calc').addEventListener('click', () => {
  const mode = document.getElementById('avgw-mode').value;

  if (mode === 'simple') {
    const tokens = parseAvgwTokens(document.getElementById('avgw-simple-values').value);

    if (tokens.length === 0) {
      showError('avgw-result', 'Enter at least one number.');
      return;
    }

    const values = [];
    for (const token of tokens) {
      const n = Number(token);
      if (isNaN(n)) {
        showError('avgw-result', `"${token}" is not a valid number.`);
        return;
      }
      values.push(n);
    }

    const average = simpleAverage(values);
    const sum = values.reduce((total, v) => total + v, 0);

    document.getElementById('avgw-result').innerHTML = `
      <div class="headline">Average of ${values.length} value${values.length === 1 ? '' : 's'} = ${formatAvgwValue(average)}</div>
      <div>Sum ${formatAvgwValue(sum)} &divide; ${values.length} = ${formatAvgwValue(average)}</div>
    `;
  } else {
    const valueTokens = parseAvgwTokens(document.getElementById('avgw-weighted-values').value);
    const weightTokens = parseAvgwTokens(document.getElementById('avgw-weighted-weights').value);

    if (valueTokens.length === 0 || weightTokens.length === 0) {
      showError('avgw-result', 'Enter at least one value and a matching weight.');
      return;
    }

    if (valueTokens.length !== weightTokens.length) {
      showError('avgw-result', `Enter the same number of values and weights (got ${valueTokens.length} value${valueTokens.length === 1 ? '' : 's'} and ${weightTokens.length} weight${weightTokens.length === 1 ? '' : 's'}).`);
      return;
    }

    const values = [];
    for (const token of valueTokens) {
      const n = Number(token);
      if (isNaN(n)) {
        showError('avgw-result', `"${token}" is not a valid number.`);
        return;
      }
      values.push(n);
    }

    const weights = [];
    for (const token of weightTokens) {
      const n = Number(token);
      if (isNaN(n)) {
        showError('avgw-result', `"${token}" is not a valid weight.`);
        return;
      }
      if (n < 0) {
        showError('avgw-result', `Weights must be zero or greater ("${token}" is negative).`);
        return;
      }
      weights.push(n);
    }

    const totalWeight = weights.reduce((total, w) => total + w, 0);

    if (totalWeight === 0) {
      showError('avgw-result', 'The weights sum to zero, so a weighted average is undefined.');
      return;
    }

    const average = weightedAverage(values, weights);
    const weightedSum = values.reduce((total, v, i) => total + v * weights[i], 0);

    document.getElementById('avgw-result').innerHTML = `
      <div class="headline">Weighted average = ${formatAvgwValue(average)}</div>
      <div>${values.length} value${values.length === 1 ? '' : 's'}, weighted sum ${formatAvgwValue(weightedSum)} &divide; total weight ${formatAvgwValue(totalWeight)} = ${formatAvgwValue(average)}</div>
    `;
  }
});

// --- Age calculator ---

// Parses a `type="date"` input's `YYYY-MM-DD` string into a UTC-midnight
// Date, avoiding the timezone-sensitivity of the plain `new Date(string)`
// constructor for date-only strings. Returns null for a blank/invalid value.
function parseAgeDateInput(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return isNaN(date.getTime()) ? null : date;
}

// Today's date normalized to UTC midnight, used as the default "as of" date
// when that field is left blank.
function todayAsUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

document.getElementById('age-calc').addEventListener('click', () => {
  const birthDateRaw = document.getElementById('age-birth-date').value;
  const asOfDateRaw = document.getElementById('age-as-of-date').value;

  const birthDate = parseAgeDateInput(birthDateRaw);
  if (!birthDate) {
    showError('age-result', 'Enter a valid birth date.');
    return;
  }

  const asOfDate = asOfDateRaw ? parseAgeDateInput(asOfDateRaw) : todayAsUtcMidnight();
  if (!asOfDate) {
    showError('age-result', 'Enter a valid as-of date.');
    return;
  }

  try {
    const { years, months, days, totalDays, totalWeeks, remainderDays } = ageBreakdown(birthDate, asOfDate);

    document.getElementById('age-result').innerHTML = `
      <div class="headline">${years} year${years === 1 ? '' : 's'}, ${months} month${months === 1 ? '' : 's'}, ${days} day${days === 1 ? '' : 's'}</div>
      <div>Total days lived: ${totalDays.toLocaleString()}</div>
      <div class="hint">Total weeks lived: ${totalWeeks.toLocaleString()} week${totalWeeks === 1 ? '' : 's'} and ${remainderDays} day${remainderDays === 1 ? '' : 's'}</div>
    `;
  } catch (err) {
    showError('age-result', err.message);
  }
});

// --- Sunrise/Sunset & Daylight calculator ---
document.getElementById('sunrise-calc').addEventListener('click', () => {
  const dateRaw = document.getElementById('sunrise-date').value;
  const lat = parseFloat(document.getElementById('sunrise-latitude').value);
  const lon = parseFloat(document.getElementById('sunrise-longitude').value);
  const utcOffset = parseFloat(document.getElementById('sunrise-utc-offset').value);

  if (!dateRaw) {
    showError('sunrise-result', 'Enter a valid date.');
    return;
  }

  const [year, month, day] = dateRaw.split('-').map(Number);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    showError('sunrise-result', 'Enter a valid latitude between -90 and 90.');
    return;
  }

  if (isNaN(lon) || lon < -180 || lon > 180) {
    showError('sunrise-result', 'Enter a valid longitude between -180 and 180.');
    return;
  }

  if (isNaN(utcOffset) || utcOffset < -12 || utcOffset > 14) {
    showError('sunrise-result', 'Enter a valid UTC offset between -12 and +14.');
    return;
  }

  const doy = dayOfYear(year, month, day);
  const result = sunriseSunset(doy, lat, lon, utcOffset);

  if (result.polarDay) {
    document.getElementById('sunrise-result').innerHTML = `
      <div class="headline">Polar day (24h daylight)</div>
      <div>The sun does not set at this location on this date.</div>
    `;
    return;
  }

  if (result.polarNight) {
    document.getElementById('sunrise-result').innerHTML = `
      <div class="headline">Polar night (0h daylight)</div>
      <div>The sun does not rise at this location on this date.</div>
    `;
    return;
  }

  const sunrise = formatMinutesAsLocalTime(result.sunriseMinutesUTC, utcOffset);
  const sunset = formatMinutesAsLocalTime(result.sunsetMinutesUTC, utcOffset);
  const daylight = formatDurationHM(result.daylightMinutes);

  document.getElementById('sunrise-result').innerHTML = `
    <div class="headline">Sunrise ${sunrise} &middot; Sunset ${sunset}</div>
    <div>Daylight duration: ${daylight}</div>
    <div class="hint">Approximate local times based on the UTC offset you entered.</div>
  `;
});

// --- Warm-up set calculator ---
document.getElementById('warmup-calc').addEventListener('click', () => {
  const target = parseFloat(document.getElementById('warmup-target').value);
  const unit = document.getElementById('warmup-unit').value;
  const barRaw = document.getElementById('warmup-bar').value;
  const incrementRaw = document.getElementById('warmup-increment').value;

  if (isNaN(target) || target <= 0) {
    showError('warmup-result', 'Enter a valid target working weight greater than zero.');
    return;
  }

  const defaultBar = unit === 'lb' ? 45 : 20;
  const defaultIncrement = unit === 'lb' ? 5 : 2.5;
  const bar = barRaw === '' ? defaultBar : parseFloat(barRaw);
  const increment = incrementRaw === '' ? defaultIncrement : parseFloat(incrementRaw);

  if (isNaN(bar) || bar < 0) {
    showError('warmup-result', 'Enter a valid, non-negative empty bar weight.');
    return;
  }

  if (isNaN(increment) || increment < 0) {
    showError('warmup-result', 'Enter a valid, non-negative rounding increment.');
    return;
  }

  try {
    const rows = warmupSets(target, bar, increment)
      .map(({ percent, reps, weight, warmup }) => `<tr><td>${percent}%</td><td>${weight.toFixed(1)} ${unit}</td><td>${warmup ? reps : 'Working set'}</td></tr>`)
      .join('');

    document.getElementById('warmup-result').innerHTML = `
      <table>
        <thead><tr><th>Percent</th><th>Weight</th><th>Reps</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  } catch (err) {
    showError('warmup-result', err.message);
  }
});

// --- Date Difference / Countdown calculator ---
document.getElementById('date-diff-calc').addEventListener('click', () => {
  const dateARaw = document.getElementById('date-diff-a').value;
  const dateBRaw = document.getElementById('date-diff-b').value;

  if (!dateBRaw) {
    showError('date-diff-result', 'Enter a valid target date (Date B).');
    return;
  }

  const dateB = parseAgeDateInput(dateBRaw);
  if (!dateB) {
    showError('date-diff-result', 'Enter a valid target date (Date B).');
    return;
  }

  const countdownMode = !dateARaw;
  const dateA = countdownMode ? todayAsUtcMidnight() : parseAgeDateInput(dateARaw);
  if (!dateA) {
    showError('date-diff-result', 'Enter a valid Date A, or leave it blank to use today.');
    return;
  }

  const { years, months, days, totalDays, totalWeeks, remainderDays, reversed } = dateDifference(dateA, dateB);
  const yearsMonthsDays = `${years} year${years === 1 ? '' : 's'}, ${months} month${months === 1 ? '' : 's'}, ${days} day${days === 1 ? '' : 's'}`;

  let headline;
  if (totalDays === 0) {
    headline = 'Today (0 days)';
  } else if (countdownMode) {
    headline = reversed
      ? `${totalDays.toLocaleString()} day${totalDays === 1 ? '' : 's'} since ${dateBRaw}`
      : `${totalDays.toLocaleString()} day${totalDays === 1 ? '' : 's'} until ${dateBRaw}`;
  } else {
    const earlierRaw = reversed ? dateBRaw : dateARaw;
    const laterRaw = reversed ? dateARaw : dateBRaw;
    headline = `${totalDays.toLocaleString()} day${totalDays === 1 ? '' : 's'} between ${earlierRaw} and ${laterRaw}`;
  }

  document.getElementById('date-diff-result').innerHTML = `
    <div class="headline">${headline}</div>
    <div>${yearsMonthsDays}</div>
    <div class="hint">Total weeks: ${totalWeeks.toLocaleString()} week${totalWeeks === 1 ? '' : 's'} and ${remainderDays} day${remainderDays === 1 ? '' : 's'}</div>
  `;
});

// --- DOTS score calculator ---
document.getElementById('dots-calc').addEventListener('click', () => {
  const bw = parseFloat(document.getElementById('dots-bw').value);
  const total = parseFloat(document.getElementById('dots-total').value);
  const sex = document.getElementById('dots-sex').value;

  if (!bw || bw <= 0 || !total || total <= 0) {
    showError('dots-result', 'Enter a valid bodyweight and total lifted.');
    return;
  }

  if (!sex) {
    showError('dots-result', 'Select a sex.');
    return;
  }

  const score = dotsScore(bw, total, sex);

  let note = '';
  if (sex === 'female' && bw > DOTS_FEMALE_BW_CAP) {
    note = `<div class="hint">The women's formula is only validated up to ${DOTS_FEMALE_BW_CAP} kg; the calculation used ${DOTS_FEMALE_BW_CAP} kg instead of your entered bodyweight.</div>`;
  } else if (bw < 40) {
    note = '<div class="hint">Bodyweight is below the formula\'s validated range (~40 kg+); the estimate may be less accurate.</div>';
  }

  document.getElementById('dots-result').innerHTML = `
    <div class="headline">${score.toFixed(1)}</div>
    <div>DOTS score (relative strength)</div>
    ${note}
  `;
});

// --- Date Plus/Minus Days calculator ---
document.getElementById('date-pm-calc').addEventListener('click', () => {
  const startRaw = document.getElementById('date-pm-start').value;
  const daysRaw = document.getElementById('date-pm-days').value;
  const mode = document.getElementById('date-pm-mode').value;

  const startDate = startRaw ? parseAgeDateInput(startRaw) : todayAsUtcMidnight();
  if (!startDate) {
    showError('date-pm-result', 'Enter a valid start date, or leave it blank to use today.');
    return;
  }

  if (daysRaw === '' || !/^-?\d+$/.test(daysRaw)) {
    showError('date-pm-result', 'Enter a whole number of days.');
    return;
  }

  const days = parseInt(daysRaw, 10);
  const signedDays = mode === 'subtract' ? -Math.abs(days) : Math.abs(days);

  const result = addDaysToDate(startDate, signedDays);
  const resultLabel = result.toISOString().slice(0, 10);
  const weekday = weekdayName(result);
  const startLabel = startRaw || startDate.toISOString().slice(0, 10);
  const verb = mode === 'subtract' ? 'before' : 'after';

  document.getElementById('date-pm-result').innerHTML = `
    <div class="headline">${weekday}, ${resultLabel}</div>
    <div>${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ${verb} ${startLabel} is ${weekday}, ${resultLabel}.</div>
  `;
});

// --- Country voltage and plug type checker ---

const VOLTAGE_RECOMMENDATION_TEXT = {
  none: 'No adapter or converter needed.',
  adapter: 'You need a plug adapter (shape only).',
  converter: 'You need a voltage converter (plug shape is fine).',
  both: 'You need both a plug adapter and a voltage converter.',
};

document.getElementById('voltage-calc').addEventListener('click', () => {
  const home = document.getElementById('voltage-home').value;
  const destination = document.getElementById('voltage-destination').value;
  const dualVoltage = document.getElementById('voltage-dual').checked;

  if (!home || !destination) {
    showError('voltage-result', 'Select both a home country and a destination country.');
    return;
  }

  const result = checkPlugAdapterNeeds(home, destination, dualVoltage);

  if (result.error) {
    showError('voltage-result', result.error);
    return;
  }

  const frequencyNote = result.home.frequency !== result.destination.frequency
    ? `<div class="hint">Frequency differs (${result.home.frequency}Hz vs ${result.destination.frequency}Hz) &mdash; not usually an issue for modern electronics, but can matter for motor-driven appliances like some clocks.</div>`
    : '';

  document.getElementById('voltage-result').innerHTML = `
    <div class="headline">${VOLTAGE_RECOMMENDATION_TEXT[result.recommendation]}</div>
    <div>${home}: ${result.home.voltage}V, ${result.home.frequency}Hz, Type ${result.home.plugTypes.join('/')}</div>
    <div>${destination}: ${result.destination.voltage}V, ${result.destination.frequency}Hz, Type ${result.destination.plugTypes.join('/')}</div>
    ${frequencyNote}
  `;
});

// --- Working Days calculator ---
document.getElementById('workdays-calc').addEventListener('click', () => {
  const startRaw = document.getElementById('workdays-start').value;
  const endRaw = document.getElementById('workdays-end').value;
  const holidaysRaw = document.getElementById('workdays-holidays').value;

  const startDate = parseAgeDateInput(startRaw);
  if (!startDate) {
    showError('workdays-result', 'Enter a valid start date.');
    return;
  }

  const endDate = parseAgeDateInput(endRaw);
  if (!endDate) {
    showError('workdays-result', 'Enter a valid end date.');
    return;
  }

  const holidayEntries = holidaysRaw.split(/[\n,]+/).map(entry => entry.trim()).filter(Boolean);
  const holidayDates = [];
  let skippedCount = 0;
  holidayEntries.forEach(entry => {
    const parsed = parseAgeDateInput(entry);
    if (parsed) {
      holidayDates.push(parsed);
    } else {
      skippedCount++;
    }
  });

  const { workingDays, totalDays, weekendDays, holidayWeekdays } = workingDaysBetween(startDate, endDate, holidayDates);

  const skippedNote = skippedCount > 0
    ? `<div class="hint">Skipped ${skippedCount} unrecognized holiday date${skippedCount === 1 ? '' : 's'}.</div>`
    : '';

  document.getElementById('workdays-result').innerHTML = `
    <div class="headline">${workingDays.toLocaleString()} working day${workingDays === 1 ? '' : 's'}</div>
    <div>Total calendar days: ${totalDays.toLocaleString()} &middot; Weekend days excluded: ${weekendDays.toLocaleString()} &middot; Holiday weekdays excluded: ${holidayWeekdays.toLocaleString()}</div>
    ${skippedNote}
  `;
});

// --- Time Duration calculator ---
document.getElementById('duration-mode').addEventListener('change', (e) => {
  const isTimeOfDay = e.target.value === 'timeofday';
  document.getElementById('duration-durations-fields').hidden = isTimeOfDay;
  document.getElementById('duration-timeofday-fields').hidden = !isTimeOfDay;
});

// Reads an H/M/S field trio, defaulting a blank field to 0 (per issue: missing
// fields like seconds should default rather than error).
function readHMSFields(hoursId, minutesId, secondsId) {
  const hoursRaw = document.getElementById(hoursId).value;
  const minutesRaw = document.getElementById(minutesId).value;
  const secondsRaw = document.getElementById(secondsId).value;
  return {
    hours: hoursRaw === '' ? 0 : parseFloat(hoursRaw),
    minutes: minutesRaw === '' ? 0 : parseFloat(minutesRaw),
    seconds: secondsRaw === '' ? 0 : parseFloat(secondsRaw),
  };
}

function formatHMS({ hours, minutes, seconds }) {
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('duration-calc').addEventListener('click', () => {
  const mode = document.getElementById('duration-mode').value;

  try {
    if (mode === 'durations') {
      const a = readHMSFields('duration-a-h', 'duration-a-m', 'duration-a-s');
      const b = readHMSFields('duration-b-h', 'duration-b-m', 'duration-b-s');
      const operation = document.getElementById('duration-op').value;

      const secondsA = timeToSeconds(a.hours, a.minutes, a.seconds);
      const secondsB = timeToSeconds(b.hours, b.minutes, b.seconds);
      const resultSeconds = addSubtractDurations(secondsA, secondsB, operation);

      document.getElementById('duration-result').innerHTML = `
        <div class="headline">${formatHMS(secondsToHMS(resultSeconds))}</div>
        <div>${formatHMS(secondsToHMS(secondsA))} ${operation === 'subtract' ? '-' : '+'} ${formatHMS(secondsToHMS(secondsB))}</div>
      `;
    } else {
      const start = readHMSFields('duration-start-h', 'duration-start-m', 'duration-start-s');
      const end = readHMSFields('duration-end-h', 'duration-end-m', 'duration-end-s');

      const startSeconds = timeToSeconds(start.hours, start.minutes, start.seconds);
      const endSeconds = timeToSeconds(end.hours, end.minutes, end.seconds);
      const wrapped = endSeconds < startSeconds;
      const diffSeconds = timeOfDayDuration(startSeconds, endSeconds);

      document.getElementById('duration-result').innerHTML = `
        <div class="headline">${formatHMS(secondsToHMS(diffSeconds))}</div>
        <div>${formatHMS(start)} to ${formatHMS(end)}</div>
        ${wrapped ? '<div class="hint">Crossed midnight into the next day.</div>' : ''}
      `;
    }
  } catch (err) {
    showError('duration-result', err.message);
  }
});

// --- IPF GL Points calculator ---
document.getElementById('gl-calc').addEventListener('click', () => {
  const bw = parseFloat(document.getElementById('gl-bw').value);
  const total = parseFloat(document.getElementById('gl-total').value);
  const sex = document.getElementById('gl-sex').value;
  const equipment = document.getElementById('gl-equipment').value;

  if (!bw || bw <= 0 || !total || total <= 0) {
    showError('gl-result', 'Enter a valid bodyweight and total lifted.');
    return;
  }

  if (!sex || !equipment) {
    showError('gl-result', 'Select a sex and equipment class.');
    return;
  }

  const score = glPoints(bw, total, sex, equipment);

  const note = (bw < 40 || bw > 200)
    ? '<div class="hint">Bodyweight is outside typical competition weight classes (~40-200 kg); the estimate may be less meaningful at this extreme.</div>'
    : '';

  document.getElementById('gl-result').innerHTML = `
    <div class="headline">${score.toFixed(1)}</div>
    <div>IPF GL Points</div>
    ${note}
  `;
});

// --- Unit Converter calculator ---

// Display labels for each unit, keyed by category then by the same unit key
// used in calc-lib's UNIT_CONVERSION_CATEGORIES / temperature handling.
const UNIT_CONVERTER_LABELS = {
  length: { mm: 'Millimeters (mm)', cm: 'Centimeters (cm)', m: 'Meters (m)', km: 'Kilometers (km)', in: 'Inches (in)', ft: 'Feet (ft)', yd: 'Yards (yd)', mi: 'Miles (mi)' },
  area: { mm2: 'Square millimeters (mm²)', cm2: 'Square centimeters (cm²)', m2: 'Square meters (m²)', hectare: 'Hectares (ha)', km2: 'Square kilometers (km²)', in2: 'Square inches (in²)', ft2: 'Square feet (ft²)', yd2: 'Square yards (yd²)', acre: 'Acres', mi2: 'Square miles (mi²)' },
  volume: { mL: 'Milliliters (mL)', L: 'Liters (L)', m3: 'Cubic meters (m³)', usGal: 'US gallons (gal)', usQt: 'US quarts (qt)', usFlOz: 'US fluid ounces (fl oz)', impGal: 'Imperial gallons', usCup: 'US cups' },
  mass: { mg: 'Milligrams (mg)', g: 'Grams (g)', kg: 'Kilograms (kg)', tonne: 'Metric tons (t)', oz: 'Ounces (oz)', lb: 'Pounds (lb)', stone: 'Stone (st)', usTon: 'US tons (short tons)' },
  temperature: { C: 'Celsius (°C)', F: 'Fahrenheit (°F)', K: 'Kelvin (K)' },
  speed: { mps: 'Meters/second (m/s)', kmh: 'Kilometers/hour (km/h)', mph: 'Miles/hour (mph)', knot: 'Knots', fps: 'Feet/second (ft/s)' },
};

function populateUnitConverterDropdowns() {
  const category = document.getElementById('uc-category').value;
  const labels = UNIT_CONVERTER_LABELS[category];
  const fromSelect = document.getElementById('uc-from');
  const toSelect = document.getElementById('uc-to');
  const optionsHtml = Object.entries(labels).map(([key, label]) => `<option value="${key}">${label}</option>`).join('');

  fromSelect.innerHTML = optionsHtml;
  toSelect.innerHTML = optionsHtml;
  if (toSelect.options.length > 1) toSelect.selectedIndex = 1;
}

document.getElementById('uc-category').addEventListener('change', populateUnitConverterDropdowns);
populateUnitConverterDropdowns();

const UNIT_CONVERTER_NON_NEGATIVE_CATEGORIES = ['length', 'area', 'volume', 'mass', 'speed'];

document.getElementById('uc-calc').addEventListener('click', () => {
  const category = document.getElementById('uc-category').value;
  const value = parseFloat(document.getElementById('uc-value').value);
  const fromUnit = document.getElementById('uc-from').value;
  const toUnit = document.getElementById('uc-to').value;

  if (isNaN(value)) {
    showError('uc-result', 'Enter a valid numeric value.');
    return;
  }

  if (UNIT_CONVERTER_NON_NEGATIVE_CATEGORIES.includes(category) && value < 0) {
    showError('uc-result', 'This category represents a physical quantity that cannot be negative.');
    return;
  }

  let warning = '';
  if (category === 'temperature') {
    const celsiusEquivalent = convertUnit('temperature', value, fromUnit, 'C');
    if (celsiusEquivalent < -273.15) {
      warning = '<div class="hint">Warning: this value is below absolute zero.</div>';
    }
  }

  try {
    const result = convertUnit(category, value, fromUnit, toUnit);
    const fromLabel = UNIT_CONVERTER_LABELS[category][fromUnit];
    const toLabel = UNIT_CONVERTER_LABELS[category][toUnit];

    document.getElementById('uc-result').innerHTML = `
      <div class="headline">${result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
      <div>${value} ${fromLabel} = ${result.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${toLabel}</div>
      ${warning}
    `;
  } catch (err) {
    showError('uc-result', err.message);
  }
});

// --- FFMI (Fat-Free Mass Index) calculator ---
document.getElementById('ffmi-calc').addEventListener('click', () => {
  const weightRaw = parseFloat(document.getElementById('ffmi-weight').value);
  const weightUnit = document.getElementById('ffmi-weight-unit').value;
  const heightRaw = parseFloat(document.getElementById('ffmi-height').value);
  const heightUnit = document.getElementById('ffmi-height-unit').value;
  const bodyFat = parseFloat(document.getElementById('ffmi-bodyfat').value);

  if (isNaN(weightRaw) || weightRaw <= 0) {
    showError('ffmi-result', 'Enter a valid weight greater than zero.');
    return;
  }

  if (isNaN(heightRaw) || heightRaw <= 0) {
    showError('ffmi-result', 'Enter a valid height greater than zero.');
    return;
  }

  const weightKg = weightUnit === 'lb' ? weightRaw * 0.45359237 : weightRaw;
  const heightM = heightUnit === 'cm' ? heightRaw / 100 : heightRaw;

  try {
    const { fatFreeMass, rawFFMI, normalizedFFMI } = ffmi(weightKg, heightM, bodyFat);
    const category = ffmiCategory(normalizedFFMI);

    document.getElementById('ffmi-result').innerHTML = `
      <div class="headline">FFMI ${normalizedFFMI.toFixed(1)}</div>
      <div>${category}</div>
      <div class="hint">Raw FFMI: ${rawFFMI.toFixed(1)} &middot; Fat-free mass: ${fatFreeMass.toFixed(1)} kg</div>
    `;
  } catch (err) {
    showError('ffmi-result', err.message);
  }
});

// --- Lean Body Mass calculator ---
document.getElementById('lbm-method').addEventListener('change', (e) => {
  const isBoer = e.target.value === 'boer';
  document.getElementById('lbm-bodyfat-fields').hidden = isBoer;
  document.getElementById('lbm-boer-fields').hidden = !isBoer;
});

document.getElementById('lbm-calc').addEventListener('click', () => {
  const weight = parseFloat(document.getElementById('lbm-weight').value);
  const method = document.getElementById('lbm-method').value;

  if (isNaN(weight) || weight <= 0) {
    showError('lbm-result', 'Enter a valid weight greater than zero.');
    return;
  }

  try {
    let lbm;
    if (method === 'bodyfat') {
      const bodyFat = parseFloat(document.getElementById('lbm-bodyfat').value);
      lbm = leanBodyMassFromBodyFat(weight, bodyFat);
    } else {
      const height = parseFloat(document.getElementById('lbm-height').value);
      const sex = document.getElementById('lbm-sex').value;
      lbm = leanBodyMassBoer(weight, height, sex);
    }

    document.getElementById('lbm-result').innerHTML = `
      <div class="headline">${lbm.toFixed(1)} kg</div>
      <div>Lean body mass (${(lbm / 0.45359237).toFixed(1)} lb)</div>
    `;
  } catch (err) {
    showError('lbm-result', err.message);
  }
});

// --- Body-fat percentage estimator (US Navy method) ---
document.getElementById('bf-sex').addEventListener('change', (e) => {
  document.getElementById('bf-hip-field').hidden = e.target.value !== 'female';
});

document.getElementById('bf-calc').addEventListener('click', () => {
  const sex = document.getElementById('bf-sex').value;
  const unit = document.getElementById('bf-unit').value;
  const heightRaw = parseFloat(document.getElementById('bf-height').value);
  const neckRaw = parseFloat(document.getElementById('bf-neck').value);
  const waistRaw = parseFloat(document.getElementById('bf-waist').value);
  const hipRaw = parseFloat(document.getElementById('bf-hip').value);

  const toInches = value => (unit === 'cm' ? value / 2.54 : value);
  const heightIn = toInches(heightRaw);
  const neckIn = toInches(neckRaw);
  const waistIn = toInches(waistRaw);
  const hipIn = isNaN(hipRaw) ? undefined : toInches(hipRaw);

  try {
    const bodyFat = navyBodyFatPercent(sex, heightIn, neckIn, waistIn, hipIn);

    const rangeNote = (bodyFat < 2 || bodyFat > 60)
      ? '<div class="hint">This result is outside a typical plausible range; the tape method is an estimate with roughly &plusmn;3-4% accuracy.</div>'
      : '';

    document.getElementById('bf-result').innerHTML = `
      <div class="headline">${bodyFat.toFixed(1)}%</div>
      <div>Estimated body fat percentage (US Navy method)</div>
      ${rangeNote}
    `;
  } catch (err) {
    showError('bf-result', err.message);
  }
});

// --- TDEE (Total Daily Energy Expenditure) calculator ---
document.getElementById('tdee-calc').addEventListener('click', () => {
  const sex = document.getElementById('tdee-sex').value;
  const weight = parseFloat(document.getElementById('tdee-weight').value);
  const height = parseFloat(document.getElementById('tdee-height').value);
  const age = parseFloat(document.getElementById('tdee-age').value);
  const activity = document.getElementById('tdee-activity').value;

  if (age < 15 || age > 100) {
    showError('tdee-result', 'The Mifflin-St Jeor equation is validated for ages roughly 15-100; enter an age in that range.');
    return;
  }

  try {
    const bmr = bmrMifflinStJeor(weight, height, age, sex);
    const tdee = tdeeFromBmr(bmr, activity);

    document.getElementById('tdee-result').innerHTML = `
      <div class="headline">${Math.round(tdee).toLocaleString()} kcal/day</div>
      <div>Estimated TDEE (maintenance calories)</div>
      <div class="hint">BMR: ${Math.round(bmr).toLocaleString()} kcal/day</div>
    `;
  } catch (err) {
    showError('tdee-result', err.message);
  }
});

// --- Macro calculator ---
document.getElementById('macro-calc').addEventListener('click', () => {
  const kcal = parseFloat(document.getElementById('macro-kcal').value);
  const protein = parseFloat(document.getElementById('macro-protein').value);
  const carb = parseFloat(document.getElementById('macro-carb').value);
  const fat = parseFloat(document.getElementById('macro-fat').value);

  if (isNaN(kcal) || isNaN(protein) || isNaN(carb) || isNaN(fat)) {
    showError('macro-result', 'Enter a valid calorie target and all three macro percentages.');
    return;
  }

  try {
    const { proteinG, carbG, fatG } = macroGrams(kcal, protein, carb, fat);

    document.getElementById('macro-result').innerHTML = `
      <table>
        <thead><tr><th>Macro</th><th>Grams/day</th></tr></thead>
        <tbody>
          <tr><td>Protein (${protein}%)</td><td>${proteinG.toFixed(1)} g</td></tr>
          <tr><td>Carbohydrate (${carb}%)</td><td>${carbG.toFixed(1)} g</td></tr>
          <tr><td>Fat (${fat}%)</td><td>${fatG.toFixed(1)} g</td></tr>
        </tbody>
      </table>
    `;
  } catch (err) {
    showError('macro-result', err.message);
  }
});

// --- Weight-loss timeline calculator ---
document.getElementById('wlt-calc').addEventListener('click', () => {
  const unit = document.getElementById('wlt-unit').value;
  const current = parseFloat(document.getElementById('wlt-current').value);
  const goal = parseFloat(document.getElementById('wlt-goal').value);
  const deficit = parseFloat(document.getElementById('wlt-deficit').value);

  try {
    const { weightToLose, daysNeeded, weeksNeeded } = weightLossTimeline(current, goal, deficit, unit);

    let note = '';
    if (deficit > 1500) {
      note = '<div class="hint">A deficit this large is difficult for most people to sustain safely; consider a more moderate target.</div>';
    } else if (daysNeeded > 365 * 2) {
      note = '<div class="hint">This deficit produces an especially long timeline; a slightly larger (but still sustainable) deficit may be more practical.</div>';
    }

    document.getElementById('wlt-result').innerHTML = `
      <div class="headline">${Math.round(daysNeeded).toLocaleString()} days (&asymp;${weeksNeeded.toFixed(1)} weeks)</div>
      <div>To lose ${weightToLose.toLocaleString()} ${unit} at a ${deficit.toLocaleString()} kcal/day deficit</div>
      ${note}
    `;
  } catch (err) {
    showError('wlt-result', err.message);
  }
});

// --- Bulking calorie calculator ---
document.getElementById('bulk-pace').addEventListener('change', (e) => {
  document.getElementById('bulk-custom-field').hidden = e.target.value !== 'custom';
});

document.getElementById('bulk-calc').addEventListener('click', () => {
  const tdee = parseFloat(document.getElementById('bulk-tdee').value);
  const pace = document.getElementById('bulk-pace').value;

  const surplusFraction = pace === 'custom'
    ? parseFloat(document.getElementById('bulk-custom-pct').value) / 100
    : BULK_PACE_SURPLUS[pace];

  if (surplusFraction === undefined || isNaN(surplusFraction)) {
    showError('bulk-result', 'Select a bulk pace, or enter a valid custom surplus percentage.');
    return;
  }

  try {
    const target = bulkCalories(tdee, surplusFraction);

    document.getElementById('bulk-result').innerHTML = `
      <div class="headline">${Math.round(target).toLocaleString()} kcal/day</div>
      <div>${(surplusFraction * 100).toFixed(0)}% surplus above a ${Math.round(tdee).toLocaleString()} kcal/day TDEE</div>
    `;
  } catch (err) {
    showError('bulk-result', err.message);
  }
});

// --- Running pace calculator ---
document.getElementById('pace-solve-for').addEventListener('change', (e) => {
  const solveFor = e.target.value;
  document.getElementById('pace-distance-fields').hidden = solveFor === 'distance';
  document.getElementById('pace-time-fields').hidden = solveFor === 'time';
  document.getElementById('pace-pace-fields').hidden = solveFor === 'pace';
});

function formatPace(paceSeconds) {
  const totalSeconds = Math.round(paceSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

document.getElementById('pace-calc').addEventListener('click', () => {
  const solveFor = document.getElementById('pace-solve-for').value;

  try {
    if (solveFor === 'pace') {
      const distanceRaw = parseFloat(document.getElementById('pace-distance').value);
      const distanceUnit = document.getElementById('pace-distance-unit').value;
      const time = readHMSFields('pace-time-h', 'pace-time-m', 'pace-time-s');
      const timeSeconds = timeToSeconds(time.hours, time.minutes, time.seconds);
      const distanceKm = distanceUnit === 'mi' ? distanceRaw * KM_PER_MILE : distanceRaw;

      const paceSecPerKm = paceFromDistanceTime(distanceKm, timeSeconds);
      const paceSecPerMile = convertPacePerUnit(paceSecPerKm, 'km', 'mi');

      document.getElementById('pace-result').innerHTML = `
        <div class="headline">${formatPace(paceSecPerKm)} min/km</div>
        <div>${formatPace(paceSecPerMile)} min/mile</div>
      `;
    } else if (solveFor === 'time') {
      const distanceRaw = parseFloat(document.getElementById('pace-distance').value);
      const distanceUnit = document.getElementById('pace-distance-unit').value;
      const distanceKm = distanceUnit === 'mi' ? distanceRaw * KM_PER_MILE : distanceRaw;

      const paceMinutes = parseFloat(document.getElementById('pace-pace-m').value);
      const paceSecondsRaw = document.getElementById('pace-pace-s').value;
      const paceUnit = document.getElementById('pace-pace-unit').value;
      const paceSecondsPart = paceSecondsRaw === '' ? 0 : parseFloat(paceSecondsRaw);
      const paceInUnit = timeToSeconds(0, paceMinutes, paceSecondsPart);
      const paceSecPerKm = paceUnit === 'mi' ? convertPacePerUnit(paceInUnit, 'mi', 'km') : paceInUnit;

      const timeSeconds = timeFromDistancePace(distanceKm, paceSecPerKm);

      document.getElementById('pace-result').innerHTML = `
        <div class="headline">${formatHMS(secondsToHMS(timeSeconds))}</div>
        <div>Total time</div>
      `;
    } else {
      const time = readHMSFields('pace-time-h', 'pace-time-m', 'pace-time-s');
      const timeSeconds = timeToSeconds(time.hours, time.minutes, time.seconds);

      const paceMinutes = parseFloat(document.getElementById('pace-pace-m').value);
      const paceSecondsRaw = document.getElementById('pace-pace-s').value;
      const paceUnit = document.getElementById('pace-pace-unit').value;
      const paceSecondsPart = paceSecondsRaw === '' ? 0 : parseFloat(paceSecondsRaw);
      const paceInUnit = timeToSeconds(0, paceMinutes, paceSecondsPart);
      const paceSecPerKm = paceUnit === 'mi' ? convertPacePerUnit(paceInUnit, 'mi', 'km') : paceInUnit;

      const distanceKm = distanceFromTimePace(timeSeconds, paceSecPerKm);

      document.getElementById('pace-result').innerHTML = `
        <div class="headline">${distanceKm.toFixed(2)} km</div>
        <div>${(distanceKm / KM_PER_MILE).toFixed(2)} miles</div>
      `;
    }
  } catch (err) {
    showError('pace-result', err.message);
  }
});

// --- Paint calculator ---
document.getElementById('paint-calc').addEventListener('click', () => {
  const wallArea = parseFloat(document.getElementById('paint-wall-area').value);
  const doorCount = parseFloat(document.getElementById('paint-door-count').value) || 0;
  const doorArea = parseFloat(document.getElementById('paint-door-area').value) || 0;
  const windowCount = parseFloat(document.getElementById('paint-window-count').value) || 0;
  const windowArea = parseFloat(document.getElementById('paint-window-area').value) || 0;
  const coats = parseFloat(document.getElementById('paint-coats').value);
  const coverage = parseFloat(document.getElementById('paint-coverage').value);
  const canSize = parseFloat(document.getElementById('paint-can-size').value);

  try {
    const { paintableArea, totalAreaToPaint, volumeNeeded } = paintNeeded(
      wallArea, doorCount, doorArea, windowCount, windowArea, coats, coverage
    );
    const { cansNeeded, totalVolume } = roundUpToCans(volumeNeeded, canSize);

    const coatsNote = coats > 10 ? '<div class="hint">That\'s an unusually high number of coats &mdash; double-check this is intentional.</div>' : '';

    document.getElementById('paint-result').innerHTML = `
      <div class="headline">${volumeNeeded.toFixed(2)} L needed &middot; buy ${cansNeeded} &times; ${canSize} L (${totalVolume} L)</div>
      <div>Paintable area: ${paintableArea.toFixed(2)} m&sup2; &middot; Total area across ${coats} coat${coats === 1 ? '' : 's'}: ${totalAreaToPaint.toFixed(2)} m&sup2;</div>
      ${coatsNote}
    `;
  } catch (err) {
    showError('paint-result', err.message);
  }
});

// --- Wallpaper calculator ---
document.getElementById('wp-calc').addEventListener('click', () => {
  const length = parseFloat(document.getElementById('wp-length').value);
  const width = parseFloat(document.getElementById('wp-width').value);
  const wallHeight = parseFloat(document.getElementById('wp-height').value);
  const rollWidth = parseFloat(document.getElementById('wp-roll-width').value);
  const rollLength = parseFloat(document.getElementById('wp-roll-length').value);
  const patternRepeat = parseFloat(document.getElementById('wp-pattern-repeat').value) || 0;
  const waste = parseFloat(document.getElementById('wp-waste').value);

  if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
    showError('wp-result', 'Enter valid room length and width greater than zero.');
    return;
  }

  const perimeter = 2 * (length + width);

  try {
    const { numberOfStrips, effectiveDrop, stripsPerRoll, rollsNeeded, rollsWithWaste } =
      wallpaperRollsNeeded(perimeter, wallHeight, rollWidth, rollLength, patternRepeat, waste);

    document.getElementById('wp-result').innerHTML = `
      <div class="headline">${rollsWithWaste} rolls (with ${waste}% waste)</div>
      <div>${rollsNeeded} rolls before waste allowance</div>
      <div class="hint">Perimeter: ${perimeter.toFixed(2)} m &middot; Strips needed: ${numberOfStrips} &middot; Effective drop per strip: ${effectiveDrop.toFixed(2)} m &middot; Strips per roll: ${stripsPerRoll}</div>
    `;
  } catch (err) {
    showError('wp-result', err.message);
  }
});

// --- Flooring calculator ---
document.getElementById('floor-calc').addEventListener('click', () => {
  const length = parseFloat(document.getElementById('floor-length').value);
  const width = parseFloat(document.getElementById('floor-width').value);
  const waste = parseFloat(document.getElementById('floor-waste').value);
  const boxCoverage = parseFloat(document.getElementById('floor-box-coverage').value);

  if (isNaN(length) || length <= 0 || isNaN(width) || width <= 0) {
    showError('floor-result', 'Enter valid room length and width greater than zero.');
    return;
  }

  const area = length * width;

  try {
    const { areaWithWaste, boxesNeeded, totalPurchasedArea } = flooringNeeded(area, waste, boxCoverage);

    const wasteNote = waste > 100
      ? '<div class="hint">That\'s an unusually high waste percentage &mdash; double-check this is intentional.</div>'
      : '';

    document.getElementById('floor-result').innerHTML = `
      <div class="headline">${boxesNeeded} boxes</div>
      <div>Room area: ${area.toFixed(2)} m&sup2; &middot; Area with waste: ${areaWithWaste.toFixed(2)} m&sup2;</div>
      <div class="hint">Total material purchased: ${totalPurchasedArea.toFixed(2)} m&sup2;</div>
      ${wasteNote}
    `;
  } catch (err) {
    showError('floor-result', err.message);
  }
});

// --- Race time predictor calculator ---
document.getElementById('race-known-distance').addEventListener('change', (e) => {
  document.getElementById('race-known-custom-field').hidden = e.target.value !== 'custom';
});
document.getElementById('race-target-distance').addEventListener('change', (e) => {
  document.getElementById('race-target-custom-field').hidden = e.target.value !== 'custom';
});

document.getElementById('race-calc').addEventListener('click', () => {
  const knownDistanceSelect = document.getElementById('race-known-distance').value;
  const targetDistanceSelect = document.getElementById('race-target-distance').value;

  const knownDistanceKm = knownDistanceSelect === 'custom'
    ? parseFloat(document.getElementById('race-known-custom').value)
    : parseFloat(knownDistanceSelect);
  const targetDistanceKm = targetDistanceSelect === 'custom'
    ? parseFloat(document.getElementById('race-target-custom').value)
    : parseFloat(targetDistanceSelect);

  const knownTime = readHMSFields('race-known-time-h', 'race-known-time-m', 'race-known-time-s');

  try {
    const knownTimeSeconds = timeToSeconds(knownTime.hours, knownTime.minutes, knownTime.seconds);
    const predictedSeconds = riegelPredictedTime(knownTimeSeconds, knownDistanceKm, targetDistanceKm);
    const predictedPaceSecPerKm = paceFromDistanceTime(targetDistanceKm, predictedSeconds);

    const ratio = targetDistanceKm / knownDistanceKm;
    const extremeNote = (ratio > 10 || ratio < 0.1)
      ? '<div class="hint">This is a large distance ratio; the Riegel model loses accuracy far outside the known distance\'s neighborhood, so treat this as a rough estimate.</div>'
      : '';

    document.getElementById('race-result').innerHTML = `
      <div class="headline">${formatHMS(secondsToHMS(predictedSeconds))}</div>
      <div>Predicted pace: ${formatPace(predictedPaceSecPerKm)} min/km</div>
      ${extremeNote}
    `;
  } catch (err) {
    showError('race-result', err.message);
  }
});

// --- Tile calculator ---
document.getElementById('tile-calc').addEventListener('click', () => {
  const area = parseFloat(document.getElementById('tile-area').value);
  const tileWidthMm = parseFloat(document.getElementById('tile-width').value);
  const tileLengthMm = parseFloat(document.getElementById('tile-length').value);
  const groutMm = parseFloat(document.getElementById('tile-grout').value);
  const waste = parseFloat(document.getElementById('tile-waste').value);

  try {
    const { effectiveArea, tilesForArea, tilesNeededCount } = tilesNeeded(
      area, tileWidthMm / 1000, tileLengthMm / 1000, groutMm / 1000, waste
    );

    document.getElementById('tile-result').innerHTML = `
      <div class="headline">${tilesNeededCount} tiles</div>
      <div>Raw tiles needed (before waste): ${tilesForArea.toFixed(1)}</div>
      <div class="hint">Effective (grout-inclusive) tile area: ${(effectiveArea * 1e6).toFixed(0)} mm&sup2;</div>
    `;
  } catch (err) {
    showError('tile-result', err.message);
  }
});

// --- Concrete calculator ---
document.getElementById('concrete-shape').addEventListener('change', (e) => {
  const isCylindrical = e.target.value === 'cylindrical';
  document.getElementById('concrete-rectangular-fields').hidden = isCylindrical;
  document.getElementById('concrete-cylindrical-fields').hidden = !isCylindrical;
});

document.getElementById('concrete-calc').addEventListener('click', () => {
  const shape = document.getElementById('concrete-shape').value;
  const waste = parseFloat(document.getElementById('concrete-waste').value);
  const yieldPerBag = parseFloat(document.getElementById('concrete-bag-size').value);

  try {
    let volume;
    if (shape === 'cylindrical') {
      const diameter = parseFloat(document.getElementById('concrete-diameter').value) / 100;
      const height = parseFloat(document.getElementById('concrete-height').value);
      volume = cylindricalConcreteVolume(diameter, height);
    } else {
      const length = parseFloat(document.getElementById('concrete-length').value);
      const width = parseFloat(document.getElementById('concrete-width').value);
      const thickness = parseFloat(document.getElementById('concrete-thickness').value) / 100;
      volume = rectangularConcreteVolume(length, width, thickness);
    }

    const { volumeWithWaste, bagsNeeded } = concreteBagsNeeded(volume, waste, yieldPerBag);

    document.getElementById('concrete-result').innerHTML = `
      <div class="headline">${bagsNeeded} bags</div>
      <div>Volume: ${volume.toFixed(3)} m&sup3; &middot; With ${waste}% waste: ${volumeWithWaste.toFixed(3)} m&sup3;</div>
      <div class="hint">Ready-mix equivalent: ${volumeWithWaste.toFixed(2)} m&sup3; (${(volumeWithWaste * 1.30795).toFixed(2)} cu yd)</div>
    `;
  } catch (err) {
    showError('concrete-result', err.message);
  }
});

// --- Heart-rate training zone calculator ---
document.getElementById('hr-calc').addEventListener('click', () => {
  const age = parseFloat(document.getElementById('hr-age').value);
  const restingHr = parseFloat(document.getElementById('hr-resting').value);
  const maxHrRaw = document.getElementById('hr-max-override').value;
  const maxHrOverride = maxHrRaw === '' ? undefined : parseFloat(maxHrRaw);

  const ageNote = (age < 10 || age > 100)
    ? '<div class="hint">The 220&minus;age MaxHR estimate isn\'t well validated outside typical adult ages; consider entering a measured max HR instead.</div>'
    : '';

  try {
    const { maxHr, hrr, zones } = karvonenZones(age, restingHr, maxHrOverride);

    const rows = zones
      .map(z => `<tr><td>${z.zone}. ${z.label}</td><td>${Math.round(z.lowerBpm)}&ndash;${Math.round(z.upperBpm)} bpm</td></tr>`)
      .join('');

    document.getElementById('hr-result').innerHTML = `
      <div class="headline">MaxHR ${maxHr} bpm &middot; HRR ${hrr} bpm</div>
      <table>
        <thead><tr><th>Zone</th><th>Target HR</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${ageNote}
    `;
  } catch (err) {
    showError('hr-result', err.message);
  }
});

// --- Sleep cycle calculator ---
document.getElementById('sleep-mode').addEventListener('change', (e) => {
  document.getElementById('sleep-time-label').textContent = e.target.value === 'bed' ? 'Bedtime' : 'Wake-up time';
});

document.getElementById('sleep-calc').addEventListener('click', () => {
  const mode = document.getElementById('sleep-mode').value;
  const timeRaw = document.getElementById('sleep-time').value;
  const buffer = parseFloat(document.getElementById('sleep-buffer').value);

  if (!timeRaw) {
    showError('sleep-result', 'Enter a valid time.');
    return;
  }

  const [hours, minutes] = timeRaw.split(':').map(Number);
  const timeMinutes = hours * 60 + minutes;

  try {
    let rows;
    let headingLabel;
    if (mode === 'bed') {
      const results = wakeTimesForBedtime(timeMinutes, buffer);
      headingLabel = 'Wake-up time';
      rows = results.map(r => `<tr><td>${minutesToTimeLabel(r.wakeMinutes)}</td><td>${r.cycles} cycles</td><td>${(r.sleepMinutes / 60).toFixed(1)}h</td></tr>`).join('');
    } else {
      const results = bedtimesForWakeTime(timeMinutes, buffer);
      headingLabel = 'Bedtime';
      rows = results.map(r => `<tr><td>${minutesToTimeLabel(r.bedtimeMinutes)}</td><td>${r.cycles} cycles</td><td>${(r.sleepMinutes / 60).toFixed(1)}h</td></tr>`).join('');
    }

    document.getElementById('sleep-result').innerHTML = `
      <table>
        <thead><tr><th>${headingLabel}</th><th>Sleep cycles</th><th>Sleep duration</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="hint">Falling asleep is assumed to take ${buffer} minute${buffer === 1 ? '' : 's'}.</div>
    `;
  } catch (err) {
    showError('sleep-result', err.message);
  }
});

// --- VO2max estimator (Cooper 12-minute run test) ---
document.getElementById('vo2-calc').addEventListener('click', () => {
  const distance = parseFloat(document.getElementById('vo2-distance').value);
  const unit = document.getElementById('vo2-unit').value;

  if (isNaN(distance) || distance <= 0) {
    showError('vo2-result', 'Enter a valid distance greater than zero.');
    return;
  }

  const distanceMeters = unit === 'm' ? distance : convertUnit('length', distance, unit, 'm');

  try {
    const vo2max = cooperVO2max(distanceMeters);

    const extremeNote = distanceMeters > 4000
      ? '<div class="hint">This distance is faster than world-record 12-minute-run pace; treat this estimate with caution.</div>'
      : '';

    document.getElementById('vo2-result').innerHTML = `
      <div class="headline">${vo2max.toFixed(1)} mL/kg/min</div>
      <div>Estimated VO2max (Cooper 12-minute run test)</div>
      ${extremeNote}
    `;
  } catch (err) {
    showError('vo2-result', err.message);
  }
});

// --- Daily water intake calculator ---
document.getElementById('water-calc').addEventListener('click', () => {
  const weightRaw = parseFloat(document.getElementById('water-weight').value);
  const unit = document.getElementById('water-unit').value;
  const activity = document.getElementById('water-activity').value;
  const climate = document.getElementById('water-climate').value;

  const weightKg = unit === 'lb' ? weightRaw / 2.20462 : weightRaw;

  try {
    const { totalIntakeMl } = dailyWaterIntake(weightKg, activity, climate);

    document.getElementById('water-result').innerHTML = `
      <div class="headline">${(totalIntakeMl / 1000).toFixed(1)} L / day</div>
      <div>${Math.round(totalIntakeMl).toLocaleString()} mL per day</div>
      <div class="hint">A general wellness estimate, not medical advice &mdash; those with kidney, heart, or other conditions affecting fluid balance should follow their healthcare provider's guidance.</div>
    `;
  } catch (err) {
    showError('water-result', err.message);
  }
});

// --- Caffeine half-life calculator ---
document.getElementById('caf-preset').addEventListener('change', (e) => {
  if (e.target.value) {
    document.getElementById('caf-dose').value = e.target.value;
  }
});

document.getElementById('caf-calc').addEventListener('click', () => {
  const dose = parseFloat(document.getElementById('caf-dose').value);
  const elapsed = parseFloat(document.getElementById('caf-elapsed').value);
  const halfLifeRaw = document.getElementById('caf-halflife').value;
  const halfLife = halfLifeRaw === '' ? 5 : parseFloat(halfLifeRaw);

  try {
    const remaining = caffeineRemaining(dose, elapsed, halfLife);

    const futureRows = [1, 2, 3, 4, 5, 6, 8, 10, 12]
      .map(h => `<tr><td>+${h}h</td><td>${caffeineRemaining(dose, elapsed + h, halfLife).toFixed(1)} mg</td></tr>`)
      .join('');

    document.getElementById('caf-result').innerHTML = `
      <div class="headline">${remaining.toFixed(1)} mg still active</div>
      <div>${dose} mg consumed, ${elapsed}h ago, ${halfLife}h half-life</div>
      <table>
        <thead><tr><th>From now</th><th>Remaining</th></tr></thead>
        <tbody>${futureRows}</tbody>
      </table>
      <div class="hint">A simplified population-average model for general awareness, not a medical tool &mdash; actual caffeine metabolism varies significantly by individual.</div>
    `;
  } catch (err) {
    showError('caf-result', err.message);
  }
});

// --- Gravel calculator ---
document.getElementById('gravel-calc').addEventListener('click', () => {
  const area = parseFloat(document.getElementById('gravel-area').value);
  const depthCm = parseFloat(document.getElementById('gravel-depth').value);
  const density = parseFloat(document.getElementById('gravel-density').value);
  const waste = parseFloat(document.getElementById('gravel-waste').value);

  const depthNote = depthCm > 100
    ? '<div class="hint">That\'s an unusually deep gravel layer (over 1m) &mdash; double-check you didn\'t mean a smaller unit.</div>'
    : '';

  try {
    const { volume, volumeWithWaste, weight } = gravelNeeded(area, depthCm / 100, density, waste);

    document.getElementById('gravel-result').innerHTML = `
      <div class="headline">${weight.toFixed(2)} tonnes</div>
      <div>Volume: ${volume.toFixed(3)} m&sup3; &middot; With waste allowance: ${volumeWithWaste.toFixed(3)} m&sup3;</div>
      ${depthNote}
    `;
  } catch (err) {
    showError('gravel-result', err.message);
  }
});

// --- Blood alcohol content (BAC) calculator ---
document.getElementById('bac-mode').addEventListener('change', (e) => {
  const isVolume = e.target.value === 'volume';
  document.getElementById('bac-count-field').hidden = isVolume;
  document.getElementById('bac-volume-fields').hidden = !isVolume;
});

document.getElementById('bac-calc').addEventListener('click', () => {
  const weight = parseFloat(document.getElementById('bac-weight').value);
  const sex = document.getElementById('bac-sex').value;
  const mode = document.getElementById('bac-mode').value;
  const hours = parseFloat(document.getElementById('bac-hours').value);

  try {
    const alcoholGrams = mode === 'volume'
      ? alcoholGramsFromVolume(parseFloat(document.getElementById('bac-volume').value), parseFloat(document.getElementById('bac-abv').value))
      : alcoholGramsFromDrinkCount(parseFloat(document.getElementById('bac-drink-count').value));

    const bac = widmarkBAC(alcoholGrams, weight, sex, hours);

    const label = bac === 0
      ? 'No estimated alcohol remaining'
      : bac < 0.08
        ? 'Below the typical 0.08% legal limit'
        : 'At or above the typical 0.08% legal limit';

    document.getElementById('bac-result').innerHTML = `
      <div class="headline">${bac.toFixed(3)}%</div>
      <div>${label}</div>
      <div class="hint">Entertainment/educational estimate only &mdash; not a measurement of your actual BAC. Never drive after drinking.</div>
    `;
  } catch (err) {
    showError('bac-result', err.message);
  }
});

// --- Cycling FTP calculator ---
document.getElementById('ftp-calc').addEventListener('click', () => {
  const power = parseFloat(document.getElementById('ftp-power').value);

  try {
    const ftp = estimateFTP(power);
    const zones = ftpPowerZones(ftp);

    const rows = zones
      .map(z => `<tr><td>${z.zone}. ${z.label}</td><td>${z.upperWatts === null ? `${z.lowerWatts}+ W` : `${z.lowerWatts}&ndash;${z.upperWatts} W`}</td></tr>`)
      .join('');

    const sanityNote = (power < 50 || power > 600)
      ? '<div class="hint">This power output is outside the typical range for most riders; treat the estimate accordingly.</div>'
      : '';

    document.getElementById('ftp-result').innerHTML = `
      <div class="headline">FTP: ${Math.round(ftp)} W</div>
      <table>
        <thead><tr><th>Zone</th><th>Power range</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${sanityNote}
    `;
  } catch (err) {
    showError('ftp-result', err.message);
  }
});
