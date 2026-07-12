import {S,save,esc,num} from './state.js';
import {toast,showModal,closeModal} from './ui.js';
import {chipRow,chipVal} from './perfil.js';
import {computeStreak} from './progresso.js';
import {SKINS,HAIRS,HAIRSTYLES,RACES,raceCfg} from './data/racas.js';
import {RPGCLASSES,rpgClass,rarityOf,SLOTS,SHOP,itemById,STATMETA} from './data/loja.js';

/* ============ PERSONAGEM (RPG) ============ */
export function darken(hex,f){const h=hex.replace('#','');const r=Math.round(parseInt(h.slice(0,2),16)*f),g=Math.round(parseInt(h.slice(2,4),16)*f),b=Math.round(parseInt(h.slice(4,6),16)*f);return'#'+[r,g,b].map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('');}
export function CHAR(){return(S.characters&&S.characters[S.activeChar])||null;}
export function hasChar(){return!!(S.characters&&S.characters.length);}
export function newCharObj(){return{name:'Meu Bro',race:'humano',sex:'M',skin:1,hair:0,hairStyle:'curto',equipped:{head:null,neck:null,wrists:null,hands:null,belt:null,top:null,bottom:'short_black',feet:null,cape:null}};}
export function eqColor(slot,def){const c=CHAR();const id=c&&c.equipped[slot];const it=id&&itemById(id);return it?it.color:def;}
export function isCompound(n){return /agach|supino|terra|stiff|remada|desenvolv|barra fixa|puxada|leg press|paralel|afund|hack|levantamento|hip thrust|pélvica/i.test(n||'');}

/* ---- METAS + CONQUISTAS ---- */
export function maxLoadForExercise(name){let mx=0;const n=(name||'').toLowerCase();
  S.routines.forEach(r=>r.exercises.forEach(ex=>{if((ex.name||'').toLowerCase()===n&&ex.history)ex.history.forEach(h=>{if(num(h.load)>mx)mx=num(h.load);});}));return mx;}
export function allExerciseNames(){const s=new Set();S.routines.forEach(r=>r.exercises.forEach(ex=>s.add(ex.name)));return[...s];}
export function latestWeight(){const a=[...(S.progress.weight||[])].sort((x,y)=>x.date.localeCompare(y.date));return a.length?a[a.length-1].v:(S.profile?num(S.profile.weight):0);}
export function countDays(pred){let c=0;const days=S.progress.days||{};for(const k in days)if(pred(days[k]))c++;return c;}
export function waterDaysCount(){const g=S.progress.waterGoalMl||2000;return countDays(d=>{const ml=d.waterMl!=null?d.waterMl:(d.water||0)*200;return ml>=g&&ml>0;});}
export function goalProgress(g){
  if(g.type==='carga'){const cur=maxLoadForExercise(g.exercise);return{cur,target:g.target,done:cur>=g.target,unit:'kg',pct:g.target?Math.min(100,Math.round(cur/g.target*100)):0};}
  if(g.type==='peso'){const w=latestWeight(),start=g.start||w;let done,pct;
    if(g.dir==='lose'){done=w<=g.target;pct=start>g.target?Math.round((start-w)/(start-g.target)*100):100;}
    else{done=w>=g.target;pct=g.target>start?Math.round((w-start)/(g.target-start)*100):100;}
    return{cur:w,target:g.target,done,unit:'kg',pct:Math.max(0,Math.min(100,pct))};}
  if(g.type==='agua'){const c=waterDaysCount();return{cur:c,target:g.target,done:c>=g.target,unit:'dias',pct:g.target?Math.min(100,Math.round(c/g.target*100)):0};}
  if(g.type==='treinos'){const c=countDays(d=>d.workout);return{cur:c,target:g.target,done:c>=g.target,unit:'treinos',pct:g.target?Math.min(100,Math.round(c/g.target*100)):0};}
  if(g.type==='sequencia'){const c=computeStreak(d=>d.workout);return{cur:c,target:g.target,done:c>=g.target,unit:'dias',pct:g.target?Math.min(100,Math.round(c/g.target*100)):0};}
  return{cur:0,target:g.target,done:false,unit:'',pct:0};
}
export const ACHIEVEMENTS=[
  {id:'first_w',n:'Primeiro treino',em:'🎬',d:'Concluiu 1 treino',r:20,f:c=>c.W>=1},
  {id:'week',n:'Semana cheia',em:'🔥',d:'7 dias seguidos treinando',r:80,f:c=>c.streak>=7},
  {id:'w30',n:'Marombeiro',em:'🏋️',d:'30 treinos concluídos',r:150,f:c=>c.W>=30},
  {id:'w50',n:'Viciado (do bem)',em:'💪',d:'50 treinos concluídos',r:220,f:c=>c.W>=50},
  {id:'first_pr',n:'Primeiro PR',em:'📈',d:'Registrou uma carga',r:30,f:c=>c.prCount>=1},
  {id:'club100',n:'Clube dos 100',em:'💯',d:'Levantou 100 kg num exercício',r:120,f:c=>c.maxLoad>=100},
  {id:'water7',n:'Hidratado',em:'💧',d:'Bateu a água por 7 dias',r:40,f:c=>c.waterDays>=7},
  {id:'water30',n:'Mês de água',em:'🌊',d:'Bateu a água por 30 dias',r:120,f:c=>c.waterDays>=30},
  {id:'diet15',n:'Dieta on point',em:'🥗',d:'15 dias de dieta em dia',r:80,f:c=>c.D>=15},
  {id:'cardio5',n:'Fôlego de sobra',em:'🫁',d:'5 dias de cardio/atividade',r:50,f:c=>c.actDays>=5},
  {id:'stretch10',n:'Flexível',em:'🧘',d:'10 dias de alongamento',r:40,f:c=>c.stretchDays>=10},
  {id:'streak30',n:'Inabalável',em:'👑',d:'30 dias seguidos treinando',r:250,f:c=>c.streak>=30}
];
export function characterMetrics(){
  const days=S.progress.days||{};let W=0,D=0,water=0,actDays=0,cardioMin=0,stretchDays=0;
  const goalMl=S.progress.waterGoalMl||2000;
  for(const k in days){const d=days[k];if(d.workout)W++;if(d.diet)D++;if(d.stretch)stretchDays++;
    if(d.activities&&d.activities.length){actDays++;cardioMin+=d.activities.reduce((s,a)=>s+(a.min||0),0);}
    const ml=d.waterMl!=null?d.waterMl:(d.water||0)*200;if(ml>=goalMl&&ml>0)water++;}
  let prCount=0,volume=0,compVol=0,totalReps=0,maxLoad=0;
  S.routines.forEach(r=>r.exercises.forEach(ex=>{
    if(ex.history&&ex.history.length){prCount++;
      ex.history.forEach(h=>{const v=num(h.load)*(num(h.reps)||1);volume+=v;totalReps+=num(h.reps)||0;if(isCompound(ex.name))compVol+=v;if(num(h.load)>maxLoad)maxLoad=num(h.load);});}
  }));
  const otherDays=S.profile?num(S.profile.otherDays):0;
  const streak=computeStreak(d=>d.workout);
  const actx={W,D,streak:computeStreak(d=>d.workout),prCount,maxLoad,waterDays:water,actDays,stretchDays};
  let achCoins=0,achN=0;ACHIEVEMENTS.forEach(a=>{if(a.f(actx)){achCoins+=a.r;achN++;}});
  let goalCoins=0,goalN=0;(S.goals||[]).forEach(g=>{if(goalProgress(g).done){goalCoins+=(g.reward||100);goalN++;}});
  const xp=W*50+D*30+water*10+prCount*40+actDays*15+stretchDays*8+achN*30+goalN*60;
  const coinsEarned=W*10+D*8+water*3+prCount*15+actDays*5+stretchDays*2+achCoins+goalCoins;
  const spent=(S.wallet&&S.wallet.spent)||0;
  const xpForLevel=n=>Math.round(Math.pow(n-1,2)*60);
  let level=1;while(xpForLevel(level+1)<=xp)level++;
  const curBase=xpForLevel(level),nextBase=xpForLevel(level+1);
  const sc=(x,k)=>Math.max(1,Math.min(99,Math.round(Math.sqrt(Math.max(0,x))*k)));
  const stats={
    forca:sc(volume/40+prCount*4,3),
    musc:sc(W*5+volume/180,4),
    explosao:sc(compVol/35+prCount*3,3.6),
    cond:sc(W*2+otherDays*9+water*2+cardioMin/8+actDays*3,4),
    resist:sc(streak*7+totalReps/4+D*2+stretchDays*3,4)
  };
  return {W,D,water,prCount,xp,level,curBase,nextBase,xpInto:xp-curBase,xpNext:Math.max(1,nextBase-curBase),
    coins:Math.max(0,coinsEarned-spent),coinsEarned,spent,stats,streak,actx,achN,goalN};
}
export function avatarStage(){const s=characterMetrics().stats.musc;return s<22?0:s<46?1:s<72?2:3;}

export function svgAvatar(){
  const ch=CHAR()||newCharObj(),m=avatarStage(),sex=ch.sex||'M';
  const RC=raceCfg(ch.race);
  const skin=SKINS[ch.skin!=null?ch.skin:1];
  const skD=darken(skin,0.80),skDD=darken(skin,0.66),skHi=darken(skin,1.12);
  const hair=HAIRS[ch.hair!=null?ch.hair:0],hairD=darken(hair,0.70),hairHi=darken(hair,1.2),style=ch.hairStyle||'curto';
  const eq=ch.equipped||{},OUT='#141013';
  const eyeC=RC.k==='besta'?'#e23b2a':({humano:'#5b3a1e',elfo:'#2e8b57',anao:'#3a5a7a'}[RC.k]||'#5b3a1e');
  // ---- grid: 18 col x 32 row, célula C ----
  const C=11,cx=9;
  const P=[];
  const X=g=>+(g*C).toFixed(1);
  // bloco com contorno duro (pixel)
  const RO=(x,y,w,h,f)=>P.push(`<rect x="${X(x)}" y="${X(y)}" width="${X(w)}" height="${X(h)}" fill="${f}" stroke="${OUT}" stroke-width="2.4" stroke-linejoin="miter"/>`);
  // detalhe chapado, sem contorno
  const RF=(x,y,w,h,f,op)=>P.push(`<rect x="${X(x)}" y="${X(y)}" width="${X(w)}" height="${X(h)}" fill="${f}"${op?` opacity="${op}"`:''}/>`);
  const eqCol=(slot)=>{const id=eq[slot];const it=id&&itemById(id);return it?it.color:null;};

  // sombra / pedestal (chão)
  P.push(`<ellipse cx="${X(cx)}" cy="342" rx="70" ry="12" fill="rgba(198,255,58,0.10)"/>`);
  P.push(`<ellipse cx="${X(cx)}" cy="340" rx="56" ry="8" fill="none" stroke="rgba(198,255,58,0.40)" stroke-width="2"/>`);

  // dimensões por músculo + raça
  const bulk=(RC.k==='anao'||RC.k==='besta')?0.5:(RC.k==='elfo'?-0.3:0);
  const chH=3.0+m*0.55+bulk;      // meia-largura do peito (células)
  const waH=2.1+m*0.22+bulk*0.5;  // meia-largura da cintura
  const armW=(m>=2?1.5:1.15)+bulk*0.3;
  const hipH=RC.headR*0.2+2.4+bulk*0.4;
  const headHalf=2.7*RC.headR+0.2;
  const headTopY=2, headH=6*(0.92+0.08*RC.headR), headBotY=headTopY+headH;
  const neckY=headBotY, shoY=neckY+1;            // ombro
  const chestBotY=shoY+4.6;                        // fim do peito
  const waistY=chestBotY, waistBotY=waistY+2.2;    // cintura
  const hipY=waistBotY, hipBotY=hipY+2.6;          // quadril/short
  const legTopY=hipBotY, footY=28.4;               // pernas
  const armTopY=shoY+0.2, armBotY=waistY+0.3;

  // cores de equipamento
  const topC=eqCol('top'), botC=eqCol('bottom')||'#26303a', feetC=eqCol('feet');
  const sleeve=(topC&&['armor_plate','tunic_leather','robe_mage'].includes(eq.top))?topC:null;
  const isPants=['pants_leather','greaves'].includes(eq.bottom);
  const isBoot=eq.feet==='boots_leather';

  /* ---------- CAPA (atrás) ---------- */
  if(eq.cape){const cc=itemById(eq.cape).color;
    RO(cx-chH-0.5, shoY-0.2, (chH+0.5)*2, (footY-2)-(shoY-0.2), cc);
    RF(cx-0.18, shoY+0.4, 0.36, (footY-3)-(shoY+0.4), darken(cc,0.72), 0.7);
    RF(cx-chH-0.5, shoY-0.2, 0.5, (footY-2)-(shoY-0.2), darken(cc,1.25), 0.4);
  }

  /* ---------- PERNAS ---------- */
  const legW=1.7+ (m>=3?0.4:0)+bulk*0.2, legGap=0.55;
  const lLegX=cx-legGap-legW, rLegX=cx+legGap;
  const legColor=isPants?botC:skin;
  [lLegX,rLegX].forEach((lx,i)=>{
    RO(lx, legTopY, legW, footY-legTopY, legColor);
    RF(lx+legW*0.62, legTopY+0.2, legW*0.38, footY-legTopY-0.4, darken(legColor,0.82),0.8); // sombra lateral
    if(!isPants&&m>=2)RF(lx+legW*0.35,legTopY+1.2,legW*0.14,4,skD,0.5); // linha da coxa
  });
  // pés / sapato / bota
  const footW=legW+0.7;
  [lLegX,rLegX].forEach((lx)=>{
    if(isBoot){RO(lx-0.15, footY-4.2, legW+0.3, 4.2, feetC);RF(lx-0.15,footY-1,legW+0.3,1,darken(feetC,0.7),0.7);}
    RO(lx-0.35, footY-1.1, footW, 2.1, feetC||skin);
  });

  /* ---------- QUADRIL / SHORT ---------- */
  RO(cx-hipH, hipY-0.2, hipH*2, hipBotY-hipY+0.4, botC);
  RF(cx-0.12, hipY, 0.24, hipBotY-hipY, darken(botC,0.7),0.6); // vinco central
  RF(cx+hipH*0.4, hipY, hipH*0.6, hipBotY-hipY+0.4, darken(botC,0.85),0.6); // sombra

  /* ---------- BRAÇOS ---------- */
  const lArmX=cx-chH-armW+0.15, rArmX=cx+chH-0.15;
  [[lArmX,-1],[rArmX,1]].forEach(([ax,s])=>{
    const col=sleeve||skin;
    RO(ax, armTopY, armW, armBotY-armTopY, col);
    RF(ax+(s>0?armW*0.6:0), armTopY+0.2, armW*0.4, armBotY-armTopY-0.4, darken(col,0.82),0.8);
    if(!sleeve&&m>=2)RF(ax+armW*0.28,armTopY+ (armBotY-armTopY)*0.3,armW*0.4,1.4,skHi,0.35); // bíceps
    if(sleeve&&['armor_plate'].includes(eq.top)){ // ombreira
      RO(ax-0.25, armTopY-0.4, armW+0.5, 1.7, darken(col,1.1));
    }
  });
  // mãos
  const handY=armBotY-0.1;
  const handCol=(eq.hands&&['gloves','straps'].includes(eq.hands))?itemById(eq.hands).color:skin;
  RO(lArmX-0.05, handY, armW+0.1, 1.6, handCol);
  RO(rArmX-0.05, handY, armW+0.1, 1.6, handCol);
  if(eq.wrists){const wc=itemById(eq.wrists).color;RF(lArmX-0.1,handY-0.9,armW+0.2,0.9,wc);RF(rArmX-0.1,handY-0.9,armW+0.2,0.9,wc);
    P.push(`<rect x="${X(lArmX-0.1)}" y="${X(handY-0.9)}" width="${X(armW+0.2)}" height="${X(0.9)}" fill="none" stroke="${OUT}" stroke-width="1.6"/>`);
    P.push(`<rect x="${X(rArmX-0.1)}" y="${X(handY-0.9)}" width="${X(armW+0.2)}" height="${X(0.9)}" fill="none" stroke="${OUT}" stroke-width="1.6"/>`);}

  /* ---------- TRONCO ---------- */
  const torsoCol=topC||skin;
  // peito (bloco largo) + cintura (bloco estreito) = silhueta em V
  RO(cx-chH, shoY, chH*2, chestBotY-shoY, torsoCol);
  RO(cx-waH, waistY-0.1, waH*2, waistBotY-waistY+0.2, torsoCol);
  // sombra lateral direita do tronco (volume)
  RF(cx+chH*0.55, shoY+0.2, chH*0.45, chestBotY-shoY-0.2, darken(torsoCol,0.84),0.85);
  RF(cx-chH, shoY, chH*0.35, chestBotY-shoY-0.4, darken(torsoCol,1.14),0.30); // luz esquerda
  if(!topC){ // torso nu: peitoral + abdômen
    RF(cx-chH*0.62, shoY+2.1, chH*1.24, 0.4, skD, 0.7); // linha peitoral
    RF(cx-0.09, shoY+0.6, 0.18, chestBotY-shoY-1, skD, 0.5); // esterno
    if(m>=1){for(let a=0;a<(m>=2?3:2);a++){RF(cx-chH*0.4, chestBotY-0.2-a*1.05, chH*0.8, 0.34, skD,0.6);}}
    if(m>=2){RF(cx-chH*0.5,shoY+0.5,chH*0.42,1.6,skHi,0.28);RF(cx+chH*0.1,shoY+0.5,chH*0.42,1.6,skHi,0.22);} // brilho peito
  }else if(eq.top==='armor_plate'){
    RF(cx-chH*0.6,shoY+2.2,chH*1.2,0.5,darken(topC,0.72),0.9);
    RF(cx-0.12,shoY+0.4,0.24,chestBotY-shoY-0.6,darken(topC,0.72),0.8);
    RF(cx-chH*0.5,shoY+0.5,chH,1.4,darken(topC,1.2),0.4);
  }else if(eq.top==='robe_mage'){
    RO(cx-waH-0.2, waistBotY-0.1, (waH+0.2)*2, hipBotY-waistBotY+1.2, topC); // manto desce
    RF(cx-waH,waistY+0.2,waH*2,0.5,'#d9a441',0.9);
  }
  // cinturão
  if(eq.belt){const bc=itemById(eq.belt).color;RO(cx-waH-0.1, waistBotY-0.7, (waH+0.1)*2, 1.1, bc);RF(cx-0.5,waistBotY-0.6,1,0.9,'#d9a441');}

  /* ---------- PESCOÇO ---------- */
  RO(cx-0.9, neckY-0.3, 1.8, shoY-neckY+0.6, skin);
  RF(cx+0.2,neckY-0.2,0.7,shoY-neckY+0.4,skD,0.6);
  if(eq.neck){const nc=itemById(eq.neck).color;RF(cx-1.1,shoY-0.2,2.2,0.5,nc);P.push(`<circle cx="${X(cx)}" cy="${X(shoY+0.4)}" r="4" fill="${nc}" stroke="${OUT}" stroke-width="1.6"/>`);}

  /* ---------- CABEÇA ---------- */
  const hx=cx-headHalf, hw=headHalf*2;
  // orelhas
  if(RC.ear==='point'){
    RO(hx-0.5, headTopY+1.4, 0.9, 1.2, skin);
    RO(hx+hw-0.4, headTopY+1.4, 0.9, 1.2, skin);
    RF(hx-0.5,headTopY+1.4,0.4,0.5,skHi,0.5);
  }else{
    RO(hx-0.4, headTopY+2.2, 0.8, 1.2, skin);
    RO(hx+hw-0.4, headTopY+2.2, 0.8, 1.2, skin);
  }
  // cabelo atrás (longo)
  if(style==='longo'&&(!eq.head||eq.head==='bandana')){
    RO(hx-0.5, headTopY+1.6, hw+1, headH+2.6, hair);
  }
  // rosto
  RO(hx, headTopY, hw, headH, skin);
  RF(hx, headTopY, hw*0.34, headH-0.4, skHi, 0.28); // luz
  RF(hx+hw*0.62, headTopY+0.2, hw*0.38, headH-0.4, skD, 0.6); // sombra
  // bochechas
  RF(hx+hw*0.12, headTopY+headH*0.62, 1, 0.7, 'rgba(220,110,90,0.18)');
  RF(hx+hw*0.72, headTopY+headH*0.62, 1, 0.7, 'rgba(220,110,90,0.18)');
  // olhos (pixel)
  const eyeY=headTopY+headH*0.42, ew=1.05, eh=1.15;
  const eLx=hx+hw*0.20, eRx=hx+hw*0.80-ew;
  [eLx,eRx].forEach(ex=>{
    RF(ex,eyeY,ew,eh,'#fff');
    RF(ex+ew*0.30,eyeY+eh*0.22,ew*0.55,eh*0.6,eyeC);
    RF(ex+ew*0.34,eyeY+eh*0.28,ew*0.3,eh*0.34,'#111');
    RF(ex+ew*0.30,eyeY,ew*0.7,eh*0.16,skD,0.5); // pálpebra
  });
  // sobrancelhas
  if(RC.brow){RF(eLx-0.1,eyeY-0.7,ew+0.3,0.5,OUT);RF(eRx-0.2,eyeY-0.7,ew+0.3,0.5,OUT);}
  else{RF(eLx,eyeY-0.55,ew,0.4,hairD,0.9);RF(eRx,eyeY-0.55,ew,0.4,hairD,0.9);}
  // nariz
  RF(cx-0.28,eyeY+eh+0.15,0.56,0.9,skD,0.75);
  // boca
  if(!RC.beard)RF(hx+hw*0.32,headTopY+headH*0.76,hw*0.36,0.42,'#8a4a3a',0.9);
  // presas
  if(RC.fang){RF(hx+hw*0.34,headTopY+headH*0.80,0.5,0.8,'#fff');RF(hx+hw*0.62,headTopY+headH*0.80,0.5,0.8,'#fff');}
  // barba (anão)
  if(RC.beard){RO(hx+0.2, headTopY+headH*0.55, hw-0.4, headH*0.75, hair);
    RF(hx+hw*0.3,headTopY+headH*0.6,hw*0.4,0.6,'#8a4a3a',0.6); // boca no meio da barba
    RF(hx+0.4,headTopY+headH*0.6,hw*0.3,headH*0.6,hairHi,0.25);}

  // ---- CABELO da frente (se sem elmo/boné cobrindo) ----
  const headCovered=eq.head&&['helm_steel','helm_horned','cap_black','cap_red'].includes(eq.head);
  if(!headCovered&&style!=='careca'){
    if(style==='moicano'){RO(cx-0.7, headTopY-2.2, 1.4, 3.0, hair);RF(cx-0.5,headTopY-2,0.5,2.6,hairHi,0.4);}
    else if(style==='topete'){RO(hx+0.3, headTopY-1.8, hw-0.6, 2.6, hair);RO(hx+hw*0.28,headTopY-2.8,hw*0.5,1.6,hair);}
    else { // curto / longo (frente)
      RO(hx-0.2, headTopY-1.4, hw+0.4, 2.4, hair);
      RF(hx+hw*0.05,headTopY-1.2,hw*0.4,1.8,hairHi,0.4);
      // costeletas
      RF(hx-0.2,headTopY+0.8,0.7,headH*0.4,hair);RF(hx+hw-0.5,headTopY+0.8,0.7,headH*0.4,hair);
    }
  }
  // chifres (besta) — por cima
  if(RC.horns){
    RO(hx-0.3, headTopY-2.2, 1.1, 2.6, '#e8dcc0');
    RO(hx+hw-0.8, headTopY-2.2, 1.1, 2.6, '#e8dcc0');
    RF(hx-0.1,headTopY-2,0.5,2,'#fff',0.4);RF(hx+hw-0.6,headTopY-2,0.5,2,'#fff',0.4);
  }
  // ---- CABEÇA: bandana / boné / elmo ----
  if(eq.head){const hc=itemById(eq.head).color,hcD=darken(hc,0.78),hcHi=darken(hc,1.2);
    if(eq.head==='bandana'){RO(hx-0.2, headTopY-0.2, hw+0.4, 1.5, hc);RF(hx+hw-1.2,headTopY+1.2,0.9,1.8,hc);}
    else if(eq.head==='helm_steel'||eq.head==='helm_horned'){
      RO(hx-0.3, headTopY-1.6, hw+0.6, headH*0.62, hc);
      RF(hx, headTopY-1.4, hw*0.4, headH*0.5, hcHi, 0.4);
      RF(cx-0.35, headTopY+0.2, 0.7, headH*0.75, hcD); // protetor nasal
      RF(hx-0.3,headTopY+headH*0.5,hw+0.6,0.5,hcD);
      if(eq.head==='helm_horned'){RO(hx-1.0,headTopY-2.4,1.2,2.2,'#e8dcc0');RO(hx+hw-0.2,headTopY-2.4,1.2,2.2,'#e8dcc0');}
    }
    else{ // boné
      RO(hx-0.3, headTopY-1.2, hw+0.6, 1.8, hc);
      RO(hx+hw-1.4, headTopY+0.2, 2.4, 0.9, hc); // aba
      RF(hx,headTopY-1,hw*0.4,1.2,hcHi,0.4);
    }
  }

  /* ---------- ARMAS na mão direita ---------- */
  if(eq.hands==='sword'){
    const sxx=rArmX+armW*0.5;
    RO(sxx-0.28, handY-4.6, 0.56, 5.4, '#cbd0d6');      // lâmina
    RF(sxx-0.1, handY-4.6, 0.2, 5.0, '#eef2f5',0.7);
    RO(sxx-0.9, handY+0.5, 1.8, 0.6, '#d9a441');         // guarda
    RO(sxx-0.3, handY+1.0, 0.6, 1.4, '#6b3e16');         // cabo
  }else if(eq.hands==='axe'){
    const sxx=rArmX+armW*0.5;
    RO(sxx-0.22, handY-4.4, 0.44, 6.0, '#6b3e16');       // cabo
    RO(sxx-0.1, handY-4.6, 2.4, 2.4, itemById('axe').color); // cabeça
    RF(sxx+0.1,handY-4.4,1.8,0.6,'#eef2f5',0.5);
  }

  return `<svg viewBox="0 0 200 352" shape-rendering="crispEdges">${P.join('')}</svg>`;
}

let shopSlot='head';
export function renderPersonagem(){
  const body=document.getElementById('bro-body');if(!body)return;
  if(!hasChar()){
    document.getElementById('bro-sub').textContent='Crie seu personagem';
    body.innerHTML=`<div class="card profile-cta"><div class="big">🦾</div>
      <h3>Crie seu Bro</h3>
      <p>Um personagem que <b>evolui junto com você</b>: ganha músculo, sobe de nível e desbloqueia equipamentos a cada treino e refeição concluídos.</p>
      <button class="btn btn-acc" style="margin:0 auto" onclick="openCharacterForm(-1)">Criar personagem</button></div>`;
    return;
  }
  const ch=CHAR();
  const M=characterMetrics();
  const cls=rpgClass(M.level);
  const rc=raceCfg(ch.race);
  const power=Object.values(M.stats).reduce((a,b)=>a+b,0);
  document.getElementById('bro-sub').textContent=`${rc.em} ${rc.l} · ${cls.t}`;
  const xpPct=Math.min(100,Math.round(M.xpInto/M.xpNext*100));
  const roster=S.characters.map((c,i)=>`<button class="rchip ${i===S.activeChar?'on':''}" onclick="switchChar(${i})">${raceCfg(c.race).em} ${esc(c.name)}</button>`).join('')
    +`<button class="rchip add" onclick="openCharacterForm(-1)">＋ Novo</button>`;
  body.innerHTML=`
    <div class="card">
      <div class="roster">${roster}</div>
      <div class="class-banner">${rc.em} ${rc.l} · ${cls.em} ${cls.t}</div>
      <div class="avatar-stage">${svgAvatar()}</div>
      <div class="lvl-row">
        <div class="lvl-badge"><small>NÍVEL</small><b>${M.level}</b></div>
        <div class="lvl-info">
          <div class="nm">${esc(ch.name||'Meu Bro')} <button class="mini" onclick="openCharacterForm(${S.activeChar})" style="vertical-align:middle">✏️</button>${S.characters.length>1?`<button class="mini del" onclick="delChar(${S.activeChar})" style="vertical-align:middle">🗑</button>`:''}</div>
          <div class="xpbar"><i style="width:${xpPct}%"></i></div>
          <div style="font-size:11px;color:var(--mut);margin-top:3px">${M.xpInto} / ${M.xpNext} XP pro nível ${M.level+1}</div>
        </div>
        <div class="coins">🪙 ${M.coins}</div>
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <b style="font-size:15px">📊 Atributos</b>
        <span class="power">⚔️ Poder ${power}</span>
      </div>
      <div style="color:var(--mut);font-size:12px;margin:2px 0 14px">Sobem conforme você treina, registra cargas e mantém a consistência.</div>
      ${STATMETA.map(s=>{const v=M.stats[s.k];return `<div class="stat-row">
        <div class="ico">${s.i}</div><div class="nm">${s.l}</div>
        <div class="track"><i style="width:${v}%;background:${s.c}"></i></div>
        <div class="v">${v}</div></div>`;}).join('')}
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
        <b style="font-size:15px">🛍️ Loja</b>
        <span class="coins" style="font-size:14px;padding:6px 11px">🪙 ${M.coins}</span>
      </div>
      <div class="why">Ganhe moedas concluindo treinos (+10), refeições/dieta em dia (+8), batendo a água (+3) e batendo recordes (+15). Toque pra comprar e equipar.</div>
      <div class="slot-tabs">${SLOTS.map(s=>`<button class="${shopSlot===s.k?'on':''}" onclick="setShopSlot('${s.k}')">${s.l}</button>`).join('')}</div>
      <div class="shop-grid">
        ${SHOP.filter(it=>it.slot===shopSlot).map(it=>{
          const owned=S.wallet.owned.includes(it.id),equipped=ch.equipped[it.slot]===it.id;
          const can=M.coins>=it.cost;
          let act;
          if(equipped)act='<div class="act eq">✓ Equipado</div>';
          else if(owned)act='<div class="act own">Equipar</div>';
          else if(it.cost===0)act='<div class="act own">Equipar</div>';
          else act=`<div class="act buy ${can?'':'no'}">🪙 ${it.cost}</div>`;
          const rar=rarityOf(it.cost);
          const bstyle=(!equipped&&!owned)?`style="border-color:${rar.c}44"`:'';
          return `<div class="shop-item ${equipped?'equipped':owned?'owned':''}" ${bstyle} onclick="shopTap('${it.id}')">
            <div class="rar" style="color:${rar.c}">${rar.l}</div>
            <div class="em">${it.em}</div><div class="nm">${esc(it.name)}</div>${act}</div>`;
        }).join('')}
      </div>
    </div>`;
}
export function setShopSlot(k){shopSlot=k;renderPersonagem();}
export function shopTap(id){
  const it=itemById(id),ch=CHAR();if(!ch)return;
  const owned=S.wallet.owned.includes(id);
  if(owned||it.cost===0){
    if(!owned)S.wallet.owned.push(id);
    const nowEq=ch.equipped[it.slot]!==id;
    ch.equipped[it.slot]=nowEq?id:(it.slot==='bottom'?'short_black':null);
    save();renderPersonagem();toast(nowEq?(it.name+' equipado ✅'):'Removido');
    return;
  }
  const M=characterMetrics();
  if(M.coins<it.cost){toast('Moedas insuficientes 🪙 — treine mais!');return;}
  S.wallet.owned.push(id);S.wallet.spent=(S.wallet.spent||0)+it.cost;ch.equipped[it.slot]=id;
  save();renderPersonagem();toast('Comprou '+it.name+'! 🛍️');
}
export function switchChar(i){S.activeChar=i;save();renderPersonagem();}
export function delChar(i){
  if(S.characters.length<=1){toast('Você precisa de pelo menos 1 personagem');return;}
  if(!confirm('Apagar este personagem? As moedas e itens continuam seus.'))return;
  S.characters.splice(i,1);if(S.activeChar>=S.characters.length)S.activeChar=S.characters.length-1;
  save();renderPersonagem();toast('Personagem removido');
}
// idx = -1 cria novo; senão edita o índice
export function openCharacterForm(idx){
  const editing=idx>=0&&S.characters[idx];
  const ch=editing?S.characters[idx]:newCharObj();
  showModal(`<h3>${editing?'Editar personagem':'Novo personagem'}</h3>
    <p class="sub">Personalize seu Bro. Moedas e nível são compartilhados entre todos.</p>
    <div class="field"><label>Nome</label><input id="ch-name" placeholder="Meu Bro" value="${esc(ch.name||'')}"></div>
    <div class="field"><label>Raça</label>
      ${chipRow('chrace',RACES.map(r=>({k:r.k,l:r.em+' '+r.l})),ch.race||'humano','k','l')}
      <p class="hint">${(raceCfg(ch.race).flavor)}</p></div>
    <div class="field"><label>Tipo</label>
      ${chipRow('chsex',[{k:'M',l:'Masculino'},{k:'F',l:'Feminino'}],ch.sex||'M','k','l')}</div>
    <div class="field"><label>Tom de pele</label>
      <div class="skin-pick" style="flex-wrap:wrap">${SKINS.map((c,i)=>`<button type="button" class="sk ${((ch.skin!=null?ch.skin:1)===i)?'on':''}" data-i="${i}" style="background:${c}" onclick="document.querySelectorAll('.sk').forEach(b=>b.classList.remove('on'));this.classList.add('on')"></button>`).join('')}</div></div>
    <div class="field"><label>Cor do cabelo</label>
      <div class="skin-pick" style="flex-wrap:wrap">${HAIRS.map((c,i)=>`<button type="button" class="hr ${((ch.hair!=null?ch.hair:0)===i)?'on':''}" data-i="${i}" style="background:${c}" onclick="document.querySelectorAll('.hr').forEach(b=>b.classList.remove('on'));this.classList.add('on')"></button>`).join('')}</div></div>
    <div class="field"><label>Estilo de cabelo</label>
      ${chipRow('chair',HAIRSTYLES,ch.hairStyle||'curto','k','l')}</div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveCharacter(${editing?idx:-1})">${editing?'Salvar':'Criar Bro'}</button></div>`);
}
export function saveCharacter(idx){
  const editing=idx>=0&&S.characters[idx];
  const ch=editing?S.characters[idx]:newCharObj();
  ch.name=document.getElementById('ch-name').value.trim()||'Meu Bro';
  ch.sex=chipVal('chsex')||'M';
  ch.race=chipVal('chrace')||'humano';
  const sk=document.querySelector('.sk.on');ch.skin=sk?+sk.getAttribute('data-i'):1;
  const hr=document.querySelector('.hr.on');ch.hair=hr?+hr.getAttribute('data-i'):0;
  ch.hairStyle=chipVal('chair')||'curto';
  if(!editing){S.characters.push(ch);S.activeChar=S.characters.length-1;}
  save();renderPersonagem();closeModal();toast(editing?'Personagem salvo ✅':'Bora treinar, '+ch.name+'! 🦾');
}
