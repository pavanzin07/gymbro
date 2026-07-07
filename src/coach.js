import {num} from './state.js';
import {parseLocalDate} from './ui.js';

/* ============ COACH DE PROGRESSÃO ============
   Análise por regras das últimas sessões de um exercício.
   Funções puras — testadas em tests/unit/coach.test.js. */

// Próximo incremento de carga: ~2,5%, arredondado pra 0,5 kg (mínimo +0,5).
export function suggestNextLoad(load){
  const inc=Math.max(0.5,Math.round(load*0.025*2)/2);
  return +(load+inc).toFixed(1);
}

// entries: [{date,load,reps}] em qualquer ordem → carga máxima por data, ordenado
export function maxLoadByDate(entries){
  const by={};
  (entries||[]).forEach(e=>{const l=num(e.load);if(by[e.date]==null||l>by[e.date])by[e.date]=l;});
  return Object.keys(by).sort().map(d=>({date:d,load:by[d]}));
}

// Olha as últimas 4 datas com registro e classifica a progressão.
export function analyzeExercise(entries){
  const serie=maxLoadByDate(entries);
  if(serie.length<2)return{status:'comecando',msg:'Poucos dados ainda.',tip:'Registre a carga por mais 2–3 sessões que eu te digo se você está progredindo.'};
  const win=serie.slice(-4);
  const first=win[0].load,last=win[win.length-1].load;
  const l3=win.slice(-3);
  if(l3.length===3&&l3.every(p=>p.load===l3[0].load))
    return{status:'estagnado',msg:`Carga parada em ${last} kg há 3 sessões.`,tip:`Tente ${suggestNextLoad(last)} kg na próxima, ou +1 rep por série. Se falhar, vale uma semana com −10% pra recuperar.`};
  if(last>first)
    return{status:'progredindo',msg:`Subiu de ${first} pra ${last} kg nas últimas sessões. 📈`,tip:'Tá funcionando — quando bater o topo da faixa de reps, suba a carga de novo.'};
  if(last<first)
    return{status:'regredindo',msg:`Caiu de ${first} pra ${last} kg. 📉`,tip:'Acontece — confira sono e comida. Uma semana mais leve (−10%) ajuda a voltar a subir.'};
  return{status:'mantendo',msg:'Carga oscilando, mas mantida.',tip:'Consistência primeiro; a força vem em seguida.'};
}

/* ============ TENDÊNCIAS (aba Progresso) ============ */

// Taxa de variação de peso em kg/semana — regressão linear sobre os
// últimos 10 registros. null se não há dados suficientes.
export function weightTrend(weights){
  const pts=(weights||[]).slice().sort((a,b)=>(a.date||'').localeCompare(b.date||'')).slice(-10);
  if(pts.length<2)return null;
  const base=parseLocalDate(pts[0].date).getTime();
  const xs=pts.map(p=>(parseLocalDate(p.date).getTime()-base)/864e5);
  const ys=pts.map(p=>num(p.v));
  const n=xs.length;
  const sx=xs.reduce((a,b)=>a+b,0),sy=ys.reduce((a,b)=>a+b,0);
  const sxx=xs.reduce((a,b)=>a+b*b,0),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0);
  const denom=n*sxx-sx*sx;
  if(!denom)return null; // registros todos no mesmo dia
  const slope=(n*sxy-sx*sy)/denom; // kg por dia
  return{ratePerWeek:+(slope*7).toFixed(2),n,spanDays:Math.round(xs[n-1]-xs[0]),last:ys[n-1]};
}

// Aderência nos últimos nDays: quantos dias com treino/dieta marcados.
export function adherence(days,todayStr,nDays=28){
  const end=parseLocalDate(todayStr);
  let workout=0,diet=0;
  for(let i=0;i<nDays;i++){
    const d=new Date(end);d.setDate(end.getDate()-i);
    const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const day=(days||{})[k];
    if(day&&day.workout)workout++;
    if(day&&day.diet)diet++;
  }
  return{workout,diet,nDays,workoutPct:Math.round(workout/nDays*100),dietPct:Math.round(diet/nDays*100)};
}

// Semanas estimadas pra chegar na meta de peso no ritmo atual.
// 0 = meta atingida; null = sem ritmo, ritmo ~zero ou direção errada.
export function goalEta(ratePerWeek,current,target){
  if(ratePerWeek==null||!isFinite(ratePerWeek))return null;
  const diff=target-current;
  if(Math.abs(diff)<=0.1)return 0;
  if(Math.abs(ratePerWeek)<0.05)return null;
  const weeks=diff/ratePerWeek;
  if(weeks<0)return null; // peso andando na direção contrária
  return Math.round(weeks);
}

// Volume total por semana nas últimas nWeeks (semanas terminando hoje),
// incluindo semanas zeradas — série pronta pro svgChart.
export function weeklyVolumes(sessions,todayStr,nWeeks=8){
  const end=parseLocalDate(todayStr).getTime();
  const weeks=Array.from({length:nWeeks},()=>0);
  (sessions||[]).forEach(s=>{
    if(!s.date)return;
    const d=(end-parseLocalDate(s.date).getTime())/864e5;
    if(d<0||d>=nWeeks*7)return;
    weeks[nWeeks-1-Math.floor(d/7)]+=num(s.volume);
  });
  return weeks.map((v,i)=>{
    const start=new Date(end);start.setDate(start.getDate()-(nWeeks-1-i)*7-6);
    const k=start.getFullYear()+'-'+String(start.getMonth()+1).padStart(2,'0')+'-'+String(start.getDate()).padStart(2,'0');
    return{date:k,v:Math.round(v)};
  });
}

// Volume de treino: últimos 7 dias vs 7 anteriores.
export function volumeTrend(sessions,todayStr){
  const end=parseLocalDate(todayStr).getTime();
  let cur=0,prev=0;
  (sessions||[]).forEach(s=>{
    if(!s.date)return;
    const d=(end-parseLocalDate(s.date).getTime())/864e5;
    if(d<0)return;
    if(d<7)cur+=num(s.volume);
    else if(d<14)prev+=num(s.volume);
  });
  return{cur:Math.round(cur),prev:Math.round(prev),deltaPct:prev?Math.round((cur-prev)/prev*100):null};
}
