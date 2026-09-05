# Combate automático V6 — Nave 3B

Esta pasta contém o projeto integrado e a nova arena. A preparação reúne as fichas, os equipamentos, os aprimoramentos e as regras das cartas. Durante as rodadas, informe a carta de cada frota e a carta do Kaiju e clique em **Resolver rodada**.

## Instalação sobre a versão integrada V5

1. No SQL Editor do mesmo Supabase usado pelo projeto, execute **EXECUTAR-COMBATE-AUTOMATICO-V6.sql**. A integração V5 e as tabelas atuais de mechas já devem existir.
2. Atualize os arquivos do site com o conteúdo desta pasta. O projeto continua estático, compatível com GitHub Pages e Live Server; não precisa de build nem de novas dependências.
3. Recarregue a página para carregar os arquivos V6. Entre na conta e abra **Arena de Combate**.
4. Cada jogador com aprimoramentos antigos deve abrir **Aprimoramento de Itens** uma vez no navegador em que os sorteou. A oficina envia os resultados antigos para a própria ficha no Supabase sem cobrar novamente. Resultados já salvos no servidor prevalecem.

Execute o SQL antes de colocar os arquivos V6 em uso: a ficha e a oficina passam a consultar a nova coluna. Os SQLs antigos foram mantidos como referência; não é necessário executá-los novamente. A migração V6 não apaga dados nem recria catálogos.

Para experimentar sem autenticação ou banco, abra **arena-demonstracao.html** com Live Server. Também é possível usar `npm run dev` e abrir essa página no servidor local. A demonstração é identificada na tela e fica somente na memória da página.

## Preparar uma batalha

1. Clique em **Preparar combate** e dê um nome à batalha.
2. Escolha a importação pela ficha do tripulante ou pelo mecha com suas peças equipadas.
3. Selecione as frotas. Os quatro primeiros membros entram inicialmente; use as caixas de seleção para trocar integrantes e **Vaga editável** para incluir convidados, até cinco por grupo. É possível jogar com apenas uma frota preenchida.
4. Escolha um Kaiju do catálogo ou configure um personalizado. Abra **Editar Kaiju e cartas** para preparar A, 2–10, J, Q e K.
5. Em **Ficha / cartas**, confira cada participante, os itens sobrepostos e as cartas adicionais ganhas na oficina. Os atributos e a imagem podem ser ajustados para esta batalha.
6. Resolva as pendências de interpretação. O texto original fica disponível para conferência. Marque a revisão geral e inicie a batalha.

Exemplo na carta A do Kaiju: **Causa 5 de dano e atordoa Lucas por 1 rodada**. Clique em **Interpretar texto** e confira dano, alvo Lucas, efeito Atordoado e duração 1. Confirme a interpretação e salve. O motor aplica o dano e impede a próxima oportunidade de ação desse jogador automaticamente.

Para nomes específicos, use **Alvos do Kaiju nesta frota**: Lucas pode existir apenas em uma equipe. Na regra comum às duas frotas, use alvos como esquerda, direita, menor vida, aleatório ou todos. Um nome inexistente bloqueia o início/resolução em vez de atacar outra pessoa.

## Rodadas

- Uma carta da frota ativa aquela carta de todos os seus participantes. Informe também a carta do Kaiju. Existe uma opção para usar cartas diferentes do Kaiju por frota.
- Cada grupo enfrenta uma cópia independente do chefe: vida, buffs, debuffs e vitória não se misturam entre frotas.
- A ordem considera agilidade. Empates favorecem os jogadores; empates entre jogadores seguem a ordem da equipe. Prioridade do aprimoramento Ágil é considerada antes da iniciativa.
- A e 1 são equivalentes. Cartas numéricas sem equipamento usam soco de 3 mais dano extra. J, Q e K sem regra não atacam. Um equipamento substitui o soco daquela carta.
- Defesa efetiva reduz o dano até o mínimo de zero. Escudos e drone absorvem dano; vida e cura respeitam os limites do personagem. Salva-Vidas não faz parte do combate.
- **Desfazer** restaura a alteração anterior, incluindo vida, efeitos, recarga e sorteios, preservando o registro online. **Histórico completo** mostra as revisões.
- Quem criou a batalha controla as rodadas. Outros usuários autenticados podem abrir a batalha e usar **Sincronizar/Atualizar** para acompanhá-la. A atualização do espectador é manual.
- Ficha e cartas podem ser corrigidas durante a batalha; os ajustes também ficam no histórico. Eles não alteram a vida nem os atributos da ficha permanente do jogador.

## Efeitos e duração

O editor oferece atordoamento, veneno, queimadura, sangramento, cegueira, pular ataque, alterações de dano/defesa/agilidade, escudo, redução percentual de dano recebido, fraqueza, cura, regeneração, reflexão, esquiva e prioridade. Cada efeito tem alvo, valor, duração e chance de ativação.

Atordoamento, cegueira, pular ataque e efeitos contínuos contam oportunidades de ação do alvo. Um atordoamento aplicado depois de o alvo agir impede a próxima ação; aplicado antes, impede a ação da rodada atual. Veneno, queimadura e sangramento ignoram defesa e escudos. O veneno da oficina começa na rodada seguinte.

Buffs de atributo, proteção, escudo e esquiva expiram ao fim da rodada configurada: **1 rodada inclui a rodada de aplicação**. A ordem de iniciativa já estabelecida não muda quando um bônus de agilidade é aplicado durante a rodada. Para alcançar a rodada seguinte, configure duração 2. O mesmo efeito da mesma fonte renova a duração; fontes diferentes podem acumular. Reduções percentuais usam a maior redução ativa.

As regras do catálogo incluem combo das Manoplas, recarga do Canhão, Vorpal por agilidade, Coração no próximo ataque, drone, defesa negativa da Vorpal, Lâmina contra carta ímpar e quantidade de cartas das Lâminas Gêmeas. A Máscara reflete somente quando a esquiva funciona. A Fraqueza da oficina protege o próprio jogador que a ativou.

## Texto livre e escolhas da mesa

O interpretador reconhece comandos simples em português, como dano, cura, atordoamento, efeitos contínuos com valor/duração e modificadores de atributos. Ele é determinístico e não depende de IA externa. **Não interpreta qualquer regra narrativa automaticamente.** Confira os campos gerados e configure os efeitos que faltarem antes de confirmar.

Perguntas da Língua de Cobra, escolha do descarte do Guincho, reordenação física do Olho e trocas de carta dos Braços da Hidra dependem de informações da mesa. A interface permite registrar a condição da Língua e o dano do descarte do Guincho. Para reordenações, informe a carta final do baralho físico. A Cabeça da Hidra exige escolher a carta numérica que repetirá duas vezes. O limite de cinco trocas físicas da Hidra fica sob controle da mesa.

Passivas personalizadas descritas no texto da ficha/Kaiju precisam ser representadas nos atributos ou nas cartas. A tela preserva essas descrições e solicita revisão. O Martelo aplica seu dano principal ao único chefe de cada frota; este modo não cria inimigos secundários. A revisão inicial evita cálculos manuais durante as rodadas que usam regras já configuradas.

## Imagens e interface

Há modo compacto, imagens expandidas e tela cheia. A arena preserva a proporção das fotos e ilustrações, sem esticar nem recortar. Imagens próprias podem ser enviadas em PNG, JPG ou WEBP até 4 MB; são reduzidas proporcionalmente para caber no registro da batalha.

As imagens privadas de mechas mantêm o caminho original. Seus links temporários são renovados ao abrir, sincronizar ou salvar a batalha. Se uma imagem ficar indisponível após uma longa pausa, use **Sincronizar**. O layout usa a arena existente como referência; o desenho citado da conversa anterior não estava disponível para reprodução exata.

## Banco e permissões

O SQL cria `combate_batalhas` e `combate_eventos`, além da coluna `fichas_tripulantes.aprimoramentos_itens`. A batalha guarda uma cópia das regras e dos participantes; alterações posteriores nas fichas não mudam uma batalha iniciada.

As operações de criar, salvar, desfazer e aprimorar usam funções do banco. Rodada e histórico são gravados juntos, com verificação de revisão para impedir que duas abas sobrescrevam a mesma batalha. O custo e o resultado de um aprimoramento também são gravados juntos, com bloqueio de cobrança duplicada da mesma categoria.

As batalhas ficam visíveis aos usuários autenticados; só o criador pode alterá-las. Para importar a frota, o SQL acrescenta leitura autenticada dos mechas, peças equipadas e imagens do bucket `mechas-designs`. As permissões de alteração dos mechas continuam com seus donos. Nenhuma chave administrativa foi acrescentada ao site.

Se houver erro de conexão, confira a mensagem antes de repetir a operação. Em conflito entre abas, use **Sincronizar** para retomar a revisão do servidor.

## Verificação desta entrega

- 34 testes automatizados de motor/importação aprovados, cobrindo duração de efeitos, ordem de ações, dano, regras de itens, isolamento das frotas, sorteios reproduzíveis, convidados e renovação de imagens.
- Preparação, edição do quinto participante, interpretação da carta, resolução, histórico e desfazer conferidos no navegador.
- CSS conferido em larguras de celular, tablet e computador; imagens com proporção preservada.
- Sintaxe e referências locais verificadas. A pasta `arena/` anterior continua disponível pelo link **Abrir arena anterior**.

O SQL foi revisado, mas **não foi executado no seu Supabase**. Ainda é necessário conferir a importação, o salvamento e a retomada autenticados depois da instalação. Os testes que simulam chamadas ao banco não substituem essa conferência.

Para repetir os testes locais: `npm test`. A página `tests/responsivo.html` permite conferir larguras de 320, 390, 768 e 1280 pixels.
