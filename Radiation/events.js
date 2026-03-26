// ☢ HORIZON — events.js
// Événements aléatoires et effets

const EVENTS = [
  {id:'pipe',      txt:'Un tuyau éclate. Nuage de vapeur radioactive.',         hp:-8,  rad:8,  sfx:'event_bad'},
  {id:'glass',     txt:'Éclat de verre dans la semelle. Douleur vive.',         hp:-12, rad:0,  sfx:'damage'},
  {id:'surge',     txt:'Surtension électrique. Brûlures aux mains.',            hp:-20, rad:12, sfx:'event_bad'},
  {id:'rad_leak',  txt:'Flaque de liquide fluorescent. Fuite active.',          hp:-5,  rad:25, sfx:'danger'},
  {id:'whisper',   txt:'"Ne montez pas…" Une voix dans le couloir vide.',       hp:0,   rad:0,  sfx:'fear'},
  {id:'rats',      txt:'Des rats fuient en masse vers le bas. Mauvais présage.',hp:-4,  rad:0,  sfx:null},
  {id:'figure',    txt:'Combinaison abandonnée. Une seringue sur le sol.',      hp:0,   rad:-18,sfx:'use'},
  {id:'radio',     txt:'"…Zone rouge… ne pas approcher la tour…" Trop tard.',  hp:0,   rad:0,  sfx:'fear'},
  {id:'collapse',  txt:'Partie du plafond s\'effondre. Évitez de justesse.',    hp:-15, rad:5,  sfx:'damage'},
  {id:'gas',       txt:'Gaz invisible. Le Geiger grimpe d\'un coup.',           hp:-3,  rad:30, sfx:'danger'},
];

// Trigger event (appelé par le game engine)
function triggerEvent(S, floor, addRad, dmg, heal, redRad, logFn, notif) {
  const pool = floor <= 3 ? EVENTS.slice(0,5) : floor <= 6 ? EVENTS.slice(0,8) : EVENTS;
  const ev = pool[Math.floor(Math.random() * pool.length)];
  if (ev.hp < 0)  dmg(-ev.hp, false);
  if (ev.hp > 0)  heal(ev.hp);
  if (ev.rad > 0) addRad(ev.rad);
  if (ev.rad < 0) redRad(-ev.rad);
  if (ev.sfx)     Audio.play(ev.sfx);
  S.stats.events++;
  logFn(`⚡ ${ev.txt}`, 'l-warn');
  notif(`⚡ ${ev.txt.slice(0,55)}`, 'bad');
}
