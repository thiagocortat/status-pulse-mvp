-- Simulando um usuário (supabase.auth.users só pode ser populada por autenticação real)
-- Então usaremos um UUID fictício para exemplo (ajuste com o seu id real após login)
-- Você pode obter seu user_id logado no console ou via Supabase Auth
-- Exemplo fictício:
-- select auth.uid();

-- Assumindo um usuário fictício:
-- Thiago Cortat (user_id simulado)
-- Substitua pelo seu ID real após login no Supabase
-- SELECT id FROM auth.users;
-- Exemplo: 11111111-2222-3333-4444-555555555555

-- Inserir projeto
insert into projects (id, name, slug, user_id)
values (
  gen_random_uuid(),
  'Meu Projeto de API',
  'meu-projeto-api',
  '11111111-2222-3333-4444-555555555555' -- Substitua pelo user_id real
);

-- Pegue o ID real do projeto criado para usar nas próximas inserções:
-- select id from projects where slug = 'meu-projeto-api';

-- Assumindo um ID de projeto simulado:
-- 22222222-3333-4444-5555-666666666666

-- Inserir serviços
insert into services (
  id, project_id, name, url, method, headers, body, expected_status, expected_body, status
)
values
(
  gen_random_uuid(),
  '22222222-3333-4444-5555-666666666666',
  'Site Institucional',
  'https://exemplo.com',
  'GET',
  '{}'::jsonb,
  null,
  200,
  null,
  'online'
),
(
  gen_random_uuid(),
  '22222222-3333-4444-5555-666666666666',
  'API Autenticada',
  'https://api.exemplo.com/ping',
  'POST',
  '{"Authorization": "Bearer meu-token-de-exemplo"}'::jsonb,
  '{"env": "prod"}',
  200,
  'pong',
  'offline'
);

-- Inserir status_checks simulados
insert into status_checks (
  service_id, checked_at, success, status_code, response_time_ms, matched_body, error_message
)
values
(
  -- Site Institucional (substitua pelo ID real do serviço)
  (select id from services where name = 'Site Institucional'),
  now(),
  true,
  200,
  120,
  null,
  null
),
(
  -- API Autenticada (falha simulada)
  (select id from services where name = 'API Autenticada'),
  now(),
  false,
  403,
  80,
  false,
  'Unauthorized'
);

-- Inserir incidente simulado para API Autenticada
insert into incidents (
  service_id, title, description, status, started_at
)
values (
  (select id from services where name = 'API Autenticada'),
  'API fora do ar',
  'A API autenticada está retornando erro 403 desde a última verificação.',
  'open',
  now()
);