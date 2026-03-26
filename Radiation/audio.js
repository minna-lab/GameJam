// ☢ HORIZON — audio.js
// Sons du jeu + musique d'accueil

// ════════════════════════════════════════
// MODULE AUDIO (effets sonores du jeu)
// ════════════════════════════════════════
const Audio = (() => {
  let ctx = null;
  let geigerInterval = null;
  let geigerVol = 0.6;
  let ambientVol = 0.3;
  let enabled = true;

  function init() {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  function resume() { if (ctx?.state === 'suspended') ctx.resume(); }
  function dest()   { return ctx?.destination; }

  // ── Primitives ──────────────────────────────────────────────────────
  function osc(freq, dur, vol, type = 'sine', detune = 0, delay = 0) {
    if (!ctx || !enabled) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest());
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      if (detune) o.detune.value = detune;
      g.gain.setValueAtTime(0, ctx.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur + 0.05);
    } catch(e) {}
  }

  function sweep(f0, f1, dur, vol, type = 'sine', delay = 0) {
    if (!ctx || !enabled) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(dest());
      o.type = type;
      o.frequency.setValueAtTime(f0, ctx.currentTime + delay);
      o.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime + delay + dur);
      g.gain.setValueAtTime(vol, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + dur + 0.05);
    } catch(e) {}
  }

  function noise(dur, vol, center = 2000, q = 2, delay = 0) {
    if (!ctx || !enabled) return;
    try {
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource(), g = ctx.createGain();
      const f   = ctx.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = center; f.Q.value = q;
      src.buffer = buf; src.connect(f); f.connect(g); g.connect(dest());
      g.gain.setValueAtTime(vol, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
      src.start(ctx.currentTime + delay);
    } catch(e) {}
  }

  // ── Sons de ramassage ───────────────────────────────────────────────
  function pickConsumable() { osc(880,.06,.18); osc(1100,.04,.12,'sine',0,.05); noise(.04,.08,2000,3,.02); }
  function pickEquipment()  { noise(.15,.25,1000,1.5); osc(220,.1,.2,'square',0,.08); osc(440,.06,.12,'sine',0,.18); }
  function pickDoc()        { noise(.12,.18,3500,4); noise(.08,.1,4800,6,.06); osc(180,.4,.07,'sine',0,.12); }
  function pickKey()        { osc(1200,.04,.2,'square'); osc(1600,.04,.15,'square',0,.06); osc(1000,.08,.1,'sine',0,.1); }
  function pickGeneric()    { osc(660,.1,.16); osc(880,.07,.12,'sine',0,.04); }

  // ── Degats ──────────────────────────────────────────────────────────
  function dmgPhysical() { noise(.08,.3,700,1.2); osc(80,.25,.35,'sawtooth',-300); osc(120,.15,.2,'square',0,.05); }
  function dmgRad()      { noise(.3,.2,1200,1.5); osc(60,.4,.25,'sawtooth',400); osc(90,.3,.2,'sawtooth',-200,.1); osc(45,.5,.15,'sine',0,.05); }

  // ── Radiation ───────────────────────────────────────────────────────
  function radLow()  { noise(.025, .12 * geigerVol, 2200, 2.5); }
  function radMed()  { noise(.03,  .20 * geigerVol, 2000, 3); osc(440,.06,.06,'square',0,.02); }
  function radCrit() { noise(.06,  .35 * geigerVol, 2500, 2); osc(880,.08,.18,'square'); osc(660,.12,.15,'sawtooth',0,.08); noise(.04,.2*geigerVol,3800,4,.1); }

  // ── Danger ──────────────────────────────────────────────────────────
  function danger()      { sweep(600,180,.5,.3,'sawtooth'); sweep(580,160,.5,.2,'square',.03); noise(.2,.12,900,1.5,.1); }
  function fearStinger() { sweep(3200,400,.12,.25,'square'); noise(.08,.2,5000,2); sweep(200,50,.6,.18,'sine',.15); }

  function drone(intens) {
    if (!ctx || !enabled) return;
    try {
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      const g  = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
      o1.connect(g); o2.connect(g); g.connect(dest());
      lfo.connect(lg); lg.connect(g.gain);
      o1.type = 'sawtooth'; o1.frequency.value = 55;
      o2.type = 'sawtooth'; o2.frequency.value = 57.5;
      lfo.type = 'sine'; lfo.frequency.value = 3.5 + intens * 4;
      lg.gain.value = intens * .06;
      g.gain.setValueAtTime(intens * .12 * ambientVol, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5);
      o1.start(); o2.start(); lfo.start();
      o1.stop(ctx.currentTime+2.5); o2.stop(ctx.currentTime+2.5); lfo.stop(ctx.currentTime+2.5);
    } catch(e) {}
  }

  // ── Sons systeme ────────────────────────────────────────────────────
  function playDoor()     { noise(.12,.18,450,1.5); osc(140,.2,.22,'sawtooth'); osc(80,.3,.12,'square',0,.08); }
  function playLocked()   { osc(300,.06,.25,'square'); osc(220,.08,.25,'square',0,.1); noise(.05,.12,1400,2,.06); }
  function playCodeOk()   { osc(660,.06,.2); osc(880,.06,.2,'sine',0,.07); osc(1100,.12,.2,'sine',0,.14); }
  function playCodeFail() { sweep(500,120,.3,.3,'square'); noise(.08,.15,900,2,.1); }
  function playFloorUp()  { osc(440,.08,.18); osc(554,.08,.2,'sine',0,.08); osc(660,.08,.22,'sine',0,.16); osc(880,.18,.28,'sine',0,.24); noise(.15,.2,700,1.5,.06); }
  function playGameOver() { sweep(300,60,.8,.35,'sawtooth'); sweep(280,50,.8,.25,'square',.05); noise(.4,.2,700,1.2,.1); osc(40,1.5,.15,'sine',0,.3); }
  function playVictory()  { osc(440,.1,.22); osc(554,.1,.22,'sine',0,.1); osc(660,.1,.22,'sine',0,.2); osc(880,.3,.28,'sine',0,.3); osc(1100,.25,.35,'sine',0,.5); noise(.06,.12,2800,3,.55); }
  function playKeypad()   { osc(1200,.04,.1); }
  function playUse()      { osc(520,.1,.16); osc(660,.08,.12,'sine',0,.06); noise(.05,.08,1400,3,.04); }

  // ── Geiger ──────────────────────────────────────────────────────────
  function startGeiger(radPct) {
    stopGeiger();
    if (!enabled) return;
    const base   = radPct > 75 ? 55 : radPct > 50 ? 140 : radPct > 30 ? 380 : radPct > 10 ? 850 : 2200;
    const vol    = 0.08 + (radPct / 100) * 0.32;
    const jitter = () => base * (0.6 + Math.random() * 0.8);
    function tick() { noise(.025, vol * geigerVol, 2300, 2); geigerInterval = setTimeout(tick, jitter()); }
    geigerInterval = setTimeout(tick, jitter());
  }
  function stopGeiger() { if (geigerInterval) { clearTimeout(geigerInterval); geigerInterval = null; } }

  function ambientHum(rad) {
    if (!ctx || !enabled) return;
    if (rad > 30 && Math.random() < 0.07)  drone(rad / 100);
    if (rad > 65 && Math.random() < 0.025) fearStinger();
  }

  // ── Dispatch principal ──────────────────────────────────────────────
  function play(name, subtype = null) {
    if (!enabled) return;
    resume();
    const map = {
      damage: dmgPhysical, damage_rad: dmgRad,
      rad_tick: radLow, rad_med: radMed, rad_critical: radCrit,
      danger: danger, fear: fearStinger, event_bad: danger,
      door: playDoor, locked: playLocked, use: playUse,
      floor_up: playFloorUp, gameover: playGameOver, victory: playVictory,
      code_ok: playCodeOk, code_fail: playCodeFail,
      doc_found: pickDoc, keypad: playKeypad,
    };
    if (name === 'pickup') {
      ({ consumable: pickConsumable, equipment: pickEquipment,
         lore: pickDoc, document: pickDoc, key: pickKey }[subtype] || pickGeneric)();
    } else {
      map[name]?.();
    }
  }

  function setGeigerVol(v)  { geigerVol  = parseFloat(v); }
  function setAmbientVol(v) { ambientVol = parseFloat(v); }
  function setEnabled(v)    { enabled = !!v; if (!v) stopGeiger(); }

  return { init, resume, play, startGeiger, stopGeiger, ambientHum, setGeigerVol, setAmbientVol, setEnabled };
})();


// ════════════════════════════════════════
// MODULE HOMEMUSIC (musique d'accueil)
// ════════════════════════════════════════
const HomeMusic = (() => {
  let ctx = null, masterGain = null;
  let playing = false;
  let drones = [];
  let loopTimeout = null, fadeInterval = null;

  function _init() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(ctx.destination);
      return true;
    } catch(e) { return false; }
  }

  // Fonctions de synthese (branchees sur masterGain)
  function _osc(freq, dur, vol, type = 'sine', detune = 0, delay = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(masterGain);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0, ctx.currentTime + delay);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + dur + 0.1);
  }

  function _sweep(f0, f1, dur, vol, type = 'sine', delay = 0) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(masterGain);
    o.type = type;
    o.frequency.setValueAtTime(f0, ctx.currentTime + delay);
    o.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime + delay + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    o.start(ctx.currentTime + delay);
    o.stop(ctx.currentTime + delay + dur + 0.1);
  }

  function _noise(dur, vol, center = 1000, q = 1.5, delay = 0) {
    const len = Math.ceil(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(), g = ctx.createGain();
    const f   = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = center; f.Q.value = q;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(masterGain);
    g.gain.setValueAtTime(vol, ctx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + dur);
    src.start(ctx.currentTime + delay);
  }

  // Stinger d'intro joue une seule fois
  function _playIntro() {
    _noise(2.5, 0.18, 80, 0.8);
    _osc(40, 3.0, 0.22, 'sine', 0, 0);
    _osc(80, 2.5, 0.14, 'sine', 0, 0.3);
    _osc(55, 2.8, 0.12, 'sawtooth', -400, 0.1);
    _sweep(800, 60, 1.2, 0.3, 'sawtooth', 0.8);
    _sweep(600, 40, 1.0, 0.2, 'square', 0.85);
    // Melodie fantome descendante (do mineur)
    [523.25, 493.88, 440, 392, 349.23].forEach((f, i) => {
      const del = 1.2 + i * 0.4;
      _osc(f, 0.7, 0.06, 'sine', -1200, del);
      _osc(f / 2, 0.5, 0.04, 'sine', 0, del + 0.05);
    });
    // Cliquetis Geiger
    for (let i = 0; i < 18; i++)
      _noise(0.025, 0.12 + Math.random() * 0.08, 2200 + Math.random() * 800, 2.5,
             0.5 + i * (0.06 + Math.random() * 0.12));
    _sweep(55, 28, 2.5, 0.28, 'sine', 2.2);
    _noise(1.5, 0.15, 120, 1.2, 2.5);
  }

  // Drones graves persistants
  function _startDrones() {
    drones = [27.5, 55, 82.5, 110].map((freq, i) => {
      try {
        const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
        const g  = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
        o1.type = 'sawtooth'; o1.frequency.value = freq;
        o2.type = 'sawtooth'; o2.frequency.value = freq * 1.008;
        lfo.type = 'sine'; lfo.frequency.value = 0.07 + i * 0.03;
        lg.gain.value = 0.015;
        o1.connect(g); o2.connect(g); g.connect(masterGain);
        lfo.connect(lg); lg.connect(g.gain);
        g.gain.value = [0.14, 0.10, 0.07, 0.05][i];
        o1.start(); o2.start(); lfo.start();
        return { o1, o2, lfo };
      } catch(e) { return null; }
    }).filter(Boolean);
  }

  // Boucle ambiante aleatoire toutes les 5-9 secondes
  function _loop() {
    if (!playing) return;
    // Grondement grave
    if (Math.random() < 0.6)
      _noise(1.2 + Math.random() * 2, 0.06 + Math.random() * 0.06, 60 + Math.random() * 80, 0.8);
    // Impact metallique lointain
    if (Math.random() < 0.35)
      _sweep(300 + Math.random() * 200, 40 + Math.random() * 30,
             0.8 + Math.random() * 0.8, 0.1, 'sawtooth', Math.random() * 2);
    // Note spectrale
    if (Math.random() < 0.45) {
      const note = [220, 246.94, 261.63, 293.66, 329.63, 349.23, 392, 440][Math.floor(Math.random() * 8)];
      _osc(note, 1.2 + Math.random(), 0.035, 'sine', -1200 + Math.random() * 400, Math.random() * 3);
    }
    // Salve de Geiger
    if (Math.random() < 0.5) {
      let t = Math.random() * 4;
      for (let i = 0; i < 3 + Math.floor(Math.random() * 12); i++) {
        t += 0.04 + Math.random() * 0.18;
        _noise(0.025, 0.08 + Math.random() * 0.07, 2000 + Math.random() * 1000, 2, t);
      }
    }
    // Fragment d'alarme
    if (Math.random() < 0.2) {
      const d = 1 + Math.random() * 3;
      [0, 0.3, 0.6].forEach((o, i) => _osc(880, 0.15, 0.04 - i * 0.01, 'square', 0, d + o));
    }
    loopTimeout = setTimeout(_loop, (5 + Math.random() * 4) * 1000);
  }

  // Fondu progressif
  function _fadeTo(target, ms) {
    if (!ctx || !masterGain) return;
    if (fadeInterval) clearInterval(fadeInterval);
    const from = masterGain.gain.value;
    let step = 0;
    fadeInterval = setInterval(() => {
      masterGain.gain.value = from + (target - from) * (++step / 40);
      if (step >= 40) { masterGain.gain.value = target; clearInterval(fadeInterval); fadeInterval = null; }
    }, ms / 40);
  }

  function _updateBtn(on) {
    document.getElementById('home-music-btn')?.classList.toggle('playing', on);
    const lbl = document.getElementById('home-music-label');
    if (lbl) lbl.textContent = on ? 'COUPER' : 'MUSIQUE';
  }

  function start() {
    if (!_init()) return;
    if (ctx.state === 'suspended') ctx.resume();
    playing = true;
    _startDrones();
    _fadeTo(0.75, 800);
    _playIntro();
    loopTimeout = setTimeout(_loop, 5000);
    _updateBtn(true);
  }

  function stop() {
    playing = false;
    if (loopTimeout) { clearTimeout(loopTimeout); loopTimeout = null; }
    drones.forEach(d => { try { d.o1.stop(); d.o2.stop(); d.lfo.stop(); } catch(e) {} });
    drones = [];
    _fadeTo(0, 600);
    setTimeout(() => { if (!playing) try { ctx?.suspend(); } catch(e) {} }, 700);
    _updateBtn(false);
  }

  function toggle() { playing ? stop() : start(); }
  function stopForGame() { if (playing) stop(); }

  return { start, stop, toggle, stopForGame, isPlaying: () => playing };
})();


// ════════════════════════════════════════
// MODULE GAMEMUSIC — musique oppressante
// ════════════════════════════════════════
const GameMusic = (() => {
  let ctx = null, master = null;
  let playing = false, rad = 0;
  let nodes = [];  // tous les oscillateurs/sources permanents
  let beatT = null, melodT = null, alarmT = null, fadeIv = null;

  function _init() {
    if (ctx) return true;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0;
      master.connect(ctx.destination);
      return true;
    } catch(e) { return false; }
  }

  // ── Primitives ──────────────────────────────────────────────────────
  const T = () => ctx.currentTime;

  function _osc(freq, dur, vol, type='sine', detune=0, delay=0) {
    try {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(master); o.type=type;
      o.frequency.setValueAtTime(freq, T()+delay);
      if (detune) o.detune.value=detune;
      g.gain.setValueAtTime(0, T()+delay);
      g.gain.linearRampToValueAtTime(vol, T()+delay+0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, T()+delay+dur);
      o.start(T()+delay); o.stop(T()+delay+dur+0.05);
    } catch(e) {}
  }

  function _sweep(f0, f1, dur, vol, type='sawtooth', delay=0) {
    try {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(master); o.type=type;
      o.frequency.setValueAtTime(f0, T()+delay);
      o.frequency.exponentialRampToValueAtTime(f1, T()+delay+dur);
      g.gain.setValueAtTime(vol, T()+delay);
      g.gain.exponentialRampToValueAtTime(0.0001, T()+delay+dur);
      o.start(T()+delay); o.stop(T()+delay+dur+0.05);
    } catch(e) {}
  }

  function _noise(dur, vol, center=800, q=2, delay=0) {
    try {
      const len=Math.ceil(ctx.sampleRate*dur);
      const buf=ctx.createBuffer(1,len,ctx.sampleRate);
      const d=buf.getChannelData(0);
      for (let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
      const src=ctx.createBufferSource(), g=ctx.createGain();
      const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=center; f.Q.value=q;
      src.buffer=buf; src.connect(f); f.connect(g); g.connect(master);
      g.gain.setValueAtTime(vol, T()+delay);
      g.gain.exponentialRampToValueAtTime(0.0001, T()+delay+dur);
      src.start(T()+delay);
    } catch(e) {}
  }

  // ── Percussion industrielle ──────────────────────────────────────────
  // Kick : basse courte qui descend vite
  function _kick(vol=1) {
    _sweep(160, 28, 0.18, 0.35*vol, 'sine');
    _noise(0.04, 0.20*vol, 150, 0.8);
  }
  // Snare : bruit + claquement métallique
  function _snare(delay=0, vol=1) {
    _noise(0.08, 0.18*vol, 4000, 0.7, delay);
    _noise(0.05, 0.10*vol, 1800, 1.5, delay);
    _osc(190, 0.06, 0.07*vol, 'square', 0, delay);
  }
  // Hi-hat : bruit aigu très court
  function _hat(delay=0, vol=0.5) {
    _noise(0.025, 0.10*vol, 8000, 0.4, delay);
  }
  // Cloche d'alarme : ding métallique dissonant
  function _clang(freq=1200, delay=0) {
    _osc(freq,      0.6, 0.12, 'square',    0, delay);
    _osc(freq*1.41, 0.4, 0.08, 'sawtooth', 80, delay+0.01); // triton
  }

  // ── Boucle de batterie ───────────────────────────────────────────────
  // BPM : 80 au calme → 180 en zone rouge
  function _beatLoop() {
    if (!playing) return;
    const bpm  = 80 + rad * 1.0;
    const b    = 60 / bpm;       // durée d'un temps en secondes
    const bms  = b * 1000;       // idem en ms

    _kick();                          // temps 1
    _hat(b * 0.5);                    // off-beat
    _snare(b, 0.9);                   // temps 2
    _hat(b * 1.25);
    _hat(b * 1.5);
    _kick(0.7); _kick(0.7);           // double kick (grosse pression)
    _snare(b * 1.75, 0.6);
    // Extra hi-hats rapides à haute radiation
    if (rad > 50) { _hat(b*0.25); _hat(b*0.75); _hat(b*1.35); }
    // Ghost snare supplémentaire en zone critique
    if (rad > 75) _snare(b * 0.875, 0.35);

    beatT = setTimeout(_beatLoop, bms * 2); // boucle sur 2 temps
  }

  // ── Boucle de mélodie ────────────────────────────────────────────────
  // Gamme phrygienne : la plus oppressante qui existe
  const PHRYG = [36.7, 41.2, 49.0, 55.0, 61.7, 65.4, 73.4, 82.4];

  function _melodyLoop() {
    if (!playing) return;
    const f   = PHRYG[Math.floor(Math.random() * PHRYG.length)];
    const dur = 0.15 + Math.random() * 0.3;
    const vol = 0.07 + (rad/100) * 0.10;

    // Basse distordue (sawtooth désaccordé)
    _osc(f,      dur, vol,      'sawtooth', -300 + Math.random()*200);
    _osc(f*2,    dur, vol*0.5,  'sawtooth',  400, 0.01);
    // Triton — accord du diable
    if (Math.random() < 0.5) _osc(f*1.414, dur*0.6, vol*0.35, 'square', 100, 0.02);
    // Bruit métallique sur certaines notes
    if (Math.random() < 0.4) _noise(dur*0.3, vol*0.4, 600+f*3, 3);

    // Intervalle rapide : accélère avec rad (min 80ms)
    const next = Math.max(80, 600 - rad*4 + Math.random()*300);
    melodT = setTimeout(_melodyLoop, next);
  }

  // ── Alarme en continu à haute radiation ─────────────────────────────
  function _alarmLoop() {
    if (!playing || rad < 55) { alarmT = setTimeout(_alarmLoop, 2000); return; }
    // Sirène biphasique montante
    _sweep(440, 880, 0.3, 0.04 + (rad/100)*0.06, 'square');
    _sweep(880, 440, 0.3, 0.03 + (rad/100)*0.04, 'square', 0.32);
    // Clochette d'alerte
    if (rad > 70) _clang(1320 + Math.random()*200);
    // Stab dissonant en zone critique
    if (rad > 85) {
      _osc(110, 0.12, 0.15, 'sawtooth');
      _osc(155.6, 0.10, 0.10, 'sawtooth', 0, 0.05); // triton grave
    }
    alarmT = setTimeout(_alarmLoop, 700 - rad*3);  // accélère
  }

  // ── Drones de fond ───────────────────────────────────────────────────
  function _startDrones() {
    [[28,28.4],[40,40.5],[55,55.7]].forEach(([f1,f2], i) => {
      try {
        const o1=ctx.createOscillator(), o2=ctx.createOscillator();
        const g=ctx.createGain(), lfo=ctx.createOscillator(), lg=ctx.createGain();
        o1.type='sawtooth'; o1.frequency.value=f1;
        o2.type='sawtooth'; o2.frequency.value=f2;
        lfo.type='sine'; lfo.frequency.value=0.06+i*0.04;
        lg.gain.value=0.015;
        o1.connect(g); o2.connect(g); g.connect(master);
        lfo.connect(lg); lg.connect(g.gain);
        g.gain.value=[0.12,0.09,0.06][i];
        o1.start(); o2.start(); lfo.start();
        nodes.push(o1,o2,lfo);
      } catch(e) {}
    });
  }

  // ── Fondu ────────────────────────────────────────────────────────────
  function _fadeTo(target, ms) {
    if (fadeIv) clearInterval(fadeIv);
    const from=master.gain.value; let step=0;
    fadeIv=setInterval(()=>{
      master.gain.value=from+(target-from)*(++step/40);
      if(step>=40){master.gain.value=target;clearInterval(fadeIv);fadeIv=null;}
    }, ms/40);
  }

  // ── API publique ─────────────────────────────────────────────────────
  function start() {
    if (!_init()) return;
    if (ctx.state==='suspended') ctx.resume();
    playing=true;
    _startDrones();
    _fadeTo(0.6, 1200);
    _beatLoop();
    _melodyLoop();
    _alarmLoop();
  }

  function stop() {
    playing=false;
    [beatT,melodT,alarmT].forEach(t => t && clearTimeout(t));
    beatT=melodT=alarmT=null;
    nodes.forEach(n=>{try{n.stop();}catch(e){}});
    nodes=[];
    _fadeTo(0, 700);
    setTimeout(()=>{ if(!playing) try{ctx?.suspend();}catch(e){} }, 800);
  }

  // Mise à jour depuis le jeu à chaque tick de radiation
  function setRadiation(pct) {
    rad=Math.max(0,Math.min(100,pct));
    if (master && playing)
      master.gain.setTargetAtTime(0.5 + rad/100*0.45, ctx.currentTime, 1.0);
  }

  return { start, stop, setRadiation, isPlaying:()=>playing };
})();
