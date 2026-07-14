import {S,save,esc,num} from './state.js';
import {toast,showModal,closeModal} from './ui.js';
import {chipRow,chipVal} from './perfil.js';
import {computeStreak} from './progresso.js';
import {SKINS,HAIRS,HAIRSTYLES,RACES,raceCfg,EYECOLORS,EYESTYLES} from './data/racas.js';
import {RPGCLASSES,rpgClass,rarityOf,SLOTS,SHOP,itemById,STATMETA} from './data/loja.js';

/* ============ PERSONAGEM (RPG) ============ */
export function darken(hex,f){const h=hex.replace('#','');const r=Math.round(parseInt(h.slice(0,2),16)*f),g=Math.round(parseInt(h.slice(2,4),16)*f),b=Math.round(parseInt(h.slice(4,6),16)*f);return'#'+[r,g,b].map(x=>Math.max(0,Math.min(255,x)).toString(16).padStart(2,'0')).join('');}
export function CHAR(){return(S.characters&&S.characters[S.activeChar])||null;}
export function hasChar(){return!!(S.characters&&S.characters.length);}
export function newCharObj(){return{name:'Meu Bro',race:'humano',sex:'M',skin:1,hair:0,hairStyle:'espetado',eyeColor:1,eyeStyle:'determinado',equipped:{head:null,neck:null,wrists:null,hands:null,belt:null,top:null,bottom:'short_black',feet:null,cape:null}};}
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
  const R=raceCfg(ch.race);
  const skin=SKINS[ch.skin!=null?ch.skin:1];
  const skD=darken(skin,0.82),skDD=darken(skin,0.66),skHi=darken(skin,1.14);
  const hair=HAIRS[ch.hair!=null?ch.hair:0],hairD=darken(hair,0.70),hairHi=darken(hair,1.30),style=ch.hairStyle||'curto';
  const eyeC=EYECOLORS[ch.eyeColor!=null?ch.eyeColor:0],eyeD=darken(eyeC,0.66),eyeHi=darken(eyeC,1.35);
  const expr=ch.eyeStyle||'determinado';
  const OUT='#1c151b',ow=2.6;
  const eq=ch.equipped||{},cx=100,bm=R.body;
  const shA=((sex==='M'?27:23)*bm)+m*7, wA=((sex==='M'?18:16)*bm)+m*1.5, hA=((sex==='M'?21:24)*bm)+m;
  const armW=(10.5+m*4)*bm, legW=(14+m*3)*bm;
  const shoulderY=96, footY=322;
  const hipY=Math.round(193-(R.leg-1)*100), waistY=hipY-8;
  const lSho=cx-shA+4,rSho=cx+shA-4,lHand=cx-shA-3,rHand=cx+shA+3,handY=waistY-2;
  const lLeg=cx-10,rLeg=cx+10,lFoot=cx-12,rFoot=cx+12;
  const P=[];
  const gid='bg'+(ch.skin||0);
  P.push(`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${skD}"/><stop offset="0.45" stop-color="${skin}"/><stop offset="1" stop-color="${skDD}"/></linearGradient></defs>`);
  // PEDESTAL
  P.push(`<ellipse cx="${cx}" cy="338" rx="64" ry="13" fill="rgba(198,255,58,0.10)"/>`);
  P.push(`<ellipse cx="${cx}" cy="336" rx="52" ry="9" fill="none" stroke="rgba(198,255,58,0.45)" stroke-width="2"/>`);
  // CAPA (atrás de tudo)
  if(eq.cape){const cc=itemById(eq.cape).color;
    P.push(`<path d="M ${cx-shA+2} ${shoulderY-2} Q ${cx-shA-8} ${(shoulderY+footY)/2} ${cx-hA-6} ${footY-14} Q ${cx} ${footY-2} ${cx+hA+6} ${footY-14} Q ${cx+shA+8} ${(shoulderY+footY)/2} ${cx+shA-2} ${shoulderY-2} Q ${cx} ${shoulderY+8} ${cx-shA+2} ${shoulderY-2} Z" fill="${cc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
    P.push(`<path d="M ${cx} ${shoulderY+4} L ${cx} ${footY-14}" stroke="${darken(cc,0.78)}" stroke-width="2" opacity="0.6"/>`);
  }
  // LEGS
  [[lLeg,lFoot],[rLeg,rFoot]].forEach(([lx,fx])=>{
    P.push(`<line x1="${lx}" y1="${hipY}" x2="${fx}" y2="${footY-10}" stroke="${OUT}" stroke-width="${legW+ow*2}" stroke-linecap="round"/>`);
    P.push(`<line x1="${lx}" y1="${hipY}" x2="${fx}" y2="${footY-10}" stroke="${skin}" stroke-width="${legW}" stroke-linecap="round"/>`);
    P.push(`<line x1="${lx-legW/4}" y1="${hipY+4}" x2="${fx-legW/4}" y2="${footY-14}" stroke="${skHi}" stroke-width="${legW/4}" stroke-linecap="round" opacity="0.5"/>`);
  });
  const shoe=eq.feet&&itemById(eq.feet);
  if(shoe){
    if(eq.feet==='boots_leather'){
      P.push(`<line x1="${lLeg-1}" y1="${footY-34}" x2="${lFoot}" y2="${footY-6}" stroke="${shoe.color}" stroke-width="${legW+3}" stroke-linecap="round"/>`);
      P.push(`<line x1="${rLeg+1}" y1="${footY-34}" x2="${rFoot}" y2="${footY-6}" stroke="${shoe.color}" stroke-width="${legW+3}" stroke-linecap="round"/>`);
    }
    P.push(`<ellipse cx="${lFoot-2}" cy="${footY}" rx="${legW/1.4+4}" ry="9" fill="${shoe.color}" stroke="${OUT}" stroke-width="${ow}"/>`);
    P.push(`<ellipse cx="${rFoot+2}" cy="${footY}" rx="${legW/1.4+4}" ry="9" fill="${shoe.color}" stroke="${OUT}" stroke-width="${ow}"/>`);
    if(eq.feet==='squat_shoe'){P.push(`<rect x="${lFoot-legW/1.4-3}" y="${footY+5}" width="${legW/0.7}" height="5" rx="2" fill="#222"/>`);P.push(`<rect x="${rFoot-legW/1.4+1}" y="${footY+5}" width="${legW/0.7}" height="5" rx="2" fill="#222"/>`);}
  }else{P.push(`<ellipse cx="${lFoot-1}" cy="${footY}" rx="${legW/2+2}" ry="7" fill="${skin}" stroke="${OUT}" stroke-width="${ow}"/>`);P.push(`<ellipse cx="${rFoot+1}" cy="${footY}" rx="${legW/2+2}" ry="7" fill="${skin}" stroke="${OUT}" stroke-width="${ow}"/>`);
    if(R.k==='besta'){P.push(`<path d="M ${lFoot-legW/2-2} ${footY} l -5 -3 M ${lFoot-legW/2-2} ${footY+2} l -5 0 M ${rFoot+legW/2+2} ${footY} l 5 -3 M ${rFoot+legW/2+2} ${footY+2} l 5 0" stroke="${OUT}" stroke-width="1.6"/>`);}}
  // CALÇA / SHORT
  const shortC=eqColor('bottom','#26303a');
  const isPants=eq.bottom==='pants_leather'||eq.bottom==='greaves';
  if(isPants){
    P.push(`<line x1="${lLeg}" y1="${hipY-2}" x2="${lFoot}" y2="${footY-16}" stroke="${shortC}" stroke-width="${legW+1}" stroke-linecap="round"/>`);
    P.push(`<line x1="${rLeg}" y1="${hipY-2}" x2="${rFoot}" y2="${footY-16}" stroke="${shortC}" stroke-width="${legW+1}" stroke-linecap="round"/>`);
    if(eq.bottom==='greaves'){P.push(`<line x1="${lLeg}" y1="${hipY+20}" x2="${lFoot-4}" y2="${footY-18}" stroke="${darken(shortC,1.2)}" stroke-width="2" opacity="0.5"/>`);P.push(`<line x1="${rLeg}" y1="${hipY+20}" x2="${rFoot+4}" y2="${footY-18}" stroke="${darken(shortC,1.2)}" stroke-width="2" opacity="0.5"/>`);}
  }
  P.push(`<path d="M ${cx-hA-2} ${hipY-12} L ${cx+hA+2} ${hipY-12} L ${cx+hA-2} ${hipY+34} L ${cx+4} ${hipY+30} L ${cx} ${hipY+40} L ${cx-4} ${hipY+30} L ${cx-hA+2} ${hipY+34} Z" fill="${shortC}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
  // ARMS
  [[lSho,lHand],[rSho,rHand]].forEach(([sx,hx])=>{
    P.push(`<line x1="${sx}" y1="${shoulderY+8}" x2="${hx}" y2="${handY}" stroke="${OUT}" stroke-width="${armW+ow*2}" stroke-linecap="round"/>`);
    P.push(`<line x1="${sx}" y1="${shoulderY+8}" x2="${hx}" y2="${handY}" stroke="${skin}" stroke-width="${armW}" stroke-linecap="round"/>`);
  });
  if(m>=2){P.push(`<circle cx="${(lSho+lHand)/2+1}" cy="${(shoulderY+8+handY)/2-6}" r="${armW/2.6}" fill="rgba(255,255,255,0.10)"/>`);P.push(`<circle cx="${(rSho+rHand)/2-1}" cy="${(shoulderY+8+handY)/2-6}" r="${armW/2.6}" fill="rgba(255,255,255,0.10)"/>`);}
  P.push(`<circle cx="${lHand}" cy="${handY+2}" r="${armW/2-1}" fill="${skin}" stroke="${OUT}" stroke-width="${ow}"/>`);
  P.push(`<circle cx="${rHand}" cy="${handY+2}" r="${armW/2-1}" fill="${skin}" stroke="${OUT}" stroke-width="${ow}"/>`);
  // TORSO (gradiente = volume)
  P.push(`<path d="M ${cx-shA} ${shoulderY} Q ${cx-shA-3} ${shoulderY+30} ${cx-wA} ${waistY} L ${cx+wA} ${waistY} Q ${cx+shA+3} ${shoulderY+30} ${cx+shA} ${shoulderY} Q ${cx} ${shoulderY-8} ${cx-shA} ${shoulderY} Z" fill="url(#${gid})" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
  P.push(`<path d="M ${cx-shA+7} ${shoulderY+3} Q ${cx} ${shoulderY+11} ${cx+shA-7} ${shoulderY+3}" stroke="${skD}" stroke-width="2" fill="none" opacity="0.7"/>`);
  if(m>=1){P.push(`<line x1="${cx}" y1="${shoulderY+14}" x2="${cx}" y2="${waistY-6}" stroke="${skD}" stroke-width="2.2"/>`);
    P.push(`<path d="M ${cx-2} ${shoulderY+15} Q ${cx-15} ${shoulderY+23} ${cx-17} ${shoulderY+31}" stroke="${skD}" stroke-width="2" fill="none"/>`);
    P.push(`<path d="M ${cx+2} ${shoulderY+15} Q ${cx+15} ${shoulderY+23} ${cx+17} ${shoulderY+31}" stroke="${skD}" stroke-width="2" fill="none"/>`);}
  if(m>=2){P.push(`<line x1="${cx-13}" y1="${shoulderY+50}" x2="${cx+13}" y2="${shoulderY+50}" stroke="${skD}" stroke-width="1.6"/>`);
    P.push(`<line x1="${cx-12}" y1="${shoulderY+64}" x2="${cx+12}" y2="${shoulderY+64}" stroke="${skD}" stroke-width="1.6"/>`);
    P.push(`<line x1="${cx-11}" y1="${shoulderY+78}" x2="${cx+11}" y2="${shoulderY+78}" stroke="${skD}" stroke-width="1.4" opacity="0.7"/>`);}
  if(eq.top){const tc=itemById(eq.top).color,tcD=darken(tc,0.78),tid=eq.top;
    if(tid==='armor_plate'){
      P.push(`<path d="M ${cx-shA} ${shoulderY-1} Q ${cx-shA-3} ${shoulderY+30} ${cx-wA-2} ${waistY+3} L ${cx+wA+2} ${waistY+3} Q ${cx+shA+3} ${shoulderY+30} ${cx+shA} ${shoulderY-1} Q ${cx} ${shoulderY+9} ${cx-shA} ${shoulderY-1} Z" fill="${tc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
      P.push(`<path d="M ${cx-shA+8} ${shoulderY+4} Q ${cx} ${shoulderY+16} ${cx+shA-8} ${shoulderY+4}" stroke="${tcD}" stroke-width="2.4" fill="none"/>`);
      P.push(`<line x1="${cx}" y1="${shoulderY+16} " x2="${cx}" y2="${waistY}" stroke="${tcD}" stroke-width="2.4"/>`);
      P.push(`<path d="M ${cx-15} ${shoulderY+34} h30 M ${cx-14} ${shoulderY+50} h28 M ${cx-12} ${shoulderY+66} h24" stroke="${tcD}" stroke-width="2" fill="none"/>`);
      P.push(`<circle cx="${cx-shA+2}" cy="${shoulderY+3}" r="${9*bm+m}" fill="${tc}" stroke="${OUT}" stroke-width="${ow}"/>`);
      P.push(`<circle cx="${cx+shA-2}" cy="${shoulderY+3}" r="${9*bm+m}" fill="${tc}" stroke="${OUT}" stroke-width="${ow}"/>`);
      P.push(`<circle cx="${cx-shA+2}" cy="${shoulderY+3}" r="${4}" fill="${tcD}"/><circle cx="${cx+shA-2}" cy="${shoulderY+3}" r="${4}" fill="${tcD}"/>`);
    }else if(tid==='robe_mage'){
      P.push(`<path d="M ${cx-shA+4} ${shoulderY} Q ${cx-shA-4} ${shoulderY+40} ${cx-hA-4} ${hipY+34} Q ${cx} ${hipY+44} ${cx+hA+4} ${hipY+34} Q ${cx+shA+4} ${shoulderY+40} ${cx+shA-4} ${shoulderY} Q ${cx} ${shoulderY+12} ${cx-shA+4} ${shoulderY} Z" fill="${tc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
      P.push(`<path d="M ${cx} ${shoulderY+14} L ${cx} ${hipY+30}" stroke="${tcD}" stroke-width="2"/>`);
      P.push(`<path d="M ${cx-wA} ${waistY} Q ${cx} ${waistY+6} ${cx+wA} ${waistY}" stroke="#d9a441" stroke-width="3" fill="none"/>`);
    }else if(tid==='tunic_leather'){
      P.push(`<path d="M ${cx-shA} ${shoulderY} Q ${cx-shA-3} ${shoulderY+30} ${cx-wA} ${waistY+4} L ${cx+wA} ${waistY+4} Q ${cx+shA+3} ${shoulderY+30} ${cx+shA} ${shoulderY} Q ${cx} ${shoulderY+2} ${cx-shA} ${shoulderY} Z" fill="${tc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
      P.push(`<circle cx="${lSho}" cy="${shoulderY+14}" r="${armW/1.7}" fill="${tc}" stroke="${OUT}" stroke-width="${ow}"/>`);
      P.push(`<circle cx="${rSho}" cy="${shoulderY+14}" r="${armW/1.7}" fill="${tc}" stroke="${OUT}" stroke-width="${ow}"/>`);
      P.push(`<path d="M ${cx-8} ${shoulderY+6} L ${cx} ${shoulderY+18} L ${cx+8} ${shoulderY+6}" stroke="${tcD}" stroke-width="2" fill="none"/>`);
      P.push(`<path d="M ${cx-wA} ${waistY} Q ${cx} ${waistY+5} ${cx+wA} ${waistY}" stroke="${darken(tc,0.6)}" stroke-width="3" fill="none"/>`);
    }else{
      P.push(`<path d="M ${cx-shA+5} ${shoulderY+1} Q ${cx-shA-2} ${shoulderY+30} ${cx-wA-1} ${waistY+2} L ${cx+wA+1} ${waistY+2} Q ${cx+shA+2} ${shoulderY+30} ${cx+shA-5} ${shoulderY+1} L ${cx+wA-2} ${shoulderY+5} Q ${cx} ${shoulderY+19} ${cx-wA+2} ${shoulderY+5} Z" fill="${tc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
    }
  }
  if(eq.belt){P.push(`<rect x="${cx-wA-2}" y="${waistY-12}" width="${wA*2+4}" height="13" rx="3" fill="${itemById(eq.belt).color}" stroke="${OUT}" stroke-width="${ow}"/>`);P.push(`<rect x="${cx-5}" y="${waistY-11}" width="10" height="11" rx="2" fill="#d9a441" stroke="${OUT}" stroke-width="1.2"/>`);}
  // NECK (curto, estilo anime)
  const neckY=Math.round(74+14*R.headR);
  P.push(`<rect x="${cx-7}" y="${neckY-4}" width="14" height="${shoulderY-neckY+8}" rx="5" fill="${skin}" stroke="${OUT}" stroke-width="${ow}"/>`);
  P.push(`<path d="M ${cx-7} ${neckY-2} Q ${cx} ${neckY+5} ${cx+7} ${neckY-2}" fill="${skD}" opacity="0.4"/>`);
  if(eq.neck){const nc=itemById(eq.neck).color;P.push(`<path d="M ${cx-13} ${neckY+8} Q ${cx} ${neckY+24} ${cx+13} ${neckY+8}" stroke="${nc}" stroke-width="3.5" fill="none"/>`);P.push(`<circle cx="${cx}" cy="${neckY+21}" r="3.5" fill="${nc}" stroke="${OUT}" stroke-width="1.4"/>`);}

  /* ======= CABEÇA ANIME (grupo escalado pela raça) ======= */
  const H=[];
  const headHides=eq.head&&['helm_steel','helm_horned','cap_black','cap_red'].includes(eq.head);
  const showHair=!headHides&&style!=='careca';
  const bald=style==='careca';
  // -- cabelo de trás (atrás do rosto) --
  if(showHair){
    if(style==='longo'){H.push(`<path d="M ${cx-27} 30 Q ${cx-40} 74 ${cx-30} 104 L ${cx+30} 104 Q ${cx+40} 74 ${cx+27} 30 Q ${cx} 22 ${cx-27} 30 Z" fill="${hairD}" stroke="${OUT}" stroke-width="${ow}"/>`);}
    else if(style==='ondulado'){H.push(`<path d="M ${cx-27} 34 Q ${cx-38} 62 ${cx-32} 84 Q ${cx-26} 78 ${cx-22} 88 Q ${cx-16} 80 ${cx-10} 90 L ${cx+10} 90 Q ${cx+16} 80 ${cx+22} 88 Q ${cx+26} 78 ${cx+32} 84 Q ${cx+38} 62 ${cx+27} 34 Q ${cx} 24 ${cx-27} 34 Z" fill="${hairD}" stroke="${OUT}" stroke-width="${ow}"/>`);}
    else if(style==='rabo'){H.push(`<path d="M ${cx+20} 26 Q ${cx+44} 34 ${cx+40} 66 Q ${cx+38} 82 ${cx+28} 74 Q ${cx+32} 50 ${cx+18} 34 Z" fill="${hairD}" stroke="${OUT}" stroke-width="${ow}"/>`);H.push(`<circle cx="${cx+21}" cy="30" r="5" fill="${hair}" stroke="${OUT}" stroke-width="1.8"/>`);}
  }
  // -- orelhas --
  if(R.ear==='point'){
    H.push(`<path d="M ${cx-24} 50 L ${cx-36} 30 L ${cx-20} 44 Z" fill="${skin}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
    H.push(`<path d="M ${cx+24} 50 L ${cx+36} 30 L ${cx+20} 44 Z" fill="${skin}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
  }else{
    H.push(`<ellipse cx="${cx-25}" cy="52" rx="4" ry="6" fill="${skin}" stroke="${OUT}" stroke-width="2"/>`);
    H.push(`<ellipse cx="${cx+25}" cy="52" rx="4" ry="6" fill="${skin}" stroke="${OUT}" stroke-width="2"/>`);
  }
  // -- rosto (queixo fino, cel-shading chapado) --
  H.push(`<path d="M ${cx-26} 46 C ${cx-26} 24 ${cx-16} 17 ${cx} 17 C ${cx+16} 17 ${cx+26} 24 ${cx+26} 46 C ${cx+26} 63 ${cx+14} 75 ${cx} 78 C ${cx-14} 75 ${cx-26} 63 ${cx-26} 46 Z" fill="${skin}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
  H.push(`<path d="M ${cx} 19 C ${cx+17} 22 ${cx+24} 36 ${cx+24} 47 C ${cx+24} 62 ${cx+13} 74 ${cx} 77 Z" fill="${skD}" opacity="0.35"/>`);
  H.push(`<ellipse cx="${cx-9}" cy="40" rx="7" ry="10" fill="${skHi}" opacity="0.30"/>`);
  // -- blush (gentil/feliz) --
  if(expr==='gentil'||expr==='feliz'){H.push(`<ellipse cx="${cx-15}" cy="58" rx="4.5" ry="2.6" fill="rgba(255,120,120,0.28)"/><ellipse cx="${cx+15}" cy="58" rx="4.5" ry="2.6" fill="rgba(255,120,120,0.28)"/>`);}
  // -- olhos anime --
  const eyeY=52,edx=12;
  const EH=expr==='serio'?6.4:expr==='determinado'?8.4:9.4;
  const browCol=(R.brow)?'#2a1d14':hairD;
  [-1,1].forEach(s=>{
    const ex=cx+s*edx;
    if(expr==='feliz'){
      H.push(`<path d="M ${ex-6.5} ${eyeY+2} Q ${ex} ${eyeY-5} ${ex+6.5} ${eyeY+2}" fill="none" stroke="${OUT}" stroke-width="2.8" stroke-linecap="round"/>`);
    }else{
      // sclera
      H.push(`<ellipse cx="${ex}" cy="${eyeY}" rx="7" ry="${EH}" fill="#fff"/>`);
      // íris (anel + centro)
      H.push(`<ellipse cx="${ex}" cy="${eyeY+0.8}" rx="5.6" ry="${EH-0.6}" fill="${eyeD}"/>`);
      H.push(`<ellipse cx="${ex}" cy="${eyeY+1.6}" rx="4.3" ry="${EH-2.2}" fill="${eyeC}"/>`);
      H.push(`<ellipse cx="${ex}" cy="${eyeY+2.6}" rx="3.1" ry="${EH-3.4}" fill="${eyeHi}" opacity="0.55"/>`);
      // pupila
      if(R.k==='besta'){H.push(`<rect x="${ex-1.1}" y="${eyeY-2}" width="2.2" height="${EH+1}" rx="1.1" fill="#120a10"/>`);}
      else{H.push(`<ellipse cx="${ex}" cy="${eyeY+1.6}" rx="2.3" ry="${Math.max(2.4,EH-3.6)}" fill="#140f16"/>`);}
      // brilhos
      H.push(`<circle cx="${ex-2.2}" cy="${eyeY-2.4}" r="2.5" fill="#fff"/>`);
      H.push(`<circle cx="${ex+2.4}" cy="${eyeY+3}" r="1.1" fill="#fff" opacity="0.85"/>`);
      // cílio superior grosso + traço externo
      H.push(`<path d="M ${ex-7.2} ${eyeY-1} Q ${ex} ${eyeY-EH-2.4} ${ex+7.2} ${eyeY-1}" fill="none" stroke="${OUT}" stroke-width="2.8" stroke-linecap="round"/>`);
      H.push(`<path d="M ${ex+s*7} ${eyeY-1.5} l ${s*3.4} ${expr==='determinado'?-1:-2.6}" stroke="${OUT}" stroke-width="2.6" stroke-linecap="round"/>`);
      H.push(`<path d="M ${ex-5} ${eyeY+EH-0.5} Q ${ex} ${eyeY+EH+1.4} ${ex+5} ${eyeY+EH-0.5}" fill="none" stroke="${skD}" stroke-width="1.1" opacity="0.55"/>`);
    }
    // sobrancelha por expressão
    const bY=eyeY-EH-3.2, oX=ex+s*6.5, iX=ex-s*6.5;
    if(expr==='determinado'){H.push(`<path d="M ${oX} ${bY-1.5} L ${iX} ${bY+2.5}" stroke="${browCol}" stroke-width="3.2" stroke-linecap="round"/>`);}
    else if(expr==='serio'){H.push(`<path d="M ${oX} ${bY+1} L ${iX} ${bY+1}" stroke="${browCol}" stroke-width="3.2" stroke-linecap="round"/>`);}
    else if(expr==='gentil'){H.push(`<path d="M ${oX} ${bY} Q ${ex} ${bY-2.6} ${iX} ${bY}" stroke="${browCol}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`);}
    else{H.push(`<path d="M ${oX} ${bY-1} Q ${ex} ${bY-3.2} ${iX} ${bY-1}" stroke="${browCol}" stroke-width="2.8" fill="none" stroke-linecap="round"/>`);}
  });
  // -- nariz + boca --
  H.push(`<path d="M ${cx+1} 60 L ${cx-2} 64" fill="none" stroke="${skD}" stroke-width="1.4" stroke-linecap="round"/>`);
  if(!R.beard){
    if(expr==='feliz')H.push(`<path d="M ${cx-6} 68 Q ${cx} 74 ${cx+6} 68 Q ${cx} 71 ${cx-6} 68 Z" fill="#b5514a" stroke="${OUT}" stroke-width="1.2" stroke-linejoin="round"/>`);
    else if(expr==='gentil')H.push(`<path d="M ${cx-5} 69 Q ${cx} 73 ${cx+5} 69" fill="none" stroke="#8a4a3a" stroke-width="2" stroke-linecap="round"/>`);
    else H.push(`<path d="M ${cx-4} 70 L ${cx+4} 70" stroke="#8a4a3a" stroke-width="2" stroke-linecap="round"/>`);
  }
  if(R.fang){H.push(`<path d="M ${cx-5} 69 L ${cx-3.5} 74 L ${cx-2} 69 Z" fill="#fff" stroke="${OUT}" stroke-width="0.6"/><path d="M ${cx+5} 69 L ${cx+3.5} 74 L ${cx+2} 69 Z" fill="#fff" stroke="${OUT}" stroke-width="0.6"/>`);}
  // -- barba (anão) --
  if(R.beard){
    H.push(`<path d="M ${cx-22} 48 Q ${cx-25} 76 ${cx} 84 Q ${cx+25} 76 ${cx+22} 48 Q ${cx} 64 ${cx-22} 48 Z" fill="${hair}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
    H.push(`<path d="M ${cx-13} 62 Q ${cx-7} 78 ${cx} 82 Q ${cx+7} 78 ${cx+13} 62" fill="none" stroke="${hairD}" stroke-width="1.4"/>`);
  }
  // -- franja/cabelo da frente por estilo --
  if(showHair&&(!eq.head||eq.head==='bandana')){
    const HL=`<path d="M ${cx-14} 22 Q ${cx-4} 16 ${cx+6} 20" stroke="${hairHi}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.8"/>`;
    if(style==='espetado'){
      H.push(`<path d="M ${cx-27} 40 L ${cx-27} 22 L ${cx-19} 6 L ${cx-13} 22 L ${cx-7} 4 L ${cx-1} 22 L ${cx+5} 7 L ${cx+11} 23 L ${cx+17} 6 L ${cx+24} 24 L ${cx+27} 14 L ${cx+27} 40 L ${cx+17} 32 L ${cx+8} 37 L ${cx} 31 L ${cx-9} 37 L ${cx-18} 32 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);H.push(HL);
    }else if(style==='franja'){
      H.push(`<path d="M ${cx-27} 46 Q ${cx-29} 14 ${cx} 12 Q ${cx+29} 14 ${cx+27} 46 L ${cx+27} 34 L ${cx+9} 33 L ${cx} 36 L ${cx-9} 33 L ${cx-27} 34 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
      H.push(`<path d="M ${cx-27} 34 L ${cx-25} 62 L ${cx-19} 60 L ${cx-21} 34 Z" fill="${hair}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
      H.push(`<path d="M ${cx+27} 34 L ${cx+25} 62 L ${cx+19} 60 L ${cx+21} 34 Z" fill="${hair}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);H.push(HL);
    }else if(style==='moicano'){
      H.push(`<path d="M ${cx-7} 40 Q ${cx-8} 4 ${cx} 2 Q ${cx+8} 4 ${cx+7} 40 Q ${cx} 32 ${cx-7} 40 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
    }else if(style==='coque'){
      H.push(`<circle cx="${cx}" cy="10" r="9" fill="${hair}" stroke="${OUT}" stroke-width="${ow}"/>`);
      H.push(`<path d="M ${cx-26} 44 Q ${cx-28} 16 ${cx} 15 Q ${cx+28} 16 ${cx+26} 44 Q ${cx+17} 30 ${cx+7} 34 Q ${cx} 27 ${cx-7} 34 Q ${cx-17} 30 ${cx-26} 44 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);H.push(HL);
    }else if(style==='ondulado'){
      H.push(`<path d="M ${cx-27} 44 Q ${cx-30} 14 ${cx} 13 Q ${cx+30} 14 ${cx+27} 44 Q ${cx+20} 34 ${cx+14} 40 Q ${cx+8} 32 ${cx} 38 Q ${cx-8} 32 ${cx-14} 40 Q ${cx-20} 34 ${cx-27} 44 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);H.push(HL);
    }else{ // curto / longo / rabo (franja padrão)
      H.push(`<path d="M ${cx-26} 44 Q ${cx-28} 14 ${cx} 13 Q ${cx+28} 14 ${cx+26} 44 Q ${cx+18} 28 ${cx+8} 34 Q ${cx} 26 ${cx-8} 34 Q ${cx-18} 28 ${cx-26} 44 Z" fill="${hair}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);H.push(HL);
    }
  }
  // -- chifres (besta) --
  if(R.horns){
    H.push(`<path d="M ${cx-10} 24 Q ${cx-22} 13 ${cx-20} 1 Q ${cx-13} 12 ${cx-5} 22 Z" fill="#e8dcc0" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
    H.push(`<path d="M ${cx+10} 24 Q ${cx+22} 13 ${cx+20} 1 Q ${cx+13} 12 ${cx+5} 22 Z" fill="#e8dcc0" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);
  }
  // -- cabeça: bandana / boné / elmo --
  if(eq.head){const hc=itemById(eq.head).color,hcD=darken(hc,0.8);
    if(eq.head==='bandana')H.push(`<path d="M ${cx-26} 34 Q ${cx} 26 ${cx+26} 34 L ${cx+26} 44 Q ${cx} 36 ${cx-26} 44 Z" fill="${hc}" stroke="${OUT}" stroke-width="${ow}"/>`);
    else if(eq.head==='helm_steel'||eq.head==='helm_horned'){
      H.push(`<path d="M ${cx-26} 50 Q ${cx-28} 12 ${cx} 11 Q ${cx+28} 12 ${cx+26} 50 Q ${cx+22} 44 ${cx+18} 46 L ${cx-18} 46 Q ${cx-22} 44 ${cx-26} 50 Z" fill="${hc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);
      H.push(`<rect x="${cx-3.5}" y="30" width="7" height="24" rx="2" fill="${hcD}" stroke="${OUT}" stroke-width="1.5"/>`);
      H.push(`<path d="M ${cx-26} 47 Q ${cx} 43 ${cx+26} 47" stroke="${hcD}" stroke-width="2.4" fill="none"/>`);
      H.push(`<ellipse cx="${cx-9}" cy="28" rx="7" ry="4" fill="${darken(hc,1.15)}" opacity="0.5"/>`);
      if(eq.head==='helm_horned'){H.push(`<path d="M ${cx-23} 28 Q ${cx-35} 20 ${cx-34} 6 Q ${cx-27} 18 ${cx-17} 26 Z" fill="#e8dcc0" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);H.push(`<path d="M ${cx+23} 28 Q ${cx+35} 20 ${cx+34} 6 Q ${cx+27} 18 ${cx+17} 26 Z" fill="#e8dcc0" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`);}
    }
    else{H.push(`<path d="M ${cx-27} 40 Q ${cx} 6 ${cx+27} 40 Z" fill="${hc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);H.push(`<path d="M ${cx+2} 40 Q ${cx+34} 38 ${cx+38} 44 Q ${cx+10} 44 ${cx+2} 42 Z" fill="${hc}" stroke="${OUT}" stroke-width="${ow}" stroke-linejoin="round"/>`);}}
  P.push(`<g transform="translate(${cx} 47) scale(${R.headR*1.22}) translate(${-cx} -47)">${H.join('')}</g>`);
  // munhequeira / luva
  if(eq.wrists){const wc=itemById(eq.wrists).color;P.push(`<rect x="${lHand-armW/2}" y="${handY-7}" width="${armW}" height="7" rx="2" fill="${wc}" stroke="${OUT}" stroke-width="1.4"/>`);P.push(`<rect x="${rHand-armW/2}" y="${handY-7}" width="${armW}" height="7" rx="2" fill="${wc}" stroke="${OUT}" stroke-width="1.4"/>`);}
  if(eq.hands){const hc=itemById(eq.hands).color;
    if(eq.hands==='sword'){
      P.push(`<line x1="${rHand}" y1="${handY+8}" x2="${rHand}" y2="${handY-46}" stroke="${hc}" stroke-width="4" stroke-linecap="round"/>`);
      P.push(`<line x1="${rHand}" y1="${handY-46}" x2="${rHand}" y2="${handY-54}" stroke="#e8eef2" stroke-width="2.4" stroke-linecap="round"/>`);
      P.push(`<rect x="${rHand-8}" y="${handY+6}" width="16" height="4" rx="2" fill="#d9a441" stroke="${OUT}" stroke-width="1"/>`);
      P.push(`<rect x="${rHand-2.5}" y="${handY+10}" width="5" height="9" rx="2" fill="#6b3e16"/>`);
    }else if(eq.hands==='axe'){
      const topY=handY-46;
      P.push(`<line x1="${rHand}" y1="${handY+12}" x2="${rHand}" y2="${topY+4}" stroke="#6b3e16" stroke-width="4.5" stroke-linecap="round"/>`);
      P.push(`<path d="M ${rHand-1} ${topY} Q ${rHand+26} ${topY+3} ${rHand+20} ${topY+24} Q ${rHand+8} ${topY+17} ${rHand-1} ${topY+19} Z" fill="${hc}" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>`);
      P.push(`<path d="M ${rHand-1} ${topY+2} Q ${rHand+14} ${topY+4} ${rHand+16} ${topY+12}" stroke="#e8eef2" stroke-width="1.6" fill="none" opacity="0.6"/>`);
    }else{P.push(`<circle cx="${lHand}" cy="${handY+2}" r="${armW/2-1}" fill="${hc}" stroke="${OUT}" stroke-width="1.4"/>`);P.push(`<circle cx="${rHand}" cy="${handY+2}" r="${armW/2-1}" fill="${hc}" stroke="${OUT}" stroke-width="1.4"/>`);}}
  return `<svg viewBox="0 0 200 352">${P.join('')}</svg>`;
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
      ${chipRow('chair',HAIRSTYLES,ch.hairStyle||'espetado','k','l')}</div>
    <div class="field"><label>Cor dos olhos</label>
      <div class="skin-pick" style="flex-wrap:wrap">${EYECOLORS.map((c,i)=>`<button type="button" class="ey ${((ch.eyeColor!=null?ch.eyeColor:1)===i)?'on':''}" data-i="${i}" style="background:${c}" onclick="document.querySelectorAll('.ey').forEach(b=>b.classList.remove('on'));this.classList.add('on')"></button>`).join('')}</div></div>
    <div class="field"><label>Expressão</label>
      ${chipRow('chexpr',EYESTYLES,ch.eyeStyle||'determinado','k','l')}</div>
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
  ch.hairStyle=chipVal('chair')||'espetado';
  const ey=document.querySelector('.ey.on');ch.eyeColor=ey?+ey.getAttribute('data-i'):1;
  ch.eyeStyle=chipVal('chexpr')||'determinado';
  if(!editing){S.characters.push(ch);S.activeChar=S.characters.length-1;}
  save();renderPersonagem();closeModal();toast(editing?'Personagem salvo ✅':'Bora treinar, '+ch.name+'! 🦾');
}
