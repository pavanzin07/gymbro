# 💪 MEU GYM BRO

App de **treino + dieta com gamificação RPG**, em português, offline-first e instalável (PWA). Calcula suas metas de calorias e macros, sugere divisões de treino e exercícios, registra cargas e evolução, e transforma sua consistência em XP, moedas e equipamentos pro seu personagem.

## Funcionalidades

- **Perfil inteligente**: TDEE/TMB por Mifflin-St Jeor; sempre 3 opções de calorias, proteína e gordura + personalização — nunca prescreve, você escolhe
- **Treino**: divisões sugeridas pro seu perfil, biblioteca de exercícios por grupo muscular, registro de carga com PR automático, timer de descanso com som e vibração
- **Coach de progressão**: detecta estagnação/regressão nas últimas sessões e sugere o próximo passo (+2,5% de carga, +1 rep ou deload)
- **Dieta**: diário alimentar por data com modelo copiável, macros por refeição, combos prontos com filtro de restrições (vegano, lactose...), "dieta em dia" automática ao bater as metas
- **Progresso**: check-in diário, água, peso, medidas, sequência (streak), tendências (kg/semana, aderência, volume) e previsão de chegada na meta
- **RPG**: personagem evolui com XP e moedas ganhas treinando; loja de equipamentos, conquistas e metas
- **Offline-first**: tudo salvo localmente; funciona sem internet
- **Cloud sync opcional**: conta por e-mail/senha via Supabase, merge inteligente entre aparelhos ([SETUP-SYNC.md](SETUP-SYNC.md))

## Stack

Vanilla JavaScript (ES modules) + Vite. Zero dependências em runtime — o Supabase só entra no bundle se configurado. Vitest (73 testes unitários) + Playwright (8 fluxos E2E).

## Rodando

```bash
npm install
npm run dev        # dev server em http://localhost:5173
npm run build      # build de produção em dist/
npm test           # testes unitários (Vitest)
npm run test:e2e   # testes E2E (Playwright)
```

## Publicando

Build 100% estático — veja [DEPLOY.md](DEPLOY.md) (GitHub Pages automático ou Netlify). Depois de publicado, abra no celular e use "Adicionar à tela inicial" pra instalar como app.

## Arquitetura

Documentação completa em [HANDOFF.md](HANDOFF.md) — estrutura de módulos, schema do estado (`localStorage`), fluxo de dados e decisões.
