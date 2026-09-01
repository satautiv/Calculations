// --- Internationalization: language selector + translation lookup ---
//
// Translations are keyed by the literal English source text rendered in
// index.html, not by abstract keys — this lets 129 existing calculator
// panels be translated without editing their markup. A locale file (e.g.
// js/i18n/es.js) registers its dictionary via registerTranslations(code, {
//   "Calculate": "Calcular", ...
// }). Add new languages here as their locale files land.
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'fr', name: 'Français' },
  { code: 'zh', name: '中文' },
];

const I18N_STORAGE_KEY = 'calc-suite-lang';
const translations = {};
let currentLanguage = 'en';

function registerTranslations(code, dict) {
  translations[code] = Object.assign(translations[code] || {}, dict);
}

function isSupportedLanguage(code) {
  return SUPPORTED_LANGUAGES.some(l => l.code === code);
}

// Looks up `text` (an English source string) in the active language's
// dictionary, falling back to the English text itself when untranslated.
function t(text) {
  const dict = translations[currentLanguage];
  return (dict && dict[text]) || text;
}

function detectBrowserLanguage() {
  const candidates = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const short = candidate.slice(0, 2).toLowerCase();
    if (isSupportedLanguage(short)) return short;
  }
  return 'en';
}

// Leaf elements (no element children) hold the actual translatable text;
// their ancestors are skipped so mixed content isn't clobbered. Anything
// inside .result is skipped too since that's calculated output written
// after the initial translation pass, not static UI chrome.
function translatableLeafElements(root) {
  const leaves = [];
  root.querySelectorAll('*').forEach(el => {
    if (el.closest('.result')) return;
    if (el.children.length === 0 && el.textContent.trim()) leaves.push(el);
  });
  return leaves;
}

function applyTranslations() {
  translatableLeafElements(document).forEach(el => {
    if (el.dataset.i18nSrc === undefined) el.dataset.i18nSrc = el.textContent;
    el.textContent = t(el.dataset.i18nSrc);
  });

  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    if (el.closest('.result')) return;
    if (el.dataset.i18nPlaceholderSrc === undefined) el.dataset.i18nPlaceholderSrc = el.getAttribute('placeholder');
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholderSrc));
  });
}

function setLanguage(code) {
  currentLanguage = isSupportedLanguage(code) ? code : 'en';
  localStorage.setItem(I18N_STORAGE_KEY, currentLanguage);
  document.documentElement.lang = currentLanguage;

  applyTranslations();
  // The calculator index is built from the registry at render time rather
  // than being static markup, so it needs a fresh render (with the current
  // search term re-applied) instead of a leaf-element translation pass.
  if (typeof renderCalculatorIndex === 'function') {
    renderCalculatorIndex();
    filterCalculatorIndex(document.getElementById('calc-search').value);
  }

  const select = document.getElementById('lang-select');
  if (select) select.value = currentLanguage;
}

function renderLanguageSelector() {
  const select = document.getElementById('lang-select');
  if (!select) return;
  select.innerHTML = SUPPORTED_LANGUAGES
    .map(l => `<option value="${l.code}">${l.name}</option>`)
    .join('');
}

function initI18n() {
  renderLanguageSelector();

  const stored = localStorage.getItem(I18N_STORAGE_KEY);
  const lang = isSupportedLanguage(stored) ? stored : detectBrowserLanguage();
  setLanguage(lang);

  const select = document.getElementById('lang-select');
  if (select) select.addEventListener('change', (e) => setLanguage(e.target.value));
}
