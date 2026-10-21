-- Pior caso do painel (break-ui, 21/10/2026). Rodar no SQL Editor do Supabase, olhar o painel em 320px
-- e 1440px, e desfazer com:
--   select private.restaurar_demo();
--   delete from public.perfis where nome like 'Maria Eduarda Wisniewski%' and user_id is null;
-- (os limites de cada campo estão em supabase/migrations/0001_esquema.sql)

insert into public.perfis (nome, papel, creci, whatsapp) values
  ('Maria Eduarda Wisniewski Kowalczyk dos Santos Bortoluzzi Dalla Corte', 'corretor', 'CRECI-RS 123456-F · estagiária em curso', '5555991953549');

with c as (select id from public.perfis where nome like 'Maria Eduarda Wisniewski%'),
i as (
  insert into public.imoveis (codigo, corretor_id, titulo, tipo, bairro, endereco, lat, lon, quartos, banheiros, area, vagas, aluguel, condominio, iptu, descricao, status, publicado_em)
  select 'CL-9001', c.id, 'Apartamento 3 quartos com sacada, churrasqueira e vaga perto do HUSM', 'apartamento', 'Nossa Senhora do Perpétuo Socorro', 'Rua Coronel Niederauer, 1234, apartamento 1502, bloco B, Edifício Residencial Jardim das Araucárias', -29.69, -53.80, 3, 2, 140, 2, 49999, 9999, 9999,
    repeat('Apartamento amplo e iluminado, com sacada fechada, churrasqueira, cozinha planejada e dois banheiros. Prédio com portaria 24 horas, elevador e salão de festas. ', 7), 'disponivel', now()
  from c returning id)
insert into public.fotos (imovel_id, caminho, alt, ordem) select i.id, 'exemplo/sala-2.jpg', 'Sala de estar ampla com sofá, poltronas e janela grande voltada para o pôr do sol de Santa Maria', 0 from i;

insert into public.imoveis (codigo, corretor_id, titulo, tipo, bairro, lat, lon, quartos, banheiros, area, aluguel, descricao, status)
select 'CL-9002', id, 'Quarto', 'kitnet', 'Km 3', -29.70, -53.78, 0, 1, 10, 100, 'Quarto simples, ótimo para começar.', 'rascunho' from public.perfis where nome = 'Diego Martins';

insert into public.visitas (imovel_id, nome, whatsapp, dia, turno, status) values
  ((select id from public.imoveis where codigo = 'CL-9001'), 'Maria Eduarda Wisniewski Kowalczyk dos Santos Bortoluzzi Dalla Corte', '5555991953549', current_date, 'manha', 'novo'),
  ((select id from public.imoveis where codigo = 'CL-9001'), 'Jo', '5511987654321', current_date + 14, 'tarde', 'novo'),
  ((select id from public.imoveis where codigo = 'CL-0142'), 'Nguyễn Thị Phương Thảo', '5555999999999', current_date + 1, 'manha', 'em_andamento');

insert into public.proprietarios (nome, whatsapp, bairro, mensagem, status) values
  ('Bartholomew Fitzgerald Montgomery Bortoluzzi III', '5555991953549', 'Nossa Senhora do Perpétuo Socorro, perto do Parque Itaimbé', repeat('Tenho três apartamentos e uma casa para alugar, todos com contrato vencendo em março. Quero entender como funciona a administração, a taxa e o seguro fiança. ', 6), 'novo'),
  ('Ana', '5555900000000', 'Centro', null, 'novo'),
  ('João', '5555900000001', 'Camobi', 'https://www.meusite-imoveis-santa-maria.com.br/anuncios/apartamento-3-quartos-centro-com-garagem-e-churrasqueira', 'novo');
