-- Chave Leve — conta de demonstração (parte 4)
-- Quem vê o portfólio entra como "demo" e mexe no painel como o dono (imóveis, visitas, proprietários),
-- com travas: sem enviar foto (só a biblioteca de exemplo), sem mexer na equipe, sem links nem palavrões,
-- até 10 imóveis novos por dia. Toda noite, às 3h de Brasília, tudo volta ao original (private.restaurar_demo).
-- Atenção: a limpeza vale para o banco inteiro (inclusive o que a dona de teste mudar).

-- ===== Quem é o demo =====
create function private.sou_demo() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfis
    where user_id = (select auth.uid()) and ativo and papel = 'demo'
  )
$$;

-- Só corretores que aparecem no site (o demo não atribui imóvel a si mesmo nem a inativos)
create function private.corretor_publico(p_perfil uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.perfis where id = p_perfil and ativo and papel in ('dono', 'corretor'))
$$;

-- Biblioteca de fotos do demo (mesma lista de src/data/biblioteca.ts)
create function private.foto_da_biblioteca(p_caminho text) returns boolean
language sql immutable set search_path = '' as $$
  select p_caminho = any (array[
    'exemplo/casa-patio.jpg', 'exemplo/cozinha.jpg', 'exemplo/dividir.jpg', 'exemplo/jantar.jpg',
    'exemplo/kitnet-2.jpg', 'exemplo/kitnet.jpg', 'exemplo/predio-2.jpg', 'exemplo/predio-3.jpg',
    'exemplo/predio.jpg', 'exemplo/quarto-estudante.jpg', 'exemplo/quarto.jpg', 'exemplo/sala-2.jpg',
    'exemplo/sala-3.jpg', 'exemplo/sala-4.jpg', 'exemplo/sala-amarela.jpg', 'exemplo/sala.jpg',
    'exemplo/studio-2.jpg', 'exemplo/studio.jpg'
  ])
$$;

-- Texto proibido na demonstração: links e palavrões (inclusive com acento trocado, números no lugar
-- de letras e letras repetidas: "p0rrrra" → "pora"). As palavras da lista já estão nessa forma.
create function private.texto_proibido(p_texto text) returns boolean
language plpgsql immutable set search_path = '' as $$
declare
  t text := lower(coalesce(p_texto, ''));
  n text;
begin
  if t ~ '(https?://|www\.|\m[a-z0-9-]+\.(com|net|org|br|io|xyz|me|ly|info|site|online|app)\M)' then
    return true;
  end if;
  n := translate(t, 'áàâãäéèêëíìîïóòôõöúùûüç013457@$', 'aaaaaeeeeiiiiooooouuuucoieastas');
  n := regexp_replace(n, '[^a-z ]', ' ', 'g');
  n := regexp_replace(n, '([a-z])\1+', '\1', 'g');
  return n ~ ('\m(' || array_to_string(array[
    'pora', 'poras', 'porada', 'caralho', 'caraio', 'carai', 'krl', 'crl', 'merda', 'bosta', 'cacete',
    'foda', 'fodase', 'foder', 'fode', 'fodido', 'fudido', 'fuder', 'fdp', 'pqp', 'vsf', 'vtnc', 'tnc', 'pnc',
    'puta', 'puto', 'putaria', 'putero', 'prostituta', 'vagabunda', 'vagabundo', 'buceta', 'boceta', 'xoxota',
    'xereca', 'piroca', 'pica', 'punheta', 'siririca', 'cu', 'cuzao', 'arombado', 'arombada',
    'viado', 'sapatao', 'traveco', 'retardado', 'retardada', 'imbecil', 'otario', 'otaria', 'babaca',
    'corno', 'desgracado', 'desgracada', 'nazi', 'nazista', 'hitler', 'estupro', 'estuprador', 'pedofilo',
    'nigga', 'niger', 'fuck', 'shit', 'bitch', 'porn', 'porno', 'xvideos', 'pornhub', 'onlyfans'
  ], '|') || ')\M');
end;
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- ===== Permissões do demo (somam às da equipe; o demo não ganha nada no armazenamento) =====
create policy "demo_ve_equipe" on public.perfis for select to authenticated
  using ((select private.sou_demo()));

create policy "demo_ve_imoveis" on public.imoveis for select to authenticated
  using ((select private.sou_demo()));
create policy "demo_cria_imoveis" on public.imoveis for insert to authenticated
  with check ((select private.sou_demo()) and private.corretor_publico(corretor_id));
create policy "demo_edita_imoveis" on public.imoveis for update to authenticated
  using ((select private.sou_demo()))
  with check ((select private.sou_demo()) and private.corretor_publico(corretor_id));
create policy "demo_apaga_imoveis" on public.imoveis for delete to authenticated
  using ((select private.sou_demo()));

create policy "demo_ve_fotos" on public.fotos for select to authenticated
  using ((select private.sou_demo()));
create policy "demo_cria_fotos" on public.fotos for insert to authenticated
  with check ((select private.sou_demo()) and private.foto_da_biblioteca(caminho));
create policy "demo_edita_fotos" on public.fotos for update to authenticated
  using ((select private.sou_demo()))
  with check ((select private.sou_demo()) and private.foto_da_biblioteca(caminho));
create policy "demo_apaga_fotos" on public.fotos for delete to authenticated
  using ((select private.sou_demo()));

create policy "demo_ve_visitas" on public.visitas for select to authenticated
  using ((select private.sou_demo()));
create policy "demo_atualiza_visitas" on public.visitas for update to authenticated
  using ((select private.sou_demo())) with check ((select private.sou_demo()));

create policy "demo_ve_proprietarios" on public.proprietarios for select to authenticated
  using ((select private.sou_demo()));
create policy "demo_atualiza_proprietarios" on public.proprietarios for update to authenticated
  using ((select private.sou_demo())) with check ((select private.sou_demo()));

-- ===== Dados de exemplo de visitas e proprietários (para o painel não abrir vazio) =====
insert into public.visitas (imovel_id, nome, whatsapp, dia, turno, status, criado_em)
select i.id, v.nome, v.whatsapp, current_date + v.dias, v.turno::public.turno, v.status::public.status_pedido, now() - v.ha
from (values
  ('CL-0142', 'Júlia Ferreira', '5555900001001', 1, 'manha', 'novo', interval '40 minutes'),
  ('CL-0137', 'Pedro Almeida', '5555900001002', 1, 'tarde', 'novo', interval '3 hours'),
  ('CL-0124', 'Camila Rocha', '5555900001003', 4, 'manha', 'novo', interval '5 hours'),
  ('CL-0128', 'Ana Clara Souza', '5555900001004', 2, 'manha', 'em_andamento', interval '1 day'),
  ('CL-0133', 'Lucas Pereira', '5555900001005', 3, 'tarde', 'em_andamento', interval '1 day 4 hours'),
  ('CL-0151', 'Mariana Costa', '5555900001006', -1, 'manha', 'concluido', interval '3 days'),
  ('CL-0147', 'Rafael Gomes', '5555900001007', -2, 'tarde', 'cancelado', interval '4 days')
) as v(codigo, nome, whatsapp, dias, turno, status, ha)
join public.imoveis i on i.codigo = v.codigo;

insert into public.proprietarios (nome, whatsapp, bairro, mensagem, status, criado_em) values
  ('Sérgio Bortoluzzi', '5555900002001', 'Camobi', 'Tenho duas kitnets perto da UFSM, livres a partir de dezembro.', 'novo', now() - interval '2 hours'),
  ('Jorge Dalla Corte', '5555900002002', 'Nossa Senhora de Lourdes', 'Casa com pátio e garagem. Aceito pet.', 'novo', now() - interval '1 day'),
  ('Helena Weber', '5555900002003', 'Centro', 'Apartamento de 2 quartos, sem mobília. Quero saber a taxa de administração.', 'em_andamento', now() - interval '2 days'),
  ('Luíza Pozzobon', '5555900002004', 'Camobi', null, 'concluido', now() - interval '6 days');

-- ===== Cópia original (fora da API) =====
create table private.demo_base (
  unica boolean primary key default true check (unica),
  dia date not null,          -- dia em que a cópia foi tirada (as datas andam junto com o calendário)
  sequencia bigint not null   -- próximo código de imóvel volta a este número
);
insert into private.demo_base (dia, sequencia) select current_date, last_value from public.imoveis_codigo_seq;

create table private.demo_imoveis as table public.imoveis;
create table private.demo_fotos as table public.fotos;
create table private.demo_visitas as table public.visitas;
create table private.demo_proprietarios as table public.proprietarios;
alter table private.demo_base enable row level security;
alter table private.demo_imoveis enable row level security;
alter table private.demo_fotos enable row level security;
alter table private.demo_visitas enable row level security;
alter table private.demo_proprietarios enable row level security;

-- ===== Travas que dependem de quem escreve =====
create function private.travas_imovel() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not private.sou_demo() then
    return new;
  end if;
  if private.texto_proibido(new.titulo) or private.texto_proibido(new.bairro)
     or private.texto_proibido(new.endereco) or private.texto_proibido(new.descricao) then
    raise exception 'texto_bloqueado' using errcode = 'CLB01';
  end if;
  if tg_op = 'INSERT' and (
    select count(*) from public.imoveis i where not exists (select 1 from private.demo_imoveis o where o.id = i.id)
  ) >= 10 then
    raise exception 'limite_demo' using errcode = 'CLL01';
  end if;
  return new;
end;
$$;
create trigger imoveis_travas before insert or update on public.imoveis
  for each row execute function private.travas_imovel();

create function private.travas_foto() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' and (select count(*) from public.fotos where imovel_id = new.imovel_id) >= 15 then
    raise exception 'limite_fotos' using errcode = 'CLL02';
  end if;
  if private.sou_demo() and private.texto_proibido(new.alt) then
    raise exception 'texto_bloqueado' using errcode = 'CLB01';
  end if;
  return new;
end;
$$;
create trigger fotos_travas before insert or update on public.fotos
  for each row execute function private.travas_foto();

-- ===== Limpeza: volta tudo ao original, com as datas andando junto com o calendário =====
create function private.restaurar_demo() returns void
language plpgsql security definer set search_path = '' as $$
declare
  dias integer;
  desvio interval;
begin
  select current_date - dia into dias from private.demo_base;
  desvio := make_interval(days => dias);

  delete from public.visitas where true;
  delete from public.proprietarios where true;
  delete from public.fotos where true;
  delete from public.imoveis where true;

  insert into public.imoveis (id, codigo, corretor_id, titulo, tipo, bairro, endereco, lat, lon, quartos, banheiros,
    area, vagas, mobiliado, aceita_pet, para_dividir, aluguel, condominio, iptu, descricao, status, publicado_em,
    criado_em, atualizado_em)
  select id, codigo, corretor_id, titulo, tipo, bairro, endereco, lat, lon, quartos, banheiros,
    area, vagas, mobiliado, aceita_pet, para_dividir, aluguel, condominio, iptu, descricao, status, publicado_em + desvio,
    criado_em + desvio, atualizado_em + desvio
  from private.demo_imoveis;

  insert into public.fotos (id, imovel_id, caminho, alt, ordem, criado_em)
  select id, imovel_id, caminho, alt, ordem, criado_em + desvio from private.demo_fotos;

  insert into public.visitas (id, imovel_id, nome, whatsapp, dia, turno, status, criado_em)
  select id, imovel_id, nome, whatsapp, dia + dias, turno, status, criado_em + desvio from private.demo_visitas;

  insert into public.proprietarios (id, nome, whatsapp, bairro, mensagem, status, criado_em)
  select id, nome, whatsapp, bairro, mensagem, status, criado_em + desvio from private.demo_proprietarios;

  perform setval('public.imoveis_codigo_seq', (select sequencia from private.demo_base));
end;
$$;
revoke all on function private.restaurar_demo() from public, anon, authenticated;

-- ===== Agenda: todo dia às 6h UTC = 3h em Brasília (sem horário de verão desde 2019) =====
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('restaurar-demo', '0 6 * * *', 'select private.restaurar_demo()');
