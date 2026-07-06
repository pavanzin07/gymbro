# Prompts para o Claude Code — versão em etapas

Mande **um prompt por vez**, na mesma sessão do Claude Code (ele mantém o contexto). Espere ele terminar e revise antes de mandar o próximo.

---

## PROMPT 1 — Contexto + estruturar o projeto

Você vai assumir a engenharia do MEU GYM BRO, um app web de academia que já existe como protótipo funcional nesta pasta.

O projeto: app de treino e dieta com filosofia de **guiar, não prescrever** — calcula tudo dos dados da pessoa (Mifflin-St Jeor, proteína 1,6–2,2 g/kg, gordura 0,8–1,2 g/kg), sempre apresenta 3 opções com % de recomendação + opção "Personalizar", e a decisão é do usuário. Tem gamificação RPG: personagem (raças Humano/Elfo/Anão/Besta) que ganha XP, moedas, atributos e equipamentos conforme o usuário treina de verdade.

Arquivos desta pasta:
- `meu-gym-bro.html` — o app inteiro num arquivo único (~2.500 linhas, JS vanilla, sem dependências, offline, mobile-first, tema escuro com accent #c6ff3a, interface pt-BR). 6 abas: Perfil, Treino, Conquistas, Dieta, Progresso, Bro.
- `MEU-GYM-BRO-analise.md` — análise completa do app. **Leia antes de codar.**

Dados: localStorage, chave `meu_gym_bro_v1`, objeto único `S` com: `profile` (anamnese), `choices`/`targets` (metas de macros), `routines[]` (exercícios com `history[]` de cargas → PRs), `sessions[]` (treinos registrados por dia), `meals[]`, `progress` (peso, medidas, água, `days{}` com check-ins diários), `goals[]`, `characters[]`/`activeChar`/`wallet` (RPG). XP/moedas/atributos/conquistas são derivados, não armazenados.

Regras invioláveis: (1) não quebrar nenhum comportamento do protótipo — ele é a referência; (2) migrar os dados existentes de `meu_gym_bro_v1` sem perda; (3) interface 100% pt-BR e mobile-first; (4) manter identidade visual (tema escuro, verde-limão, cards arredondados); (5) manter a filosofia de sugerir com opções, nunca prescrever; (6) continuar funcionando offline.

**Tarefa desta etapa:** inicialize um repositório Git e monte um projeto **Vite + JavaScript vanilla em módulos ES** (sem framework pesado). Quebre o HTML único em módulos por domínio: `state.js` (load/save/migração), `perfil.js`, `treino.js`, `dieta.js`, `progresso.js`, `conquistas.js`, `personagem.js` (avatar SVG), `ui.js` (modal, toast, chips, gráficos SVG) e `data/` (alimentos, exercícios, itens da loja, raças). O build final deve se comportar exatamente como o protótipo. Mantenha `meu-gym-bro.html` intocado como referência.

Antes de executar, me apresente um plano curto com a estrutura de pastas proposta e aguarde meu ok.

---

## PROMPT 2 — Testes

Agora configure testes. **Vitest** para os cálculos puros: TMB/TDEE e fator de atividade, geração das 3 opções de macros (incluindo custom), totais de refeição e do dia, streak, XP/moedas/nível, progresso de metas, PR e 1RM estimado. **Playwright** para 3–4 fluxos E2E críticos: criar perfil → metas aparecem na Dieta; adicionar exercício via sugestões; registrar sessão de treino → PR aparece em Conquistas; check-in diário → moedas do personagem sobem. Rode tudo e me mostre o resultado verde. Corrija o que os testes revelarem, sem mudar comportamento esperado do protótipo.

---

## PROMPT 3 — PWA

Transforme o app em PWA instalável: manifest completo (nome MEU GYM BRO, tema #0d0f12, accent #c6ff3a), service worker com cache pra funcionar 100% offline, e ícones gerados no estilo do app (bíceps/halter em verde-limão sobre fundo escuro). Teste a instalação e o offline e me mostre como validar no meu celular.

---

## PROMPT 4 — Feature: diário alimentar por data

Hoje a aba Dieta é um plano fixo (modelo de refeições) e o "dieta em dia" do check-in é manual. Crie o **diário alimentar por data**: registrar o que foi comido em cada dia (reaproveitando a base de alimentos e os combos sugeridos), resumo de macros do dia real vs metas, navegação entre dias, e marcação automática de "dieta em dia" no check-in quando calorias e proteína baterem as metas com tolerância de ±10%. O plano fixo continua existindo como "modelo" que pode ser aplicado ao dia com um toque. Não esqueça: isso deve alimentar as moedas/XP do personagem como o toggle manual fazia.

---

## PROMPT 5 — Feature: timer de descanso + handoff

Duas coisas pra fechar:

1. **Timer de descanso**: durante o registro de treino, um cronômetro por exercício usando o campo `rest` já existente (padrão se vazio: 90s), com contagem regressiva visível, aviso sonoro e vibração (quando suportado) ao terminar, e botões +15s/pular.

2. **HANDOFF.md**: documente a nova arquitetura (pastas e responsabilidade de cada módulo), como rodar (`dev`, `build`, `test`), o que mudou em relação ao protótipo, e os próximos passos sugeridos — backend + login para sincronização entre aparelhos e a parte social (ver conquistas e recordes de amigos, desafios), que é o objetivo de longo prazo do projeto.

---

## Dica de uso

Se precisar recomeçar numa sessão nova do Claude Code, reenvie o PROMPT 1 até a lista de regras e diga em qual etapa parou — os arquivos e o Git guardam o progresso.
