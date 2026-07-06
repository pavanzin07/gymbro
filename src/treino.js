import {S,save,uid,esc,num} from './state.js';
import {toast,showModal,closeModal,svgChart,today,dShort,inp} from './ui.js';
import {splitCardsHTML} from './perfil.js';
import {EXLIB,GRP_SYN} from './data/exercicios.js';
import {renderRecords} from './conquistas.js';
import {renderPersonagem} from './personagem.js';
import {renderProgresso} from './progresso.js';

/* ============ TREINOS ============ */
const LETTERS='ABCDEFGHIJ';
export function renderRoutines(){
  const box=document.getElementById('routines');
  const sub=document.getElementById('treino-sub');
  if(!box)return;
  if(!S.routines.length){
    if(S.profile){
      sub.textContent='Comece escolhendo uma divisão';
      box.innerHTML=`<div class="card">
        <b style="font-size:15px">💡 Sugestões de divisão pro seu perfil</b>
        <div style="color:var(--mut);font-size:12.5px;margin:4px 0 14px">Não sabe como dividir o treino? Escolha uma opção abaixo — a gente cria a estrutura com o que cada dia treina, e você preenche os exercícios (com sugestões prontas).</div>
        ${splitCardsHTML()}
      </div>
      <button class="btn btn-ghost" style="width:100%;justify-content:center" onclick="openRoutine()">＋ Ou criar um treino do zero</button>`;
    }else{
      sub.textContent='Monte suas rotinas';
      box.innerHTML=`<div class="empty"><div class="big">🏋️</div>
        <p>Pra te sugerir a melhor divisão (peito/tríceps, pull, perna...),<br>preencha seu perfil primeiro.</p>
        <button class="btn btn-acc" style="margin:0 auto 10px" onclick="go('perfil')">Preencher perfil</button>
        <button class="btn btn-ghost" style="margin:0 auto" onclick="openRoutine()">Criar treino do zero</button></div>`;
    }
    return;
  }
  const totalEx=S.routines.reduce((a,r)=>a+r.exercises.length,0);
  sub.textContent=`${S.routines.length} treino${S.routines.length>1?'s':''} · ${totalEx} exercício${totalEx!==1?'s':''}`;
  box.innerHTML=sessionTodayCardHTML()+S.routines.map((r,i)=>{
    const exs=r.exercises.map(ex=>{
      const pr=exPR(ex);
      return `
      <div class="row">
        <div class="name"><b>${esc(ex.name)}</b>
          ${ex.note?`<span>${esc(ex.note)}</span>`:''}</div>
        <div class="pills">
          <span class="pill">${ex.sets}×${esc(ex.reps)}</span>
          ${num(ex.load)>0?`<span class="pill">${esc(ex.load)} kg</span>`:''}
          ${pr?`<span class="pill" style="color:var(--orange)">🏆 ${pr.load}kg</span>`:''}
        </div>
        <div class="row-actions">
          <button class="mini" onclick="logSet('${r.id}','${ex.id}')" title="Registrar carga">📈</button>
          <button class="mini" onclick="openExercise('${r.id}','${ex.id}')">✏️</button>
          <button class="mini del" onclick="delExercise('${r.id}','${ex.id}')">🗑</button>
        </div>
      </div>`;}).join('');
    return `<div class="card">
      <div class="routine-head">
        <div class="tag">${esc(r.label||LETTERS[i]||'•')}</div>
        <h3>${esc(r.name)}</h3>
        <button class="mini" onclick="openRoutine('${r.id}')">✏️</button>
        <button class="mini del" onclick="delRoutine('${r.id}')">🗑</button>
      </div>
      ${r.focus?`<div class="routine-meta">🎯 ${esc(r.focus)}</div>`:''}
      ${exs||'<div class="routine-meta" style="margin-top:6px">Sem exercícios ainda.</div>'}
      <div class="add-line" style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="openExercise('${r.id}')">＋ Exercício</button>
        <button class="btn btn-ghost btn-sm" onclick="suggestExercises('${r.id}')">💡 Sugestões</button>
      </div>
    </div>`;
  }).join('')
  + `<button class="btn btn-acc" style="width:100%;justify-content:center;margin-top:4px" onclick="reviewWorkout()">🔍 Pedir revisão do treino</button>`
  + sessionHistoryHTML();
}

export function openRoutine(id){
  const r=id?S.routines.find(x=>x.id===id):null;
  const nextLabel=LETTERS[S.routines.length]||'';
  showModal(`
    <h3>${r?'Editar treino':'Novo treino'}</h3>
    <p class="sub">Ex: Treino A — Peito e Tríceps</p>
    <div class="field"><label>Nome do treino</label>
      <input id="r-name" placeholder="Treino A" value="${r?esc(r.name):''}"></div>
    <div class="grid2">
      <div class="field"><label>Letra / dia</label>
        <input id="r-label" maxlength="6" placeholder="A" value="${r?esc(r.label||''):nextLabel}"></div>
      <div class="field"><label>Foco muscular</label>
        <input id="r-focus" placeholder="Peito, Tríceps" value="${r?esc(r.focus||''):''}"></div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveRoutine('${id||''}')">Salvar</button>
    </div>`);
  setTimeout(()=>document.getElementById('r-name').focus(),100);
}
export function saveRoutine(id){
  const name=document.getElementById('r-name').value.trim();
  if(!name){toast('Dá um nome pro treino 💪');return}
  const label=document.getElementById('r-label').value.trim();
  const focus=document.getElementById('r-focus').value.trim();
  if(id){const r=S.routines.find(x=>x.id===id);r.name=name;r.label=label;r.focus=focus;}
  else{S.routines.push({id:uid(),name,label,focus,exercises:[],created:Date.now()});}
  save();renderRoutines();closeModal();toast('Treino salvo ✅');
}
export function delRoutine(id){
  const r=S.routines.find(x=>x.id===id);
  if(!confirm(`Apagar o treino "${r.name}"?`))return;
  S.routines=S.routines.filter(x=>x.id!==id);save();renderRoutines();toast('Treino removido');
}

export function openExercise(rid,eid){
  const r=S.routines.find(x=>x.id===rid);
  const ex=eid?r.exercises.find(x=>x.id===eid):null;
  showModal(`
    <h3>${ex?'Editar exercício':'Novo exercício'}</h3>
    <p class="sub">${esc(r.name)}</p>
    <div class="field"><label>Exercício</label>
      <input id="e-name" placeholder="Supino reto" value="${ex?esc(ex.name):''}"></div>
    <div class="field"><label>Grupo muscular</label>
      <select id="e-musc">
        ${['Peito','Costas','Pernas','Ombro','Bíceps','Tríceps','Core','Outro']
          .map(g=>`<option ${ex&&ex.musc===g?'selected':''}>${g}</option>`).join('')}
      </select></div>
    <div class="grid2">
      <div class="field"><label>Séries</label>
        <input id="e-sets" type="number" inputmode="numeric" placeholder="4" value="${ex?esc(ex.sets):''}"></div>
      <div class="field"><label>Repetições</label>
        <input id="e-reps" placeholder="8-12" value="${ex?esc(ex.reps):''}"></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Carga (kg)</label>
        <input id="e-load" type="number" inputmode="decimal" step="0.5" placeholder="40" value="${ex?esc(ex.load):''}"></div>
      <div class="field"><label>Descanso (s)</label>
        <input id="e-rest" type="number" inputmode="numeric" placeholder="90" value="${ex?esc(ex.rest):''}"></div>
    </div>
    <div class="field"><label>Observação</label>
      <input id="e-note" placeholder="Cadência lenta na negativa" value="${ex?esc(ex.note||''):''}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveExercise('${rid}','${eid||''}')">Salvar</button>
    </div>`);
  setTimeout(()=>document.getElementById('e-name').focus(),100);
}
export function saveExercise(rid,eid){
  const r=S.routines.find(x=>x.id===rid);
  const name=document.getElementById('e-name').value.trim();
  if(!name){toast('Qual o exercício? 🤔');return}
  const data={
    name,
    musc:document.getElementById('e-musc').value,
    sets:document.getElementById('e-sets').value.trim()||'1',
    reps:document.getElementById('e-reps').value.trim()||'-',
    load:document.getElementById('e-load').value.trim(),
    rest:document.getElementById('e-rest').value.trim(),
    note:document.getElementById('e-note').value.trim()
  };
  if(eid){Object.assign(r.exercises.find(x=>x.id===eid),data);}
  else{r.exercises.push({id:uid(),...data});}
  save();renderRoutines();closeModal();toast('Exercício salvo ✅');
}
export function delExercise(rid,eid){
  const r=S.routines.find(x=>x.id===rid);
  r.exercises=r.exercises.filter(x=>x.id!==eid);
  save();renderRoutines();toast('Exercício removido');
}
export function exPR(ex){if(!ex||!ex.history||!ex.history.length)return null;return ex.history.reduce((m,h)=>num(h.load)>num(m.load)?h:m);}
export function logSet(rid,eid){
  const r=S.routines.find(x=>x.id===rid);const ex=r.exercises.find(x=>x.id===eid);
  const defReps=(ex.reps||'').match(/\d+/);
  showModal(`<h3>Registrar carga</h3><p class="sub">${esc(ex.name)} · ${esc(r.name)}</p>
    <div class="field"><label>Data</label><input id="ls-date" type="date" value="${today()}"></div>
    <div class="grid2">
      <div class="field"><label>Carga (kg)</label><input id="ls-load" type="number" inputmode="decimal" step="0.5" placeholder="${ex.load||'40'}" value="${ex.load||''}"></div>
      <div class="field"><label>Repetições</label><input id="ls-reps" type="number" inputmode="numeric" placeholder="${defReps?defReps[0]:'10'}" value="${defReps?defReps[0]:''}"></div>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveSet('${rid}','${eid}')">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('ls-load').focus(),100);
}
export function saveSet(rid,eid){
  const r=S.routines.find(x=>x.id===rid);const ex=r.exercises.find(x=>x.id===eid);
  const load=num(document.getElementById('ls-load').value);
  if(!load){toast('Coloque a carga 🏋️');return}
  const date=document.getElementById('ls-date').value||today();
  const reps=num(document.getElementById('ls-reps').value)||0;
  if(!ex.history)ex.history=[];
  const prevPR=exPR(ex);
  ex.history.push({date,load:+load.toFixed(1),reps});
  ex.load=String(+load.toFixed(1));
  save();renderRoutines();renderRecords();renderPersonagem();closeModal();
  if(!prevPR||load>num(prevPR.load))toast('🏆 Novo recorde: '+load+' kg! +15 🪙');else toast('Carga registrada ✅');
}

/* ============ REVISÃO DE TREINO ============ */
export function reviewWorkout(){
  const exs=[];S.routines.forEach(r=>r.exercises.forEach(e=>exs.push(e)));
  if(!exs.length){
    showModal(`<h3>🔍 Revisão do treino</h3><p class="sub"></p>
      <div class="why">Você ainda não tem exercícios cadastrados. Monte seu treino na aba Treino e volte aqui que eu analiso o equilíbrio pra você 💪</div>
      <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal();go('treino')">Ir pro treino</button></div>`);
    return;
  }
  const sets={},cnt={};
  exs.forEach(e=>{const g=e.musc||'Outro';const s=num(e.sets)||1;sets[g]=(sets[g]||0)+s;cnt[g]=(cnt[g]||0)+1;});
  const major=['Peito','Costas','Pernas','Ombro'];
  const push=(sets['Peito']||0)+(sets['Ombro']||0)+(sets['Tríceps']||0);
  const pull=(sets['Costas']||0)+(sets['Bíceps']||0);
  const rid=S.routines[0].id;
  const leastMajor=()=>major.slice().sort((a,b)=>(sets[a]||0)-(sets[b]||0))[0];
  const msgs=[]; // {t, g?}
  major.forEach(g=>{if(!sets[g])msgs.push({t:`Não vi nada de <b>${g}</b> — vale incluir pra não deixar esse grupo pra trás.`,g});});
  // muitos exercícios do mesmo grupo (ativação parecida)
  Object.keys(cnt).forEach(g=>{if(cnt[g]>=5){const alt=leastMajor();
    msgs.push({t:`Você colocou <b>${cnt[g]} exercícios de ${g}</b> — bastante coisa com ativação muscular parecida. Você pode, mas considere trocar alguns por outro grupo${alt&&alt!==g?` (ex: <b>${alt}</b>)`:''} em vez de tantos movimentos iguais.`,g:(alt&&alt!==g)?alt:null});}});
  // movimentos repetidos (mesma palavra base, ex: vários "supino")
  const baseCount={};
  exs.forEach(e=>{const w=(e.name||'').toLowerCase().split(/[ (/]/)[0];if(w.length>=4){(baseCount[w]=baseCount[w]||[]).push(e.name);}});
  Object.keys(baseCount).forEach(w=>{if(baseCount[w].length>=3)msgs.push({t:`Você tem <b>${baseCount[w].length} variações de "${w}"</b> (movimento bem parecido). Variar o padrão — outro ângulo, pegada ou grupo — rende mais do que repetir o mesmo.`});});
  // volume por grupo
  major.forEach(g=>{const s=sets[g]||0;if(s>0&&s<8)msgs.push({t:`<b>${g}</b> está com ${s} séries no total — um pouco baixo. A faixa que costuma render é ~10–20 séries/semana.`,g});
    if(s>25)msgs.push({t:`<b>${g}</b> tem ${s} séries — bastante volume. Cuidado pra não atrapalhar a recuperação dos outros grupos.`});});
  // empurrar x puxar
  if(push>0&&pull>0){
    if(push>pull*1.5)msgs.push({t:`Bem mais <b>empurrar</b> (peito/ombro/tríceps: ${push} séries) do que <b>puxar</b> (costas/bíceps: ${pull}). Equilibrar com mais costas ajuda postura e simetria.`,g:'Costas'});
    if(pull>push*1.5)msgs.push({t:`Mais <b>puxar</b> (${pull}) do que <b>empurrar</b> (${push}) — pode reforçar peito/ombro.`,g:'Peito'});
  }
  // séries demais num exercício só
  exs.forEach(e=>{if((num(e.sets)||0)>=6)msgs.push({t:`<b>${esc(e.name)}</b> está com ${e.sets} séries num exercício só. Que tal dividir em 2 movimentos diferentes (ex: um mais clavicular) pra variar o estímulo?`});});
  // peito clavicular
  if((cnt['Peito']||0)>=2){const peitoEx=exs.filter(e=>e.musc==='Peito').map(e=>e.name.toLowerCase()).join(' ');
    if(!/inclinad|clavicular|superior|45/.test(peitoEx))msgs.push({t:`Seu peito parece focar a porção central/baixa. Um <b>inclinado</b> (porção clavicular) deixa o peitoral mais completo.`,g:'Peito'});}
  // progressão
  const created=S.routines.map(r=>r.created).filter(Boolean);
  if(created.length){const weeks=Math.floor((Date.now()-Math.min(...created))/(7*864e5));
    if(weeks>=6)msgs.push({t:`Seu treino tem ~${weeks} semanas. Costuma valer a pena <b>variar a cada 6–10 semanas</b> pra continuar evoluindo — pode ser hora de mexer.`});}
  if(!msgs.length)msgs.push({t:'Treino bem equilibrado entre os grupos! 👏 Continue acompanhando as cargas pra garantir a progressão.'});

  const totalSets=Object.values(sets).reduce((a,b)=>a+b,0);
  const dist=Object.keys(sets).sort((a,b)=>sets[b]-sets[a]).map(g=>`<span class="pill">${g}: ${sets[g]}</span>`).join(' ');
  showModal(`<h3>🔍 Revisão do treino</h3>
    <p class="sub">${exs.length} exercícios · ${totalSets} séries no total. São sugestões — você aceita ou ignora, a decisão é sua 💪</p>
    <div style="margin-bottom:14px"><div style="font-size:12px;color:var(--mut);font-weight:700;text-transform:uppercase;margin-bottom:7px">Séries por grupo</div>
      <div class="pills">${dist}</div></div>
    ${msgs.map(mo=>`<div class="why" style="margin:0 0 9px">💡 ${mo.t}${mo.g?`<div style="margin-top:9px"><button class="btn btn-acc btn-sm" onclick="closeModal();suggestExercises('${rid}','${mo.g}')">✓ Aceitar: ver exercícios de ${mo.g.toLowerCase()}</button></div>`:''}</div>`).join('')}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Fechar</button></div>`);
}

/* ============ BIBLIOTECA DE EXERCÍCIOS ============ */
export function focusGroups(focus){
  const f=(focus||'').toLowerCase();const found=[];
  Object.keys(EXLIB).forEach(g=>{if(f.includes(g.toLowerCase()))found.push(g);});
  Object.keys(GRP_SYN).forEach(s=>{if(f.includes(s)&&!found.includes(GRP_SYN[s]))found.push(GRP_SYN[s]);});
  return found.length?found:Object.keys(EXLIB);
}
const gradeStars=g=>'★'.repeat(g)+'<span style="color:var(--line)">'+'★'.repeat(3-g)+'</span>';
const gradeLabel=g=>g===3?'Muito recomendado':g===2?'Recomendado':'Complementar';

export const escAttr=s=>(s||'').replace(/'/g,"\\'");
export function recommendedNext(r){
  const groups=focusGroups(r.focus);
  const have=new Set(r.exercises.map(e=>e.name));
  const added={};r.exercises.forEach(e=>{added[e.musc]=(added[e.musc]||0)+1;});
  const cands=[];
  groups.forEach((g,gi)=>{(EXLIB[g]||[]).forEach(ex=>{if(!have.has(ex.n))
    cands.push({g,ex,score:ex.g*10+(ex.c?3:0)-(added[g]||0)*4-gi*5});});});
  cands.sort((a,b)=>b.score-a.score);
  return cands;
}
export function exItemHTML(rid,group,ex,reopen,showGroup){
  return `<div class="opt" style="cursor:pointer" onclick="addSuggested('${rid}','${group}','${escAttr(ex.n)}','${reopen}')">
    <div class="radio" style="border-radius:8px;border:none;background:var(--acc);color:#0a0a0a;font-weight:900">＋</div>
    <div class="o-main"><div class="o-name">${esc(ex.n)}${showGroup?` <span class="pill dim">${group}</span>`:''}</div>
      <div class="o-sub"><span style="color:var(--orange);letter-spacing:1px">${gradeStars(ex.g)}</span> · ${gradeLabel(ex.g)} · ${ex.c?'composto':'isolado'} · ${ex.reps}</div></div>
  </div>`;
}
export function suggestExercises(rid,group){
  const r=S.routines.find(x=>x.id===rid);if(!r)return;
  const groups=focusGroups(r.focus);
  const g=group||groups[0]||'Peito';
  const have=new Set(r.exercises.map(e=>e.name));
  const rec=recommendedNext(r).slice(0,4);
  const list=(EXLIB[g]||[]).slice().sort((a,b)=>b.g-a.g).filter(ex=>!have.has(ex.n));
  const allGroups=Object.keys(EXLIB);
  const recHtml=rec.length?`
    <div style="font-size:12px;color:var(--acc);font-weight:800;text-transform:uppercase;margin:2px 0 8px">⭐ Próximos sugeridos pro treino</div>
    ${rec.map(c=>exItemHTML(rid,c.g,c.ex,g,true)).join('')}
    <div style="font-size:12px;color:var(--mut);font-weight:700;text-transform:uppercase;margin:16px 0 9px">Explorar por grupo</div>`:'';
  showModal(`
    <h3>Montar ${esc(r.name)}</h3>
    <p class="sub">Foco: ${esc(r.focus||groups.join(', '))} · as sugestões mudam conforme você adiciona, pra fechar o treino</p>
    ${recHtml}
    <div class="chip-pick" style="margin-bottom:14px">
      ${allGroups.map(x=>`<button type="button" class="${x===g?'on':''}" onclick="suggestExercises('${rid}','${x}')">${x}</button>`).join('')}
    </div>
    ${list.length?list.map(ex=>exItemHTML(rid,g,ex,g,false)).join(''):'<div class="routine-meta">Todos os exercícios de '+esc(g.toLowerCase())+' já estão no treino 💪</div>'}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Concluir</button></div>`);
}
export function addSuggested(rid,group,name,reopen){
  const r=S.routines.find(x=>x.id===rid);
  const ex=(EXLIB[group]||[]).find(e=>e.n===name);
  if(!ex){toast('Exercício não encontrado');return;}
  if(r.exercises.some(e=>e.name===ex.n)){toast('Já está no treino 😉');return;}
  r.exercises.push({id:uid(),name:ex.n,musc:group,sets:ex.c?'4':'3',reps:ex.reps,load:'',rest:ex.c?'120':'75',note:'',history:[]});
  save();renderRoutines();toast(ex.n+' adicionado ✅');
  suggestExercises(rid,reopen||group);
}

/* ============ SESSÕES DE TREINO (registro diário) ============ */
export function sessionTodayCardHTML(){
  const t=today();
  const todN=S.sessions.filter(s=>s.date===t).length;
  const last=S.sessions[S.sessions.length-1];
  return `<div class="card" style="background:linear-gradient(135deg,#1d2230,#171b22)">
    <div style="display:flex;align-items:center;justify-content:space-between">
      <b style="font-size:15px">🔥 Treino de hoje</b>
      ${todN?`<span class="pill" style="color:var(--acc)">✓ ${todN} registrado${todN>1?'s':''}</span>`:''}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn btn-acc btn-sm" onclick="openSessionPicker()">▶️ Registrar treino</button>
      ${last?`<button class="btn btn-ghost btn-sm" onclick="repeatLast()">🔁 Repetir último</button>`:''}
    </div>
  </div>`;
}
export function sessionHistoryHTML(){
  if(!S.sessions.length)return '';
  const arr=[...S.sessions].sort((a,b)=>a.date.localeCompare(b.date));
  const series=arr.map(s=>({date:s.date,v:Math.round(s.volume)}));
  const chart=svgChart(series,'#c6ff3a','sess');
  const recent=[...arr].reverse().slice(0,8);
  return `<div class="card">
    <b style="font-size:15px">📆 Histórico de treinos</b>
    <div style="color:var(--mut);font-size:12px;margin:2px 0 4px">${S.sessions.length} registrado${S.sessions.length>1?'s':''} · volume levantado (kg) por sessão</div>
    ${chart?`<div class="chart-wrap">${chart}</div>`:''}
    <div style="margin-top:10px">
      ${recent.map(s=>`<div class="row" onclick="viewSession('${s.id}')" style="cursor:pointer">
        <div class="name"><b>${esc(s.routineName)}</b><span>${dShort(s.date)} · ${s.entries.length} exercícios</span></div>
        <div class="pills"><span class="pill">${Math.round(s.volume)} kg</span>${s.minutes?`<span class="pill dim">⏱ ${s.minutes}min</span>`:''}</div>
        <div class="row-actions"><button class="mini">👁️</button></div>
      </div>`).join('')}
    </div>
  </div>`;
}
export function openSessionPicker(){
  if(!S.routines.length){toast('Crie um treino primeiro');return;}
  showModal(`<h3>Qual treino você vai fazer?</h3><p class="sub">Escolha entre os seus treinos salvos.</p>
    ${S.routines.map(r=>`<div class="opt" style="cursor:pointer" onclick="openSessionLog('${r.id}',false)">
      <div class="tag" style="width:32px;height:32px;flex:none;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#0a0a0a;font-weight:900">${esc(r.label||'•')}</div>
      <div class="o-main"><div class="o-name">${esc(r.name)}</div><div class="o-sub">${r.focus?esc(r.focus)+' · ':''}${r.exercises.length} exercícios</div></div>
    </div>`).join('')}
    <div class="modal-actions"><button class="btn btn-ghost" style="flex:1;justify-content:center" onclick="closeModal()">Cancelar</button></div>`);
}
export function openSessionLog(rid,fromLast){
  const r=S.routines.find(x=>x.id===rid);if(!r)return;
  if(!r.exercises.length){toast('Esse treino não tem exercícios ainda');return;}
  let prefill={};
  if(fromLast){const last=[...S.sessions].reverse().find(s=>s.routineId===rid);if(last)last.entries.forEach(e=>{prefill[e.name]=e;});}
  const rows=r.exercises.map((ex,i)=>{
    const pf=prefill[ex.name]||{};const reps0=(ex.reps||'').match(/\d+/);
    return `<div style="background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:10px 11px;margin-bottom:9px">
      <div style="font-weight:700;font-size:13.5px;margin-bottom:8px">${esc(ex.name)} <span class="pill dim">${esc(ex.musc||'')}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:7px">
        ${inp('se-'+i,pf.sets!=null?pf.sets:(ex.sets||''),'SÉRIES')}
        ${inp('re-'+i,pf.reps!=null?pf.reps:(reps0?reps0[0]:''),'REPS')}
        ${inp('lo-'+i,pf.load!=null?pf.load:(ex.load||''),'CARGA kg')}
        ${inp('mi-'+i,pf.minutes!=null?pf.minutes:'','MIN')}
      </div>
    </div>`;
  }).join('');
  showModal(`<h3>Registrar: ${esc(r.name)}</h3>
    <p class="sub">Preencha o que você fez em cada exercício.${fromLast?' Já veio com os valores do último treino 🔁':''}</p>
    <div class="field"><label>Data</label><input id="sess-date" type="date" value="${today()}"></div>
    ${rows}
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveSession('${rid}')">Salvar treino</button></div>`);
}
export function saveSession(rid){
  const r=S.routines.find(x=>x.id===rid);
  const date=document.getElementById('sess-date').value||today();
  const entries=[];let volume=0,minutes=0;
  r.exercises.forEach((ex,i)=>{
    const sets=num(document.getElementById('se-'+i).value);
    const reps=num(document.getElementById('re-'+i).value);
    const load=num(document.getElementById('lo-'+i).value);
    const min=num(document.getElementById('mi-'+i).value);
    if(sets||reps||load||min){
      entries.push({name:ex.name,musc:ex.musc,sets,reps,load,minutes:min});
      volume+=load*reps*(sets||1);minutes+=min;
      if(load>0){if(!ex.history)ex.history=[];ex.history.push({date,load:+load.toFixed(1),reps});}
    }
  });
  if(!entries.length){toast('Preencha ao menos um exercício');return;}
  S.sessions.push({id:uid(),date,routineId:rid,routineName:r.name,entries,volume:Math.round(volume),minutes});
  if(!S.progress.days[date])S.progress.days[date]={};
  S.progress.days[date].workout=true;
  save();renderRoutines();renderRecords();renderProgresso();renderPersonagem();closeModal();
  toast('Treino registrado! +10 🪙 💪');
}
export function viewSession(id){
  const s=S.sessions.find(x=>x.id===id);if(!s)return;
  showModal(`<h3>${esc(s.routineName)}</h3>
    <p class="sub">${dShort(s.date)} · ${s.entries.length} exercícios · ${Math.round(s.volume)} kg${s.minutes?' · '+s.minutes+' min':''}</p>
    ${s.entries.map(e=>`<div class="row"><div class="name"><b>${esc(e.name)}</b><span>${esc(e.musc||'')}</span></div>
      <div class="pills"><span class="pill">${e.sets||1}×${e.reps||'-'}</span>${e.load?`<span class="pill">${e.load} kg</span>`:''}${e.minutes?`<span class="pill dim">⏱ ${e.minutes}m</span>`:''}</div></div>`).join('')}
    <div class="modal-actions"><button class="btn btn-danger" onclick="delSession('${id}')" style="flex:none">🗑 Apagar</button>
    <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Fechar</button></div>`);
}
export function delSession(id){
  if(!confirm('Apagar este registro de treino?'))return;
  S.sessions=S.sessions.filter(x=>x.id!==id);
  save();renderRoutines();renderProgresso();closeModal();toast('Registro removido');
}
export function repeatLast(){
  const last=S.sessions[S.sessions.length-1];
  if(!last){toast('Nenhum treino registrado ainda');return;}
  openSessionLog(last.routineId,true);
}
