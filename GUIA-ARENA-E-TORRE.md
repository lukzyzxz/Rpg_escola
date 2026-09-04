# Atualização: Arena de Combate e Torre de Armas

## 1. Preparar o Supabase

Antes de testar a Torre de Armas, abra o **SQL Editor** do mesmo projeto Supabase usado pela Nave e execute todo o arquivo:

`supabase-torre-armas.sql`

Esse SQL:

- conecta a Torre ao valor global de integridade já existente;
- cria o histórico de disparos;
- registra o usuário autenticado que realizou cada disparo;
- valida a senha `0000` dentro do banco;
- reduz exatamente 1 ponto por disparo, sem cooldown;
- impede que a integridade fique abaixo de zero.

## 2. Testar a Torre de Armas

1. Abra o site pelo Live Server ou GitHub Pages.
2. Entre em uma conta da Nave.
3. Acesse **Torre de Armas**.
4. Digite `0000`.
5. O único botão de disparo será liberado.
6. Ao disparar, a integridade será reduzida em 1 ponto e o nome da conta será registrado.
7. Para disparar novamente, será obrigatório digitar `0000` outra vez.

## 3. Testar a Arena de Combate

1. Acesse **Arena de Combate** no menu da Nave.
2. Em **Frota contra o Kaiju**, escolha uma das frotas cadastradas.
3. Selecione entre um e quatro integrantes e clique em **Enviar frota para a Arena**.
4. No lobby, adicione a imagem e edite o nome de cada Kaiju.
5. Entre em uma das quatro equipes.
6. A imagem e o nome do Kaiju aparecerão na batalha, e os combatentes escolhidos preencherão automaticamente as quatro vagas.

As frotas e seus integrantes são carregados diretamente do Supabase. A frota fixa **POVO LIVRE** não aparece como opção de combate; primeiro mova os tripulantes para uma frota normal.

Os dados da arena são salvos separadamente para cada equipe no navegador. A arena também possui:

- dano e cura rápida para cada jogador;
- indicação visual de vida crítica e personagem fora de combate;
- contador de rodadas;
- histórico das ações da batalha;
- opção de desfazer a última alteração de vida;
- aplicação de dano do Kaiju em vários alvos, considerando a defesa;
- modo de tela cheia.

## 4. Publicação

Envie a pasta inteira do projeto para o repositório. A pasta `arena` deve permanecer na raiz, ao lado das pastas `css` e `js`, para que a nova aba funcione no GitHub Pages.
