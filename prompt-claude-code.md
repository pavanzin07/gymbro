# Prompt para o Claude Code — copie tudo abaixo e cole no Claude Code

---

Você vai assumir a engenharia do **MEU GYM BRO**, um app web de academia que já existe como protótipo funcional nesta pasta. Leia este briefing inteiro antes de escrever qualquer código.

## O projeto

MEU GYM BRO é um app de treino e dieta com uma filosofia central: **guiar, não prescrever**. Ele nunca entrega treino ou dieta prontos — calcula tudo a partir dos dados da pessoa (equação Mifflin-St Jeor, faixas de 1,6–2,2 g/kg de proteína, 0,8–1,2 g/kg de gordura), apresenta sempre **3 opções com percentual de recomendação + opção "Personalizar"**, e a decisão final é sempre do usuário. Por cima disso há uma camada de **gamificação RPG**: um personagem (4 raças: Humano, Elfo, Anão, Besta) que ganha XP, moedas, atributos e equipamentos conforme o usuário treina de verdade.

## Estado atual

- `meu-gym-bro.html` — o app inteiro num único arquivo (~2.500 linhas: CSS + HTML + ~130 funções JS vanilla). Funciona 100% offline, sem dependências, mobile-first, tema escuro (fundo #0d0f12, accent verde-limão #c6ff3a), interface em pt-BR.
- `MEU-GYM-BRO-analise.md` — análise completa do app: funcionalidades por aba, pontos fortes, melhorias e roadmap priorizado. **Leia este arquivo.**

O app tem 6 abas: **Perfil** (anamnese + metas calculadas com 3 opções), **Treino** (rotinas, exercícios com sugestões encadeadas por grau de recomendação, registro de sessões diárias com carga/minutos, revisão de equilíbrio muscular), **Conquistas** (metas customizáveis, 12 conquistas, PRs com progressão de carga detalhada por exercício), **Dieta** (refeições, macros, base de alimentos por 100 g, combos sugeridos filtrados por restrição alimentar, revisão da dieta), **Progresso** (check-in diário: treino/dieta/alongamento/cardio com intensidade, água em ml, peso e medidas com gráficos), **Bro** (personagem RPG com vários personagens, loja de equipamentos incluindo armaduras medievais, atributos, nível, classe).

## Modelo de dados (localStorage, chave `meu_gym_bro_v1`)

Objeto único `S` com:
- `profile` — anamnese: sexo, idade, altura, peso, objetivo, nível, frequência, outro esporte, estilo de vida, restrições alimentares
- `choices` — opção escolhida (a/b/c/custom) para kcal/proteína/gordura + valores custom
- `targets` — metas finais {kcal, prot, carb, fat}
- `routines[]` — treinos; cada exercício tem `history[]` de {date, load, reps} (alimenta PRs)
- `sessions[]` — registros diários de treino {date, routineId, entries[], volume, minutes}
- `meals[]` — refeições planejadas com alimentos e macros
- `progress` — {weight[], measures[], waterGoalMl, days{data → {workout, diet, stretch, waterMl, activities[]}}}
- `goals[]` — metas do usuário (carga, peso, treinos, água, sequência)
- `characters[]`, `activeChar`, `wallet` — personagens RPG e carteira compartilhada (moedas = ganhas − gastas, calculadas de W/D/água/PRs/conquistas)

XP, moedas, atributos e conquistas são **derivados** (recalculados de `progress.days`, `history` e `sessions`), não armazenados.

## Regras invioláveis

1. **Não quebrar nada que já funciona.** O protótipo é o comportamento de referência.
2. **Migração de dados**: usuários já têm dados na chave `meu_gym_bro_v1`. Qualquer refactor deve ler esse formato e migrar sem perda.
3. **Interface 100% em português (pt-BR)** e mobile-first.
4. **Manter a identidade visual** (tema escuro, verde-limão, cards arredondados, emojis).
5. **Manter a filosofia**: sugerir com opções e explicação, nunca prescrever; sempre haver opção de personalizar.
6. O app deve continuar **funcionando offline**.

## Suas tarefas, em fases (uma de cada vez, commitando ao final de cada uma)

### Fase 1 — Estruturar o projeto
Inicialize um repositório Git. Monte um projeto **Vite + JavaScript vanilla em módulos ES** (sem framework pesado por enquanto). Quebre o HTML único em módulos por domínio: `state.js` (load/save/migração), `perfil.js`, `treino.js`, `dieta.js`, `progresso.js`, `conquistas.js`, `personagem.js` (avatar SVG), `ui.js` (modal, toast, chips, gráficos SVG), `data/` (base de alimentos, biblioteca de exercícios, itens da loja, raças). O resultado buildado deve se comportar exatamente como o protótipo. Mantenha o `meu-gym-bro.html` original intocado como referência.

### Fase 2 — Testes
Configure **Vitest** para os cálculos puros (TMB/TDEE, opções de macros, totais de refeição, streak, XP/moedas/nível, progresso de metas, PR/1RM) e **Playwright** para 3–4 fluxos E2E críticos (criar perfil → ver metas; adicionar exercício por sugestão; registrar sessão → PR aparece; check-in → moedas sobem). Rode tudo e deixe verde.

### Fase 3 — PWA
Manifest + service worker (instalável, ícone, offline completo). Gere os ícones a partir do tema do app.

### Fase 4 — Duas features novas
1. **Diário alimentar por data**: hoje a dieta é um plano fixo; crie registro do que foi comido por dia (reaproveitando os combos e a base de alimentos), com o resumo de macros do dia real e marcação automática de "dieta em dia" quando bater as metas (±10%).
2. **Timer de descanso**: durante o registro de treino, um cronômetro de descanso por exercício (usa o campo `rest` já existente), com aviso sonoro/vibração ao terminar.

### Fase 5 — Relatório
Ao final, escreva um `HANDOFF.md` descrevendo a nova arquitetura, como rodar (`dev`, `build`, `test`), o que mudou e o que sugere como próximos passos (backend/login para sincronização e a parte social de conquistas entre amigos está no roadmap).

## Como começar

1. Leia `MEU-GYM-BRO-analise.md` e depois percorra `meu-gym-bro.html` inteiro para entender as funções.
2. Me apresente um plano curto da Fase 1 (estrutura de pastas proposta) antes de executar.
3. Execute fase por fase, me mostrando o resultado e rodando os testes antes de seguir.

Pode começar.
