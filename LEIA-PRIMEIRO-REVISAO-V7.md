# Revisão geral V7 — Nave 3B

A V7 conecta planetas e inventário coletivo ao Supabase, permite cadastrar Kaijus com cartas executáveis e reorganiza a preparação do combate e a oficina. O menu de celular oferece acesso às 12 abas.

## Ativar a atualização

1. Use o mesmo projeto Supabase que já atende à Nave 3B. Se a migração de combate V6 ainda não foi executada, execute primeiro **EXECUTAR-COMBATE-AUTOMATICO-V6.sql**. Se a V6 já funciona, não precisa repeti-la.
2. No SQL Editor, execute o conteúdo completo de **EXECUTAR-REVISAO-GERAL-V7.sql**. Aguarde a confirmação de sucesso. A migração acrescenta tabelas, campos, permissões e funções; não apaga fichas, batalhas nem peças equipadas.
3. Faça o merge do pull request da branch **revisao-geral-v7** na **main**. Aguarde a publicação do GitHub Pages e recarregue o site. Os arquivos desta revisão têm uma nova versão na URL para atualizar o cache.
4. Entre na conta e abra **Sistema Estelar** e **Inventário**. Se aparecer **Revisar importação**, use essa opção no navegador em que estavam os registros antigos. Itens existentes não têm suas quantidades somadas; planetas já editados no servidor são preservados.
5. Confira a criação e edição de um registro, o histórico do estoque, um Kaiju de treinamento e a retomada de uma batalha. A execução no Supabase da escola ainda precisa ser conferida com a conta autenticada.

Não execute todos os SQLs antigos novamente. Eles documentam etapas anteriores do projeto; alguns atualizam catálogos e peças. Para esta atualização sobre a V6, o arquivo necessário é o **V7**.

O SQL V7 pode ser reaplicado: os registros já migrados e os dados criados pelos jogadores são preservados. Se aparecer um erro, a transação é cancelada; confira a mensagem antes de publicar as novas telas.

## Se a primeira tentativa mostrou `operator does not exist: text = jsonb`

Use a versão corrigida deste SQL V7 e execute o arquivo completo novamente no SQL Editor. Não é necessário repetir a V6 se ela já foi aplicada. A tentativa que falhou dentro da transação não concluiu a instalação da V7.

O cadastro antigo definia `ataques` como texto. A correção transforma essa coluna em `jsonb`, remove o default textual incompatível e preserva uma cópia exata do conteúdo antigo em `ataques_legado`. Objetos JSON existentes são mantidos; textos livres e formatos sem cartas ficam guardados para revisão. Eles aparecem em **Ver ataques do cadastro antigo**, no registro do Kaiju. Reexecutar a migração não substitui cartas já gravadas nem a cópia original.

## Onde os dados ficam

O site usa um único Supabase com tabelas por área. Abas que mostram as mesmas informações consultam a mesma fonte, evitando cópias divergentes.

| Aba | Fonte persistente |
| --- | --- |
| Dashboard | Resumo dos registros de frotas, missões, planetas e inventário |
| Sistema Estelar | `nave_planetas`; vínculo `missoes_catalogo.planeta_id` |
| Missões | `missoes_catalogo`, `tripulante_missoes` |
| Registro de Kaijus | `mecha_kaijus_catalogo`, `kaiju_rolagens`, catálogo de peças e derrotas pessoais |
| Frotas | `frotas`, `frota_integrantes`, `profiles` |
| Inventário | `nave_inventario`, `nave_itens_catalogo`, `nave_eventos` |
| Integridade da Nave | `nave_integridade`, `nave_integridade_historico` |
| Arena de Combate | `combate_batalhas`, `combate_eventos` |
| Torre de Armas | `nave_integridade`, `nave_torre_armas_historico` |
| Ficha do Tripulante | `fichas_tripulantes`, `profiles`, missões e derrotas pessoais |
| Desenvolvimento de Mechas | `mechas_20m`, `mecha_pecas_equipadas`, `mecha_pecas_catalogo`, `mecha_kaijus_derrotados` |
| Aprimoramento de Itens | `nave_itens_catalogo`, `fichas_tripulantes.aprimoramentos_itens`, saldo da ficha e recibos em `nave_operacoes` |

O armazenamento do navegador serve como apoio à migração, cache e recuperação de sorteios pendentes. Os registros compartilhados e os resultados novos são confirmados pelo servidor.

## Planetas e inventário

Planetas podem ser criados, editados e liberados. Verdejante permanece disponível como destino inicial. **Ver missões** abre as missões daquele planeta; o filtro também está na aba Missões. O novo identificador do planeta permite relacionar missões futuras sem depender do nome exibido.

O inventário tem busca, categorias, quantidade, vínculo opcional com equipamentos do catálogo e histórico de entradas e retiradas. **Arquivar** retira o item da lista ativa e preserva seu histórico. Não há exclusão definitiva pela interface.

O estoque é coletivo. Vincular um item ao catálogo não o distribui automaticamente aos jogadores: equipamentos pessoais continuam sendo registrados em **Ficha do Tripulante**.

Cada edição verifica a versão do registro. Se outra pessoa tiver alterado os dados, atualize a lista e revise o formulário antes de salvar. Entradas e retiradas são calculadas no banco e não permitem saldo negativo.

## Cadastrar um chefe

Em **Registro de Kaijus → Novo Kaiju**, informe nome, vida, agilidade, defesa e imagem. Escolha uma carta, escreva o ataque e use **Interpretar descrição**. Confira os campos gerados, incluindo alvo, duração e chance, e marque a revisão antes de salvar.

Exemplo: **Causa 5 de dano e atordoa o jogador da esquerda por 1 rodada** produz dano 5, alvo esquerda e atordoamento por uma oportunidade de ação. Durante a batalha, o motor aplica essa regra quando a carta é informada.

Um Kaiju cadastrado aparece em **Preparar combate → Registro de Kaiju**. O editor de batalha separa **Ficha e imagem** de **Cartas e efeitos**. Configurações avançadas ficam recolhidas e as imagens são exibidas com a proporção preservada.

Kaijus personalizados podem ser editados por quem os criou. **Duplicar** permite adaptar um registro existente. Os cinco Codex originais foram copiados para o banco preservando suas descrições; textos narrativos e danos contraditórios exigem revisão antes de iniciar o combate. Descrever uma passiva não basta: represente seu efeito nos atributos ou nas cartas.

Imagens enviadas ao cadastro usam o bucket privado `kaijus-imagens`, com PNG, JPG ou WEBP de até 4 MB. Outros tripulantes autenticados podem visualizá-las por links temporários. Caminhos de imagens ficam associados ao registro para renovar esses links.

O histórico de **Sortear ataque** é salvo por usuário. As cartas e efeitos do combate usam a cópia gravada na batalha; alterações posteriores no catálogo não reescrevem batalhas iniciadas.

## Oficina

O painel mostra o equipamento, as três categorias de melhoria, as probabilidades e o saldo. O servidor sorteia uma categoria ainda livre e a raridade, registra o resultado e desconta **1 Salva-Vidas** na mesma transação. Categorias concluídas não voltam ao sorteio.

As probabilidades continuam em **70% comum, 20% incomum e 10% raro**. Cada item aceita uma melhoria por categoria. As regras de ativação dos efeitos e de escolha das cartas extras continuam descritas em **Como funciona** e no guia V6.

Se uma resposta de sorteio não chegar, a oficina guarda sua identificação e oferece **Conferir último sorteio**. Repetir esse pedido consulta o mesmo resultado, sem uma segunda cobrança. O histórico da ficha permanece sendo a fonte para o combate.

## Base para automações

- `js/nave-dados.js` centraliza leituras e escritas dos novos módulos, mensagens de erro, imagens e atualização de dados.
- Funções `nave_salvar_*`, `nave_movimentar_item` e `nave_sortear_*` concentram validações e alterações no banco. Não replique cálculos de estoque ou sorteios em outro cliente.
- `nave_eventos` registra módulo, registro, ação, autoria, data e dados da mudança. `nave_operacoes` guarda recibos para repetir operações sem duplicar seus efeitos.
- Cartas usam o formato do motor de combate, com dano, alvo e lista de efeitos. O cadastro também valida esse formato no banco.
- Planetas, estoque e definições de equipamentos recebem atualizações do Realtime quando disponível. Os botões **Atualizar** continuam disponíveis. Batalhas de espectadores são atualizadas manualmente.

Essa estrutura prepara futuras integrações. Não foram configuradas tarefas agendadas, bots ou envios externos. O interpretador é determinístico e reconhece instruções simples; perguntas, escolhas da mesa e alterações de baralhos físicos continuam dependendo das informações do mestre.

## Verificação

Foram aprovados **51 testes automatizados** de combate, importação e PostgreSQL local. Eles cobrem duração de efeitos, isolamento entre frotas, imagens, saldo, versões de registros, importação antiga, autoria, permissões, sorteios idempotentes e reaplicação da migração. O banco local usa PGlite com os esquemas de autenticação e armazenamento necessários aos testes; isso não equivale a executar a migração no Supabase da escola.

Também foram conferidos cadastro de planeta, movimentação de estoque, criação de Kaiju com atordoamento, importação do chefe no combate e sorteio da oficina no navegador. As 12 abas foram verificadas a 320 pixels; os principais fluxos também foram conferidos em 390, 768 e 1280 pixels.

Para repetir os testes, use Node.js 24, a versão usada nesta validação:

```sh
npm ci
npm test
npm run dev
```

Abra `revisao-demonstracao.html` no servidor local para testar com dados fictícios. `tests/revisao-responsivo.html` permite alternar larguras. A demonstração não acessa o Supabase e não salva no site real. A dependência PGlite é usada apenas pelos testes; o site continua estático e compatível com GitHub Pages.
