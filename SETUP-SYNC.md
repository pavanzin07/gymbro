# Configurar Sincronização na Nuvem (Supabase)

Grátis, sem cartão de crédito, ~5 minutos. Sem isso o app continua funcionando 100% offline — a sincronização é opcional.

## Passo a passo

1. **Criar conta e projeto**
   - Acesse https://supabase.com e crie uma conta (pode usar GitHub/Google).
   - Clique em **New Project**, dê um nome (ex: `meu-gym-bro`), escolha uma senha de banco e a região `South America (São Paulo)`.

2. **Criar a tabela**
   - No painel do projeto, abra **SQL Editor** (menu lateral).
   - Cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.

3. **Pegar as credenciais**
   - Vá em **Project Settings → API**.
   - Copie a **Project URL** e a **anon public key**.

4. **Configurar o app**
   - Na raiz do projeto, copie `.env.example` para `.env.local`:
     ```
     VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
     VITE_SUPABASE_ANON_KEY=sua-anon-key
     ```
   - Reinicie o dev server (`npm run dev`) ou refaça o build (`npm run build`).

5. **Usar**
   - No app: **⚙️ → ☁️ Conta & Sincronização → Criar conta**.
   - Por padrão o Supabase exige confirmação por e-mail. Para desativar (uso pessoal): **Authentication → Providers → Email → desmarque "Confirm email"**.

## Como funciona

- **Offline-first**: o localStorage continua sendo a fonte da verdade. Sem internet, tudo funciona normal; ao voltar, sincroniza.
- **Push automático**: ~3 segundos após qualquer mudança, o estado vai pra nuvem.
- **Pull + merge no login/boot**: o estado mais recente ganha, mas dias de check-in, diário alimentar, sessões de treino e registros de peso que só existem no lado mais antigo são preservados (união por data).
- **Privacidade**: Row Level Security garante que cada usuário só acessa os próprios dados.

## Limitações conhecidas

- Edições simultâneas no mesmo dia em dois aparelhos offline: vence o que salvou por último (exceto os campos com união por data, listados acima).

## Recuperação de senha

No modal de login, digite seu e-mail e toque em **"Esqueci a senha"**. Você recebe um link por e-mail; ao abrir, o app pede a nova senha automaticamente.
