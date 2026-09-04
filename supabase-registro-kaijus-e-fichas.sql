-- ==============================================================
-- NAVE 3B — REGISTRO DE KAIJUS E FICHAS COMPLETAS
-- Execute TODO este arquivo uma única vez no SQL Editor do Supabase.
-- Ele é idempotente: pode ser executado novamente sem apagar dados.
-- ==============================================================

begin;

create extension if not exists pgcrypto;

-- --------------------------------------------------------------
-- 1. IMAGENS DE FRENTE E VERSO NA FICHA
-- --------------------------------------------------------------

alter table public.fichas_tripulantes
    add column if not exists nivel_embaixador integer not null default 0,
    add column if not exists nivel_combatente integer not null default 0,
    add column if not exists nivel_tripulante integer not null default 0,
    add column if not exists personagem_frente_path text,
    add column if not exists personagem_verso_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'personagens-fichas',
    'personagens-fichas',
    false,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tripulante envia imagem da própria ficha" on storage.objects;
create policy "Tripulante envia imagem da própria ficha"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'personagens-fichas'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante vê imagem da própria ficha" on storage.objects;
create policy "Tripulante vê imagem da própria ficha"
on storage.objects for select to authenticated
using (
    bucket_id = 'personagens-fichas'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante atualiza imagem da própria ficha" on storage.objects;
create policy "Tripulante atualiza imagem da própria ficha"
on storage.objects for update to authenticated
using (
    bucket_id = 'personagens-fichas'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'personagens-fichas'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante remove imagem da própria ficha" on storage.objects;
create policy "Tripulante remove imagem da própria ficha"
on storage.objects for delete to authenticated
using (
    bucket_id = 'personagens-fichas'
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- --------------------------------------------------------------
-- 2. HISTÓRICO INDIVIDUAL DE MISSÕES
-- --------------------------------------------------------------

create table if not exists public.missoes_tripulantes (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    titulo text not null check (char_length(trim(titulo)) between 1 and 120),
    tipo text not null check (tipo in ('embaixador', 'combatente', 'tripulante')),
    data_missao date not null default current_date,
    descricao text not null default '',
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create index if not exists missoes_tripulantes_usuario_data_idx
    on public.missoes_tripulantes (usuario_id, data_missao desc);

alter table public.missoes_tripulantes enable row level security;

grant select, insert, update, delete on public.missoes_tripulantes to authenticated;

drop policy if exists "Tripulante vê as próprias missões" on public.missoes_tripulantes;
create policy "Tripulante vê as próprias missões"
on public.missoes_tripulantes for select to authenticated
using (usuario_id = auth.uid());

drop policy if exists "Tripulante registra a própria missão" on public.missoes_tripulantes;
create policy "Tripulante registra a própria missão"
on public.missoes_tripulantes for insert to authenticated
with check (usuario_id = auth.uid());

drop policy if exists "Tripulante edita a própria missão" on public.missoes_tripulantes;
create policy "Tripulante edita a própria missão"
on public.missoes_tripulantes for update to authenticated
using (usuario_id = auth.uid())
with check (usuario_id = auth.uid());

drop policy if exists "Tripulante exclui a própria missão" on public.missoes_tripulantes;
create policy "Tripulante exclui a própria missão"
on public.missoes_tripulantes for delete to authenticated
using (usuario_id = auth.uid());

-- Converte os níveis já existentes em registros preservados. Como os nomes
-- antigos não estavam no banco, eles ficam editáveis com o rótulo
-- "Registro anterior" para cada pessoa completar depois.
insert into public.missoes_tripulantes (usuario_id, titulo, tipo, data_missao, descricao)
select
    f.id,
    'Registro anterior — Embaixador ' || serie.numero,
    'embaixador',
    current_date,
    'Missão contabilizada antes da criação do histórico detalhado. Edite este registro para informar o nome, a data e os detalhes.'
from public.fichas_tripulantes f
cross join lateral generate_series(1, coalesce(f.nivel_embaixador, 0)) as serie(numero)
where not exists (
    select 1 from public.missoes_tripulantes m
    where m.usuario_id = f.id and m.tipo = 'embaixador'
);

insert into public.missoes_tripulantes (usuario_id, titulo, tipo, data_missao, descricao)
select
    f.id,
    'Registro anterior — Combatente ' || serie.numero,
    'combatente',
    current_date,
    'Missão contabilizada antes da criação do histórico detalhado. Edite este registro para informar o nome, a data e os detalhes.'
from public.fichas_tripulantes f
cross join lateral generate_series(1, coalesce(f.nivel_combatente, 0)) as serie(numero)
where not exists (
    select 1 from public.missoes_tripulantes m
    where m.usuario_id = f.id and m.tipo = 'combatente'
);

insert into public.missoes_tripulantes (usuario_id, titulo, tipo, data_missao, descricao)
select
    f.id,
    'Registro anterior — Tripulante ' || serie.numero,
    'tripulante',
    current_date,
    'Missão contabilizada antes da criação do histórico detalhado. Edite este registro para informar o nome, a data e os detalhes.'
from public.fichas_tripulantes f
cross join lateral generate_series(1, coalesce(f.nivel_tripulante, 0)) as serie(numero)
where not exists (
    select 1 from public.missoes_tripulantes m
    where m.usuario_id = f.id and m.tipo = 'tripulante'
);

create or replace function public.sincronizar_niveis_missoes_tripulante()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid;
begin
    if tg_op = 'DELETE' then
        v_usuario_id := old.usuario_id;
    else
        v_usuario_id := new.usuario_id;
    end if;

    update public.fichas_tripulantes
    set
        nivel_embaixador = (
            select count(*) from public.missoes_tripulantes
            where usuario_id = v_usuario_id and tipo = 'embaixador'
        ),
        nivel_combatente = (
            select count(*) from public.missoes_tripulantes
            where usuario_id = v_usuario_id and tipo = 'combatente'
        ),
        nivel_tripulante = (
            select count(*) from public.missoes_tripulantes
            where usuario_id = v_usuario_id and tipo = 'tripulante'
        ),
        atualizado_em = now()
    where id = v_usuario_id;

    if tg_op = 'UPDATE' and old.usuario_id is distinct from new.usuario_id then
        update public.fichas_tripulantes
        set
            nivel_embaixador = (select count(*) from public.missoes_tripulantes where usuario_id = old.usuario_id and tipo = 'embaixador'),
            nivel_combatente = (select count(*) from public.missoes_tripulantes where usuario_id = old.usuario_id and tipo = 'combatente'),
            nivel_tripulante = (select count(*) from public.missoes_tripulantes where usuario_id = old.usuario_id and tipo = 'tripulante'),
            atualizado_em = now()
        where id = old.usuario_id;
    end if;

    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$$;

drop trigger if exists trg_sincronizar_niveis_missoes on public.missoes_tripulantes;
create trigger trg_sincronizar_niveis_missoes
after insert or update or delete on public.missoes_tripulantes
for each row execute function public.sincronizar_niveis_missoes_tripulante();

-- Garante que os totais iniciais correspondam aos registros preservados.
update public.fichas_tripulantes f
set
    nivel_embaixador = (select count(*) from public.missoes_tripulantes m where m.usuario_id = f.id and m.tipo = 'embaixador'),
    nivel_combatente = (select count(*) from public.missoes_tripulantes m where m.usuario_id = f.id and m.tipo = 'combatente'),
    nivel_tripulante = (select count(*) from public.missoes_tripulantes m where m.usuario_id = f.id and m.tipo = 'tripulante');

-- --------------------------------------------------------------
-- 3. CATÁLOGO COLABORATIVO DE KAIJUS
-- Reaproveita o catálogo dos Mechas para toda a nave usar uma única fonte.
-- --------------------------------------------------------------

create table if not exists public.mecha_kaijus_catalogo (
    id text primary key,
    nome text not null unique,
    ordem smallint not null unique
);

alter table public.mecha_kaijus_catalogo
    add column if not exists vida numeric not null default 0,
    add column if not exists agilidade numeric not null default 0,
    add column if not exists defesa numeric not null default 0,
    add column if not exists nivel_ameaca text not null default 'Desconhecido',
    add column if not exists status text not null default 'DESCONHECIDO',
    add column if not exists descricao text not null default '',
    add column if not exists ataques text not null default '',
    add column if not exists habilidades text not null default '',
    add column if not exists fraquezas text not null default '',
    add column if not exists imagem_path text,
    add column if not exists atualizado_por uuid references auth.users(id) on delete set null,
    add column if not exists criado_em timestamptz not null default now(),
    add column if not exists atualizado_em timestamptz not null default now();

alter table public.mecha_kaijus_catalogo
    alter column ordem type integer;

alter table public.mecha_kaijus_catalogo
    drop constraint if exists mecha_kaijus_catalogo_valores_nao_negativos;
alter table public.mecha_kaijus_catalogo
    add constraint mecha_kaijus_catalogo_valores_nao_negativos
    check (vida >= 0 and agilidade >= 0 and defesa >= 0);

alter table public.mecha_kaijus_catalogo
    drop constraint if exists mecha_kaijus_catalogo_status_check;
alter table public.mecha_kaijus_catalogo
    add constraint mecha_kaijus_catalogo_status_check
    check (status in ('ATIVO', 'DERROTADO', 'DESCONHECIDO'));

create sequence if not exists public.mecha_kaijus_ordem_seq;
select setval(
    'public.mecha_kaijus_ordem_seq',
    greatest(coalesce((select max(ordem) from public.mecha_kaijus_catalogo), 0), 1),
    coalesce((select max(ordem) from public.mecha_kaijus_catalogo), 0) > 0
);
alter table public.mecha_kaijus_catalogo
    alter column ordem set default nextval('public.mecha_kaijus_ordem_seq');
grant usage, select on sequence public.mecha_kaijus_ordem_seq to authenticated;

alter table public.mecha_kaijus_catalogo enable row level security;
grant select, insert, update on public.mecha_kaijus_catalogo to authenticated;

drop policy if exists "Tripulantes veem catálogo de kaijus" on public.mecha_kaijus_catalogo;
create policy "Tripulantes veem catálogo de kaijus"
on public.mecha_kaijus_catalogo for select to authenticated using (true);

drop policy if exists "Tripulantes criam registros de kaijus" on public.mecha_kaijus_catalogo;
create policy "Tripulantes criam registros de kaijus"
on public.mecha_kaijus_catalogo for insert to authenticated
with check (atualizado_por = auth.uid());

drop policy if exists "Tripulantes editam registros de kaijus" on public.mecha_kaijus_catalogo;
create policy "Tripulantes editam registros de kaijus"
on public.mecha_kaijus_catalogo for update to authenticated
using (true)
with check (atualizado_por = auth.uid());

-- Mantém o relacionamento já usado pelos Mechas e passa a permitir que cada
-- pessoa selecione os próprios Kaijus derrotados diretamente na ficha.
create table if not exists public.mecha_kaijus_derrotados (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    kaiju_id text not null references public.mecha_kaijus_catalogo(id) on delete cascade,
    registrado_em timestamptz not null default now(),
    primary key (usuario_id, kaiju_id)
);

alter table public.mecha_kaijus_derrotados enable row level security;
grant select, insert, delete on public.mecha_kaijus_derrotados to authenticated;

drop policy if exists "Tripulante vê os próprios kaijus" on public.mecha_kaijus_derrotados;
create policy "Tripulante vê os próprios kaijus"
on public.mecha_kaijus_derrotados for select to authenticated
using (usuario_id = auth.uid());

drop policy if exists "Tripulante registra os próprios kaijus" on public.mecha_kaijus_derrotados;
create policy "Tripulante registra os próprios kaijus"
on public.mecha_kaijus_derrotados for insert to authenticated
with check (usuario_id = auth.uid());

drop policy if exists "Tripulante remove os próprios kaijus" on public.mecha_kaijus_derrotados;
create policy "Tripulante remove os próprios kaijus"
on public.mecha_kaijus_derrotados for delete to authenticated
using (usuario_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'kaijus-registros',
    'kaijus-registros',
    true,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tripulação envia imagens de kaijus" on storage.objects;
create policy "Tripulação envia imagens de kaijus"
on storage.objects for insert to authenticated
with check (bucket_id = 'kaijus-registros');

drop policy if exists "Tripulação atualiza imagens de kaijus" on storage.objects;
create policy "Tripulação atualiza imagens de kaijus"
on storage.objects for update to authenticated
using (bucket_id = 'kaijus-registros')
with check (bucket_id = 'kaijus-registros');

drop policy if exists "Tripulação remove imagens de kaijus" on storage.objects;
create policy "Tripulação remove imagens de kaijus"
on storage.objects for delete to authenticated
using (bucket_id = 'kaijus-registros');

-- --------------------------------------------------------------
-- 4. ATUALIZAÇÕES EM TEMPO REAL
-- --------------------------------------------------------------

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public'
          and tablename = 'missoes_tripulantes'
    ) then
        alter publication supabase_realtime add table public.missoes_tripulantes;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public'
          and tablename = 'mecha_kaijus_catalogo'
    ) then
        alter publication supabase_realtime add table public.mecha_kaijus_catalogo;
    end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public'
          and tablename = 'mecha_kaijus_derrotados'
    ) then
        alter publication supabase_realtime add table public.mecha_kaijus_derrotados;
    end if;
end;
$$;

commit;

-- Verificação final: as três consultas devem retornar linhas/contagens.
select count(*) as kaijus_registrados from public.mecha_kaijus_catalogo;
select count(*) as missoes_preservadas from public.missoes_tripulantes;
select id, nivel_embaixador, nivel_combatente, nivel_tripulante
from public.fichas_tripulantes
order by id;
