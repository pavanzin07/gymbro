/* ============ BIBLIOTECA DE EXERCÍCIOS ============ */
export const EXLIB={
  'Peito':[
    {n:'Supino reto (barra)',g:3,c:1,reps:'6-10'},{n:'Supino inclinado com halteres',g:3,c:1,reps:'8-12'},
    {n:'Supino reto com halteres',g:2,c:1,reps:'8-12'},{n:'Crossover na polia',g:2,c:0,reps:'12-15'},
    {n:'Crucifixo com halteres',g:2,c:0,reps:'10-15'},{n:'Flexão de braço',g:2,c:1,reps:'máx'},
    {n:'Supino máquina',g:2,c:1,reps:'8-12'},{n:'Peck deck (voador)',g:1,c:0,reps:'12-15'}
  ],
  'Costas':[
    {n:'Barra fixa / Puxada alta',g:3,c:1,reps:'6-12'},{n:'Remada curvada (barra)',g:3,c:1,reps:'6-10'},
    {n:'Remada baixa (polia)',g:2,c:1,reps:'8-12'},{n:'Remada unilateral (serrote)',g:2,c:1,reps:'8-12'},
    {n:'Puxada triângulo (neutra)',g:2,c:1,reps:'8-12'},{n:'Remada cavalinho',g:2,c:1,reps:'8-12'},
    {n:'Pulldown na polia',g:1,c:0,reps:'12-15'},{n:'Levantamento terra',g:3,c:1,reps:'4-8'}
  ],
  'Pernas':[
    {n:'Agachamento livre',g:3,c:1,reps:'5-10'},{n:'Leg press 45°',g:3,c:1,reps:'8-12'},
    {n:'Levantamento terra romeno (stiff)',g:3,c:1,reps:'8-12'},{n:'Cadeira extensora',g:2,c:0,reps:'10-15'},
    {n:'Mesa flexora',g:2,c:0,reps:'10-15'},{n:'Afundo / Passada',g:2,c:1,reps:'10-12'},
    {n:'Panturrilha em pé',g:2,c:0,reps:'12-20'},{n:'Cadeira adutora/abdutora',g:1,c:0,reps:'12-20'},
    {n:'Hack machine',g:2,c:1,reps:'8-12'},{n:'Elevação pélvica (hip thrust)',g:2,c:1,reps:'8-12'}
  ],
  'Ombro':[
    {n:'Desenvolvimento com halteres',g:3,c:1,reps:'8-12'},{n:'Elevação lateral',g:3,c:0,reps:'12-15'},
    {n:'Desenvolvimento Arnold',g:2,c:1,reps:'8-12'},{n:'Crucifixo inverso (posterior)',g:2,c:0,reps:'12-15'},
    {n:'Desenvolvimento militar (barra)',g:2,c:1,reps:'6-10'},{n:'Elevação frontal',g:1,c:0,reps:'12-15'},
    {n:'Remada alta',g:1,c:1,reps:'10-12'}
  ],
  'Bíceps':[
    {n:'Rosca direta (barra)',g:3,c:0,reps:'8-12'},{n:'Rosca alternada com halteres',g:2,c:0,reps:'8-12'},
    {n:'Rosca scott',g:2,c:0,reps:'8-12'},{n:'Rosca martelo',g:2,c:0,reps:'8-12'},
    {n:'Rosca concentrada',g:1,c:0,reps:'10-15'},{n:'Rosca na polia',g:1,c:0,reps:'10-15'}
  ],
  'Tríceps':[
    {n:'Tríceps na corda (pulley)',g:3,c:0,reps:'10-15'},{n:'Tríceps testa',g:3,c:0,reps:'8-12'},
    {n:'Paralelas / Mergulho',g:2,c:1,reps:'8-12'},{n:'Tríceps francês',g:2,c:0,reps:'8-12'},
    {n:'Supino fechado',g:2,c:1,reps:'6-10'},{n:'Tríceps coice',g:1,c:0,reps:'12-15'}
  ],
  'Core':[
    {n:'Prancha isométrica',g:3,c:0,reps:'30-60s'},{n:'Abdominal infra (elevação de pernas)',g:2,c:0,reps:'12-20'},
    {n:'Prancha lateral',g:2,c:0,reps:'30-45s'},{n:'Abdominal na polia',g:2,c:0,reps:'12-15'},
    {n:'Rotação (russian twist)',g:1,c:0,reps:'15-20'}
  ]
};
export const GRP_SYN={'quadríceps':'Pernas','glúteo':'Pernas','posterior':'Pernas','coxa':'Pernas','panturrilha':'Pernas',
  'braços':'Bíceps','push':'Peito','pull':'Costas','superior':'Peito','inferior':'Pernas','corpo todo':'Peito'};
