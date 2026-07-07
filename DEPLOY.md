# Colocar o MEU GYM BRO no ar

O build é 100% estático (`dist/`) — funciona em qualquer hospedagem de arquivos. Duas opções prontas:

## Opção A — GitHub Pages (grátis, automático a cada push)

1. Crie um repositório em https://github.com/new (precisa ser **público** pro Pages grátis).
2. No terminal, dentro da pasta do projeto:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/meu-gym-bro.git
   git push -u origin master
   ```
3. No GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Pronto — o workflow [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builda e publica sozinho a cada push. O app fica em `https://SEU-USUARIO.github.io/meu-gym-bro/`.

**Com cloud sync**: em **Settings → Secrets and variables → Actions**, crie os secrets `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (mesmos valores do `.env.local`). Sem eles o app publica offline-only, que também funciona.

## Opção B — Netlify (grátis, mais simples ainda)

- **Sem conta git**: rode `npm run build` e arraste a pasta `dist/` em https://app.netlify.com/drop. No ar em segundos.
- **Com repositório**: conecte o repo no Netlify; o [netlify.toml](netlify.toml) já configura tudo. Variáveis do Supabase vão em **Site settings → Environment variables**.

## Depois de publicado

- Abra no celular e use **"Adicionar à tela inicial"** — instala como app (PWA), com ícone e tela cheia.
- Funciona offline após a primeira visita.
- Updates: basta dar push (Pages) ou novo deploy (Netlify) — o service worker busca HTML novo automaticamente.
