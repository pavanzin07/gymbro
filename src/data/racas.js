/* ============ RAÇAS / APARÊNCIA ============ */
export const SKINS=['#ffe0c2','#ffd0a8','#f1c27d','#e0ac69','#c68642','#8d5524','#5a3317','#7fae6b','#8fa9b8','#c98a7a','#a98fd0','#c65b4e'];
export const HAIRS=['#2b2622','#5a3a1e','#a9712f','#d9b56a','#1a1a1a','#9aa0a6','#e6e6e6','#c0392b','#8e44ad','#2980b9','#16a085','#ff7ac0','#ff5252','#48d1cc','#7ed957','#ffd23f'];
// olhos vívidos estilo anime
export const EYECOLORS=['#5b3a1e','#3b6fb0','#2e9e5b','#8e44ad','#c0392b','#e08a1e','#159e9e','#d81b7a','#455160','#7d3cff'];
// expressões (formato dos olhos + sobrancelha)
export const EYESTYLES=[{k:'determinado',l:'Determinado'},{k:'gentil',l:'Gentil'},{k:'serio',l:'Sério'},{k:'feliz',l:'Feliz'}];
export const HAIRSTYLES=[
  {k:'espetado',l:'Espetado'},{k:'curto',l:'Curto'},{k:'franja',l:'Franja'},
  {k:'rabo',l:'Rabo de cavalo'},{k:'coque',l:'Coque'},{k:'moicano',l:'Moicano'},
  {k:'ondulado',l:'Ondulado'},{k:'longo',l:'Longo'},{k:'careca',l:'Careca'}
];
export const RACES=[
  {k:'humano',l:'Humano',em:'🧑',body:1.00,leg:1.00,headR:1.00,ear:'round',beard:0,horns:0,fang:0,brow:0,flavor:'Versátil e equilibrado'},
  {k:'elfo',l:'Elfo',em:'🧝',body:0.90,leg:1.07,headR:0.97,ear:'point',beard:0,horns:0,fang:0,brow:0,flavor:'Esguio, ágil e élfico'},
  {k:'anao',l:'Anão',em:'🧔',body:1.24,leg:0.72,headR:1.10,ear:'round',beard:1,horns:0,fang:0,brow:0,flavor:'Baixo, robusto e barbado'},
  {k:'besta',l:'Besta',em:'👹',body:1.16,leg:0.98,headR:1.05,ear:'point',beard:0,horns:1,fang:1,brow:1,flavor:'Fera bruta com chifres e presas'}
];
export const raceCfg=k=>RACES.find(r=>r.k===k)||RACES[0];
