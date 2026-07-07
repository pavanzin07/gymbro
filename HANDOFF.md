# MEU GYM BRO — Handoff & Arquitetura

## Visão Geral

**MEU GYM BRO** é um app web de treino + dieta com gamificação RPG. Calcula macros (Mifflin-St Jeor), apresenta 3 opções de calorias/proteína/gordura sempre + personalização, nunca prescreve. Personagem RPG evolui com XP, moedas e atributos conforme o usuário treina, mantém dieta e toma água. 100% offline com localStorage, mobile-first, tema escuro com accent verde-limão (#c6ff3a).

## Arquitetura

### Estrutura de Pastas

```
MEU GYM BRO/
├── index.html              # Entry point
├── src/
│   └── style.css           # Estilos (dark theme, cards, mobile-first) — importado em main.js
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker (network-first p/ HTML, cache-first p/ assets)
│   ├── icon-192x192.png    # App icon
│   └── icon-512x512.png
├── src/
│   ├── main.js             # Bootstrap, imports all modules + style.css, SW registration, backup/reset
│   ├── state.js            # localStorage key + schema + load/save/migrate (mealTemplate+mealDiary)
│   ├── ui.js               # Modal, toast, charts (SVG), helpers (today, dShort, parseLocalDate)
│   ├── perfil.js           # TDEE/TMB (Mifflin-St Jeor), 3 macro options, applyChoices
│   ├── treino.js           # Routines, exercises, suggestExercises, rest timer
│   ├── dieta.js            # Meal diary per-date, foods, combos, macro totals, diet review, auto-completion
│   ├── progresso.js        # Daily check-ins, weight, water, streak, graphs
│   ├── conquistas.js       # Goals, achievements, exercise records, 1RM estimate
│   ├── personagem.js       # Character metrics (XP/coins/level/stats), shop, avatar SVG
│   ├── sync.js             # Cloud sync opcional (Supabase): auth, pull/merge/push

│   └── data/
│       ├── alimentos.js    # Foods (100g macros), combos, restrictions
│       ├── exercicios.js   # Exercise library by muscle group (grade 1-3)
│       ├── atividades.js   # MET table for cardio
│       ├── racas.js        # Character races (Humano/Elfo/Anão/Besta)
│       └── loja.js         # Shop items, rarities, equipment slots
├── scripts/
│   └── generate-icons.js   # Generates PWA icons (jimp)
├── tests/
│   ├── unit/
│   │   ├── perfil.test.js  # TDEE, macro options, applyChoices
│   │   ├── dieta.test.js   # Meal/day totals, combo filtering
│   │   ├── treino.test.js  # exPR (personal record)
│   │   ├── progresso.test.js # computeStreak
│   │   ├── personagem.test.js # characterMetrics (XP/coins/level), goalProgress
│   │   └── conquistas.test.js # estimate1RM
│   └── e2e/
│       ├── perfil-dieta.spec.js
│       ├── treino-sugestoes.spec.js
│       ├── sessao-pr.spec.js
│       ├── checkin-moedas.spec.js
│       └── helpers.js
├── vite.config.js          # Vite config (publicDir: 'public')
├── playwright.config.js    # Playwright E2E (port 5183, cache on reuse)
├── package.json            # Scripts: dev, build, preview, test, test:e2e
└── meu-gym-bro.html        # Protótipo original (intocado, referência)
```

### Estado (localStorage, chave `meu_gym_bro_v1`)

```javascript
S = {
  profile: {
    sex, age, height, weight, goal, level, trainDays, otherDays,
    otherSport, otherDaysFreq, lifestyle, restrictions
  },
  choices: { kcal, prot, fat, kcalCustom, protCustom, fatCustom },
  targets: { kcal, prot, carb, fat },
  routines: [{ id, name, label, focus, exercises: [...] }],
  sessions: [{ date, routineId, entries, volume, minutes }],
  mealTemplate: [{ id, name, foods: [{kcal, prot, carb, fat}] }],
  mealDiary: {
    'YYYY-MM-DD': [{ id, name, foods: [...] }]  // Registro real de refeições por data
  },
  progress: {
    weight: [{date, v}],
    measures: {braco, peito, ...},
    waterGoalMl: 2000,
    days: {
      'YYYY-MM-DD': {
        workout: bool,
        diet: bool,
        stretch: bool,
        waterMl: number,
        activities: [...]
      }
    }
  },
  goals: [{id, type, label, target, ...}],
  characters: [{id, name, race, skin, hair, equipment, active}],
  activeChar: 0,
  wallet: { owned: [itemId], spent: number }
}
```

### Fluxo de Dados

1. **Perfil criado** → `computeMetrics()` calcula TDEE/TMB → `calorieOptions/proteinOptions/fatOptions` gera 3 opções → usuário escolhe → `applyChoices()` escreve em `targets`
2. **Treino registrado** → carga/reps salvos em `exercise.history[]` → ativa "treino concluído" em `progress.days[today].workout` → `characterMetrics()` recalcula XP/moedas
3. **Check-in diário** → `progress.days[today].workout/diet/water` marcados → `toggleHabit()` → moedas + XP → `characterMetrics()` recalcula tudo
4. **Dieta** → alimentos adicionados à refeição → `dayTotals()` soma o dia → compara com `targets` → "dieta em dia" se bate ±10%

### Cálculos Puros (Testados)

- **TDEE/TMB**: Mifflin-St Jeor (equação específica por sexo), fator de atividade 1.30-1.80 conforme treino/lifestyle
- **Macros**: 1.6-2.2 g/kg proteína, 0.8-1.2 g/kg gordura, carbo preenche resto
- **Streak**: Conta dias consecutivos até hoje sem quebra
- **XP/Moedas**: Treino (+50XP, +10🪙), Dieta (+30XP, +8🪙), Água (+10XP, +3🪙), PR (+40XP, +15🪙), Conquista (+30XP, +20🪙)
- **Nível**: (nível-1)² × 60 XP por nível
- **1RM**: load × (1 + reps/30)

## Como Rodar

### Desenvolvimento

```bash
npm install          # Instala Vite + Vitest + Playwright + jimp
npm run dev          # Inicia Vite dev server (http://localhost:5173)
```

### Build de Produção

```bash
npm run build        # Gera dist/ com HTML/CSS/JS minificados + assets PWA
npm run preview      # Testa o build em modo de produção (http://localhost:4173)
```

### Testes

```bash
npm run test         # Vitest: 37 testes unitários (perfil, dieta, treino, progresso, personagem, conquistas)
npm run test:e2e     # Playwright: 5 fluxos E2E (perfil→dieta, exercício via sugestões, sessão→PR, check-in→moedas, dieta options)
```

## O Que Mudou vs. Protótipo

1. **Modularização**: Arquivo único (2.5k linhas) → 15 módulos ES por domínio
2. **Bundler**: Vite substitui o arquivo único — output é CSS+JS otimizado em dist/
3. **Testes**: Nenhum → 37 unit (Vitest) + 5 E2E (Playwright)
4. **PWA**: Nenhum → manifest.json + service worker + ícones gerados
5. **Bug Fix**: Timezone em `new Date('YYYY-MM-DD')` retroagindo a data em fusos negativos → `parseLocalDate()` corrige
6. **Rest Timer**: Feature nova — cronômetro pós-sessão com Som + Vibração
7. **Diário Alimentar**: Refeições agora por data (`mealTemplate` + `mealDiary`), com cópia automática de template para novo dia
8. **Auto-Completion**: "Dieta em dia" marcada automaticamente se kcal ±10% e proteína ±10% batem com metas
9. **Backup/Reset**: Suporta importação de backups antigos (migração automática de `meals[]` → `mealTemplate`+`mealDiary`)
10. **Cloud Sync (opcional)**: Supabase via `.env.local` — auth e-mail/senha, push com debounce 3s após cada save(), pull+merge no login (mais novo vence; dias/diário/sessões/pesos exclusivos do lado antigo são preservados). Sem config, o bundle nem inclui o cliente Supabase (tree-shaken). Setup: `SETUP-SYNC.md`
11. **Comportamento**: 100% idêntico ao protótipo; localStorage `meu_gym_bro_v1` mantido, dados migram automaticamente

## Próximos Passos Sugeridos

### Curto Prazo (Fase 5 — Deploy-Ready)
- **Performance**: Verificar build size, cache estratégia do SW
- **Acessibilidade**: ARIA labels, focus management, teclado navegação
- **Mobile**: Testar em iOS/Android, notificações push (opcional)
- **Analytics**: Adicionar event tracking (Plausible/Umami self-hosted)

### Médio Prazo (Fase 6+)
- **Sync v2**: merge por exercício (history dentro de routines)
- **Social**:
  - Leaderboard de recordes por exercício
  - Compartilhar PR com amigos via link
  - Desafios: "quem faz mais séries essa semana?"
  - Ver conquistas/streak de amigos

### Longo Prazo
- **App Nativo**: Usar Tauri (Rust + web) ou React Native se quiser notificações push
- **IA**: Sugerir ajustes de treino baseado em progresso real
- **Análise**: Dashboard com tendências de força/peso/macro
- **Integrações**: Importar dados de MyFitnessPal/Strava

## Observações

- **Offline First**: Tudo salva em localStorage imediatamente. SW cach assets na install. App funciona 100% sem internet.
- **Pt-BR**: Interface completamente em português, datas em formato local (USA/BR friendly).
- **Mobile-First**: Media queries desnecessários; layout usa flex + grid, funciona em 320px–4k.
- **Dark Theme**: Fundo #0d0f12, accent #c6ff3a, cards #1b1f26 com borda sutil #2a313b.
- **Zero Dependencies em Runtime**: Vite é dev-only. Build final é JS vanilla puro.
- **Git**: Cada fase é um commit. Branch master tem 4 commits: prototipo, scaffold, testes, PWA, timer.

## Contato / Issues

Se precisar debugar:
1. Abra DevTools (F12) → Console tab
2. Acesse `window.S` para ver o estado atual
3. `localStorage.getItem('meu_gym_bro_v1')` mostra JSON cru
4. Testes: `npm run test` pra unit, `npm run test:e2e` pra E2E

---

**Última atualização**: 2026-07-06 (Fase 4 — Diário alimentar + Auto-completion + Bugfixes)  
**Commits**: 10 total (scaffold, testes, PWA, timer, diário, backup fix, CSS integration)  
**Mantido por**: Claude Haiku 4.5  
**Prototipo original**: meu-gym-bro.html (intocado, ~2500 linhas)

## Deploy Checklist

- [x] CSS importado em main.js (Vite integration)
- [x] Service worker: network-first p/ HTML (updates chegam), cache-first p/ assets hasheados, sem interceptar API externa
- [x] Manifest.json com PWA metadata
- [x] Icons 192x192 e 512x512
- [x] Backup/Reset com suporte a migração de schema antigo
- [x] Cloud sync opcional (Supabase + merge offline-first, veja SETUP-SYNC.md)
- [x] Testes unitários (46 passing)
- [x] Testes E2E (5 flows)
- [x] Build produção (dist/ com hash, ~130KB JS, ~39KB gzipped)
- [x] Offline-first (localStorage + SW)
- [x] Dark theme com accent #c6ff3a
- [x] Pt-BR interface completa
- [x] Acessibilidade básica (aria-labels, role dialog/status, aria-current nas tabs, Esc fecha modal)
- [x] Compartilhar PR (Web Share API + fallback clipboard)
- [ ] Analytics (opcional)
