import {S,save,esc,num,uid} from './state.js';
import {toast,showModal,closeModal,svgChart,dShort,today} from './ui.js';
import {allExerciseNames,latestWeight,characterMetrics,goalProgress,ACHIEVEMENTS,renderPersonagem} from './personagem.js';
import {renderRoutines} from './treino.js';

/* ============ RECORDES ============ */
export const GOALTYPES=[
  {k:'carga',l:'Bater carga',em:'🏋️'},{k:'peso',l:'Chegar num peso',em:'⚖️'},
  {k:'treinos',l:'Concluir treinos',em:'✅'},{k:'agua',l:'Beber água X dias',em:'💧'},
  {k:'sequencia',l:'Sequência de dias',em:'🔥'}
];
export function openGoalForm(type){
  type=type||'carga';
  const exNames=allExerciseNames();let fields='';
  if(type==='carga')fields=`<div class="field"><label>Exercício</label>${exNames.length?`<select id="g-ex">${exNames.map(n=>`<option>${esc(n)}</option>`).join('')}</select>`:`<input id="g-ex" placeholder="Supino reto">`}</div><div class="field"><label>Carga alvo (kg)</label><input id="g-target" type="number" inputmode="decimal" placeholder="100"></div>`;
  else if(type==='peso')fields=`<div class="field"><label>Peso alvo (kg)</label><input id="g-target" type="number" inputmode="decimal" placeholder="${latestWeight()||75}"></div><p class="hint">Perder ou ganhar é definido comparando com seu peso atual (${latestWeight()||'?'} kg).</p>`;
  else if(type==='treinos')fields=`<div class="field"><label>Quantos treinos concluir</label><input id="g-target" type="number" inputmode="numeric" placeholder="50"></div>`;
  else if(type==='agua')fields=`<div class="field"><label>Quantos dias batendo a água</label><input id="g-target" type="number" inputmode="numeric" placeholder="30"></div>`;
  else if(type==='sequencia')fields=`<div class="field"><label>Dias seguidos treinando</label><input id="g-target" type="number" inputmode="numeric" placeholder="10"></div>`;
  showModal(`<h3>Nova meta</h3><p class="sub">Defina um objetivo — ao bater, ganha 100 🪙</p>
    <div class="field"><label>Tipo de meta</label>
      <div class="chip-pick">${GOALTYPES.map(gt=>`<button type="button" class="${gt.k===type?'on':''}" onclick="openGoalForm('${gt.k}')">${gt.em} ${gt.l}</button>`).join('')}</div></div>
    ${fields}
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveGoal('${type}')">Criar meta</button></div>`);
}
export function saveGoal(type){
  const target=num(document.getElementById('g-target').value);
  if(!target){toast('Defina o valor alvo');return;}
  const g={id:uid(),type,target,reward:100,created:today()};
  if(type==='carga'){g.exercise=document.getElementById('g-ex').value;g.label=`${g.exercise}: ${target} kg`;}
  else if(type==='peso'){const w=latestWeight()||target;g.start=w;g.dir=target<w?'lose':'gain';g.label=`${g.dir==='lose'?'Emagrecer até':'Chegar a'} ${target} kg`;}
  else if(type==='treinos')g.label=`${target} treinos concluídos`;
  else if(type==='agua')g.label=`Água em dia por ${target} dias`;
  else if(type==='sequencia')g.label=`${target} dias seguidos treinando`;
  S.goals.push(g);save();renderRecords();renderPersonagem();closeModal();toast('Meta criada! 🎯');
}
export function delGoal(id){if(!confirm('Apagar esta meta?'))return;S.goals=S.goals.filter(x=>x.id!==id);save();renderRecords();renderPersonagem();toast('Meta removida');}
export function exerciseEntries(name){
  const list=[];const n=(name||'').toLowerCase();
  S.routines.forEach(r=>r.exercises.forEach(ex=>{
    if((ex.name||'').toLowerCase()===n&&ex.history)ex.history.forEach(h=>list.push({date:h.date,load:num(h.load),reps:num(h.reps)}));
  }));
  list.sort((a,b)=>a.date.localeCompare(b.date)||a.load-b.load);
  return list;
}
export function exMusc(name){let mm='Outro';const n=(name||'').toLowerCase();S.routines.forEach(r=>r.exercises.forEach(ex=>{if((ex.name||'').toLowerCase()===n)mm=ex.musc||mm;}));return mm;}
export function delExEntry(name,date,load,reps){
  const n=(name||'').toLowerCase();let done=false;
  S.routines.forEach(r=>r.exercises.forEach(ex=>{
    if(!done&&(ex.name||'').toLowerCase()===n&&ex.history){
      const i=ex.history.findIndex(h=>h.date===date&&num(h.load)===load&&num(h.reps)===reps);
      if(i>=0){ex.history.splice(i,1);done=true;}
    }
  }));
  save();renderRecords();renderRoutines();renderPersonagem();
  if(exerciseEntries(name).length)exerciseDetail(name);else closeModal();
  toast('Registro removido');
}
const escAttr=s=>(s||'').replace(/'/g,"\\'");
export function estimate1RM(load,reps){return reps?Math.round(load*(1+reps/30)):null;}
export function exerciseDetail(name){
  const entries=exerciseEntries(name);
  if(!entries.length){toast('Sem registros ainda');return;}
  const musc=exMusc(name);
  const pr=entries.reduce((m,e)=>e.load>m.load?e:m,entries[0]);
  const first=entries[0],last=entries[entries.length-1];
  const e1rm=estimate1RM(pr.load,pr.reps);
  const diff=+(last.load-first.load).toFixed(1);
  const chart=svgChart(entries.map(e=>({date:e.date,v:e.load})),'#ff9f43','det');
  showModal(`<h3>${esc(name)}</h3><p class="sub">${esc(musc)} · ${entries.length} registro${entries.length>1?'s':''} de carga</p>
    <div class="stat-grid" style="grid-template-columns:1fr 1fr 1fr">
      <div class="stat"><div class="v">${pr.load}<small style="font-size:11px"> kg</small></div><div class="l">Recorde</div></div>
      <div class="stat"><div class="v">${e1rm||'–'}</div><div class="l">1RM est.</div></div>
      <div class="stat"><div class="v" style="color:${diff>=0?'var(--acc)':'var(--warn)'}">${diff>=0?'+':''}${diff}</div><div class="l">Evolução kg</div></div>
    </div>
    ${chart?`<div class="chart-wrap">${chart}</div>`:'<div class="hint">Registre em pelo menos 2 dias pra ver o gráfico de progressão.</div>'}
    <div style="font-size:12px;color:var(--mut);font-weight:700;text-transform:uppercase;margin:14px 0 8px">Todos os registros</div>
    ${[...entries].reverse().map(e=>{const est=estimate1RM(e.load,e.reps);const isPR=e.load===pr.load;return `<div class="row">
      <div class="name"><b>${e.load} kg × ${e.reps||'–'}</b><span>${dShort(e.date)}${est?' · 1RM ~'+est+'kg':''}${isPR?' · 🏆':''}</span></div>
      <div class="row-actions"><button class="mini del" onclick="delExEntry('${escAttr(name)}','${e.date}',${e.load},${e.reps})">🗑</button></div>
    </div>`;}).join('')}
    <div class="modal-actions">
      <button class="btn btn-ghost" style="flex:1;justify-content:center" onclick="sharePR('${escAttr(name)}')">📤 Compartilhar</button>
      <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Fechar</button>
    </div>`);
}
export async function sharePR(name){
  const entries=exerciseEntries(name);
  if(!entries.length)return;
  const pr=entries.reduce((m,e)=>e.load>m.load?e:m,entries[0]);
  const e1rm=estimate1RM(pr.load,pr.reps);
  const text=`🏆 Meu recorde no ${name}: ${pr.load} kg${pr.reps?' × '+pr.reps+' reps':''}${e1rm?' (1RM estimado ~'+e1rm+' kg)':''} 💪 — MEU GYM BRO`;
  if(navigator.share){
    try{await navigator.share({text});}catch(e){/* usuário cancelou */}
    return;
  }
  try{
    await navigator.clipboard.writeText(text);
    toast('Copiado! Cola onde quiser 📤');
  }catch(e){toast('Não deu pra copiar ❌');}
}
export function renderRecords(){
  const body=document.getElementById('rec-body');if(!body)return;
  const M=characterMetrics(),ctx=M.actx;
  const goals=S.goals||[];
  const achUnlocked=ACHIEVEMENTS.filter(a=>a.f(ctx)).length;
  document.getElementById('rec-sub').textContent=`${achUnlocked}/${ACHIEVEMENTS.length} conquistas · ${goals.length} meta${goals.length!==1?'s':''}`;
  // METAS
  const metasHTML=`<div class="card">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <b style="font-size:15px">🎯 Metas</b>
      <button class="btn btn-acc btn-sm" onclick="openGoalForm()">＋ Nova meta</button></div>
    ${goals.length?goals.map(g=>{const pr=goalProgress(g);return `<div style="margin-top:13px">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-weight:700;font-size:14px">${pr.done?'✅ ':''}${esc(g.label)}</div>
        <button class="mini del" onclick="delGoal('${g.id}')">🗑</button></div>
      <div class="bar" style="margin-top:8px"><i style="width:${pr.pct}%;background:${pr.done?'linear-gradient(90deg,var(--acc),var(--acc2))':'var(--blue)'}"></i></div>
      <div style="font-size:11.5px;color:var(--mut);margin-top:5px">${(''+pr.cur)} / ${pr.target} ${pr.unit} · ${pr.done?'concluída · +'+(g.reward||100)+' 🪙':pr.pct+'%'}</div>
    </div>`;}).join(''):'<div style="color:var(--mut);font-size:13px;margin-top:11px">Sem metas ainda. Defina um objetivo (ex: 100 kg no supino, água por 30 dias, emagrecer 5 kg) e ganhe moedas ao bater 🎯</div>'}
  </div>`;
  // CONQUISTAS
  const achHTML=`<div class="card">
    <b style="font-size:15px">🏅 Conquistas</b>
    <div style="color:var(--mut);font-size:12px;margin:2px 0 12px">${achUnlocked}/${ACHIEVEMENTS.length} desbloqueadas</div>
    <div class="ach-grid">
      ${ACHIEVEMENTS.map(a=>{const on=a.f(ctx);return `<div class="ach ${on?'on':''}">
        <div class="ach-em">${on?a.em:'🔒'}</div><div class="ach-n">${esc(a.n)}</div>
        <div class="ach-r">${on?'✓ +'+a.r+' 🪙':esc(a.d)}</div></div>`;}).join('')}
    </div></div>`;
  // RECORDES
  const map={};
  S.routines.forEach(r=>r.exercises.forEach(ex=>{
    if(ex.history&&ex.history.length){const key=ex.name.toLowerCase();
      if(!map[key])map[key]={name:ex.name,musc:ex.musc||'Outro',hist:[]};
      map[key].hist=map[key].hist.concat(ex.history);}
  }));
  const items=Object.values(map);
  items.forEach(it=>{it.hist.sort((a,b)=>a.date.localeCompare(b.date));it.pr=it.hist.reduce((m,h)=>num(h.load)>num(m.load)?h:m);});
  items.sort((a,b)=>a.musc.localeCompare(b.musc)||num(b.pr.load)-num(a.pr.load));
  const recHTML=`<div style="font-size:12px;color:var(--mut);font-weight:700;text-transform:uppercase;margin:6px 4px 10px">🏆 Recordes por exercício</div>`+(items.length?items.map((it,i)=>{
    const e1rm=estimate1RM(num(it.pr.load),it.pr.reps);
    const chart=svgChart(it.hist.map(h=>({date:h.date,v:num(h.load)})),'#ff9f43','r'+i);
    return `<div class="card" style="cursor:pointer" onclick="exerciseDetail('${escAttr(it.name)}')">
      <div class="routine-head"><div class="tag" style="background:linear-gradient(135deg,#ff9f43,#ff7a1a)">🏆</div>
        <h3 style="flex:1;font-size:16px">${esc(it.name)}</h3><span class="pill dim">${esc(it.musc)}</span></div>
      <div class="big-num"><span class="n">${it.pr.load}</span><span class="u">kg</span>${it.pr.reps?`<span class="delta flat">× ${it.pr.reps} reps</span>`:''}</div>
      <div style="color:var(--mut);font-size:12px">PR em ${dShort(it.pr.date)}${e1rm?` · 1RM estimado ~${e1rm} kg`:''} · ${it.hist.length} registro${it.hist.length>1?'s':''} · toque pra ver progressão →</div>
      ${chart?`<div class="chart-wrap">${chart}</div>`:''}</div>`;
  }).join(''):'<div class="card" style="text-align:center;color:var(--mut);font-size:13px">Registre a carga de um exercício (botão 📈 na aba Treino) que o PR aparece aqui 🏋️</div>');
  body.innerHTML=metasHTML+achHTML+recHTML;
}
