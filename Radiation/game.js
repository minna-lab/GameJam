// ☢ HORIZON — main.js
// Moteur de jeu : carte, rendu, physique, interactions, HUD

const Game = (() => {
  const TS=48, V=0,F=1,W=2,DO=3,DC=4,DL=5,EL=6,OB=7, MW=46,MH=38;
  let S={}, _name='Survivante', cv, ctx, mm, mx, lt=0;

  // ═══════════════════════ MAP BUILDERS ═══════════════════════
  function buildRDC(){
    const M=[]; for(let r=0;r<MH;r++) M.push(new Uint8Array(MW).fill(V));
    function room(r1,c1,r2,c2){for(let c=c1-1;c<=c2+1;c++){if(inB(c,r1-1))M[r1-1][c]=W;if(inB(c,r2+1))M[r2+1][c]=W;}for(let r=r1-1;r<=r2+1;r++){if(inB(c1-1,r))M[r][c1-1]=W;if(inB(c2+1,r))M[r][c2+1]=W;}for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(inB(c,r))M[r][c]=F;}
    for(let r=14;r<=18;r++)for(let c=1;c<=44;c++)if(inB(c,r))M[r][c]=F;
    room(1,1,12,13);room(1,15,12,24);room(1,26,12,44);room(20,1,31,12);room(20,14,27,23);room(20,25,27,33);room(20,35,27,44);room(29,14,36,44);room(29,1,36,12);
    for(let r=14;r<=18;r++)for(let c=1;c<=44;c++)if(inB(c,r))M[r][c]=F;
    function d2(r,c,lk,req){if(!inB(c,r)||!inB(c+1,r))return null;M[r][c]=lk?DL:DC;M[r][c+1]=lk?DL:DC;return{id:'d'+r+c,tiles:[{r,c},{r,c:c+1}],locked:lk?'bio':'none',reqItem:req,state:'closed'};}
    function d2v(r,c,lk,req){if(!inB(c,r)||!inB(c,r+1))return null;M[r][c]=lk?DL:DC;M[r+1][c]=lk?DL:DC;return{id:'d'+r+c,tiles:[{r,c},{r:r+1,c}],locked:lk?'bio':'none',reqItem:req,state:'closed'};}
    const doors=[d2(13,4),d2(13,9),d2v(3,14),d2v(6,14),d2(13,18),d2(13,30),d2(13,38),d2(19,4,true,'keycard_maintenance'),d2(19,17),d2(19,28),d2(19,38),d2(28,17),d2(28,28),d2(32,4)].filter(Boolean);
    [[22,18],[22,19],[23,18],[23,19]].forEach(([r,c])=>{if(inB(c,r))M[r][c]=EL;});
    const rooms=[
      {id:'rdc_hall',  c1:1, r1:1, c2:13,r2:12,name:"Hall d'Accueil",  acc:'#c4943a',fl:'chevron'},
      {id:'rdc_recep', c1:15,r1:1, c2:24,r2:12,name:"Réception",       acc:'#4a9460',fl:'marble'},
      {id:'rdc_rest',  c1:26,r1:1, c2:44,r2:12,name:"Restaurant",      acc:'#4468aa',fl:'herring'},
      {id:'rdc_corr',  c1:1, r1:14,c2:44,r2:18,name:"Couloir RDC",     acc:'#c45030',fl:'carpet'},
      {id:'rdc_maint', c1:1, r1:20,c2:12,r2:31,name:"Maintenance",     acc:'#c47830',fl:'concrete'},
      {id:'rdc_elevh', c1:14,r1:20,c2:23,r2:27,name:"Hall Ascenseur",  acc:'#8faa1a',fl:'marble'},
      {id:'rdc_staff', c1:25,r1:20,c2:33,r2:27,name:"Salle Personnel", acc:'#8888cc',fl:'chevron'},
      {id:'rdc_toilet',c1:35,r1:20,c2:44,r2:27,name:"Sanitaires",      acc:'#40a890',fl:'tile2'},
      {id:'rdc_stock', c1:14,r1:29,c2:44,r2:36,name:"Stockage",        acc:'#a040cc',fl:'concrete'},
      {id:'rdc_kitchen',c1:1,r1:29,c2:12,r2:36,name:"Cuisine",         acc:'#c86030',fl:'tile2'},
    ];
    const decors={
      rdc_hall:   [{c:3,r:3,e:'🛋️'},{c:7,r:3,e:'🪴'},{c:11,r:3,e:'🖼️'},{c:3,r:9,e:'🛋️'},{c:10,r:9,e:'💡'},{c:12,r:7,e:'🖼️'}],
      rdc_recep:  [{c:17,r:3,e:'🗂️'},{c:20,r:3,e:'🔔'},{c:23,r:3,e:'🖥️'},{c:23,r:10,e:'🪑'},{c:16,r:7,e:'🖼️'}],
      rdc_rest:   [{c:28,r:3,e:'🍽️'},{c:33,r:3,e:'🍽️'},{c:38,r:3,e:'🍽️'},{c:28,r:9,e:'🍽️'},{c:33,r:9,e:'🍽️'},{c:38,r:9,e:'🍽️'},{c:43,r:4,e:'🪴'},{c:43,r:10,e:'🪴'}],
      rdc_corr:   [{c:7,r:15,e:'💡'},{c:18,r:15,e:'💡'},{c:29,r:15,e:'💡'},{c:40,r:15,e:'💡'},{c:13,r:16,e:'🪴'},{c:35,r:16,e:'🪴'}],
      rdc_maint:  [{c:3,r:22,e:'⚙️'},{c:6,r:22,e:'🔧'},{c:10,r:23,e:'🗄️'},{c:2,r:27,e:'🔌'},{c:11,r:26,e:'⚙️'}],
      rdc_elevh:  [{c:15,r:23,e:'💡'},{c:22,r:23,e:'💡'}],
      rdc_staff:  [{c:26,r:22,e:'💼'},{c:29,r:24,e:'🪑'},{c:32,r:23,e:'☕'}],
      rdc_toilet: [{c:37,r:22,e:'🚽'},{c:41,r:22,e:'🚽'},{c:37,r:26,e:'🚿'}],
      rdc_stock:  [{c:16,r:31,e:'📦'},{c:22,r:31,e:'📦'},{c:28,r:31,e:'📦'},{c:38,r:30,e:'🗄️'}],
      rdc_kitchen:[{c:3,r:30,e:'🍳'},{c:6,r:30,e:'🔪'},{c:9,r:30,e:'🥘'},{c:2,r:33,e:'🗄️'}],
    };
    const docs={
      rdc_corr:{id:'dc0',ico:'⚠️',ttl:'NOTE SÉCURITÉ — URGENT',sub:'Chef Sécurité — 14/03/2027',body:'Issues verrouillées par ordre de la Direction.\n\nCODE ASCENSEUR\nÉtage 1 → Étage 2 :\n\n',code:'7419'},
      rdc_hall:{id:'dh0',ico:'📋',ttl:'Brochure de Bienvenue',sub:'Direction Hôtel Horizon',body:'Bienvenue à l\'Hôtel Horizon ✦ Cinq étoiles depuis 1987.\n\n[NOTE MANUSCRITE]\nAccès Maintenance = badge rouge biométrique obligatoire depuis l\'incident B3.',code:null},
      rdc_maint:{id:'dm0',ico:'📋',ttl:'Rapport Circuit 7',sub:'Marc Dubois — Chef Technicien',body:'Anomalie circuit 7. Rayonnement anormal gaine 4-B.\n\nMoreau refuse l\'arrêt d\'urgence.\n\nSI VOUS LISEZ CECI :\nCircuit 7 = réacteur SIGMA. Ne coupez PAS les autres.',code:null},
    };
    return{M,rooms,doors,decors,elev:[[22,18],[22,19],[23,18],[23,19]],docs,loot:{rdc_hall:'rdc_hall',rdc_recep:'rdc_recep',rdc_rest:'rdc_rest',rdc_kitchen:'rdc_kitchen',rdc_corr:'rdc_corr',rdc_maint:'rdc_maint',rdc_staff:'default',rdc_toilet:'default',rdc_stock:'default'},spawnX:7,spawnY:16};
  }

  const PALS=[
    {corr:'#2a0808',cj:'#180404',acc:'#a03030',ca:'#706080',c1:'#1a1208',c2:'#120e04',cj2:'#0a0802'},
    {corr:'#08142a',cj:'#040e1c',acc:'#2a50b0',ca:'#506070',c1:'#0e1018',c2:'#0a0c14',cj2:'#060810'},
    {corr:'#082a18',cj:'#04180c',acc:'#287050',ca:'#607060',c1:'#0c1610',c2:'#081208',cj2:'#060e06'},
    {corr:'#2a1e08',cj:'#181204',acc:'#9a7020',ca:'#907050',c1:'#181008',c2:'#120c04',cj2:'#0c0804'},
  ];

  function buildTFloor(fl){
    const v=(fl-2)%4,pal=PALS[v],M=[];
    for(let r=0;r<MH;r++)M.push(new Uint8Array(MW).fill(V));
    const n=fl*100;
    function corr(r1,c1,r2,c2){for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(inB(c,r))M[r][c]=F;}
    function ch(r1,c1,r2,c2,w){for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(inB(c,r)&&M[r][c]===V)M[r][c]=F;if(w.top)for(let c=c1-1;c<=c2+1;c++)if(inB(c,r1-1)&&M[r1-1][c]===V)M[r1-1][c]=W;if(w.bot)for(let c=c1-1;c<=c2+1;c++)if(inB(c,r2+1)&&M[r2+1][c]===V)M[r2+1][c]=W;if(w.left)for(let r=r1-1;r<=r2+1;r++)if(inB(c1-1,r)&&M[r][c1-1]===V)M[r][c1-1]=W;if(w.right)for(let r=r1-1;r<=r2+1;r++)if(inB(c2+1,r)&&M[r][c2+1]===V)M[r][c2+1]=W;[[r1-1,c1-1],[r1-1,c2+1],[r2+1,c1-1],[r2+1,c2+1]].forEach(([r,c])=>{if(inB(c,r)&&M[r][c]===V)M[r][c]=W;});}
    function d2h(id,r,c,lk,req){if(!inB(c,r)||!inB(c+1,r))return null;M[r][c]=lk?DL:DC;M[r][c+1]=lk?DL:DC;return{id,tiles:[{r,c},{r,c:c+1}],locked:lk?'bio':'none',reqItem:req,state:'closed'};}
    function d2v(id,r,c,lk,req){if(!inB(c,r)||!inB(c,r+1))return null;M[r][c]=lk?DL:DC;M[r+1][c]=lk?DL:DC;return{id,tiles:[{r,c},{r:r+1,c}],locked:lk?'bio':'none',reqItem:req,state:'closed'};}
    const rooms=[],doors=[],decors={};let elev=[],sx=0,sy=0;
    if(v===0){
      corr(14,1,18,44);corr(19,19,32,26);for(let c=1;c<=44;c++)if(inB(c,13)&&M[13][c]===V)M[13][c]=W;
      ch(2,1,12,10,{top:true,left:true,right:true,bot:false});ch(2,12,12,21,{top:true,left:false,right:true,bot:false});ch(2,23,12,32,{top:true,left:false,right:true,bot:false});ch(2,34,12,44,{top:true,left:false,right:true,bot:false});
      doors.push(d2h('dN1',13,4));doors.push(d2h('dN2',13,15));doors.push(d2h('dN3',13,26));doors.push(d2h('dN4',13,37));
      ch(20,1,32,17,{top:false,left:true,right:false,bot:true});for(let r=20;r<=32;r++)if(inB(18,r)&&M[r][18]===V)M[r][18]=W;doors.push(d2v('dSL',24,18));
      ch(20,28,32,44,{top:false,left:false,right:true,bot:true});for(let r=20;r<=32;r++)if(inB(27,r)&&M[r][27]===V)M[r][27]=W;doors.push(d2v('dSR',24,27));
      elev=[[29,21],[29,22],[30,21],[30,22]];sx=5;sy=15;
      rooms.push({id:'c0',c1:1,r1:14,c2:44,r2:18,name:'Couloir',acc:pal.acc,fl:'corrT'});rooms.push({id:'b0',c1:19,r1:19,c2:26,r2:32,name:'Couloir (aile)',acc:pal.acc,fl:'corrT'});
      ['N1','N2','N3','N4'].forEach((k,i)=>rooms.push({id:'ch'+k,c1:[1,12,23,34][i],r1:2,c2:[10,21,32,44][i],r2:12,name:`Ch.${n+i+1}`,acc:pal.ca,fl:'herring0'}));
      rooms.push({id:'chSL',c1:1,r1:20,c2:17,r2:32,name:`Ch.${n+5}`,acc:pal.ca,fl:'herring0'});rooms.push({id:'chSR',c1:28,r1:20,c2:44,r2:32,name:`Ch.${n+6}`,acc:pal.ca,fl:'herring0'});
      decors.c0=[{c:7,r:15,e:'💡'},{c:18,r:15,e:'💡'},{c:29,r:15,e:'💡'},{c:40,r:15,e:'💡'},{c:13,r:16,e:'🪴'},{c:35,r:16,e:'🪴'}];decors.b0=[{c:22,r:22,e:'💡'},{c:22,r:28,e:'💡'}];
      ['chN1','chN2','chN3','chN4','chSL','chSR'].forEach((id,i)=>{const xs=[[4,8,9,2],[14,18,19,13],[25,29,30,24],[36,40,43,35],[4,9,14,2],[31,37,42,29]][i];const ys=[[5,5,9,11],[5,5,9,11],[5,5,9,11],[5,5,9,11],[24,24,28,30],[24,24,28,30]][i];decors[id]=[{c:xs[0],r:ys[0],e:'🛏️'},{c:xs[1],r:ys[1],e:'🪑'},{c:xs[2],r:ys[2],e:'🖼️'},{c:xs[3],r:ys[3],e:'📺'}];});
    } else if(v===1){
      corr(18,1,22,44);corr(5,18,17,25);for(let c=1;c<=44;c++)if(inB(c,23)&&M[23][c]===V)M[23][c]=W;
      ch(25,1,35,10,{top:false,left:true,right:true,bot:true});ch(25,12,35,21,{top:false,left:false,right:true,bot:true});ch(25,23,35,32,{top:false,left:false,right:true,bot:true});ch(25,34,35,44,{top:false,left:false,right:true,bot:true});
      doors.push(d2h('dS1',23,4));doors.push(d2h('dS2',23,15));doors.push(d2h('dS3',23,26));doors.push(d2h('dS4',23,37));
      ch(2,1,16,16,{top:true,left:true,right:false,bot:false});for(let r=2;r<=16;r++)if(inB(17,r)&&M[r][17]===V)M[r][17]=W;doors.push(d2v('dBL',8,17));
      ch(2,27,16,44,{top:true,left:false,right:true,bot:false});for(let r=2;r<=16;r++)if(inB(26,r)&&M[r][26]===V)M[r][26]=W;doors.push(d2v('dBR',8,26));
      elev=[[7,20],[7,21],[8,20],[8,21]];sx=5;sy=19;
      rooms.push({id:'c1',c1:1,r1:18,c2:44,r2:22,name:'Couloir',acc:pal.acc,fl:'corrT'});rooms.push({id:'b1',c1:18,r1:5,c2:25,r2:17,name:'Couloir (aile)',acc:pal.acc,fl:'corrT'});
      ['S1','S2','S3','S4'].forEach((k,i)=>rooms.push({id:'ch'+k,c1:[1,12,23,34][i],r1:25,c2:[10,21,32,44][i],r2:35,name:`Ch.${n+i+1}`,acc:pal.ca,fl:'herring1'}));
      rooms.push({id:'chBL',c1:1,r1:2,c2:16,r2:16,name:`Ch.${n+5}`,acc:pal.ca,fl:'herring1'});rooms.push({id:'chBR',c1:27,r1:2,c2:44,r2:16,name:`Ch.${n+6}`,acc:pal.ca,fl:'herring1'});
      decors.c1=[{c:7,r:19,e:'💡'},{c:18,r:19,e:'💡'},{c:29,r:19,e:'💡'},{c:40,r:19,e:'💡'},{c:13,r:20,e:'🪴'},{c:35,r:20,e:'🪴'}];decors.b1=[{c:21,r:9,e:'💡'},{c:21,r:14,e:'💡'}];
      ['chS1','chS2','chS3','chS4','chBL','chBR'].forEach((id,i)=>{decors[id]=[{c:[4,14,25,36,4,30][i],r:[28,28,28,28,6,6][i],e:'🛏️'},{c:[8,18,29,40,10,38][i],r:[28,28,28,28,6,6][i],e:'🪑'},{c:[9,19,30,43,14,42][i],r:[32,32,32,32,11,11][i],e:'🖼️'},{c:[2,13,24,35,2,28][i],r:[33,33,33,33,14,14][i],e:'📺'}];});
    } else if(v===2){
      corr(1,19,36,24);corr(15,25,22,44);for(let r=1;r<=36;r++)if(inB(18,r)&&M[r][18]===V)M[r][18]=W;
      ch(2,2,11,17,{top:true,left:true,right:false,bot:true});ch(13,2,22,17,{top:false,left:true,right:false,bot:true});ch(24,2,35,17,{top:false,left:true,right:false,bot:true});
      doors.push(d2v('dGL1',5,18));doors.push(d2v('dGL2',16,18));doors.push(d2v('dGL3',28,18));
      for(let r=1;r<=36;r++)if(inB(25,r)&&M[r][25]===V)M[r][25]=W;
      ch(2,26,13,44,{top:true,left:false,right:true,bot:true});ch(24,26,35,44,{top:true,left:false,right:true,bot:true});
      doors.push(d2v('dGR1',6,25));doors.push(d2v('dGR2',28,25));
      elev=[[17,40],[17,41],[18,40],[18,41]];sx=21;sy=17;
      rooms.push({id:'c2',c1:19,r1:1,c2:24,r2:36,name:'Couloir',acc:pal.acc,fl:'corrT'});rooms.push({id:'b2',c1:25,r1:15,c2:44,r2:22,name:'Couloir (aile)',acc:pal.acc,fl:'corrT'});
      rooms.push({id:'chGL1',c1:2,r1:2,c2:17,r2:11,name:`Ch.${n+1}`,acc:pal.ca,fl:'herring2'});rooms.push({id:'chGL2',c1:2,r1:13,c2:17,r2:22,name:`Ch.${n+2}`,acc:pal.ca,fl:'herring2'});rooms.push({id:'chGL3',c1:2,r1:24,c2:17,r2:35,name:`Ch.${n+3}`,acc:pal.ca,fl:'herring2'});
      rooms.push({id:'chGR1',c1:26,r1:2,c2:44,r2:13,name:`Ch.${n+4}`,acc:pal.ca,fl:'herring2'});rooms.push({id:'chGR2',c1:26,r1:24,c2:44,r2:35,name:`Ch.${n+5}`,acc:pal.ca,fl:'herring2'});
      decors.c2=[{c:21,r:5,e:'💡'},{c:21,r:13,e:'💡'},{c:21,r:21,e:'💡'},{c:21,r:29,e:'💡'},{c:22,r:9,e:'🪴'},{c:22,r:25,e:'🪴'}];decors.b2=[{c:30,r:17,e:'💡'},{c:38,r:17,e:'💡'}];
      ['chGL1','chGL2','chGL3','chGR1','chGR2'].forEach((id,i)=>{decors[id]=[{c:[5,5,5,30,30][i],r:[5,16,27,5,27][i],e:'🛏️'},{c:[11,11,11,37,37][i],r:[5,16,27,5,27][i],e:'🪑'},{c:[15,15,15,42,42][i],r:[8,20,32,10,31][i],e:'🖼️'},{c:[3,3,3,27,27][i],r:[9,20,33,11,33][i],e:'📺'}];});
    } else {
      corr(1,20,36,25);corr(14,1,21,19);for(let r=1;r<=36;r++)if(inB(26,r)&&M[r][26]===V)M[r][26]=W;
      ch(2,27,11,44,{top:true,left:false,right:true,bot:true});ch(13,27,22,44,{top:false,left:false,right:true,bot:true});ch(24,27,35,44,{top:false,left:false,right:true,bot:true});
      doors.push(d2v('dDR1',5,26));doors.push(d2v('dDR2',16,26));doors.push(d2v('dDR3',28,26));
      for(let r=1;r<=36;r++)if(inB(19,r)&&M[r][19]===V)M[r][19]=W;
      ch(2,2,12,18,{top:true,left:true,right:false,bot:true});ch(24,2,35,18,{top:true,left:true,right:false,bot:true});
      doors.push(d2v('dDL1',6,19));doors.push(d2v('dDL2',28,19));
      elev=[[16,3],[16,4],[17,3],[17,4]];sx=22;sy=16;
      rooms.push({id:'c3',c1:20,r1:1,c2:25,r2:36,name:'Couloir',acc:pal.acc,fl:'corrT'});rooms.push({id:'b3',c1:1,r1:14,c2:19,r2:21,name:'Couloir (aile)',acc:pal.acc,fl:'corrT'});
      rooms.push({id:'chDR1',c1:27,r1:2,c2:44,r2:11,name:`Ch.${n+1}`,acc:pal.ca,fl:'herring3'});rooms.push({id:'chDR2',c1:27,r1:13,c2:44,r2:22,name:`Ch.${n+2}`,acc:pal.ca,fl:'herring3'});rooms.push({id:'chDR3',c1:27,r1:24,c2:44,r2:35,name:`Ch.${n+3}`,acc:pal.ca,fl:'herring3'});
      rooms.push({id:'chDL1',c1:2,r1:2,c2:18,r2:12,name:`Ch.${n+4}`,acc:pal.ca,fl:'herring3'});rooms.push({id:'chDL2',c1:2,r1:24,c2:18,r2:35,name:`Ch.${n+5}`,acc:pal.ca,fl:'herring3'});
      decors.c3=[{c:22,r:5,e:'💡'},{c:22,r:13,e:'💡'},{c:22,r:21,e:'💡'},{c:22,r:29,e:'💡'},{c:23,r:9,e:'🪴'},{c:23,r:25,e:'🪴'}];decors.b3=[{c:8,r:17,e:'💡'},{c:14,r:17,e:'💡'}];
      ['chDR1','chDR2','chDR3','chDL1','chDL2'].forEach((id,i)=>{decors[id]=[{c:[30,30,30,5,5][i],r:[5,16,27,5,27][i],e:'🛏️'},{c:[38,38,38,12,12][i],r:[5,16,27,5,27][i],e:'🪑'},{c:[42,42,42,16,16][i],r:[8,19,31,9,31][i],e:'🖼️'},{c:[28,28,28,3,3][i],r:[9,20,33,10,33][i],e:'📺'}];});
    }
    elev.forEach(([r,c])=>{if(inB(c,r))M[r][c]=EL;});
    Object.values(decors).flat().forEach(d=>{if(inB(d.c,d.r)&&M[d.r][d.c]===F)M[d.r][d.c]=OB;});
    const code=String(1000+Math.floor(Math.random()*8999));
    const mainCorrId=v===0?'c0':v===1?'c1':v===2?'c2':'c3';
    const docs={[mainCorrId]:{id:`dc${fl}`,ico:'⚠️',ttl:`Note Sécurité — Étage ${fl}`,sub:'Sécurité Interne',body:`CODE ASCENSEUR\nÉtage ${fl} → Étage ${fl+1} :\n\n`,code}};
    return{M,rooms,doors:doors.filter(Boolean),decors,elev,docs,loot:{},spawnX:sx,spawnY:sy,code};
  }

  // ═══════════════════════ HELPERS ═══════════════════════
  function inB(c,r){return c>=0&&r>=0&&c<MW&&r<MH;}
  function rmAt(r,c){for(const rm of S.rooms)if(r>=rm.r1&&r<=rm.r2&&c>=rm.c1&&c<=rm.c2)return rm;return null;}
  function rmNear(r,c){for(const rm of S.rooms)if(r>=rm.r1-1&&r<=rm.r2+1&&c>=rm.c1-1&&c<=rm.c2+1)return rm;return null;}
  function darken(hex,f){const p=h=>Math.round((parseInt(hex.slice(h,h+2),16)||0)*f);return`rgb(${p(1)},${p(3)},${p(5)})`;}
  function lighten(hex,f){const p=h=>Math.min(255,(parseInt(hex.slice(h,h+2),16)||0)+Math.round(255*f));return`rgb(${p(1)},${p(3)},${p(5)})`;}

  // ═══════════════════════ FLOOR STYLES ═══════════════════════
  function getFStyle(rm){
    if(!rm)return{type:'void',c1:'#040302'};
    const id=rm.fl||'';const fl=S.floor;const v=(fl-2)%4,pal=fl>1?PALS[v]:null;
    if(id==='corrT')return{type:'carpet',c1:pal?.corr||'#2a0808',cj:pal?.cj||'#180404'};
    if(id.startsWith('herring'))return{type:'herring',c1:pal?.c1||'#1a1208',c2:pal?.c2||'#120e04',cj:pal?.cj2||'#0a0802'};
    const fs={chevron:{type:'chevron',c1:'#2e1a06',c2:'#201204',cj:'#140a02'},marble:{type:'marble',c1:'#121a10',c2:'#0e160c',cj:'#0a1008'},herring:{type:'herring',c1:'#1a1208',c2:'#120e04',cj:'#0a0802'},concrete:{type:'concrete',c1:'#141210',c2:'#100e0c',cj:'#0c0a08'},tile2:{type:'tile2',c1:'#0a1212',c2:'#060e0e',cj:'#040a0a'},carpet:{type:'carpet',c1:'#2a0808',cj:'#180404'}};
    return fs[id]||{type:'concrete',c1:'#141210',cj:'#0c0a08'};
  }

  // ═══════════════════════ LOAD FLOOR ═══════════════════════
  function loadFloor(fl){
    S.floor=fl;S.pickedLoot=new Set();
    let built;
    if(fl===1)built=buildRDC();
    else{built=buildTFloor(fl);S.codes[fl]=built.code;}
    S.map=built.M;S.rooms=built.rooms;S.doors=built.doors;
    S.decors=built.decors;S.elev=built.elev;S.floorDocs=built.docs||{};
    S.px=built.spawnX;S.py=built.spawnY;
    if(fl===1)Object.entries(built.decors).forEach(([,ds])=>ds.forEach(d=>{if(inB(d.c,d.r)&&built.M[d.r][d.c]===F)built.M[d.r][d.c]=OB;}));
    S.loot=_buildLoot(fl,built.loot||{},built.docs||{});
    _updateCam();
    document.getElementById('hud-floor').textContent=fl;
    document.getElementById('st-floor').textContent=`${fl}/9`;
    _log(fl===1?'☢ Vous vous réveillez dans la réception. L\'air sent la cendre.':'☢ Étage '+fl+'. Le Geiger s\'affole.','l-system');
    _refreshUI();
    Audio.startGeiger(S.rad);
  }

  function _buildLoot(fl,pools,docs){
    const list=[];
    S.rooms.forEach(rm=>{
      const poolKey=pools[rm.id]||'default';
      const pool=LOOT_POOLS[poolKey]||LOOT_POOLS.default;
      const cnt=2+Math.floor(Math.random()*3);
      for(let i=0;i<cnt;i++){
        const itId=pool[Math.floor(Math.random()*pool.length)];
        if(!ITEMS[itId])continue;
        _placeItem(list,`l_${rm.id}_${i}`,rm,itId,null);
      }
      const doc=docs[rm.id];
      if(doc&&!S.pickedDocs.has(doc.id))_placeItem(list,`d_${rm.id}_${fl}`,rm,null,doc);
    });
    return list;
  }

  function _placeItem(list,id,rm,itemId,doc){
    for(let t=0;t<80;t++){
      const lr=rm.r1+Math.floor(Math.random()*(rm.r2-rm.r1+1));
      const lc=rm.c1+Math.floor(Math.random()*(rm.c2-rm.c1+1));
      if(inB(lc,lr)&&S.map[lr][lc]===F){list.push({id,r:lr,c:lc,itemId,doc,rm:rm.id});return;}
    }
  }

  // ═══════════════════════ CANVAS ═══════════════════════
  function _initCv(){
    cv=document.getElementById('game-canvas');ctx=cv.getContext('2d');
    mm=document.getElementById('mini-map');mx=mm.getContext('2d');
    _resize();window.addEventListener('resize',_resize);
  }
  function _resize(){const a=document.getElementById('panel-center');if(a){cv.width=a.clientWidth;cv.height=a.clientHeight;}}

  // ═══════════════════════ GAME LOOP ═══════════════════════
  function _loop(ts){
    S.af=requestAnimationFrame(_loop);
    const dt=Math.min(ts-lt,50);lt=ts;
    if(!S.dead&&!S.paused)_upd(dt);
    _draw();
  }

  function _upd(dt){
    S.mvT-=dt;if(S.mvT<=0){_doMv();S.mvT=110;}
    S.ambT-=dt;if(S.ambT<=0){_doAmb();S.ambT=5000;_updLeft();}
    Object.entries(S.doorAnim).forEach(([id,a])=>{a.p+=(a.op?1:-1)*dt/180;a.p=Math.max(0,Math.min(1,a.p));if(!a.op&&a.p<=0)delete S.doorAnim[id];});
    S.nearDoor=_findNearDoor();S.nearLoot=_findNearLoot();S.nearElev=_isNearElev();
    _updateCam();_updVig();_updHint();
    const gd=document.getElementById('geiger-dot');
    if(gd)gd.style.animationDuration=S.rad>70?'.1s':S.rad>40?'.4s':'1.2s';
    Audio.ambientHum(S.rad);
  }

  function _doMv(){
    let dx=0,dy=0;
    if(S.keys['ArrowLeft']||S.keys['a']){dx=-1;S.pdir='left';}
    if(S.keys['ArrowRight']||S.keys['d']){dx=1;S.pdir='right';}
    if(S.keys['ArrowUp']||S.keys['w']){dy=-1;S.pdir='up';}
    if(S.keys['ArrowDown']||S.keys['s']){dy=1;S.pdir='down';}
    if(!dx&&!dy)return;
    const nc=S.px+dx,nr=S.py+dy;if(!inB(nc,nr))return;
    const t=S.map[nr][nc];
    if(t===V||t===W||t===OB||t===EL||t===DC||t===DL)return;
    S.px=nc;S.py=nr;
    if(Math.random()<0.015)Score.add('explore',2);
  }

  function _findNearDoor(){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nc=S.px+dx,nr=S.py+dy;if(!inB(nc,nr))continue;const t=S.map[nr][nc];if(t===DC||t===DL||t===DO){const dd=S.doors.find(d=>d.tiles.some(tt=>tt.r===nr&&tt.c===nc));if(dd)return dd;}}return null;}
  function _findNearLoot(){for(const l of S.loot)if(!S.pickedLoot.has(l.id)&&Math.abs(l.c-S.px)+Math.abs(l.r-S.py)<=1.5)return l;return null;}
  function _isNearElev(){for(const[r,c]of S.elev)if(Math.abs(c-S.px)<=2&&Math.abs(r-S.py)<=2)return true;return false;}

  // ═══════════════════════ INTERACTIONS ═══════════════════════
  function _doInteract(){
    if(S.nearElev){_openElev();return;}
    if(S.nearLoot){_pickLoot(S.nearLoot);return;}
    if(S.nearDoor){_doDoor(S.nearDoor);}
  }

  function _doDoor(dd){
    Audio.play('door');
    if(dd.state==='open'){dd.state='closed';dd.tiles.forEach(t=>{S.map[t.r][t.c]=DC;});S.doorAnim[dd.id]={p:1,op:false};_log('Porte refermée.','l-action');}
    else if(dd.state==='closed'){dd.state='open';dd.tiles.forEach(t=>{S.map[t.r][t.c]=DO;});S.doorAnim[dd.id]={p:0,op:true};_log('Porte ouverte.','l-action');Score.add('doors',5,'#8faa1a');setTimeout(()=>{_walkThru(dd);_refreshUI();},180);}
    else if(dd.state==='locked'){Audio.play('locked');_openBio(dd);}
  }

  function _walkThru(dd){
    const rc=dd.tiles.reduce((a,t)=>a+t.r,0)/dd.tiles.length;
    const cc=dd.tiles.reduce((a,t)=>a+t.c,0)/dd.tiles.length;
    const sC=dd.tiles.every(t=>t.c===dd.tiles[0].c);
    let np=S.px,nq=S.py;
    if(sC)np=S.px<cc?Math.round(cc)+1:Math.round(cc)-1;
    else nq=S.py<rc?Math.round(rc)+1:Math.round(rc)-1;
    for(let i=0;i<5;i++){if(inB(np,nq)&&S.map[nq][np]!==W&&S.map[nq][np]!==V){S.px=np;S.py=nq;break;}if(sC)np+=(np>cc?1:-1);else nq+=(nq>rc?1:-1);}
    const rm=rmAt(S.py,S.px);if(rm)_log(`→ ${rm.name}.`,'l-action');
  }

  function _pickLoot(l){
    S.pickedLoot.add(l.id);S.loot=S.loot.filter(x=>x.id!==l.id);
    if(l.doc){_showDoc(l.doc,'new');Audio.play('pickup','document');return;}
    const item=ITEMS[l.itemId];if(!item)return;
    if(S.inv.length>=S.maxInv){_notif('Inventaire plein !','bad');return;}
    S.inv.push({...item,iid:Date.now()+Math.random()});S.stats.items++;
    if(item.effect?.unlocks==='maintenance')S.flags.maint=true;
    Score.add('items',item.pts||10,'#b8d420');
    // Son différent selon type d'objet
    Audio.play('pickup', item.type);
    _notif(`${item.icon} ${item.name} (+${item.pts||10} pts)`,'ok');
    _log(`+ ${item.icon} ${item.name}`,'l-find');
    _refreshUI();
  }

  function _showDoc(doc,mode){
    S.pendDoc=doc;S.docMode=mode;
    document.getElementById('doc-icon').textContent=doc.ico;
    document.getElementById('doc-title').textContent=doc.ttl;
    document.getElementById('doc-sub').textContent=doc.sub;
    const body=document.getElementById('doc-body');body.textContent=doc.body;
    if(doc.code){
      const span=document.createElement('span');span.className='doc-code';
      span.textContent=doc.code.split('').join('  ');
      body.appendChild(span);S.codes[S.floor]=doc.code;
      _log(`🔑 Code ascenseur : ${doc.code}`,'l-lore');Score.add('docs',50,'#7090b8');
    }
    document.getElementById('doc-keep').style.display=mode==='new'?'flex':'none';
    document.getElementById('doc-drop').style.display=mode==='new'?'flex':'none';
    document.getElementById('doc-close').style.display=mode==='read'?'flex':'none';
    document.getElementById('modal-doc').classList.add('open');
    if(mode==='new')_log(`📄 "${doc.ttl}"`,'l-lore');
  }

  function docKeep(){
    const doc=S.pendDoc;if(!doc)return;
    if(S.inv.length>=S.maxInv){_notif('Inventaire plein !','bad');_closeModal('modal-doc');return;}
    S.pickedDocs.add(doc.id);
    S.inv.push({id:doc.id,name:doc.ttl,icon:doc.ico,type:'document',desc:doc.body.slice(0,60)+'…',flavor:doc.sub,effect:{},iid:Date.now(),doc});
    S.stats.items++;Score.add('docs',30,'#7090b8');
    _log(`📥 "${doc.ttl}" conservé.`,'l-find');_closeModal('modal-doc');_refreshUI();_updateDocsPanel();
  }
  function docDrop(){S.pickedDocs.add(S.pendDoc?.id||'');_log('Jeté.','l-action');_closeModal('modal-doc');}
  function docClose(){_closeModal('modal-doc');}

  function _openElev(){
    S.pendLock={type:'elev'};
    const code=S.codes[S.floor];
    if(code){
      document.getElementById('lock-title').textContent='🛗 Ascenseur';
      document.getElementById('lock-sub').textContent=`Code pour l'étage ${S.floor+1} :`;
      document.getElementById('lock-bio').style.display='none';
      document.getElementById('lock-code').style.display='block';
      document.getElementById('lock-err').style.display='none';
      S.okCode=code;S.code='';_updCode();_buildNumpad();
      document.getElementById('modal-lock').classList.add('open');
    } else {_notif('⚠ Trouvez le code d\'abord !','bad');_log('Le code est dans un document de cet étage.','l-warn');}
  }

  function _openBio(dd){
    S.pendLock={type:'door',dd};
    const cards=S.inv.filter(i=>i.type==='key');
    document.getElementById('lock-title').textContent='🔐 Accès Biométrique';
    document.getElementById('lock-sub').textContent='Présentez votre carte d\'accès.';
    document.getElementById('lock-bio').style.display='block';
    document.getElementById('lock-code').style.display='none';
    document.getElementById('lock-err').style.display='none';
    const bg=document.getElementById('lock-cards');bg.innerHTML='';
    if(!cards.length)bg.innerHTML='<div style="color:var(--blood);font-size:.8rem;padding:10px;grid-column:1/-1">Aucune carte d\'accès.</div>';
    else cards.forEach(card=>{
      const el=document.createElement('div');el.className='card-item';
      el.innerHTML=`<span class="card-icon">${card.icon}</span><span class="card-name">${card.name}</span>`;
      el.onclick=()=>{bg.querySelectorAll('.card-item').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');S.selCard=card;};
      bg.appendChild(el);
    });
    document.getElementById('modal-lock').classList.add('open');
  }

  function _updCode(){document.getElementById('code-digits').textContent=S.code.padEnd(4,'_').split('').join(' ');}
  function _buildNumpad(){
    const np=document.getElementById('numpad');np.innerHTML='';
    [1,2,3,4,5,6,7,8,9,'⌫',0,'✓'].forEach(v=>{
      const b=document.createElement('button');b.className='nk'+(v==='⌫'?' del':v==='✓'?' ent':'');b.textContent=v;
      b.onclick=()=>{Audio.play('keypad');if(v==='⌫'){S.code=S.code.slice(0,-1);_updCode();}else if(v==='✓')lockOk();else if(S.code.length<4){S.code+=v;_updCode();}};
      np.appendChild(b);
    });
  }

  function lockOk(){
    const lk=S.pendLock;if(!lk)return;
    if(document.getElementById('lock-code').style.display!=='none'){
      if(S.code===S.okCode){Audio.play('code_ok');_closeModal('modal-lock');_log('🛗 Code accepté.','l-system');_goUp();}
      else{Audio.play('code_fail');_showLockErr('✗ Code incorrect.');S.code='';_updCode();}
    } else {
      const card=S.selCard;if(!card){_showLockErr('Sélectionnez une carte.');return;}
      if(lk.type==='door'&&lk.dd){
        if(card.id===lk.dd.reqItem){
          Audio.play('code_ok');_closeModal('modal-lock');_log(`🪪 ${card.name} accepté.`,'l-system');
          if(card.id==='keycard_maintenance')S.flags.maint=true;
          lk.dd.state='open';lk.dd.tiles.forEach(t=>{S.map[t.r][t.c]=DO;});
          S.doorAnim[lk.dd.id]={p:0,op:true};Score.add('items',80,'#b8d420');
          setTimeout(()=>{_walkThru(lk.dd);_refreshUI();},250);_refreshUI();
        } else{Audio.play('code_fail');_showLockErr('✗ Carte non autorisée.');}
      }
    }
  }
  function lockCancel(){S.pendLock=null;S.selCard=null;S.okCode=null;_closeModal('modal-lock');}
  function _showLockErr(m){const e=document.getElementById('lock-err');e.textContent=m;e.style.display='block';}

  function _goUp(){
    const fl=S.floor;
    if(fl>=9){if(S.inv.some(i=>i.id==='sigma_files')||Math.random()<.4)_doVictory();else{_notif('Explorez encore.','bad');_log('Vous n\'avez pas trouvé les dossiers SIGMA.','l-warn');}return;}
    _addRad(fl*4);S.stats.floors++;Score.add('explore',fl*80,'#c4501a');
    Audio.play('floor_up');loadFloor(fl+1);_notif(`⬆ Étage ${fl+1}`,'ok');
    if(Settings.get('shake'))_shake();
  }

  function _doExamine(){
    const rm=rmAt(S.py,S.px);if(!rm)return;
    const lines={rdc_hall:"Le hall sent la poussière et un parfum d'hôtel oublié.",rdc_recep:"Comptoir de réception. Un registre ouvert. Dernière entrée : 14 mars 2027.",rdc_maint:"La maintenance. Tout converge vers quelque chose en dessous."};
    _log(`🔍 ${rm.name} — ${lines[rm.id]||'Chambre abandonnée. Mobilier renversé.'}`,  'l-action');
    _addRad(S.floor);Score.add('explore',3);
  }

  // ═══════════════════════ STATS ═══════════════════════
  function _addRad(v){
    if(S.dead)return;
    const radMult=[.4,1,1.5,2][Settings.get('rad')]||1;
    const e=Math.max(0,Math.ceil(v*(1-S.shield/100)*radMult));
    S.rad=Math.min(S.maxRad,S.rad+e);S.stats.radTotal+=e;
    if(S.rad>=80)_dmg(Math.floor((S.rad-80)*.35));
    _chk();_refreshStats();
    // Sons radiation différenciés selon niveau
    if(e>0){
      if(S.rad>75)Audio.play('rad_critical');
      else if(S.rad>40)Audio.play('rad_med');
      else Audio.play('rad_tick');
    }
  }
  function _dmg(v,sfx=true){
    if(S.dead)return;S.hp=Math.max(0,S.hp-v);
    // Dégât physique vs radiation
    if(sfx){if(S.rad>70)Audio.play('damage_rad');else Audio.play('damage');}
    _chk();_refreshStats();
  }
  function _heal(v){S.hp=Math.min(S.maxHp,S.hp+v);_refreshStats();}
  function _redRad(v){S.rad=Math.max(0,S.rad-v);_refreshStats();Audio.startGeiger(S.rad);}
  function _chk(){if(S.hp<=0&&!S.dead)_die('hp');if(S.rad>=S.maxRad&&!S.dead)_die('radiation');}

  function _doAmb(){
    const rm=rmAt(S.py,S.px);
    const mults={'rdc_maint':2.2,'rdc_elevh':1.7,'rdc_stock':1.3}[rm?.id]||(rm?.id?.startsWith('ch')?0.7:1);
    _addRad(Math.floor(S.floor*1.6*mults));
    const evFreq=[.04,.12,.22,.38][Settings.get('events')]||.12;
    if(Math.random()<evFreq)triggerEvent(S,S.floor,_addRad,_dmg,_heal,_redRad,_log,_notif);
  }

  function _doVictory(){S.dead=true;Audio.play('victory');setTimeout(()=>_endScreen('victory'),800);}
  function _die(reason){S.dead=true;Audio.play('gameover');Audio.stopGeiger();if(typeof GameMusic!=='undefined')GameMusic.stop();setTimeout(()=>_endScreen(reason),800);}

  function _endScreen(type){
    const victory=type==='victory';
    const titles={victory:'VOUS AVEZ SURVÉCU',hp:'SILENCE',radiation:'EFFONDREMENT'};
    const stories={
      victory:`Vous émergez sur le toit. L'air frais brûle vos poumons. Les dossiers SIGMA dans les mains — la preuve de tout. Un numéro de journaliste composé. Il attendait cet appel depuis 2027.`,
      hp:`L'hôtel vous a eue. Une chute dans l'obscurité. Votre Geiger cliquette doucement dans le silence de cette tour oubliée.`,
      radiation:`La radiation a gagné. Vos genoux cèdent dans un couloir. Le compteur sature. L'Hôtel Horizon garde son secret. Pour l'instant.`
    };
    document.getElementById('go-tag').textContent=victory?'Victoire':'Fin de partie';
    document.getElementById('go-title').textContent=titles[type];
    document.getElementById('go-title').className='go-title '+(victory?'win':'dead');
    document.getElementById('go-story').textContent=stories[type];
    const final=Score.calcFinal(S.floor,S.hp,S.rad,S.stats.items,victory);
    const bd=Score.breakdown();const rank=Score.rank(final,victory);
    document.getElementById('go-score-big').textContent=final.toLocaleString();
    document.getElementById('go-score-big').className='go-score-big '+(victory?'win':'dead');
    document.getElementById('go-breakdown').innerHTML=`
      <div class="go-bd-item"><div class="go-bd-val">${bd.floor_bonus||0}</div><div class="go-bd-lbl">Étages</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.items||0}</div><div class="go-bd-lbl">Objets</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.docs||0}</div><div class="go-bd-lbl">Docs</div></div>
      <div class="go-bd-item"><div class="go-bd-val">${bd.hp_bonus||0}</div><div class="go-bd-lbl">Santé</div></div>
      <div class="go-bd-item"><div class="go-bd-val" style="color:${(bd.rad_penalty||0)<0?'#c4501a':'inherit'}">${bd.rad_penalty||0}</div><div class="go-bd-lbl">Radiation</div></div>
      ${victory?`<div class="go-bd-item"><div class="go-bd-val" style="color:var(--bile-bright)">${bd.victory||0}</div><div class="go-bd-lbl">Victoire</div></div>`:''}`;
    document.getElementById('go-rank').innerHTML=`<div class="go-rank-badge ${rank.l.toLowerCase()}">${rank.l} — ${rank.t}</div>`;
    Score.save(_name,S.floor,victory,S.hp,S.rad);
    App.updateHomePage();App.showScreen('gameover');
  }

  // ═══════════════════════ CAMERA ═══════════════════════
  function _updateCam(){
    const tx=S.px*TS-cv.width/2+TS/2,ty=S.py*TS-cv.height/2+TS/2;
    const mx2=Math.max(0,Math.min(MW*TS-cv.width,tx)),my2=Math.max(0,Math.min(MH*TS-cv.height,ty));
    S.camX+=(mx2-S.camX)*.2;S.camY+=(my2-S.camY)*.2;
  }
  function _shake(){
    if(!Settings.get('shake'))return;
    const gs=document.getElementById('screen-game');if(!gs)return;
    gs.style.animation='shake .3s ease';setTimeout(()=>gs.style.animation='',350);
  }

  // ═══════════════════════ DRAW ═══════════════════════
  function _draw(){
    if(!ctx||!S.map)return;
    const CW=cv.width,CH=cv.height;ctx.clearRect(0,0,CW,CH);
    const ox=Math.round(S.camX),oy=Math.round(S.camY);
    const c0=Math.max(0,Math.floor(ox/TS)-1),c1=Math.min(MW-1,Math.ceil((ox+CW)/TS)+1);
    const r0=Math.max(0,Math.floor(oy/TS)-1),r1=Math.min(MH-1,Math.ceil((oy+CH)/TS)+1);
    ctx.save();ctx.translate(-ox,-oy);
    _drawFloors(c0,c1,r0,r1);_drawWalls(c0,c1,r0,r1);_drawDoors();
    _drawObjs(c0,c1,r0,r1);_drawLoot();_drawPlayer();
    ctx.restore();_drawMM();
  }

  function _drawFloors(c0,c1,r0,r1){
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      const t=S.map[r][c];if(t===V||t===W)continue;
      const rm=rmAt(r,c)||rmNear(r,c);if(!rm&&t===F)continue;
      const st=getFStyle(rm);const px=c*TS,py=r*TS;
      if(t===EL){_drawElev(px,py);continue;}
      _drawFloor(px,py,st,r,c);
    }
  }

  function _drawFloor(px,py,st,r,c){
    const type=st.type||'concrete';const sd=(r*127+c)*3571;
    switch(type){
      case 'chevron':{const d=(r+c)%4;ctx.fillStyle=[st.c1,st.c2||darken(st.c1,.7),lighten(st.c1,.08),darken(st.c1,.85)][d];ctx.fillRect(px,py,TS,TS);ctx.strokeStyle=st.cj;ctx.lineWidth=.8;const s=Math.floor(TS/3);for(let i=0;i<=TS;i+=s){ctx.beginPath();ctx.moveTo(px+i,py);ctx.lineTo(px,py+i);ctx.stroke();ctx.beginPath();ctx.moveTo(px+TS,py+i);ctx.lineTo(px+i,py+TS);ctx.stroke();}break;}
      case 'marble':{ctx.fillStyle=st.c1;ctx.fillRect(px,py,TS,TS);ctx.strokeStyle=lighten(st.c1,.18)+'66';ctx.lineWidth=.6;for(let i=0;i<3;i++){const vx=(sd*7+i*31)%TS,vy=(sd*13+i*17)%TS;ctx.beginPath();ctx.moveTo(px+vx,py+vy);ctx.bezierCurveTo(px+vx+(sd%8)-4,py+vy+(sd%6)-3,px+vx+(sd%14)-7,py+vy+(sd%10)-5,px+vx+(sd%18)-9,py+vy+(sd%14)-7);ctx.stroke();}if(c%3===0){ctx.strokeStyle=st.cj;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+TS);ctx.stroke();}if(r%3===0){ctx.strokeStyle=st.cj;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+TS,py);ctx.stroke();}ctx.fillStyle='rgba(230,210,180,.03)';ctx.fillRect(px+2,py+2,TS*.28,TS*.18);break;}
      case 'herring':{ctx.fillStyle=(r+c)%2===0?st.c1:st.c2||darken(st.c1,.8);ctx.fillRect(px,py,TS,TS);ctx.strokeStyle=st.cj;ctx.lineWidth=.6;const step=Math.floor(TS/4);for(let i=-TS;i<TS*2;i+=step){ctx.beginPath();ctx.moveTo(px+i,py);ctx.lineTo(px+i+TS,py+TS);ctx.stroke();}break;}
      case 'carpet':{ctx.fillStyle=st.c1;ctx.fillRect(px,py,TS,TS);ctx.save();ctx.translate(px+TS/2,py+TS/2);const h=TS*.42,mid=TS*.26;ctx.strokeStyle='rgba(180,120,40,.22)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(h,0);ctx.lineTo(0,h);ctx.lineTo(-h,0);ctx.closePath();ctx.stroke();ctx.strokeStyle='rgba(160,90,25,.16)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(0,-mid);ctx.lineTo(mid,0);ctx.lineTo(0,mid);ctx.lineTo(-mid,0);ctx.closePath();ctx.stroke();ctx.fillStyle='rgba(180,120,50,.16)';ctx.beginPath();ctx.arc(0,0,TS*.045,0,Math.PI*2);ctx.fill();ctx.restore();ctx.strokeStyle='rgba(180,130,40,.14)';ctx.lineWidth=.6;ctx.strokeRect(px+1,py+1,TS-2,TS-2);break;}
      case 'concrete':{ctx.fillStyle=st.c1;ctx.fillRect(px,py,TS,TS);for(let i=0;i<4;i++){ctx.fillStyle=`rgba(220,200,170,${.008+((sd+i)%4)*.005})`;ctx.fillRect(px+(sd*3+i*37)%TS,py+(sd*7+i*19)%TS,1+(sd+i)%2,1);}ctx.strokeStyle=st.cj;ctx.lineWidth=1.8;if(c%3===0){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+TS);ctx.stroke();}if(r%3===0){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+TS,py);ctx.stroke();}break;}
      case 'tile2':{ctx.fillStyle=(r+c)%2===0?st.c1:st.c2||darken(st.c1,.7);ctx.fillRect(px,py,TS,TS);ctx.strokeStyle='rgba(200,185,160,.07)';ctx.lineWidth=1;ctx.strokeRect(px+.5,py+.5,TS-1,TS-1);break;}
      default:ctx.fillStyle='#0c0a08';ctx.fillRect(px,py,TS,TS);
    }
  }

  function _drawElev(px,py){
    ctx.fillStyle='#080a04';ctx.fillRect(px,py,TS,TS);
    const p=.5+.4*Math.sin(Date.now()*.003);
    ctx.fillStyle=`rgba(143,170,26,${.07+p*.1})`;ctx.fillRect(px+3,py+3,TS-6,TS-6);
    ctx.strokeStyle=`rgba(143,170,26,${.35+p*.45})`;ctx.lineWidth=1.5;ctx.strokeRect(px+3,py+3,TS-6,TS-6);
    ctx.fillStyle='#8faa1a';ctx.font=`${TS*.55}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🛗',px+TS/2,py+TS/2);
    if(S.nearElev){ctx.strokeStyle='rgba(143,170,26,.8)';ctx.lineWidth=2.5;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
  }

  function _drawWalls(c0,c1,r0,r1){
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      if(S.map[r][c]!==W)continue;
      const rm=rmNear(r,c);const ac=rm?.acc||'#2a2520';const px=c*TS,py=r*TS;
      ctx.fillStyle='#080604';ctx.fillRect(px,py,TS,TS);
      const bH=Math.round(TS*.44);const off=(r%2)*Math.round(TS*.46);
      ctx.fillStyle=lighten('#0c0a08',.07);ctx.fillRect(px,py+1,TS,bH-2);
      ctx.fillStyle=lighten('#0c0a08',.04);ctx.fillRect(px,py+bH+1,TS,bH-2);
      ctx.fillStyle='#040302';ctx.fillRect(px,py+bH,TS,2);
      const jx=px+(off%TS);if(jx>px&&jx<px+TS)ctx.fillRect(jx,py,1.5,bH);
      const jx2=jx+Math.round(TS*.46);if(jx2>px&&jx2<px+TS)ctx.fillRect(jx2,py+bH,1.5,bH);
      ctx.fillStyle=ac+'18';ctx.fillRect(px,py,TS,2);
      const sg=ctx.createLinearGradient(px,py+TS,px,py+TS+5);sg.addColorStop(0,'rgba(0,0,0,.5)');sg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sg;ctx.fillRect(px,py+TS,TS,5);
      if(rm&&r===rm.r1-1&&c===Math.floor((rm.c1+rm.c2)/2)){ctx.fillStyle=ac+'88';ctx.font=`bold ${TS*.22}px 'Barlow Condensed',sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(rm.name.toUpperCase(),px+TS/2,py+TS/2);}
    }
  }

  function _drawDoors(){
    S.doors.forEach(dd=>{
      const an=S.doorAnim[dd.id];const phase=an?an.p:(dd.state==='open'?1:0);
      dd.tiles.forEach(tt=>{
        if(!inB(tt.c,tt.r))return;
        const px=tt.c*TS,py=tt.r*TS;
        const rm=rmAt(tt.r,tt.c)||rmNear(tt.r,tt.c);const st=getFStyle(rm);
        _drawFloor(px,py,st,tt.r,tt.c);
        if(phase<1)_drawDoorLeaf(px,py,dd,phase);
        if(S.nearDoor===dd){ctx.strokeStyle='rgba(196,80,26,.6)';ctx.lineWidth=2;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
      });
    });
  }

  function _drawDoorLeaf(px,py,dd,phase){
    const lk=dd.state==='locked';const sC=dd.tiles.every(t=>t.c===dd.tiles[0].c);
    const w=Math.round(TS*(1-phase)*.82);if(w<2)return;
    ctx.fillStyle=lk?'#180404':'#0e1608';ctx.fillRect(px,py,TS,TS);
    const dg=ctx.createLinearGradient(px,py,sC?px+w:px,sC?py:py+w);
    dg.addColorStop(0,lk?'#3a0e0e':'#283010');dg.addColorStop(.5,lk?'#4a1212':'#344018');dg.addColorStop(1,lk?'#2e0808':'#1c2808');
    ctx.fillStyle=dg;if(sC)ctx.fillRect(px+2,py+2,w-4,TS-4);else ctx.fillRect(px+2,py+2,TS-4,w-4);
    if(w>TS*.35){ctx.strokeStyle=lk?'rgba(140,40,40,.45)':'rgba(100,120,40,.4)';ctx.lineWidth=.8;if(sC){ctx.strokeRect(px+4,py+5,w-8,TS*.34);ctx.strokeRect(px+4,py+TS*.5,w-8,TS*.34);}else{ctx.strokeRect(px+5,py+4,TS*.34,w-8);ctx.strokeRect(px+TS*.5,py+4,TS*.34,w-8);}}
    if(w>TS*.25){const hx=sC?px+w-8:px+TS/2,hy=sC?py+TS/2:py+w-8;ctx.fillStyle=lk?'#884444':'#7a8844';ctx.beginPath();ctx.arc(hx,hy,3,0,Math.PI*2);ctx.fill();}
    if(lk){ctx.font=`${TS*.3}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🔒',sC?px+w/2:px+TS/2,sC?py+TS/2:py+w/2);}
  }

  function _drawObjs(c0,c1,r0,r1){
    for(let r=r0;r<=r1;r++)for(let c=c0;c<=c1;c++){
      if(S.map[r][c]!==OB)continue;
      const px=c*TS,py=r*TS;const rm=rmAt(r,c);if(!rm)continue;
      const st=getFStyle(rm);_drawFloor(px,py,st,r,c);
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(px+TS/2,py+TS-4,TS*.28,TS*.08,0,0,Math.PI*2);ctx.fill();
      const decs=S.decors[rm.id]||[];const dec=decs.find(d=>d.c===c&&d.r===r);
      if(dec){ctx.font=`${TS*.6}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(dec.e,px+TS/2,py+TS/2-2);}
    }
  }

  function _drawLoot(){
    const now=Date.now();
    S.loot.forEach(l=>{
      if(S.pickedLoot.has(l.id))return;
      const px=l.c*TS,py=l.r*TS,near=S.nearLoot===l,isDoc=!!l.doc;
      const pulse=.5+.4*Math.sin(now*.004+(l.c+l.r));
      ctx.fillStyle=isDoc?`rgba(100,130,190,${.04+pulse*.1})`:`rgba(196,80,26,${.04+pulse*.09})`;
      ctx.fillRect(px-2,py-2,TS+4,TS+4);
      if(near){ctx.strokeStyle=isDoc?'rgba(100,130,190,.7)':'rgba(196,80,26,.7)';ctx.lineWidth=2;ctx.strokeRect(px-1,py-1,TS+2,TS+2);}
      const bob=Math.sin(now*.0028+(l.c+l.r))*2.5;
      ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(px+TS/2,py+TS-4,TS*.26,TS*.08,0,0,Math.PI*2);ctx.fill();
      const ico=l.doc?l.doc.ico:(ITEMS[l.itemId]?.icon||'📦');
      ctx.font=`${TS*.6}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ico,px+TS/2,py+TS/2-2+bob);
    });
  }

  function _drawPlayer(){
    const px=S.px*TS,py=S.py*TS;
    if(S.rad>15){const a=(S.rad-15)/85*.45;const g=ctx.createRadialGradient(px+TS/2,py+TS/2,6,px+TS/2,py+TS/2,TS*1.2);g.addColorStop(0,`rgba(196,80,26,${a})`);g.addColorStop(1,'rgba(196,80,26,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(px+TS/2,py+TS/2,TS*1.2,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(px+TS/2,py+TS-3,TS*.28,TS*.08,0,0,Math.PI*2);ctx.fill();
    _drawFemChar(px+TS/2,py+TS/2,S.pdir);
  }

  function _drawFemChar(cx,cy,dir){
    const s=TS;ctx.save();ctx.translate(cx,cy);
    if(dir==='left')ctx.scale(-1,1);
    const hz=S.inv.some(i=>i.id==='hazmat_suit');const mk=S.inv.some(i=>i.id==='gas_mask');
    const jc=hz?'#4a7030':'#2a1e14';const lc=hz?'#3a5828':'#1e1610';
    ctx.fillStyle=lc;ctx.fillRect(-s*.1,s*.18,s*.08,s*.26);ctx.fillRect(s*.02,s*.18,s*.08,s*.26);
    ctx.fillStyle='#100c08';ctx.fillRect(-s*.11,s*.4,s*.12,s*.08);ctx.fillRect(s*.01,s*.4,s*.12,s*.08);
    const tg=ctx.createLinearGradient(-s*.14,-s*.1,s*.14,-s*.1);tg.addColorStop(0,darken(jc,.75));tg.addColorStop(.5,jc);tg.addColorStop(1,darken(jc,.75));
    ctx.fillStyle=tg;ctx.fillRect(-s*.14,-s*.1,s*.28,s*.3);
    ctx.fillStyle=jc;ctx.fillRect(-s*.24,-s*.08,s*.1,s*.2);ctx.fillRect(s*.14,-s*.08,s*.1,s*.2);
    ctx.fillStyle='#c09070';ctx.fillRect(-s*.25,s*.1,s*.09,s*.08);ctx.fillRect(s*.16,s*.1,s*.09,s*.08);
    ctx.fillStyle='#c09070';ctx.fillRect(-s*.04,-s*.17,s*.08,s*.07);
    if(!mk){
      const hg=ctx.createRadialGradient(0,-s*.27,s*.04,0,-s*.27,s*.13);hg.addColorStop(0,'#d0a880');hg.addColorStop(1,'#a07850');
      ctx.fillStyle=hg;ctx.fillRect(-s*.12,-s*.36,s*.24,s*.22);
      ctx.fillStyle='#1e1208';ctx.fillRect(-s*.14,-s*.36,s*.06,s*.28);ctx.fillRect(s*.08,-s*.36,s*.06,s*.28);ctx.fillRect(-s*.12,-s*.38,s*.24,s*.08);
      if(dir!=='up'){ctx.fillStyle='#0a0806';ctx.fillRect(-s*.07,-s*.26,s*.04,s*.05);ctx.fillRect(s*.03,-s*.26,s*.04,s*.05);ctx.fillStyle='rgba(255,255,255,.45)';ctx.fillRect(-s*.06,-s*.25,s*.02,s*.02);ctx.fillRect(s*.04,-s*.25,s*.02,s*.02);}
    } else {
      ctx.fillStyle='#1a221a';ctx.fillRect(-s*.13,-s*.38,s*.26,s*.24);ctx.fillStyle='rgba(100,180,100,.18)';ctx.fillRect(-s*.1,-s*.32,s*.2,s*.14);ctx.fillStyle='#0e140e';ctx.fillRect(-s*.05,-s*.25,s*.1,s*.1);ctx.fillStyle='#243824';ctx.fillRect(-s*.09,-s*.2,s*.05,s*.05);ctx.fillRect(s*.04,-s*.2,s*.05,s*.05);ctx.fillStyle='#0a0806';ctx.fillRect(-s*.13,-s*.38,s*.26,s*.08);
    }
    if(S.rad>55){ctx.strokeStyle=`rgba(196,80,26,${(S.rad-55)/45*.5})`;ctx.lineWidth=2;ctx.strokeRect(-s*.16,-s*.4,s*.32,s*.84);}
    ctx.restore();
  }

  function _drawMM(){
    if(!mx||!S.map)return;
    const mW=mm.width,mH=mm.height,tw=mW/MW,th=mH/MH;
    mx.fillStyle='#040302';mx.fillRect(0,0,mW,mH);
    for(let r=0;r<MH;r++)for(let c=0;c<MW;c++){
      const t=S.map[r][c];if(t===V)continue;
      const rm=rmAt(r,c);const st=rm?getFStyle(rm):null;
      let col='#0c0a08';
      if(t===W)col='#060402';else if(t===EL)col='#0a1804';else if(t===DL)col='#180806';else if(t===DC||t===DO)col='#141e0a';else if(st)col=st.c1;
      mx.fillStyle=col;mx.fillRect(c*tw,r*th,Math.max(tw,.5),Math.max(th,.5));
    }
    S.loot.filter(l=>!S.pickedLoot.has(l.id)).forEach(l=>{mx.fillStyle=l.doc?'#4468a0':'#7a3010';mx.fillRect(l.c*tw,l.r*th,Math.max(tw*1.4,2),Math.max(th*1.4,2));});
    mx.fillStyle='#c4501a';mx.shadowColor='#c4501a';mx.shadowBlur=4;mx.beginPath();mx.arc(S.px*tw+tw/2,S.py*th+th/2,Math.max(tw,th)*1.3,0,Math.PI*2);mx.fill();mx.shadowBlur=0;
  }

  // ═══════════════════════ UI ═══════════════════════
  function _updVig(){
    if(!Settings.get('vignette'))return;
    const v=document.getElementById('vignette');
    if(v)v.style.background=`radial-gradient(ellipse at center,transparent 35%,rgba(196,80,26,${S.rad/100*.55}) 100%)`;
  }
  function _updHint(){
    const h=document.getElementById('interact-hint');if(!h)return;
    let t=null;
    if(S.nearElev)t='[ ENTRÉE ] 🛗 Ascenseur — Monter';
    else if(S.nearLoot)t=`[ ENTRÉE ] ${S.nearLoot.doc?S.nearLoot.doc.ico:(ITEMS[S.nearLoot.itemId]?.icon||'📦')} ${S.nearLoot.doc?S.nearLoot.doc.ttl:(ITEMS[S.nearLoot.itemId]?.name||'Objet')}`;
    else if(S.nearDoor)t=S.nearDoor.state==='open'?'[ ENTRÉE ] Fermer la porte':S.nearDoor.state==='locked'?'[ ENTRÉE ] 🔐 Accès biométrique':'[ ENTRÉE ] Ouvrir la porte';
    h.style.display=t?'block':'none';if(t)h.textContent=t;
  }
  function _refreshUI(){_refreshStats();_renderInv();_updAccess();_updLeft();}
  function _refreshStats(){
    const h=S.hp,r=S.rad;
    const hb=document.getElementById('bar-hp');if(hb){hb.style.width=h+'%';hb.className='hud-bar-inner bar-hp'+(h<25?' c':h<50?' w':'');}
    const hv=document.getElementById('val-hp');if(hv)hv.textContent=h;
    const rb=document.getElementById('bar-rad');if(rb){rb.style.width=r+'%';rb.className='hud-bar-inner bar-rad'+(r>70?' c':r>40?' w':'');}
    const rv=document.getElementById('val-rad');if(rv)rv.textContent=r+'%';
    if(typeof GameMusic!=='undefined'&&GameMusic.isPlaying())GameMusic.setRadiation(r);
    const sv=document.getElementById('val-shield');if(sv)sv.textContent=S.shield;
    const rw=document.getElementById('rad-warn');if(rw)rw.style.display=r>75?'block':'none';
  }
  function _renderInv(){
    const g=document.getElementById('inventory-grid');if(!g)return;g.innerHTML='';
    const eqIds=Object.values(S.eq).filter(Boolean).map(i=>i.iid);
    S.inv.forEach((item,idx)=>{
      const d=document.createElement('div');const eq=eqIds.includes(item.iid);
      d.className='inv-slot'+(eq?' equipped':item.type==='document'?' doc-type':'');
      d.innerHTML=`<span class="inv-icon">${item.icon}</span><span class="inv-name">${item.name}</span>${eq?'<span class="inv-eq-badge">EQ</span>':''}`;
      d.addEventListener('click',()=>_selItem(idx));g.appendChild(d);
    });
    for(let i=S.inv.length;i<S.maxInv;i++){const e=document.createElement('div');e.className='inv-slot empty';e.innerHTML='<span class="inv-icon" style="opacity:.05">·</span>';g.appendChild(e);}
    document.getElementById('inv-count').textContent=S.inv.length;
  }
  function _selItem(idx){
    S.selIdx=idx;const item=S.inv[idx];if(!item)return;
    document.getElementById('item-det-name').textContent=`${item.icon} ${item.name}`;
    document.getElementById('item-det-desc').textContent=item.desc||'';
    document.getElementById('item-det-flavor').textContent=item.flavor||'';
    const acts=document.getElementById('item-actions');acts.style.display='flex';acts.innerHTML='';
    if(item.type==='consumable'||item.type==='equipment'){const b=document.createElement('button');b.className='iact use';b.textContent='Utiliser';b.onclick=()=>_useItem(idx);acts.appendChild(b);}
    if(item.type==='document'||item.doc){const b=document.createElement('button');b.className='iact read';b.textContent='📖 Lire';b.onclick=()=>{if(item.doc)_showDoc(item.doc,'read');};acts.appendChild(b);}
    const drop=document.createElement('button');drop.className='iact drop';drop.textContent='Jeter';drop.onclick=()=>_dropItem(idx);acts.appendChild(drop);
  }
  function _useItem(idx){
    const item=S.inv[idx];if(!item)return;
    const e=item.effect||{};let msg=`${item.icon} ${item.name} utilisé.`;
    if(item.type==='consumable'){
      if(e.hp>0){_heal(e.hp);msg+=` +${e.hp} HP.`;}
      if(e.hp<0)_dmg(-e.hp,false);
      if(e.radiation<0){_redRad(-e.radiation);msg+=` -${-e.radiation} Rad.`;}
      if(e.radiation>0)_addRad(e.radiation);
      S.inv.splice(idx,1);Audio.play('use');
    } else if(item.type==='equipment'){
      const slot=item.slot;if(slot){if(S.eq[slot])S.shield-=S.eq[slot].effect?.radiationShield||0;S.eq[slot]=item;if(e.radiationShield){S.shield=Math.min(80,S.shield+e.radiationShield);msg+=` 🛡 +${e.radiationShield}%.`;}if(e.unlocks==='maintenance')S.flags.maint=true;Audio.play('use');}
    }
    _log(msg,'l-action');document.getElementById('item-actions').style.display='none';_refreshUI();
  }
  function _dropItem(idx){const item=S.inv[idx];if(!item)return;S.inv.splice(idx,1);_log(`Jeté : ${item.name}.`,'l-action');document.getElementById('item-actions').style.display='none';_renderInv();}
  function _updAccess(){
    const code=S.codes[S.floor];const fe=document.getElementById('st-elev');
    if(fe){fe.textContent=code?`✓ Code: ${code}`:'✗ Inconnu';fe.className='val '+(code?'ok':'bad');}
    const fm=document.getElementById('st-maint');if(fm){fm.textContent=S.flags.maint?'✓ Badge OK':'✗ Sans badge';fm.className='val '+(S.flags.maint?'ok':'bad');}
  }
  function _updLeft(){
    const rm=rmAt(S.py,S.px);const sz=document.getElementById('st-zone');
    if(sz){sz.textContent=rm?rm.name:'—';if(rm)sz.style.color=rm.acc||'var(--rust)';}
    const sr=document.getElementById('st-rad');if(sr)sr.textContent=`${S.stats.radTotal} mSv`;
    const si=document.getElementById('st-items');if(si)si.textContent=S.stats.items;
  }
  function _updateDocsPanel(){
    const docs=S.inv.filter(i=>i.type==='document'||i.doc);
    const p=document.getElementById('docs-panel');
    if(!docs.length){p.innerHTML='<div class="no-docs">Aucun document.</div>';return;}
    p.innerHTML=docs.map((d,i)=>`<div class="doc-entry" onclick="Game._clickDoc(${i})"><div class="doc-entry-title">${d.icon} ${d.name}</div><div class="doc-entry-preview">${(d.desc||'').slice(0,40)}</div></div>`).join('');
  }
  function _clickDoc(i){const d=S.inv.filter(x=>x.type==='document'||x.doc)[i];if(d?.doc)_showDoc(d.doc,'read');}
  function _notif(txt,type='ok'){
    const el=document.getElementById('notif');if(!el)return;
    el.textContent=txt;el.style.display='block';el.className=type==='ok'?'ok':'bad';
    if(S.notTO)clearTimeout(S.notTO);S.notTO=setTimeout(()=>el.style.display='none',3000);
  }
  function _log(txt,cls='l-info'){
    const p=document.getElementById('log-body');if(!p)return;
    const l=document.createElement('div');l.className='log-line';
    const ts=new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    l.innerHTML=`<span class="log-ts">[${ts}]</span><span class="${cls}">${txt}</span>`;
    p.appendChild(l);p.scrollTop=p.scrollHeight;while(p.children.length>80)p.removeChild(p.firstChild);
  }
  function _closeModal(id){document.getElementById(id).classList.remove('open');}

  // ═══════════════════════ INPUT ═══════════════════════
  function _setupInput(){
    document.addEventListener('keydown',e=>{
      if(S.dead)return;
      const isModal=document.querySelector('.modal-bg.open');
      if(e.key==='Escape'){if(isModal){_closeModal(isModal.id);return;}if(S.paused){closePause();return;}openPause();return;}
      if(S.paused)return;if(isModal)return;
      S.keys[e.key]=true;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();
      if(e.key==='Enter'){e.preventDefault();Audio.resume();_doInteract();_updLeft();_refreshUI();}
      if(e.key==='e'||e.key==='E')_doExamine();
    });
    document.addEventListener('keyup',e=>delete S.keys[e.key]);
  }

  // ═══════════════════════ PAUSE ═══════════════════════
  function openPause(){
    const po=document.getElementById('pause-overlay');if(!po)return;
    po.classList.add('open');S.paused=true;
    const pl=document.getElementById('pause-player-label');if(pl)pl.textContent=`${_name} — Étage ${S.floor}/9`;
    const ph=document.getElementById('pause-hp');if(ph)ph.textContent=S.hp;
    const pr=document.getElementById('pause-rad');if(pr)pr.textContent=S.rad+'%';
    const ps=document.getElementById('pause-score');if(ps)ps.textContent=Score.get().toLocaleString();
    Audio.stopGeiger();
  }
  function closePause(){
    const po=document.getElementById('pause-overlay');if(!po)return;
    po.classList.remove('open');S.paused=false;Audio.startGeiger(S.rad);
  }
  function goHome(){
    const po=document.getElementById('pause-overlay');if(po)po.classList.remove('open');
    if(S.af)cancelAnimationFrame(S.af);
    Audio.stopGeiger();Score.reset();if(typeof GameMusic!=='undefined')GameMusic.stop();App.showScreen('home');
  }
  function confirmHome(){openPause();}

  // ═══════════════════════ INIT & PUBLIC ═══════════════════════
  function _initState(){
    S={hp:100,maxHp:100,rad:0,maxRad:100,floor:1,
       inv:[],maxInv:20,eq:{head:null,body:null},shield:0,
       flags:{maint:false},codes:{},
       pickedDocs:new Set(),pickedLoot:new Set(),
       stats:{radTotal:0,items:0,floors:0,events:0},
       dead:false,paused:false,map:null,loot:[],doors:[],rooms:[],decors:{},elev:[],
       px:7,py:7,pdir:'down',camX:0,camY:0,keys:{},
       mvT:0,ambT:0,nearDoor:null,nearLoot:null,nearElev:false,
       selIdx:-1,notTO:null,af:null,doorAnim:{},
       pendDoc:null,pendLock:null,code:'',selCard:null,okCode:null,docMode:'new'};
    Score.reset();
  }

  function start(playerName){
    _name=playerName||'Survivante';
    document.getElementById('hud-name').textContent=_name;
    _initState();_initCv();_setupInput();loadFloor(1);
    _log(`☢ ${_name} — Hôtel Horizon, 14 mars 2027.`,'l-system');
    _log('Cherchez le code ascenseur dans le couloir.','l-info');
    lt=performance.now();
    (function loop(ts){S.af=requestAnimationFrame(loop);const dt=Math.min(ts-lt,50);lt=ts;if(!S.dead&&!S.paused)_upd(dt);_draw();})(lt);
  }

  function restart(){const po=document.getElementById('pause-overlay');if(po)po.classList.remove('open');if(S.af)cancelAnimationFrame(S.af);App.showScreen('game');start(_name);}

  return{start,restart,goHome,confirmHome,openPause,closePause,docKeep,docDrop,docClose,lockOk,lockCancel,_clickDoc};
})();
