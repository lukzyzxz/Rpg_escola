-- ============================================================================
-- NAVE 3B — MISSÕES, ATRIBUTOS, KAIJUS E PEÇAS DO MECHA — V3
-- Execute este arquivo inteiro UMA VEZ no SQL Editor do Supabase.
-- Pode ser executado novamente para atualizar o catálogo oficial.
-- V2: corrige contas existentes no Auth que ainda não possuem profile.
-- V3: preserva os valores de status aceitos pelo catálogo de Kaijus existente.
--
-- IMPORTANTE:
-- • os atributos de todos são recalculados para a base 20/0/5/0;
-- • as antigas peças equipadas são desmarcadas porque os 6 slots anteriores
--   foram substituídos pelos 4 slots oficiais da planilha;
-- • nome, descrição e imagem do mecha de cada usuário são preservados.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. CATÁLOGO DE MISSÕES E PROGRESSO PESSOAL
-- ---------------------------------------------------------------------------

create table if not exists public.missoes_catalogo (
    id text primary key,
    titulo text not null,
    classe text not null check (classe in ('Embaixador', 'Combatente', 'Tripulante')),
    periodo text not null default '',
    planeta text not null default 'Nave 3B',
    resumo text not null,
    etapas text[] not null default array[]::text[],
    requisitos text[] not null default array[]::text[],
    entrega text not null default '',
    fonte text not null default '',
    oficial boolean not null default false,
    criado_por uuid references auth.users(id) on delete cascade,
    data_missao date,
    ordem integer not null default 10000,
    criado_em timestamptz not null default now(),
    constraint missoes_catalogo_origem_check check (
        (oficial = true and criado_por is null)
        or (oficial = false and criado_por is not null)
    )
);

create table if not exists public.tripulante_missoes (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    missao_id text not null references public.missoes_catalogo(id) on delete cascade,
    concluida boolean not null default true,
    concluida_em timestamptz,
    atualizado_em timestamptz not null default now(),
    primary key (usuario_id, missao_id)
);

insert into public.missoes_catalogo
    (id, titulo, classe, periodo, planeta, resumo, etapas, requisitos, entrega, fonte, oficial, criado_por, ordem)
values
    (
        'tutorial-o-despertar',
        'O Despertar',
        'Combatente',
        'Missão Tutorial',
        'Laboratório de Robótica',
        'Hackear a porta do laboratório antes que o Kaiju mutante desperte por completo.',
        array[
            'Gerar em Python uma senha aleatória entre 0 e 100.',
            'Pedir ao usuário um palpite e informar se ele foi maior ou menor que a senha.',
            'Encerrar com acesso concedido quando o número correto for descoberto.'
        ],
        array[
            'Limite máximo de 5 tentativas por ciclo.',
            'Em cada erro das tentativas 1 a 4, mostrar a dica e a quantidade restante.',
            'Depois do quinto erro, exibir: O Kaiju está se movimentando...'
        ],
        'Apresentar o programa funcionando e demonstrar os fluxos de acerto e falha.',
        'Missão Tutorial - O Despertar.pptx',
        true,
        null,
        10
    ),
    (
        'restauracao-painel-operacoes',
        'Restauração do Painel de Operações',
        'Tripulante',
        'Quinzena 1',
        'Planeta Verdejante',
        'Desenvolver a interface web principal da Nave 3B e publicá-la para toda a tripulação.',
        array[
            'Criar o Mapa Estelar com planetas disponíveis e setores.',
            'Criar o Registro de Missões com operações e status.',
            'Criar a área de Frotas com grupos e integrantes.'
        ],
        array[
            'Usar HTML, CSS e JavaScript.',
            'Versionar o código no GitHub e ativar o GitHub Pages.',
            'Dividir as tarefas de estrutura, estilo e repositório entre o grupo.',
            'Prazo original informado: 05/08.'
        ],
        'Entregar o painel público e funcional. O melhor design seria adotado pela sala.',
        'Missão_ Planeta Verdejante.pptx',
        true,
        null,
        20
    ),
    (
        'dados-multivariados',
        'Decodificando Dados Multivariados',
        'Embaixador',
        'Quinzena 1',
        'Planeta Verdejante',
        'Traduzir conceitos de dados multivariados para que o restante da frota consiga utilizá-los.',
        array[
            'Ler o tópico 2.2.2, páginas 22 a 26, do livro Inteligência Artificial: Uma Abordagem de Aprendizado de Máquina.',
            'Explicar instâncias, atributos e o impacto da dimensionalidade nos algoritmos.',
            'Montar uma apresentação visual clara para a turma.'
        ],
        array[
            'Missão voluntária para alunos interessados em pesquisa, teoria de dados e comunicação.',
            'Assinar a lista de voluntários.',
            'Aguardar o professor Tião definir os grupos oficiais.'
        ],
        'Apresentar a síntese como base teórica para Tripulantes e Combatentes.',
        'Missão Embaixador_ Dados Multivariados.pptx',
        true,
        null,
        30
    ),
    (
        'dividindo-espolios',
        'Dividindo os Espólios',
        'Combatente',
        'Quinzena 1',
        'Planeta Verdejante',
        'Construir um sistema confiável para sortear os itens obtidos após a derrota do Kaiju.',
        array[
            'Criar uma interface que permita cadastrar participantes e espólios comuns.',
            'Criar campos separados para o Item Especial e o Item Extra do Codex.',
            'Executar sorteios separados e exibir claramente os vencedores.'
        ],
        array[
            'Cada participante pode ganhar no máximo um item comum.',
            'O Item Especial pode sair para quem já ganhou item comum.',
            'O Item Extra só é liberado quando a equipe acerta o Codex e pode sair para qualquer jogador.',
            'Pode usar HTML/CSS/JavaScript ou Python com Flask/Django.'
        ],
        'Entregar e validar um site funcional; sem o sistema os espólios não seriam distribuídos.',
        'Missão Classe Combatente_ Dividindo os Espólios.pptx',
        true,
        null,
        40
    ),
    (
        'legado-de-joaquim',
        'O Legado de Joaquim',
        'Combatente',
        'Fronteira Kaiju',
        'Planeta Verdejante',
        'Limpar com Pandas o banco de dados corrompido do arsenal e recuperar a arma deixada por Joaquim.',
        array[
            'Carregar arsenal_corrompido.csv em um DataFrame Pandas.',
            'Filtrar os registros cuja disponibilidade é verdadeira e remover os marcados como Corrompido.',
            'Localizar códigos virais escondidos nos nomes, tipos e tiers com filtros de texto e inversão lógica.'
        ],
        array[
            'O arquivo possui 20.000 registros, mas somente 16 estão verdadeiramente íntegros.',
            'Usar filtros de DataFrame e operações de string.',
            'O resultado final de len(df_limpo) precisa ser exatamente 16.'
        ],
        'Exibir o DataFrame limpo e responder o nome, o tier e as cartas de ativação da arma de Joaquim.',
        'Missão Combatente - O Legado de Joaquim.pptx',
        true,
        null,
        50
    ),
    (
        'versionamento-operacional',
        'Versionamento Operacional Solo',
        'Tripulante',
        'Missão Solo',
        'Nave 3B',
        'Dominar um tópico de Git/GitHub e ensiná-lo à tripulação com uma demonstração prática.',
        array[
            'Receber do professor Tião um tópico do manual Controlando versões com Git e GitHub.',
            'Estudar a teoria do comando ou processo designado.',
            'Preparar uma demonstração prática ao vivo.'
        ],
        array[
            'Atuação individual, sem formação de esquadrão.',
            'A apresentação completa não pode ultrapassar 3 minutos.',
            'Arquivos e terminal devem estar preparados antes do início do cronômetro.'
        ],
        'Explicar o tópico e executar o comando corretamente dentro do limite de tempo.',
        'Missão Tripulante_ Versionamento Solo.pptx',
        true,
        null,
        60
    ),
    (
        'protocolo-de-ocultacao',
        'Protocolo de Ocultação',
        'Tripulante',
        'Missão Quinzenal',
        'Planeta Verdejante 2',
        'Programar em Python o realinhamento do módulo de camuflagem da nave.',
        array[
            'Gerar uma lista com exatamente 100 números aleatórios e colocá-la em ordem crescente.',
            'Executar um laço de 5 tentativas para fechar a cúpula de camuflagem.',
            'Em cada iteração, calcular 15% de chance de invasão de um Kaiju menor.',
            'Quando houver invasão, pedir a escolha numérica entre fogo de cobertura e combate manual.'
        ],
        array[
            'Confirmar com o professor se a ordenação nativa está liberada ou se é obrigatório criar Bubble Sort.',
            'Opção 1 protege o grupo, mas remove 1 ponto da integridade compartilhada da nave.',
            'Opção 2 preserva a nave, mas exige causar 10 de dano com cartas/status no combate físico.'
        ],
        'Demonstrar o programa, incluindo a ordenação, o loop, a probabilidade e os dois caminhos de decisão.',
        'Missão Quinzenal_ Protocolo de Ocultação.pptx',
        true,
        null,
        70
    ),
    (
        'forja-de-aco',
        'A Forja de Aço: Identidade e Evolução',
        'Tripulante',
        'Quinzena 2',
        'Hangar Central',
        'Criar e integrar a página pessoal exigida para liberar a construção dos mechas gigantes.',
        array[
            'Conversar com o Engenheiro-Chefe Bóris, representado pelo professor, para levantar os requisitos.',
            'Criar a Página de Perfil Pessoal com HTML e CSS.',
            'Vincular a página ao Painel de Operações construído na quinzena anterior.'
        ],
        array[
            'Todos os dados exigidos pelo Engenheiro-Chefe precisam estar presentes.',
            'A integração com o site principal é obrigatória.',
            'Qualquer requisito ausente impede a aprovação da licença do mecha.'
        ],
        'Apresentar a página de perfil completa, integrada e navegável.',
        'A Forja de Aço - Missão 2.pptx',
        true,
        null,
        80
    ),
    (
        'operacao-discord',
        'Operação Discord',
        'Tripulante',
        'Missão de Investigação',
        'Nave 3B',
        'Investigar a intervenção regulatória sobre o Discord e formular um parecer técnico-jurídico.',
        array[
            'Analisar a cautelar da ANPD e o recurso apresentado pela plataforma.',
            'Comparar o caso com bloqueios e punições sofridos por mensageiros, redes sociais e plataformas de vídeo.',
            'Organizar as evidências em uma apresentação e preparar a defesa oral.'
        ],
        array[
            'Considerar segurança infantojuvenil, jurisdição da agência e aplicação preventiva do ECA Digital.',
            'Usar precedentes regulatórios para sustentar o posicionamento.',
            'Defender a medida ou apresentar uma reformulação regulatória fundamentada.'
        ],
        'Apresentar o parecer técnico-jurídico e responder às objeções do debate.',
        'Missão Tripulante - Operação Discord.pptx',
        true,
        null,
        90
    ),
    (
        'a-voz-dos-dados',
        'A Voz dos Dados',
        'Embaixador',
        'Missão de Ciência de Dados',
        'Nave 3B',
        'Transformar análise técnica em comunicação clara, estruturada e baseada em evidências.',
        array[
            'Reunir os mesmos grupos da dinâmica de mímica.',
            'Escolher um eixo: ética e vieses em IA, Big Data na saúde ou reconhecimento facial e privacidade.',
            'Selecionar fontes e dados relevantes.',
            'Construir e apresentar uma defesa analítica.'
        ],
        array[
            'Substituir opiniões e gestos por evidências empíricas.',
            'Fazer curadoria rigorosa dos dados.',
            'Manter a apresentação compreensível para toda a turma.'
        ],
        'Entregar uma apresentação analítica estruturada sobre o eixo escolhido.',
        'Missão Embaixador - Ciência de Dados.pptx',
        true,
        null,
        100
    ),
    (
        'extracao-tempestade-roxa',
        'Extração no Planeta Tempestade Roxa',
        'Combatente',
        'Missão de Extração',
        'Planeta Tempestade Roxa',
        'Processar em Pandas os sensores de 20 raios e converter a energia da tempestade em minerais.',
        array[
            'Transformar o dicionário dados_tempestade em um DataFrame.',
            'Calcular novas colunas de potência e energia, convertendo milissegundos para segundos.',
            'Aplicar perda de 30% quando a potência ultrapassar 5000 PW.',
            'Classificar o mineral e gerar a contagem final com value_counts().'
        ],
        array[
            'Usar np.where() ou uma função com .apply() para o disjuntor.',
            'Quartzo-Nulo: menos de 500 PJ.',
            'Cristal de Lumita: 500 a 2499 PJ.',
            'Núcleo de Aetherium: 2500 PJ ou mais.'
        ],
        'Executar a célula final e mostrar o relatório resumido com a quantidade de cada mineral.',
        'Missão de Extração_ Planeta Tempestade Roxa.pptx',
        true,
        null,
        110
    ),
    (
        'preparativos-frio-absoluto',
        'Preparativos para o Frio Absoluto',
        'Tripulante',
        'Missão 1 — 3ª Quinzena',
        'Planeta Frio Absoluto',
        'Auditar os registros da nave antes do salto para um planeta com condições climáticas letais.',
        array[
            'Conferir os níveis e o histórico exato de missões de cada tripulante.',
            'Garantir que todas as missões passadas e ativas apareçam no quadro central.',
            'Completar o cadastro geral da tripulação.',
            'Registrar todos os Kaijus vencidos no histórico individual.'
        ],
        array[
            'Nível 1 libera aparência física básica; nível 2, calçados; nível 3, blusa; nível 4, calça; nível 5, acessórios.',
            'Dados faltantes ou itens visuais incompatíveis com o nível geram penalidades.',
            'Todos os diários precisam estar sem divergências antes do salto.'
        ],
        'Apresentar a ficha, as missões e o arquivo de Kaijus completos para a auditoria final.',
        'Preparativos Frio Absoluto.pptx',
        true,
        null,
        120
    ),
    (
        'renovacao-de-mechas',
        'Projeto Joaquim: Renovação de Mechas',
        'Embaixador',
        'Missão de Renovação',
        'Planeta Frio Absoluto',
        'Estudar Metodologia Científica e propor estratégias para adaptar os mechas ao frio extremo.',
        array[
            'Formar um esquadrão de exatamente 4 tripulantes.',
            'Escolher um capítulo exclusivo do Manual de Sobrevivência, sem repetir o de outro grupo.',
            'Estudar profundamente o capítulo escolhido.',
            'Apresentar os resultados e relacioná-los à renovação dos mechas.'
        ],
        array[
            'O projeto deve ser fundamentado exclusivamente no livro de Metodologia Científica indicado.',
            'A leitura do capítulo deve acontecer antes de qualquer proposta mecânica.',
            'O grupo e o capítulo precisam ser registrados.'
        ],
        'Expor o capítulo e a proposta de renovação para a tripulação.',
        'Missão Embaixador - Renovação de Mechas.pptx',
        true,
        null,
        130
    )
on conflict (id) do update set
    titulo = excluded.titulo,
    classe = excluded.classe,
    periodo = excluded.periodo,
    planeta = excluded.planeta,
    resumo = excluded.resumo,
    etapas = excluded.etapas,
    requisitos = excluded.requisitos,
    entrega = excluded.entrega,
    fonte = excluded.fonte,
    oficial = true,
    criado_por = null,
    ordem = excluded.ordem;

alter table public.missoes_catalogo enable row level security;
alter table public.tripulante_missoes enable row level security;

revoke insert, update, delete on public.missoes_catalogo from authenticated;
revoke insert, update, delete on public.tripulante_missoes from authenticated;
grant select on public.missoes_catalogo to authenticated;
grant select on public.tripulante_missoes to authenticated;

drop policy if exists "Tripulante vê missões oficiais e pessoais" on public.missoes_catalogo;
create policy "Tripulante vê missões oficiais e pessoais"
on public.missoes_catalogo for select to authenticated
using (oficial = true or criado_por = auth.uid());

drop policy if exists "Tripulante vê o próprio progresso" on public.tripulante_missoes;
create policy "Tripulante vê o próprio progresso"
on public.tripulante_missoes for select to authenticated
using (usuario_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. ATRIBUTOS AUTOMÁTICOS DA FICHA
-- ---------------------------------------------------------------------------

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

create or replace function public.recalcular_ficha_por_missoes(p_usuario_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_total integer := 0;
    v_embaixador integer := 0;
    v_combatente integer := 0;
    v_tripulante integer := 0;
    v_ficha jsonb;
begin
    -- fichas_tripulantes.id também referencia profiles.id. Contas antigas ou
    -- incompletas podem existir em auth.users sem um perfil correspondente.
    -- Nesse caso, não tente criar uma ficha órfã.
    if not exists (
        select 1 from public.profiles where id = p_usuario_id
    ) then
        return jsonb_build_object(
            'ignorada', true,
            'motivo', 'perfil ausente'
        );
    end if;

    select
        count(*)::integer,
        count(*) filter (where m.classe = 'Embaixador')::integer,
        count(*) filter (where m.classe = 'Combatente')::integer,
        count(*) filter (where m.classe = 'Tripulante')::integer
    into v_total, v_embaixador, v_combatente, v_tripulante
    from public.tripulante_missoes tm
    join public.missoes_catalogo m on m.id = tm.missao_id
    where tm.usuario_id = p_usuario_id
      and tm.concluida = true;

    insert into public.fichas_tripulantes (
        id, vida, dano_extra, agilidade, defesa, salva_vidas, itens_texto,
        nivel_embaixador, nivel_combatente, nivel_tripulante, atualizado_em
    ) values (
        p_usuario_id,
        20 + (v_total * 5),
        v_combatente,
        5 + v_tripulante,
        v_embaixador,
        0,
        '',
        v_embaixador,
        v_combatente,
        v_tripulante,
        now()
    )
    on conflict (id) do update set
        vida = excluded.vida,
        dano_extra = excluded.dano_extra,
        agilidade = excluded.agilidade,
        defesa = excluded.defesa,
        nivel_embaixador = excluded.nivel_embaixador,
        nivel_combatente = excluded.nivel_combatente,
        nivel_tripulante = excluded.nivel_tripulante,
        atualizado_em = excluded.atualizado_em;

    select to_jsonb(f) into v_ficha
    from public.fichas_tripulantes f
    where f.id = p_usuario_id;

    return v_ficha;
end;
$$;

create or replace function public.atualizar_ficha_apos_missao()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid;
begin
    v_usuario_id := case when tg_op = 'DELETE' then old.usuario_id else new.usuario_id end;
    perform public.recalcular_ficha_por_missoes(v_usuario_id);
    if tg_op = 'DELETE' then return old; end if;
    return new;
end;
$$;

drop trigger if exists trg_recalcular_ficha_apos_missao on public.tripulante_missoes;
create trigger trg_recalcular_ficha_apos_missao
after insert or update or delete on public.tripulante_missoes
for each row execute function public.atualizar_ficha_apos_missao();

create or replace function public.definir_missao_concluida(
    p_missao_id text,
    p_concluida boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
    v_permitida boolean;
    v_ficha jsonb;
begin
    if v_usuario_id is null then raise exception 'Usuário não autenticado'; end if;

    select exists (
        select 1 from public.missoes_catalogo
        where id = p_missao_id
          and (oficial = true or criado_por = v_usuario_id)
    ) into v_permitida;
    if not v_permitida then raise exception 'Missão não encontrada ou sem permissão'; end if;

    if coalesce(p_concluida, false) then
        insert into public.tripulante_missoes
            (usuario_id, missao_id, concluida, concluida_em, atualizado_em)
        values (v_usuario_id, p_missao_id, true, now(), now())
        on conflict (usuario_id, missao_id) do update set
            concluida = true,
            concluida_em = coalesce(public.tripulante_missoes.concluida_em, now()),
            atualizado_em = now();
    else
        delete from public.tripulante_missoes
        where usuario_id = v_usuario_id and missao_id = p_missao_id;
    end if;

    v_ficha := public.recalcular_ficha_por_missoes(v_usuario_id);
    return jsonb_build_object('sucesso', true, 'ficha', v_ficha);
end;
$$;

create or replace function public.criar_missao_pessoal(
    p_titulo text,
    p_classe text,
    p_resumo text,
    p_detalhes text,
    p_data_missao date default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
    v_missao_id text;
begin
    if v_usuario_id is null then raise exception 'Usuário não autenticado'; end if;
    if p_classe not in ('Embaixador', 'Combatente', 'Tripulante') then
        raise exception 'Classe inválida';
    end if;
    if nullif(trim(coalesce(p_titulo, '')), '') is null
       or nullif(trim(coalesce(p_resumo, '')), '') is null
       or nullif(trim(coalesce(p_detalhes, '')), '') is null then
        raise exception 'Preencha todos os detalhes da missão';
    end if;

    v_missao_id := 'pessoal-' || replace(gen_random_uuid()::text, '-', '');

    insert into public.missoes_catalogo (
        id, titulo, classe, periodo, planeta, resumo, etapas, requisitos,
        entrega, fonte, oficial, criado_por, data_missao, ordem
    ) values (
        v_missao_id,
        left(trim(p_titulo), 100),
        p_classe,
        'Missão pessoal',
        'Nave 3B',
        left(trim(p_resumo), 220),
        array[left(trim(p_detalhes), 1500)],
        array['Missão comunicada pessoalmente e registrada pelo próprio tripulante.'],
        'Validação informada no registro pessoal.',
        'Registro pessoal',
        false,
        v_usuario_id,
        p_data_missao,
        10000
    );

    insert into public.tripulante_missoes
        (usuario_id, missao_id, concluida, concluida_em, atualizado_em)
    values (v_usuario_id, v_missao_id, true, now(), now());

    return jsonb_build_object('sucesso', true, 'missao_id', v_missao_id);
end;
$$;

create or replace function public.excluir_missao_pessoal(p_missao_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
begin
    if v_usuario_id is null then raise exception 'Usuário não autenticado'; end if;

    delete from public.missoes_catalogo
    where id = p_missao_id
      and oficial = false
      and criado_por = v_usuario_id;

    if not found then raise exception 'Missão pessoal não encontrada'; end if;
    perform public.recalcular_ficha_por_missoes(v_usuario_id);
    return jsonb_build_object('sucesso', true);
end;
$$;

revoke all on function public.recalcular_ficha_por_missoes(uuid) from public;
revoke all on function public.definir_missao_concluida(text, boolean) from public;
revoke all on function public.criar_missao_pessoal(text, text, text, text, date) from public;
revoke all on function public.excluir_missao_pessoal(text) from public;
grant execute on function public.definir_missao_concluida(text, boolean) to authenticated;
grant execute on function public.criar_missao_pessoal(text, text, text, text, date) to authenticated;
grant execute on function public.excluir_missao_pessoal(text) to authenticated;

-- Cada usuário continua podendo editar apenas itens e salva-vidas.
revoke update on public.fichas_tripulantes from authenticated;
grant update (salva_vidas, itens_texto, atualizado_em) on public.fichas_tripulantes to authenticated;

-- Restaura/recalcula todo perfil válido. Sem missões marcadas: 20 / 0 / 5 / 0.
-- A iteração usa profiles (e não auth.users), pois fichas_tripulantes.id possui
-- chave estrangeira para profiles.id e podem existir contas antigas sem perfil.
do $$
declare
    v_usuario record;
begin
    for v_usuario in select id from public.profiles loop
        perform public.recalcular_ficha_por_missoes(v_usuario.id);
    end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 3. KAIJUS E PEÇAS EXATAS DA PLANILHA
-- ---------------------------------------------------------------------------

create table if not exists public.mecha_kaijus_catalogo (
    id text primary key,
    nome text not null unique,
    ordem smallint not null unique
);

alter table public.mecha_kaijus_catalogo
    add column if not exists imagem_path text not null default '',
    add column if not exists descricao text not null default '',
    add column if not exists status text not null default 'Desconhecido';

insert into public.mecha_kaijus_catalogo
    (id, nome, ordem, imagem_path, descricao)
values
    ('rei-porco', 'Kaiju Porco', 1, 'assets/kaijus/kaiju-porco.jpg',
     'Criatura de impacto bruto e grande resistência. Seus materiais favorecem vida e mobilidade.'),
    ('rei-verdejante', 'Rei Verdejante', 2, 'assets/kaijus/rei-verdejante.png',
     'Soberano biológico da floresta, capaz de transformar crescimento e níveis de combate em poder.'),
    ('cobra-falante', 'Cobra Falante', 3, 'assets/kaijus/cobra-falante.png',
     'Predadora estratégica cujas peças convertem agilidade e treinamento em ataque e vida.'),
    ('hidra', 'Hidra Caótica', 4, 'assets/kaijus/hidra-caotica.png',
     'Entidade multicéfala de regras imprevisíveis, focada em repetição de cartas e vida extrema.'),
    ('tartaruga-dragao', 'Tartaruga Dragão', 5, 'assets/kaijus/tartaruga-dragao.png',
     'Fortaleza dracônica que troca vida por redução de dano e escala com todos os níveis do piloto.')
on conflict (id) do update set
    nome = excluded.nome,
    ordem = excluded.ordem,
    imagem_path = excluded.imagem_path,
    descricao = excluded.descricao;

create table if not exists public.mecha_pecas_catalogo (
    id text primary key,
    kaiju_id text not null references public.mecha_kaijus_catalogo(id) on delete cascade,
    slot text not null,
    nome text not null,
    vida integer not null default 0,
    ataque integer not null default 0,
    defesa integer not null default 0,
    agilidade integer not null default 0,
    passiva text not null default '',
    descricao text not null default '',
    unique (kaiju_id, slot)
);

alter table public.mecha_pecas_catalogo
    add column if not exists efeito jsonb not null default '{}'::jsonb,
    add column if not exists efeito_resumo text not null default '';

create table if not exists public.mecha_kaijus_derrotados (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    kaiju_id text not null references public.mecha_kaijus_catalogo(id) on delete cascade,
    registrado_em timestamptz not null default now(),
    primary key (usuario_id, kaiju_id)
);

create table if not exists public.mechas_20m (
    usuario_id uuid primary key references auth.users(id) on delete cascade,
    nome text not null default 'MECHA 20M',
    vida_base integer not null default 10 check (vida_base = 10),
    descricao text not null default '',
    imagem_path text,
    atualizado_em timestamptz not null default now()
);

create table if not exists public.mecha_pecas_equipadas (
    usuario_id uuid not null references auth.users(id) on delete cascade,
    slot text not null,
    peca_id text not null references public.mecha_pecas_catalogo(id) on delete restrict,
    equipado_em timestamptz not null default now(),
    primary key (usuario_id, slot)
);

-- Os slots antigos eram seis. A planilha oficial possui quatro categorias.
delete from public.mecha_pecas_equipadas;
delete from public.mecha_pecas_catalogo;

alter table public.mecha_pecas_catalogo drop constraint if exists mecha_pecas_catalogo_slot_check;
alter table public.mecha_pecas_catalogo
    add constraint mecha_pecas_catalogo_slot_check
    check (slot in ('cabeca', 'torso', 'bracos', 'pernas'));

alter table public.mecha_pecas_equipadas drop constraint if exists mecha_pecas_equipadas_slot_check;
alter table public.mecha_pecas_equipadas
    add constraint mecha_pecas_equipadas_slot_check
    check (slot in ('cabeca', 'torso', 'bracos', 'pernas'));

insert into public.mecha_pecas_catalogo
    (id, kaiju_id, slot, nome, vida, ataque, defesa, agilidade, passiva, descricao, efeito, efeito_resumo)
values
    ('porco-cabeca', 'rei-porco', 'cabeca', 'Cabeça do Kaiju Porco', 0, 0, 0, 0,
     'Reserva biológica ampliada.', 'Módulo craniano de alta resistência.',
     '{"vida":20}'::jsonb, '+20 Vida'),
    ('porco-pernas', 'rei-porco', 'pernas', 'Pernas do Kaiju Porco', 0, 0, 0, 0,
     'Locomoção pesada acelerada.', 'Patas reconstruídas com pistões de propulsão.',
     '{"agilidade":2}'::jsonb, '+2 Agilidade'),

    ('verde-cabeca', 'rei-verdejante', 'cabeca', 'Coroa Verdejante', 0, 0, 0, 0,
     'Conversão de energia biológica.', 'Coroa sensorial do soberano da floresta.',
     '{"vida":5,"ataque":2}'::jsonb, '+5 Vida e +2 Dano Extra'),
    ('verde-torso', 'rei-verdejante', 'torso', 'Tronco Verdejante', 0, 0, 0, 0,
     'A vida cresce com o treinamento de Combatente.', 'Núcleo orgânico ligado à experiência do piloto.',
     '{"vida_por_nivel_combatente":10}'::jsonb, '+10 Vida por nível de Combatente'),
    ('verde-bracos', 'rei-verdejante', 'bracos', 'Lâmina Verdejante', 0, 0, 0, 0,
     'Toda carta usada com a lâmina causa 9 de dano.', 'Braços convertidos em lâminas biológicas.',
     '{}'::jsonb, 'Lâmina Verdejante: 9 de dano em toda carta'),

    ('cobra-cabeca', 'cobra-falante', 'cabeca', 'Cabeça da Cobra Falante', 0, 0, 0, 0,
     'Converte agilidade em dano e nível de Combatente em vida.', 'Matriz sensorial adaptativa da Cobra Falante.',
     '{"ataque_igual_agilidade":true,"vida_por_nivel_combatente":5}'::jsonb,
     'Dano Extra igual à Agilidade do piloto e +5 Vida por nível de Combatente'),
    ('cobra-torso', 'cobra-falante', 'torso', 'Tronco da Cobra Falante', 0, 0, 0, 0,
     'O corpo ganha vida proporcional à agilidade do piloto.', 'Estrutura flexível de resposta rápida.',
     '{"agilidade":1,"vida_por_agilidade":6}'::jsonb, '+1 Agilidade e +6 Vida por ponto de Agilidade do piloto'),
    ('cobra-pernas', 'cobra-falante', 'pernas', 'Pernas da Cobra Falante', 0, 0, 0, 0,
     'Blindagem reforçada com perda de mobilidade.', 'Base alongada adaptada ao deslocamento serpentino.',
     '{"vida":30,"agilidade":-2}'::jsonb, '+30 Vida e -2 Agilidade'),

    ('hidra-cabeca', 'hidra', 'cabeca', 'Cabeça Extra da Hidra', 0, 0, 0, 0,
     'Escolha uma carta numérica; quando ela cair, sua ativação acontece duas vezes.', 'Núcleo cefálico duplicador de comandos.',
     '{}'::jsonb, 'Escolha uma carta de número para ativar 2 vezes quando ela cair'),
    ('hidra-torso', 'hidra', 'torso', 'Tronco da Hidra Caótica', 0, 0, 0, 0,
     'Vida colossal incompatível com qualquer defesa.', 'Reator regenerativo instável da Hidra.',
     '{"vida":100,"bloqueia_defesa":true}'::jsonb, '+100 Vida; o mecha não pode ter Defesa'),
    ('hidra-bracos', 'hidra', 'bracos', 'Braços da Hidra Caótica', 0, 0, 0, 0,
     'Permite trocar a carta sorteada pela próxima até 5 vezes por partida.', 'Membros policéfalos que reescrevem a sequência de ataque.',
     '{}'::jsonb, 'Troque a carta que caiu pela próxima até 5 vezes na partida'),

    ('tartaruga-cabeca', 'tartaruga-dragao', 'cabeca', 'Cabeça da Tartaruga Dragão', 0, 0, 0, 0,
     'Ataques ímpares dos inimigos causam 5 pontos a menos de dano.', 'Cabeça dracônica com blindagem reativa.',
     '{"vida":-10}'::jsonb, '-10 Vida; ataques ímpares dos inimigos causam -5 de dano'),
    ('tartaruga-torso', 'tartaruga-dragao', 'torso', 'Casco da Tartaruga Dragão', 0, 0, 0, 0,
     'A vida aumenta conforme a soma dos três níveis do piloto.', 'Casco continental sincronizado à progressão total.',
     '{"vida_por_nivel_total":10}'::jsonb, '+10 Vida por nível total (Embaixador + Combatente + Tripulante)'),
    ('tartaruga-pernas', 'tartaruga-dragao', 'pernas', 'Pernas da Tartaruga Dragão', 0, 0, 0, 0,
     'Base defensiva reforçada.', 'Pilares de sustentação extraídos do casco inferior.',
     '{"vida":20,"defesa":2}'::jsonb, '+20 Vida e +2 Defesa');

alter table public.mecha_kaijus_catalogo enable row level security;
alter table public.mecha_pecas_catalogo enable row level security;
alter table public.mecha_kaijus_derrotados enable row level security;
alter table public.mecha_pecas_equipadas enable row level security;
alter table public.mechas_20m enable row level security;

revoke insert, update, delete on public.mecha_kaijus_catalogo from authenticated;
revoke insert, update, delete on public.mecha_pecas_catalogo from authenticated;
revoke insert, update, delete on public.mecha_kaijus_derrotados from authenticated;
revoke insert, update, delete on public.mecha_pecas_equipadas from authenticated;
revoke insert, update, delete on public.mechas_20m from authenticated;
grant select on public.mecha_kaijus_catalogo to authenticated;
grant select on public.mecha_pecas_catalogo to authenticated;
grant select on public.mecha_kaijus_derrotados to authenticated;
grant select on public.mecha_pecas_equipadas to authenticated;
grant select on public.mechas_20m to authenticated;

drop policy if exists "Tripulantes veem catálogo de kaijus" on public.mecha_kaijus_catalogo;
create policy "Tripulantes veem catálogo de kaijus"
on public.mecha_kaijus_catalogo for select to authenticated using (true);

drop policy if exists "Tripulantes veem catálogo de peças" on public.mecha_pecas_catalogo;
create policy "Tripulantes veem catálogo de peças"
on public.mecha_pecas_catalogo for select to authenticated using (true);

drop policy if exists "Tripulante vê os próprios kaijus" on public.mecha_kaijus_derrotados;
create policy "Tripulante vê os próprios kaijus"
on public.mecha_kaijus_derrotados for select to authenticated
using (usuario_id = auth.uid());

drop policy if exists "Tripulante vê as próprias peças" on public.mecha_pecas_equipadas;
create policy "Tripulante vê as próprias peças"
on public.mecha_pecas_equipadas for select to authenticated
using (usuario_id = auth.uid());

drop policy if exists "Tripulante vê o próprio mecha" on public.mechas_20m;
create policy "Tripulante vê o próprio mecha"
on public.mechas_20m for select to authenticated
using (usuario_id = auth.uid());

create or replace function public.definir_kaiju_derrotado(
    p_kaiju_id text,
    p_derrotado boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
begin
    if v_usuario_id is null then raise exception 'Usuário não autenticado'; end if;
    if not exists (select 1 from public.mecha_kaijus_catalogo where id = p_kaiju_id) then
        raise exception 'Kaiju não encontrado';
    end if;

    if coalesce(p_derrotado, false) then
        insert into public.mecha_kaijus_derrotados (usuario_id, kaiju_id)
        values (v_usuario_id, p_kaiju_id)
        on conflict (usuario_id, kaiju_id) do nothing;
    else
        delete from public.mecha_pecas_equipadas e
        using public.mecha_pecas_catalogo p
        where e.usuario_id = v_usuario_id
          and e.peca_id = p.id
          and p.kaiju_id = p_kaiju_id;

        delete from public.mecha_kaijus_derrotados
        where usuario_id = v_usuario_id and kaiju_id = p_kaiju_id;
    end if;

    return jsonb_build_object('sucesso', true);
end;
$$;

revoke all on function public.definir_kaiju_derrotado(text, boolean) from public;
grant execute on function public.definir_kaiju_derrotado(text, boolean) to authenticated;

-- Atualiza a função de salvamento do mecha para os quatro slots oficiais.
create or replace function public.salvar_desenvolvimento_mecha(
    p_nome text,
    p_descricao text,
    p_imagem_path text,
    p_kaijus text[],
    p_pecas jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_usuario_id uuid := auth.uid();
    v_kaijus text[] := coalesce(p_kaijus, array[]::text[]);
    v_pecas jsonb := coalesce(p_pecas, '{}'::jsonb);
    v_slot text;
    v_peca_id text;
    v_peca_slot text;
    v_peca_kaiju text;
begin
    if v_usuario_id is null then raise exception 'Usuário não autenticado'; end if;
    if jsonb_typeof(v_pecas) <> 'object' then raise exception 'Formato de peças inválido'; end if;

    if exists (
        select 1
        from unnest(v_kaijus) as escolhido(kaiju_id)
        left join public.mecha_kaijus_catalogo catalogo on catalogo.id = escolhido.kaiju_id
        where catalogo.id is null
    ) then raise exception 'Kaiju selecionado não existe no catálogo'; end if;

    if nullif(trim(coalesce(p_imagem_path, '')), '') is not null
       and p_imagem_path not like v_usuario_id::text || '/%' then
        raise exception 'Caminho de imagem inválido para este usuário';
    end if;

    for v_slot, v_peca_id in
        select chave, trim(both '"' from valor::text)
        from jsonb_each(v_pecas) as item(chave, valor)
    loop
        if v_slot not in ('cabeca', 'torso', 'bracos', 'pernas') then
            raise exception 'Slot de mecha inválido: %', v_slot;
        end if;
        if nullif(v_peca_id, '') is null or v_peca_id = 'null' then continue; end if;

        select slot, kaiju_id into v_peca_slot, v_peca_kaiju
        from public.mecha_pecas_catalogo where id = v_peca_id;
        if not found then raise exception 'Peça inexistente: %', v_peca_id; end if;
        if v_peca_slot <> v_slot then raise exception 'A peça % não pertence ao slot %', v_peca_id, v_slot; end if;
        if not (v_peca_kaiju = any(v_kaijus)) then raise exception 'A peça % ainda não foi desbloqueada', v_peca_id; end if;
    end loop;

    insert into public.mechas_20m
        (usuario_id, nome, vida_base, descricao, imagem_path, atualizado_em)
    values (
        v_usuario_id,
        coalesce(nullif(trim(p_nome), ''), 'MECHA 20M'),
        10,
        trim(coalesce(p_descricao, '')),
        nullif(trim(coalesce(p_imagem_path, '')), ''),
        now()
    )
    on conflict (usuario_id) do update set
        nome = excluded.nome,
        vida_base = 10,
        descricao = excluded.descricao,
        imagem_path = excluded.imagem_path,
        atualizado_em = excluded.atualizado_em;

    delete from public.mecha_pecas_equipadas where usuario_id = v_usuario_id;
    delete from public.mecha_kaijus_derrotados where usuario_id = v_usuario_id;

    insert into public.mecha_kaijus_derrotados (usuario_id, kaiju_id)
    select v_usuario_id, kaiju_id
    from (select distinct unnest(v_kaijus) as kaiju_id) selecionados;

    for v_slot, v_peca_id in
        select chave, trim(both '"' from valor::text)
        from jsonb_each(v_pecas) as item(chave, valor)
    loop
        if nullif(v_peca_id, '') is not null and v_peca_id <> 'null' then
            insert into public.mecha_pecas_equipadas (usuario_id, slot, peca_id)
            values (v_usuario_id, v_slot, v_peca_id);
        end if;
    end loop;

    return jsonb_build_object('sucesso', true, 'usuario_id', v_usuario_id, 'atualizado_em', now());
end;
$$;

revoke all on function public.salvar_desenvolvimento_mecha(text, text, text, text[], jsonb) from public;
grant execute on function public.salvar_desenvolvimento_mecha(text, text, text, text[], jsonb) to authenticated;

-- Bucket privado para o design enviado por cada piloto.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'mechas-designs',
    'mechas-designs',
    false,
    5242880,
    array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tripulante envia imagem do próprio mecha" on storage.objects;
create policy "Tripulante envia imagem do próprio mecha"
on storage.objects for insert to authenticated
with check (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante vê imagem do próprio mecha" on storage.objects;
create policy "Tripulante vê imagem do próprio mecha"
on storage.objects for select to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante atualiza imagem do próprio mecha" on storage.objects;
create policy "Tripulante atualiza imagem do próprio mecha"
on storage.objects for update to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tripulante remove imagem do próprio mecha" on storage.objects;
create policy "Tripulante remove imagem do próprio mecha"
on storage.objects for delete to authenticated
using (
    bucket_id = 'mechas-designs'
    and (storage.foldername(name))[1] = auth.uid()::text
);

-- ---------------------------------------------------------------------------
-- 4. ATUALIZAÇÕES EM TEMPO REAL
-- ---------------------------------------------------------------------------

do $$
begin
    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tripulante_missoes'
    ) then alter publication supabase_realtime add table public.tripulante_missoes; end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'missoes_catalogo'
    ) then alter publication supabase_realtime add table public.missoes_catalogo; end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mecha_kaijus_derrotados'
    ) then alter publication supabase_realtime add table public.mecha_kaijus_derrotados; end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'fichas_tripulantes'
    ) then alter publication supabase_realtime add table public.fichas_tripulantes; end if;

    if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mechas_20m'
    ) then alter publication supabase_realtime add table public.mechas_20m; end if;
end;
$$;

commit;

-- Conferência final: devem aparecer 13 missões oficiais e 14 peças.
select count(*) as missoes_oficiais from public.missoes_catalogo where oficial = true;
select count(*) as pecas_catalogadas from public.mecha_pecas_catalogo;
select id, vida, dano_extra, agilidade, defesa,
       nivel_embaixador, nivel_combatente, nivel_tripulante
from public.fichas_tripulantes
order by id;
