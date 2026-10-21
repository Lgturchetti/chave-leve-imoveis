-- Chave Leve Imóveis — esquema inicial (parte 2)
-- Regra de ouro: o público (anon) só LÊ imóveis publicados e suas fotos, e só CRIA visitas/contatos.
-- O endereço exato do imóvel nunca é liberado para o público (permissão por coluna).

-- Nada fica exposto na API por padrão: cada acesso é concedido de forma explícita abaixo.
alter default privileges for role postgres in schema public revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public revoke execute on functions from public;

create type public.papel as enum ('dono', 'corretor', 'demo');
create type public.tipo_imovel as enum ('kitnet', 'studio', 'apartamento', 'casa');
create type public.status_imovel as enum ('rascunho', 'disponivel', 'reservado', 'alugado');
create type public.turno as enum ('manha', 'tarde');
create type public.status_pedido as enum ('novo', 'em_andamento', 'concluido', 'cancelado');

-- Equipe (dono, corretores). user_id liga ao login (parte 3); corretor pode existir sem login.
create table public.perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  nome text not null check (char_length(nome) between 2 and 80),
  papel public.papel not null default 'corretor',
  creci text check (char_length(creci) <= 40),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  foto_url text check (char_length(foto_url) <= 500),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create sequence public.imoveis_codigo_seq start 200;

create table public.imoveis (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique default ('CL-' || lpad(nextval('public.imoveis_codigo_seq')::text, 4, '0')) check (codigo ~ '^CL-[0-9]{4}$'),
  corretor_id uuid not null references public.perfis (id),
  titulo text not null check (char_length(titulo) between 5 and 70),
  tipo public.tipo_imovel not null,
  bairro text not null check (char_length(bairro) between 2 and 40),
  endereco text check (char_length(endereco) <= 160), -- PRIVADO: só a equipe vê
  lat double precision not null check (lat between -29.80 and -29.60),  -- região aproximada (Santa Maria)
  lon double precision not null check (lon between -53.90 and -53.65),
  quartos smallint not null check (quartos between 0 and 10),
  banheiros smallint not null check (banheiros between 1 and 10),
  area smallint not null check (area between 10 and 1000),
  vagas smallint not null default 0 check (vagas between 0 and 10),
  mobiliado boolean not null default false,
  aceita_pet boolean not null default false,
  para_dividir boolean not null default false,
  aluguel integer not null check (aluguel between 100 and 50000),
  condominio integer not null default 0 check (condominio between 0 and 10000),
  iptu integer not null default 0 check (iptu between 0 and 10000),
  descricao text not null check (char_length(descricao) between 20 and 1200),
  status public.status_imovel not null default 'rascunho',
  publicado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index imoveis_corretor_idx on public.imoveis (corretor_id);
create index imoveis_status_publicado_idx on public.imoveis (status, publicado_em desc);

create table public.fotos (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis (id) on delete cascade,
  caminho text not null check (char_length(caminho) <= 300), -- caminho no bucket "fotos"
  alt text not null check (char_length(alt) between 3 and 140),
  ordem smallint not null default 0,
  criado_em timestamptz not null default now()
);
create index fotos_imovel_ordem_idx on public.fotos (imovel_id, ordem);

create table public.visitas (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid not null references public.imoveis (id) on delete cascade,
  nome text not null check (char_length(nome) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  dia date not null,
  turno public.turno not null,
  status public.status_pedido not null default 'novo',
  criado_em timestamptz not null default now()
);
create index visitas_imovel_idx on public.visitas (imovel_id);
create index visitas_status_idx on public.visitas (status, criado_em desc);

create table public.proprietarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 2 and 80),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,13}$'),
  bairro text not null check (char_length(bairro) between 2 and 60),
  mensagem text check (char_length(mensagem) <= 1000),
  status public.status_pedido not null default 'novo',
  criado_em timestamptz not null default now()
);

-- RLS em tudo
alter table public.perfis enable row level security;
alter table public.imoveis enable row level security;
alter table public.fotos enable row level security;
alter table public.visitas enable row level security;
alter table public.proprietarios enable row level security;

-- ===== Público (anon) =====
-- Leitura: só colunas públicas (sem endereço, sem user_id/papel)
grant select (id, codigo, corretor_id, titulo, tipo, bairro, lat, lon, quartos, banheiros, area, vagas,
  mobiliado, aceita_pet, para_dividir, aluguel, condominio, iptu, descricao, status, publicado_em)
  on public.imoveis to anon;
grant select (id, imovel_id, caminho, alt, ordem) on public.fotos to anon;
grant select (id, nome, creci, whatsapp, foto_url) on public.perfis to anon;

create policy "publico_le_imoveis_publicados" on public.imoveis for select to anon
  using (status in ('disponivel', 'reservado') and publicado_em is not null);
create policy "publico_le_fotos_publicadas" on public.fotos for select to anon
  using (exists (select 1 from public.imoveis i where i.id = imovel_id and i.status in ('disponivel', 'reservado') and i.publicado_em is not null));
create policy "publico_le_corretores_ativos" on public.perfis for select to anon
  using (ativo and papel in ('dono', 'corretor'));

-- Escrita: só cria pedidos (nunca lê, nunca altera). Status sempre começa como "novo".
grant insert (imovel_id, nome, whatsapp, dia, turno) on public.visitas to anon;
grant insert (nome, whatsapp, bairro, mensagem) on public.proprietarios to anon;

create policy "publico_pede_visita" on public.visitas for insert to anon
  with check (
    status = 'novo'
    and dia between current_date and current_date + 14
    and exists (select 1 from public.imoveis i where i.id = imovel_id and i.status in ('disponivel', 'reservado') and i.publicado_em is not null)
  );
create policy "publico_envia_proprietario" on public.proprietarios for insert to anon
  with check (status = 'novo');

-- Equipe (authenticated) e painel: parte 3.

-- atualizado_em automático
create function public.tocar_atualizado_em() returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;
create trigger imoveis_atualizado_em before update on public.imoveis for each row execute function public.tocar_atualizado_em();

-- Armazenamento das fotos: bucket público para leitura (URL direta), só imagens, até 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']);
