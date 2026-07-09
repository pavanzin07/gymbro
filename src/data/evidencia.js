/* ============ BASE DE EVIDÊNCIAS (PubMed) ============
   Referências reais que sustentam as decisões do gerador de treino.
   Cada entrada: o achado em linguagem simples + a decisão que o app
   toma com base nele. Link: https://pubmed.ncbi.nlm.nih.gov/<pmid>/ */
export const EVID=[
  {id:'freq',pmid:'27102172',autor:'Schoenfeld, Ogborn & Krieger',ano:2016,rev:'Sports Medicine',
   titulo:'Effects of Resistance Training Frequency on Measures of Muscle Hypertrophy',
   achado:'Treinar cada grupo muscular 2x por semana gera mais hipertrofia do que concentrar tudo em 1x.',
   decisao:'A divisão é montada pra cada músculo ser trabalhado ~2x por semana, seja qual for sua frequência.'},
  {id:'volume',pmid:'27433992',autor:'Schoenfeld, Ogborn & Krieger',ano:2017,rev:'Journal of Sports Sciences',
   titulo:'Dose-response relationship between weekly resistance training volume and muscle mass',
   achado:'Existe relação dose-resposta: ~10+ séries semanais por grupo muscular geram mais crescimento, com retorno decrescente.',
   decisao:'O volume semanal por grupo é calibrado em faixas (~10, ~14 ou ~18 séries) conforme sua escolha.'},
  {id:'carga',pmid:'28834797',autor:'Schoenfeld, Grgic, Ogborn & Krieger',ano:2017,rev:'J Strength Cond Res',
   titulo:'Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training',
   achado:'Músculo cresce numa faixa ampla de repetições, mas força máxima exige cargas altas (poucas reps).',
   decisao:'As faixas de repetições mudam com seu foco: força usa 4-6 reps nos compostos; hipertrofia 6-12; resistência 12-20.'},
  {id:'descanso',pmid:'26605807',autor:'Schoenfeld, Pope, Benik et al.',ano:2016,rev:'J Strength Cond Res',
   titulo:'Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men',
   achado:'Descansos mais longos (~3 min) superaram descansos curtos (1 min) em ganho de força e massa nos exercícios pesados.',
   decisao:'O timer de descanso já vem configurado por exercício: mais longo nos compostos pesados, mais curto nos isolados.'},
  {id:'ordem',pmid:'22344059',autor:'Simão, de Salles, Figueiredo et al.',ano:2012,rev:'Sports Medicine',
   titulo:'Exercise order in resistance training',
   achado:'O que você treina no começo da sessão progride mais. Multiarticulares primeiro rendem melhor.',
   decisao:'Cada dia começa pelos exercícios compostos (agachamento, supino, remada...) e termina nos isolados.'},
  {id:'iniciante',pmid:'12618576',autor:'Rhea, Alvar, Burkett & Ball',ano:2003,rev:'Med Sci Sports Exerc',
   titulo:'A meta-analysis to determine the dose response for strength development',
   achado:'Iniciantes progridem com menos volume e intensidade do que avançados — mais nem sempre é melhor no começo.',
   decisao:'Seu nível de experiência pré-seleciona o volume: quem está começando parte de uma dose menor e sobe com o tempo.'}
];
/* ---- Nutrição: sustenta o gerador de dia alimentar ---- */
export const EVID_DIETA=[
  {id:'prot-total',pmid:'28698222',autor:'Morton, Murphy, McKellar et al.',ano:2018,rev:'Br J Sports Med',
   titulo:'A systematic review, meta-analysis and meta-regression of protein supplementation',
   achado:'~1,6 g de proteína por kg de peso por dia maximiza o ganho de massa magra com treino de força.',
   decisao:'Sua meta de proteína (definida no Perfil) é o alvo nº 1 do gerador — as refeições são escolhidas pra batê-la.'},
  {id:'prot-dist',pmid:'29497353',autor:'Schoenfeld & Aragon',ano:2018,rev:'J Int Soc Sports Nutr',
   titulo:'How much protein can the body use in a single meal for muscle-building?',
   achado:'Distribuir a proteína em ~4 refeições (~0,4 g/kg por refeição) aproveita melhor o estímulo de síntese muscular.',
   decisao:'O plano padrão usa 4 refeições e espalha a proteína entre elas em vez de concentrar tudo numa só.'},
  {id:'freq-ref',pmid:'26024494',autor:'Schoenfeld, Aragon & Krieger',ano:2015,rev:'Nutrition Reviews',
   titulo:'Effects of meal frequency on weight loss and body composition',
   achado:'O total do dia importa muito mais que o número de refeições — 3, 4 ou 5 funcionam igual se as metas fecharem.',
   decisao:'Você escolhe quantas refeições cabem na sua rotina; o gerador fecha as metas em qualquer formato.'},
  {id:'aderencia',pmid:'25182101',autor:'Johnston, Kanters, Bandayrel et al.',ano:2014,rev:'JAMA',
   titulo:'Comparison of weight loss among named diet programs',
   achado:'Comparando dietas famosas, as diferenças são pequenas — o que decide o resultado é conseguir manter.',
   decisao:'Os pratos são comida brasileira de verdade (arroz, feijão, frango...) pra você conseguir seguir todo dia.'},
  {id:'janela',pmid:'23360586',autor:'Aragon & Schoenfeld',ano:2013,rev:'J Int Soc Sports Nutr',
   titulo:'Nutrient timing revisited: is there a post-exercise anabolic window?',
   achado:'A "janela anabólica" é bem mais ampla do que se pensava — o dia todo conta, não só o pós-treino.',
   decisao:'Nada de neura com horário: o gerador foca no total do dia, e o lanche encaixa onde for melhor pra você.'}
];
export const evidLink=pmid=>`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
