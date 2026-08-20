# Nave 3B — Central de Comando

Site publicado em: https://lukzyzxz.github.io/Rpg_escola/

## Ativação da Integridade da Nave

Antes de publicar a nova versão, abra o **SQL Editor** do projeto no Supabase,
cole todo o conteúdo do arquivo `supabase-integridade.sql` e clique em **Run**.

Esse script cria:

- integridade inicial em `5/15`;
- bloqueio global de 20 horas;
- registro do tripulante que realizou a recuperação;
- atualização em tempo real para os navegadores conectados;
- proteção contra dois cliques simultâneos.

Depois disso, publique normalmente todos os arquivos do projeto no GitHub Pages.
