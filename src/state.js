/* ============ STATE ============ */
export const KEY='meu_gym_bro_v1';
export const DEFAULT={
  profile:null, // {sex,age,height,weight,goal,level,months,trainDays,otherSport,otherDays,lifestyle}
  choices:{kcal:'b',prot:'b',fat:'b'}, // qual opção a pessoa escolheu
  progress:{ weight:[], measures:[], waterGoalMl:2000, days:{} }, // evolução
  sessions:[], // treinos registrados dia a dia
  goals:[], // metas do usuário
  characters:[], // vários personagens
  activeChar:0,
  wallet:{owned:['short_black'],spent:0}, // moedas/itens compartilhados
  routines:[],
  mealTemplate:[ // modelo de refeições (base para copiar pra um dia)
    {id:uid(),name:'Café da manhã',foods:[]},
    {id:uid(),name:'Almoço',foods:[]},
    {id:uid(),name:'Lanche',foods:[]},
    {id:uid(),name:'Jantar',foods:[]}
  ],
  mealDiary:{}, // { 'YYYY-MM-DD': [refeição] } — registro real por data
  targets:{kcal:2200,prot:160,carb:230,fat:70}
};

export function uid(){return Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3)}
export function load(){
  try{const r=JSON.parse(localStorage.getItem(KEY));
    if(r&&r.routines){
      if(r.profile===undefined)r.profile=null;
      if(!r.choices)r.choices={kcal:'b',prot:'b',fat:'b'};
      if(!r.progress)r.progress={weight:[],measures:[],waterGoalMl:2000,days:{}};
      if(!r.progress.waterGoalMl)r.progress.waterGoalMl=(r.progress.waterGoal||8)*250;
      if(!r.character)r.character={created:false,sex:'M',skin:1,hair:0,hairStyle:'curto',name:'',spent:0,owned:['short_black'],equipped:{head:null,neck:null,wrists:null,hands:null,belt:null,top:null,bottom:'short_black',feet:null}};
      if(!r.wallet)r.wallet={owned:(r.character&&r.character.owned)||['short_black'],spent:(r.character&&r.character.spent)||0};
      if(!r.characters){
        if(r.character&&r.character.created){const c=r.character;
          r.characters=[{name:c.name||'Meu Bro',race:c.race||'humano',sex:c.sex||'M',skin:c.skin!=null?c.skin:1,hair:c.hair||0,hairStyle:c.hairStyle||'curto',equipped:c.equipped||{}}];}
        else r.characters=[];
        r.activeChar=0;
      }
      r.characters.forEach(c=>{if(!c.equipped)c.equipped={};['head','neck','wrists','hands','belt','top','bottom','feet','cape'].forEach(s=>{if(c.equipped[s]===undefined)c.equipped[s]=s==='bottom'?'short_black':null;});});
      if(r.activeChar==null||r.activeChar>=r.characters.length)r.activeChar=0;
      if(!r.sessions)r.sessions=[];
      if(!r.goals)r.goals=[];
      // Migração: meals array → mealTemplate + mealDiary
      if(r.meals&&Array.isArray(r.meals)){
        if(!r.mealTemplate)r.mealTemplate=r.meals;
        if(!r.mealDiary)r.mealDiary={};
        delete r.meals;
      }
      if(!r.mealTemplate)r.mealTemplate=[{id:uid(),name:'Café da manhã',foods:[]},{id:uid(),name:'Almoço',foods:[]},{id:uid(),name:'Lanche',foods:[]},{id:uid(),name:'Jantar',foods:[]}];
      if(!r.mealDiary)r.mealDiary={};
      return r;
    }
  }catch(e){}
  return JSON.parse(JSON.stringify(DEFAULT));
}
export let S=load();
export function save(){localStorage.setItem(KEY,JSON.stringify(S))}
export function replaceState(newObj){
  Object.keys(S).forEach(k=>delete S[k]);
  Object.assign(S,newObj);
}
export function esc(s){return(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function num(v){const n=parseFloat(v);return isNaN(n)?0:n}
