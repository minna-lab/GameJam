// ☢ HORIZON — audio.js
// Moteur audio Web Audio API — sons procéduraux distincts

const Audio = (() => {
  let ctx = null;
  let geigerInterval = null;
  let geigerVol = 0.6;
  let ambientVol = 0.3;
  let enabled = true;

  function init() {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }
  function dest() { return ctx && ctx.destination; }

  // ── Primitives ──────────────────────────────────────────────────────────
  function osc(freq, dur, vol, type='sine', detune=0, delay=0) {
    if (!ctx || !enabled) return;
    try {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(dest());
      o.type=type; o.frequency.setValueAtTime(freq, ctx.currentTime+delay);
      if(detune) o.detune.value=detune;
      g.gain.setValueAtTime(0, ctx.currentTime+delay);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime+delay+0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+delay+dur);
      o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+dur+0.05);
    } catch(e) {}
  }

  function sweep(f0, f1, dur, vol, type='sine', delay=0) {
    if (!ctx || !enabled) return;
    try {
      const o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(dest());
      o.type=type;
      o.frequency.setValueAtTime(f0, ctx.currentTime+delay);
      o.frequency.exponentialRampToValueAtTime(f1, ctx.currentTime+delay+dur);
      g.gain.setValueAtTime(vol, ctx.currentTime+delay);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+delay+dur);
      o.start(ctx.currentTime+delay); o.stop(ctx.currentTime+delay+dur+0.05);
    } catch(e) {}
  }

  function noise(dur, vol, center=2000, q=2, delay=0) {
    if (!ctx || !enabled) return;
    try {
      const len=Math.floor(ctx.sampleRate*dur);
      const buf=ctx.createBuffer(1,len,ctx.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*(1-i/len);
      const src=ctx.createBufferSource(), g=ctx.createGain();
      const f=ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=center; f.Q.value=q;
      src.buffer=buf; src.connect(f); f.connect(g); g.connect(dest());
      g.gain.setValueAtTime(vol, ctx.currentTime+delay);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime+delay+dur);
      src.start(ctx.currentTime+delay);
    } catch(e) {}
  }

  // ── Sons ramassage par type d'objet ─────────────────────────────────────
  function pickConsumable() { osc(880,.06,.18,'sine'); osc(1100,.04,.12,'sine',0,.05); noise(.04,.08,2000,3,.02); }
  function pickEquipment()  { noise(.15,.25,1000,1.5); osc(220,.1,.2,'square',0,.08); osc(440,.06,.12,'sine',0,.18); }
  function pickDoc()        { noise(.12,.18,3500,4); noise(.08,.1,4800,6,.06); osc(180,.4,.07,'sine',0,.12); }
  function pickKey()        { osc(1200,.04,.2,'square'); osc(1600,.04,.15,'square',0,.06); osc(1000,.08,.1,'sine',0,.1); }
  function pickGeneric()    { osc(660,.1,.16,'sine'); osc(880,.07,.12,'sine',0,.04); }

  // ── Sons dégâts ─────────────────────────────────────────────────────────
  function dmgPhysical() { noise(.08,.3,700,1.2); osc(80,.25,.35,'sawtooth',-300); osc(120,.15,.2,'square',0,.05); }
  function dmgRad()      { noise(.3,.2,1200,1.5); osc(60,.4,.25,'sawtooth',400); osc(90,.3,.2,'sawtooth',-200,.1); osc(45,.5,.15,'sine',0,.05); }

  // ── Sons radiation montante ─────────────────────────────────────────────
  function radLow()      { noise(.025,.12*geigerVol,2200,2.5); }
  function radMed()      { noise(.03,.2*geigerVol,2000,3); osc(440,.06,.06,'square',0,.02); }
  function radCrit()     { noise(.06,.35*geigerVol,2500,2); osc(880,.08,.18,'square'); osc(660,.12,.15,'sawtooth',0,.08); noise(.04,.2*geigerVol,3800,4,.1); }

  // ── Sons danger / peur ───────────────────────────────────────────────────
  function danger()      { sweep(600,180,.5,.3,'sawtooth'); sweep(580,160,.5,.2,'square',.03); noise(.2,.12,900,1.5,.1); }
  function fearStinger() { sweep(3200,400,.12,.25,'square'); noise(.08,.2,5000,2); sweep(200,50,.6,.18,'sine',.15); }
  function drone(intens) {
    if (!ctx||!enabled) return;
    try {
      const o1=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();
      const lfo=ctx.createOscillator(),lg=ctx.createGain();
      o1.connect(g); o2.connect(g); g.connect(dest());
      lfo.connect(lg); lg.connect(g.gain);
      o1.type='sawtooth'; o1.frequency.value=55;
      o2.type='sawtooth'; o2.frequency.value=57.5;
      lfo.type='sine'; lfo.frequency.value=3.5+intens*4;
      lg.gain.value=intens*.06;
      g.gain.setValueAtTime(intens*.12*ambientVol,ctx.currentTime);
      g.gain.linearRampToValueAtTime(0,ctx.currentTime+2.5);
      o1.start(); o2.start(); lfo.start();
      o1.stop(ctx.currentTime+2.5); o2.stop(ctx.currentTime+2.5); lfo.stop(ctx.currentTime+2.5);
    } catch(e) {}
  }

  // ── Sons système ─────────────────────────────────────────────────────────
  function playDoor()     { noise(.12,.18,450,1.5); osc(140,.2,.22,'sawtooth'); osc(80,.3,.12,'square',0,.08); }
  function playLocked()   { osc(300,.06,.25,'square'); osc(220,.08,.25,'square',0,.1); noise(.05,.12,1400,2,.06); }
  function playCodeOk()   { osc(660,.06,.2,'sine'); osc(880,.06,.2,'sine',0,.07); osc(1100,.12,.2,'sine',0,.14); }
  function playCodeFail() { sweep(500,120,.3,.3,'square'); noise(.08,.15,900,2,.1); }
  function playFloorUp()  { osc(440,.08,.18,'sine'); osc(554,.08,.2,'sine',0,.08); osc(660,.08,.22,'sine',0,.16); osc(880,.18,.28,'sine',0,.24); noise(.15,.2,700,1.5,.06); }
  function playGameOver() { sweep(300,60,.8,.35,'sawtooth'); sweep(280,50,.8,.25,'square',.05); noise(.4,.2,700,1.2,.1); osc(40,1.5,.15,'sine',0,.3); }
  function playVictory()  { osc(440,.1,.22,'sine'); osc(554,.1,.22,'sine',0,.1); osc(660,.1,.22,'sine',0,.2); osc(880,.3,.28,'sine',0,.3); osc(1100,.25,.35,'sine',0,.5); noise(.06,.12,2800,3,.55); }
  function playKeypad()   { osc(1200,.04,.1,'sine'); }
  function playUse()      { osc(520,.1,.16,'sine'); osc(660,.08,.12,'sine',0,.06); noise(.05,.08,1400,3,.04); }

  // ── Geiger ────────────────────────────────────────────────────────────────
  function startGeiger(radPct) {
    stopGeiger();
    if (!enabled) return;
    const base=radPct>75?55:radPct>50?140:radPct>30?380:radPct>10?850:2200;
    const jitter=()=>base*(0.6+Math.random()*0.8);
    const vol=0.08+(radPct/100)*0.32;
    function tick() { noise(.025,vol*geigerVol,2300,2); geigerInterval=setTimeout(tick,jitter()); }
    geigerInterval=setTimeout(tick,jitter());
  }
  function stopGeiger() { if(geigerInterval){clearTimeout(geigerInterval);geigerInterval=null;} }

  // ── Ambiance ──────────────────────────────────────────────────────────────
  function ambientHum(rad) {
    if (!ctx||!enabled) return;
    if (rad>30&&Math.random()<0.07) drone(rad/100);
    if (rad>65&&Math.random()<0.025) fearStinger();
  }

  // ── Dispatch ──────────────────────────────────────────────────────────────
  function play(name, subtype=null) {
    if (!enabled) return;
    resume();
    switch(name) {
      case 'pickup':
        if(subtype==='consumable') pickConsumable();
        else if(subtype==='equipment') pickEquipment();
        else if(subtype==='lore'||subtype==='document') pickDoc();
        else if(subtype==='key') pickKey();
        else pickGeneric();
        break;
      case 'damage':       dmgPhysical(); break;
      case 'damage_rad':   dmgRad(); break;
      case 'rad_tick':     radLow(); break;
      case 'rad_med':      radMed(); break;
      case 'rad_critical': radCrit(); break;
      case 'danger':       danger(); break;
      case 'fear':         fearStinger(); break;
      case 'event_bad':    danger(); break;
      case 'door':         playDoor(); break;
      case 'locked':       playLocked(); break;
      case 'use':          playUse(); break;
      case 'floor_up':     playFloorUp(); break;
      case 'gameover':     playGameOver(); break;
      case 'victory':      playVictory(); break;
      case 'code_ok':      playCodeOk(); break;
      case 'code_fail':    playCodeFail(); break;
      case 'doc_found':    pickDoc(); break;
      case 'keypad':       playKeypad(); break;
    }
  }

  function setGeigerVol(v)  { geigerVol=parseFloat(v); }
  function setAmbientVol(v) { ambientVol=parseFloat(v); }
  function setEnabled(v)    { enabled=!!v; if(!v) stopGeiger(); }

  return { init, resume, play, startGeiger, stopGeiger, ambientHum, setGeigerVol, setAmbientVol, setEnabled };
})();
