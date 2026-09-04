# Atualização — Registro de Kaijus e Fichas Completas

Esta versão acrescenta o catálogo compartilhado de Kaijus e amplia a ficha de cada tripulante. A Arena de Combate não foi alterada.

## SQL que deve ser executado

Para esta atualização, execute somente este arquivo novo:

`supabase-registro-kaijus-e-fichas.sql`

Passo a passo:

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor**.
3. Clique em **New query**.
4. Abra o arquivo `supabase-registro-kaijus-e-fichas.sql` no VS Code.
5. Copie todo o conteúdo com `Ctrl + A` e `Ctrl + C`.
6. Cole no SQL Editor e clique em **Run**.
7. No final, o Supabase mostrará três resultados de verificação: quantidade de Kaijus, quantidade de missões preservadas e níveis por tripulante.

O arquivo é seguro para ser executado novamente e não apaga as fichas existentes.

## O que foi adicionado

### Registro de Kaijus

- Nova opção **Registro de Kaijus** no menu.
- Toda pessoa autenticada pode criar Kaijus e editar os registros existentes.
- Cada registro possui imagem, nome, vida, agilidade, defesa, ameaça, situação, descrição, ataques, habilidades, passivas e fraquezas.
- O catálogo aceita quantos Kaijus forem necessários.
- As imagens aceitam PNG, JPG, WEBP ou GIF de até 5 MB.
- Os cinco Kaijus que já existiam no Desenvolvimento de Mechas continuam no catálogo; basta abrir cada um e completar as informações.

### Ficha do tripulante

- Imagem de frente e imagem de verso do personagem.
- Níveis de Embaixador, Combatente e Tripulante novamente visíveis.
- Histórico pessoal de missões com nome, categoria, data e relatório.
- Missões podem ser criadas, editadas e removidas pelo próprio dono da ficha.
- Seleção dos Kaijus já derrotados.
- Cada Kaiju derrotado aparece como um pequeno botão com nome e imagem.
- Ao clicar nesse botão, todas as informações do Kaiju são abertas.

## Preservação das missões antigas

Os totais antigos de Embaixador, Combatente e Tripulante são convertidos automaticamente em itens chamados **Registro anterior**. Assim, ninguém perde a quantidade de missões que já possuía.

Cada pessoa pode abrir esses itens pelo botão de editar e trocar o título genérico pelo nome real da missão, além de informar a data e o relatório.

Depois da atualização, os níveis passam a acompanhar automaticamente o histórico: registrar uma missão aumenta a categoria correspondente; remover uma missão reduz a categoria.

## Teste recomendado antes de enviar ao GitHub

1. Execute o SQL novo.
2. Abra o `index.html` com o Live Server.
3. Entre em **Registro de Kaijus** e complete um dos registros existentes.
4. Crie um Kaiju de teste com imagem.
5. Abra **Ficha do Tripulante** e envie as imagens de frente e verso.
6. Edite um **Registro anterior** ou crie uma missão nova.
7. Clique em **Selecionar Kaijus**, marque o Kaiju de teste e salve.
8. Clique no pequeno botão do Kaiju na ficha e confira se o arquivo completo é exibido.

Se o navegador ainda mostrar a versão antiga depois da publicação, use `Ctrl + Shift + R` ou limpe o cache do site.

