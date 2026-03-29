
// ═══════════════════════ APP NAVIGATION ═══════════════════════
const App = (() => {
  const screens=['home','settings','scores','gameover','rules','game'];
  let _currentScreen='home';

  function showScreen(id){
    _currentScreen=id;
    screens.forEach(s=>{const el=document.getElementById('screen-'+s);if(el)el.classList.toggle('active',s===id);});
    if(id==='settings')Settings.open(_currentScreen);
    if(id==='scores')renderScores();
    if(id==='home')updateHomePage();
  }

  function renderScores(){
    const all=Score.load();const tb=document.getElementById('scores-tbody');const em=document.getElementById('scores-empty');
    tb.innerHTML='';
    if(!all.length){em.style.display='block';return;}
    em.style.display='none';
    all.forEach((s,i)=>{
      const cls=i===0?'g':i===1?'s':i===2?'b':'';const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1;
      const tr=document.createElement('tr');
      tr.innerHTML=`<td class="sc-rank ${cls}">${medal}</td><td class="sc-name">${s.name}</td><td class="sc-pts ${i===0?'best':''}">${s.score.toLocaleString()}</td><td class="sc-floor">Ét.${s.floor}/9</td><td><span class="sc-result ${s.victory?'win':'lose'}">${s.victory?'✓ Victoire':'✗ Éliminée'}</span></td><td class="sc-date">${s.date}</td>`;
      tb.appendChild(tr);
    });
  }

  function updateHomePage(){
    const all=Score.load();const list=document.getElementById('home-scores-list');if(!list)return;
    if(!all.length){list.innerHTML='<div class="no-scores">Aucun survivant enregistré.</div>';return;}
    list.innerHTML=all.slice(0,5).map((s,i)=>`<div class="score-row-preview"><span class="spr-rank ${i===0?'gold':''}">${i+1}.</span><span class="spr-name">${s.name}</span><span class="spr-pts">${s.score.toLocaleString()} pts</span><span class="spr-floor">Ét.${s.floor}</span></div>`).join('');
    const pn=document.getElementById('player-name');const sn=Settings.getPlayerName();
    if(pn&&sn&&sn!=='Survivante')pn.value=sn;
  }

  function startGame(){
    const nameEl=document.getElementById('player-name');
    let name=(nameEl?nameEl.value.trim():'')||Settings.getPlayerName()||'Survivante';
    try{const r=localStorage.getItem('horizon_settings_v1');const s=r?JSON.parse(r):{};s.playerName=name;localStorage.setItem('horizon_settings_v1',JSON.stringify(s));}catch(e){}
    Audio.init();Audio.resume();
    showScreen('game');Game.start(name);
    if(typeof GameMusic!=='undefined')GameMusic.start();
  }

  function getCurrent(){return _currentScreen;}

  return{showScreen,renderScores,updateHomePage,startGame,getCurrent};
})();

// ═══════════════════════ CURSOR ═══════════════════════
document.addEventListener('mousemove',e=>{
  const c=document.getElementById('cursor'),d=document.getElementById('cursor-dot');
  if(c){c.style.left=(e.clientX-10)+'px';c.style.top=(e.clientY-10)+'px';}
  if(d){d.style.left=e.clientX+'px';d.style.top=e.clientY+'px';}
});
document.addEventListener('click',()=>{
  const c=document.getElementById('cursor');if(c){c.style.transform='scale(0.7)';setTimeout(()=>c.style.transform='',150);}
  Audio.resume();
});

// ═══════════════════════ BOOT ═══════════════════════
window.addEventListener('DOMContentLoaded',()=>{
  Settings.load();App.updateHomePage();
  const ni=document.getElementById('player-name');
  if(ni){
    ni.addEventListener('keydown',e=>{if(e.key==='Enter')App.startGame();});
    const sn=Settings.getPlayerName();if(sn&&sn!=='Survivante')ni.value=sn;
  }
});
