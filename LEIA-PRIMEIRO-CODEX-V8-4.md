# Codex V8.4 — persistência imediata

Nesta versão, a escolha do ataque de cada item Codex é salva imediatamente ao alterar o seletor.

- A escolha é atualizada na coluna `codex_selecoes` de `fichas_tripulantes`.
- Também existe um cache local por tripulante para impedir que a seleção desapareça durante troca de páginas ou re-renderização.
- Adicionar ou remover outro item não apaga a escolha dos demais Codex.
- Remover o próprio item Codex continua removendo a escolha correspondente.
- O botão geral de salvar a ficha também envia as seleções atuais como redundância.

A coluna `codex_selecoes` já faz parte da atualização SQL da V8, portanto não há novo SQL nesta correção.
