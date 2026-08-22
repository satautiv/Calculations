// --- Tab switching ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
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

function wendlerRoundingIncrement(unit) {
  return unit === 'kg' ? 2.5 : 5;
}

function readWendlerInputs() {
  const unit = document.getElementById('wendler-unit').value;
  const tmPercent = parseFloat(document.getElementById('wendler-tm-percent').value) || 90;
  const cycle = parseInt(document.getElementById('wendler-cycle').value, 10) || 1;
  const week = parseInt(document.getElementById('wendler-week').value, 10);

  const lifts = {};
  WENDLER_DAYS.forEach(({ lift }) => {
    lifts[lift] = {
      weight: parseFloat(document.getElementById(`wendler-${lift}-weight`).value),
      reps: parseInt(document.getElementById(`wendler-${lift}-reps`).value, 10),
    };
  });

  return { unit, tmPercent, cycle, week, lifts };
}

function wendlerInputsAreValid(lifts) {
  return WENDLER_DAYS.every(({ lift }) => {
    const { weight, reps } = lifts[lift];
    return weight > 0 && reps >= 1;
  });
}

function buildWendlerDayPlans({ unit, tmPercent, cycle, lifts }, week) {
  const roundingIncrement = wendlerRoundingIncrement(unit);

  return WENDLER_DAYS.map(({ lift, label }) => {
    const { weight, reps } = lifts[lift];
    const oneRepMax = epleyOneRepMax(weight, reps);
    const baseTrainingMax = trainingMax(oneRepMax, tmPercent);
    const currentTrainingMax = projectedTrainingMax(baseTrainingMax, lift, unit, cycle);
    const sets = wendler531Sets(currentTrainingMax, week, roundingIncrement);
    return { lift, label, oneRepMax, currentTrainingMax, sets };
  });
}

function renderWendlerPlan(dayPlans, unit) {
  const summary = dayPlans.map(d => `
    <span><strong>${d.label}</strong>: TM ${d.currentTrainingMax.toFixed(1)} ${unit} (1RM ${d.oneRepMax.toFixed(1)})</span>
  `).join('');

  const dayCards = dayPlans.map(d => {
    const rows = d.sets.map(s => {
      const rowClass = s.warmup ? 'warmup-row' : (s.amrap ? 'amrap-row' : '');
      const repsLabel = s.amrap ? `${s.reps}+` : s.reps;
      return `<tr class="${rowClass}"><td>${s.percent}%</td><td>${s.weight.toFixed(1)} ${unit}</td><td>${repsLabel}</td></tr>`;
    }).join('');

    return `
      <div class="wendler-day">
        <h3>${d.label}</h3>
        <table>
          <thead><tr><th>% TM</th><th>Weight</th><th>Reps</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;
  }).join('');

  return `<div class="wendler-tm-summary">${summary}</div>${dayCards}`;
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

function exportWendlerCycleCsv(input) {
  const rows = [['Week', 'Day', 'Set Type', '% TM', 'Weight', 'Reps']];

  for (let week = 1; week <= 4; week++) {
    buildWendlerDayPlans(input, week).forEach(d => {
      d.sets.forEach(s => {
        const setType = s.warmup ? 'Warmup' : (s.amrap ? 'Work (AMRAP)' : 'Work');
        const repsLabel = s.amrap ? `${s.reps}+` : s.reps;
        rows.push([`Week ${week}`, d.label, setType, `${s.percent}%`, s.weight.toFixed(1), repsLabel]);
      });
    });
  }

  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\r\n');
  downloadFile(`531-cycle-${input.cycle}.csv`, csv, 'text/csv;charset=utf-8');
}

document.getElementById('wendler-calc').addEventListener('click', () => {
  const input = readWendlerInputs();
  const exportBtn = document.getElementById('wendler-export');

  if (!wendlerInputsAreValid(input.lifts)) {
    showError('wendler-result', 'Enter a valid weight and rep count for all four lifts.');
    exportBtn.style.display = 'none';
    return;
  }

  const dayPlans = buildWendlerDayPlans(input, input.week);
  document.getElementById('wendler-result').innerHTML = renderWendlerPlan(dayPlans, input.unit);

  exportBtn.style.display = 'block';
  exportBtn.onclick = () => exportWendlerCycleCsv(input);
});
