# MEU GYM BRO — Análise do App

*Raio-x completo do estado atual, pontos fortes, melhorias possíveis e ideias de evolução.*

---

## 1. Visão geral

O **MEU GYM BRO** é um app web de academia com uma filosofia clara: **não prescrever, e sim guiar**. Em vez de entregar dieta e treino prontos, ele dá conhecimento e opções baseadas em evidência (sempre com "3 opções + % de recomendação") e deixa a decisão final na mão da pessoa. Por cima disso, tem uma camada de **gamificação estilo RPG** que transforma consistência em progresso visível.

Hoje o app está em **6 abas**: Perfil, Treino, Conquistas, Dieta, Progresso e Bro (personagem).

Tecnicamente é **um único arquivo HTML** (~2.500 linhas) com HTML, CSS e JavaScript embutidos, sem dependências externas, funcionando 100% offline. Os dados ficam salvos no navegador (localStorage), com exportar/importar backup em JSON.

---

## 2. O que já existe, aba por aba

### 🧬 Perfil (anamnese + metas)
- Questionário: sexo, idade, altura, peso, objetivo (perder, massa, ganhar peso, força, definição, prova, fortalecimento, outro esporte), nível, tempo de treino, frequência, outro esporte e intensidade do dia a dia, além de **restrições alimentares** (lactose, vegetariano, vegano, glúten).
- Cálculo de **TMB (Mifflin-St Jeor)** e **gasto diário** com fator de atividade validado (corrigido pra não exagerar), apresentado como estimativa a ajustar pelo peso real.
- **Sugestões com 3 opções + "Personalizar"** para calorias, proteína (1,6–2,2 g/kg) e gordura (0,8–1,2 g/kg); o carboidrato preenche o resto. Tudo recalcula quando o peso muda.
- Sugestão de **divisão de treino** com detalhe do que cada dia treina.

### 🏋️ Treino
- Criar/editar/apagar rotinas e exercícios (nome, grupo muscular, séries, reps, carga, descanso, observação).
- **Sugestões de exercício encadeadas** por grau de recomendação (★), que não repetem e cobrem o foco do treino.
- **Registro de treino diário**: card "Treino de hoje", registrar sessão com carga e minutos por exercício, **repetir último treino**, histórico com gráfico de volume, e detalhe de cada sessão.
- **Revisão do GymBro**: detecta desequilíbrios (muito peito/pouca costas, séries demais num exercício, movimentos repetidos) e sugere ajustes clicáveis.

### 🍽️ Dieta
- Refeições editáveis, contagem de macros com base de alimentos por 100 g.
- **Sugestões de refeição prontas** (combos), filtradas pelas restrições alimentares.
- **Revisão da dieta**: avalia se está coerente com a meta e dá 3 opções de carboidrato.

### 📈 Progresso
- **Check-in diário**: treino, dieta, alongamento; **cardio/atividade** com duração e intensidade (calorias estimadas); água em mL e copos de 200 ml.
- Registro de **peso e medidas** com gráficos e histórico apagável.
- Sequência (streak) e histórico visual dos últimos 21 dias.

### 🏆 Conquistas
- **Metas customizáveis** (bater carga, chegar num peso, N treinos, água por X dias, sequência) com barra de progresso.
- **12 conquistas** automáticas por marcos.
- **Recordes por exercício** (PR, 1RM estimado) com **progressão de carga detalhada** ao toque.

### 🦾 Bro (personagem RPG)
- **Vários personagens** (criar, trocar, apagar) com moedas/nível/itens compartilhados.
- 4 raças (Humano, Elfo, Anão, Besta) com traços próprios; tom de pele, cor e estilo de cabelo.
- **Estatísticas** (força, muscularidade, explosão, condicionamento, resistência), nível, XP, **classe** que evolui e medidor de Poder.
- **Moedas** ganhas com consistência e **loja** com equipamentos de academia e **armaduras medievais** (elmo, armadura, capa, botas, espada, machado) que aparecem no avatar.

---

## 3. Pontos fortes

- **Filosofia consistente e diferenciada.** Quase nenhum app de fitness "ensina e deixa escolher"; a maioria prescreve. Isso é um diferencial real de produto.
- **Base científica cuidadosa** (Mifflin-St Jeor, faixas de proteína/gordura por kg, fatores de atividade dentro do validado).
- **Gamificação que puxa o comportamento certo** — moedas e stats vêm de treino, dieta, água, recordes e consistência, não de dinheiro.
- **Tudo integrado**: registrar carga alimenta recordes, conquistas, stats e moedas de uma vez só.
- **Zero dependências, offline, leve e privado** — roda em qualquer navegador sem instalar nada.
- **Visual coeso** com identidade forte (tema escuro, verde-limão, cara de academia + RPG).

---

## 4. Melhorias possíveis

### Experiência / produto
- **Dieta é um plano fixo, não um diário por dia.** Hoje as refeições são um "modelo" e o "dieta em dia" é um toque manual. O ideal seria registrar o que foi comido **por data**, para os macros e a aderência refletirem o dia real (como já acontece com treino e água).
- **Metas manuais (botão 🎯) x sugestões do Perfil podem se sobrepor.** Se a pessoa edita no 🎯 Metas e depois muda o peso no Perfil, o cálculo pode sobrescrever. Vale unificar num único ponto de verdade.
- **Descanso entre séries sem cronômetro.** O tempo de descanso é só um número; um timer de descanso durante o treino seria muito útil.
- **Onboarding/tutorial.** Um passo a passo curto na primeira abertura ajudaria a mostrar o fluxo (Perfil → Treino → registrar → evoluir personagem).
- **Feedback de metas atingidas.** Quando uma meta/conquista é desbloqueada, um destaque/animação (e não só o número mudando) aumenta a recompensa.

### Técnicas
- **Arquivo único de ~2.500 linhas.** Funciona, mas dificulta manutenção. Modularizar (separar por área) e adotar um build ajuda a escalar — esse é o momento natural de passar parte pro Claude Code.
- **Dados só no navegador (localStorage).** Se limpar o navegador ou trocar de aparelho, perde tudo (só o backup manual salva). **Conta + nuvem** resolveria isso e destrava o social.
- **Sem validação forte de entrada.** Campos aceitam valores estranhos (peso negativo, datas futuras). Vale validar.
- **Sem testes automatizados.** À medida que cresce, testes evitam quebrar o que já funciona.

### Conteúdo
- **Base de alimentos pequena** (~28 itens). Ampliar (ou permitir busca) aumenta muito a utilidade da contagem de macros.
- **Biblioteca de exercícios sem instruções.** Adicionar dica de execução/músculo trabalhado por exercício reforça a proposta "educar".

---

## 5. Ideias de novas funcionalidades

### Curto prazo (encaixam bem no que já existe)
- **Timer de descanso** e modo "treino em andamento" (marcar série por série, com o cronômetro rodando).
- **Diário alimentar por data** (registrar o que comeu no dia, separado do plano).
- **Lembretes/notificações** (hora de treinar, beber água, registrar peso).
- **Escudo, arco, coroa e mais peças** de RPG na loja; **conquistas dão itens exclusivos**.
- **Fotos de progresso** (antes/depois) junto com peso e medidas.

### Médio prazo
- **Conta e sincronização na nuvem** (salvar entre aparelhos, não perder dados).
- **PWA instalável** (ícone na tela inicial, abre como app, funciona offline).
- **Sugestões de playlist de música** (parte da ideia original do projeto).
- **Periodização automática** (o app sugere variar o treino a cada X semanas com base na progressão real).
- **Modo "recomposição/cutting/bulking" guiado** que ajusta metas ao longo das semanas conforme o peso muda.

### Longo prazo (o grande salto)
- **Parte social**: ver conquistas, recordes e evolução dos **amigos**; comparar cargas; feed de conquistas — que era a ideia central do projeto original.
- **Desafios entre amigos** (quem bate mais treinos no mês, PRs, streak) alimentando o sistema de moedas/RPG.
- **Ranking/guildas** estilo RPG, onde treinar rende XP coletivo.
- **Exportar relatório** (PDF do progresso pra levar ao personal/nutricionista).

---

## 6. Sugestão de priorização

1. **Diário alimentar por data + timer de descanso** — completam o "registro do dia a dia" e são baixo custo, alto valor.
2. **Ampliar base de alimentos e biblioteca de exercícios com instruções** — reforça a proposta de educar.
3. **PWA + conta/nuvem** — destrava usar de verdade no dia a dia e entre aparelhos (bom momento pro Claude Code assumir a engenharia).
4. **Parte social** — o diferencial de longo prazo, que depende da nuvem estar pronta.

---

*Documento gerado a partir da revisão do arquivo `meu-gym-bro.html` (versão atual, ~2.500 linhas).*
