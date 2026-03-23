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

  