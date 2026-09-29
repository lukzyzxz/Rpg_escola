-- O admin precisa ler a ficha do piloto escolhido para calcular os mechas.
-- Mantém a leitura dos demais tripulantes com a regra anterior.
drop policy if exists "v10_fichas_limite" on public.fichas_tripulantes;
create policy "v10_fichas_limite" on public.fichas_tripulantes
as restrictive for select to authenticated
using (
  id = (select auth.uid())
  or (select nave_privado.eh_tiao())
  or (select nave_privado.eh_admin())
);
