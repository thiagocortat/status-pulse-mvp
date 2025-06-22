# Status Pulse MVP

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
