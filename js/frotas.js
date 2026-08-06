// ======================================
// FROTAS.JS
// Gerenciamento de Frotas da Nave 3B
// ======================================

const CORES_FROTA = [
    {
        nome: "Vermelho",
        valor: "#ff4d5a"
    },
    {
        nome: "Azul",
        valor: "#3db8ff"
    },
    {
        nome: "Verde",
        valor: "#00ff88"
    },
    {
        nome: "Roxo",
        valor: "#a970ff"
    },
    {
        nome: "Amarelo",
        valor: "#ffd84d"
    }
];

// ======================================
// TELA PRINCIPAL
// ======================================

function telaFrotas() {

    garantirPovoLivre();

    const totalIntegrantes = banco.frotas.reduce(
        (total, frota) => total + frota.integrantes.length,
        0
    );

    return `

        <section id="pagina-frotas">

            <div class="cabecalho-modulo">

                <div>

                    <h2>Gerenciamento de Frotas</h2>

                    <p class="descricao-modulo">

                        Organize a tripulação em grupos operacionais.

                    </p>

                </div>

                <button
                    type="button"
                    class="btn-principal"
                    onclick="abrirModalNovaFrota()">

                    + Nova Frota

                </button>

            </div>


            <div class="resumo-frotas">

                <div class="card resumo-frota-card">

                    <span>🚀</span>

                    <div>

                        <small>Frotas registradas</small>

                        <strong>
                            ${formatarNumero(banco.frotas.length)}
                        </strong>

                    </div>

                </div>


                <div class="card resumo-frota-card">

                    <span>👨‍🚀</span>

                    <div>

                        <small>Integrantes registrados</small>

                        <strong>
                            ${formatarNumero(totalIntegrantes)}
                        </strong>

                    </div>

                </div>

            </div>


            <div id="lista-frotas" class="lista-frotas">

                ${renderizarListaFrotas()}

            </div>

        </section>

    `;

}

// ======================================
// LISTAGEM
// ======================================

function renderizarListaFrotas() {

    if (banco.frotas.length === 0) {

        return `

            <div class="estado-vazio">

                <span>🚀</span>

                <h3>Nenhuma frota cadastrada</h3>

                <p>Crie a primeira frota operacional.</p>

            </div>

        `;

    }

    return banco.frotas
        .map(frota => criarCardFrota(frota))
        .join("");

}

function criarCardFrota(frota) {

    const integrantesVisiveis = frota.integrantes
        .slice(0, 4)
        .map(integrante => `

            <span class="integrante-mini">

                ${escaparHTML(integrante.nome)}

            </span>

        `)
        .join("");

    const integrantesRestantes =
        frota.integrantes.length - 4;

    const identificadorEspecial =
        frota.id === 1
            ? `<span class="etiqueta-fixa">FROTA PADRÃO</span>`
            : "";

    return `

        <article
            class="card-frota"
            style="--cor-frota:${frota.cor}">

            <div class="barra-cor-frota"></div>


            <div class="conteudo-card-frota">

                <div class="topo-card-frota">

                    <div>

                        <div class="titulo-frota">

                            <span
                                class="indicador-frota"
                                style="background:${frota.cor}">
                            </span>

                            <h3>
                                ${escaparHTML(frota.nome)}
                            </h3>

                            ${identificadorEspecial}

                        </div>

                        <p>

                            ${formatarQuantidadeIntegrantes(
                                frota.integrantes.length
                            )}

                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn-gerenciar"
                        onclick="abrirGerenciamentoFrota(${frota.id})">

                        Gerenciar

                    </button>

                </div>


                <div class="integrantes-resumo">

                    ${
                        frota.integrantes.length > 0
                            ? integrantesVisiveis
                            : `
                                <span class="sem-integrantes">
                                    Nenhum integrante cadastrado
                                </span>
                            `
                    }

                    ${
                        integrantesRestantes > 0
                            ? `
                                <span class="integrantes-restantes">
                                    +${integrantesRestantes}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}

// ======================================
// NOVA FROTA
// ======================================

function abrirModalNovaFrota() {

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">
                    REGISTRO OPERACIONAL
                </span>

                <h2>Nova Frota</h2>

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
            id="form-nova-frota"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="nome-nova-frota">

                    Nome da frota

                </label>

                <input
                    id="nome-nova-frota"
                    name="nome"
                    type="text"
                    maxlength="40"
                    autocomplete="off"
                    placeholder="Ex.: Exploradores"
                    required>

                <small>

                    Use um nome único para identificar o grupo.

                </small>

            </div>


            <fieldset class="campo-formulario escolha-cor">

                <legend>Cor de identificação</legend>

                <div class="opcoes-cor">

                    ${criarOpcoesCores()}

                </div>

            </fieldset>


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

                    Criar Frota

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById("form-nova-frota");

    formulario.addEventListener(
        "submit",
        processarNovaFrota
    );

    document
        .getElementById("nome-nova-frota")
        .focus();

}

function criarOpcoesCores(corSelecionada = "#3db8ff") {

    return CORES_FROTA
        .map(cor => `

            <label
                class="opcao-cor"
                title="${cor.nome}">

                <input
                    type="radio"
                    name="cor"
                    value="${cor.valor}"
                    ${
                        cor.valor === corSelecionada
                            ? "checked"
                            : ""
                    }>

                <span
                    class="amostra-cor"
                    style="background:${cor.valor}">
                </span>

                <small>${cor.nome}</small>

            </label>

        `)
        .join("");

}

function processarNovaFrota(evento) {

    evento.preventDefault();

    const formulario = evento.currentTarget;

    const nome = formulario.nome.value.trim();

    const cor = formulario.cor.value;

    if (!nome) {

        mostrarNotificacao(
            "Digite o nome da frota.",
            "error"
        );

        return;

    }

    if (nomeFrotaJaExiste(nome)) {

        mostrarNotificacao(
            "Já existe uma frota com esse nome.",
            "error"
        );

        return;

    }

    banco.frotas.push({
        id: gerarId(banco.frotas),
        nome: nome,
        cor: cor,
        integrantes: []
    });

    salvarBanco();

    fecharModal();

    atualizarTelaFrotas();

    mostrarNotificacao(
        `Frota ${nome} criada com sucesso!`,
        "success"
    );

}

// ======================================
// GERENCIAMENTO
// ======================================

function abrirGerenciamentoFrota(id) {

    const frota = buscarFrota(id);

    if (!frota) {

        mostrarNotificacao(
            "Frota não encontrada.",
            "error"
        );

        return;

    }

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">
                    GERENCIAMENTO DE FROTA
                </span>

                <h2>
                    ${escaparHTML(frota.nome)}
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


        <div class="detalhes-frota">

            <div class="identidade-frota">

                <span
                    class="cor-detalhe-frota"
                    style="background:${frota.cor}">
                </span>

                <div>

                    <small>Identificação visual</small>

                    <strong>
                        ${obterNomeCor(frota.cor)}
                    </strong>

                </div>

            </div>


            <div class="secao-integrantes">

                <div class="cabecalho-secao">

                    <div>

                        <h3>Integrantes</h3>

                        <p>
                            ${formatarQuantidadeIntegrantes(
                                frota.integrantes.length
                            )}
                        </p>

                    </div>

                    <button
                        type="button"
                        class="btn-principal btn-pequeno"
                        onclick="abrirModalNovoIntegrante(${frota.id})">

                        + Adicionar

                    </button>

                </div>


                <div class="lista-integrantes-modal">

                    ${renderizarIntegrantesFrota(frota)}

                </div>

            </div>


            <div class="acoes-gerenciamento">

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="abrirModalRenomearFrota(${frota.id})">

                    Renomear Frota

                </button>

                ${
                    frota.id !== 1
                        ? `
                            <button
                                type="button"
                                class="btn-perigo"
                                onclick="solicitarExclusaoFrota(${frota.id})">

                                Excluir Frota

                            </button>
                        `
                        : `
                            <div class="aviso-frota-fixa">

                                🔒 A frota POVO LIVRE é permanente
                                e não pode ser excluída.

                            </div>
                        `
                }

            </div>

        </div>

    `);

}

function renderizarIntegrantesFrota(frota) {

    if (frota.integrantes.length === 0) {

        return `

            <div class="estado-vazio compacto">

                <span>👨‍🚀</span>

                <p>Nenhum integrante nesta frota.</p>

            </div>

        `;

    }

    return frota.integrantes
        .map(integrante => `

            <div class="integrante-linha">

                <div class="avatar-integrante">

                    ${obterIniciais(integrante.nome)}

                </div>

                <span>

                    ${escaparHTML(integrante.nome)}

                </span>

                <button
                    type="button"
                    class="btn-remover-integrante"
                    onclick="solicitarRemocaoIntegrante(
                        ${frota.id},
                        ${integrante.id}
                    )"
                    aria-label="Remover integrante">

                    ×

                </button>

            </div>

        `)
        .join("");

}

// ======================================
// INTEGRANTES
// ======================================

function abrirModalNovoIntegrante(idFrota) {

    const frota = buscarFrota(idFrota);

    if (!frota) return;

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">
                    NOVO TRIPULANTE
                </span>

                <h2>Adicionar Integrante</h2>

            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="abrirGerenciamentoFrota(${idFrota})">

                ×

            </button>

        </div>


        <p class="modal-contexto">

            Frota:
            <strong>
                ${escaparHTML(frota.nome)}
            </strong>

        </p>


        <form
            id="form-novo-integrante"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="nome-novo-integrante">

                    Nome do integrante

                </label>

                <input
                    id="nome-novo-integrante"
                    name="nome"
                    type="text"
                    maxlength="60"
                    autocomplete="off"
                    placeholder="Ex.: Lucas"
                    required>

            </div>


            <div class="modal-botoes">

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="abrirGerenciamentoFrota(${idFrota})">

                    Voltar

                </button>

                <button
                    type="submit"
                    class="btn-principal">

                    Adicionar

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById("form-novo-integrante");

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        adicionarIntegrante(
            idFrota,
            formulario.nome.value
        );

    });

    document
        .getElementById("nome-novo-integrante")
        .focus();

}

function adicionarIntegrante(idFrota, nomeInformado) {

    const frota = buscarFrota(idFrota);

    const nome = nomeInformado.trim();

    if (!frota || !nome) {

        mostrarNotificacao(
            "Digite o nome do integrante.",
            "error"
        );

        return;

    }

    const integranteJaExiste =
        frota.integrantes.some(integrante =>
            integrante.nome
                .toLowerCase() === nome.toLowerCase()
        );

    if (integranteJaExiste) {

        mostrarNotificacao(
            "Esse integrante já está nesta frota.",
            "error"
        );

        return;

    }

    frota.integrantes.push({
        id: gerarId(frota.integrantes),
        nome: nome
    });

    salvarBanco();

    abrirGerenciamentoFrota(idFrota);

    mostrarNotificacao(
        `${nome} foi adicionado à frota.`,
        "success"
    );

}

function solicitarRemocaoIntegrante(
    idFrota,
    idIntegrante
) {

    const frota = buscarFrota(idFrota);

    const integrante = frota?.integrantes.find(
        item => item.id === idIntegrante
    );

    if (!frota || !integrante) return;

    confirmar(
        `Remover ${escaparHTML(integrante.nome)} da frota?`,
        () => removerIntegrante(idFrota, idIntegrante)
    );

}

function removerIntegrante(idFrota, idIntegrante) {

    const frota = buscarFrota(idFrota);

    if (!frota) return;

    frota.integrantes = frota.integrantes.filter(
        integrante => integrante.id !== idIntegrante
    );

    salvarBanco();

    abrirGerenciamentoFrota(idFrota);

    mostrarNotificacao(
        "Integrante removido da frota.",
        "success"
    );

}

// ======================================
// RENOMEAR
// ======================================

function abrirModalRenomearFrota(idFrota) {

    const frota = buscarFrota(idFrota);

    if (!frota) return;

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">
                    ALTERAÇÃO DE IDENTIFICAÇÃO
                </span>

                <h2>Renomear Frota</h2>

            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="abrirGerenciamentoFrota(${idFrota})">

                ×

            </button>

        </div>


        <form
            id="form-renomear-frota"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="novo-nome-frota">

                    Novo nome

                </label>

                <input
                    id="novo-nome-frota"
                    name="nome"
                    type="text"
                    maxlength="40"
                    value="${escaparAtributo(frota.nome)}"
                    autocomplete="off"
                    required>

            </div>


            <div class="modal-botoes">

                <button
                    type="button"
                    class="btn-secundario"
                    onclick="abrirGerenciamentoFrota(${idFrota})">

                    Voltar

                </button>

                <button
                    type="submit"
                    class="btn-principal">

                    Salvar Alteração

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById("form-renomear-frota");

    formulario.addEventListener("submit", evento => {

        evento.preventDefault();

        renomearFrota(
            idFrota,
            formulario.nome.value
        );

    });

    const campoNome =
        document.getElementById("novo-nome-frota");

    campoNome.focus();
    campoNome.select();

}

function renomearFrota(idFrota, nomeInformado) {

    const frota = buscarFrota(idFrota);

    const novoNome = nomeInformado.trim();

    if (!frota || !novoNome) {

        mostrarNotificacao(
            "Digite um nome válido.",
            "error"
        );

        return;

    }

    if (nomeFrotaJaExiste(novoNome, idFrota)) {

        mostrarNotificacao(
            "Já existe outra frota com esse nome.",
            "error"
        );

        return;

    }

    frota.nome = novoNome;

    salvarBanco();

    abrirGerenciamentoFrota(idFrota);

    atualizarTelaFrotas();

    mostrarNotificacao(
        "Frota renomeada com sucesso!",
        "success"
    );

}

// ======================================
// EXCLUSÃO
// ======================================

function solicitarExclusaoFrota(idFrota) {

    const frota = buscarFrota(idFrota);

    if (!frota) return;

    if (frota.id === 1) {

        mostrarNotificacao(
            "A frota POVO LIVRE não pode ser excluída.",
            "error"
        );

        return;

    }

    confirmar(
        `
            Excluir a frota
            <strong>${escaparHTML(frota.nome)}</strong>?
            Os integrantes cadastrados nela também serão removidos.
        `,
        () => excluirFrota(idFrota)
    );

}

function excluirFrota(idFrota) {

    if (idFrota === 1) return;

    banco.frotas = banco.frotas.filter(
        frota => frota.id !== idFrota
    );

    salvarBanco();

    fecharModal();

    atualizarTelaFrotas();

    mostrarNotificacao(
        "Frota excluída com sucesso.",
        "success"
    );

}

// ======================================
// AUXILIARES
// ======================================

function buscarFrota(id) {

    return banco.frotas.find(
        frota => frota.id === Number(id)
    );

}

function nomeFrotaJaExiste(
    nome,
    idIgnorado = null
) {

    const nomeNormalizado =
        nome.trim().toLowerCase();

    return banco.frotas.some(frota => {

        const mesmoNome =
            frota.nome.trim().toLowerCase() ===
            nomeNormalizado;

        const frotaDiferente =
            frota.id !== idIgnorado;

        return mesmoNome && frotaDiferente;

    });

}

function garantirPovoLivre() {

    const povoLivre = banco.frotas.find(
        frota => frota.id === 1
    );

    if (povoLivre) {

        povoLivre.nome = "POVO LIVRE";

        if (!Array.isArray(povoLivre.integrantes)) {

            povoLivre.integrantes = [];

        }

        return;

    }

    banco.frotas.unshift({
        id: 1,
        nome: "POVO LIVRE",
        cor: "#888888",
        integrantes: []
    });

    salvarBanco();

}

function atualizarTelaFrotas() {

    const paginaFrotas =
        document.getElementById("pagina-frotas");

    if (paginaFrotas) {

        conteudo.innerHTML = telaFrotas();

    }

}

function formatarQuantidadeIntegrantes(quantidade) {

    if (quantidade === 1) {

        return "1 integrante";

    }

    return `${quantidade} integrantes`;

}

function obterNomeCor(valor) {

    const corEncontrada = CORES_FROTA.find(
        cor => cor.valor === valor
    );

    if (corEncontrada) {

        return corEncontrada.nome;

    }

    if (valor === "#888888") {

        return "Cinza";

    }

    return valor;

}

function obterIniciais(nome) {

    return nome
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0).toUpperCase())
        .join("");

}

function escaparHTML(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

function escaparAtributo(valor) {

    return escaparHTML(valor);

}