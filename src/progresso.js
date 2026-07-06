import {S,save,num,esc} from './state.js';
import {toast,showModal,closeModal,svgChart,today,dShort} from './ui.js';
import {chipRow,chipVal,applyChoices,renderPerfil} from './perfil.js';
import {renderDieta} from './dieta.js';
import {MET,INTENS} from './data/atividades.js';
import {renderPersonagem} from './personagem.js';

/* ============ PROGRESSO ============ */
export const MEASURES=[
  {k:'braco',label:'Braço'},{k:'peito',label:'Peito'},{k:'cintura',label:'Cintura'},
  {k:'quadril',label:'Quadril'},{k:'coxa',label:'Coxa'},{k:'panturrilha',label:'Panturrilha'}
];
let measSel='braco';

export function computeStreak(pred){
  const days=S.progress.days;let d=new Date(today());
  // se hoje não bateu, começa de ontem
  const key=dt=>dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  if(!(days[key(d)]&&pred(days[key(d)])))d.setDate(d.getDate()-1);
  let c=0;
  while(days[key(d)]&&pred(days[key(d)])){c++;d.setDate(d.getDate()-1);}
  return c;
}

export function actKcal(a){const w=S.profile?(num(S.profile.weight)||75):75;return Math.round((MET[a.intensity]||6)*3.5*w/200*(a.min||0));}
export function openActivityLog(){
  showModal(`<h3>Cardio / atividade</h3><p class="sub">Registre o que você fez hoje — conta pro seu condicionamento.</p>
    <div class="field"><label>Tipo</label>${chipRow('atype',[{k:'cardio',l:'🏃 Cardio'},{k:'outra',l:'⚽ Outra atividade'}],'cardio','k','l')}</div>
    <div class="field"><label>Nome (opcional)</label><input id="act-name" placeholder="Corrida, bike, futebol..."></div>
    <div class="grid2">
      <div class="field"><label>Duração (min)</label><input id="act-min" type="number" inputmode="numeric" placeholder="30"></div>
      <div class="field"><label>Intensidade</label>${chipRow('aint',INTENS,'moderada','k','l')}</div>
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="addActivity()">Adicionar</button></div>`);
}
export function addActivity(){
  const min=num(document.getElementById('act-min').value);
  if(!min){toast('Coloque a duração ⏱');return;}
  const t=today();if(!S.progress.days[t])S.progress.days[t]={};
  if(!S.progress.days[t].activities)S.progress.days[t].activities=[];
  S.progress.days[t].activities.push({type:chipVal('atype')||'cardio',name:document.getElementById('act-name').value.trim(),min,intensity:chipVal('aint')||'moderada'});
  save();renderProgresso();renderPersonagem();closeModal();toast('Atividade registrada 🏃 +5 🪙');
}
export function delActivity(i){const t=today();if(S.progress.days[t]&&S.progress.days[t].activities){S.progress.days[t].activities.splice(i,1);save();renderProgresso();renderPersonagem();}}
export function renderProgresso(){
  const P=S.progress,t=today(),body=document.getElementById('prog-body');
  if(!body)return;
  if(!P.days[t])P.days[t]={};
  const td=P.days[t];
  const CUP=200;
  const goalMl=P.waterGoalMl||2000;
  const nowMl=td.waterMl!=null?td.waterMl:((td.water||0)*CUP);
  const cupsTotal=Math.max(1,Math.round(goalMl/CUP));
  const cupsNow=Math.floor(nowMl/CUP);
  const acts=td.activities||[];
  const actBurn=acts.reduce((s,a)=>s+actKcal(a),0);
  // streaks
  const stTreino=computeStreak(d=>d.workout);
  const treinoTotal=Object.values(P.days).filter(d=>d.workout).length;
  const dietaTotal=Object.values(P.days).filter(d=>d.diet).length;
  document.getElementById('prog-sub').textContent=stTreino>0?`🔥 ${stTreino} dia${stTreino>1?'s':''} seguido${stTreino>1?'s':''} treinando`:'Acompanhe sua evolução';

  // cups (200ml cada)
  let cups='';for(let i=0;i<cupsTotal;i++)cups+=`<div class="cup ${i<cupsNow?'on':''}" onclick="setWaterMl(${(i+1)*CUP})"></div>`;

  // histórico últimos 21 dias
  let hist='';for(let i=20;i>=0;i--){const dt=new Date(t);dt.setDate(dt.getDate()-i);
    const k=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    const dd=P.days[k]||{};const cls=dd.workout&&dd.diet?'wd':dd.workout?'w':dd.diet?'d':'';
    hist+=`<div class="hdot ${cls}" title="${k}"></div>`;}

  // peso
  const wArr=[...P.weight].sort((a,b)=>a.date.localeCompare(b.date));
  let pesoBlock;
  if(!wArr.length){
    pesoBlock=`<div class="chart-empty">Nenhum peso registrado.<br>Toque em registrar pra começar 👇</div>`;
  }else{
    const first=wArr[0],last=wArr[wArr.length-1];
    const diff=+(last.v-first.v).toFixed(1);
    const cls=diff>0?'up':diff<0?'down':'flat';
    const arrow=diff>0?'▲':diff<0?'▼':'■';
    pesoBlock=`<div class="big-num"><span class="n">${last.v}</span><span class="u">kg</span>
      ${wArr.length>1?`<span class="delta ${cls}">${arrow} ${Math.abs(diff)} kg</span>`:''}</div>
      <div style="color:var(--mut);font-size:12px">${wArr.length} registro${wArr.length>1?'s':''}${wArr.length>1?` · desde ${dShort(first.date)}`:''}</div>
      ${svgChart(wArr.map(w=>({date:w.date,v:w.v})),'#c6ff3a','w')?`<div class="chart-wrap">${svgChart(wArr.map(w=>({date:w.date,v:w.v})),'#c6ff3a','w')}</div>`:''}`;
  }

  // medidas
  const mArr=P.measures.filter(m=>m[measSel]!=null&&m[measSel]!=='').map(m=>({date:m.date,v:num(m[measSel])})).sort((a,b)=>a.date.localeCompare(b.date));
  let medBlock;
  if(!mArr.length){medBlock=`<div class="chart-empty">Sem registro de ${MEASURES.find(x=>x.k===measSel).label.toLowerCase()} ainda.</div>`;}
  else{
    const last=mArr[mArr.length-1],first=mArr[0];const diff=+(last.v-first.v).toFixed(1);
    const cls=diff>0?'up':diff<0?'down':'flat';const arrow=diff>0?'▲':diff<0?'▼':'■';
    medBlock=`<div class="big-num"><span class="n">${last.v}</span><span class="u">cm</span>
      ${mArr.length>1?`<span class="delta ${cls}">${arrow} ${Math.abs(diff)} cm</span>`:''}</div>
      ${svgChart(mArr,'#4aa8ff','m')?`<div class="chart-wrap">${svgChart(mArr,'#4aa8ff','m')}</div>`:''}`;
  }

  body.innerHTML=`
    <div class="card">
      <b style="font-size:15px">✅ Check-in de hoje</b>
      <div class="habit-toggles" style="grid-template-columns:1fr 1fr 1fr">
        <div class="htog ${td.workout?'on':''}" onclick="toggleHabit('workout')"><div class="ck">${td.workout?'✓':''}</div><div class="lab">Treino<small>concluído</small></div></div>
        <div class="htog ${td.diet?'on':''}" onclick="toggleHabit('diet')"><div class="ck">${td.diet?'✓':''}</div><div class="lab">Dieta<small>em dia</small></div></div>
        <div class="htog ${td.stretch?'on':''}" onclick="toggleHabit('stretch')"><div class="ck">${td.stretch?'✓':''}</div><div class="lab">Alongou<small>hoje</small></div></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:15px">
        <b style="font-size:13.5px">🏃 Cardio / atividade</b>
        <button class="btn btn-ghost btn-sm" onclick="openActivityLog()">＋ Adicionar</button>
      </div>
      ${acts.length?acts.map((a,i)=>`<div class="row" style="margin-top:8px">
        <div class="name"><b>${a.type==='cardio'?'🏃':'⚽'} ${esc(a.name||(a.type==='cardio'?'Cardio':'Atividade'))}</b><span>intensidade ${(INTENS.find(x=>x.k===a.intensity)||{}).l||''}</span></div>
        <div class="pills"><span class="pill">${a.min} min</span><span class="pill dim">~${actKcal(a)} kcal</span></div>
        <div class="row-actions"><button class="mini del" onclick="delActivity(${i})">🗑</button></div>
      </div>`).join(''):'<div style="color:var(--mut);font-size:12.5px;margin-top:6px">Fez cardio ou esporte hoje? Registre duração e intensidade.</div>'}
      ${actBurn?`<div style="font-size:11.5px;color:var(--mut);margin-top:8px">Gasto extra estimado: <b style="color:var(--acc)">~${actBurn} kcal</b></div>`:''}
      <div style="border-top:1px solid var(--line);margin-top:15px;padding-top:13px;display:flex;align-items:center;justify-content:space-between">
        <b style="font-size:13.5px">💧 Água</b>
        <span style="font-size:12px;color:var(--mut)">meta ${goalMl} ml <button class="mini" onclick="editWaterGoal()" title="Editar meta" style="vertical-align:middle">⚙️</button></span>
      </div>
      <div class="water-row" style="margin-top:8px"><div class="water-cups">${cups}</div></div>
      <div class="water-row" style="justify-content:space-between">
        <span style="font-size:13px;color:var(--mut)"><b style="color:var(--blue);font-size:16px">${nowMl} ml</b> · ${cupsNow}/${cupsTotal} copos (200ml)${nowMl>=goalMl?' ✅':''}</span>
        <div class="water-ctrl">
          <button class="round-btn" onclick="setWaterMl(${Math.max(0,nowMl-CUP)})">−</button>
          <button class="round-btn" onclick="setWaterMl(${nowMl+CUP})">＋</button>
        </div>
      </div>
      <div class="streak">
        <div class="fire">🔥</div>
        <div class="s-txt"><b>${stTreino}</b> dia${stTreino!==1?'s':''} de treino seguido${stTreino!==1?'s':''}
          <div>${treinoTotal} treinos · ${dietaTotal} dias de dieta no total</div></div>
      </div>
      <div class="hist-dots">${hist}</div>
      <div style="font-size:11px;color:var(--mut);margin-top:8px">Últimos 21 dias · 🟩 treino · 🟦 dieta</div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <b style="font-size:15px">⚖️ Peso</b>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openWeightHistory()">📋</button>
          <button class="btn btn-acc btn-sm" onclick="openWeight()">＋ Registrar</button>
        </div>
      </div>
      ${pesoBlock}
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <b style="font-size:15px">📏 Medidas</b>
        <div style="display:flex;gap:6px">
          <button class="btn btn-ghost btn-sm" onclick="openMeasureHistory()">📋</button>
          <button class="btn btn-acc btn-sm" onclick="openMeasure()">＋ Registrar</button>
        </div>
      </div>
      <div class="seg">${MEASURES.slice(0,3).map(m=>`<button class="${measSel===m.k?'on':''}" onclick="selMeas('${m.k}')">${m.label}</button>`).join('')}</div>
      <div class="seg" style="margin-top:-8px">${MEASURES.slice(3).map(m=>`<button class="${measSel===m.k?'on':''}" onclick="selMeas('${m.k}')">${m.label}</button>`).join('')}</div>
      ${medBlock}
    </div>`;
}
export function selMeas(k){measSel=k;renderProgresso();}
export function setWaterMl(ml){const t=today();if(!S.progress.days[t])S.progress.days[t]={};S.progress.days[t].waterMl=Math.max(0,ml);save();renderProgresso();renderPersonagem();}
export function toggleHabit(h){const t=today();if(!S.progress.days[t])S.progress.days[t]={};S.progress.days[t][h]=!S.progress.days[t][h];save();renderProgresso();renderPersonagem();
  if(S.progress.days[t][h])toast(h==='workout'?'Treino concluído! +10 🪙 +50 XP 💪':h==='diet'?'Dieta em dia! +8 🪙 +30 XP ✅':'Alongamento marcado 🧘 +2 🪙');}
export function editWaterGoal(){
  const sug=S.profile?Math.round(num(S.profile.weight)*35):null;
  showModal(`<h3>Meta de água</h3><p class="sub">Em mililitros por dia (1 copo = 200ml).</p>
    <div class="field"><label>Meta (ml)</label><input id="wg" type="number" inputmode="numeric" step="100" value="${S.progress.waterGoalMl||2000}"></div>
    ${sug?`<p class="hint">Indicação comum: ~35 ml por kg → pro seu peso, cerca de <b>${sug} ml</b>. <a href="#" style="color:var(--acc)" onclick="document.getElementById('wg').value=${sug};return false">usar ${sug} ml</a></p>`:'<p class="hint">Indicação comum: ~35 ml por kg de peso corporal.</p>'}
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="(function(){var v=Math.max(200,parseInt(document.getElementById('wg').value)||2000);S.progress.waterGoalMl=v;save();renderProgresso();closeModal();toast('Meta: '+v+' ml')})()">Salvar</button></div>`);
}
export function openWeight(){
  showModal(`<h3>Registrar peso</h3><p class="sub">Atualiza seu perfil e recalcula as metas.</p>
    <div class="field"><label>Data</label><input id="w-date" type="date" value="${today()}"></div>
    <div class="field"><label>Peso (kg)</label><input id="w-val" type="number" inputmode="decimal" step="0.1" placeholder="80.0" value="${S.profile?S.profile.weight:''}"></div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveWeight()">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('w-val').focus(),100);
}
export function saveWeight(){
  const date=document.getElementById('w-date').value||today();
  const v=num(document.getElementById('w-val').value);
  if(!v){toast('Coloque o peso ⚖️');return}
  S.progress.weight=S.progress.weight.filter(w=>w.date!==date);
  S.progress.weight.push({date,v:+v.toFixed(1)});
  // peso mais recente atualiza o perfil
  const latest=[...S.progress.weight].sort((a,b)=>a.date.localeCompare(b.date)).pop();
  if(S.profile){S.profile.weight=String(latest.v);applyChoices();renderPerfil();renderDieta();}
  save();renderProgresso();closeModal();toast('Peso registrado ✅');
}
export function openWeightHistory(){
  const arr=[...(S.progress.weight||[])].sort((a,b)=>b.date.localeCompare(a.date));
  showModal(`<h3>Histórico de peso</h3><p class="sub">${arr.length} registro${arr.length!==1?'s':''}</p>
    ${arr.length?arr.map(w=>`<div class="row"><div class="name"><b>${w.v} kg</b><span>${dShort(w.date)}</span></div>
      <div class="row-actions"><button class="mini del" onclick="delWeight('${w.date}')">🗑</button></div></div>`).join(''):'<div class="hint">Nenhum registro ainda.</div>'}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Fechar</button></div>`);
}
export function delWeight(date){
  S.progress.weight=(S.progress.weight||[]).filter(w=>w.date!==date);
  save();renderProgresso();
  if((S.progress.weight||[]).length)openWeightHistory();else closeModal();
  toast('Registro removido');
}
export function openMeasureHistory(){
  const arr=[...(S.progress.measures||[])].sort((a,b)=>b.date.localeCompare(a.date));
  showModal(`<h3>Histórico de medidas</h3><p class="sub">${arr.length} registro${arr.length!==1?'s':''}</p>
    ${arr.length?arr.map(mm=>{const parts=MEASURES.filter(x=>mm[x.k]!=null&&mm[x.k]!=='').map(x=>`${x.label} ${mm[x.k]}`).join(' · ');return `<div class="row"><div class="name"><b>${dShort(mm.date)}</b><span>${esc(parts||'—')}</span></div>
      <div class="row-actions"><button class="mini del" onclick="delMeasure('${mm.date}')">🗑</button></div></div>`;}).join(''):'<div class="hint">Nenhum registro ainda.</div>'}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Fechar</button></div>`);
}
export function delMeasure(date){
  S.progress.measures=(S.progress.measures||[]).filter(m=>m.date!==date);
  save();renderProgresso();
  if((S.progress.measures||[]).length)openMeasureHistory();else closeModal();
  toast('Registro removido');
}
export function openMeasure(){
  const last=S.progress.measures.length?S.progress.measures[S.progress.measures.length-1]:{};
  showModal(`<h3>Registrar medidas</h3><p class="sub">Preencha o que quiser (cm). Em branco fica de fora.</p>
    <div class="field"><label>Data</label><input id="m-date" type="date" value="${today()}"></div>
    <div class="grid2">
      ${MEASURES.map(m=>`<div class="field"><label>${m.label} (cm)</label>
        <input id="md-${m.k}" type="number" inputmode="decimal" step="0.1" placeholder="${last[m.k]||''}" value=""></div>`).join('')}
    </div>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveMeasure()">Salvar</button></div>`);
}
export function saveMeasure(){
  const date=document.getElementById('m-date').value||today();
  const entry={date};let any=false;
  MEASURES.forEach(m=>{const v=document.getElementById('md-'+m.k).value.trim();if(v){entry[m.k]=+num(v).toFixed(1);any=true;}});
  if(!any){toast('Preencha ao menos uma medida 📏');return}
  // mescla com entrada existente da mesma data
  const ex=S.progress.measures.find(x=>x.date===date);
  if(ex)Object.assign(ex,entry);else S.progress.measures.push(entry);
  save();renderProgresso();closeModal();toast('Medidas salvas ✅');
}
