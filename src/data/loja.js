/* ============ CLASSES / LOJA / EQUIPAMENTOS ============ */
export const RPGCLASSES=[
  {min:1,t:'Novato',em:'🐣'},{min:3,t:'Marombeiro Aprendiz',em:'🔰'},{min:5,t:'Guerreiro do Ferro',em:'⚔️'},
  {min:8,t:'Bárbaro das Anilhas',em:'🪓'},{min:12,t:'Mestre do Supino',em:'🛡️'},{min:17,t:'Lenda da Academia',em:'👑'}
];
export function rpgClass(level){let c=RPGCLASSES[0];RPGCLASSES.forEach(x=>{if(level>=x.min)c=x;});return c;}
export function rarityOf(cost){return cost<=90?{k:'comum',l:'Comum',c:'#8b95a3'}:cost<=150?{k:'raro',l:'Raro',c:'#4aa8ff'}:{k:'epico',l:'Épico',c:'#b06bff'};}
export const SLOTS=[{k:'head',l:'Cabeça'},{k:'cape',l:'Capa'},{k:'top',l:'Tronco'},{k:'bottom',l:'Pernas'},{k:'feet',l:'Pés'},{k:'hands',l:'Mãos'},{k:'wrists',l:'Punho'},{k:'neck',l:'Pescoço'},{k:'belt',l:'Cinturão'}];
export const SHOP=[
  // --- academia ---
  {id:'cap_black',name:'Boné preto',slot:'head',em:'🧢',cost:120,color:'#222'},
  {id:'cap_red',name:'Boné vermelho',slot:'head',em:'🧢',cost:120,color:'#c0392b'},
  {id:'bandana',name:'Bandana',slot:'head',em:'🥷',cost:80,color:'#2c3e50'},
  {id:'chain',name:'Corrente',slot:'neck',em:'📿',cost:150,color:'#f1c40f'},
  {id:'wrist',name:'Munhequeira',slot:'wrists',em:'💪',cost:90,color:'#ecf0f1'},
  {id:'straps',name:'Straps',slot:'hands',em:'🪢',cost:110,color:'#8d6e3a'},
  {id:'gloves',name:'Luva de treino',slot:'hands',em:'🧤',cost:100,color:'#111'},
  {id:'belt',name:'Cinturão',slot:'belt',em:'🥋',cost:200,color:'#6b3e16'},
  {id:'tank_black',name:'Regata preta',slot:'top',em:'🎽',cost:140,color:'#1a1a1a'},
  {id:'tank_lime',name:'Regata lime',slot:'top',em:'🎽',cost:160,color:'#9cd400'},
  {id:'short_black',name:'Short preto',slot:'bottom',em:'🩳',cost:0,color:'#26303a'},
  {id:'short_blue',name:'Short azul',slot:'bottom',em:'🩳',cost:80,color:'#2980b9'},
  {id:'short_red',name:'Short vermelho',slot:'bottom',em:'🩳',cost:80,color:'#c0392b'},
  {id:'sneaker',name:'Tênis',slot:'feet',em:'👟',cost:160,color:'#e74c3c'},
  {id:'squat_shoe',name:'Sapatilha de agachamento',slot:'feet',em:'🥾',cost:220,color:'#34495e'},
  // --- RPG / medieval ---
  {id:'helm_steel',name:'Elmo de aço',slot:'head',em:'⛑️',cost:260,color:'#9aa4b0',rpg:1},
  {id:'helm_horned',name:'Elmo com chifres',slot:'head',em:'🪖',cost:300,color:'#7d8794',rpg:1},
  {id:'armor_plate',name:'Armadura de placas',slot:'top',em:'🛡️',cost:340,color:'#8b95a3',rpg:1},
  {id:'tunic_leather',name:'Túnica de couro',slot:'top',em:'🥋',cost:150,color:'#7a5230',rpg:1},
  {id:'robe_mage',name:'Manto de mago',slot:'top',em:'🧙',cost:220,color:'#3b3170',rpg:1},
  {id:'pants_leather',name:'Calça de couro',slot:'bottom',em:'👖',cost:120,color:'#4a3826',rpg:1},
  {id:'greaves',name:'Grevas de aço',slot:'bottom',em:'🦿',cost:200,color:'#8b95a3',rpg:1},
  {id:'cape_red',name:'Capa vermelha',slot:'cape',em:'🧣',cost:180,color:'#a0302e',rpg:1},
  {id:'cape_blue',name:'Capa azul',slot:'cape',em:'🧣',cost:180,color:'#2c5aa0',rpg:1},
  {id:'cape_green',name:'Capa élfica',slot:'cape',em:'🧣',cost:200,color:'#2e7d4f',rpg:1},
  {id:'boots_leather',name:'Botas de couro',slot:'feet',em:'🥾',cost:150,color:'#5a3a22',rpg:1},
  {id:'sword',name:'Espada longa',slot:'hands',em:'⚔️',cost:280,color:'#cbd0d6',rpg:1},
  {id:'axe',name:'Machado de guerra',slot:'hands',em:'🪓',cost:300,color:'#b0483a',rpg:1}
];
export const itemById=id=>SHOP.find(s=>s.id===id);
export const STATMETA=[{k:'forca',l:'Força',i:'💪',c:'#ff5c5c'},{k:'musc',l:'Muscularidade',i:'🧬',c:'#c6ff3a'},
  {k:'explosao',l:'Explosão',i:'⚡',c:'#ffb13a'},{k:'cond',l:'Condicionamento',i:'🫁',c:'#4aa8ff'},
  {k:'resist',l:'Resistência',i:'🔋',c:'#ff6b9d'}];
