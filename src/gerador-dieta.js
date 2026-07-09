import {S,save,uid,esc,num} from './state.js';
import {toast,showModal,closeModal,go,today} from './ui.js';
import {COMBOS,CATLABEL} from './data/alimentos.js';
import {EVID_DIETA,evidLink} from './data/evidencia.js';
import {comboAllowed,comboTotals,renderDieta} from './dieta.js';

/* ============ GERADOR DE DIA ALIMENTAR ============
   Monta o dia de refeições a partir das metas já calculadas no Perfil.
   Guloso: cada refeição pega o combo da categoria que melhor fecha o
   que falta de kcal/proteína; complementos ajustam o total no final.
   Evidências em data/evidencia.js (EVID_DIETA). */

export const PLANOS={
  3:{k:3,label:'3 refeições',desc:'Café, almoço e jantar — o mínimo que funciona',cats:['cafe','almoco','janta']},
  4:{k:4,label:'4 refeições',desc:'Com um lanche — proteína melhor distribuída',cats:['cafe','almoco','lanche','janta']},
  5:{k:5,label:'5 refeições',desc:'Dois lanches — pra quem precisa de mais comida',cats:['cafe','lanche','almoco','lanche','janta']}
};
export const ESTILOS={
  pratico:{k:'pratico',label:'Prático',desc:'Os mesmos pratos que funcionam, todo dia — aderência em 1º lugar'},
  variado:{k:'variado',label:'Variado',desc:'Troca os pratos pra não enjoar — mesmas metas'}
};

// Complementos pra fechar as metas quando os combos ficam abaixo do alvo.
// tags iguais às dos combos (lac/meat/egg/glu) pra respeitar restrições.
const FILLERS=[
  {name:'Whey',qty:'+30 g',kcal:114,prot:24,carb:2.4,fat:1.8,tags:{lac:1},cats:['cafe','lanche'],tipo:'prot'},
  {name:'Ovo cozido',qty:'+2 un',kcal:143,prot:13,carb:1.1,fat:9.5,tags:{egg:1},cats:['cafe','lanche','janta'],tipo:'prot'},
  {name:'Frango grelhado',qty:'+50 g',kcal:83,prot:15.5,carb:0,fat:1.8,tags:{meat:1},cats:['almoco','janta'],tipo:'prot'},
  {name:'Tofu grelhado',qty:'+100 g',kcal:76,prot:8,carb:2,fat:4.7,tags:{},cats:['almoco','janta'],tipo:'prot'},
  {name:'Arroz branco',qty:'+100 g',kcal:130,prot:2.7,carb:28,fat:0.3,tags:{},cats:['almoco','janta'],tipo:'kcal'},
  {name:'Batata doce',qty:'+100 g',kcal:86,prot:1.6,carb:20,fat:0.1,tags:{},cats:['almoco','janta'],tipo:'kcal'},
  {name:'Banana',qty:'+1 un',kcal:89,prot:1.1,carb:23,fat:0.3,tags:{},cats:['cafe','lanche'],tipo:'kcal'},
  {name:'Aveia',qty:'+30 g',kcal:117,prot:5,carb:20,fat:2,tags:{glu:1},cats:['cafe','lanche'],tipo:'kcal'},
  {name:'Pasta de amendoim',qty:'+15 g',kcal:88,prot:3.8,carb:3,fat:7.5,tags:{},cats:['cafe','lanche'],tipo:'kcal'},
  {name:'Azeite',qty:'+10 ml',kcal:88,prot:0,carb:0,fat:10,tags:{},cats:['almoco','janta'],tipo:'kcal'}
];
// mesma regra do comboAllowed, mas pra um item com tags
function fillerAllowed(f){
  const r=(S.profile&&S.profile.restrictions)||[];
  if(r.includes('vegano')&&(f.tags.meat||f.tags.lac||f.tags.egg))return false;
  if(r.includes('vegetariano')&&f.tags.meat)return false;
  if(r.includes('lactose')&&f.tags.lac)return false;
  if(r.includes('gluten')&&f.tags.glu)return false;
  return true;
}
const foodItem=f=>({id:uid(),name:f.name,qty:f.qty,kcal:String(f.kcal),prot:String(f.prot),carb:String(f.carb),fat:String(f.fat)});

export function gerarDia({refeicoes=4,alvo,seed=0}={}){
  const plano=PLANOS[Math.min(5,Math.max(3,refeicoes))];
  const alvoK=(alvo&&alvo.kcal)||S.targets.kcal,alvoP=(alvo&&alvo.prot)||S.targets.prot;
  let kcalRest=alvoK,protRest=alvoP;
  const usados=new Set();let nLanche=0;
  const meals=plano.cats.map((cat,i)=>{
    const slotsRest=plano.cats.length-i;
    const aK=kcalRest/slotsRest,aP=protRest/slotsRest;
    let pool=COMBOS.map((c,idx)=>({c,idx})).filter(x=>x.c.cat===cat&&comboAllowed(x.c));
    if(!pool.length)pool=COMBOS.map((c,idx)=>({c,idx})).filter(x=>comboAllowed(x.c));
    const scored=pool.map(x=>{const t=comboTotals(x.c);
      return{...x,t,score:Math.abs(t.k-aK)/50+Math.abs(t.p-aP)/4+(usados.has(x.idx)?2:0)};
    }).sort((a,b)=>a.score-b.score);
    const pick=scored[seed?(seed+i)%Math.min(3,scored.length):0];
    usados.add(pick.idx);
    kcalRest-=pick.t.k;protRest-=pick.t.p;
    if(cat==='lanche')nLanche++;
    const nome=cat==='lanche'&&nLanche>1?'Lanche da tarde':CATLABEL[cat];
    return{id:uid(),name:nome,cat,foods:pick.c.foods.map(foodItem)};
  });
  // complementos: primeiro fecha proteína, depois calorias (tolerância ~8%)
  const soma=()=>meals.reduce((a,m)=>{m.foods.forEach(f=>{a.kcal+=num(f.kcal);a.prot+=num(f.prot);a.carb+=num(f.carb);a.fat+=num(f.fat);});return a;},{kcal:0,prot:0,carb:0,fat:0});
  let t=soma(),guard=0;
  while(guard++<24){
    const gapP=alvoP-t.prot,gapK=alvoK-t.kcal;
    const tipo=gapP>12?'prot':gapK>Math.max(120,alvoK*0.08)?'kcal':null;
    if(!tipo)break;
    const opts=FILLERS.filter(f=>f.tipo===tipo&&fillerAllowed(f));
    if(!opts.length)break;
    // escolhe o complemento e a refeição com menos itens entre as compatíveis
    const f=opts[guard%opts.length];
    const destino=meals.filter(m=>f.cats.includes(m.cat)).sort((a,b)=>a.foods.length-b.foods.length)[0]||meals[0];
    destino.foods.push(foodItem(f));
    t=soma();
  }
  return{meals,totais:{kcal:Math.round(t.kcal),prot:Math.round(t.prot),carb:Math.round(t.carb),fat:Math.round(t.fat)},
    alvo:{kcal:alvoK,prot:alvoP},refs:EVID_DIETA};
}

/* ============ WIZARD ============ */
let _dwiz=null,_dwizDia=null;
export function openDietaWizard(){
  if(!_dwiz)_dwiz={refeicoes:4,estilo:'pratico'};
  const w=_dwiz;
  const r=(S.profile&&S.profile.restrictions)||[];
  const card=(on,onclick,title,desc,badge)=>`
    <button type="button" class="opt ${on?'on':''}" style="width:100%;text-align:left;margin-top:6px${on?';border-color:var(--acc)':''}" onclick="${onclick}">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1"><b style="font-size:13.5px">${title}</b>
          <div style="color:var(--mut);font-size:11.5px;margin-top:2px">${desc}</div></div>
        ${badge?`<span class="pill" style="color:var(--acc)">${badge}</span>`:''}
        <div style="font-size:16px">${on?'✅':'○'}</div>
      </div>
    </button>`;
  showModal(`<h3>🧬 Montar meu dia alimentar</h3>
    <p class="sub">Mira suas metas (${S.targets.kcal} kcal · ${S.targets.prot}g proteína) com comida de verdade.</p>
    <div class="field"><label>Quantas refeições por dia?</label>
      ${Object.values(PLANOS).map(p=>card(w.refeicoes===p.k,`dwizSet('refeicoes',${p.k})`,p.label,p.desc,p.k===4?'indicado':'')).join('')}
    </div>
    <div class="field"><label>Seu estilo</label>
      ${Object.values(ESTILOS).map(e2=>card(w.estilo===e2.k,`dwizSet('estilo','${e2.k}')`,e2.label,e2.desc,e2.k==='pratico'?'aderência':'')).join('')}
    </div>
    ${r.length?`<p class="hint">Suas restrições já estão aplicadas: <b>${r.map(esc).join(', ')}</b> ✅</p>`:''}
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="gerarDiaPreview()">🧬 Gerar meu dia</button>
    </div>`);
}
export function dwizSet(k,v){_dwiz[k]=v;openDietaWizard();}
export function gerarDiaPreview(reroll){
  const seed=_dwiz.estilo==='variado'?(reroll?Math.floor(Math.random()*5)+1:1):(reroll?Math.floor(Math.random()*5)+1:0);
  const dia=gerarDia({refeicoes:_dwiz.refeicoes,seed});
  _dwizDia=dia;
  const pct=(v,a)=>a?Math.round(v/a*100):0;
  const mealsHTML=dia.meals.map(m=>{
    const mt=m.foods.reduce((a,f)=>({k:a.k+num(f.kcal),p:a.p+num(f.prot)}),{k:0,p:0});
    return`<div style="margin-top:12px;padding:10px;background:var(--bg2);border-radius:12px">
      <div style="display:flex;justify-content:space-between"><b style="font-size:13.5px">${esc(m.name)}</b>
        <span style="color:var(--mut);font-size:11.5px">${Math.round(mt.k)} kcal · P ${Math.round(mt.p)}g</span></div>
      ${m.foods.map(f=>`<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;border-top:1px solid var(--line)">
        <span>${esc(f.name)}</span><span style="color:var(--mut);white-space:nowrap">${esc(f.qty||'')}</span>
      </div>`).join('')}
    </div>`;}).join('');
  const refsHTML=dia.refs.map(x=>`
    <div style="margin-top:10px;font-size:12px">
      <b>${esc(x.achado)}</b>
      <div style="color:var(--mut);margin-top:2px">→ ${esc(x.decisao)}</div>
      <a href="${evidLink(x.pmid)}" target="_blank" rel="noopener" style="color:var(--acc);font-size:11px">${esc(x.autor)}, ${x.ano} · ${esc(x.rev)} · PubMed ${x.pmid} ↗</a>
    </div>`).join('');
  showModal(`<h3>Seu dia alimentar</h3>
    <p class="sub">${dia.meals.length} refeições mirando suas metas</p>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <span class="pill">🔥 ${dia.totais.kcal}/${dia.alvo.kcal} kcal (${pct(dia.totais.kcal,dia.alvo.kcal)}%)</span>
      <span class="pill" style="color:var(--prot)">P ${dia.totais.prot}/${dia.alvo.prot}g (${pct(dia.totais.prot,dia.alvo.prot)}%)</span>
      <span class="pill" style="color:var(--carb)">C ${dia.totais.carb}g</span>
      <span class="pill" style="color:var(--fat)">G ${dia.totais.fat}g</span>
    </div>
    ${mealsHTML}
    <button class="btn btn-ghost btn-sm" style="width:100%;justify-content:center;margin-top:10px" onclick="gerarDiaPreview(1)">🎲 Gerar outra opção</button>
    <details style="margin-top:12px"><summary style="cursor:pointer;font-weight:800;font-size:13.5px">🧬 A ciência por trás (${dia.refs.length} estudos)</summary>${refsHTML}</details>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="openDietaWizard()">↩ Ajustar</button>
      <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="aplicarDia()">✅ Usar este dia</button>
    </div>`);
}
export function aplicarDia(){
  if(!_dwizDia)return;
  const meals=_dwizDia.meals.map(m=>({id:m.id,name:m.name,foods:m.foods}));
  S.mealTemplate=JSON.parse(JSON.stringify(meals));
  const t=today();
  if(!S.mealDiary[t]||!S.mealDiary[t].some(m=>m.foods.length))S.mealDiary[t]=meals;
  save();renderDieta();closeModal();go('dieta');
  toast('Dia alimentar montado! 🍽️ Virou seu modelo também');
  _dwizDia=null;_dwiz=null;
}
