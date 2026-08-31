# Atualização: Integridade Extra e Desenvolvimento de Mechas

## 1. Ordem dos arquivos SQL

No Supabase, abra **SQL Editor > New query** e execute os arquivos completos nesta ordem:

1. `supabase-integridade.sql`
2. `supabase-torre-armas.sql`
3. `supabase-desenvolvimento-mechas.sql`

Mesmo que os dois primeiros já tenham sido executados antes, rode novamente as versões que estão neste pacote. Elas atualizam as funções existentes sem apagar a integridade atual nem o histórico.

## 2. Nova regra da integridade

- Abaixo de `15/15`, o botão continua recuperando `+1` garantido.
- Em `15/15`, o botão fica disponível quando o cooldown terminar.
- Ao apertar em `15/15`, existe `50%` de chance de gerar `+1` no **Armazém Extra**.
- A tentativa bem-sucedida ou malsucedida inicia o cooldown global de 20 horas.
- Não existe limite definido para o Armazém Extra: novas tentativas bem-sucedidas acumulam pontos.
- A Torre de Armas consome primeiro o Armazém Extra. Somente quando ele chegar a zero, o disparo reduz a integridade normal.
- Todas as tentativas, sucessos, falhas e disparos ficam registrados no histórico do banco.

## 3. Desenvolvimento de Mechas

Cada usuário autenticado possui um projeto separado. Uma pessoa não consegue ler nem editar o mecha de outra.

O mecha possui:

- altura fixa de 20 metros;
- vida base de 10;
- nome e notas do projeto;
- uma imagem privada de design, com até 5 MB;
- seis slots: cabeça, torso, dois braços e duas pernas;
- totais automáticos de vida, ataque, defesa e agilidade;
- lista automática das passivas ativas.

Os kaijus disponíveis são:

- Rei Porco: força, impacto e resistência;
- Rei Verdejante: regeneração, controle e mobilidade;
- Cobra Falante: veneno, agilidade e efeitos negativos;
- Hidra: regeneração, redundância e ataques múltiplos;
- Tartaruga Dragão: vida e defesa máximas.

Ao marcar um kaiju como derrotado, suas seis peças são desbloqueadas. Ao desmarcá-lo, qualquer peça dele que estava equipada é removida automaticamente antes do salvamento.

## 4. Teste rápido

1. Entre no site com uma conta.
2. Abra **Desenvolvimento de Mechas**.
3. Marque um ou mais kaijus derrotados.
4. Escolha as seis peças e confira os atributos no painel da direita.
5. Adicione nome, notas e uma imagem.
6. Clique em **Salvar Mecha**.
7. Atualize a página e confirme que o projeto reaparece.
8. Para testar a sobrecarga sem esperar, altere temporariamente `ultima_recuperacao` para `null` na linha `id = 1` de `nave_integridade`.
9. Com a integridade em 15, use o botão de recuperação e confira o resultado e o cooldown.
10. Se existir reserva, dispare a Torre de Armas e confirme que a reserva diminui antes do valor `15/15`.

