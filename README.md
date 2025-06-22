# Status Pulse MVP

Aplicação SaaS para monitoramento de serviços utilizando Next.js, TypeScript, TailwindCSS e Supabase.

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
