/* ============ NAV ============ */
export function go(v){
  document.querySelectorAll('.view').forEach(e=>e.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(e=>{e.classList.remove('active');e.removeAttribute('aria-current');});
  document.getElementById('view-'+v).classList.add('active');
  const tab=document.getElementById('tab-'+v);
  tab.classList.add('active');tab.setAttribute('aria-current','page');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ============ TOAST ============ */
let toastT;
export function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),1900);
}

/* ============ MODAL ============ */
export function showModal(html){
  document.getElementById('modal').innerHTML=html;
  document.getElementById('modal-bg').classList.add('show');
}
export function closeModal(){document.getElementById('modal-bg').classList.remove('show')}
const modalBg=document.getElementById('modal-bg');
if(modalBg)modalBg.addEventListener('click',e=>{if(e.target.id==='modal-bg')closeModal()});
if(typeof document!=='undefined')document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&modalBg&&modalBg.classList.contains('show'))closeModal();
});

/* ============ DATAS (utilitário compartilhado) ============ */
export function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
export function dShort(s){const p=s.split('-');return p[2]+'/'+p[1];}
export function daysBetween(a,b){return Math.round((new Date(b)-new Date(a))/864e5);}
// new Date('YYYY-MM-DD') é interpretado como UTC pelo motor JS; em fusos negativos
// (ex: America/Sao_Paulo, UTC-3) isso volta um dia ao ler com getDate()/getMonth() locais.
// Use este parser sempre que for navegar dia a dia a partir de uma data local do app.
export function parseLocalDate(s){const p=s.split('-').map(Number);return new Date(p[0],p[1]-1,p[2]);}

/* ============ GRÁFICO SVG ============ */
export function svgChart(series,color,id){
  if(series.length<2)return null;
  const W=320,H=132,pL=6,pR=6,pT=14,pB=20;
  const vals=series.map(s=>s.v);let mn=Math.min(...vals),mx=Math.max(...vals);
  if(mn===mx){mn-=1;mx+=1;}const rg=mx-mn,n=series.length;
  const X=i=>pL+(i/(n-1))*(W-pL-pR);
  const Y=v=>pT+(1-(v-mn)/rg)*(H-pT-pB);
  const pts=series.map((s,i)=>`${X(i).toFixed(1)},${Y(s.v).toFixed(1)}`).join(' ');
  const area=`${pL},${H-pB} ${pts} ${(W-pR)},${H-pB}`;
  const dots=series.map((s,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(s.v).toFixed(1)}" r="${i===n-1?4:2.5}" fill="${i===n-1?color:'#0d0f12'}" stroke="${color}" stroke-width="2"/>`).join('');
  const last=series[n-1];
  const lx=Math.min(X(n-1),W-30);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
    <polygon points="${area}" fill="url(#g${id})"/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    <text x="${lx}" y="${(Y(last.v)-8).toFixed(1)}" fill="${color}" font-size="12" font-weight="800" text-anchor="middle">${last.v}</text>
    <text x="${pL}" y="${H-6}" fill="#8b95a3" font-size="10">${dShort(series[0].date)}</text>
    <text x="${W-pR}" y="${H-6}" fill="#8b95a3" font-size="10" text-anchor="end">${dShort(last.date)}</text>
  </svg>`;
}

/* ============ INPUT HELPER (usado nas sessões de treino) ============ */
export function inp(id,val,lbl){return `<div><label style="font-size:10px;color:var(--mut);font-weight:700">${lbl}</label><input id="${id}" type="number" inputmode="decimal" value="${val}" style="width:100%;background:var(--bg2);border:1px solid var(--line);color:var(--txt);border-radius:8px;padding:8px 6px;font-size:14px;text-align:center"></div>`;}
