-- Segundo mecha: catálogo VERSÃO FINAL de PARTES KAIJUS (1).xlsx.
-- Sem alterações nas tabelas do mecha antigo ou nos níveis das missões.
begin;
create table if not exists public.mechas_novos (
    usuario_id uuid primary key references public.profiles(id) on delete cascade,
    nome text not null default 'NOVO MECHA' check (length(trim(nome)) between 1 and 60),
    descricao text not null default '' check (length(descricao) <= 1200),
    imagem_path text check (imagem_path is null or imagem_path like usuario_id::text || '/%'),
    kaijus_derrotados text[] not null default '{}' check (kaijus_derrotados <@ array['porco','verde','cobra','hidra','tartaruga','urso','aranha']::text[] and array_position(kaijus_derrotados,null) is null),
    cabeca text check (cabeca is null or cabeca = any(array['porco-cabeca','verde-cabeca','cobra-cabeca','hidra-cabeca','tartaruga-cabeca','urso-cabeca','aranha-cabeca'])),
    torso text check (torso is null or torso = any(array['porco-torso','verde-torso','cobra-torso','hidra-torso','tartaruga-torso','urso-torso','aranha-torso'])),
    bracos text check (bracos is null or bracos = any(array['porco-bracos','verde-bracos','cobra-bracos','hidra-bracos','tartaruga-bracos','urso-bracos','aranha-bracos'])),
    pernas text check (pernas is null or pernas = any(array['porco-pernas','verde-pernas','cobra-pernas','hidra-pernas','tartaruga-pernas','urso-pernas','aranha-pernas'])),
    armas_simples boolean not null default true,
    carta_dupla text not null default 'A' check (carta_dupla in ('A','2','3','4','5','6','7','8','9','10','J','Q','K')),
    atualizado_em timestamptz not null default now(),
    check (cabeca is null or split_part(cabeca,'-',1) = any(kaijus_derrotados)),
    check (torso is null or split_part(torso,'-',1) = any(kaijus_derrotados)),
    check (bracos is null or split_part(bracos,'-',1) = any(kaijus_derrotados)),
    check (pernas is null or split_part(pernas,'-',1) = any(kaijus_derrotados))
);
alter table public.mechas_novos enable row level security;
revoke all on public.mechas_novos from anon, authenticated;
grant select, insert, update on public.mechas_novos to authenticated;
drop policy if exists mecha_novo_ler on public.mechas_novos;
create policy mecha_novo_ler on public.mechas_novos for select to authenticated
    using (usuario_id = (select auth.uid()) or (select nave_privado.eh_tiao()));
drop policy if exists mecha_novo_criar on public.mechas_novos;
create policy mecha_novo_criar on public.mechas_novos for insert to authenticated
    with check (usuario_id = (select auth.uid()));
drop policy if exists mecha_novo_editar on public.mechas_novos;
create policy mecha_novo_editar on public.mechas_novos for update to authenticated
    using (usuario_id = (select auth.uid())) with check (usuario_id = (select auth.uid()));

-- A projeção de combate existente entrega somente os dados necessários da frota.
-- A consulta completa da nova configuração continua restrita ao dono e ao TIÃO.
create or replace function nave_privado.dados_combate()
returns jsonb language plpgsql stable security definer set search_path to '' as $$
begin
 if auth.uid() is null then raise exception 'Sessão necessária'; end if;
 return jsonb_build_object(
 'profiles',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'nome',p.nome,'username',p.username,'avatar',p.avatar) order by p.id)
 from public.profiles p where exists(select 1 from public.frota_integrantes m where m.usuario_id=p.id)),'[]'::jsonb),
 'fichas',coalesce((select jsonb_agg(jsonb_build_object(
 'id',f.id,'vida',f.vida,'dano_extra',f.dano_extra,'agilidade',f.agilidade,'defesa',f.defesa,
 'nivel_embaixador',f.nivel_embaixador,'nivel_combatente',f.nivel_combatente,'nivel_tripulante',f.nivel_tripulante,
 'itens_texto',f.itens_texto,'itens_catalogo',f.itens_catalogo,'aprimoramentos_itens',f.aprimoramentos_itens,
 'codex_selecoes',f.codex_selecoes) order by f.id)
 from public.fichas_tripulantes f where exists(select 1 from public.frota_integrantes m where m.usuario_id=f.id)),'[]'::jsonb),
 'novos_mechas',coalesce((select jsonb_agg(jsonb_build_object(
 'usuario_id',n.usuario_id,'nome',n.nome,'imagem_path',n.imagem_path,
 'cabeca',n.cabeca,'torso',n.torso,'bracos',n.bracos,'pernas',n.pernas,
 'armas_simples',n.armas_simples,'carta_dupla',n.carta_dupla) order by n.usuario_id)
 from public.mechas_novos n where exists(select 1 from public.frota_integrantes m where m.usuario_id=n.usuario_id)),'[]'::jsonb));
end $$;
revoke all on function nave_privado.dados_combate() from public, anon;
grant execute on function nave_privado.dados_combate() to authenticated;
commit;
