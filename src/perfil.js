import {S,save,num,esc,uid} from './state.js';
import {toast,showModal,closeModal,go} from './ui.js';
import {RESTR} from './data/alimentos.js';
import {renderDieta} from './dieta.js';
import {renderRoutines} from './treino.js';

/* ============ PERFIL / ANAMNESE ============ */
export const GOALS=[
  {k:'perder',label:'Perder peso',emoji:'🔥'},{k:'massa',label:'Ganhar massa',emoji:'💪'},
  {k:'peso',label:'Ganhar peso',emoji:'⬆️'},{k:'forca',label:'Ganhar força',emoji:'🏋️'},
  {k:'definir',label:'Definição',emoji:'✨'},{k:'prova',label:'Preparar p/ prova',emoji:'🏁'},
  {k:'forte',label:'Fortalecimento',emoji:'🧱'},{k:'esporte',label:'Outro esporte',emoji:'⚽'}
];
export const LEVELS=[{k:'ini',label:'Iniciante'},{k:'int',label:'Intermediário'},{k:'avc',label:'Avançado'}];
// Fatores de NEAT (dia a dia SEM treino) — o treino é somado à parte, com teto.
export const LIFE=[
  {k:'sed',label:'Sedentário',pal:1.20,d:'trabalho sentado'},
  {k:'lev',label:'Leve',pal:1.30,d:'anda um pouco'},
  {k:'mod',label:'Moderado',pal:1.40,d:'em pé / andando'},
  {k:'ati',label:'Ativo',pal:1.50,d:'trabalho físico'}
];
export const goalLabel=k=>(GOALS.find(g=>g.k===k)||{}).label||'—';

export function computeMetrics(p){
  const W=num(p.weight),H=num(p.height),A=num(p.age);
  const bmr=p.sex==='F'?(10*W+6.25*H-5*A-161):(10*W+6.25*H-5*A+5);
  const basePal=(LIFE.find(l=>l.k===p.lifestyle)||{pal:1.30}).pal;
  const sessions=num(p.trainDays)+num(p.otherDays);
  // acréscimo modesto por sessão de treino (~0,04), com teto p/ não estourar a faixa validada (máx 1,80)
  const palAdd=Math.min(sessions*0.04,0.25);
  const pal=Math.min(basePal+palAdd,1.80);
  return {W,bmr:Math.round(bmr),pal:+pal.toFixed(2),tdee:Math.round(bmr*pal),sessions,basePal};
}
export function gcat(g){if(g==='perder'||g==='definir')return'cut';if(g==='massa'||g==='peso')return'bulk';return'perf';}
const r10=v=>Math.round(v/10)*10;
export function calorieOptions(tdee,goal){
  const c=gcat(goal);
  if(c==='cut')return[
    {key:'a',label:'Déficit leve',sub:'−10% · preserva massa magra',kcal:r10(tdee*0.90),rec:goal==='definir'?35:30},
    {key:'b',label:'Déficit moderado',sub:'−20% · ritmo equilibrado',kcal:r10(tdee*0.80),rec:45},
    {key:'c',label:'Déficit agressivo',sub:'−25% · rápido, risco de perder massa',kcal:r10(tdee*0.75),rec:goal==='definir'?20:25}];
  if(c==='bulk')return[
    {key:'a',label:'Superávit limpo',sub:'+5% · ganho mais magro',kcal:r10(tdee*1.05),rec:goal==='massa'?50:35},
    {key:'b',label:'Superávit moderado',sub:'+10% · equilíbrio massa/gordura',kcal:r10(tdee*1.10),rec:35},
    {key:'c',label:'Superávit alto',sub:'+15% · ganha rápido, mais gordura',kcal:r10(tdee*1.15),rec:goal==='massa'?15:30}];
  return[
    {key:'a',label:'Manutenção',sub:'≈ seu gasto · recomposição',kcal:r10(tdee),rec:35},
    {key:'b',label:'Leve superávit',sub:'+8% · suporta força e performance',kcal:r10(tdee*1.08),rec:45},
    {key:'c',label:'Leve déficit',sub:'−8% · enxuga mantendo o treino',kcal:r10(tdee*0.92),rec:20}];
}
export function proteinOptions(W,goal){
  const c=gcat(goal);
  const recs=c==='cut'?{a:15,b:35,c:50}:c==='bulk'?{a:25,b:50,c:25}:{a:30,b:45,c:25};
  const labels={a:'Base eficaz',b:'Recomendado geral',c:'Alta (cutting/avançado)'};
  return[1.6,1.9,2.2].map((gkg,i)=>{const key='abc'[i];return{key,gkg,g:Math.round(W*gkg),rec:recs[key],label:labels[key]};});
}
export function fatOptions(W,goal){
  const recs={a:30,b:50,c:20};
  const labels={a:'Mínimo saudável',b:'Equilibrado',c:'Mais gordura, menos carbo'};
  return[0.8,1.0,1.2].map((gkg,i)=>{const key='abc'[i];return{key,gkg,g:Math.round(W*gkg),rec:recs[key],label:labels[key]};});
}
export function applyChoices(){
  const p=S.profile;if(!p)return;
  const m=computeMetrics(p);
  const cO=calorieOptions(m.tdee,p.goal),pO=proteinOptions(m.W,p.goal),fO=fatOptions(m.W,p.goal);
  let kcal,prot,fat;
  if(S.choices.kcal==='custom'&&S.choices.kcalCustom)kcal=S.choices.kcalCustom;
  else kcal=(cO.find(o=>o.key===S.choices.kcal)||cO[1]).kcal;
  if(S.choices.prot==='custom'&&S.choices.protCustom)prot=S.choices.protCustom;
  else prot=(pO.find(o=>o.key===S.choices.prot)||pO[1]).g;
  if(S.choices.fat==='custom'&&S.choices.fatCustom)fat=S.choices.fatCustom;
  else fat=(fO.find(o=>o.key===S.choices.fat)||fO[1]).g;
  const carb=Math.max(0,Math.round((kcal-prot*4-fat*9)/4));
  S.targets={kcal,prot,carb,fat};save();
}
export function pickOpt(type,key){S.choices[type]=key;applyChoices();renderPerfil();renderDieta();}
export function openCustomKcal(){
  const m=S.profile?computeMetrics(S.profile):null;
  showModal(`<h3>Calorias personalizadas</h3><p class="sub">A escolha é sua. ${m?'Seu gasto estimado é ~'+m.tdee+' kcal.':''}</p>
    <div class="field"><label>Calorias por dia (kcal)</label>
      <input id="ck" type="number" inputmode="numeric" step="10" placeholder="${m?m.tdee:'2500'}" value="${S.choices.kcalCustom||''}"></div>
    <p class="hint">Proteína e gordura seguem suas escolhas; o carboidrato preenche o resto.</p>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveCustomKcal()">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('ck').focus(),100);
}
export function saveCustomKcal(){
  const v=Math.round(num(document.getElementById('ck').value));
  if(!v){toast('Digite um valor');return;}
  S.choices.kcal='custom';
  S.choices.kcalCustom=v;
  applyChoices();renderPerfil();renderDieta();closeModal();
  toast('Meta personalizada: '+v+' kcal ✅');
}
export function openCustomMacro(type){
  const isP=type==='prot';const cur=isP?S.choices.protCustom:S.choices.fatCustom;
  const w=S.profile?num(S.profile.weight):0;
  showModal(`<h3>${isP?'Proteína':'Gordura'} personalizada</h3><p class="sub">A escolha é sua.${w?' Seu peso: '+w+' kg.':''}</p>
    <div class="field"><label>${isP?'Proteína':'Gordura'} (gramas por dia)</label>
      <input id="cm" type="number" inputmode="numeric" step="1" placeholder="${w?(isP?Math.round(w*1.8):Math.round(w)):(isP?'150':'70')}" value="${cur||''}"></div>
    <p class="hint">${isP?'Referência: 1,6 a 2,2 g por kg pra quem treina.':'Referência: 0,8 a 1,2 g por kg.'} O carboidrato preenche o resto das calorias.</p>
    <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
    <button class="btn btn-acc" onclick="saveCustomMacro('${type}')">Salvar</button></div>`);
  setTimeout(()=>document.getElementById('cm').focus(),100);
}
export function saveCustomMacro(type){
  const v=Math.round(num(document.getElementById('cm').value));
  if(!v){toast('Digite um valor');return;}
  if(type==='prot'){S.choices.prot='custom';S.choices.protCustom=v;}
  else{S.choices.fat='custom';S.choices.fatCustom=v;}
  applyChoices();renderPerfil();renderDieta();closeModal();toast('Meta personalizada ✅');
}

export function splitOptions(p){
  let d=Math.max(2,Math.min(6,num(p.trainDays)||3));
  const ini=p.level==='ini';
  const mk=(label,focus,nm)=>({label,focus,name:nm||('Treino '+label),exercises:[]});
  const FB=l=>mk(l,'Corpo todo','Treino '+l+' (Full Body)');
  const PRESETS={
    2:[
      {key:'a',name:'Full Body 2x',sub:'Corpo todo, 2 dias',rec:55,sk:[FB('A'),FB('B')]},
      {key:'b',name:'Superior / Inferior',sub:'1 dia de cima, 1 de baixo',rec:30,sk:[mk('A','Peito, Costas, Ombro, Braços','Treino A — Superiores'),mk('B','Pernas, Glúteo, Core','Treino B — Inferiores')]},
      {key:'c',name:'Full Body + foco',sub:'Corpo todo com ênfase',rec:15,sk:[FB('A'),FB('B')]}
    ],
    3:[
      {key:'a',name:'Full Body 3x',sub:'Corpo todo, 3 dias',rec:ini?55:30,sk:[FB('A'),FB('B'),FB('C')]},
      {key:'b',name:'Push / Pull / Legs',sub:'Empurrar / Puxar / Pernas',rec:ini?25:45,sk:[mk('A','Peito, Ombro, Tríceps','Treino A — Push'),mk('B','Costas, Bíceps','Treino B — Pull'),mk('C','Pernas, Glúteo','Treino C — Legs')]},
      {key:'c',name:'ABC clássico',sub:'Peito+Tri / Costas+Bi / Perna+Ombro',rec:25,sk:[mk('A','Peito, Tríceps','Treino A'),mk('B','Costas, Bíceps','Treino B'),mk('C','Pernas, Ombro','Treino C')]}
    ],
    4:[
      {key:'a',name:'Superior / Inferior 4x',sub:'2 de cima, 2 de baixo',rec:50,sk:[mk('A','Peito, Ombro, Tríceps','Treino A — Superior'),mk('B','Quadríceps, Glúteo, Posterior','Treino B — Inferior'),mk('C','Costas, Bíceps','Treino C — Superior'),mk('D','Pernas, Panturrilha, Core','Treino D — Inferior')]},
      {key:'b',name:'ABCD',sub:'4 grupos divididos',rec:30,sk:[mk('A','Peito, Tríceps'),mk('B','Costas, Bíceps'),mk('C','Pernas, Glúteo'),mk('D','Ombro, Core')]},
      {key:'c',name:'PPL + Upper',sub:'Push/Pull/Legs + corpo de cima',rec:20,sk:[mk('A','Peito, Ombro, Tríceps','Treino A — Push'),mk('B','Costas, Bíceps','Treino B — Pull'),mk('C','Pernas, Glúteo','Treino C — Legs'),mk('D','Peito, Costas, Ombro, Braços','Treino D — Upper')]}
    ],
    5:[
      {key:'a',name:'ABCDE',sub:'5 grupos, 1 por dia',rec:40,sk:[mk('A','Peito'),mk('B','Costas'),mk('C','Pernas'),mk('D','Ombro'),mk('E','Braços e Core')]},
      {key:'b',name:'Upper/Lower + PPL',sub:'Híbrido alta frequência',rec:40,sk:[mk('A','Peito, Costas, Ombro, Braços','Treino A — Upper'),mk('B','Pernas, Glúteo, Core','Treino B — Lower'),mk('C','Peito, Ombro, Tríceps','Treino C — Push'),mk('D','Costas, Bíceps','Treino D — Pull'),mk('E','Pernas, Glúteo','Treino E — Legs')]},
      {key:'c',name:'Push/Pull/Legs/Upper/Lower',sub:'5 estímulos variados',rec:20,sk:[mk('A','Peito, Ombro, Tríceps','Treino A — Push'),mk('B','Costas, Bíceps','Treino B — Pull'),mk('C','Pernas','Treino C — Legs'),mk('D','Peito, Costas, Ombro, Braços','Treino D — Upper'),mk('E','Pernas, Core','Treino E — Lower')]}
    ],
    6:[
      {key:'a',name:'PPL 6x',sub:'Push/Pull/Legs duas vezes',rec:50,sk:[mk('A','Peito, Ombro, Tríceps','Treino A — Push'),mk('B','Costas, Bíceps','Treino B — Pull'),mk('C','Pernas, Glúteo','Treino C — Legs'),mk('D','Peito, Ombro, Tríceps','Treino D — Push'),mk('E','Costas, Bíceps','Treino E — Pull'),mk('F','Pernas, Glúteo','Treino F — Legs')]},
      {key:'b',name:'ABCDEF',sub:'6 grupos divididos',rec:30,sk:[mk('A','Peito'),mk('B','Costas'),mk('C','Pernas'),mk('D','Ombro'),mk('E','Braços'),mk('F','Posterior e Core')]},
      {key:'c',name:'Upper/Lower 3x',sub:'Alta frequência por grupo',rec:20,sk:[mk('A','Peito, Costas, Ombro, Braços','Treino A — Upper'),mk('B','Pernas, Glúteo, Core','Treino B — Lower'),mk('C','Peito, Costas, Ombro, Braços','Treino C — Upper'),mk('D','Pernas, Glúteo, Core','Treino D — Lower'),mk('E','Peito, Costas, Ombro, Braços','Treino E — Upper'),mk('F','Pernas, Glúteo, Core','Treino F — Lower')]}
    ]
  };
  return PRESETS[d];
}
export function scaffoldSplit(di,oi){
  const opts=splitOptions(S.profile);const opt=opts[oi];
  if(S.routines.length && !confirm('Isso vai adicionar '+opt.sk.length+' treinos pra você preencher. Continuar?'))return;
  opt.sk.forEach(s=>S.routines.push({id:uid(),name:s.name,label:s.label,focus:s.focus,exercises:[],created:Date.now()}));
  save();renderRoutines();closeModal();toast('Divisão criada! Agora monte os exercícios 💪');go('treino');
}
export function splitCardsHTML(){
  const p=S.profile;if(!p)return '';
  const sp=splitOptions(p);
  const otherNote=num(p.otherDays)>=3?`<div class="why">⚽ Como você faz outro esporte ${p.otherDays}x/semana, vale priorizar as opções de <b>menor volume na academia</b> pra recuperar bem.</div>`:'';
  return otherNote+sp.map((o,i)=>{
    const recCls=o.rec>=45?'hi':o.rec>=30?'mid':'';
    const dias=o.sk.map(s=>`<div style="font-size:12px;margin-top:4px">• <b>${esc(s.name)}</b>${s.focus?`<span style="color:var(--mut)">: ${esc(s.focus)}</span>`:''}</div>`).join('');
    return `<div class="opt" style="cursor:default;align-items:flex-start">
      ${o.rec>=45?'<span class="badge-best">+ INDICADO</span>':''}
      <div class="o-main"><div class="o-name">${o.name} <span class="rec ${recCls}">${o.rec}% indicado</span></div>
        <div class="o-sub">${o.sub} · ${o.sk.length} dias</div>
        <div style="margin-top:8px">${dias}</div>
        <button class="btn btn-acc btn-sm" style="margin-top:11px" onclick="scaffoldSplit(0,${i})">Usar esta divisão</button>
      </div></div>`;
  }).join('');
}

export function renderPerfil(){
  const body=document.getElementById('perfil-body');
  const sub=document.getElementById('perfil-sub');
  if(!body)return;
  const p=S.profile;
  if(!p){
    sub.textContent='Conte sobre você pra começar';
    body.innerHTML=`<div class="card profile-cta">
      <div class="big">🧬</div>
      <h3>Vamos te conhecer</h3>
      <p>O GymBro não passa dieta nem treino pronto.<br>
      Ele calcula tudo a partir dos seus dados e te mostra as <b>melhores opções com base em evidência</b> — você escolhe e monta do seu jeito.</p>
      <button class="btn btn-acc" style="margin:0 auto" onclick="openProfileForm()">Começar questionário</button>
    </div>`;
    return;
  }
  const m=computeMetrics(p);
  const cO=calorieOptions(m.tdee,p.goal),pO=proteinOptions(m.W,p.goal),fO=fatOptions(m.W,p.goal);
  const t=S.targets;
  sub.textContent=`${goalLabel(p.goal)} · ${p.weight} kg`;

  const optCard=(o,type,sel,valHtml,subHtml)=>{
    const recCls=o.rec>=45?'hi':o.rec>=30?'mid':'';
    return `<div class="opt ${sel?'sel':''}" onclick="pickOpt('${type}','${o.key}')">
      ${o.rec>=45?'<span class="badge-best">+ RECOMENDADO</span>':''}
      <div class="radio"></div>
      <div class="o-main"><div class="o-name">${o.label||''} <span class="rec ${recCls}">${o.rec}% indicado</span></div>
        <div class="o-sub">${subHtml||o.sub||''}</div></div>
      <div class="o-val">${valHtml}</div>
    </div>`;
  };

  const otherNote=num(p.otherDays)>=3?`<div class="why">⚽ Como você faz outro esporte ${p.otherDays}x/semana, vale priorizar as opções de <b>menor volume na academia</b> pra recuperar bem e render nos dois.</div>`:'';

  body.innerHTML=`
    <div class="card">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <b style="font-size:15px">📊 Seus números</b>
        <button class="btn btn-ghost btn-sm" onclick="openProfileForm()">✏️ Editar</button>
      </div>
      <div class="stat-grid">
        <div class="stat"><div class="v">${m.bmr}</div><div class="l">TMB (kcal)</div></div>
        <div class="stat"><div class="v">${m.tdee}</div><div class="l">Gasto/dia</div></div>
        <div class="stat"><div class="v">${m.pal}</div><div class="l">Fator ativ.</div></div>
      </div>
      <div class="why">Seu <b>gasto diário (~${m.tdee} kcal)</b> usa a equação <b>Mifflin-St Jeor</b> (a mais recomendada pela nutrição) com fator de atividade ${m.pal}. É uma <b>estimativa</b> — o número real você confirma acompanhando seu peso por 2–3 semanas e ajustando se precisar. Registre o peso na aba Progresso que tudo recalcula sozinho.</div>
    </div>

    <div class="card">
      <div class="sug-block">
        <div class="title">🔥 Calorias por dia</div>
        <div class="desc">Pra <b>${goalLabel(p.goal).toLowerCase()}</b>, partindo do seu gasto de ${m.tdee} kcal. Escolha o ritmo:</div>
        ${cO.map(o=>optCard(o,'kcal',S.choices.kcal===o.key,`<div class="big">${o.kcal}</div><div class="unit">kcal</div>`)).join('')}
        <div class="opt ${S.choices.kcal==='custom'?'sel':''}" onclick="openCustomKcal()">
          <div class="radio"></div>
          <div class="o-main"><div class="o-name">✍️ Personalizar</div>
            <div class="o-sub">Você decide — digite o valor exato que quer</div></div>
          <div class="o-val"><div class="big">${S.choices.kcal==='custom'&&S.choices.kcalCustom?S.choices.kcalCustom:'––'}</div><div class="unit">kcal</div></div>
        </div>
      </div>

      <div class="sug-block">
        <div class="title">🥩 Proteína</div>
        <div class="desc">Evidência aponta <b>1,6 a 2,2 g por kg</b> de peso pra quem treina. Você pesa ${p.weight} kg:</div>
        ${pO.map(o=>optCard(o,'prot',S.choices.prot===o.key,`<div class="big">${o.g}g</div><div class="unit">${o.gkg} g/kg</div>`,'&nbsp;')).join('')}
        <div class="opt ${S.choices.prot==='custom'?'sel':''}" onclick="openCustomMacro('prot')">
          <div class="radio"></div>
          <div class="o-main"><div class="o-name">✍️ Personalizar</div><div class="o-sub">Você decide os gramas de proteína</div></div>
          <div class="o-val"><div class="big">${S.choices.prot==='custom'&&S.choices.protCustom?S.choices.protCustom+'g':'––'}</div><div class="unit">proteína</div></div>
        </div>
      </div>

      <div class="sug-block">
        <div class="title">🥑 Gordura</div>
        <div class="desc">Margem saudável: <b>0,8 a 1,2 g por kg</b>. O resto das calorias vira carboidrato (sua energia):</div>
        ${fO.map(o=>optCard(o,'fat',S.choices.fat===o.key,`<div class="big">${o.g}g</div><div class="unit">${o.gkg} g/kg</div>`,'&nbsp;')).join('')}
        <div class="opt ${S.choices.fat==='custom'?'sel':''}" onclick="openCustomMacro('fat')">
          <div class="radio"></div>
          <div class="o-main"><div class="o-name">✍️ Personalizar</div><div class="o-sub">Você decide os gramas de gordura</div></div>
          <div class="o-val"><div class="big">${S.choices.fat==='custom'&&S.choices.fatCustom?S.choices.fatCustom+'g':'––'}</div><div class="unit">gordura</div></div>
        </div>
      </div>

      <div class="applied-note">✅ Suas metas: <b>${t.kcal} kcal · ${t.prot}g proteína · ${t.carb}g carbo · ${t.fat}g gordura</b> — já aplicadas na aba Dieta.</div>
    </div>

    <div class="card">
      <div class="sug-block" style="margin-bottom:6px">
        <div class="title">🗓️ Divisão de treino sugerida</div>
        <div class="desc">Você marcou <b>${p.trainDays||'?'}x/semana</b> na academia${num(p.otherDays)?` + ${p.otherDays}x de ${esc(p.otherSport||'outro esporte')}`:''}. Opções pro seu nível (${(LEVELS.find(l=>l.k===p.level)||{}).label}):</div>
        ${splitCardsHTML()}
      </div>
    </div>

    <div class="card">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex:1"><b style="font-size:15px">🔍 Revisão do treino</b>
          <div style="color:var(--mut);font-size:12.5px;margin-top:3px">Terminou de montar? O GymBro analisa o equilíbrio e sugere ajustes.</div></div>
      </div>
      <button class="btn btn-acc" style="width:100%;justify-content:center;margin-top:12px" onclick="reviewWorkout()">Pedir revisão 🔍</button>
    </div>`;
}

export function chipRow(name,arr,sel,keyField,labelField){
  return `<div class="chip-pick">${arr.map(o=>{
    const k=keyField?o[keyField]:o;const l=labelField?o[labelField]:o;
    return `<button type="button" data-g="${name}" data-k="${k}" class="${sel===k?'on':''}" onclick="chipPick(this)">${l}</button>`;
  }).join('')}</div>`;
}
export function chipPick(btn){
  const g=btn.getAttribute('data-g');
  document.querySelectorAll('[data-g="'+g+'"]').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}
export function chipVal(g){const b=document.querySelector('[data-g="'+g+'"].on');return b?b.getAttribute('data-k'):'';}

export function openProfileForm(){
  const p=S.profile||{};
  showModal(`
    <h3>${S.profile?'Editar perfil':'Seu perfil'}</h3>
    <p class="sub">Tudo é calculado a partir daqui. Pode editar quando quiser.</p>
    <div class="field"><label>Sexo (pro cálculo de gasto)</label>
      ${chipRow('sex',[{k:'M',l:'Masculino'},{k:'F',l:'Feminino'}],p.sex||'M','k','l')}</div>
    <div class="grid2">
      <div class="field"><label>Idade</label><input id="p-age" type="number" inputmode="numeric" placeholder="25" value="${p.age||''}"></div>
      <div class="field"><label>Altura (cm)</label><input id="p-height" type="number" inputmode="numeric" placeholder="175" value="${p.height||''}"></div>
    </div>
    <div class="field"><label>Peso atual (kg)</label><input id="p-weight" type="number" inputmode="decimal" step="0.1" placeholder="75" value="${p.weight||''}"></div>
    <div class="field"><label>Seu objetivo principal</label>
      ${chipRow('goal',GOALS.map(g=>({k:g.k,l:g.emoji+' '+g.label})),p.goal||'massa','k','l')}</div>
    <div class="field"><label>Nível na musculação</label>
      ${chipRow('level',LEVELS,p.level||'ini','k','label')}</div>
    <div class="grid2">
      <div class="field"><label>Treina há quanto tempo (meses)</label><input id="p-months" type="number" inputmode="numeric" placeholder="6" value="${p.months||''}"></div>
      <div class="field"><label>Treinos/semana</label><input id="p-train" type="number" inputmode="numeric" placeholder="4" value="${p.trainDays||''}"></div>
    </div>
    <div class="grid2">
      <div class="field"><label>Outro esporte? Qual</label><input id="p-sport" placeholder="Futebol" value="${esc(p.otherSport||'')}"></div>
      <div class="field"><label>Quantas vezes/sem</label><input id="p-other" type="number" inputmode="numeric" placeholder="2" value="${p.otherDays||''}"></div>
    </div>
    <div class="field"><label>Rotina no dia a dia (fora treino)</label>
      ${chipRow('life',LIFE.map(l=>({k:l.k,l:l.label})),p.lifestyle||'lev','k','l')}</div>
    <div class="field"><label>Restrições alimentares (pode marcar várias)</label>
      <div class="chip-pick">${RESTR.map(o=>`<button type="button" class="restr ${(p.restrictions||[]).includes(o.k)?'on':''}" data-k="${o.k}" onclick="this.classList.toggle('on')">${o.l}</button>`).join('')}</div></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="saveProfile()">Salvar perfil</button>
    </div>`);
}
export function saveProfile(){
  const weight=document.getElementById('p-weight').value.trim();
  const height=document.getElementById('p-height').value.trim();
  if(!weight||!height){toast('Preencha peso e altura 📏');return}
  S.profile={
    sex:chipVal('sex')||'M',
    age:document.getElementById('p-age').value.trim()||'25',
    height,weight,
    goal:chipVal('goal')||'massa',
    level:chipVal('level')||'ini',
    months:document.getElementById('p-months').value.trim(),
    trainDays:document.getElementById('p-train').value.trim()||'3',
    otherSport:document.getElementById('p-sport').value.trim(),
    otherDays:document.getElementById('p-other').value.trim()||'0',
    lifestyle:chipVal('life')||'lev',
    restrictions:Array.from(document.querySelectorAll('.restr.on')).map(b=>b.getAttribute('data-k'))
  };
  applyChoices();renderPerfil();renderDieta();renderRoutines();closeModal();
  // Onboarding: primeira vez (sem treinos) emenda direto no gerador
  if(!S.routines.length){
    showModal(`<h3>✅ Perfil pronto!</h3>
      <p class="sub">Metas de calorias e macros já calculadas.</p>
      <div class="why">Agora deixa comigo: eu monto seu treino completo — exercícios, séries, repetições e descanso — com base no seu perfil e em estudos do PubMed. Você só confirma 3 escolhas.</div>
      <div class="modal-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Depois</button>
        <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="go('treino');openGeradorWizard()">🧬 Montar meu treino</button>
      </div>`);
  }else toast('Perfil salvo! Metas recalculadas ✅');
}
