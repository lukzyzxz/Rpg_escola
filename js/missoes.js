// ======================================
// MISSOES.JS
// Gerenciamento de Missões da Nave 3B
// ======================================

const DIFICULDADES_MISSAO = [
    "Fácil",
    "Média",
    "Difícil",
    "Crítica"
];


// ======================================
// TELA PRINCIPAL
// ======================================

function telaMissoes() {

    const missoes = Array.isArray(banco.missoes)
        ? banco.missoes
        : [];

    const emAndamento = missoes.filter(
        missao => missao.status === "Em andamento"
    ).length;

    const concluidas = missoes.filter(
        missao => missao.status === "Concluída"
    ).length;

    return `

        <section id="pagina-missoes">

            <div class="cabecalho-modulo">

                <div>

                    <h2>Registro de Missões</h2>

                    <p class="descricao-modulo">

                        Planeje operações, defina responsáveis
                        e acompanhe o progresso da tripulação.

                    </p>

                </div>

                <button
                    type="button"
                    class="btn-principal"
                    onclick="abrirModalNovaMissao()">

                    + Nova Missão

                </button>

            </div>


            <div class="resumo-missoes">

                <div class="card resumo-missao-card">

                    <span>📜</span>

                    <div>

                        <small>Total de missões</small>

                        <strong>
                            ${formatarNumero(missoes.length)}
                        </strong>

                    </div>

                </div>


                <div class="card resumo-missao-card">

                    <span>⚡</span>

                    <div>

                        <small>Em andamento</small>

                        <strong>
                            ${formatarNumero(emAndamento)}
                        </strong>

                    </div>

                </div>


                <div class="card resumo-missao-card">

                    <span>✅</span>

                    <div>

                        <small>Concluídas</small>

                        <strong>
                            ${formatarNumero(concluidas)}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="lista-missoes">

                ${renderizarListaMissoes()}

            </div>

        </section>

    `;

}


// ======================================
// LISTAGEM
// ======================================

function renderizarListaMissoes() {

    if (
        !Array.isArray(banco.missoes)
        || banco.missoes.length === 0
    ) {

        return `

            <div class="estado-vazio">

                <span>📡</span>

                <h3>Nenhuma missão cadastrada</h3>

                <p>

                    Registre uma operação para iniciar
                    o planejamento da Nave 3B.

                </p>

            </div>

        `;

    }

    return [...banco.missoes]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map(missao => criarCardMissao(missao))
        .join("");

}


function criarCardMissao(missao) {

    const planeta = buscarPlanetaMissao(
        missao.planetaId
    );

    const progresso = limitarProgresso(
        missao.progresso
    );

    const concluida =
        missao.status === "Concluída";

    return `

        <article
            class="card-missao ${concluida ? "missao-concluida" : ""}">

            <div class="topo-card-missao">

                <div>

                    <div class="titulo-missao">

                        <span class="icone-dificuldade">

                            ${obterIconeDificuldade(
                                missao.dificuldade
                            )}

                        </span>

                        <h3>

                            ${escaparTextoMissao(missao.nome)}

                        </h3>

                    </div>

                    <div class="badges-missao">

                        <span class="
                            badge-missao
                            ${obterClasseDificuldade(
                                missao.dificuldade
                            )}
                        ">

                            ${escaparTextoMissao(
                                missao.dificuldade
                            )}

                        </span>

                        <span class="
                            badge-missao
                            ${concluida
                                ? "badge-concluida"
                                : "badge-andamento"
                            }
                        ">

                            ${escaparTextoMissao(
                                missao.status
                            )}

                        </span>

                    </div>

                </div>


                <div class="acoes-card-missao">

                    <button
                        type="button"
                        class="btn-secundario btn-pequeno"
                        onclick="abrirModalEditarMissao(${missao.id})">

                        Editar

                    </button>

                    ${
                        concluida
                            ? `
                                <button
                                    type="button"
                                    class="btn-secundario btn-pequeno"
                                    onclick="reabrirMissao(${missao.id})">

                                    Reabrir

                                </button>
                            `
                            : `
                                <button
                                    type="button"
                                    class="btn-principal btn-pequeno"
                                    onclick="concluirMissao(${missao.id})">

                                    Concluir

                                </button>
                            `
                    }

                </div>

            </div>


            <p class="descricao-card-missao">

                ${escaparTextoMissao(
                    missao.descricao
                    || "Nenhuma descrição informada."
                )}

            </p>


            <div class="dados-missao">

                <div>

                    <small>Planeta</small>

                    <strong>

                        🌌 ${escaparTextoMissao(
                            planeta?.nome || "Não identificado"
                        )}

                    </strong>

                </div>

                <div>

                    <small>Responsável</small>

                    <strong>

                        🚀 ${escaparTextoMissao(
                            obterNomeResponsavelMissao(missao)
                        )}

                    </strong>

                </div>

                <div>

                    <small>Recompensa</small>

                    <strong>

                        🎁 ${escaparTextoMissao(
                            missao.recompensa || "Não informada"
                        )}

                    </strong>

                </div>

                <div>

                    <small>Criação</small>

                    <strong>

                        📅 ${formatarDataMissao(
                            missao.criadoEm
                        )}

                    </strong>

                </div>

            </div>


            <div class="progresso-missao">

                <div class="cabecalho-progresso">

                    <span>Progresso da operação</span>

                    <strong>${progresso}%</strong>

                </div>

                <div class="trilha-progresso">

                    <div
                        class="barra-progresso-missao"
                        style="width:${progresso}%">
                    </div>

                </div>

            </div>


            <div class="rodape-card-missao">

                <button
                    type="button"
                    class="btn-perigo btn-pequeno"
                    onclick="solicitarExclusaoMissao(${missao.id})">

                    Excluir Missão

                </button>

            </div>

        </article>

    `;

}


// ======================================
// NOVA MISSÃO
// ======================================

function abrirModalNovaMissao() {

    abrirFormularioMissao();

}


function abrirFormularioMissao(missao = null) {

    const editando = Boolean(missao);

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">

                    ${editando
                        ? "ATUALIZAÇÃO OPERACIONAL"
                        : "NOVA OPERAÇÃO"
                    }

                </span>

                <h2>

                    ${editando
                        ? "Editar Missão"
                        : "Nova Missão"
                    }

                </h2>

            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="fecharModal()"
                aria-label="Fechar">

                ×

            </button>

        </div>


        <form
            id="form-missao"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="missao-nome">

                    Nome da missão

                </label>

                <input
                    id="missao-nome"
                    name="nome"
                    type="text"
                    maxlength="60"
                    autocomplete="off"
                    placeholder="Ex.: Exploração Verdejante"
                    value="${escaparAtributoMissao(
                        missao?.nome || ""
                    )}"
                    required>

            </div>


            <div class="campo-formulario">

                <label for="missao-descricao">

                    Descrição

                </label>

                <textarea
                    id="missao-descricao"
                    name="descricao"
                    maxlength="400"
                    placeholder="Descreva os objetivos da operação..."
                    required>${escaparTextoMissao(
                        missao?.descricao || ""
                    )}</textarea>

            </div>


            <div class="grade-formulario">

                <div class="campo-formulario">

                    <label for="missao-planeta">

                        Planeta

                    </label>

                    <select
                        id="missao-planeta"
                        name="planetaId"
                        required>

                        ${criarOpcoesPlanetasMissao(
                            missao?.planetaId
                        )}

                    </select>

                </div>


                <div class="campo-formulario">

                    <label for="missao-responsavel">

                        Responsável

                    </label>

                    <select
                        id="missao-responsavel"
                        name="responsavel"
                        required>

                        ${criarOpcoesResponsaveisMissao(
                            missao
                        )}

                    </select>

                </div>

            </div>


            <div class="grade-formulario">

                <div class="campo-formulario">

                    <label for="missao-dificuldade">

                        Dificuldade

                    </label>

                    <select
                        id="missao-dificuldade"
                        name="dificuldade"
                        required>

                        ${criarOpcoesDificuldadeMissao(
                            missao?.dificuldade
                        )}

                    </select>

                </div>


                <div class="campo-formulario">

                    <label for="missao-recompensa">

                        Recompensa

                    </label>

                    <input
                        id="missao-recompensa"
                        name="recompensa"
                        type="text"
                        maxlength="60"
                        placeholder="Ex.: 500 XP"
                        value="${escaparAtributoMissao(
                            missao?.recompensa || ""
                        )}"
                        required>

                </div>

            </div>


            <div class="campo-formulario">

                <div class="cabecalho-campo-progresso">

                    <label for="missao-progresso">

                        Progresso

                    </label>

                    <strong id="valor-progresso-missao">

                        ${limitarProgresso(
                            missao?.progresso || 0
                        )}%

                    </strong>

                </div>

                <input
                    id="missao-progresso"
                    name="progresso"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value="${limitarProgresso(
                        missao?.progresso || 0
                    )}">

            </div>


            <div class="modal-botoes">

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="fecharModal()">

                    Cancelar

                </button>

                <button
                    type="submit"
                    class="btn-principal">

                    ${editando
                        ? "Salvar Alterações"
                        : "Criar Missão"
                    }

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById("form-missao");

    const campoProgresso =
        document.getElementById("missao-progresso");

    const valorProgresso =
        document.getElementById(
            "valor-progresso-missao"
        );

    campoProgresso.addEventListener(
        "input",
        () => {

            valorProgresso.textContent =
                `${campoProgresso.value}%`;

        }
    );

    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            salvarMissaoFormulario(
                formulario,
                missao?.id || null
            );

        }
    );

    document
        .getElementById("missao-nome")
        .focus();

}


// ======================================
// OPÇÕES DO FORMULÁRIO
// ======================================

function criarOpcoesPlanetasMissao(
    planetaSelecionado = null
) {

    const planetasDisponiveis =
        banco.planetas.filter(
            planeta => planeta.desbloqueado
        );

    if (planetasDisponiveis.length === 0) {

        return `

            <option value="">

                Nenhum planeta disponível

            </option>

        `;

    }

    return planetasDisponiveis
        .map(planeta => `

            <option
                value="${planeta.id}"
                ${
                    Number(planetaSelecionado)
                        === Number(planeta.id)
                            ? "selected"
                            : ""
                }>

                ${escaparTextoMissao(planeta.nome)}

            </option>

        `)
        .join("");

}


function criarOpcoesResponsaveisMissao(
    missao = null
) {

    const valorAtual =
        missao?.responsavelTipo === "todos"
            ? "todos"
            : `frota:${missao?.frotaId || 1}`;

    const opcoesFrotas = banco.frotas
        .map(frota => `

            <option
                value="frota:${frota.id}"
                ${
                    valorAtual === `frota:${frota.id}`
                        ? "selected"
                        : ""
                }>

                ${escaparTextoMissao(frota.nome)}

            </option>

        `)
        .join("");

    return `

        <option
            value="todos"
            ${valorAtual === "todos" ? "selected" : ""}>

            TODOS

        </option>

        ${opcoesFrotas}

    `;

}


function criarOpcoesDificuldadeMissao(
    dificuldadeSelecionada = "Média"
) {

    return DIFICULDADES_MISSAO
        .map(dificuldade => `

            <option
                value="${dificuldade}"
                ${
                    dificuldade === dificuldadeSelecionada
                        ? "selected"
                        : ""
                }>

                ${dificuldade}

            </option>

        `)
        .join("");

}


// ======================================
// CRIAR E EDITAR
// ======================================

function salvarMissaoFormulario(
    formulario,
    idMissao = null
) {

    const nome =
        formulario.nome.value.trim();

    const descricao =
        formulario.descricao.value.trim();

    const recompensa =
        formulario.recompensa.value.trim();

    const planetaId =
        Number(formulario.planetaId.value);

    const progresso =
        limitarProgresso(
            formulario.progresso.value
        );

    if (
        !nome
        || !descricao
        || !recompensa
        || !planetaId
    ) {

        mostrarNotificacao(
            "Preencha todos os campos da missão.",
            "error"
        );

        return;

    }

    const responsavel =
        formulario.responsavel.value;

    const responsavelTipo =
        responsavel === "todos"
            ? "todos"
            : "frota";

    const frotaId =
        responsavelTipo === "frota"
            ? Number(
                responsavel.replace("frota:", "")
            )
            : null;

    const dadosMissao = {

        nome,
        descricao,
        planetaId,

        responsavelTipo,
        frotaId,

        dificuldade:
            formulario.dificuldade.value,

        recompensa,

        progresso,

        status:
            progresso >= 100
                ? "Concluída"
                : "Em andamento"

    };

    if (idMissao) {

        const missao = buscarMissao(idMissao);

        if (!missao) return;

        Object.assign(
            missao,
            dadosMissao
        );

        mostrarNotificacao(
            "Missão atualizada com sucesso!",
            "success"
        );

    } else {

        banco.missoes.push({

            id: gerarId(banco.missoes),

            ...dadosMissao,

            criadoEm:
                new Date().toISOString()

        });

        mostrarNotificacao(
            "Missão criada com sucesso!",
            "success"
        );

    }

    salvarBanco();

    fecharModal();

    abrirPagina("missoes");

}


function abrirModalEditarMissao(idMissao) {

    const missao = buscarMissao(idMissao);

    if (!missao) {

        mostrarNotificacao(
            "Missão não encontrada.",
            "error"
        );

        return;

    }

    abrirFormularioMissao(missao);

}


// ======================================
// STATUS
// ======================================

function concluirMissao(idMissao) {

    const missao = buscarMissao(idMissao);

    if (!missao) return;

    confirmar(

        `Marcar a missão
        <strong>${escaparTextoMissao(
            missao.nome
        )}</strong>
        como concluída?`,

        () => {

            missao.progresso = 100;
            missao.status = "Concluída";

            salvarBanco();

            mostrarNotificacao(
                "Missão concluída!",
                "success"
            );

        }

    );

}


function reabrirMissao(idMissao) {

    const missao = buscarMissao(idMissao);

    if (!missao) return;

    missao.status = "Em andamento";

    if (Number(missao.progresso) >= 100) {

        missao.progresso = 90;

    }

    salvarBanco();

    mostrarNotificacao(
        "Missão reaberta.",
        "success"
    );

}


// ======================================
// EXCLUSÃO
// ======================================

function solicitarExclusaoMissao(idMissao) {

    const missao = buscarMissao(idMissao);

    if (!missao) return;

    confirmar(

        `Excluir permanentemente a missão
        <strong>${escaparTextoMissao(
            missao.nome
        )}</strong>?`,

        () => {

            banco.missoes =
                banco.missoes.filter(
                    item =>
                        Number(item.id)
                        !== Number(idMissao)
                );

            salvarBanco();

            mostrarNotificacao(
                "Missão excluída.",
                "success"
            );

        }

    );

}


// ======================================
// AUXILIARES
// ======================================

function buscarMissao(idMissao) {

    return banco.missoes.find(
        missao =>
            Number(missao.id)
            === Number(idMissao)
    );

}


function buscarPlanetaMissao(idPlaneta) {

    return banco.planetas.find(
        planeta =>
            Number(planeta.id)
            === Number(idPlaneta)
    );

}


function obterNomeResponsavelMissao(missao) {

    if (missao.responsavelTipo === "todos") {

        return "TODOS";

    }

    const frota = banco.frotas.find(
        item =>
            Number(item.id)
            === Number(missao.frotaId)
    );

    return frota
        ? frota.nome
        : "Frota não encontrada";

}


function limitarProgresso(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) return 0;

    return Math.min(
        100,
        Math.max(0, numero)
    );

}


function formatarDataMissao(data) {

    if (!data) return "Não informada";

    const dataConvertida = new Date(data);

    if (
        Number.isNaN(
            dataConvertida.getTime()
        )
    ) {

        return "Não informada";

    }

    return dataConvertida.toLocaleDateString(
        "pt-BR"
    );

}


function obterIconeDificuldade(dificuldade) {

    const icones = {

        "Fácil": "🟢",
        "Média": "🟡",
        "Difícil": "🟠",
        "Crítica": "🔴"

    };

    return icones[dificuldade] || "⚪";

}


function obterClasseDificuldade(dificuldade) {

    const classes = {

        "Fácil": "dificuldade-facil",
        "Média": "dificuldade-media",
        "Difícil": "dificuldade-dificil",
        "Crítica": "dificuldade-critica"

    };

    return classes[dificuldade]
        || "dificuldade-media";

}


function escaparTextoMissao(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escaparAtributoMissao(valor) {

    return escaparTextoMissao(valor);

}