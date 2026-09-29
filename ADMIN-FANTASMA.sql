-- Conta admin já criada em Supabase Auth. Não armazene a senha neste arquivo.
create table if not exists nave_privado.admin_fantasma (
  usuario_id uuid primary key references auth.users(id) on delete cascade
);
revoke all on nave_privado.admin_fantasma from public, anon, authenticated;
insert into nave_privado.admin_fantasma (usuario_id)
select id from auth.users where email = 'admin@nave3b.app'
on conflict do nothing;

create or replace function nave_privado.eh_admin()
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null and exists (
    select 1 from nave_privado.admin_fantasma where usuario_id = auth.uid()
  );
$$;
revoke all on function nave_privado.eh_admin() from public, anon;
grant execute on function nave_privado.eh_admin() to authenticated;

create or replace function nave_privado.eh_conta_fantasma(p_usuario uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from nave_privado.admin_fantasma where usuario_id = p_usuario
  );
$$;
revoke all on function nave_privado.eh_conta_fantasma(uuid) from public, anon;
grant execute on function nave_privado.eh_conta_fantasma(uuid) to authenticated;

create or replace function public.nave_eh_admin()
returns boolean language sql stable set search_path = ''
as $$ select nave_privado.eh_admin(); $$;
revoke all on function public.nave_eh_admin() from public, anon;
grant execute on function public.nave_eh_admin() to authenticated;

-- Restrictive policy blocks the admin profile from direct SELECT, including
-- when another permissive policy allows every authenticated user to read.
drop policy if exists "admin_fantasma_oculto" on public.profiles;
create policy "admin_fantasma_oculto" on public.profiles
as restrictive for select to authenticated
using (
  id = (select auth.uid()) or not nave_privado.eh_conta_fantasma(id)
);

create or replace function nave_privado.diretorio()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',p.id,'nome',p.nome,'username',p.username,
      'cargo',p.cargo,'avatar',p.avatar
    ))
    from public.profiles p
    where not exists (select 1 from nave_privado.admin_fantasma a where a.usuario_id=p.id)
  ),'[]'::jsonb);
end $$;

create or replace function nave_privado.resumo_tripulacao()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',p.id,'vida',f.vida,'dano_extra',f.dano_extra,
      'agilidade',f.agilidade,'defesa',f.defesa,
      'nivel_embaixador',f.nivel_embaixador,
      'nivel_combatente',f.nivel_combatente,
      'nivel_tripulante',f.nivel_tripulante,
      'profiles',jsonb_build_object('nome',p.nome,'username',p.username,'cargo',p.cargo)
    ) order by p.nome)
    from public.profiles p join public.fichas_tripulantes f on f.id=p.id
    where not exists (select 1 from nave_privado.admin_fantasma a where a.usuario_id=p.id)
  ),'[]'::jsonb);
end $$;

create or replace function nave_privado.consultar_ficha(p_usuario uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare resultado jsonb;
begin
  if auth.uid() is null or not (nave_privado.eh_tiao() or nave_privado.eh_admin())
  then raise exception 'Acesso não autorizado à ficha completa'; end if;
  if exists(select 1 from nave_privado.admin_fantasma where usuario_id=p_usuario)
  then raise exception 'Ficha não encontrada'; end if;
  select jsonb_build_object(
    'profile',jsonb_build_object('id',p.id,'nome',p.nome,'username',p.username,'avatar',p.avatar),
    'ficha',to_jsonb(f)
  ) into resultado from public.profiles p
  join public.fichas_tripulantes f on f.id=p.id where p.id=p_usuario;
  if resultado is null then raise exception 'Ficha não encontrada'; end if;
  return resultado || jsonb_build_object(
    'missoes',coalesce((select jsonb_agg(to_jsonb(m) order by m.ordem)
      from public.missoes_catalogo m where m.oficial or m.criado_por=p_usuario),'[]'::jsonb),
    'concluidas',coalesce((select jsonb_agg(missao_id)
      from public.tripulante_missoes where usuario_id=p_usuario and concluida),'[]'::jsonb),
    'kaijus',coalesce((select jsonb_agg(to_jsonb(k) order by k.ordem)
      from public.mecha_kaijus_catalogo k),'[]'::jsonb),
    'derrotados',coalesce((select jsonb_agg(kaiju_id)
      from public.mecha_kaijus_derrotados where usuario_id=p_usuario),'[]'::jsonb)
  );
end $$;
