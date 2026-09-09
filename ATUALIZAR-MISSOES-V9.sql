-- Aplicar sobre V8. Não altera a recompensa das missões existentes por padrão.
begin;
alter table public.missoes_catalogo
  add column if not exists ganha_nivel boolean not null default true,
  add column if not exists versao integer not null default 0;

-- Preserva a fórmula instalada e adiciona somente o filtro de recompensa.
do $$
declare definicao text;
begin
  definicao := pg_get_functiondef('public.recalcular_ficha_por_missoes(uuid)'::regprocedure);
  if position('and m.ganha_nivel' in definicao) = 0 then
    if position('and tm.concluida = true' in definicao) = 0 then
      raise exception 'Fórmula de progressão diferente da V3. Revise antes de aplicar.';
    end if;
    execute replace(definicao, 'and tm.concluida = true', 'and tm.concluida = true and m.ganha_nivel');
  end if;
end $$;
revoke execute on function public.recalcular_ficha_por_missoes(uuid) from public, anon, authenticated;

create or replace function public.nave_editar_missao(p_id text, p_versao integer, p_dados jsonb)
returns jsonb language plpgsql security definer set search_path=public
as $$
declare anterior public.missoes_catalogo; nova public.missoes_catalogo; aluno uuid;
begin
  if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
  -- Serializa edições que recalculam fichas de vários tripulantes.
  perform pg_advisory_xact_lock(hashtextextended('nave:editar-missao',0));
  select * into anterior from public.missoes_catalogo where id=p_id for update;
  if not found or (not anterior.oficial and anterior.criado_por is distinct from auth.uid()) then
    raise exception 'Você só pode editar missões oficiais ou suas próprias missões pessoais';
  end if;
  if anterior.versao is distinct from p_versao then raise exception 'A missão mudou. Atualize a lista antes de editar novamente.'; end if;
  if jsonb_typeof(p_dados) is distinct from 'object'
     or coalesce(length(trim(p_dados->>'titulo')),0) not between 1 and 200
     or coalesce(p_dados->>'classe','') not in ('Embaixador','Combatente','Tripulante')
     or jsonb_typeof(p_dados->'ganha_nivel') is distinct from 'boolean'
     or coalesce(length(p_dados->>'resumo'),0)>5000
     or coalesce(length(p_dados->>'entrega'),0)>5000
     or coalesce(length(p_dados->>'periodo'),0)>200
     or coalesce(length(p_dados->>'planeta'),0)>200
     or jsonb_typeof(p_dados->'etapas') is distinct from 'array'
     or jsonb_typeof(p_dados->'requisitos') is distinct from 'array'
     or octet_length(p_dados::text)>30000 then raise exception 'Revise os campos da missão'; end if;
  if exists(select 1 from jsonb_array_elements((p_dados->'etapas')||(p_dados->'requisitos')) e where jsonb_typeof(e)<>'string') then raise exception 'Etapas e requisitos devem ser textos'; end if;
  update public.missoes_catalogo set
    titulo=trim(p_dados->>'titulo'), classe=p_dados->>'classe',
    resumo=coalesce(p_dados->>'resumo',''), entrega=coalesce(p_dados->>'entrega',''),
    periodo=coalesce(p_dados->>'periodo',''), planeta=coalesce(p_dados->>'planeta','Nave 3B'),
    planeta_id=nullif(p_dados->>'planeta_id','')::bigint,
    data_missao=nullif(p_dados->>'data_missao','')::date,
    etapas=array(select jsonb_array_elements_text(p_dados->'etapas')),
    requisitos=array(select jsonb_array_elements_text(p_dados->'requisitos')),
    ganha_nivel=(p_dados->>'ganha_nivel')::boolean, versao=versao+1
  where id=p_id returning * into nova;
  if anterior.ganha_nivel is distinct from nova.ganha_nivel or anterior.classe is distinct from nova.classe then
    for aluno in select usuario_id from public.tripulante_missoes where missao_id=p_id and concluida order by usuario_id loop
      perform public.recalcular_ficha_por_missoes(aluno);
    end loop;
  end if;
  perform public.nave_registrar_evento('missoes',p_id,'editar','Missão atualizada',jsonb_build_object('antes',to_jsonb(anterior),'depois',to_jsonb(nova)));
  return to_jsonb(nova);
end $$;
revoke all on function public.nave_editar_missao(text,integer,jsonb) from public,anon;
grant execute on function public.nave_editar_missao(text,integer,jsonb) to authenticated;
commit;
