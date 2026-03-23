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

  