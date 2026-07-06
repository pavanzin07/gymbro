/* ============ BASE DE ALIMENTOS (por 100 g) ============ */
export const FOODS=[
  ['Frango grelhado',165,31,0,3.6],['Patinho moído',187,27,0,8],['Ovo inteiro',143,13,1.1,9.5],
  ['Clara de ovo',52,11,0.7,0.2],['Atum em água',116,26,0,1],['Salmão',208,20,0,13],
  ['Tilápia',96,20,0,1.7],['Whey (pó)',380,80,8,6],['Arroz branco cozido',130,2.7,28,0.3],
  ['Arroz integral cozido',124,2.6,26,1],['Feijão cozido',76,4.8,13.6,0.5],['Batata doce cozida',86,1.6,20,0.1],
  ['Batata inglesa cozida',87,2,20,0.1],['Mandioca cozida',125,0.6,30,0.3],['Macarrão cozido',158,5.8,31,0.9],
  ['Aveia',389,17,66,7],['Pão integral',247,13,41,3.4],['Tapioca',240,0,53,0],
  ['Banana',89,1.1,23,0.3],['Maçã',52,0.3,14,0.2],['Leite integral',61,3.2,4.8,3.3],
  ['Leite desnatado',35,3.4,5,0.1],['Iogurte natural',61,3.5,4.7,3.3],['Queijo minas',264,17,3,20],
  ['Brócolis',34,2.8,7,0.4],['Azeite',884,0,0,100],['Amendoim',567,26,16,49],['Pasta de amendoim',588,25,20,50]
];

/* ============ RESTRIÇÕES + COMBOS DE REFEIÇÃO ============ */
export const RESTR=[
  {k:'lactose',l:'Sem lactose'},{k:'vegetariano',l:'Vegetariano'},
  {k:'vegano',l:'Vegano'},{k:'gluten',l:'Sem glúten'}
];
// tags: o que o combo CONTÉM (lac=lactose, meat=carne/peixe, egg=ovo, glu=glúten)
const F=(name,qty,kcal,prot,carb,fat)=>({name,qty,kcal,prot,carb,fat});
export const COMBOS=[
  // ----- CAFÉ DA MANHÃ -----
  {cat:'cafe',name:'Whey + iogurte + granola',tags:{lac:1,meat:0,egg:0,glu:1},foods:[F('Whey','30 g',114,24,2.4,1.8),F('Iogurte natural','170 g',104,6,8,5.6),F('Granola','40 g',180,4,26,6)]},
  {cat:'cafe',name:'Ovos + whey + banana',tags:{lac:1,meat:0,egg:1,glu:0},foods:[F('Ovos mexidos','3 un',214,19.5,1.6,14),F('Whey','30 g',114,24,2.4,1.8),F('Banana','120 g',107,1.3,27.6,0.4)]},
  {cat:'cafe',name:'Pão integral + frango desfiado + requeijão light',tags:{lac:1,meat:1,egg:0,glu:1},foods:[F('Pão integral','2 fatias',123,6.5,20,1.7),F('Frango desfiado','60 g',99,18.6,0,2.2),F('Requeijão light','30 g',60,3,2,4)]},
  {cat:'cafe',name:'Tapioca + ovo + queijo',tags:{lac:1,meat:0,egg:1,glu:0},foods:[F('Tapioca','40 g goma',96,0,21,0),F('Ovos','2 un',143,13,1.1,9.5),F('Queijo minas','30 g',79,5,1,6)]},
  {cat:'cafe',name:'Aveia + banana + pasta de amendoim (vegano)',tags:{lac:0,meat:0,egg:0,glu:1},foods:[F('Aveia','40 g',156,6.8,26,2.8),F('Banana','120 g',107,1.3,27.6,0.4),F('Pasta de amendoim','20 g',118,5,4,10)]},
  {cat:'cafe',name:'Tapioca + pasta de amendoim + banana (vegano, sem glúten)',tags:{lac:0,meat:0,egg:0,glu:0},foods:[F('Tapioca','40 g goma',96,0,21,0),F('Pasta de amendoim','20 g',118,5,4,10),F('Banana','100 g',89,1.1,23,0.3)]},
  // ----- ALMOÇO -----
  {cat:'almoco',name:'Frango + arroz + feijão',tags:{lac:0,meat:1,egg:0,glu:0},foods:[F('Frango grelhado','150 g',248,46,0,5.4),F('Arroz branco','150 g',195,4,42,0.5),F('Feijão','100 g',76,4.8,13.6,0.5)]},
  {cat:'almoco',name:'Patinho + batata doce + brócolis',tags:{lac:0,meat:1,egg:0,glu:0},foods:[F('Patinho moído','150 g',281,40.5,0,12),F('Batata doce','150 g',129,2.4,30,0.15),F('Brócolis','100 g',34,2.8,7,0.4)]},
  {cat:'almoco',name:'Omelete + arroz integral + feijão (vegetariano)',tags:{lac:0,meat:0,egg:1,glu:0},foods:[F('Omelete','3 ovos',214,19.5,1.6,14),F('Arroz integral','150 g',186,3.9,39,1.5),F('Feijão','100 g',76,4.8,13.6,0.5)]},
  {cat:'almoco',name:'Grão de bico + arroz + legumes (vegano)',tags:{lac:0,meat:0,egg:0,glu:0},foods:[F('Grão de bico','150 g',246,13.5,40,4),F('Arroz integral','100 g',124,2.6,26,1),F('Legumes','100 g',40,2,8,0.3)]},
  // ----- LANCHE -----
  {cat:'lanche',name:'Whey + banana',tags:{lac:1,meat:0,egg:0,glu:0},foods:[F('Whey','30 g',114,24,2.4,1.8),F('Banana','120 g',107,1.3,27.6,0.4)]},
  {cat:'lanche',name:'Iogurte + aveia + morango',tags:{lac:1,meat:0,egg:0,glu:1},foods:[F('Iogurte natural','170 g',104,6,8,5.6),F('Aveia','30 g',117,5,20,2),F('Morango','80 g',26,0.5,6,0.3)]},
  {cat:'lanche',name:'Ovos cozidos + maçã',tags:{lac:0,meat:0,egg:1,glu:0},foods:[F('Ovos cozidos','2 un',143,13,1.1,9.5),F('Maçã','130 g',68,0.4,18,0.3)]},
  {cat:'lanche',name:'Pão integral + pasta de amendoim (vegano)',tags:{lac:0,meat:0,egg:0,glu:1},foods:[F('Pão integral','2 fatias',123,6.5,20,1.7),F('Pasta de amendoim','20 g',118,5,4,10)]},
  // ----- JANTAR -----
  {cat:'janta',name:'Tilápia + batata + salada',tags:{lac:0,meat:1,egg:0,glu:0},foods:[F('Tilápia','150 g',144,30,0,2.5),F('Batata inglesa','150 g',131,3,30,0.15),F('Salada verde','à vontade',30,2,5,0.3)]},
  {cat:'janta',name:'Frango + macarrão integral + legumes',tags:{lac:0,meat:1,egg:0,glu:1},foods:[F('Frango grelhado','120 g',198,37,0,4.3),F('Macarrão integral','120 g',190,7,37,1.1),F('Legumes','100 g',40,2,8,0.3)]},
  {cat:'janta',name:'Tofu grelhado + arroz + brócolis (vegano)',tags:{lac:0,meat:0,egg:0,glu:0},foods:[F('Tofu grelhado','150 g',114,12,3,7),F('Arroz branco','100 g',130,2.7,28,0.3),F('Brócolis','100 g',34,2.8,7,0.4)]},
  {cat:'janta',name:'Omelete + queijo + salada (vegetariano)',tags:{lac:1,meat:0,egg:1,glu:0},foods:[F('Omelete','3 ovos',214,19.5,1.6,14),F('Queijo minas','30 g',79,5,1,6),F('Salada verde','à vontade',30,2,5,0.3)]}
];
export const CATLABEL={cafe:'Café da manhã',almoco:'Almoço',lanche:'Lanche',janta:'Jantar'};
