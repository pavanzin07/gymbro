/* ============ RAÇAS / APARÊNCIA ============ */
export const SKINS=['#ffd9b3','#f1c27d','#e0ac69','#c68642','#8d5524','#5a3317','#7fae6b','#8fa9b8','#c98a7a','#a98fd0','#b0b0b8','#c65b4e'];
export const HAIRS=['#2b2622','#5a3a1e','#a9712f','#d9b56a','#1a1a1a','#6b6b6b','#e6e6e6','#c0392b','#8e44ad','#2980b9','#16a085','#ff7ac0'];
export const HAIRSTYLES=[{k:'curto',l:'Curto'},{k:'topete',l:'Topete'},{k:'moicano',l:'Moicano'},{k:'longo',l:'Longo'},{k:'careca',l:'Careca'}];
export const RACES=[
  {k:'humano',l:'Humano',em:'🧑',body:1.00,leg:1.00,headR:1.00,ear:'round',beard:0,horns:0,fang:0,brow:0,flavor:'Versátil e equilibrado'},
  {k:'elfo',l:'Elfo',em:'🧝',body:0.90,leg:1.07,headR:0.95,ear:'point',beard:0,horns:0,fang:0,brow:0,flavor:'Esguio, ágil e élfico'},
  {k:'anao',l:'Anão',em:'🧔',body:1.24,leg:0.70,headR:1.14,ear:'round',beard:1,horns:0,fang:0,brow:0,flavor:'Baixo, robusto e barbado'},
  {k:'besta',l:'Besta',em:'👹',body:1.18,leg:0.98,headR:1.08,ear:'point',beard:0,horns:1,fang:1,brow:1,flavor:'Fera bruta com chifres e presas'}
];
export const raceCfg=k=>RACES.find(r=>r.k===k)||RACES[0];
