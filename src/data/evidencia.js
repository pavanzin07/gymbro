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
export const evidLink=pmid=>`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
