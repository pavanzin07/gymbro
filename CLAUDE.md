# MEU GYM BRO — instruções pro Claude Code

App de treino/dieta em pt-BR: vanilla JS ES modules + Vite, offline-first (localStorage `meu_gym_bro_v1`), PWA. Sem framework, sem TypeScript. Arquitetura completa em HANDOFF.md.

## Ambiente (Windows)

Node/npm **não estão no PATH** dos shells. Use o caminho completo:

```bash
"/c/Program Files/nodejs/node.exe" node_modules/vitest/vitest.mjs run          # unit tests
"/c/Program Files/nodejs/node.exe" node_modules/vite/bin/vite.js build         # build
PATH="/c/Program Files/nodejs:$PATH" "/c/Program Files/nodejs/node.exe" node_modules/@playwright/test/cli.js test  # E2E
```

Preview no app: launch.json `vite-dev` (porta 5173). Playwright sobe o próprio server na 5183.

## Regras do código

- **Estilo**: código compacto, denso, comentários em pt-BR só quando explicam decisão. Siga o estilo existente (sem ponto e vírgula extra, template literals pra HTML).
- **onclick global**: os templates HTML usam `onclick="funcao(...)"`. Toda função usada assim precisa ser `export`ada — main.js faz `Object.assign(window, ...módulos)`. **Nunca** use IIFE inline em onclick (quebra o escopo de módulo).
- **Datas**: strings `YYYY-MM-DD`. Pra converter em `Date`, use SEMPRE `parseLocalDate()` de ui.js — `new Date('YYYY-MM-DD')` retroage um dia em fusos negativos (Brasil).
- **Estado**: mutações em `S` devem terminar com `save()` + re-render das abas afetadas. `save()` dispara o evento `gymbro:saved` que o sync escuta — não chame em loop.
- **Escapes**: `esc()` pra conteúdo HTML, `escAttr()` pra nomes dentro de `onclick='...'`.
- **Schema**: refeições são `mealTemplate` (modelo) + `mealDiary` (por data). O array antigo `meals` não existe mais — migração em state.js `load()` e main.js `importData()`.
- **SW**: só registra em produção (`import.meta.env.PROD`); caminhos relativos em tudo (app roda em subdiretório no GitHub Pages).

## Testes

Cálculos puros ficam em módulos testáveis (coach.js, perfil.js computeMetrics, sync.js mergeStates). Feature nova com lógica = teste unitário junto. Rode unit + E2E antes de commitar mudança de comportamento.
