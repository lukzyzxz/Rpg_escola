-- ======================================================

begin;
-- NÍVEIS DE MISSÃO — Nave 3B
-- Execute DEPOIS de já ter rodado supabase-fichas-tripulantes.sql.
-- Este arquivo:
--   1) adiciona as 3 colunas de nível (embaixador/combatente/tripulante)
--   2) atualiza a ficha de todo mundo com os dados do NOVO formulário
--      (vida, dano extra, agilidade, defesa, salva-vidas, itens E os
--      níveis, calculados a partir das missões marcadas no formulário)
-- ======================================================

-- ------------------------------------------------------
-- 1. NOVAS COLUNAS
-- ------------------------------------------------------
alter table public.fichas_tripulantes
    add column if not exists nivel_embaixador integer not null default 0,
    add column if not exists nivel_combatente integer not null default 0,
    add column if not exists nivel_tripulante integer not null default 0;

alter table public.fichas_tripulantes
    drop constraint if exists fichas_tripulantes_niveis_nao_negativos;

alter table public.fichas_tripulantes
    add constraint fichas_tripulantes_niveis_nao_negativos check (
        nivel_embaixador >= 0 and nivel_combatente >= 0 and nivel_tripulante >= 0
    );

comment on column public.fichas_tripulantes.nivel_embaixador is
    'Nível da missão Embaixador (ligada à Defesa) — quantas missões desse tipo o tripulante concluiu.';
comment on column public.fichas_tripulantes.nivel_combatente is
    'Nível da missão Combatente (ligada ao Dano Extra) — quantas missões desse tipo o tripulante concluiu.';
comment on column public.fichas_tripulantes.nivel_tripulante is
    'Nível da missão Tripulante (ligada à Agilidade) — quantas missões desse tipo o tripulante concluiu.';

-- Observação: a política de RLS já criada em supabase-fichas-tripulantes.sql
-- ("Tripulante só edita a própria ficha") vale para a linha inteira, então
-- essas 3 colunas novas já ficam editáveis pelo próprio dono automaticamente.
-- Não é preciso mexer em nenhuma política.

-- ------------------------------------------------------
-- 2. ATUALIZAÇÃO — dados do novo formulário
-- Mesmo esquema de match por e-mail usado antes. Os níveis foram
-- calculados contando quantas vezes cada categoria de missão
-- ("Embaixador", "Combatente", "Tripulante") apareceu na resposta
-- de múltipla escolha de cada tripulante.
-- ------------------------------------------------------
create temporary table respostas_formulario (
    email text primary key,
    vida numeric not null,
    dano_extra numeric not null,
    agilidade numeric not null,
    defesa numeric not null,
    salva_vidas numeric not null,
    itens_texto text not null,
    nivel_embaixador integer not null,
    nivel_combatente integer not null,
    nivel_tripulante integer not null
) on commit drop;

insert into respostas_formulario
    (email, vida, dano_extra, agilidade, defesa, salva_vidas, itens_texto, nivel_embaixador, nivel_combatente, nivel_tripulante)
values
    ('lucasfqueiroz.contato@gmail.com', 75.0, 3.0, 7.0, 1.0, 5.0, '5 — Coice pela direita: ataca o inimigo mais à direita. -4
A,2,3,4 - Lâminas Gêmeas -9
10 - Terremoto da selva -3 em todos', 1, 1, 1),
    ('francisco.pedro.iar@gmail.com', 70.0, 1.0, 0.0, 2.0, 1.0, 'Martelo Fêmur, Lâmina Verdejante, Guincho, Drone - CODEX: Foco no vigor(Acerta o jogador mais vida -7 de dano), teste de juventude(Acerta o jogador mais novo -6 de vida), explosão de pólen(Atinge todos os jogadores -2 de dano em todos) e, terremoto da selva(Atinge todos os jogadores -3 de dano em todos).', 0, 1, 0),
    ('gabriel.veras608@gmail.com', 70.0, 1.0, 8.0, 1.0, 5.0, 'Mascara
Lâmina Vorpal', 1, 1, 0),
    ('gustavosilveira.contato01@gmail.com', 80.0, 3.0, 7.0, 1.0, 2.0, 'A) Manoplas — 5 de dano. Para cada soco com a manopla utilizado em sequência, adicione +1 de dano acumulativo ao ataque.
2) Canhão Verdejante — 15 de dano. descarrega. Se tirar 2 ou 8 depois, causa 0 dano mas recarrega.
3) Besta de Joaquim — 8 de dano.
4) Fêmur — 6 de dano. Onda de Choque: causa 6 de dano no alvo principal e 4 nos demais inimigos da área.
5) Besta de Joaquim — 8 de dano.
6) Soco — 3 de dano.
7) Besta de Joaquim — 8 de dano.
8) Canhão Verdejante — 15 de dano. descarrega. Se tirar 2 ou 8 depois, causa 0 dano mas recarrega.
9) Manoplas — 5 de dano. Para cada soco com a manopla utilizado em sequência, adicione +1 de dano acumulativo ao ataque.
10) Manoplas — 5 de dano. Para cada soco com a manopla utilizado em sequência, adicione +1 de dano acumulativo ao ataque.', 1, 2, 1),
    ('marinabarbieri.contato@gmail.com', 55.0, 3.0, 5.0, 1.0, 2.0, 'Tenho o ataque da máscara que vale nas cartas 6,7 e 8', 1, 0, 0),
    ('viniciusjalovicar@gmail.com', 65.0, 1.0, 7.0, 1.0, 1.0, 'tenho mascara de cobra nas cartas 6,7,8 e na carta J eu tenho olho do porco', 1, 1, 0),
    ('isabelllidasilvadamasceno0@gmail.com', 60.0, 2.0, 5.0, 0.0, 2.0, 'Tenho manoplas do porco,  Codex do porco( carta 7) e  Canhão do rei verdejante e', 0, 0, 0),
    ('matheushermsdorff808@gmail.com', 65.0, 1.0, 5.0, 2.0, 2.0, 'LÂMINA VERDEJANTE
cartas: 4, 5, 6
Dano Base: 5 de dano.
Condicional: Se a carta do inimigo neste turno for ímpar, a lâmina acha uma brecha e causa 8 de dano no total.
OLHO DO PORCO KAIJU
Carta: J
Dano: 0 (Suporte)
Visão do Porco Caído: Permite ver as próximas 3 cartas do topo do baralho e colocar uma no topo, garantindo o próximo saque.', 1, 2, 0),
    ('emel009593@gmail.com', 55.0, 1.0, 0.0, 0.0, 0.0, 'Codex - Atropelamento desgovernado:  Na carta 10 - Causa 3 de dano a 2 inimigos aleatorios
Femur - Onda de Choque (AoE): Na carta 4 e 8 - Um golpe pesado no chão que causa 6 de dano no alvo principal e 4 de dano nos demais inimigos da área.
Canhão - Causa 15 de dano na carta 2 - 8: Recarga: Arma começa carregada. Ao atirar, descarrega. Se tirar 2 ou 8 depois, causa 0 dano mas recarrega.', 0, 0, 0),
    ('tcastrodonascimento@gmail.com', 70.0, 3.0, 5.0, 1.0, 2.9, 'coração
femur
besta de joaquin
vigilante', 1, 2, 0),
    ('sarahsilvsantana@gmail.com', 60.0, 0.0, 7.0, 0.0, 0.0, 'Manopla (cartas A, 2, 9 e 10): para cada soco com a manopla utilizado em sequência, adicione +1 de dano acumulativo ao ataque.

Guincho (carta Q): se a vida estiver menor ou igual a 50%, escolha uma carta de dano já usada na pilha de descarte e cause o dano dela 2 vezes. Se a vida estiver maior que 50%, o efeito falha e o item cura o próprio usuário em 4 de vida.

Língua de Cobra (carta 4 e 8): Acerte o nome do último ataque do chefe (de cabeça) antes de rolar o dano, e o ataque subirá para 12.

Lâmina Vorpal (carta A, 3, 9 e 10): Se o seu Mecha tiver Velocidade MAIOR que a do inimigo, o ataque é fulminante e o dano é triplicado, causando 15 de dano total. Penalidade: -2 de Defesa contra ataques.', 0, 0, 0),
    ('henriqueburiti192@gmail.com', 70.0, 2.0, 1.0, 1.0, 1.0, 'Manopla - Causa 5 de dano na carta A - 2 - 9 - 10 - Para cada soco com a manopla utilizado em sequência (turnos consecutivos), adicione +1 de dano acumulativo ao ataque.

Coração - Na carta Q: Sobrecarga - Ao ativar, você sacrifica 4 de HP do seu Mecha. Seu próximo ataque com qualquer arma recebe um bônus devastador de +10 de Dano.', 1, 1, 1),
    ('lopes.sophis2008@gmail.com', 65.0, 1.0, 0.0, 1.0, 1.0, 'LÂMINA VERDEJANTE
Cartas: 4, 5, 6
Condicional: Se a carta do inimigo neste turno for ímpar, a lâmina acha uma brecha e causa 8 de dano no total.', 1, 0, 0);

-- Cria a ficha quando a conta já existe mas a linha ainda não foi gerada;
-- quando ela já existe, atualiza todos os campos com a resposta mais recente.
insert into public.fichas_tripulantes (
    id,
    vida,
    dano_extra,
    agilidade,
    defesa,
    salva_vidas,
    itens_texto,
    nivel_embaixador,
    nivel_combatente,
    nivel_tripulante,
    atualizado_em
)
select
    u.id,
    r.vida,
    r.dano_extra,
    r.agilidade,
    r.defesa,
    r.salva_vidas,
    r.itens_texto,
    r.nivel_embaixador,
    r.nivel_combatente,
    r.nivel_tripulante,
    now()
from respostas_formulario r
join auth.users u on lower(u.email) = lower(r.email)
on conflict (id) do update
set
    vida = excluded.vida,
    dano_extra = excluded.dano_extra,
    agilidade = excluded.agilidade,
    defesa = excluded.defesa,
    salva_vidas = excluded.salva_vidas,
    itens_texto = excluded.itens_texto,
    nivel_embaixador = excluded.nivel_embaixador,
    nivel_combatente = excluded.nivel_combatente,
    nivel_tripulante = excluded.nivel_tripulante,
    atualizado_em = excluded.atualizado_em;

-- Resultado 1: deve listar os 13 e-mails como "atualizado".
select
    r.email,
    case
        when u.id is null then 'sem conta no Auth'
        when f.id is null then 'conta sem ficha'
        else 'atualizado'
    end as resultado
from respostas_formulario r
left join auth.users u on lower(u.email) = lower(r.email)
left join public.fichas_tripulantes f on f.id = u.id
order by r.email;

-- Resultado 2: resumo rápido da importação.
select
    count(*) filter (where u.id is not null) as contas_encontradas,
    count(*) filter (where u.id is null) as contas_nao_encontradas,
    count(*) as respostas_recebidas
from respostas_formulario r
left join auth.users u on lower(u.email) = lower(r.email);

commit;
