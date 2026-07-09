/* ============ TREINOS PRONTOS ============
   Programas pré-montados em linguagem de gente: cada um é um preset do
   gerador (gerador.js), então herda os volumes/faixas com evidência do
   PubMed (data/evidencia.js). A pessoa toca, vê o preview e usa — e pode
   editar tudo depois. */
export const PROGRAMAS=[
  {k:'primeiro',emoji:'🌱',nome:'Meu primeiro treino',frase:'"Nunca pisei numa academia"',
   desc:'2 dias por semana, corpo inteiro, começando leve. Cada exercício vem com instrução de como fazer. Perfeito pra criar o hábito sem se machucar.',
   cfg:{dias:2,foco:'hipertrofia',volume:'leve'}},
  {k:'massa',emoji:'💪',nome:'Ganhar massa',frase:'"Quero crescer"',
   desc:'3 dias de corpo inteiro — cada músculo trabalhado 3x por semana, no volume que a ciência aponta como ideal.',
   cfg:{dias:3,foco:'hipertrofia',volume:'padrao'}},
  {k:'forca',emoji:'🏋️',nome:'Ficar forte',frase:'"Quero levantar pesado"',
   desc:'4 dias divididos em superiores e inferiores, com cargas altas, poucas repetições e descansos longos.',
   cfg:{dias:4,foco:'forca',volume:'padrao'}},
  {k:'definir',emoji:'🔥',nome:'Secar e definir',frase:'"Quero definir o shape"',
   desc:'4 dias com mais repetições e descansos curtos — gasta mais caloria e segura o músculo durante a dieta.',
   cfg:{dias:4,foco:'resistencia',volume:'padrao'}},
  {k:'ppl',emoji:'😤',nome:'Push Pull Legs',frase:'"Já treino há um tempo"',
   desc:'5 dias, o split favorito das academias: empurrar, puxar e pernas, com volume alto e cada músculo 2x na semana.',
   cfg:{dias:5,foco:'hipertrofia',volume:'alto'}}
];
// qual programa recomendar pro perfil (badge "pra você")
export function recomendadoPronto(p){
  if(!p)return'massa';
  if(p.level==='ini')return'primeiro';
  if(p.goal==='forca')return'forca';
  if(p.goal==='perder'||p.goal==='definir')return'definir';
  if(p.level==='avc')return'ppl';
  return'massa';
}
