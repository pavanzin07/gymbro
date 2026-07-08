import {S,save,uid,esc} from './state.js';
import {toast,showModal,closeModal,go} from './ui.js';
import {EXLIB} from './data/exercicios.js';
import {EVID,evidLink} from './data/evidencia.js';
import {renderRoutines} from './treino.js';
import {gcat} from './perfil.js';

/* ============ GERADOR DE TREINO INTELIGENTE ============
   Monta um programa completo a partir de 3 escolhas guiadas (todas
   pré-selecionadas pelo perfil). Cada decisão tem lastro na base de
   evidências (data/evidencia.js). Lógica pura: gerarPrograma(). */

export const FOCOS={
  forca:{k:'forca',label:'Força',emoji:'🏋️',desc:'Cargas altas, poucas reps, descansos longos',
    repsComp:'4-6',repsIso:'8-10',restComp:180,restIso:120,setsComp:4,setsIso:3},
  hipertrofia:{k:'hipertrofia',label:'Massa muscular',emoji:'💪',desc:'O clássico 6-12 reps com boa técnica',
    repsComp:'6-10',repsIso:'10-15',restComp:120,restIso:90,setsComp:3,setsIso:3},
  resistencia:{k:'resistencia',label:'Resistência',emoji:'🔥',desc:'Mais reps, menos descanso, muito suor',
    repsComp:'12-15',repsIso:'15-20',restComp:75,restIso:60,setsComp:3,setsIso:3}
};
export const VOLUMES={
  leve:{k:'leve',label:'Começar leve',desc:'~10 séries semanais por grupo — ideal pra criar o hábito',fator:0.7},
  padrao:{k:'padrao',label:'Equilibrado',desc:'~14 séries semanais por grupo — o ponto doce da ciência',fator:1},
  alto:{k:'alto',label:'Puxado',desc:'~18 séries semanais por grupo — pra quem já tem rodagem',fator:1.3}
};

// Dias do split: slots [grupo, 'c'(omposto)|'i'(solado)] em ordem de execução.
// Compostos primeiro (evidência: ordem de exercícios).
const DIAS={
  fbA:{name:'Full Body A',label:'A',focus:'Corpo todo',slots:[['Pernas','c'],['Peito','c'],['Costas','c'],['Ombro','i'],['Bíceps','i'],['Core','i']]},
  fbB:{name:'Full Body B',label:'B',focus:'Corpo todo',slots:[['Pernas','c'],['Costas','c'],['Peito','c'],['Ombro','c'],['Tríceps','i'],['Core','i']]},
  fbC:{name:'Full Body C',label:'C',focus:'Corpo todo',slots:[['Pernas','c'],['Peito','c'],['Costas','c'],['Bíceps','i'],['Tríceps','i'],['Ombro','i']]},
  upA:{name:'Superiores A',label:'A',focus:'Peito, Costas, Ombro e braços',slots:[['Peito','c'],['Costas','c'],['Ombro','c'],['Costas','i'],['Bíceps','i'],['Tríceps','i']]},
  loA:{name:'Inferiores A',label:'B',focus:'Pernas e Core',slots:[['Pernas','c'],['Pernas','c'],['Pernas','i'],['Pernas','i'],['Core','i']]},
  upB:{name:'Superiores B',label:'C',focus:'Peito, Costas, Ombro e braços',slots:[['Costas','c'],['Peito','c'],['Ombro','c'],['Peito','i'],['Tríceps','i'],['Bíceps','i']]},
  loB:{name:'Inferiores B',label:'D',focus:'Pernas e Core',slots:[['Pernas','c'],['Pernas','c'],['Pernas','i'],['Pernas','i'],['Core','i']]},
  push:{name:'Push (empurrar)',label:'A',focus:'Peito, Ombro e Tríceps',slots:[['Peito','c'],['Ombro','c'],['Peito','i'],['Ombro','i'],['Tríceps','i'],['Tríceps','i']]},
  pull:{name:'Pull (puxar)',label:'B',focus:'Costas e Bíceps',slots:[['Costas','c'],['Costas','c'],['Costas','i'],['Bíceps','i'],['Bíceps','i'],['Core','i']]},
  legs:{name:'Legs (pernas)',label:'C',focus:'Pernas e Core',slots:[['Pernas','c'],['Pernas','c'],['Pernas','i'],['Pernas','i'],['Core','i']]}
};
export const SPLITS={
  2:{nome:'Full Body 2x',dias:['fbA','fbB'],desc:'Corpo inteiro nos dois dias — máximo retorno por sessão'},
  3:{nome:'Full Body ABC',dias:['fbA','fbB','fbC'],desc:'Cada músculo trabalhado 3x por semana'},
  4:{nome:'Superior / Inferior',dias:['upA','loA','upB','loB'],desc:'Metade de cima e de baixo, 2x cada'},
  5:{nome:'Push · Pull · Legs +',dias:['push','pull','legs','upA','loA'],desc:'O split favorito das academias, com frequência 2x'}
};

// Seleção de exercício: compostos por nota (g) desc, isolados idem.
// offset varia a escolha entre dias pro programa não repetir sempre o mesmo.
function pickEx(grp,tipo,usados,offset){
  const pool=(EXLIB[grp]||[]).filter(e=>tipo==='c'?e.c===1:e.c===0).sort((a,b)=>b.g-a.g);
  if(!pool.length)return null;
  for(let i=0;i<pool.length;i++){
    const ex=pool[(i+offset)%pool.length];
    if(!usados.has(ex.n)){usados.add(ex.n);return ex;}
  }
  return null;
}

export function gerarPrograma({dias=3,foco='hipertrofia',volume='padrao'}={}){
  const split=SPLITS[Math.min(5,Math.max(2,dias))];
  const F=FOCOS[foco]||FOCOS.hipertrofia;
  const V=VOLUMES[volume]||VOLUMES.padrao;
  const routines=split.dias.map((key,di)=>{
    const d=DIAS[key];
    // volume: leve corta os últimos slots isolados; alto adiciona um isolado extra
    let slots=[...d.slots];
    if(V.fator<1)slots=slots.slice(0,Math.max(3,Math.round(slots.length*V.fator)));
    if(V.fator>1){
      const extra=slots.find(s=>s[1]==='c'); // mais um isolado do primeiro grupo grande do dia
      if(extra)slots=[...slots,[extra[0],'i']];
    }
    const usados=new Set();
    const exercises=slots.map(([grp,tipo])=>{
      const ex=pickEx(grp,tipo,usados,di);
      if(!ex)return null;
      const comp=tipo==='c';
      return{id:uid(),name:ex.n,musc:grp,
        sets:String(comp?F.setsComp:F.setsIso),
        reps:comp?F.repsComp:F.repsIso,
        rest:String(comp?F.restComp:F.restIso),
        load:'',note:'',history:[]};
    }).filter(Boolean);
    // compostos primeiro (evidência: ordem)
    exercises.sort((a,b)=>{
      const ca=Number(a.rest)>=Number(F.restComp)?0:1,cb=Number(b.rest)>=Number(F.restComp)?0:1;
      return ca-cb;
    });
    return{id:uid(),name:d.name,label:d.label,focus:d.focus,exercises,created:Date.now()};
  });
  // séries semanais por grupo (pro resumo do preview)
  const semana={};
  routines.forEach(r=>r.exercises.forEach(e=>{semana[e.musc]=(semana[e.musc]||0)+Number(e.sets);}));
  return{routines,split:split.nome,semana,refs:EVID};
}

/* ============ WIZARD (3 escolhas pré-marcadas) ============ */
let _wiz=null;
function wizDefaults(){
  const p=S.profile||{};
  const dias=Math.min(5,Math.max(2,Number(p.trainDays)||3));
  const cat=p.goal?gcat(p.goal):'bulk';
  const foco=p.goal==='forca'?'forca':(cat==='perf'&&p.goal!=='forte')?'resistencia':'hipertrofia';
  const volume=p.level==='avc'?'alto':p.level==='int'?'padrao':'leve';
  return{dias,foco,volume};
}
export function openGeradorWizard(){
  if(!_wiz)_wiz=wizDefaults();
  const w=_wiz;
  const card=(on,onclick,title,desc,badge)=>`
    <button type="button" class="opt ${on?'on':''}" style="width:100%;text-align:left;margin-top:6px${on?';border-color:var(--acc)':''}" onclick="${onclick}">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1"><b style="font-size:13.5px">${title}</b>
          <div style="color:var(--mut);font-size:11.5px;margin-top:2px">${desc}</div></div>
        ${badge?`<span class="pill" style="color:var(--acc)">${badge}</span>`:''}
        <div style="font-size:16px">${on?'✅':'○'}</div>
      </div>
    </button>`;
  const def=wizDefaults();
  showModal(`<h3>🧬 Montar meu treino</h3>
    <p class="sub">Já deixei tudo marcado pro seu perfil — ajuste se quiser e gere.</p>
    <div class="field"><label>Quantos dias por semana?</label>
      ${[2,3,4,5].map(d=>card(w.dias===d,`wizSet('dias',${d})`,`${d} dias — ${SPLITS[d].nome}`,SPLITS[d].desc,def.dias===d?'seu perfil':'')).join('')}
    </div>
    <div class="field"><label>Qual seu foco?</label>
      ${Object.values(FOCOS).map(f=>card(w.foco===f.k,`wizSet('foco','${f.k}')`,`${f.emoji} ${f.label}`,f.desc,def.foco===f.k?'indicado':'')).join('')}
    </div>
    <div class="field"><label>Quanto volume?</label>
      ${Object.values(VOLUMES).map(v=>card(w.volume===v.k,`wizSet('volume','${v.k}')`,v.label,v.desc,def.volume===v.k?'seu nível':'')).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="gerarPreview()">🧬 Gerar meu treino</button>
    </div>`);
}
export function wizSet(k,v){_wiz[k]=v;openGeradorWizard();}
export function gerarPreview(){
  const prog=gerarPrograma(_wiz);
  const diasHTML=prog.routines.map(r=>`
    <div style="margin-top:12px;padding:10px;background:var(--bg2);border-radius:12px">
      <b style="font-size:13.5px">${esc(r.label)} · ${esc(r.name)}</b>
      <div style="color:var(--mut);font-size:11px;margin:2px 0 6px">${esc(r.focus)}</div>
      ${r.exercises.map(e=>`<div style="display:flex;justify-content:space-between;font-size:12.5px;padding:3px 0;border-top:1px solid var(--line)">
        <span>${esc(e.name)}</span><span style="color:var(--mut);white-space:nowrap">${e.sets}×${e.reps} · ${e.rest}s</span>
      </div>`).join('')}
    </div>`).join('');
  const semanaHTML=Object.entries(prog.semana).map(([g,s])=>`<span class="pill">${esc(g)}: ${s} séries/sem</span>`).join(' ');
  const refsHTML=prog.refs.map(r=>`
    <div style="margin-top:10px;font-size:12px">
      <b>${esc(r.achado)}</b>
      <div style="color:var(--mut);margin-top:2px">→ ${esc(r.decisao)}</div>
      <a href="${evidLink(r.pmid)}" target="_blank" rel="noopener" style="color:var(--acc);font-size:11px">${esc(r.autor)}, ${r.ano} · ${esc(r.rev)} · PubMed ${r.pmid} ↗</a>
    </div>`).join('');
  showModal(`<h3>Seu programa: ${esc(prog.split)}</h3>
    <p class="sub">${prog.routines.length} dias · pronto pra usar, com descanso configurado no timer</p>
    ${diasHTML}
    <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:5px">${semanaHTML}</div>
    <details style="margin-top:14px"><summary style="cursor:pointer;font-weight:800;font-size:13.5px">🧬 A ciência por trás (${prog.refs.length} estudos)</summary>${refsHTML}</details>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="openGeradorWizard()">↩ Ajustar</button>
      <button class="btn btn-acc" style="flex:1;justify-content:center" onclick="aplicarPrograma()">✅ Usar este treino</button>
    </div>`);
  _wizProg=prog;
}
let _wizProg=null;
export function aplicarPrograma(){
  if(!_wizProg)return;
  if(S.routines.length&&!confirm('Substituir seus treinos atuais pelo programa novo? (os registros de carga dos exercícios de mesmo nome são mantidos)')){
    return;
  }
  // preserva histórico de carga de exercícios com o mesmo nome
  const oldHist={};
  S.routines.forEach(r=>r.exercises.forEach(ex=>{if(ex.history&&ex.history.length)oldHist[ex.name.toLowerCase()]=ex.history;}));
  _wizProg.routines.forEach(r=>r.exercises.forEach(ex=>{if(oldHist[ex.name.toLowerCase()])ex.history=oldHist[ex.name.toLowerCase()];}));
  S.routines=_wizProg.routines;
  save();renderRoutines();closeModal();go('treino');
  toast('Programa criado! Bora treinar 🧬💪');
  _wizProg=null;_wiz=null;
}
