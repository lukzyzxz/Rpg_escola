// ======================================
// INVENTARIO.JS
// Gerenciamento de Itens da Nave 3B
// ======================================

const CATEGORIAS_INVENTARIO = [
    "Equipamento",
    "Ferramenta",
    "Suprimento",
    "Tecnologia",
    "Documento",
    "Artefato",
    "Outro"
];


// ======================================
// TELA PRINCIPAL
// ======================================

function telaInventario() {

    const itens = Array.isArray(banco.inventario)
        ? banco.inventario
        : [];

    const quantidadeTotal = itens.reduce(
        (total, item) =>
            total + normalizarQuantidadeItem(item.quantidade),
        0
    );

    const categoriasUsadas = new Set(
        itens.map(item => item.categoria)
    ).size;

    return `

        <section id="pagina-inventario">

            <div class="cabecalho-modulo">

                <div>

                    <h2>Inventário da Nave</h2>

                    <p class="descricao-modulo">

                        Controle equipamentos, suprimentos
                        e recursos disponíveis para as operações.

                    </p>

                </div>

                <button
                    type="button"
                    class="btn-principal"
                    onclick="abrirModalNovoItem()">

                    + Adicionar Item

                </button>

            </div>


            <div class="resumo-inventario">

                <div class="card resumo-inventario-card">

                    <span>📦</span>

                    <div>

                        <small>Itens cadastrados</small>

                        <strong>
                            ${formatarNumero(itens.length)}
                        </strong>

                    </div>

                </div>


                <div class="card resumo-inventario-card">

                    <span>🔢</span>

                    <div>

                        <small>Quantidade total</small>

                        <strong>
                            ${formatarNumero(quantidadeTotal)}
                        </strong>

                    </div>

                </div>


                <div class="card resumo-inventario-card">

                    <span>🗂️</span>

                    <div>

                        <small>Categorias utilizadas</small>

                        <strong>
                            ${formatarNumero(categoriasUsadas)}
                        </strong>

                    </div>

                </div>

            </div>


            <div class="barra-filtros-inventario">

                <div class="campo-pesquisa-inventario">

                    <span>⌕</span>

                    <input
                        id="pesquisa-inventario"
                        type="search"
                        autocomplete="off"
                        placeholder="Pesquisar item..."
                        oninput="filtrarInventario()">

                </div>


                <select
                    id="filtro-categoria-inventario"
                    onchange="filtrarInventario()">

                    <option value="">
                        Todas as categorias
                    </option>

                    ${CATEGORIAS_INVENTARIO
                        .map(categoria => `

                            <option value="${categoria}">

                                ${categoria}

                            </option>

                        `)
                        .join("")}

                </select>

            </div>


            <div
                id="lista-inventario"
                class="lista-inventario">

                ${renderizarListaInventario(itens)}

            </div>

        </section>

    `;

}


// ======================================
// LISTAGEM
// ======================================

function renderizarListaInventario(lista) {

    if (!Array.isArray(lista) || lista.length === 0) {

        return `

            <div class="estado-vazio">

                <span>📦</span>

                <h3>Nenhum item cadastrado</h3>

                <p>

                    Adicione equipamentos, suprimentos
                    ou recursos ao inventário da Nave 3B.

                </p>

            </div>

        `;

    }

    return [...lista]
        .sort((a, b) =>
            String(a.nome).localeCompare(
                String(b.nome),
                "pt-BR"
            )
        )
        .map(item => criarCardInventario(item))
        .join("");

}


function criarCardInventario(item) {

    const quantidade =
        normalizarQuantidadeItem(item.quantidade);

    const baixoEstoque =
        quantidade > 0 && quantidade <= 3;

    const semEstoque =
        quantidade === 0;

    let classeEstoque = "";
    let textoEstoque = "Disponível";

    if (semEstoque) {

        classeEstoque = "item-sem-estoque";
        textoEstoque = "Sem estoque";

    } else if (baixoEstoque) {

        classeEstoque = "item-baixo-estoque";
        textoEstoque = "Estoque baixo";

    }

    return `

        <article
            class="card-inventario ${classeEstoque}"
            data-nome="${escaparAtributoInventario(
                item.nome
            ).toLowerCase()}"
            data-categoria="${escaparAtributoInventario(
                item.categoria
            )}">

            <div class="topo-card-inventario">

                <div class="identidade-item">

                    <div class="icone-item">

                        ${obterIconeCategoriaInventario(
                            item.categoria
                        )}

                    </div>

                    <div>

                        <span class="categoria-item">

                            ${escaparTextoInventario(
                                item.categoria
                            )}

                        </span>

                        <h3>

                            ${escaparTextoInventario(
                                item.nome
                            )}

                        </h3>

                    </div>

                </div>


                <span class="status-estoque">

                    ${textoEstoque}

                </span>

            </div>


            <p class="descricao-item">

                ${escaparTextoInventario(
                    item.descricao
                    || "Nenhuma descrição informada."
                )}

            </p>


            <div class="quantidade-item">

                <div>

                    <small>Quantidade disponível</small>

                    <strong>
                        ${quantidade}
                    </strong>

                </div>

                <div class="controle-quantidade">

                    <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        onclick="alterarQuantidadeItem(
                            ${item.id},
                            -1
                        )">

                        −

                    </button>

                    <span>${quantidade}</span>

                    <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        onclick="alterarQuantidadeItem(
                            ${item.id},
                            1
                        )">

                        +

                    </button>

                </div>

            </div>


            <div class="rodape-card-inventario">

                <button
                    type="button"
                    class="btn-secundario btn-pequeno"
                    onclick="abrirModalEditarItem(${item.id})">

                    Editar

                </button>

                <button
                    type="button"
                    class="btn-perigo btn-pequeno"
                    onclick="solicitarExclusaoItem(${item.id})">

                    Excluir

                </button>

            </div>

        </article>

    `;

}


// ======================================
// FILTROS
// ======================================

function filtrarInventario() {

    const campoPesquisa =
        document.getElementById(
            "pesquisa-inventario"
        );

    const campoCategoria =
        document.getElementById(
            "filtro-categoria-inventario"
        );

    const lista =
        document.getElementById("lista-inventario");

    if (!campoPesquisa || !campoCategoria || !lista) {
        return;
    }

    const pesquisa =
        campoPesquisa.value
            .trim()
            .toLowerCase();

    const categoria =
        campoCategoria.value;

    const itensFiltrados =
        banco.inventario.filter(item => {

            const nome =
                String(item.nome || "")
                    .toLowerCase();

            const descricao =
                String(item.descricao || "")
                    .toLowerCase();

            const correspondePesquisa =
                !pesquisa
                || nome.includes(pesquisa)
                || descricao.includes(pesquisa);

            const correspondeCategoria =
                !categoria
                || item.categoria === categoria;

            return (
                correspondePesquisa
                && correspondeCategoria
            );

        });

    if (itensFiltrados.length === 0) {

        lista.innerHTML = `

            <div class="estado-vazio">

                <span>🔍</span>

                <h3>Nenhum resultado encontrado</h3>

                <p>

                    Tente pesquisar outro nome
                    ou selecionar uma categoria diferente.

                </p>

            </div>

        `;

        return;

    }

    lista.innerHTML =
        renderizarListaInventario(itensFiltrados);

}


// ======================================
// NOVO ITEM
// ======================================

function abrirModalNovoItem() {

    abrirFormularioItem();

}


function abrirFormularioItem(item = null) {

    const editando = Boolean(item);

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">

                    ${editando
                        ? "ATUALIZAÇÃO DE RECURSO"
                        : "NOVO RECURSO"
                    }

                </span>

                <h2>

                    ${editando
                        ? "Editar Item"
                        : "Adicionar Item"
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
            id="form-item-inventario"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="item-nome">

                    Nome do item

                </label>

                <input
                    id="item-nome"
                    name="nome"
                    type="text"
                    maxlength="60"
                    autocomplete="off"
                    placeholder="Ex.: Kit de Primeiros Socorros"
                    value="${escaparAtributoInventario(
                        item?.nome || ""
                    )}"
                    required>

            </div>


            <div class="grade-formulario">

                <div class="campo-formulario">

                    <label for="item-categoria">

                        Categoria

                    </label>

                    <select
                        id="item-categoria"
                        name="categoria"
                        required>

                        ${criarOpcoesCategoriaInventario(
                            item?.categoria
                        )}

                    </select>

                </div>


                <div class="campo-formulario">

                    <label for="item-quantidade">

                        Quantidade

                    </label>

                    <input
                        id="item-quantidade"
                        name="quantidade"
                        type="number"
                        min="0"
                        max="9999"
                        step="1"
                        value="${normalizarQuantidadeItem(
                            item?.quantidade ?? 1
                        )}"
                        required>

                </div>

            </div>


            <div class="campo-formulario">

                <label for="item-descricao">

                    Descrição

                </label>

                <textarea
                    id="item-descricao"
                    name="descricao"
                    maxlength="400"
                    placeholder="Informe a função e as características do item..."
                    required>${escaparTextoInventario(
                        item?.descricao || ""
                    )}</textarea>

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
                        : "Adicionar Item"
                    }

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById(
            "form-item-inventario"
        );

    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            salvarItemFormulario(
                formulario,
                item?.id || null
            );

        }
    );

    document
        .getElementById("item-nome")
        .focus();

}


// ======================================
// OPÇÕES
// ======================================

function criarOpcoesCategoriaInventario(
    categoriaSelecionada = "Equipamento"
) {

    return CATEGORIAS_INVENTARIO
        .map(categoria => `

            <option
                value="${categoria}"
                ${
                    categoria === categoriaSelecionada
                        ? "selected"
                        : ""
                }>

                ${categoria}

            </option>

        `)
        .join("");

}


// ======================================
// CRIAÇÃO E EDIÇÃO
// ======================================

function salvarItemFormulario(
    formulario,
    idItem = null
) {

    const nome =
        formulario.nome.value.trim();

    const categoria =
        formulario.categoria.value;

    const descricao =
        formulario.descricao.value.trim();

    const quantidade =
        normalizarQuantidadeItem(
            formulario.quantidade.value
        );

    if (!nome || !categoria || !descricao) {

        mostrarNotificacao(
            "Preencha todos os campos do item.",
            "error"
        );

        return;

    }

    if (
        nomeItemJaExiste(
            nome,
            idItem
        )
    ) {

        mostrarNotificacao(
            "Já existe outro item com esse nome.",
            "error"
        );

        return;

    }

    const dadosItem = {

        nome,
        categoria,
        quantidade,
        descricao

    };

    if (idItem) {

        const item = buscarItemInventario(idItem);

        if (!item) return;

        Object.assign(
            item,
            dadosItem
        );

        mostrarNotificacao(
            "Item atualizado com sucesso!",
            "success"
        );

    } else {

        banco.inventario.push({

            id: gerarId(banco.inventario),

            ...dadosItem,

            criadoEm:
                new Date().toISOString()

        });

        mostrarNotificacao(
            "Item adicionado ao inventário!",
            "success"
        );

    }

    salvarBanco();

    fecharModal();

    abrirPagina("inventario");

}


function abrirModalEditarItem(idItem) {

    const item =
        buscarItemInventario(idItem);

    if (!item) {

        mostrarNotificacao(
            "Item não encontrado.",
            "error"
        );

        return;

    }

    abrirFormularioItem(item);

}


// ======================================
// QUANTIDADE
// ======================================

function alterarQuantidadeItem(
    idItem,
    alteracao
) {

    const item =
        buscarItemInventario(idItem);

    if (!item) return;

    const quantidadeAtual =
        normalizarQuantidadeItem(
            item.quantidade
        );

    const novaQuantidade =
        Math.max(
            0,
            quantidadeAtual + Number(alteracao)
        );

    item.quantidade = novaQuantidade;

    salvarBanco();

    mostrarNotificacao(
        alteracao > 0
            ? "Quantidade aumentada."
            : "Quantidade reduzida.",
        "success"
    );

}


// ======================================
// EXCLUSÃO
// ======================================

function solicitarExclusaoItem(idItem) {

    const item =
        buscarItemInventario(idItem);

    if (!item) return;

    confirmar(

        `Excluir permanentemente o item
        <strong>${escaparTextoInventario(
            item.nome
        )}</strong>?`,

        () => {

            banco.inventario =
                banco.inventario.filter(
                    itemAtual =>
                        Number(itemAtual.id)
                        !== Number(idItem)
                );

            salvarBanco();

            mostrarNotificacao(
                "Item excluído do inventário.",
                "success"
            );

        }

    );

}


// ======================================
// AUXILIARES
// ======================================

function buscarItemInventario(idItem) {

    return banco.inventario.find(
        item =>
            Number(item.id)
            === Number(idItem)
    );

}


function nomeItemJaExiste(
    nome,
    idIgnorado = null
) {

    const nomeNormalizado =
        String(nome)
            .trim()
            .toLowerCase();

    return banco.inventario.some(item => {

        const mesmoNome =
            String(item.nome)
                .trim()
                .toLowerCase()
            === nomeNormalizado;

        const itemDiferente =
            Number(item.id)
            !== Number(idIgnorado);

        return (
            mesmoNome
            && itemDiferente
        );

    });

}


function normalizarQuantidadeItem(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(numero)
    );

}


function obterIconeCategoriaInventario(
    categoria
) {

    const icones = {

        "Equipamento": "🧰",
        "Ferramenta": "🔧",
        "Suprimento": "📦",
        "Tecnologia": "💾",
        "Documento": "📄",
        "Artefato": "💎",
        "Outro": "◈"

    };

    return icones[categoria] || "◈";

}


function escaparTextoInventario(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escaparAtributoInventario(valor) {

    return escaparTextoInventario(valor);

}