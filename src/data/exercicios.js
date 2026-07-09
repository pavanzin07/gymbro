/* ============ BIBLIOTECA DE EXERCÍCIOS ============
   g: nota 1-3 (prioridade) · c: 1=composto · d: dica de execução pra iniciante */
export const EXLIB={
  'Peito':[
    {n:'Supino reto (barra)',g:3,c:1,reps:'6-10',d:'Deitado no banco, desça a barra até o peito e empurre. Pés firmes no chão.'},
    {n:'Supino inclinado com halteres',g:3,c:1,reps:'8-12',d:'Banco a 30-45°, desça os halteres até a altura do peito e suba juntando.'},
    {n:'Supino reto com halteres',g:2,c:1,reps:'8-12',d:'Como o supino de barra, mas com um haltere em cada mão.'},
    {n:'Crossover na polia',g:2,c:0,reps:'12-15',d:'Em pé entre as polias, junte as mãos à frente do peito como um abraço.'},
    {n:'Crucifixo com halteres',g:2,c:0,reps:'10-15',d:'Deitado, abra os braços meio dobrados e feche como um abraço.'},
    {n:'Flexão de braço',g:2,c:1,reps:'máx',d:'Corpo reto feito prancha, desça o peito até quase o chão e suba.'},
    {n:'Supino máquina',g:2,c:1,reps:'8-12',d:'Ajuste o banco, pegadas na altura do peito, empurre à frente.'},
    {n:'Peck deck (voador)',g:1,c:0,reps:'12-15',d:'Sentado na máquina, junte os braços à frente apertando o peito.'}
  ],
  'Costas':[
    {n:'Barra fixa / Puxada alta',g:3,c:1,reps:'6-12',d:'Puxe até o queixo chegar na pegada, peito aberto, desça controlando.'},
    {n:'Remada curvada (barra)',g:3,c:1,reps:'6-10',d:'Tronco inclinado, costas retas, puxe a barra até a barriga.'},
    {n:'Remada baixa (polia)',g:2,c:1,reps:'8-12',d:'Sentado, puxe o triângulo até a barriga espremendo as costas.'},
    {n:'Remada unilateral (serrote)',g:2,c:1,reps:'8-12',d:'Um joelho no banco, puxe o haltere até a cintura, cotovelo pra trás.'},
    {n:'Puxada triângulo (neutra)',g:2,c:1,reps:'8-12',d:'Puxe o triângulo até o peito, desça devagar.'},
    {n:'Remada cavalinho',g:2,c:1,reps:'8-12',d:'Tronco inclinado sobre a barra, puxe com as duas mãos até a barriga.'},
    {n:'Pulldown na polia',g:1,c:0,reps:'12-15',d:'Braços quase esticados, puxe a barra até a coxa usando as costas.'},
    {n:'Levantamento terra',g:3,c:1,reps:'4-8',d:'Agache e levante a barra do chão com as costas RETAS. Peça orientação na 1ª vez.'}
  ],
  'Pernas':[
    {n:'Agachamento livre',g:3,c:1,reps:'5-10',d:'Pés na largura dos ombros, agache como se fosse sentar, joelhos na direção dos pés.'},
    {n:'Leg press 45°',g:3,c:1,reps:'8-12',d:'Empurre a plataforma sem travar os joelhos no final.'},
    {n:'Levantamento terra romeno (stiff)',g:3,c:1,reps:'8-12',d:'Pernas quase retas, desça a barra rente às pernas sentindo alongar atrás da coxa.'},
    {n:'Cadeira extensora',g:2,c:0,reps:'10-15',d:'Estique as pernas contra o apoio e desça devagar.'},
    {n:'Mesa flexora',g:2,c:0,reps:'10-15',d:'Deitado, dobre os joelhos puxando o apoio com os calcanhares.'},
    {n:'Afundo / Passada',g:2,c:1,reps:'10-12',d:'Dê um passo à frente e desça o joelho de trás até quase o chão.'},
    {n:'Panturrilha em pé',g:2,c:0,reps:'12-20',d:'Fique na ponta dos pés, segure 1s lá em cima e desça devagar.'},
    {n:'Cadeira adutora/abdutora',g:1,c:0,reps:'12-20',d:'Abra ou feche as pernas contra o peso, sem pressa.'},
    {n:'Hack machine',g:2,c:1,reps:'8-12',d:'Agachamento guiado na máquina — costas apoiadas o tempo todo.'},
    {n:'Elevação pélvica (hip thrust)',g:2,c:1,reps:'8-12',d:'Costas no banco, suba o quadril com a barra apertando o glúteo no topo.'}
  ],
  'Ombro':[
    {n:'Desenvolvimento com halteres',g:3,c:1,reps:'8-12',d:'Sentado, empurre os halteres pra cima até quase esticar os braços.'},
    {n:'Elevação lateral',g:3,c:0,reps:'12-15',d:'Levante os halteres pelos lados até a altura dos ombros, cotovelos suaves.'},
    {n:'Desenvolvimento Arnold',g:2,c:1,reps:'8-12',d:'Comece com as palmas viradas pra você e gire enquanto empurra pra cima.'},
    {n:'Crucifixo inverso (posterior)',g:2,c:0,reps:'12-15',d:'Tronco inclinado, abra os braços pros lados como asas.'},
    {n:'Desenvolvimento militar (barra)',g:2,c:1,reps:'6-10',d:'Em pé, empurre a barra do peito até acima da cabeça, abdômen firme.'},
    {n:'Elevação frontal',g:1,c:0,reps:'12-15',d:'Levante o haltere à frente até a altura do ombro, sem balançar o corpo.'},
    {n:'Remada alta',g:1,c:1,reps:'10-12',d:'Puxe a barra rente ao corpo até a altura do peito, cotovelos pra cima.'}
  ],
  'Bíceps':[
    {n:'Rosca direta (barra)',g:3,c:0,reps:'8-12',d:'Cotovelos colados no corpo, suba a barra sem balançar o tronco.'},
    {n:'Rosca alternada com halteres',g:2,c:0,reps:'8-12',d:'Suba um haltere de cada vez girando a palma pra cima.'},
    {n:'Rosca scott',g:2,c:0,reps:'8-12',d:'Braços apoiados no banco, suba e desça devagar sem esticar de vez.'},
    {n:'Rosca martelo',g:2,c:0,reps:'8-12',d:'Palmas viradas uma pra outra, suba os halteres sem girar.'},
    {n:'Rosca concentrada',g:1,c:0,reps:'10-15',d:'Sentado, cotovelo apoiado na coxa, suba o haltere devagar.'},
    {n:'Rosca na polia',g:1,c:0,reps:'10-15',d:'Igual à rosca direta, com o cabo puxando o tempo todo.'}
  ],
  'Tríceps':[
    {n:'Tríceps na corda (pulley)',g:3,c:0,reps:'10-15',d:'Cotovelos colados no corpo, empurre a corda pra baixo abrindo no final.'},
    {n:'Tríceps testa',g:3,c:0,reps:'8-12',d:'Deitado, desça a barra até a testa dobrando só os cotovelos.'},
    {n:'Paralelas / Mergulho',g:2,c:1,reps:'8-12',d:'Apoiado nas barras, desça dobrando os cotovelos e suba.'},
    {n:'Tríceps francês',g:2,c:0,reps:'8-12',d:'Haltere atrás da cabeça, estique os braços pra cima.'},
    {n:'Supino fechado',g:2,c:1,reps:'6-10',d:'Supino com pegada estreita, cotovelos perto do corpo.'},
    {n:'Tríceps coice',g:1,c:0,reps:'12-15',d:'Tronco inclinado, estique o braço pra trás mantendo o cotovelo fixo.'}
  ],
  'Core':[
    {n:'Prancha isométrica',g:3,c:0,reps:'30-60s',d:'Antebraços no chão, corpo reto, aperte o abdômen e segure.'},
    {n:'Abdominal infra (elevação de pernas)',g:2,c:0,reps:'12-20',d:'Deitado, suba as pernas juntas sem arquear a lombar.'},
    {n:'Prancha lateral',g:2,c:0,reps:'30-45s',d:'De lado, apoiado num antebraço, corpo reto. Segure.'},
    {n:'Abdominal na polia',g:2,c:0,reps:'12-15',d:'Ajoelhado, puxe o peso dobrando o tronco pra baixo.'},
    {n:'Rotação (russian twist)',g:1,c:0,reps:'15-20',d:'Sentado, incline o tronco e gire de um lado pro outro.'}
  ]
};
export const GRP_SYN={'quadríceps':'Pernas','glúteo':'Pernas','posterior':'Pernas','coxa':'Pernas','panturrilha':'Pernas',
  'braços':'Bíceps','push':'Peito','pull':'Costas','superior':'Peito','inferior':'Pernas','corpo todo':'Peito'};
// dica de execução pelo nome (usado no registro de carga e nas rotinas geradas)
export function exDica(name){
  const n=(name||'').toLowerCase();
  for(const g in EXLIB){const hit=EXLIB[g].find(e=>e.n.toLowerCase()===n);if(hit)return hit.d||'';}
  return'';
}
