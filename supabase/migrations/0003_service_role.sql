-- Funções do servidor (chave secreta, papel service_role) precisam de acesso explícito,
-- porque as permissões automáticas foram desligadas na 0001.
-- (É o mesmo acesso que o service_role tem por padrão em qualquer projeto Supabase;
-- essa chave só existe dentro das funções do Supabase, nunca no site.)
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
