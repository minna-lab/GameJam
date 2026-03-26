// ═══════════════════════════════════════════════════════════════════
// HORIZON — js/main.js
// Moteur principal : boucle de jeu, rendu canvas, input, caméra, HUD
// Dépend de : gameState.js, interactions.js, events.js, scenes.js,
//             data/items.js, data/story.js
// ═══════════════════════════════════════════════════════════════════

const Game = (() => {
  const TS = 48; // tile size px

  // ── INTERNAL VARS ─────────────────────────────────────────────────
  let cv, ctx, mm, mx, lt = 0;
  let _name = 'Survivante';

  // ── COLOR HELPERS ─────────────────────────────────────────────────
  function _dk(h, f) {
    const p = a => Math.round((parseInt(h.slice(a, a+2), 16) || 0) * f);
    return `rgb(${p(1)},${p(3)},${p(5)})`;
  }
  function _lk(h, f) {
    const p = a => Math.min(255, (parseInt(h.slice(a, a+2), 16) || 0) + Math.round(255*f));
    return `rgb(${p(1)},${p(3)},${p(5)})`;
  }

  // ── CANVAS INIT ───────────────────────────────────────────────────
  function _initCanvas() {
    cv = document.getElementById('game-canvas');
    ctx = cv.getContext('2d');
    mm  = document.getElementById('mini-map');
    mx  = mm.getContext('2d');
    _resize();
    window.addEventListener('resize', _resize);
  }
  function _resize() {
    const a = document.getElementById('panel-center');
    if (a) { cv.width = a.clientWidth; cv.height = a.clientHeight; }
  }

  // ── GAME LOOP ─────────────────────────────────────────────────────
  function _loop(ts) {
    S.af = requestAnimationFrame(_loop);
    const dt = Math.min(ts - lt, 50); lt = ts;
    if (!S.dead && !S.paused) _update(dt);
    _draw();
  }

  function _update(dt) {
    S.mvT -= dt;
    if (S.mvT <= 0) { _doMove(); S.mvT = 112; }
    S.ambT -= dt;
    if (S.ambT <= 0) { GameEvents.doAmbient(); S.ambT = 5000; _updLeft(); }
    // Door animations
    Object.entries(S.doorAnim).forEach(([id, a]) => {
      a.p += (a.op ? 1 : -1) * dt / 185;
      a.p = Math.max(0, Math.min(1, a.p));
      if (!a.op && a.p <= 0) delete S.doorAnim[id];
    });
    S.nearDoor  = Interactions.findNearDoor();
    S.nearLoot  = Interactions.findNearLoot();
    S.nearElev  = Interactions.isNearElev();
    _updateCam(); _updVignette(); _updHint();
    // Geiger dot speed
    const gd = document.getElementById('geiger-dot');
    if (gd) {
      gd.classList.remove('geiger-fast','geiger-medium','geiger-slow');
      gd.classList.add(S.rad > 75 ? 'geiger-fast' : S.rad > 45 ? 'geiger-medium' : 'geiger-slow');
    }
    Audio.playAmbientHum(S.rad);
  }

  // ── MOVEMENT ─────────────────────────────────────────────────────
  function _doMove() {
    let dx = 0, dy = 0;
    if (S.keys['ArrowLeft']  || S.keys['a']) { dx = -1; S.pdir = 'left'; }
    if (S.keys['ArrowRight'] || S.keys['d']) { dx =  1; S.pdir = 'right'; }
    if (S.keys['ArrowUp']    || S.keys['w']) { dy = -1; S.pdir = 'up'; }
    if (S.keys['ArrowDown']  || S.keys['s']) { dy =  1; S.pdir = 'down'; }
    if (!dx && !dy) return;
    const nc = S.px + dx, nr = S.py + dy;
    if (!inBounds(nc, nr)) return;
    const t = S.map[nr][nc];
    if (t === T.V || t === T.W || t === T.OB || t === T.EL || t === T.DC || t === T.DL) return;
    S.px = nc; S.py = nr;
    if (Math.random() < 0.012) Score.add('explore', 2);
  }

  // ── CAMERA ───────────────────────────────────────────────────────
  function _updateCam() {
    const tx = S.px * TS - cv.width  / 2 + TS / 2;
    const ty = S.py * TS - cv.height / 2 + TS / 2;
    const mx2 = Math.max(0, Math.min(MAP_W * TS - cv.width,  tx));
    const my2 = Math.max(0, Math.min(MAP_H * TS - cv.height, ty));
    S.camX += (mx2 - S.camX) * 0.2;
    S.camY += (my2 - S.camY) * 0.2;
  }

  function triggerShake() {
    const gs = document.getElementById('screen-game');
    if (!gs) return;
    gs.style.animation = 'shake .32s ease';
    setTimeout(() => { gs.style.animation = ''; }, 380);
  }

  // ── MAIN DRAW ────────────────────────────────────────────────────
  function _draw() {
    if (!ctx || !S.map) return;
    const CW = cv.width, CH = cv.height;
    ctx.clearRect(0, 0, CW, CH);
    const ox = Math.round(S.camX), oy = Math.round(S.camY);
    const c0 = Math.max(0, Math.floor(ox / TS) - 1);
    const c1 = Math.min(MAP_W - 1, Math.ceil((ox + CW) / TS) + 1);
    const r0 = Math.max(0, Math.floor(oy / TS) - 1);
    const r1 = Math.min(MAP_H - 1, Math.ceil((oy + CH) / TS) + 1);
    ctx.save(); ctx.translate(-ox, -oy);
    _drawFloors(c0, c1, r0, r1);
    _drawWalls(c0, c1, r0, r1);
    _drawDoors();
    _drawObjects(c0, c1, r0, r1);
    _drawLoot();
    _drawPlayer();
    ctx.restore();
    _drawMinimap();
  }

  function _drawFloors(c0, c1, r0, r1) {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const t = S.map[r][c]; if (t === T.V || t === T.W) continue;
      const rm = rmAt(r, c) || rmNear(r, c); if (!rm && t === T.F) continue;
      const st = getFloorStyle(rm, S.floor);
      const px = c * TS, py = r * TS;
      if (t === T.EL) { _drawElevator(px, py); continue; }
      _drawFloorTile(px, py, st, r, c);
    }
  }

  function _drawFloorTile(px, py, st, r, c) {
    const sd = (r * 127 + c) * 3571;
    switch (st.type) {
      case 'chevron': {
        const d = (r + c) % 4;
        ctx.fillStyle = [st.c1, st.c2 || _dk(st.c1,.75), _lk(st.c1,.08), _dk(st.c1,.88)][d];
        ctx.fillRect(px, py, TS, TS);
        ctx.strokeStyle = st.cj; ctx.lineWidth = .8;
        const s = Math.floor(TS/3);
        for (let i = 0; i <= TS; i += s) {
          ctx.beginPath(); ctx.moveTo(px+i,py); ctx.lineTo(px,py+i); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px+TS,py+i); ctx.lineTo(px+i,py+TS); ctx.stroke();
        }
        break;
      }
      case 'marble': {
        ctx.fillStyle = st.c1; ctx.fillRect(px, py, TS, TS);
        ctx.strokeStyle = _lk(st.c1,.18)+'55'; ctx.lineWidth = .6;
        for (let i = 0; i < 3; i++) {
          const vx=(sd*7+i*31)%TS, vy=(sd*13+i*17)%TS;
          ctx.beginPath(); ctx.moveTo(px+vx,py+vy);
          ctx.bezierCurveTo(px+vx+(sd%8)-4,py+vy+(sd%6)-3,px+vx+(sd%14)-7,py+vy+(sd%10)-5,px+vx+(sd%18)-9,py+vy+(sd%14)-7);
          ctx.stroke();
        }
        if (c%3===0) { ctx.strokeStyle=st.cj; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px,py+TS); ctx.stroke(); }
        if (r%3===0) { ctx.strokeStyle=st.cj; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+TS,py); ctx.stroke(); }
        ctx.fillStyle='rgba(230,210,180,.03)'; ctx.fillRect(px+2,py+2,TS*.28,TS*.18);
        break;
      }
      case 'herring': {
        ctx.fillStyle = (r+c)%2===0 ? st.c1 : (st.c2||_dk(st.c1,.8));
        ctx.fillRect(px,py,TS,TS);
        ctx.strokeStyle=st.cj; ctx.lineWidth=.6;
        const step=Math.floor(TS/4);
        for(let i=-TS;i<TS*2;i+=step){ctx.beginPath();ctx.moveTo(px+i,py);ctx.lineTo(px+i+TS,py+TS);ctx.stroke();}
        break;
      }
      case 'carpet': {
        ctx.fillStyle=st.c1; ctx.fillRect(px,py,TS,TS);
        ctx.save(); ctx.translate(px+TS/2,py+TS/2);
        const h=TS*.42, mid=TS*.26;
        ctx.strokeStyle='rgba(180,120,40,.22)'; ctx.lineWidth=.8;
        ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(h,0);ctx.lineTo(0,h);ctx.lineTo(-h,0);ctx.closePath();ctx.stroke();
        ctx.strokeStyle='rgba(160,90,25,.16)'; ctx.lineWidth=.65;
        ctx.beginPath();ctx.moveTo(0,-mid);ctx.lineTo(mid,0);ctx.lineTo(0,mid);ctx.lineTo(-mid,0);ctx.closePath();ctx.stroke();
        ctx.restore();
        ctx.strokeStyle='rgba(180,130,40,.13)'; ctx.lineWidth=.6; ctx.strokeRect(px+1,py+1,TS-2,TS-2);
        break;
      }
      case 'concrete': {
        ctx.fillStyle=st.c1; ctx.fillRect(px,py,TS,TS);
        for(let i=0;i<4;i++){ctx.fillStyle=`rgba(220,200,170,${.007+((sd+i)%4)*.004})`;ctx.fillRect(px+(sd*3+i*37)%TS,py+(sd*7+i*19)%TS,1+(sd+i)%2,1);}
        ctx.strokeStyle=st.cj; ctx.lineWidth=1.8;
        if(c%3===0){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+TS);ctx.stroke();}
        if(r%3===0){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+TS,py);ctx.stroke();}
        break;
      }
      case 'tile2': {
        ctx.fillStyle=(r+c)%2===0?st.c1:(st.c2||_dk(st.c1,.72));
        ctx.fillRect(px,py,TS,TS);
        ctx.strokeStyle='rgba(200,185,160,.07)'; ctx.lineWidth=1; ctx.strokeRect(px+.5,py+.5,TS-1,TS-1);
        break;
      }
      default: ctx.fillStyle='#0c0a08'; ctx.fillRect(px,py,TS,TS);
    }
  }

  function _drawElevator(px, py) {
    ctx.fillStyle='#070503'; ctx.fillRect(px,py,TS,TS);
    const p=.5+.4*Math.sin(Date.now()*.003);
    ctx.fillStyle=`rgba(143,170,26,${.07+p*.1})`; ctx.fillRect(px+3,py+3,TS-6,TS-6);
    ctx.strokeStyle=`rgba(143,170,26,${.35+p*.45})`; ctx.lineWidth=1.5; ctx.strokeRect(px+3,py+3,TS-6,TS-6);
    ctx.font=`${TS*.55}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle='#8faa1a'; ctx.fillText('🛗',px+TS/2,py+TS/2);
    if(S.nearElev){ctx.strokeStyle='rgba(143,170,26,.8)';ctx.lineWidth=2.5;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
  }

  function _drawWalls(c0, c1, r0, r1) {
    for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
      if(S.map[r][c]!==T.W) continue;
      const rm=rmNear(r,c); const ac=rm?.acc||'#2a2318';
      const px=c*TS, py=r*TS;
      ctx.fillStyle='#070503'; ctx.fillRect(px,py,TS,TS);
      const bH=Math.round(TS*.44), off=(r%2)*Math.round(TS*.46);
      ctx.fillStyle=_lk('#0c0a08',.07); ctx.fillRect(px,py+1,TS,bH-2);
      ctx.fillStyle=_lk('#0c0a08',.04); ctx.fillRect(px,py+bH+1,TS,bH-2);
      ctx.fillStyle='#040302'; ctx.fillRect(px,py+bH,TS,2);
      const jx=px+(off%TS);
      if(jx>px&&jx<px+TS) ctx.fillRect(jx,py,1.5,bH);
      const jx2=jx+Math.round(TS*.46);
      if(jx2>px&&jx2<px+TS) ctx.fillRect(jx2,py+bH,1.5,bH);
      ctx.fillStyle=ac+'16'; ctx.fillRect(px,py,TS,2);
      const sg=ctx.createLinearGradient(px,py+TS,px,py+TS+5);
      sg.addColorStop(0,'rgba(0,0,0,.5)'); sg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=sg; ctx.fillRect(px,py+TS,TS,5);
      if(rm&&r===rm.r1-1&&c===Math.floor((rm.c1+rm.c2)/2)){
        ctx.fillStyle=ac+'88';
        ctx.font=`600 ${TS*.22}px 'Barlow Condensed',sans-serif`;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(rm.name.toUpperCase(),px+TS/2,py+TS/2);
      }
    }
  }

  function _drawDoors() {
    S.doors.forEach(dd=>{
      const an=S.doorAnim[dd.id];
      const phase=an?an.p:(dd.state==='open'?1:0);
      dd.tiles.forEach(tt=>{
        if(!inBounds(tt.c,tt.r)) return;
        const px=tt.c*TS, py=tt.r*TS;
        const rm=rmAt(tt.r,tt.c)||rmNear(tt.r,tt.c);
        const st=getFloorStyle(rm,S.floor);
        _drawFloorTile(px,py,st,tt.r,tt.c);
        if(phase<1) _drawDoorLeaf(px,py,dd,phase);
        if(S.nearDoor===dd){ctx.strokeStyle='rgba(196,80,26,.6)';ctx.lineWidth=2;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
      });
    });
  }

  function _drawDoorLeaf(px, py, dd, phase) {
    const lk=dd.state==='locked';
    const sameC=dd.tiles.every(t=>t.c===dd.tiles[0].c);
    const w=Math.round(TS*(1-phase)*.82); if(w<2) return;
    ctx.fillStyle=lk?'#160304':'#0c1408'; ctx.fillRect(px,py,TS,TS);
    const dg=ctx.createLinearGradient(px,py,sameC?px+w:px,sameC?py:py+w);
    dg.addColorStop(0,lk?'#360c0c':'#243010');
    dg.addColorStop(.5,lk?'#421010':'#2e3c14');
    dg.addColorStop(1,lk?'#280808':'#1c2608');
    ctx.fillStyle=dg;
    if(sameC) ctx.fillRect(px+2,py+2,w-4,TS-4);
    else      ctx.fillRect(px+2,py+2,TS-4,w-4);
    if(w>TS*.35){
      ctx.strokeStyle=lk?'rgba(130,30,30,.42)':'rgba(90,110,35,.38)'; ctx.lineWidth=.8;
      if(sameC){ctx.strokeRect(px+4,py+5,w-8,TS*.34);ctx.strokeRect(px+4,py+TS*.5,w-8,TS*.34);}
      else     {ctx.strokeRect(px+5,py+4,TS*.34,w-8);ctx.strokeRect(px+TS*.5,py+4,TS*.34,w-8);}
    }
    if(w>TS*.25){
      const hx=sameC?px+w-8:px+TS/2;
      const hy=sameC?py+TS/2:py+w-8;
      ctx.fillStyle=lk?'#7a3838':'#6a7838';
      ctx.beginPath(); ctx.arc(hx,hy,3,0,Math.PI*2); ctx.fill();
    }
    if(lk){ctx.font=`${TS*.3}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',sameC?px+w/2:px+TS/2,sameC?py+TS/2:py+w/2);}
  }

  function _drawObjects(c0, c1, r0, r1) {
    for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
      if(S.map[r][c]!==T.OB) continue;
      const px=c*TS, py=r*TS;
      const rm=rmAt(r,c); if(!rm) continue;
      const st=getFloorStyle(rm,S.floor); _drawFloorTile(px,py,st,r,c);
      ctx.fillStyle='rgba(0,0,0,.32)';
      ctx.beginPath(); ctx.ellipse(px+TS/2,py+TS-4,TS*.27,TS*.08,0,0,Math.PI*2); ctx.fill();
      const decs=S.decors[rm.id]||[];
      const dec=decs.find(d=>d.c===c&&d.r===r);
      if(dec){ctx.font=`${TS*.6}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(dec.e,px+TS/2,py+TS/2-2);}
    }
  }

  function _drawLoot() {
    const now=Date.now();
    S.loot.forEach(l=>{
      if(S.pickedLoot.has(l.id)) return;
      const px=l.c*TS, py=l.r*TS;
      const near=S.nearLoot===l;
      const isDoc=!!l.doc;
      const pulse=.5+.4*Math.sin(now*.004+(l.c+l.r));
      ctx.fillStyle=isDoc?`rgba(100,130,190,${.04+pulse*.1})`:`rgba(196,80,26,${.04+pulse*.09})`;
      ctx.fillRect(px-2,py-2,TS+4,TS+4);
      if(near){ctx.strokeStyle=isDoc?'rgba(100,130,190,.75)':'rgba(196,80,26,.75)';ctx.lineWidth=2;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
      const bob=Math.sin(now*.0026+(l.c+l.r))*2.5;
      ctx.fillStyle='rgba(0,0,0,.28)';
      ctx.beginPath(); ctx.ellipse(px+TS/2,py+TS-4,TS*.26,TS*.08,0,0,Math.PI*2); ctx.fill();
      const ico=l.doc?l.doc.ico:(ITEMS[l.itemId]?.icon||'📦');
      ctx.font=`${TS*.6}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(ico,px+TS/2,py+TS/2-2+bob);
    });
  }

  function _drawPlayer() {
    const px=S.px*TS, py=S.py*TS;
    if(S.rad>15){
      const a=(S.rad-15)/85*.48;
      const g=ctx.createRadialGradient(px+TS/2,py+TS/2,5,px+TS/2,py+TS/2,TS*1.25);
      g.addColorStop(0,`rgba(196,80,26,${a})`); g.addColorStop(1,'rgba(196,80,26,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(px+TS/2,py+TS/2,TS*1.25,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='rgba(0,0,0,.42)';
    ctx.beginPath(); ctx.ellipse(px+TS/2,py+TS-3,TS*.28,TS*.08,0,0,Math.PI*2); ctx.fill();
    _drawFemaleChar(px+TS/2, py+TS/2, S.pdir);
  }

  function _drawFemaleChar(cx, cy, dir) {
    const s=TS;
    ctx.save(); ctx.translate(cx,cy);
    if(dir==='left') ctx.scale(-1,1);
    const hz=S.inv.some(i=>i.id==='hazmat_suit');
    const mk=S.inv.some(i=>i.id==='gas_mask');
    const jc=hz?'#4a7030':'#2a1c12';
    const lc=hz?'#3a5828':'#1c1410';
    // Legs
    ctx.fillStyle=lc; ctx.fillRect(-s*.1,s*.18,s*.08,s*.25); ctx.fillRect(s*.02,s*.18,s*.08,s*.25);
    ctx.fillStyle='#0e0c08'; ctx.fillRect(-s*.11,s*.4,s*.12,s*.08); ctx.fillRect(s*.01,s*.4,s*.12,s*.08);
    // Torso
    const tg=ctx.createLinearGradient(-s*.14,-s*.1,s*.14,-s*.1);
    tg.addColorStop(0,_dk(jc,.75)); tg.addColorStop(.5,jc); tg.addColorStop(1,_dk(jc,.75));
    ctx.fillStyle=tg; ctx.fillRect(-s*.14,-s*.1,s*.28,s*.3);
    // Arms
    ctx.fillStyle=jc; ctx.fillRect(-s*.24,-s*.08,s*.1,s*.2); ctx.fillRect(s*.14,-s*.08,s*.1,s*.2);
    ctx.fillStyle='#c09070'; ctx.fillRect(-s*.25,s*.1,s*.09,s*.08); ctx.fillRect(s*.16,s*.1,s*.09,s*.08);
    // Neck
    ctx.fillStyle='#c09070'; ctx.fillRect(-s*.04,-s*.17,s*.08,s*.08);
    if(!mk){
      // Head
      const hg=ctx.createRadialGradient(0,-s*.27,s*.04,0,-s*.27,s*.13);
      hg.addColorStop(0,'#d0a880'); hg.addColorStop(1,'#a07850');
      ctx.fillStyle=hg; ctx.fillRect(-s*.12,-s*.37,s*.24,s*.23);
      // Hair
      ctx.fillStyle='#1a0e08';
      ctx.fillRect(-s*.14,-s*.38,s*.28,s*.1);
      ctx.fillRect(-s*.14,-s*.38,s*.06,s*.3);
      ctx.fillRect(s*.08,-s*.38,s*.06,s*.3);
      if(dir!=='up'){
        ctx.fillStyle='#0a0806';
        ctx.fillRect(-s*.07,-s*.27,s*.04,s*.05);
        ctx.fillRect(s*.03,-s*.27,s*.04,s*.05);
        ctx.fillStyle='rgba(255,255,255,.45)';
        ctx.fillRect(-s*.065,-s*.26,s*.02,s*.02);
        ctx.fillRect(s*.035,-s*.26,s*.02,s*.02);
      }
    } else {
      // Gas mask
      ctx.fillStyle='#181e18'; ctx.fillRect(-s*.13,-s*.38,s*.26,s*.25);
      ctx.fillStyle='rgba(100,180,100,.18)'; ctx.fillRect(-s*.1,-s*.32,s*.2,s*.14);
      ctx.fillStyle='#0e140e'; ctx.fillRect(-s*.05,-s*.26,s*.1,s*.1);
      ctx.fillStyle='#223022'; ctx.fillRect(-s*.09,-s*.22,s*.05,s*.06); ctx.fillRect(s*.04,-s*.22,s*.05,s*.06);
      ctx.fillStyle='#0a0806'; ctx.fillRect(-s*.13,-s*.38,s*.26,s*.08);
    }
    // Radiation visual
    if(S.rad>55){
      ctx.strokeStyle=`rgba(196,80,26,${(S.rad-55)/45*.52})`;
      ctx.lineWidth=2; ctx.strokeRect(-s*.16,-s*.4,s*.32,s*.86);
    }
    ctx.restore();
  }

  function _drawMinimap() {
    if(!mx||!S.map) return;
    const mW=mm.width, mH=mm.height, tw=mW/MAP_W, th=mH/MAP_H;
    mx.fillStyle='#030201'; mx.fillRect(0,0,mW,mH);
    for(let r=0;r<MAP_H;r++) for(let c=0;c<MAP_W;c++){
      const t=S.map[r][c]; if(t===T.V) continue;
      const rm=rmAt(r,c);
      const st=rm?getFloorStyle(rm,S.floor):null;
      let col='#0c0a07';
      if(t===T.W) col='#050402';
      else if(t===T.EL) col='#0a1804';
      else if(t===T.DL) col='#180604';
      else if(t===T.DC||t===T.DO) col='#121a08';
      else if(st) col=st.c1;
      mx.fillStyle=col; mx.fillRect(c*tw,r*th,Math.max(tw,.5),Math.max(th,.5));
    }
    S.loot.filter(l=>!S.pickedLoot.has(l.id)).forEach(l=>{
      mx.fillStyle=l.doc?'#405898':'#7a2c0e';
      mx.fillRect(l.c*tw,l.r*th,Math.max(tw*1.4,2),Math.max(th*1.4,2));
    });
    mx.fillStyle='#c4501a'; mx.shadowColor='#c4501a'; mx.shadowBlur=5;
    mx.beginPath(); mx.arc(S.px*tw+tw/2,S.py*th+th/2,Math.max(tw,th)*1.35,0,Math.PI*2); mx.fill();
    mx.shadowBlur=0;
  }

  // ── UI UPDATES ────────────────────────────────────────────────────
  function _updVignette() {
    if(!Settings.get('vignette')) return;
    const v=document.getElementById('vignette');
    if(v) v.style.background=`radial-gradient(ellipse at center,transparent 33%,rgba(196,80,26,${S.rad/100*.58}) 100%)`;
  }

  function _updHint() {
    const h=document.getElementById('interact-hint'); if(!h) return;
    let t=null;
    if(S.nearElev) t='[ ENTRÉE ] 🛗 Ascenseur — Monter';
    else if(S.nearLoot) t=`[ ENTRÉE ] ${S.nearLoot.doc?S.nearLoot.doc.ico:(ITEMS[S.nearLoot.itemId]?.icon||'📦')} ${S.nearLoot.doc?S.nearLoot.doc.ttl:(ITEMS[S.nearLoot.itemId]?.name||'Objet')}`;
    else if(S.nearDoor) t=S.nearDoor.state==='open'?'[ ENTRÉE ] Fermer la porte':S.nearDoor.state==='locked'?'[ ENTRÉE ] 🔐 Accès biométrique':'[ ENTRÉE ] Ouvrir la porte';
    h.style.display=t?'block':'none';
    if(t) h.textContent=t;
  }

  function refreshUI()     { refreshStats(); renderInventory(); _updAccess(); _updLeft(); }
  function refreshStats()  {
    const h=S.hp, r=S.rad;
    const hb=document.getElementById('bar-hp');
    if(hb){hb.style.width=h+'%';hb.className='hud-bar-inner bar-hp'+(h<25?' c':h<50?' w':'');}
    const hv=document.getElementById('val-hp');   if(hv) hv.textContent=h;
    const rb=document.getElementById('bar-rad');
    if(rb){rb.style.width=r+'%';rb.className='hud-bar-inner bar-rad'+(r>70?' c':r>40?' w':'');}
    const rv=document.getElementById('val-rad');   if(rv) rv.textContent=r+'%';
    const sv=document.getElementById('val-shield');if(sv) sv.textContent=S.shield;
    const rw=document.getElementById('rad-warn');  if(rw) rw.style.display=r>76?'block':'none';
  }

  function renderInventory() {
    const g=document.getElementById('inventory-grid'); if(!g) return; g.innerHTML='';
    const eqIds=Object.values(S.eq).filter(Boolean).map(i=>i.iid);
    S.inv.forEach((item,idx)=>{
      const d=document.createElement('div');
      const eq=eqIds.includes(item.iid);
      d.className='inv-slot'+(eq?' equipped':item.type==='document'?' doc-type':'');
      d.innerHTML=`<span class="inv-icon">${item.icon}</span><span class="inv-name">${item.name}</span>${eq?'<span class="inv-eq-badge">EQ</span>':''}`;
      d.addEventListener('click',()=>Interactions.selectItem(idx));
      g.appendChild(d);
    });
    for(let i=S.inv.length;i<S.maxInv;i++){
      const e=document.createElement('div'); e.className='inv-slot empty';
      e.innerHTML='<span class="inv-icon" style="opacity:.06">·</span>'; g.appendChild(e);
    }
    const ic=document.getElementById('inv-count'); if(ic) ic.textContent=S.inv.length;
  }

  function _updAccess() {
    const code=S.codes[S.floor];
    const fe=document.getElementById('st-elev');
    if(fe){fe.textContent=code?`✓ Code : ${code}`:'✗ Inconnu';fe.className='stat-val '+(code?'ok':'bad');}
    const fm=document.getElementById('st-maint');
    if(fm){fm.textContent=S.flags.maint?'✓ Badge OK':'✗ Sans badge';fm.className='stat-val '+(S.flags.maint?'ok':'bad');}
  }

  function _updLeft() {
    const rm=rmAt(S.py,S.px);
    const sz=document.getElementById('st-zone');
    if(sz){sz.textContent=rm?rm.name:'—';if(rm)sz.style.color=rm.acc||'var(--rust)';}
    const sr=document.getElementById('st-rad');   if(sr) sr.textContent=`${S.stats.radTotal} mSv`;
    const si=document.getElementById('st-items'); if(si) si.textContent=S.stats.items;
  }

  function updateDocsPanel() {
    const docs=S.inv.filter(i=>i.type==='document'||i.doc);
    const p=document.getElementById('docs-panel'); if(!p) return;
    if(!docs.length){p.innerHTML='<div class="no-docs">Aucun document.</div>';return;}
    p.innerHTML=docs.map((d,i)=>`
      <div class="doc-entry" onclick="Game.clickDoc(${i})">
        <div class="doc-entry-title">${d.icon} ${d.name}</div>
        <div class="doc-entry-preview">${(d.desc||d.description||'').slice(0,40)}</div>
      </div>`).join('');
  }

  function notif(txt, type='ok') {
    const el=document.getElementById('notif'); if(!el) return;
    el.textContent=txt; el.style.display='block'; el.className=type==='ok'?'ok':'bad';
    if(S.notTO) clearTimeout(S.notTO);
    S.notTO=setTimeout(()=>{el.style.display='none';},3200);
  }

  function log(txt, cls='l-info') {
    const p=document.getElementById('log-body'); if(!p) return;
    const l=document.createElement('div'); l.className='log-line';
    const ts=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    l.innerHTML=`<span class="log-ts">[${ts}]</span><span class="${cls}">${txt}</span>`;
    p.appendChild(l); p.scrollTop=p.scrollHeight;
    while(p.children.length>90) p.removeChild(p.firstChild);
  }

  function closeModal(id) { document.getElementById(id).classList.remove('open'); }

  // ── PAUSE ─────────────────────────────────────────────────────────
  function openPause() {
    const po=document.getElementById('pause-overlay'); if(!po) return;
    po.classList.add('open'); S.paused=true;
    const pl=document.getElementById('pause-sublabel'); if(pl) pl.textContent=`${_name} — Étage ${S.floor}/9`;
    const ph=document.getElementById('pause-hp');    if(ph) ph.textContent=S.hp;
    const pr=document.getElementById('pause-rad');   if(pr) pr.textContent=S.rad+'%';
    const ps=document.getElementById('pause-score'); if(ps) ps.textContent=Score.get().toLocaleString();
    Audio.stopGeiger();
  }

  function closePause() {
    const po=document.getElementById('pause-overlay'); if(!po) return;
    po.classList.remove('open'); S.paused=false;
    Audio.startGeiger(S.rad);
  }

  // ── INPUT ─────────────────────────────────────────────────────────
  function _setupInput() {
    document.addEventListener('keydown', e=>{
      if(S.dead) return;
      const isModal=document.querySelector('.modal-bg.open');
      if(e.key==='Escape'){
        if(isModal){closeModal(isModal.id);return;}
        if(S.paused){closePause();return;}
        openPause(); return;
      }
      if(S.paused||isModal) return;
      S.keys[e.key]=true;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
      if(e.key==='Enter'){e.preventDefault();Audio.resume();Interactions.doInteract();_updLeft();refreshUI();}
      if(e.key==='e'||e.key==='E') Interactions.doExamine();
    });
    document.addEventListener('keyup', e=>delete S.keys[e.key]);
  }

  // ── PUBLIC API ────────────────────────────────────────────────────
  function start(playerName) {
    _name=playerName||'Survivante';
    document.getElementById('hud-player').textContent=_name;
    initState(); _initCanvas(); _setupInput();
    Interactions.loadFloor(1);
    lt=performance.now();
    requestAnimationFrame(_loop);
  }

  function restart() {
    if(S.af) cancelAnimationFrame(S.af);
    const po=document.getElementById('pause-overlay'); if(po) po.classList.remove('open');
    document.getElementById('screen-gameover').classList.remove('active');
    document.getElementById('screen-game').classList.add('active');
    start(_name);
  }

  function goHome() {
    const po=document.getElementById('pause-overlay'); if(po) po.classList.remove('open');
    if(S.af) cancelAnimationFrame(S.af);
    Audio.stopGeiger(); S.dead=true;
    App.showScreen('home');
  }

  function clickDoc(i) {
    const d=S.inv.filter(x=>x.type==='document'||x.doc)[i];
    if(d?.doc) Interactions.showDoc(d.doc,'read');
  }

  return {
    start, restart, goHome, clickDoc,
    openPause, closePause,
    refreshUI, refreshStats, renderInventory,
    updateDocsPanel, notif, log, closeModal,
    triggerShake,
    // Expose drawing helpers for interactions
    _dk, _lk,
  };
})();