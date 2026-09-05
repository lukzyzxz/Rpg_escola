-- Execute após a integração V5. Não altera missões, atributos, catálogos ou batalhas antigas.
begin;
alter table public.fichas_tripulantes add column if not exists aprimoramentos_itens jsonb not null default '{}'::jsonb;
grant update (aprimoramentos_itens) on public.fichas_tripulantes to authenticated;
-- Fichas e imagens de mecha podem ser consultadas por quem participa da nave.
-- A gravação continua sujeita às permissões do dono; não há leitura anônima nova.
drop policy if exists combate_consulta_mechas on public.mechas_20m;
create policy combate_consulta_mechas on public.mechas_20m for select to authenticated using(true);
drop policy if exists combate_consulta_pecas on public.mecha_pecas_equipadas;
create policy combate_consulta_pecas on public.mecha_pecas_equipadas for select to authenticated using(true);
grant select on public.mechas_20m,public.mecha_pecas_equipadas to authenticated;
drop policy if exists combate_consulta_imagens_mecha on storage.objects;
create policy combate_consulta_imagens_mecha on storage.objects for select to authenticated using(bucket_id='mechas-designs');
create table if not exists public.combate_batalhas (
 id uuid primary key default gen_random_uuid(),
 criado_por uuid not null references auth.users(id),
 titulo text not null,
 estado jsonb not null,
 revisao integer not null default 0,
 cursor_revisao integer not null default 0,
 criado_em timestamptz not null default now(),
 atualizado_em timestamptz not null default now()
);
create table if not exists public.combate_eventos (
 id bigint generated always as identity primary key,
 batalha_id uuid not null references public.combate_batalhas(id) on delete cascade,
 revisao integer not null,
 tipo text not null,
 anterior_revisao integer not null default 0,
 anterior jsonb not null,
 posterior jsonb not null,
 criado_em timestamptz not null default now(),
 unique(batalha_id,revisao)
);
alter table public.combate_batalhas enable row level security;
alter table public.combate_eventos enable row level security;
drop policy if exists combate_leitura on public.combate_batalhas;
create policy combate_leitura on public.combate_batalhas for select to authenticated using(true);
drop policy if exists combate_eventos_leitura on public.combate_eventos;
create policy combate_eventos_leitura on public.combate_eventos for select to authenticated using(true);
grant select on public.combate_batalhas,public.combate_eventos to authenticated;
revoke insert,update,delete on public.combate_batalhas,public.combate_eventos from anon,authenticated;

create or replace function public.combate_criar(p_estado jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare b public.combate_batalhas;
begin
 if auth.uid() is null then raise exception 'Entre na sua conta'; end if;
 if p_estado->>'schema' is distinct from '1' or jsonb_typeof(p_estado->'teams') is distinct from 'array' or octet_length(p_estado::text)>2000000 then raise exception 'Estado de combate inválido'; end if;
 if jsonb_array_length(p_estado->'teams') not between 1 and 2 then raise exception 'São permitidas até duas frotas'; end if;
 insert into public.combate_batalhas(criado_por,titulo,estado) values(auth.uid(),left(coalesce(p_estado->>'title','Combate'),150),p_estado) returning * into b;
 return to_jsonb(b);
end; $$;
create or replace function public.combate_salvar(p_id uuid,p_revisao integer,p_estado jsonb,p_tipo text default 'rodada') returns jsonb
language plpgsql security definer set search_path=public as $$
declare b public.combate_batalhas; proximo jsonb; novo_cursor integer;
begin
 select * into b from public.combate_batalhas where id=p_id for update;
 if not found or b.criado_por is distinct from auth.uid() then raise exception 'Apenas quem criou a batalha pode controlá-la'; end if;
 if b.revisao is distinct from p_revisao then raise exception 'CONFLITO: outra aba já atualizou a batalha. Reabra antes de continuar.'; end if;
 if p_tipo not in ('rodada','ajuste','encerrar','desfazer') then raise exception 'Operação inválida'; end if;
 if p_tipo='desfazer' then
   select anterior,anterior_revisao into proximo,novo_cursor from public.combate_eventos where batalha_id=p_id and revisao=b.cursor_revisao;
   if proximo is null then raise exception 'Não há rodada para desfazer'; end if;
 else proximo:=p_estado; novo_cursor:=b.revisao+1; end if;
 if proximo->>'schema' is distinct from '1' or octet_length(proximo::text)>2000000 then raise exception 'Estado inválido'; end if;
 insert into public.combate_eventos(batalha_id,revisao,tipo,anterior,posterior,anterior_revisao) values(p_id,b.revisao+1,p_tipo,b.estado,proximo,b.cursor_revisao);
 update public.combate_batalhas set estado=proximo,titulo=left(coalesce(proximo->>'title',titulo),150),revisao=revisao+1,cursor_revisao=novo_cursor,atualizado_em=now() where id=p_id returning * into b;
 return to_jsonb(b);
end; $$;
revoke all on function public.combate_criar(jsonb) from public;
revoke all on function public.combate_salvar(uuid,integer,jsonb,text) from public;
grant execute on function public.combate_criar(jsonb) to authenticated;
grant execute on function public.combate_salvar(uuid,integer,jsonb,text) to authenticated;

-- Grava a melhoria e o custo juntos. A mesma categoria não pode ser cobrada duas vezes.
create or replace function public.combate_aprimorar(p_item text,p_categoria text,p_resultado jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare f public.fichas_tripulantes; regs jsonb;
begin
 select * into f from public.fichas_tripulantes where id=auth.uid() for update;
 if not found then raise exception 'Ficha não encontrada'; end if;
 if coalesce(p_categoria,'') not in ('cartas','atributo','adicional') or coalesce(p_resultado->>'raridade','') not in ('comum','incomum','raro') or jsonb_typeof(p_resultado) is distinct from 'object' or octet_length(p_resultado::text)>10000 then raise exception 'Aprimoramento inválido'; end if;
 if not coalesce(f.itens_catalogo ? p_item,false) then raise exception 'Salve este item na sua ficha primeiro'; end if;
 regs:=coalesce(f.aprimoramentos_itens,'{}'::jsonb);
 if (regs->p_item) ? p_categoria then raise exception 'Esta categoria já foi aprimorada'; end if;
 if coalesce(f.salva_vidas,0)<1 then raise exception 'Sem Salva-Vidas'; end if;
 regs:=jsonb_set(regs,array[p_item],coalesce(regs->p_item,'{}'::jsonb)||jsonb_build_object(p_categoria,p_resultado),true);
 update public.fichas_tripulantes set salva_vidas=salva_vidas-1,aprimoramentos_itens=regs,atualizado_em=now() where id=auth.uid();
 return jsonb_build_object('saldo',f.salva_vidas-1,'aprimoramentos',regs);
end; $$;
revoke all on function public.combate_aprimorar(text,text,jsonb) from public;
grant execute on function public.combate_aprimorar(text,text,jsonb) to authenticated;
-- Aproveita melhorias antigas do próprio navegador, sem nova cobrança.
create or replace function public.combate_importar_aprimoramentos(p_registros jsonb) returns jsonb
language plpgsql security definer set search_path=public as $$
declare regs jsonb; item text; valor jsonb;
begin
 if auth.uid() is null or jsonb_typeof(p_registros) is distinct from 'object' or octet_length(p_registros::text)>200000 then raise exception 'Dados inválidos'; end if;
 select aprimoramentos_itens into regs from public.fichas_tripulantes where id=auth.uid() for update;
 if not found then raise exception 'Ficha não encontrada'; end if;
 regs:=coalesce(regs,'{}'::jsonb);
 for item,valor in select * from jsonb_each(p_registros) loop
   if jsonb_typeof(valor)='object' then
     regs:=jsonb_set(regs,array[item],valor||coalesce(regs->item,'{}'::jsonb),true);
   end if;
 end loop;
 update public.fichas_tripulantes set aprimoramentos_itens=regs where id=auth.uid();
 return regs;
end; $$;
revoke all on function public.combate_importar_aprimoramentos(jsonb) from public;
grant execute on function public.combate_importar_aprimoramentos(jsonb) to authenticated;
commit;
