# Status Pulse MVP


Aplicação SaaS para monitoramento de serviços utilizando Next.js, TypeScript, TailwindCSS e Supabase.
This project requires environment variables for Supabase configuration. Copy the
provided `.env.example` file to `.env.local` and update the values with your
credentials:

```bash
cp .env.example .env.local
```

The variables included are:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These variables are used in the codebase to connect to Supabase services.


## Configuração

1. Copie `.env.example` para `.env.local` e defina as variáveis do seu projeto Supabase.
2. Instale as dependências:

```bash
npm install
```

3. Rode a aplicação em modo desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Funcionalidades

- Autenticação por magic link (Supabase Auth)
- Dashboard com listagem e criação de projetos
- CRUD de serviços monitorados dentro de cada projeto
- Página pública de status acessível via `/status/[slug]`
- Função de edge (exemplo em `supabase/functions/status-checks.ts`) para monitoramento periódico dos serviços

## Deploy

Este projeto está pronto para ser implantado na Vercel. Configure as variáveis de ambiente e as funções edge/crons conforme sua necessidade.

