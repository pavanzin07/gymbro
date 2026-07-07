import {S,save,replaceState,lastSavedAt,esc} from './state.js';
import {toast,showModal,closeModal} from './ui.js';

/* ============ SINCRONIZAÇÃO (Supabase) ============
   Offline-first: o localStorage continua sendo a fonte da verdade.
   Sem VITE_SUPABASE_URL/KEY este módulo fica inerte e o app funciona
   100% offline como sempre. Com config: login por e-mail/senha,
   pull+merge no login e push (debounce 3s) após cada save(). */

const SB_URL=import.meta.env.VITE_SUPABASE_URL;
const SB_KEY=import.meta.env.VITE_SUPABASE_ANON_KEY;
let sb=null;         // cliente supabase (carregado sob demanda)
let user=null;       // usuário logado
let pushT=null;      // debounce do push
let lastSync=null;   // timestamp da última sincronização ok
let onRemote=null;   // callback pra re-renderizar após aplicar estado remoto
let syncing=false;

export const syncConfigured=()=>!!(SB_URL&&SB_KEY);
export const syncUser=()=>user;

export async function initSync(opts={}){
  onRemote=opts.onRemoteState||null;
  if(!syncConfigured())return;
  const {createClient}=await import('@supabase/supabase-js');
  sb=createClient(SB_URL,SB_KEY);
  const {data}=await sb.auth.getSession();
  user=data&&data.session?data.session.user:null;
  sb.auth.onAuthStateChange((ev,session)=>{
    user=session?session.user:null;
    updateIndicator();
    if(ev==='PASSWORD_RECOVERY')openNewPasswordModal();
  });
  window.addEventListener('gymbro:saved',schedulePush);
  updateIndicator();
  if(user)syncNow(true);
}

/* ---- indicador ☁️ no header ---- */
function updateIndicator(){
  const el=document.getElementById('sync-ind');
  if(!el)return;
  if(!syncConfigured()){el.style.display='none';return;}
  el.style.display='';
  el.style.opacity=user?'1':'.45';
  el.title=user
    ?('Sincronizado como '+(user.email||'')+(lastSync?' · última: '+new Date(lastSync).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):''))
    :'Sincronização desconectada — toque pra entrar';
}

/* ---- merge: o blob mais novo ganha; o mais antigo preenche buracos ----
   Dias de check-in, diário alimentar, sessões e pesos que só existem no
   lado antigo são preservados (união por data). Pura, testável. */
export function mergeStates(a,aTs,b,bTs){
  const [base,other]=aTs>=bTs?[a,b]:[b,a];
  const m=JSON.parse(JSON.stringify(base));
  if(!other)return m;
  if(other.progress&&other.progress.days){
    if(!m.progress)m.progress={weight:[],measures:[],waterGoalMl:2000,days:{}};
    if(!m.progress.days)m.progress.days={};
    for(const d in other.progress.days)if(!m.progress.days[d])m.progress.days[d]=JSON.parse(JSON.stringify(other.progress.days[d]));
  }
  if(other.mealDiary){
    if(!m.mealDiary)m.mealDiary={};
    for(const d in other.mealDiary)if(!m.mealDiary[d])m.mealDiary[d]=JSON.parse(JSON.stringify(other.mealDiary[d]));
  }
  if(Array.isArray(other.sessions)){
    if(!Array.isArray(m.sessions))m.sessions=[];
    const seen=new Set(m.sessions.map(s=>(s.date||'')+'|'+(s.routineId||'')));
    other.sessions.forEach(s=>{const k=(s.date||'')+'|'+(s.routineId||'');if(!seen.has(k)){m.sessions.push(JSON.parse(JSON.stringify(s)));seen.add(k);}});
    m.sessions.sort((x,y)=>(x.date||'').localeCompare(y.date||''));
  }
  if(other.progress&&Array.isArray(other.progress.weight)&&m.progress){
    if(!Array.isArray(m.progress.weight))m.progress.weight=[];
    const wd=new Set(m.progress.weight.map(w=>w.date));
    other.progress.weight.forEach(w=>{if(!wd.has(w.date)){m.progress.weight.push(JSON.parse(JSON.stringify(w)));wd.add(w.date);}});
    m.progress.weight.sort((x,y)=>(x.date||'').localeCompare(y.date||''));
  }
  // Histórico de carga: união por exercício (nome, case-insensitive) — um PR
  // registrado no aparelho antigo não se perde. A estrutura de rotinas em si
  // segue o estado mais novo; exercícios que só existem no antigo são ignorados.
  if(Array.isArray(other.routines)&&Array.isArray(m.routines)){
    const byName={};
    m.routines.forEach(r=>(r.exercises||[]).forEach(ex=>{byName[(ex.name||'').toLowerCase()]=ex;}));
    other.routines.forEach(r=>(r.exercises||[]).forEach(oex=>{
      const mex=byName[(oex.name||'').toLowerCase()];
      if(!mex||!Array.isArray(oex.history)||!oex.history.length)return;
      if(!Array.isArray(mex.history))mex.history=[];
      const seen=new Set(mex.history.map(h=>(h.date||'')+'|'+h.load+'|'+h.reps));
      oex.history.forEach(h=>{
        const k=(h.date||'')+'|'+h.load+'|'+h.reps;
        if(!seen.has(k)){mex.history.push(JSON.parse(JSON.stringify(h)));seen.add(k);}
      });
      mex.history.sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    }));
  }
  return m;
}

/* ---- pull + merge + push ---- */
export async function syncNow(silent){
  if(!sb||!user||syncing)return;
  syncing=true;
  try{
    const {data,error}=await sb.from('gym_states').select('state,updated_at').eq('user_id',user.id).maybeSingle();
    if(error)throw error;
    if(data&&data.state){
      const remoteTs=new Date(data.updated_at).getTime();
      const merged=mergeStates(S,lastSavedAt(),data.state,remoteTs);
      replaceState(merged);save();
      if(onRemote)onRemote();
    }
    await pushNow();
    lastSync=Date.now();
    updateIndicator();
    if(!silent)toast('Sincronizado ☁️');
  }catch(e){
    console.log('sync error:',e.message);
    if(!silent)toast('Erro ao sincronizar ❌');
  }finally{syncing=false;}
}
async function pushNow(){
  if(!sb||!user)return;
  const {error}=await sb.from('gym_states').upsert({user_id:user.id,state:S,updated_at:new Date().toISOString()});
  if(error)throw error;
}
function schedulePush(){
  if(!sb||!user)return;
  clearTimeout(pushT);
  pushT=setTimeout(()=>{pushNow().then(()=>{lastSync=Date.now();}).catch(e=>console.log('push error:',e.message));},3000);
}

/* ---- auth ---- */
export async function syncSignIn(){
  if(!sb){toast('Sem conexão com o servidor — tente de novo online');return;}
  const email=document.getElementById('sy-email').value.trim();
  const pass=document.getElementById('sy-pass').value;
  if(!email||!pass){toast('Preencha e-mail e senha');return;}
  const {error}=await sb.auth.signInWithPassword({email,password:pass});
  if(error){toast(error.message.includes('Invalid')?'E-mail ou senha incorretos ❌':'Erro: '+error.message);return;}
  toast('Bem-vindo de volta! ☁️');
  closeModal();
  await syncNow(true);
}
export async function syncSignUp(){
  if(!sb){toast('Sem conexão com o servidor — tente de novo online');return;}
  const email=document.getElementById('sy-email').value.trim();
  const pass=document.getElementById('sy-pass').value;
  if(!email||!pass){toast('Preencha e-mail e senha');return;}
  if(pass.length<6){toast('Senha precisa de 6+ caracteres');return;}
  const {data,error}=await sb.auth.signUp({email,password:pass});
  if(error){toast('Erro: '+error.message);return;}
  if(data.user&&!data.session){toast('Confira seu e-mail pra confirmar a conta 📧');closeModal();return;}
  toast('Conta criada! ☁️');
  closeModal();
  await syncNow(true);
}
export async function syncSignOut(){
  await sb.auth.signOut();
  user=null;
  updateIndicator();
  toast('Desconectado. Seus dados continuam neste aparelho.');
  openSyncModal();
}
export async function syncForgot(){
  if(!sb){toast('Sem conexão com o servidor — tente de novo online');return;}
  const email=document.getElementById('sy-email').value.trim();
  if(!email){toast('Digite seu e-mail no campo acima');return;}
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
  if(error){toast('Erro: '+error.message);return;}
  toast('E-mail de recuperação enviado 📧');
}
export function openNewPasswordModal(){
  showModal(`<h3>🔑 Nova senha</h3>
    <p class="sub">Você chegou pelo link de recuperação. Defina a nova senha.</p>
    <div class="field"><label>Nova senha</label><input id="sy-newpass" type="password" placeholder="6+ caracteres"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-acc" onclick="syncSetNewPassword()">Salvar senha</button>
    </div>`);
  setTimeout(()=>{const el=document.getElementById('sy-newpass');if(el)el.focus();},100);
}
export async function syncSetNewPassword(){
  const pass=document.getElementById('sy-newpass').value;
  if(pass.length<6){toast('Senha precisa de 6+ caracteres');return;}
  const {error}=await sb.auth.updateUser({password:pass});
  if(error){toast('Erro: '+error.message);return;}
  toast('Senha atualizada ✅');
  closeModal();
  await syncNow(true);
}

/* ---- UI ---- */
export function openSyncModal(){
  if(!syncConfigured()){
    showModal(`<h3>☁️ Sincronização</h3>
      <p class="sub">Guarde seus dados na nuvem e use em vários aparelhos.</p>
      <div class="why">A sincronização ainda não foi configurada neste app. O passo a passo (grátis, ~5 min) está no arquivo <b>SETUP-SYNC.md</b> do projeto. Enquanto isso, tudo continua salvo neste navegador — nada se perde.</div>
      <div class="modal-actions"><button class="btn btn-acc" onclick="closeModal()" style="flex:1;justify-content:center">Entendi</button></div>`);
    return;
  }
  if(user){
    const t=lastSync?new Date(lastSync).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
    showModal(`<h3>☁️ Sincronização</h3>
      <p class="sub">Conectado como <b>${esc(user.email||'')}</b></p>
      <div class="why">Seus dados sincronizam sozinhos alguns segundos após cada mudança. Última sincronização: <b>${t}</b>.</div>
      <button class="btn btn-acc" style="width:100%;justify-content:center;margin:10px 0" onclick="syncNow(false)">🔄 Sincronizar agora</button>
      <button class="btn btn-ghost" style="width:100%;justify-content:center" onclick="syncSignOut()">Sair da conta</button>
      <div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal()" style="flex:1;justify-content:center">Fechar</button></div>`);
    return;
  }
  showModal(`<h3>☁️ Entrar ou criar conta</h3>
    <p class="sub">Seus dados locais serão mesclados com a nuvem.</p>
    <div class="field"><label>E-mail</label><input id="sy-email" type="email" inputmode="email" placeholder="voce@email.com"></div>
    <div class="field"><label>Senha</label><input id="sy-pass" type="password" placeholder="6+ caracteres"></div>
    <div class="modal-actions">
      <button class="btn btn-ghost" onclick="syncSignUp()" style="flex:1;justify-content:center">Criar conta</button>
      <button class="btn btn-acc" onclick="syncSignIn()" style="flex:1;justify-content:center">Entrar</button>
    </div>
    <p class="hint" style="text-align:center;margin-top:10px"><a href="#" style="color:var(--acc)" onclick="syncForgot();return false">Esqueci a senha</a></p>`);
  setTimeout(()=>{const el=document.getElementById('sy-email');if(el)el.focus();},100);
}
