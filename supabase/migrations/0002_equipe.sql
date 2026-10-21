-- Chave Leve — acesso da equipe (parte 3: painel)
-- Dono: tudo. Corretor: só os próprios imóveis (e fotos/visitas deles). Proprietários interessados: só o dono.
-- Perfil inativo ou papel "demo" não ganha nada aqui (demo vem na parte 4).

alter table public.perfis add column trocar_senha boolean not null default false;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- Ajudantes (security definer para ler perfis sem cair em recursão de RLS). Ficam fora da API.
create function private.meu_perfil_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.perfis
  where user_id = (select auth.uid()) and ativo and papel in ('dono', 'corretor')
$$;

create function private.sou_dono() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.perfis
    where user_id = (select auth.uid()) and ativo and papel = 'dono'
  )
$$;

create function private.posso_editar_imovel(p_imovel uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.imoveis i
    join public.perfis p on p.user_id = (select auth.uid()) and p.ativo
    where i.id = p_imovel and (p.papel = 'dono' or (p.papel = 'corretor' and i.corretor_id = p.id))
  )
$$;

-- Arquivos de foto da equipe ficam em fotos/imoveis/<id do imóvel>/<arquivo>
create function private.posso_editar_arquivo(p_nome text) returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare
  partes text[] := string_to_array(p_nome, '/');
begin
  if array_length(partes, 1) <> 3 or partes[1] <> 'imoveis'
     or partes[2] !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  return private.posso_editar_imovel(partes[2]::uuid);
end;
$$;

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated;

-- ===== perfis =====
grant select (id, user_id, nome, papel, creci, whatsapp, foto_url, ativo, trocar_senha, criado_em) on public.perfis to authenticated;
grant update (nome, creci, whatsapp, foto_url, ativo, papel) on public.perfis to authenticated;

create policy "equipe_ve_equipe" on public.perfis for select to authenticated
  using ((select private.meu_perfil_id()) is not null or user_id = (select auth.uid()));
create policy "dono_edita_equipe" on public.perfis for update to authenticated
  using ((select private.sou_dono())) with check ((select private.sou_dono()));

-- O dono não consegue se rebaixar nem se desativar sem querer
create function private.proteger_proprio_perfil() returns trigger
language plpgsql set search_path = '' as $$
begin
  if old.user_id = (select auth.uid()) and (new.papel <> old.papel or new.ativo <> old.ativo) then
    raise exception 'Você não pode mudar o seu próprio papel ou se desativar.';
  end if;
  return new;
end;
$$;
create trigger perfis_proteger_proprio before update on public.perfis
  for each row execute function private.proteger_proprio_perfil();

-- Depois de trocar a senha provisória, a própria pessoa desliga o aviso (só isso)
create function public.senha_trocada() returns void
language sql security definer set search_path = '' as $$
  update public.perfis set trocar_senha = false where user_id = (select auth.uid())
$$;
revoke all on function public.senha_trocada() from public, anon;
grant execute on function public.senha_trocada() to authenticated;

-- ===== imoveis =====
grant select, insert, update, delete on public.imoveis to authenticated;
grant usage on sequence public.imoveis_codigo_seq to authenticated;

create policy "equipe_ve_imoveis" on public.imoveis for select to authenticated
  using ((select private.sou_dono()) or corretor_id = (select private.meu_perfil_id()));
create policy "equipe_cria_imoveis" on public.imoveis for insert to authenticated
  with check ((select private.sou_dono()) or corretor_id = (select private.meu_perfil_id()));
create policy "equipe_edita_imoveis" on public.imoveis for update to authenticated
  using ((select private.sou_dono()) or corretor_id = (select private.meu_perfil_id()))
  with check ((select private.sou_dono()) or corretor_id = (select private.meu_perfil_id()));
create policy "dono_apaga_imoveis" on public.imoveis for delete to authenticated
  using ((select private.sou_dono()));

-- ===== fotos =====
grant select, insert, update, delete on public.fotos to authenticated;
create policy "equipe_ve_fotos" on public.fotos for select to authenticated using (private.posso_editar_imovel(imovel_id));
create policy "equipe_cria_fotos" on public.fotos for insert to authenticated with check (private.posso_editar_imovel(imovel_id));
create policy "equipe_edita_fotos" on public.fotos for update to authenticated
  using (private.posso_editar_imovel(imovel_id)) with check (private.posso_editar_imovel(imovel_id));
create policy "equipe_apaga_fotos" on public.fotos for delete to authenticated using (private.posso_editar_imovel(imovel_id));

-- ===== visitas =====
grant select, update (status) on public.visitas to authenticated;
create policy "equipe_ve_visitas" on public.visitas for select to authenticated using (private.posso_editar_imovel(imovel_id));
create policy "equipe_atualiza_visitas" on public.visitas for update to authenticated
  using (private.posso_editar_imovel(imovel_id)) with check (private.posso_editar_imovel(imovel_id));

-- ===== proprietarios (só o dono) =====
grant select, update (status) on public.proprietarios to authenticated;
create policy "dono_ve_proprietarios" on public.proprietarios for select to authenticated using ((select private.sou_dono()));
create policy "dono_atualiza_proprietarios" on public.proprietarios for update to authenticated
  using ((select private.sou_dono())) with check ((select private.sou_dono()));

-- ===== armazenamento (bucket fotos) =====
create policy "equipe_envia_fotos" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and private.posso_editar_arquivo(name));
create policy "equipe_ve_arquivos" on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and private.posso_editar_arquivo(name));
create policy "equipe_apaga_fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and private.posso_editar_arquivo(name));
