# Projeto integrado — 05/09/2026

> Histórico da integração V5. Esta pasta já inclui o combate V6: siga **LEIA-PRIMEIRO-COMBATE-V6.md** para instalar a atualização atual. As observações abaixo sobre combate e aprimoramentos locais descrevem a etapa anterior.

Base: Rpg_escola-main (2).zip.
Contribuição: Rpg_escola-20260905T035516Z-1-001.zip.

## Para usar esta atualização

1. Faça uma cópia da pasta atual antes de substituir os arquivos.
2. No SQL Editor do seu Supabase, execute **somente EXECUTAR-APENAS-INTEGRACAO-ITENS-V5.sql**. Ele acrescenta uma coluna para os IDs dos itens e permite ao usuário editar essa coluna usando as políticas já existentes.
3. Abra a pasta deste projeto no VS Code e inicie index.html com Live Server.
4. Entre na sua conta, abra Ficha do Tripulante, adicione itens em Todos os Itens e clique em SALVAR ITENS E SALVA-VIDAS.
5. Abra Aprimoramento de Itens. Cada giro consome 1 Salva-Vidas da sua ficha.

Os SQLs anteriores foram preservados para referência. **Não os execute novamente para esta integração**: alguns recriam catálogos ou recalculam dados. O novo SQL não apaga dados nem altera a progressão.

## Alterações incorporadas

- Oficina de aprimoramento, catálogo de equipamentos, roleta 70% comum / 20% incomum / 10% raro, três categorias e consulta das regras.
- Seus Itens e Todos os Itens na ficha, com adicionar, remover e consultar aprimoramentos.
- IDs dos itens salvos em itens_catalogo, sem substituir o texto de cartas e passivas usado no projeto atual. A seleção local anterior é aproveitada enquanto não houver seleção salva no servidor. Salvar uma lista vazia também é respeitado.
- Imagens proporcionais e ajuste do tamanho da imagem do mecha.
- Rotas e carregamento dos novos arquivos, com atualização da versão de cache.
- Resultado do giro vinculado ao tripulante e item de origem e salvo antes de terminar a animação. Um segundo clique durante o giro não gera nova cobrança.
- Outros tripulantes podem ser consultados; o aprimoramento é realizado na própria conta, respeitando as permissões atuais da ficha.

## Preservado da versão atual

- Codex dos Kaijus e todas as imagens enviadas.
- Foto do perfil, missões oficiais e pessoais e atributos calculados pelas missões.
- Textos de itens, cartas e passivas.
- Mecha com quatro slots oficiais e efeitos calculados pelos atributos/níveis. Os seis slots no segundo ZIP são da versão antiga: o próprio SQL V3 documenta sua substituição pelos quatro oficiais.
- Integridade, torre, frotas, inventário geral e autenticação.
- Toda a pasta arena e js/arena.js permanecem idênticos ao primeiro ZIP. A integração com as regras de combate fica para a próxima etapa.

As versões antigas de ficha, missões, Kaijus e SQL do segundo ZIP não substituem os módulos atuais.

## Persistência dos aprimoramentos

A lista de itens é compartilhada pelo Supabase após salvar a ficha. **Os resultados dos aprimoramentos continuam no navegador/dispositivo**, como na contribuição recebida. Não sincronizam entre computadores e podem ser perdidos ao limpar os dados do site. O Salva-Vidas é consumido no Supabase. A oficina apresenta e registra os efeitos, mas não os aplica automaticamente à arena nesta etapa.

## Verificações realizadas

- Sintaxe de todos os arquivos JavaScript e referências locais dos HTMLs.
- Cenários simulados de seleção de itens, duplicidade de clique, troca de seleção durante o giro e inventário vazio retornado pelo servidor.
- Presença conjunta de avatar, textos, catálogo e missões na ficha.
- Comparação byte a byte dos arquivos de combate, mechas, Kaijus e missões contra o projeto base.

Não houve execução do SQL no seu Supabase, testes autenticados com dados reais ou publicação no GitHub. Os arquivos estão preparados para essas etapas.
