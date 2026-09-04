# Atualização de Missões, Kaijus e Atributos

## O que foi alterado

- 13 missões do Drive foram cadastradas com classe, resumo, etapas, requisitos e entrega.
- Cada usuário marca no banco de dados apenas as missões que concluiu.
- Missões passadas pessoalmente podem ser registradas na própria ficha, com nome, classe, data, resumo e detalhes.
- Os atributos agora são automáticos:
  - base: 20 de Vida, 0 de Dano Extra, 5 de Agilidade e 0 de Defesa;
  - toda missão concluída: +5 de Vida;
  - Embaixador: +1 de Defesa;
  - Combatente: +1 de Dano Extra;
  - Tripulante: +1 de Agilidade.
- O Registro de Kaijus recebeu as cinco imagens oficiais.
- A ficha agora permite selecionar os Kaijus derrotados.
- O mecha usa as quatro partes da planilha: Cabeça, Tronco, Braços e Pernas.
- Os bônus e efeitos das peças foram substituídos pelos valores exatos de `PARTES KAIJUS.xlsx`.

## Passo obrigatório no Supabase

1. Abra o projeto no Supabase.
2. Entre em **SQL Editor**.
3. Abra o arquivo `EXECUTAR-NO-SUPABASE-MISSOES-KAIJUS.sql` desta pasta.
4. Copie todo o conteúdo, cole no editor e clique em **Run**.
5. No resultado final, confirme:
   - `missoes_oficiais = 13`;
   - `pecas_catalogadas = 14`.

Esse é o único SQL novo que precisa ser executado para esta atualização.

## Atenção à montagem antiga

O SQL preserva o nome, a descrição, a imagem e os Kaijus derrotados de cada usuário. Ele desmarca somente as peças equipadas, pois o sistema anterior tinha seis encaixes e a planilha oficial possui quatro. Depois da atualização, cada usuário deve abrir **Desenvolvimento de Mechas**, escolher novamente as peças e salvar.

## Publicação

Depois de substituir os arquivos no repositório, faça commit e push normalmente. Os arquivos CSS e JavaScript receberam a versão `20260904` no endereço, reduzindo o problema de cache do GitHub Pages. Se uma guia antiga estiver aberta, atualize a página uma vez.

## Teste rápido

1. Faça login.
2. Abra **Missões** e marque uma missão de cada classe.
3. Abra **Ficha do Tripulante** e confira se os atributos foram recalculados.
4. Crie uma missão pessoal e depois exclua-a para testar os dois fluxos.
5. Marque um Kaiju derrotado na ficha.
6. Abra **Registro de Kaijus** e confirme a imagem e os efeitos das peças.
7. Abra **Desenvolvimento de Mechas**, equipe até quatro partes e salve.
