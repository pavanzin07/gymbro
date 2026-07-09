import {S,save,uid,esc,num} from './state.js';
import {toast,showModal,closeModal,today,dShort,parseLocalDate} from './ui.js';
import {FOODS,COMBOS,CATLABEL} from './data/alimentos.js';

/* ============ ALIMENTAÇÃO ============ */
let _mealViewDate=today(); // data que está sendo visualizada na aba Dieta
export function mealTotals(m){
  return m.foods.reduce((a,f)=>({
    kcal:a.kcal+num(f.kcal),prot:a.prot+num(f.prot),
    carb:a.carb+num(f.carb),fat:a.fat+num(f.fat)
  }),{kcal:0,prot:0,carb:0,fat:0});
}
function getMealsForDate(date){
  if(!S.mealDiary[date])return[];
  return S.mealDiary[date];
}
function ensureMealDayExists(date){
  if(!S.mealDiary[date])S.mealDiary[date]=JSON.parse(JSON.stringify(S.mealTemplate));
  return S.mealDiary[date];
}
function copyTemplateToDay(date){
  S.mealDiary[date]=JSON.parse(JSON.stringify(S.mealTemplate));
  save();
}
export function dayTotals(date=today()){
  const meals=getMealsForDate(date);
  return meals.reduce((a,m)=>{const t=mealTotals(m);return{
    kcal:a.kcal+t.kcal,prot:a.prot+t.prot,carb:a.carb+t.carb,fat:a.fat+t.fat
  }},{kcal:0,prot:0,carb:0,fat:0});
}
const R=n=>Math.round(n);
export function renderDieta(){
  const t=dayTotals(_mealViewDate),g=S.targets;
  const isToday=_mealViewDate===today();
  const sub=document.getElementById('dieta-sub');
  if(!sub)return;
  // Auto-check dieta completion only on today's view
  if(isToday&&window.checkDietaAuto)window.checkDietaAuto();
  sub.textContent=`${R(t.kcal)} / ${g.kcal} kcal ${isToday?'hoje':dShort(_mealViewDate)}`;
  const barRow=(lbl,cls,val,goal,unit,color)=>{
    const pct=goal>0?Math.min(100,Math.round(val/goal*100)):0;
    return `<div class="macro-box ${cls}">
      <div class="lbl">${lbl}</div>
      <div class="val">${R(val)}<small>/${goal}${unit}</small></div>
      <div class="bar"><i style="width:${pct}%;background:${color}"></i></div>
    </div>`;
  };
  document.getElementById('macro-summary').innerHTML=`
    <div class="card macro-card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <b style="font-size:15px">Resumo do dia</b>
        <span style="color:var(--mut);font-size:12px">metas diárias</span>
      </div>
      <div class="macro-grid">
        ${barRow('Calorias','kcal',t.kcal,g.kcal,'','linear-gradient(90deg,#c6ff3a,#9cff00)')}
        ${barRow('Proteína','prot',t.prot,g.prot,'g','#4aa8ff')}
        ${barRow('Carbo','carb',t.carb,g.carb,'g','#ffb13a')}
        ${barRow('Gordura','fat',t.fat,g.fat,'g','#ff6b9d')}
      </div>
    </div>`;

  const box=document.getElementById('meals');
  const meals=getMealsForDate(_mealViewDate);
  const dateNav=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding:0 4px">
    <button class="btn btn-ghost btn-sm" onclick="switchMealDate(-1)">← Anterior</button>
    <span style="font-weight:700;font-size:13px">${dShort(_mealViewDate)}</span>
    <button class="btn btn-ghost btn-sm" onclick="switchMealDate(1)">Próxima →</button>
  </div>
  ${!meals.length?`<div style="margin-bottom:10px;display:flex;gap:8px">
    <button class="btn btn-acc btn-sm" onclick="openDietaWizard()" style="flex:1;justify-content:center">🧬 Montar meu dia</button>
    <button class="btn btn-ghost btn-sm" onclick="copyMealTemplate()" style="flex:1;justify-content:center">📋 Copiar modelo</button>
  </div>`:''}`;
  box.innerHTML=dateNav+meals.map(m=>{
    const t=mealTotals(m);
    const foods=m.foods.map(f=>`
      <div class="row">
        <div class="name"><b>${esc(f.name)}</b>
          ${f.qty?`<span>${esc(f.qty)}</span>`:''}</div>
        <div class="pills">
          <span class="pill">${R(num(f.kcal))} kcal</span>
          ${num(f.prot)?`<span class="pill" style="color:var(--prot)">P ${R(num(f.prot))}</span>`:''}
          ${num(f.carb)?`<span class="pill" style="color:var(--carb)">C ${R(num(f.carb))}</span>`:''}
          ${num(f.fat)?`<span class="pill" style="color:var(--fat)">G ${R(num(f.fat))}</span>`:''}
        </div>
        <div class="row-actions">
          <button class="mini" onclick="openFood('${m.id}','${f.id}')">✏️</button>
          <button class="mini del" onclick="delFood('${m.id}','${f.id}')">🗑</button>
        </div>
      </div>`).join('');
    return `<div class="card">
      <div class="routine-head">
        <h3 style="flex:1;font-size:16px">${esc(m.name)}</h3>
        <button class="mini" onclick="renameMeal('${m.id}')">✏️</button>
        <button class="mini del" onclick="delMeal('${m.id}')">🗑</button>
      </div>
      <div class="meal-total">
        <span class="pill">${R(t.kcal)} kcal</span>
        <span class="pill" style="color:var(--prot)">P ${R(t.prot)}g</span>
        <span class="pill" style="color:var(--carb)">C ${R(t.carb)}g</span>
        <span class="pill" style="color:var(--fat)">G ${R(t.fat)}g</span>
      </div>
      ${foods||'<div class="routine-meta">Sem alimentos ainda.</div>'}
      <div class="add-line" style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" onclick="openFood('${m.id}')">＋ Alimento</button>
        <button class="btn btn-ghost btn-sm" onclick="mealSuggest('${m.id}')">💡 Sugestões</button>
      </div>
    </div>`;
  }).join('');
}

export function reviewDiet(){
  const meals=getMealsForDate(_mealViewDate);
  const anyFood=meals.some(m=>m.foods.length);
  if(!anyFood){showModal(`<h3>🔍 Revisão da dieta</h3><p class="sub"></p>
    <div class="why">Você ainda não adicionou alimentos. Monte suas refeições (pode usar as 💡 Sugestões) e volte que eu analiso pra você 🍽️</div>
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Ok</button></div>`);return;}
  const pl=dayTotals(),t=S.targets;
  const kdiff=t.kcal?(pl.kcal-t.kcal)/t.kcal:0,absk=Math.abs(kdiff);
  const verdict=absk>0.30?'Tá bem fora da meta 😅':absk>0.12?'Quase lá, dá pra ajustar':'Tá coerente com sua meta! 👏';
  const msgs=[];
  if(kdiff>0.12)msgs.push(`Você tem <b>${Math.round(pl.kcal)} kcal</b> planejadas, ~${Math.round(kdiff*100)}% acima da meta (${t.kcal}). Vale reduzir um pouco.`);
  else if(kdiff<-0.12)msgs.push(`Você tem <b>${Math.round(pl.kcal)} kcal</b>, ~${Math.round(-kdiff*100)}% abaixo da meta (${t.kcal}). Se o objetivo é ganhar, tá comendo pouco.`);
  else msgs.push(`Calorias batendo a meta (${Math.round(pl.kcal)} / ${t.kcal} kcal). Mandou bem 👌`);
  if(pl.prot<t.prot*0.85)msgs.push(`Proteína um pouco baixa: <b>${Math.round(pl.prot)}g</b> de ${t.prot}g. Ela sustenta o músculo — tente chegar mais perto da meta.`);
  else msgs.push(`Proteína ok: ${Math.round(pl.prot)}g (meta ${t.prot}g) 💪`);
  if(pl.fat>t.fat*1.35)msgs.push(`Gordura alta: <b>${Math.round(pl.fat)}g</b> vs ${t.fat}g. Gordura tem mais que o dobro de calorias por grama — reduzir ajuda a bater a meta sem passar fome.`);
  let carbOpts='';
  if(kdiff>0.08||pl.carb>t.carb*1.2){
    const carbHit=Math.max(0,Math.round((t.kcal-pl.prot*4-pl.fat*9)/4));
    const mid=Math.round((pl.carb+carbHit)/2);
    const opts=[{l:'Enxuto',g:carbHit,d:'bate a meta calórica'},{l:'Meio-termo',g:mid,d:'redução suave'},{l:'Manter',g:Math.round(pl.carb),d:'como está hoje'}];
    carbOpts=`<div style="font-size:12px;color:var(--acc);font-weight:800;text-transform:uppercase;margin:8px 0 8px">🍚 3 opções de carboidrato — você escolhe</div>
      ${opts.map(o=>{const kc=Math.round(pl.prot*4+pl.fat*9+o.g*4);return `<div class="opt" style="cursor:default">
        <div class="o-main"><div class="o-name">${o.l} · ${o.g}g de carbo</div><div class="o-sub">${o.d} · total ~${kc} kcal</div></div></div>`;}).join('')}
      <div class="hint" style="margin-bottom:4px">Referências pra você ajustar as refeições. A escolha é sempre sua.</div>`;
  }
  showModal(`<h3>🔍 ${verdict}</h3>
    <p class="sub">Planejado: ${Math.round(pl.kcal)} kcal · P ${Math.round(pl.prot)} · C ${Math.round(pl.carb)} · G ${Math.round(pl.fat)}g</p>
    ${msgs.map(m=>`<div class="why" style="margin:0 0 9px">💡 ${m}</div>`).join('')}
    ${carbOpts}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Entendi</button></div>`);
}
export function openTargets(){
  const g=S.targets;
  showModal(`
    <h3>Metas diárias</h3>
    <p class="sub">Defina seus alvos de macros</p>
    <div class="field"><label>Calorias (kcal)</label>
      <input id="t-kcal" type="number" inputmode="numeric" value="${g.kcal}"></div>
    <div class="grid2">
      <div class="field"><label>Proteína (g)</label>
        <input id="t-prot" type="number" inputmode="numeric" value="${g.prot}"></div>
      <div class="field"><label>Carboidrato (g)</label>
        <input id="t-carb" type="number" inputmode="numeric" value="${g.carb}"></div>
    </div>
    <div class="field"><label>Gordura (g)</label>
      <input id="t-fat" type="number" inputmode="numeric" value="${g.fat}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveTargets()">Salvar metas</button>
    </div>`);
}
export function saveTargets(){
  S.targets={
    kcal:R(num(document.getElementById('t-kcal').value))||0,
    prot:R(num(document.getElementById('t-prot').value))||0,
    carb:R(num(document.getElementById('t-carb').value))||0,
    fat:R(num(document.getElementById('t-fat').value))||0
  };
  save();renderDieta();closeModal();toast('Metas atualizadas 🎯');
}

export function openMeal(){
  showModal(`
    <h3>Nova refeição</h3>
    <p class="sub">Ex: Pré-treino, Ceia...</p>
    <div class="field"><label>Nome da refeição</label>
      <input id="m-name" placeholder="Pré-treino"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveMeal()">Criar</button>
    </div>`);
  setTimeout(()=>document.getElementById('m-name').focus(),100);
}
export function saveMeal(){
  const name=document.getElementById('m-name').value.trim();
  if(!name){toast('Dá um nome pra refeição 🍽️');return}
  const meals=ensureMealDayExists(_mealViewDate);
  meals.push({id:uid(),name,foods:[]});save();renderDieta();closeModal();toast('Refeição criada ✅');
}
export function renameMeal(id){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===id);
  showModal(`
    <h3>Renomear refeição</h3><p class="sub"></p>
    <div class="field"><label>Nome</label>
      <input id="m-name" value="${esc(m.name)}"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveMealName('${id}')">Salvar</button>
    </div>`);
  setTimeout(()=>document.getElementById('m-name').focus(),100);
}
export function saveMealName(id){
  const v=document.getElementById('m-name').value.trim();
  if(!v)return;
  const meals=S.mealDiary[_mealViewDate];
  const m=meals.find(x=>x.id===id);
  m.name=v;
  save();renderDieta();closeModal();toast('Renomeada ✅');
}
export function delMeal(id){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===id);
  if(!confirm(`Apagar a refeição "${m.name}"?`))return;
  const filtered=meals.filter(x=>x.id!==id);
  S.mealDiary[_mealViewDate]=filtered;save();renderDieta();toast('Refeição removida');
}

export function openFood(mid,fid){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===mid);
  const f=fid?m.foods.find(x=>x.id===fid):null;
  showModal(`
    <h3>${f?'Editar alimento':'Novo alimento'}</h3>
    <p class="sub">${esc(m.name)}</p>
    <div class="field"><label>Alimento</label>
      <input id="f-name" placeholder="Peito de frango" value="${f?esc(f.name):''}"></div>
    <div class="field"><label>Quantidade / porção</label>
      <input id="f-qty" placeholder="150 g" value="${f?esc(f.qty||''):''}"></div>
    <div class="grid2">
      <div class="field"><label>Calorias (kcal)</label>
        <input id="f-kcal" type="number" inputmode="decimal" placeholder="165" value="${f?esc(f.kcal):''}"></div>
      <div class="field"><label>Proteína (g)</label>
        <input id="f-prot" type="number" inputmode="decimal" placeholder="31" value="${f?esc(f.prot):''}"></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Carboidrato (g)</label>
        <input id="f-carb" type="number" inputmode="decimal" placeholder="0" value="${f?esc(f.carb):''}"></div>
      <div class="field"><label>Gordura (g)</label>
        <input id="f-fat" type="number" inputmode="decimal" placeholder="3.6" value="${f?esc(f.fat):''}"></div>
    </div>
    <div class="field"><label>Adicionar rápido (valores por 100 g)</label>
      <div class="quick-foods" id="quick-foods"></div></div>
    <p class="hint">Toque num alimento pra preencher os macros por 100 g — depois é só ajustar a quantidade. Valores aproximados (base TACO/USDA).</p>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveFood('${mid}','${fid||''}')">Salvar</button>
    </div>`);
  renderQuickFoods();
  setTimeout(()=>document.getElementById('f-name').focus(),100);
}
export function saveFood(mid,fid){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===mid);
  const name=document.getElementById('f-name').value.trim();
  if(!name){toast('Qual o alimento? 🍗');return}
  const data={
    name,
    qty:document.getElementById('f-qty').value.trim(),
    kcal:document.getElementById('f-kcal').value.trim(),
    prot:document.getElementById('f-prot').value.trim(),
    carb:document.getElementById('f-carb').value.trim(),
    fat:document.getElementById('f-fat').value.trim()
  };
  if(fid){Object.assign(m.foods.find(x=>x.id===fid),data);}
  else{m.foods.push({id:uid(),...data});}
  save();renderDieta();closeModal();toast('Alimento salvo ✅');
}
export function delFood(mid,fid){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===mid);
  m.foods=m.foods.filter(x=>x.id!==fid);save();renderDieta();toast('Alimento removido');
}

/* ============ BASE DE ALIMENTOS (por 100 g) ============ */
export function renderQuickFoods(){
  const box=document.getElementById('quick-foods');if(!box)return;
  box.innerHTML=FOODS.map((f,i)=>`<button type="button" onclick="fillFood(${i})">${esc(f[0])}</button>`).join('');
}
export function fillFood(i){
  const f=FOODS[i];
  document.getElementById('f-name').value=f[0];
  if(!document.getElementById('f-qty').value.trim())document.getElementById('f-qty').value='100 g';
  document.getElementById('f-kcal').value=f[1];
  document.getElementById('f-prot').value=f[2];
  document.getElementById('f-carb').value=f[3];
  document.getElementById('f-fat').value=f[4];
  toast(f[0]+' · valores por 100 g');
}

/* ============ RESTRIÇÕES + COMBOS DE REFEIÇÃO ============ */
export function detectCat(name){const n=(name||'').toLowerCase();
  if(/caf|manh/.test(n))return'cafe';if(/almo/.test(n))return'almoco';
  if(/lanch|pré|pre|ceia|tarde/.test(n))return'lanche';if(/jant|noite/.test(n))return'janta';return'';}
export function comboAllowed(c){
  const r=(S.profile&&S.profile.restrictions)||[];
  if(r.includes('lactose')&&c.tags.lac)return false;
  if(r.includes('gluten')&&c.tags.glu)return false;
  if(r.includes('vegetariano')&&c.tags.meat)return false;
  if(r.includes('vegano')&&(c.tags.meat||c.tags.lac||c.tags.egg))return false;
  return true;
}
export function comboTotals(c){return c.foods.reduce((a,f)=>({k:a.k+f.kcal,p:a.p+f.prot,cb:a.cb+f.carb,ft:a.ft+f.fat}),{k:0,p:0,cb:0,ft:0});}
export function mealSuggest(mid){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===mid);const cat=detectCat(m.name);
  let idxs=COMBOS.map((c,i)=>i).filter(i=>(!cat||COMBOS[i].cat===cat)&&comboAllowed(COMBOS[i]));
  if(!idxs.length)idxs=COMBOS.map((c,i)=>i).filter(i=>comboAllowed(COMBOS[i]));
  const r=(S.profile&&S.profile.restrictions)||[];
  showModal(`
    <h3>Sugestões${cat?' de '+CATLABEL[cat].toLowerCase():''}</h3>
    <p class="sub">${esc(m.name)} · toque pra adicionar tudo e depois edite o que quiser${r.length?' · filtrado p/ suas restrições':''}</p>
    ${idxs.map(i=>{const c=COMBOS[i],t=comboTotals(c);return `
      <div class="opt" style="cursor:pointer;align-items:flex-start" onclick="addCombo('${mid}',${i})">
        <div class="radio" style="border-radius:8px;border:none;background:var(--acc);color:#0a0a0a;font-weight:900;margin-top:2px">＋</div>
        <div class="o-main"><div class="o-name">${esc(c.name)}</div>
          <div class="o-sub">${c.foods.map(f=>esc(f.name)).join(' · ')}</div>
          <div class="meal-total" style="margin-top:7px">
            <span class="pill">${Math.round(t.k)} kcal</span>
            <span class="pill" style="color:var(--prot)">P ${Math.round(t.p)}g</span>
            <span class="pill" style="color:var(--carb)">C ${Math.round(t.cb)}g</span>
            <span class="pill" style="color:var(--fat)">G ${Math.round(t.ft)}g</span>
          </div></div>
      </div>`;}).join('')}
    <div class="modal-actions"><button class="btn btn-acc" style="flex:1;justify-content:center" onclick="closeModal()">Concluir</button></div>`);
}
export function addCombo(mid,i){
  const meals=ensureMealDayExists(_mealViewDate);
  const m=meals.find(x=>x.id===mid);const c=COMBOS[i];
  c.foods.forEach(f=>m.foods.push({id:uid(),name:f.name,qty:f.qty,kcal:String(f.kcal),prot:String(f.prot),carb:String(f.carb),fat:String(f.fat)}));
  save();renderDieta();closeModal();toast(c.name+' adicionado 🍽️');
}
export function switchMealDate(days){
  const d=parseLocalDate(_mealViewDate);
  d.setDate(d.getDate()+days);
  _mealViewDate=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  renderDieta();
}
export function copyMealTemplate(){
  copyTemplateToDay(_mealViewDate);
  renderDieta();
  toast('Modelo copiado pro dia 📋');
}
