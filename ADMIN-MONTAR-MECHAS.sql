-- Editor de mecha original e novo para a conta admin fantasma.
-- A permissão é verificada no banco; nenhum outro usuário recebe escrita cruzada.
begin;

create policy "Admin consulta mechas originais" on public.mechas_20m
for select to authenticated using (nave_privado.eh_admin());
create policy "Admin consulta kaijus de mechas" on public.mecha_kaijus_derrotados
for select to authenticated using (nave_privado.eh_admin());
create policy "Admin consulta pecas de mechas" on public.mecha_pecas_equipadas
for select to authenticated using (nave_privado.eh_admin());

drop policy if exists "Admin le novos mechas" on public.mechas_novos;
create policy "Admin le novos mechas" on public.mechas_novos
for select to authenticated using (nave_privado.eh_admin());
drop policy if exists "Admin cria novos mechas" on public.mechas_novos;
create policy "Admin cria novos mechas" on public.mechas_novos
for insert to authenticated with check (
  nave_privado.eh_admin()
  and not nave_privado.eh_conta_fantasma(usuario_id)
);
drop policy if exists "Admin edita novos mechas" on public.mechas_novos;
create policy "Admin edita novos mechas" on public.mechas_novos
for update to authenticated
using (nave_privado.eh_admin() and not nave_privado.eh_conta_fantasma(usuario_id))
with check (nave_privado.eh_admin() and not nave_privado.eh_conta_fantasma(usuario_id));

drop policy if exists "Admin envia imagem de mecha" on storage.objects;
create policy "Admin envia imagem de mecha" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'mechas-designs'
  and nave_privado.eh_admin()
  and exists (
    select 1 from public.profiles p
    where p.id::text = (storage.foldername(name))[1]
      and not nave_privado.eh_conta_fantasma(p.id)
  )
);

create or replace function nave_privado.admin_salvar_mecha(
  p_usuario uuid, p_nome text, p_descricao text,
  p_imagem_path text, p_kaijus text[], p_pecas jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_kaijus text[] := coalesce(p_kaijus, array[]::text[]);
  v_pecas jsonb := coalesce(p_pecas, '{}'::jsonb);
  v_slot text;
  v_id text;
  v_peca record;
begin
  if not nave_privado.eh_admin() then raise exception 'Apenas admin pode editar outro mecha'; end if;
  if p_usuario is null or not exists (
    select 1 from public.profiles where id=p_usuario
      and not nave_privado.eh_conta_fantasma(id)
  ) then raise exception 'Tripulante não encontrado'; end if;
  if jsonb_typeof(v_pecas) <> 'object' then raise exception 'Formato de peças inválido'; end if;
  if exists (
    select 1 from unnest(v_kaijus) k(id)
    left join public.mecha_kaijus_catalogo c on c.id=k.id where c.id is null
  ) then raise exception 'Kaiju selecionado não existe'; end if;
  if nullif(trim(coalesce(p_imagem_path,'')),'') is not null
     and p_imagem_path not like p_usuario::text || '/%'
  then raise exception 'Caminho de imagem inválido'; end if;
  for v_slot, v_id in
    select key, value #>> '{}' from jsonb_each(v_pecas)
  loop
    if v_slot not in ('cabeca','torso','bracos','pernas')
    then raise exception 'Slot inválido'; end if;
    if v_id is null or v_id='' then continue; end if;
    select slot,kaiju_id into v_peca
    from public.mecha_pecas_catalogo where id=v_id;
    if not found or v_peca.slot<>v_slot or not (v_peca.kaiju_id=any(v_kaijus))
    then raise exception 'Peça inválida ou bloqueada'; end if;
  end loop;
  insert into public.mechas_20m
    (usuario_id,nome,vida_base,descricao,imagem_path,atualizado_em)
  values (
    p_usuario,coalesce(nullif(trim(p_nome),''),'MECHA 20M'),
    10,trim(coalesce(p_descricao,'')),
    nullif(trim(coalesce(p_imagem_path,'')),''),now()
  ) on conflict (usuario_id) do update set
    nome=excluded.nome,vida_base=10,descricao=excluded.descricao,
    imagem_path=excluded.imagem_path,atualizado_em=excluded.atualizado_em;
  delete from public.mecha_pecas_equipadas where usuario_id=p_usuario;
  delete from public.mecha_kaijus_derrotados where usuario_id=p_usuario;
  insert into public.mecha_kaijus_derrotados (usuario_id,kaiju_id)
  select p_usuario,k.id from (select distinct unnest(v_kaijus) id) k;
  insert into public.mecha_pecas_equipadas (usuario_id,slot,peca_id)
  select p_usuario,key,value #>> '{}'
  from jsonb_each(v_pecas)
  where value <> 'null'::jsonb and value #>> '{}' <> '';
  return jsonb_build_object('sucesso',true,'usuario_id',p_usuario,'atualizado_em',now());
end $$;
revoke all on function nave_privado.admin_salvar_mecha(uuid,text,text,text,text[],jsonb)
from public,anon;
grant execute on function nave_privado.admin_salvar_mecha(uuid,text,text,text,text[],jsonb)
to authenticated;

create or replace function public.nave_admin_salvar_mecha(
  p_usuario uuid, p_nome text, p_descricao text,
  p_imagem_path text, p_kaijus text[], p_pecas jsonb
) returns jsonb language sql set search_path = '' as $$
  select nave_privado.admin_salvar_mecha(
    p_usuario,p_nome,p_descricao,p_imagem_path,p_kaijus,p_pecas
  );
$$;
revoke all on function public.nave_admin_salvar_mecha(uuid,text,text,text,text[],jsonb)
from public,anon;
grant execute on function public.nave_admin_salvar_mecha(uuid,text,text,text,text[],jsonb)
to authenticated;
commit;
