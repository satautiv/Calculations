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
