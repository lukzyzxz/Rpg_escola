-- Execute esta versão completa no SQL Editor do Supabase.
-- É seguro rodá-la novamente para atualizar o catálogo de peças.
-- Ele cria o mecha individual de 20 metros, o catálogo de peças dos cinco
-- kaijus, o salvamento atômico e o armazenamento privado das imagens.

create table if not exists public.mecha_kaijus_catalogo (
    id text primary key,
    nome text not null unique,
    ordem smallint not null unique
);

insert into public.mecha_kaijus_catalogo (id, nome, ordem) values
    ('rei-porco', 'Rei Porco', 1),
    ('rei-verdejante', 'Rei Verdejante', 2),
    ('cobra-falante', 'Cobra Falante', 3),
    ('hidra', 'Hidra', 4),
    ('tartaruga-dragao', 'Tartaruga Dragão', 5)
on conflict (id) do update set
    nome = excluded.nome,
    ordem = excluded.ordem;

create table if not exists public.mecha_pecas_catalogo (
    id text primary key,
    kaiju_id text not null references public.mecha_kaijus_catalogo(id) on delete cascade,
    slot text not null check (slot in (
        'cabeca', 'torso', 'braco_esquerdo', 'braco_direito',
        'perna_esquerda', 'perna_direita'
    )),
    nome text not null,
    vida integer not null default 0 check (vida >= 0),
    ataque integer not null default 0 check (ataque >= 0),
    defesa integer not null default 0 check (defesa >= 0),
    agilidade integer not null default 0 check (agilidade >= 0),
    passiva text not null,
    descricao text not null,
    unique (kaiju_id, slot)
);

insert into public.mecha_pecas_catalogo
    (id, kaiju_id, slot, nome, vida, ataque, defesa, agilidade, passiva, descricao)
values
    ('porco-cabeca', 'rei-porco', 'cabeca', 'Elmo da Presa Real', 5, 1, 2, 0,
     'Farejo de Guerra: o primeiro ataque contra um alvo causa +2 de dano.',
     'Sensores reforçados e presas frontais para colisões.'),
    ('porco-torso', 'rei-porco', 'torso', 'Couraça do Banquete', 15, 0, 5, 0,
     'Gordura Blindada: reduz em 2 o primeiro dano recebido em cada combate.',
     'Blindagem pesada feita para absorver impacto direto.'),
    ('porco-braco-e', 'rei-porco', 'braco_esquerdo', 'Punho Quebra-Muralha E', 4, 5, 1, 0,
     'Investida Brutal: após se mover, o próximo golpe recebe +1 de ataque.',
     'Braço hidráulico de alto impacto.'),
    ('porco-braco-d', 'rei-porco', 'braco_direito', 'Punho Quebra-Muralha D', 4, 5, 1, 0,
     'Golpe Demolidor: em acerto máximo, ignora 1 ponto de defesa.',
     'Punho reforçado para destruir carapaças.'),
    ('porco-perna-e', 'rei-porco', 'perna_esquerda', 'Pata Sísmica E', 5, 1, 2, 1,
     'Pisada Sísmica: uma vez por combate, reduz em 1 a agilidade do alvo.',
     'Estabilizador terrestre de grande massa.'),
    ('porco-perna-d', 'rei-porco', 'perna_direita', 'Pata Sísmica D', 5, 1, 2, 1,
     'Base Inabalável: recebe +1 de defesa enquanto não se deslocar.',
     'Pistões de ancoragem contra empurrões.'),

    ('verde-cabeca', 'rei-verdejante', 'cabeca', 'Coroa Fotossintética', 5, 0, 2, 2,
     'Olhar Solar: recuperações recebidas restauram +1 de vida adicional.',
     'Cúpula viva que converte luz em energia.'),
    ('verde-torso', 'rei-verdejante', 'torso', 'Núcleo da Floresta', 14, 0, 4, 1,
     'Regeneração Verde: recupera 2 de vida uma vez por combate.',
     'Reator orgânico com placas autorregenerativas.'),
    ('verde-braco-e', 'rei-verdejante', 'braco_esquerdo', 'Lança-Vinhas E', 4, 4, 1, 2,
     'Enraizar: um acerto especial pode reduzir a agilidade inimiga em 2 por uma rodada.',
     'Emissor de cabos vegetais para contenção.'),
    ('verde-braco-d', 'rei-verdejante', 'braco_direito', 'Lâmina Clorofila D', 4, 4, 1, 2,
     'Seiva Restauradora: ao finalizar um inimigo, recupera 1 de vida.',
     'Lâmina alimentada por energia biológica.'),
    ('verde-perna-e', 'rei-verdejante', 'perna_esquerda', 'Raiz Propulsora E', 5, 0, 2, 3,
     'Passo de Cipó: ignora a primeira penalidade de terreno.',
     'Raízes retráteis dão tração e impulso.'),
    ('verde-perna-d', 'rei-verdejante', 'perna_direita', 'Raiz Propulsora D', 5, 0, 2, 3,
     'Ancoragem Viva: não pode ser derrubado na primeira tentativa.',
     'Sistema orgânico de estabilização.'),

    ('cobra-cabeca', 'cobra-falante', 'cabeca', 'Capuz do Oráculo', 3, 1, 1, 4,
     'Sussurro Predador: revela uma passiva inimiga no início do combate.',
     'Sensores de calor com leitura avançada de movimento.'),
    ('cobra-torso', 'cobra-falante', 'torso', 'Escamas de Miragem', 10, 0, 3, 4,
     'Muda de Pele: anula o primeiro efeito negativo recebido.',
     'Placas leves que distorcem a silhueta do mecha.'),
    ('cobra-braco-e', 'cobra-falante', 'braco_esquerdo', 'Presa Venenosa E', 3, 5, 0, 3,
     'Toxina Mecânica: o alvo sofre 1 de dano extra na rodada seguinte.',
     'Injetor perfurante de ação rápida.'),
    ('cobra-braco-d', 'cobra-falante', 'braco_direito', 'Chicote Serpentino D', 3, 4, 0, 4,
     'Constrição: em acerto especial, o alvo perde 1 de ataque por uma rodada.',
     'Braço flexível de alcance ampliado.'),
    ('cobra-perna-e', 'cobra-falante', 'perna_esquerda', 'Rastro Silencioso E', 4, 0, 1, 5,
     'Emboscada: recebe +1 de ataque se agir antes do alvo.',
     'Propulsor silencioso para mudança de posição.'),
    ('cobra-perna-d', 'cobra-falante', 'perna_direita', 'Rastro Silencioso D', 4, 0, 1, 5,
     'Esquiva Ofídica: uma vez por combate, repete um teste de agilidade.',
     'Junta articulada para evasões bruscas.'),

    ('hidra-cabeca', 'hidra', 'cabeca', 'Matriz Tricéfala', 6, 2, 1, 2,
     'Vigilância Múltipla: não pode ser surpreendido no início do combate.',
     'Três conjuntos de sensores operando em paralelo.'),
    ('hidra-torso', 'hidra', 'torso', 'Reator Regenerativo', 16, 0, 4, 1,
     'Cabeças Renascem: ao cair abaixo da metade da vida, recupera 3 uma vez.',
     'Reator redundante inspirado na regeneração da Hidra.'),
    ('hidra-braco-e', 'hidra', 'braco_esquerdo', 'Canhão Policéfalo E', 5, 6, 1, 1,
     'Rajada Dupla: uma vez por combate, executa um segundo ataque com -2 de dano.',
     'Múltiplos canos sincronizados.'),
    ('hidra-braco-d', 'hidra', 'braco_direito', 'Garra Regenerante D', 5, 5, 1, 2,
     'Contra-Ataque Vivo: ao bloquear totalmente um golpe, causa 1 de dano.',
     'Garra modular que recompõe segmentos danificados.'),
    ('hidra-perna-e', 'hidra', 'perna_esquerda', 'Coluna Anfíbia E', 6, 0, 2, 3,
     'Adaptação: ignora penalidades de terreno aquático.',
     'Propulsão híbrida para solo e água.'),
    ('hidra-perna-d', 'hidra', 'perna_direita', 'Coluna Anfíbia D', 6, 0, 2, 3,
     'Redundância Motora: a primeira redução de agilidade é ignorada.',
     'Sistema locomotor com circuitos duplicados.'),

    ('tartaruga-cabeca', 'tartaruga-dragao', 'cabeca', 'Elmo Dracônico', 7, 2, 3, 0,
     'Fôlego de Vapor: uma vez por combate, causa 2 de dano que ignora defesa.',
     'Câmara térmica protegida por placas dracônicas.'),
    ('tartaruga-torso', 'tartaruga-dragao', 'torso', 'Fortaleza de Casco', 18, 0, 7, 0,
     'Bastião Absoluto: com vida cheia, recebe -2 de dano do primeiro golpe.',
     'O maior módulo defensivo disponível para o mecha de 20 metros.'),
    ('tartaruga-braco-e', 'tartaruga-dragao', 'braco_esquerdo', 'Escudo-Casco E', 6, 2, 4, 0,
     'Guarda Aliada: pode receber 1 ataque destinado a um aliado.',
     'Escudo retrátil acoplado ao antebraço.'),
    ('tartaruga-braco-d', 'tartaruga-dragao', 'braco_direito', 'Martelo Vulcânico D', 6, 5, 2, 0,
     'Impacto Vulcânico: em acerto especial, causa +2 de dano.',
     'Arma térmica construída com placas do casco.'),
    ('tartaruga-perna-e', 'tartaruga-dragao', 'perna_esquerda', 'Pilar Continental E', 7, 0, 4, 1,
     'Postura de Cerco: parado, recebe +1 de defesa.',
     'Perna de sustentação para blindagem extrema.'),
    ('tartaruga-perna-d', 'tartaruga-dragao', 'perna_direita', 'Pilar Continental D', 7, 0, 4, 1,
     'Casco Estável: ignora o primeiro empurrão ou queda.',
     'Âncora mecânica de grande resistência.')
on conflict (id) do update set
    kaiju_id = excluded.kaiju_id,
    slot = excluded.slot,
    nome = excluded.nome,
    vida = excluded.vida,
    ataque = excluded.ataque,
    defesa = excluded.defesa,
    agilidade = excluded.agilidade,
    passiva = excluded.passiva,
    descricao = excluded.descricao;

create table if not exists public.mechas_20m (
    usuario_id uuid primary key references auth.users(id) on delete cascade,
    nome text not null default 'MECHA 20M',
    vida_base integer not null default 10 check (vida_base = 10),
    descricao text not null default '',
    imagem_path text,
    atualizado_em timestamptz not null default now()
);

create table if not exists public.mecha_kaijus_derrotados (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    kaiju_id text not null references public.mecha_kaijus_catalogo(id) on delete cascade,
    registrado_em timestamptz not null default now(),
    primary key (usuario_id, kaiju_id)
);

create table if not exists public.mecha_pecas_equipadas (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    slot text not null check (slot in (
        'cabeca', 'torso', 'braco_esquerdo', 'braco_direito',
        'perna_esquerda', 'perna_direita'
    )),
    peca_id text not null references public.mecha_pecas_catalogo(id) on delete restrict,
    equipado_em timestamptz not null default now(),
    primary key (usuario_id, slot)
);

alter table public.mecha_kaijus_catalogo enable row level security;
alter table public.mecha_pecas_catalogo enable row level security;
alter table public.mechas_20m enable row level security;
alter table public.mecha_kaijus_derrotados enable row level security;
alter table public.mecha_pecas_equipadas enable row level security;

revoke insert, update, delete on public.mecha_kaijus_catalogo from authenticated;
revoke insert, update, delete on public.mecha_pecas_catalogo from authenticated;
revoke insert, update, delete on public.mechas_20m from authenticated;
revoke insert, update, delete on public.mecha_kaijus_derrotados from authenticated;
revoke insert, update, delete on public.mecha_pecas_equipadas from authenticated;

grant select on public.mecha_kaijus_catalogo to authenticated;
grant select on public.mecha_pecas_catalogo to authenticated;
grant select on public.mechas_20m to authenticated;
grant select on public.mecha_kaijus_derrotados to authenticated;
grant select on public.mecha_pecas_equipadas to authenticated;

drop policy if exists "Tripulantes veem catálogo de kaijus" on public.mecha_kaijus_catalogo;
create policy "Tripulantes veem catálogo de kaijus"
on public.mecha_kaijus_catalogo for select to authenticated using (true);

drop policy if exists "Tripulantes veem catálogo de peças" on public.mecha_pecas_catalogo;
create policy "Tripulantes veem catálogo de peças"
on public.mecha_pecas_catalogo for select to authenticated using (true);

drop policy if exists "Tripulante vê o próprio mecha" on public.mechas_20m;
create policy "Tripulante vê o próprio mecha"
on public.mechas_20m for select to authenticated using (usuario_id = auth.uid());

drop policy if exists "Tripulante vê os próprios kaijus" on public.mecha_kaijus_derrotados;
create policy "Tripulante vê os próprios kaijus"
on public.mecha_kaijus_derrotados for select to authenticated using (usuario_id = auth.uid());

drop policy if exists "Tripulante vê as próprias peças" on public.mecha_pecas_equipadas;
create policy "Tripulante vê as próprias peças"
on public.mecha_pecas_equipadas for select to authenticated using (usuario_id = auth.uid());

create or replace function public.salvar_desenvolvimento_mecha(
    p_nome text,
    p_descricao text,
    p_imagem_path text,
    p_kaijus text[],
    p_pecas jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
    v_kaijus text[] := coalesce(p_kaijus, array[]::text[]);
    v_pecas jsonb := coalesce(p_pecas, '{}'::jsonb);
    v_slot text;
    v_peca_id text;
    v_peca_slot text;
    v_peca_kaiju text;
begin
    if v_usuario_id is null then
        raise exception 'Usuário não autenticado';
    end if;

    if jsonb_typeof(v_pecas) <> 'object' then
        raise exception 'Formato de peças inválido';
    end if;

    if exists (
        select 1
        from unnest(v_kaijus) as escolhido(kaiju_id)
        left join public.mecha_kaijus_catalogo catalogo
            on catalogo.id = escolhido.kaiju_id
        where catalogo.id is null
    ) then
        raise exception 'Kaiju selecionado não existe no catálogo';
    end if;

    if nullif(trim(coalesce(p_imagem_path, '')), '') is not null
       and p_imagem_path not like v_usuario_id::text || '/%' then
        raise exception 'Caminho de imagem inválido para este usuário';
    end if;

    for v_slot, v_peca_id in
        select chave, trim(both '"' from valor::text)
        from jsonb_each(v_pecas) as item(chave, valor)
    loop
        if v_slot not in (
            'cabeca', 'torso', 'braco_esquerdo', 'braco_direito',
            'perna_esquerda', 'perna_direita'
        ) then
            raise exception 'Slot de mecha inválido: %', v_slot;
        end if;

        if nullif(v_peca_id, '') is null or v_peca_id = 'null' then
            continue;
        end if;

        select slot, kaiju_id
        into v_peca_slot, v_peca_kaiju
        from public.mecha_pecas_catalogo
        where id = v_peca_id;

        if not found then
            raise exception 'Peça inexistente: %', v_peca_id;
        end if;

        if v_peca_slot <> v_slot then
            raise exception 'A peça % não pertence ao slot %', v_peca_id, v_slot;
        end if;

        if not (v_peca_kaiju = any(v_kaijus)) then
            raise exception 'A peça % ainda não foi desbloqueada', v_peca_id;
        end if;
    end loop;

    insert into public.mechas_20m (
        usuario_id, nome, vida_base, descricao, imagem_path, atualizado_em
    ) values (
        v_usuario_id,
        coalesce(nullif(trim(p_nome), ''), 'MECHA 20M'),
        10,
        trim(coalesce(p_descricao, '')),
        nullif(trim(coalesce(p_imagem_path, '')), ''),
        now()
    )
    on conflict (usuario_id) do update set
        nome = excluded.nome,
        vida_base = 10,
        descricao = excluded.descricao,
        imagem_path = excluded.imagem_path,
        atualizado_em = excluded.atualizado_em;

    delete from public.mecha_pecas_equipadas
    where usuario_id = v_usuario_id;

    delete from public.mecha_kaijus_derrotados
    where usuario_id = v_usuario_id;

    insert into public.mecha_kaijus_derrotados (usuario_id, kaiju_id)
    select v_usuario_id, kaiju_id
    from (select distinct unnest(v_kaijus) as kaiju_id) selecionados;

    for v_slot, v_peca_id in
        select chave, trim(both '"' from valor::text)
        from jsonb_each(v_pecas) as item(chave, valor)
    loop
        if nullif(v_peca_id, '') is not null and v_peca_id <> 'null' then
            insert into public.mecha_pecas_equipadas (usuario_id, slot, peca_id)
            values (v_usuario_id, v_slot, v_peca_id);
        end if;
    end loop;

    return jsonb_build_object(
        'sucesso', true,
        'usuario_id', v_usuario_id,
        'atualizado_em', now()
    );
end;
$$;

revoke all on function public.salvar_desenvolvimento_mecha(text, text, text, text[], jsonb)
from public;

grant execute on function public.salvar_desenvolvimento_mecha(text, text, text, text[], jsonb)
to authenticated;

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'mechas_20m'
    ) then
        alter publication supabase_realtime
        add table public.mechas_20m;
    end if;
end;
$$;

-- Bucket privado: cada tripulante só acessa a própria pasta.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'mechas-designs',
    'mechas-designs',
    false,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tripulante envia imagem do próprio mecha" on storage.objects;
create policy "Tripulante envia imagem do próprio mecha"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante vê imagem do próprio mecha" on storage.objects;
create policy "Tripulante vê imagem do próprio mecha"
on storage.objects for select to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante atualiza imagem do próprio mecha" on storage.objects;
create policy "Tripulante atualiza imagem do próprio mecha"
on storage.objects for update to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante remove imagem do próprio mecha" on storage.objects;
create policy "Tripulante remove imagem do próprio mecha"
on storage.objects for delete to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);
