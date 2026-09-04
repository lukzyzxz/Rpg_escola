-- ============================================================================
-- NAVE 3B — V4 — IMAGEM PESSOAL NA FICHA
-- Execute este arquivo inteiro no SQL Editor DEPOIS da atualização V3.
-- É seguro executá-lo novamente.
-- ============================================================================

begin;

-- Bucket público: a imagem precisa aparecer na ficha, nas frotas e na arena.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'avatares-perfil',
    'avatares-perfil',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Avatares de perfil são públicos" on storage.objects;
create policy "Avatares de perfil são públicos"
on storage.objects for select to public
using (bucket_id = 'avatares-perfil');

drop policy if exists "Tripulante envia o próprio avatar" on storage.objects;
create policy "Tripulante envia o próprio avatar"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'avatares-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante atualiza o próprio avatar" on storage.objects;
create policy "Tripulante atualiza o próprio avatar"
on storage.objects for update to authenticated
using (
    bucket_id = 'avatares-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'avatares-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante remove o próprio avatar" on storage.objects;
create policy "Tripulante remove o próprio avatar"
on storage.objects for delete to authenticated
using (
    bucket_id = 'avatares-perfil'
    and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.salvar_avatar_perfil(p_avatar_url text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
    v_avatar_url text := trim(coalesce(p_avatar_url, ''));
    v_trecho_permitido text;
begin
    if v_usuario_id is null then
        raise exception 'Usuário não autenticado';
    end if;

    if not exists (select 1 from public.profiles where id = v_usuario_id) then
        raise exception 'Perfil não encontrado';
    end if;

    v_trecho_permitido :=
        '/storage/v1/object/public/avatares-perfil/'
        || v_usuario_id::text
        || '/avatar-perfil';

    if length(v_avatar_url) > 2048
       or v_avatar_url not like 'https://%'
       or position(v_trecho_permitido in v_avatar_url) = 0 then
        raise exception 'URL de avatar inválida para este usuário';
    end if;

    update public.profiles
    set avatar = v_avatar_url
    where id = v_usuario_id;

    return jsonb_build_object(
        'sucesso', true,
        'avatar', v_avatar_url
    );
end;
$$;

revoke all on function public.salvar_avatar_perfil(text) from public;
grant execute on function public.salvar_avatar_perfil(text) to authenticated;

commit;

