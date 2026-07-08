import '../style.css';
import * as State from './state.js';
import * as Ui from './ui.js';
import * as Perfil from './perfil.js';
import * as Treino from './treino.js';
import * as Dieta from './dieta.js';
import * as Progresso from './progresso.js';
import * as Conquistas from './conquistas.js';
import * as Personagem from './personagem.js';
import * as Sync from './sync.js';
import * as Gerador from './gerador.js';

const {S,save,DEFAULT,uid,replaceState}=State;
const {showModal,closeModal,toast}=Ui;
const {renderPerfil}=Perfil;
const {renderRoutines,startRestTimer}=Treino;
const {renderDieta,switchMealDate,copyMealTemplate}=Dieta;
const {renderProgresso,checkDietaAuto}=Progresso;
const {renderRecords}=Conquistas;
const {renderPersonagem}=Personagem;

/* ============ MENU / BACKUP ============ */
function openMenu(){
  showModal(`
    <h3>Opções</h3>
    <p class="sub">Seus dados ficam salvos neste navegador.</p>
    <button class="btn btn-ghost" style="width:100%;justify-content:flex-start;margin-bottom:10px" onclick="openSyncModal()">☁️ Conta &amp; Sincronização</button>
    <button class="btn btn-ghost" style="width:100%;justify-content:flex-start;margin-bottom:10px" onclick="exportData()">⬇️ Exportar backup (.json)</button>
    <label class="btn btn-ghost" style="width:100%;justify-content:flex-start;margin-bottom:10px;cursor:pointer">
      ⬆️ Importar backup
      <input type="file" accept="application/json" style="display:none" onchange="importData(event)">
    </label>
    <button class="btn btn-danger" style="width:100%;justify-content:flex-start" onclick="resetAll()">🗑 Apagar tudo</button>
    <div class="modal-actions">
      <button class="btn btn-acc" onclick="closeModal()" style="flex:1;justify-content:center">Fechar</button>
    </div>`);
}
function exportData(){
  const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='meu-gym-bro-backup.json';a.click();toast('Backup exportado ⬇️');
}
function renderAll(){
  renderPerfil();renderRoutines();renderDieta();renderProgresso();renderRecords();renderPersonagem();
}
function importData(ev){
  const file=ev.target.files[0];if(!file)return;
  const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);
    if(!d.routines)throw 0;
    if(!d.choices)d.choices={kcal:'b',prot:'b',fat:'b'};if(d.profile===undefined)d.profile=null;
    if(!d.progress)d.progress={weight:[],measures:[],waterGoalMl:2000,days:{}};
    if(!d.progress.waterGoalMl)d.progress.waterGoalMl=(d.progress.waterGoal||8)*250;
    if(!d.wallet)d.wallet={owned:['short_black'],spent:0};
    if(!d.characters)d.characters=[];
    if(d.activeChar==null)d.activeChar=0;
    if(!d.sessions)d.sessions=[];
    if(!d.goals)d.goals=[];
    // Migração: meals array → mealTemplate + mealDiary (para backups antigos)
    if(d.meals&&Array.isArray(d.meals)){
      if(!d.mealTemplate)d.mealTemplate=d.meals;
      if(!d.mealDiary)d.mealDiary={};
      delete d.meals;
    }
    if(!d.mealTemplate)d.mealTemplate=[{id:uid(),name:'Café da manhã',foods:[]},{id:uid(),name:'Almoço',foods:[]},{id:uid(),name:'Lanche',foods:[]},{id:uid(),name:'Jantar',foods:[]}];
    if(!d.mealDiary)d.mealDiary={};
    replaceState(d);save();renderAll();closeModal();toast('Backup importado ✅');
  }catch(e){toast('Arquivo inválido ❌')}};
  rd.readAsText(file);
}
function resetAll(){
  if(!confirm('Apagar TODOS os treinos e refeições? Isso não tem volta.'))return;
  const fresh=JSON.parse(JSON.stringify(DEFAULT));
  fresh.mealTemplate.forEach(m=>m.id=uid());
  replaceState(fresh);save();renderAll();closeModal();toast('Tudo zerado');
}

/* ============ EXPOSIÇÃO GLOBAL ============ */
// Templates HTML gerados dinamicamente usam onclick="funcao(...)" — igual ao
// script único original, essas funções precisam existir no escopo global.
Object.assign(window,State,Ui,Perfil,Treino,Dieta,Progresso,Conquistas,Personagem,Sync,Gerador,{
  openMenu,exportData,importData,resetAll
});

/* ============ INIT ============ */
renderAll();
Sync.initSync({onRemoteState:renderAll});
// Atalhos do PWA (manifest shortcuts): ?tab=treino abre direto na aba
const tabParam=new URLSearchParams(location.search).get('tab');
if(tabParam&&document.getElementById('view-'+tabParam))Ui.go(tabParam);

/* ============ PWA / SERVICE WORKER ============ */
// Só registra em produção — em dev o cache-first serviria módulos antigos.
// Caminho relativo: funciona na raiz e em subdiretório (ex: GitHub Pages).
if('serviceWorker' in navigator&&import.meta.env.PROD){
  navigator.serviceWorker.register('./sw.js').catch(e=>{
    console.log('SW registration failed (dev or offline):',e.message);
  });
}
