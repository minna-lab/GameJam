// ════════════════════════════════════════

// ════════════════════════════════════════
// ANIMATIONS PAGE D'ACCUEIL
// ════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {

  // 1. Symboles ☢ flottants
  const symContainer = document.getElementById('home-rad-symbols');
  if (symContainer) {
    const SYMS   = ['☢','☣','⚠'];
    const COLORS = ['rgba(196,80,26,','rgba(57,255,20,','rgba(180,160,80,'];
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'rad-sym';
      el.textContent = SYMS[i % 3];
      el.style.cssText = `
        --sz:${1+Math.random()*3}rem;
        --col:${COLORS[i%3]+( .05+Math.random()*.12)+')'};
        --dur:${8+Math.random()*16}s;
        --del:${Math.random()*-15}s;
        left:${Math.random()*100}%;
        top:${20+Math.random()*75}%;
      `;
      symContainer.appendChild(el);
    }
  }

  // 2. Lignes de glitch aléatoires
  const glitchContainer = document.getElementById('home-glitch-lines');
  if (glitchContainer) {
    function spawnGlitch() {
      if (Math.random() > 0.35) { setTimeout(spawnGlitch, 300+Math.random()*2500); return; }
      for (let i = 0; i < 1+Math.floor(Math.random()*3); i++) {
        const w = 20+Math.random()*80;
        const el = document.createElement('div');
        el.style.cssText = `position:absolute;pointer-events:none;
          top:${10+Math.random()*85}%;left:${Math.random()*(100-w)}%;
          width:${w}%;height:${1+Math.random()*3}px;
          background:${Math.random()<.5?'rgba(196,80,26,':'rgba(57,255,20,'}${.2+Math.random()*.5});`;
        glitchContainer.appendChild(el);
        setTimeout(() => el.remove(), 40+Math.random()*120);
      }
      setTimeout(spawnGlitch, 300+Math.random()*2500);
    }
    spawnGlitch();
  }

  // 3. Compteurs animés (rad, survivants, jours)
  [
    { id:'hls-rad',  target:4847, delay:800,  fluctuate:true },
    { id:'hls-surv', target:0,    delay:600,  fluctuate:false },
    { id:'hls-days', target:362,  delay:1000, fluctuate:false },
  ].forEach(({ id, target, delay, fluctuate }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const unit = el.querySelector('.hls-unit')?.outerHTML || '';
    setTimeout(() => {
      let t0 = null;
      requestAnimationFrame(function step(ts) {
        if (!t0) t0 = ts;
        const p = Math.min((ts-t0)/2200, 1);
        el.innerHTML = Math.floor(target * (1-Math.pow(1-p,3))).toLocaleString('fr-FR') + unit;
        if (p < 1) requestAnimationFrame(step);
        else if (fluctuate)
          setInterval(() => {
            el.innerHTML = (target+Math.floor((Math.random()-.5)*50)).toLocaleString('fr-FR')+unit;
          }, 400+Math.random()*600);
      });
    }, delay);
  });

  // 4. Glitch de couleur sur le titre
  const title = document.getElementById('hero-title-glitch');
  if (title) {
    const overlay = Object.assign(document.createElement('div'), {
      className:'hero-title-glitch-overlay', textContent:'RADIATION'
    });
    overlay.setAttribute('aria-hidden','true');
    title.appendChild(overlay);
    setInterval(() => {
      if (Math.random() < .15) {
        title.style.color = Math.random() < .5 ? '#c4501a' : '#39ff14';
        setTimeout(() => title.style.color = '', 50+Math.random()*80);
      }
    }, 1800);
  }

  // 5. Variation des anneaux
  document.querySelectorAll('.home-ring').forEach(r => {
    r.style.animationDuration = (2.8+Math.random()*1.5)+'s';
  });

  // 6. Stopper la musique d'accueil quand le jeu démarre
  document.addEventListener('click', e => {
    if (e.target.closest('.btn-primary') && typeof HomeMusic !== 'undefined')
      HomeMusic.stopForGame();
  });
});
