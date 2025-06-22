-- Tabela de Projetos (multi-tenant)
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Tabela de Serviços monitorados (APIs ou websites)
create table services (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  url text not null,
  method text not null default 'GET', -- Ex: GET, POST, PUT, DELETE
  headers jsonb default '{}'::jsonb, -- Ex: { "Authorization": "Bearer token" }
  body text,                         -- Corpo da requisição, se aplicável
  expected_status integer default 200,
  expected_body text,                -- Substring esperada na resposta
  status text check (status in ('online', 'degraded', 'offline')) default 'online',
  last_checked_at timestamptz,
  created_at timestamptz default now()
);

-- Histórico de verificações automáticas
create table status_checks (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  checked_at timestamptz not null default now(),
  success boolean,
  status_code integer,
  response_time_ms integer,
  matched_body boolean,
  error_message text
);

-- Registro de incidentes
create table incidents (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete cascade,
  title text not null,
  description text,
  status text check (status in ('open', 'resolved')) not null default 'open',
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz default now()
);