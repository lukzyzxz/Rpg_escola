# Atualização V8 — Itens e Codex

1. No Supabase, abra o **SQL Editor**.
2. Execute o arquivo `EXECUTAR-ATUALIZACAO-ITENS-CODEX-V8.sql`.
3. Publique novamente os arquivos do site.
4. Na **Ficha do Tripulante**, adicione um item Codex em **Todos os Itens**.
5. Em **Seus Itens**, escolha no seletor qual ataque de **A a 10** será usado pelo Codex.
6. Clique em **SALVAR ITENS E SALVA-VIDAS**.
7. A Oficina de Aprimoramentos só libera o Codex depois que um ataque estiver selecionado.

A seleção é salva no banco na coluna `codex_selecoes` e também é utilizada pela preparação do combate.

## Itens adicionados

Além dos itens de Kaiju Porco, Serpente Falante e Rei Verdejante, a V8 inclui os itens da **Hidra Caótica** e da **Tartaruga Dragão**, mais um item Codex para cada um dos cinco Kaijus.


## Correção V8.3 — Codex não aparecem
O front-end agora mescla o catálogo interno completo com os registros de `nave_itens_catalogo`. Assim, bancos que ainda possuem somente os itens antigos não conseguem mais apagar os 5 Codex nem os equipamentos novos da interface. Não é necessário executar um SQL adicional apenas para visualizar os Codex.
