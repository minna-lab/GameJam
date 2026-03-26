// ☢ HORIZON — gameState.js
// État global du jeu, score, paramètres, persistence localStorage

// ═══════════════════════════════════════════════════
// SCORE MODULE
// ═══════════════════════════════════════════════════
const Score = (() => {
  const KEY = 'horizon_scores_v1';
  let _pts = 0;
  let _breakdown = {};

  function reset() { _pts = 0; _breakdown = {doors:0,items:0,docs:0,explore:0,floor_bonus:0}; }
  function get() { return _pts; }
  function add(cat, n, color) {
    _pts += n;
    _breakdown[cat] = (_breakdown[cat]||0) + n;
    if (n > 0 && color) _popupScore(n, color);
    _refreshHudScore();
  }
  function breakdown() { return {..._breakdown}; }
  function calcFinal(floor, hp, rad, items, victory) {
    let s = _pts;
    _breakdown.floor_bonus = floor * 150;
    _breakdown.hp_bonus = hp * 3;
    _breakdown.rad_penalty = -Math.floor(rad * 4);
    _breakdown.items = _breakdown.items || 0;
    _breakdown.docs = _breakdown.docs || 0;
    s += _breakdown.floor_bonus + _breakdown.hp_bonus + _breakdown.rad_penalty;
    if (victory) { _breakdown.victory = 3000; s += 3000; }
    return Math.max(0, s);
  }
  function rank(score, victory) {
    if (victory) {
      if (score >= 6000) return {l:'S', t:'Légende'};
      if (score >= 4000) return {l:'A', t:'Expert'};
      if (score >= 2200) return {l:'B', t:'Survivant'};
      return {l:'C', t:'Rescapé'};
    }
    if (score >= 1800) return {l:'B', t:'Combatif'};
    if (score >= 700)  return {l:'C', t:'Téméraire'};
    return {l:'D', t:'Oublié'};
  }
  function save(name, floor, victory, hp, rad) {
    const final = calcFinal(floor, hp, rad, 0, victory);
    const entry = {
      name, score: final, floor, victory, hp, rad,
      date: new Date().toLocaleDateString('fr-FR')
    };
    let all = load();
    all.push(entry);
    all.sort((a,b) => b.score - a.score);
    all = all.slice(0, 20);
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch(e) {}
  }
  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch(e) { return []; }
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch(e) {}
  }

  function _refreshHudScore() {
    const el = document.getElementById('hud-score-val');
    if (el) el.textContent = _pts.toLocaleString();
  }

  function _popupScore(n, color) {
    const cvPanel = document.getElementById('panel-center');
    if (!cvPanel) return;
    const d = document.createElement('div');
    d.textContent = '+' + n;
    d.style.cssText = `position:absolute;left:${40+Math.random()*120}px;top:${60+Math.random()*80}px;
      color:${color||'#b8d420'};font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.1em;
      pointer-events:none;z-index:50;animation:score-pop .9s ease forwards;`;
    cvPanel.appendChild(d);
    setTimeout(() => d.remove(), 900);
  }

  return { reset, get, add, breakdown, calcFinal, rank, save, load, clear };
})();

// ═══════════════════════════════════════════════════
// SETTINGS MODULE
// ═══════════════════════════════════════════════════
const Settings = (() => {
  const KEY = 'horizon_settings_v1';
  let S = {};
  let _fromScreen = 'home';

  const DEFAULTS = {
    grain: true, vignette: true, shake: true,
    sound: true, geigerVol: 0.6, ambientVol: 0.3,
    rad: 1, events: 1, playerName: 'Survivante'
  };

  function load() {
    try { S = {...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY))}; }
    catch(e) { S = {...DEFAULTS}; }
    _apply();
  }

  function open(from) {
    _fromScreen = from || App.getCurrent() || 'home';
    const nameEl = document.getElementById('settings-name');
    if (nameEl) nameEl.value = S.playerName || '';
    _syncUI();
  }

  function _syncUI() {
    const ids = ['grain','vignette','shake','sound'];
    ids.forEach(k => {
      const el = document.getElementById('tog-'+k);
      if (el) el.className = 'tog' + (S[k] ? ' on' : '');
    });
    const sg = document.getElementById('slider-geiger');
    if (sg) sg.value = S.geigerVol;
    const sa = document.getElementById('slider-ambient-vol');
    if (sa) sa.value = S.ambientVol;
    const sr = document.getElementById('slider-rad');
    if (sr) sr.value = S.rad;
    const se = document.getElementById('slider-events');
    if (se) se.value = S.events;
    const sn = document.getElementById('settings-name');
    if (sn) sn.value = S.playerName || '';
  }

  function _apply() {
    document.body.classList.toggle('no-grain', !S.grain);
    Audio.setEnabled(S.sound !== false);
    Audio.setGeigerVol(S.geigerVol || 0.6);
    Audio.setAmbientVol(S.ambientVol || 0.3);
  }

  function toggle(k, el) {
    S[k] = !S[k];
    el.className = 'tog' + (S[k] ? ' on' : '');
    _apply();
  }

  function saveName() {
    const v = document.getElementById('settings-name').value.trim();
    if (v) { S.playerName = v; syncNameDisplays(); }
  }

  function syncNameDisplays() {
    ['player-name','settings-name'].forEach(id => {
      const e = document.getElementById(id);
      if (e && S.playerName) e.value = S.playerName;
    });
  }

  function save() {
    const nm = document.getElementById('settings-name').value.trim();
    if (nm) S.playerName = nm;
    S.geigerVol  = parseFloat(document.getElementById('slider-geiger').value);
    S.ambientVol = parseFloat(document.getElementById('slider-ambient-vol').value);
    S.rad        = parseFloat(document.getElementById('slider-rad').value);
    S.events     = parseFloat(document.getElementById('slider-events').value);
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e) {}
    _apply(); syncNameDisplays();
    App.showScreen(_fromScreen === 'game' ? 'game' : 'home');
  }

  function closeFromContext() {
    App.showScreen(_fromScreen === 'game' ? 'game' : 'home');
  }

  function setGeigerVol(v) { S.geigerVol = parseFloat(v); Audio.setGeigerVol(S.geigerVol); }
  function clearScores() {
    if (confirm('Effacer tous les scores ?')) { Score.clear(); App.updateHomePage(); }
  }
  function get(k) { return S[k]; }
  function getPlayerName() { return S.playerName || 'Survivante'; }

  return { load, open, toggle, saveName, save, setGeigerVol, clearScores, get, getPlayerName, syncNameDisplays, closeFromContext };
})();