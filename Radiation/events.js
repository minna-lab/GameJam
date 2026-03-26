// ═══════════════════════════════════════════════════════════════════
// HORIZON — js/events.js
// Événements aléatoires · Gestion radiation/HP · Mort · Victoire
// ═══════════════════════════════════════════════════════════════════

const GameEvents = (() => {

  // ── RANDOM EVENT POOL ─────────────────────────────────────────────
  const EVENTS = [
    { id:'pipe',    txt:'Un tuyau éclate. Vapeur radioactive et brûlures.',        hp:-8,  rad:8,  sfx:'danger' },
    { id:'glass',   txt:'Éclat de verre sous la semelle. Blessure légère.',        hp:-10, rad:0,  sfx:'damage' },
    { id:'surge',   txt:'Surtension électrique. Vous êtes projeté en arrière.',    hp:-18, rad:10, sfx:'danger' },
    { id:'rad',     txt:'Fuite de liquide fluorescent. Le Geiger hurle.',          hp:-5,  rad:22, sfx:'fear'   },
    { id:'whisper', txt:'Une voix dans le plafond : «Ne montez pas…» Silence.',   hp:0,   rad:0,  sfx:'fear'   },
    { id:'rats',    txt:'Des rats fuient vers le bas. Mauvais présage.',           hp:-3,  rad:0,  sfx:null      },
    { id:'figure',  txt:'Silhouette en combinaison. Seringue sur le sol — cadeau?',hp:0,  rad:-18,sfx:'fear'   },
    { id:'radio',   txt:'"…Zone rouge… ne pas approcher…" Trop tard.',            hp:0,   rad:0,  sfx:'fear'   },
    { id:'ceiling', txt:'Le plafond s\'effondre partiellement. Poussière blanche.',hp:-6, rad:5,  sfx:'damage' },
    { id:'scream',  txt:'Un cri lointain. Puis le silence. Puis le Geiger.',       hp:0,   rad:3,  sfx:'fear'   },
    { id:'smell',   txt:'Odeur de soufre et de métal brûlé. Rad +5.',             hp:0,   rad:5,  sfx:'fear'   },
  ];

  // ── AMBIENT TICK (called every ~5s) ──────────────────────────────
  function doAmbient() {
    const rm = rmAt(S.py, S.px);
    const mult = {
      rdc_maint: 2.2, rdc_elevh: 1.7, rdc_stock: 1.3,
    }[rm?.id] || (rm?.id?.startsWith('ch') ? 0.7 : 1.0);

    addRad(Math.floor(S.floor * 1.6 * mult));

    const evFreq = [0.04, 0.12, 0.22, 0.38][Settings.get('events')] || 0.12;
    if (Math.random() < evFreq) _triggerEvent();
  }

  function _triggerEvent() {
    const pool = S.floor <= 3 ? EVENTS.slice(0,5) : S.floor <= 6 ? EVENTS.slice(0,8) : EVENTS;
    const ev   = pool[Math.floor(Math.random() * pool.length)];
    if (ev.hp  < 0) dmg(-ev.hp, false);
    if (ev.hp  > 0) heal(ev.hp);
    if (ev.rad > 0) addRad(ev.rad);
    if (ev.rad < 0) redRad(-ev.rad);
    // Contextual audio
    if (ev.sfx === 'fear')   Audio.playFear();
    if (ev.sfx === 'danger') Audio.playDanger();
    if (ev.sfx === 'damage') Audio.playDamage();
    S.stats.events++;
    Game.log(`⚡ ${ev.txt}`, 'l-warn');
    Game.notif(`⚡ ${ev.txt.slice(0, 60)}`, 'bad');
  }

  // ── STATS MUTATION ────────────────────────────────────────────────
  function addRad(v) {
    if (S.dead) return;
    const radMult = [0.35, 1, 1.6, 2.2][Settings.get('rad')] || 1;
    const effective = Math.max(0, Math.ceil(v * (1 - S.shield / 100) * radMult));
    const prevRad = S.rad;
    S.rad = Math.min(S.maxRad, S.rad + effective);
    S.stats.radTotal += effective;

    // Sound feedback
    if (effective > 0) {
      Audio.playRadIncrease(S.rad);
      if (S.rad > 75 && prevRad <= 75) Audio.playRadAlarm();
      if (S.rad > 60 && Math.random() < 0.15) Audio.playDanger();
    }

    // Radiation poisoning at high levels
    if (S.rad >= 80) {
      const poison = Math.floor((S.rad - 80) * 0.38);
      if (poison > 0) dmg(poison, false);
    }

    _checkDeath();
    Game.refreshStats();
  }

  function dmg(v, sfx=true) {
    if (S.dead) return;
    S.hp = Math.max(0, S.hp - v);
    if (sfx) Audio.playDamage();
    if (S.hp < 25 && Math.random() < 0.2) Audio.playDanger();
    _checkDeath();
    Game.refreshStats();
  }

  function heal(v) {
    S.hp = Math.min(S.maxHp, S.hp + v);
    Game.refreshStats();
  }

  function redRad(v) {
    S.rad = Math.max(0, S.rad - v);
    Game.refreshStats();
    Audio.startGeiger(S.rad);
  }

  function _checkDeath() {
    if (S.hp  <= 0 && !S.dead) _die('hp');
    if (S.rad >= S.maxRad && !S.dead) _die('radiation');
  }

  // ── DEATH / VICTORY ───────────────────────────────────────────────
  function _die(reason) {
    S.dead = true;
    Audio.stopGeiger();
    Audio.playGameOver();
    setTimeout(() => _endScreen(reason), 900);
  }

  function doVictory() {
    S.dead = true;
    Audio.stopGeiger();
    Audio.playVictory();
    setTimeout(() => _endScreen('victory'), 900);
  }

  function _endScreen(type) {
    const victory = type === 'victory';
    const titles = {
      victory:   'VOUS AVEZ SURVÉCU',
      hp:        'SILENCE',
      radiation: 'EFFONDREMENT',
    };
    const stories = {
      victory:   'Vous émergez sur le toit. L\'air brûle vos poumons. Les dossiers SIGMA dans vos mains — la preuve de tout. Un numéro composé. Il attendait cet appel depuis 2027.',
      hp:        'L\'hôtel vous a eue. Une chute dans l\'obscurité. Votre Geiger cliquette doucement dans le silence de cette tour oubliée.',
      radiation: 'La radiation a gagné. Vos genoux cèdent dans un couloir. Le compteur sature. L\'Hôtel Horizon garde son secret. Pour l\'instant.',
    };

    document.getElementById('go-eyebrow').textContent = victory ? 'Victoire' : 'Fin de partie';
    document.getElementById('go-title').textContent   = titles[type];
    document.getElementById('go-title').className     = 'go-title ' + (victory ? 'win' : 'dead');
    document.getElementById('go-story').textContent   = stories[type];

    const finalScore = Score.calcFinal(S.floor, S.hp, S.rad, S.stats.items, victory);
    const bd   = Score.breakdown();
    const rank = Score.getRank(finalScore, victory);

    document.getElementById('go-score-big').textContent = finalScore.toLocaleString();
    document.getElementById('go-score-big').className   = 'go-score-big ' + (victory ? 'win' : 'dead');

    document.getElementById('go-breakdown').innerHTML = `
      <div class="go-bd-item"><div class="go-bd-val">${bd.floor_bonus||0}</div><div class="go-bd-lbl">Étages</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.items||0}</div><div class="go-bd-lbl">Objets</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.docs||0}</div><div class="go-bd-lbl">Docs</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.hp_bonus||0}</div><div class="go-bd-lbl">Santé</div></div>
      <div class="go-bd-item"><div class="go-bd-val" style="color:${(bd.rad_penalty||0)<0?'var(--rust)':'inherit'}">${bd.rad_penalty||0}</div><div class="go-bd-lbl">Radiation</div></div>
      ${victory?`<div class="go-bd-item"><div class="go-bd-val" style="color:var(--bile-bright)">${bd.victory||0}</div><div class="go-bd-lbl">Victoire</div></div>`:''}
    `;

    document.getElementById('go-rank').innerHTML =
      `<div class="go-rank-badge ${rank.l.toLowerCase()}">${rank.l} — ${rank.t}</div>`;

    // Use player name from Game module (passed via goHome flow)
    const nm = document.getElementById('hud-player')?.textContent || 'Survivante';
    Score.save(nm, S.floor, victory, S.hp, S.rad);
    App.updateHomePage();
    App.showScreen('gameover');
  }

  // ── PUBLIC API ────────────────────────────────────────────────────
  return { doAmbient, addRad, dmg, heal, redRad, doVictory };
})();