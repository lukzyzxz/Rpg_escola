-- Execute somente este SQL para atualizar a versão atual fornecida.
-- Acrescenta os IDs do catálogo sem modificar itens_texto, atributos ou missões.
begin;
alter table public.fichas_tripulantes add column if not exists itens_catalogo jsonb;
grant update (itens_catalogo) on public.fichas_tripulantes to authenticated;
comment on column public.fichas_tripulantes.itens_catalogo is 'IDs dos itens do catálogo. NULL permite importar a seleção local; [] representa inventário vazio.';
commit;
