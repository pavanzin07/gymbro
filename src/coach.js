import {num} from './state.js';

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
