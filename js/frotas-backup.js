// ======================================
// FROTAS.JS
// Gerenciamento de Frotas da Nave 3B
// Dados persistidos no Supabase
// ======================================

const CORES_FROTA = [
    { nome: "Vermelho", valor: "#ff4d5a" },
    { nome: "Azul", valor: "#3db8ff" },
    { nome: "Verde", valor: "#00ff88" },
    { nome: "Roxo", valor: "#a970ff" },
    { nome: "Amarelo", valor: "#ffd84d" }
];

let frotasSupabase = [];
let frotasSupabaseCarregadas = false;

// ======================================
// CARREGAMENTO DO SUPABASE
// ======================================

async function carregarFrotasSupabase(atualizarInterface = true) {
    try {
        const [
            resultadoFrotas,
            resultadoProfiles,
            resultadoIntegrantes
        ] = await Promise.all([
            supabaseClient
                .from("frotas")
                .select("id, nome, cor, fixa, created_at")
                .order("fixa", { ascending: false })
                .order("created_at", { ascending: true }),

            supabaseClient
                .from("profiles")
                .select("id, nome, username, cargo, avatar"),

            supabaseClient
                .from("frota_integrantes")
                .select("frota_id, usuario_id, data_entrada")
        ]);

        if (resultadoFrotas.error) throw resultadoFrotas.error;
        if (resultadoProfiles.error) throw resultadoProfiles.error;
        if (resultadoIntegrantes.error) throw resultadoIntegrantes.error;

        const profilesPorId = new Map(
            resultadoProfiles.data.map(profile => [profile.id, profile])
        );

        frotasSupabase = resultadoFrotas.data.map(frota => {
            const integrantes = resultadoIntegrantes.data
                .filter(relacao => relacao.frota_id === frota.id)
                .map(relacao => {
                    const profile = profilesPorId.get(relacao.usuario_id);

                    if (!profile) return null;

                    return {
                        id: profile.id,
                        nome: profile.nome || profile.username || "Sem nome",
                        username: profile.username,
                        cargo: profile.cargo,
                        avatar: profile.avatar,
                        dataEntrada: relacao.data_entrada
                    };
                })
                .filter(Boolean);

            return {
                id: frota.id,
                nome: frota.nome,
                cor: frota.cor || "#888888",
                fixa: Boolean(frota.fixa),
                createdAt: frota.created_at,
                integrantes
            };
        });

        frotasSupabaseCarregadas = true;

        sincronizarFrotasComBancoLocal();

        console.log(
            "âœ… Frotas carregadas do Supabase:",
            frotasSupabase
        );

        if (atualizarInterface) {
            atualizarInterfaceAposCarregarFrotas();
        }

        return true;
    } catch (erro) {
        console.error(
            "âŒ Erro ao carregar frotas do Supabase:",
            erro
        );

        mostrarNotificacao(
            "NÃ£o foi possÃ­vel carregar as frotas.",
            "error"
        );

        return false;
    }
}

function sincronizarFrotasComBancoLocal() {
    if (typeof banco === "undefined") return;

    // banco.frotas continua existindo como cache de compatibilidade
    // para Dashboard e MissÃµes. A fonte oficial agora Ã© o Supabase.
    banco.frotas = frotasSupabase.map(frota => ({
        ...frota,
        integrantes: frota.integrantes.map(integrante => ({
            ...integrante
        }))
    }));
}

function atualizarInterfaceAposCarregarFrotas() {
    if (typeof atualizarIndicadoresMenu === "function") {
        atualizarIndicadoresMenu();
    }

    if (
        typeof paginaAtual !== "undefined"
        && paginaAtual === "frotas"
    ) {
        atualizarTelaFrotas();
    }

    if (
        typeof paginaAtual !== "undefined"
        && paginaAtual === "dashboard"
        && typeof telaDashboard === "function"
    ) {
        conteudo.innerHTML = telaDashboard();
    }
}

// ======================================
// TELA PRINCIPAL
// ======================================

function telaFrotas() {
    if (!frotasSupabaseCarregadas) {
        return `
            <section id="pagina-frotas">
                <div class="estado-vazio">
                    <span>ðŸš€</span>
                    <h3>Carregando frotas...</h3>
                    <p>Sincronizando dados da tripulaÃ§Ã£o.</p>
                </div>
            </section>
        `;
    }

    const totalIntegrantes = frotasSupabase.reduce(
        (total, frota) => total + frota.integrantes.length,
        0
    );

    return `
        <section id="pagina-frotas">
            <div class="cabecalho-modulo">
                <div>
                    <h2>Gerenciamento de Frotas</h2>
                    <p class="descricao-modulo">
                        Organize a tripulaÃ§Ã£o em grupos operacionais.
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
                    <span>ðŸš€</span>
                    <div>
                        <small>Frotas registradas</small>
                        <strong>${formatarNumero(frotasSupabase.length)}</strong>
                    </div>
                </div>

                <div class="card resumo-frota-card">
                    <span>ðŸ‘¨â€ðŸš€</span>
                    <div>
                        <small>Integrantes registrados</small>
                        <strong>${formatarNumero(totalIntegrantes)}</strong>
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
    if (frotasSupabase.length === 0) {
        return `
            <div class="estado-vazio">
                <span>ðŸš€</span>
                <h3>Nenhuma frota cadastrada</h3>
                <p>Crie a primeira frota operacional.</p>
            </div>
        `;
    }

    return frotasSupabase
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

    const integrantesRestantes = frota.integrantes.length - 4;

    const identificadorEspecial = frota.fixa
        ? `<span class="etiqueta-fixa">FROTA PADRÃƒO</span>`
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

                            <h3>${escaparHTML(frota.nome)}</h3>
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
                        onclick="abrirGerenciamentoFrota('${frota.id}')">
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
                Ã—
            </button>
        </div>

        <form id="form-nova-frota" class="formulario-sistema">
            <div class="campo-formulario">
                <label for="nome-nova-frota">Nome da frota</label>

                <input
                    id="nome-nova-frota"
                    name="nome"
                    type="text"
                    maxlength="40"
                    autocomplete="off"
                    placeholder="Ex.: Exploradores"
                    required>

                <small>Use um nome Ãºnico para identificar o grupo.</small>
            </div>

            <fieldset class="campo-formulario escolha-cor">
                <legend>Cor de identificaÃ§Ã£o</legend>
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

                <button type="submit" class="btn-principal">
                    Criar Frota
                </button>
            </div>
        </form>
    `);

    const formulario = document.getElementById("form-nova-frota");

    formulario.addEventListener("submit", processarNovaFrota);

    document.getElementById("nome-nova-frota").focus();
}

function criarOpcoesCores(corSelecionada = "#3db8ff") {
    return CORES_FROTA
        .map(cor => `
            <label class="opcao-cor" title="${cor.nome}">
                <input
                    type="radio"
                    name="cor"
                    value="${cor.valor}"
                    ${cor.valor === corSelecionada ? "checked" : ""}>

                <span
                    class="amostra-cor"
                    style="background:${cor.valor}">
                </span>

                <small>${cor.nome}</small>
            </label>
        `)
        .join("");
}

async function processarNovaFrota(evento) {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const nome = formulario.nome.value.trim();
    const cor = formulario.cor.value;

    if (!nome) {
        mostrarNotificacao("Digite o nome da frota.", "error");
        return;
    }

    if (nomeFrotaJaExiste(nome)) {
        mostrarNotificacao(
            "JÃ¡ existe uma frota com esse nome.",
            "error"
        );
        return;
    }

    const botao = formulario.querySelector('button[type="submit"]');
    botao.disabled = true;

    try {
        const { error } = await supabaseClient
            .from("frotas")
            .insert({
                nome,
                cor,
                fixa: false
            });

        if (error) throw error;

        await carregarFrotasSupabase(false);

        fecharModal();
        atualizarTelaFrotas();

        mostrarNotificacao(
            `Frota ${nome} criada com sucesso!`,
            "success"
        );
    } catch (erro) {
        console.error("Erro ao criar frota:", erro);
        mostrarNotificacao(
            "NÃ£o foi possÃ­vel criar a frota.",
            "error"
        );
        botao.disabled = false;
    }
}

// ======================================
// GERENCIAMENTO
// ======================================

function abrirGerenciamentoFrota(idFrota) {
    const frota = buscarFrota(idFrota);

    if (!frota) {
        mostrarNotificacao("Frota nÃ£o encontrada.", "error");
        return;
    }

    abrirModal(`
        <div class="modal-cabecalho">
            <div>
                <span class="modal-subtitulo">
                    GERENCIAMENTO DE FROTA
                </span>
                <h2>${escaparHTML(frota.nome)}</h2>
            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="fecharModal()"
                aria-label="Fechar">
                Ã—
            </button>
        </div>

        <div class="detalhes-frota">
            <div class="identidade-frota">
                <span
                    class="cor-detalhe-frota"
                    style="background:${frota.cor}">
                </span>

                <div>
                    <small>IdentificaÃ§Ã£o visual</small>
                    <strong>${obterNomeCor(frota.cor)}</strong>
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

                    ${
                        !frota.fixa
                            ? `
                                <button
                                    type="button"
                                    class="btn-principal btn-pequeno"
                                    onclick="abrirModalNovoIntegrante('${frota.id}')">
                                    + Adicionar
                                </button>
                            `
                            : ""
                    }
                </div>

                <div class="lista-integrantes-modal">
                    ${renderizarIntegrantesFrota(frota)}
                </div>
            </div>

            <div class="acoes-gerenciamento">
                ${
                    !frota.fixa
                        ? `
                            <button
                                type="button"
                                class="btn-secundario"
                                onclick="abrirModalRenomearFrota('${frota.id}')">
                                Renomear Frota
                            </button>

                            <button
                                type="button"
                                class="btn-perigo"
                                onclick="solicitarExclusaoFrota('${frota.id}')">
                                Excluir Frota
                            </button>
                        `
                        : `
                            <div class="aviso-frota-fixa">
                                ðŸ”’ A frota POVO LIVRE Ã© permanente
                                e nÃ£o pode ser alterada ou excluÃ­da.
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
                <span>ðŸ‘¨â€ðŸš€</span>
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

                <span>${escaparHTML(integrante.nome)}</span>

                ${
                    !frota.fixa
                        ? `
                            <button
                                type="button"
                                class="btn-remover-integrante"
                                onclick="solicitarRemocaoIntegrante(
                                    '${frota.id}',
                                    '${integrante.id}'
                                )"
                                aria-label="Remover integrante">
                                Ã—
                            </button>
                        `
                        : ""
                }
            </div>
        `)
        .join("");
}

// ======================================
// INTEGRANTES
// ======================================

function abrirModalNovoIntegrante(idFrota) {
    const frota = buscarFrota(idFrota);
    const povoLivre = buscarPovoLivre();

    if (!frota || !povoLivre || frota.fixa) return;

    const disponiveis = povoLivre.integrantes;

    abrirModal(`
        <div class="modal-cabecalho">
            <div>
                <span class="modal-subtitulo">
                    TRANSFERÃŠNCIA DE TRIPULANTE
                </span>
                <h2>Adicionar Integrante</h2>
            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="abrirGerenciamentoFrota('${idFrota}')">
                Ã—
            </button>
        </div>

        <p class="modal-contexto">
            Frota:
            <strong>${escaparHTML(frota.nome)}</strong>
        </p>

        <div class="lista-integrantes-modal">
            ${
                disponiveis.length > 0
                    ? disponiveis
                        .map(integrante => `
                            <div class="integrante-linha">
                                <div class="avatar-integrante">
                                    ${obterIniciais(integrante.nome)}
                                </div>

                                <span>${escaparHTML(integrante.nome)}</span>

                                <button
                                    type="button"
                                    class="btn-principal btn-pequeno"
                                    onclick="adicionarIntegrante(
                                        '${idFrota}',
                                        '${integrante.id}'
                                    )">
                                    Adicionar
                                </button>
                            </div>
                        `)
                        .join("")
                    : `
                        <div class="estado-vazio compacto">
                            <span>ðŸ‘¨â€ðŸš€</span>
                            <p>Nenhum integrante disponÃ­vel no POVO LIVRE.</p>
                        </div>
                    `
            }
        </div>

        <div class="modal-botoes">
            <button
                type="button"
                class="btn-secundario"
                onclick="abrirGerenciamentoFrota('${idFrota}')">
                Voltar
            </button>
        </div>
    `);
}

async function adicionarIntegrante(idFrota, idIntegrante) {
    const frota = buscarFrota(idFrota);
    const povoLivre = buscarPovoLivre();

    if (!frota || !povoLivre || frota.fixa) {
        mostrarNotificacao("Frota nÃ£o encontrada.", "error");
        return;
    }

    const integrante = povoLivre.integrantes.find(
        item => String(item.id) === String(idIntegrante)
    );

    if (!integrante) {
        mostrarNotificacao(
            "Esse integrante nÃ£o estÃ¡ disponÃ­vel no POVO LIVRE.",
            "error"
        );
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("frota_integrantes")
            .update({
                frota_id: String(idFrota),
                data_entrada: new Date().toISOString()
            })
            .eq("usuario_id", String(idIntegrante));

        if (error) throw error;

        await carregarFrotasSupabase(false);

        atualizarTelaFrotas();
        abrirGerenciamentoFrota(idFrota);

        mostrarNotificacao(
            `${integrante.nome} foi adicionado Ã  frota.`,
            "success"
        );
    } catch (erro) {
        console.error("Erro ao adicionar integrante:", erro);
        mostrarNotificacao(
            "NÃ£o foi possÃ­vel mover o integrante.",
            "error"
        );
    }
}

function solicitarRemocaoIntegrante(idFrota, idIntegrante) {
    const frota = buscarFrota(idFrota);

    const integrante = frota?.integrantes.find(
        item => String(item.id) === String(idIntegrante)
    );

    if (!frota || !integrante || frota.fixa) return;

    confirmar(
        `Remover ${escaparHTML(integrante.nome)} da frota? `
        + "O integrante voltarÃ¡ para o POVO LIVRE.",
        () => removerIntegrante(idFrota, idIntegrante)
    );
}

async function removerIntegrante(idFrota, idIntegrante) {
    const frota = buscarFrota(idFrota);
    const povoLivre = buscarPovoLivre();

    if (!frota || !povoLivre || frota.fixa) return;

    try {
        const { error } = await supabaseClient
            .from("frota_integrantes")
            .update({
                frota_id: povoLivre.id,
                data_entrada: new Date().toISOString()
            })
            .eq("usuario_id", String(idIntegrante))
            .eq("frota_id", String(idFrota));

        if (error) throw error;

        await carregarFrotasSupabase(false);

        atualizarTelaFrotas();
        abrirGerenciamentoFrota(idFrota);

        mostrarNotificacao(
            "Integrante devolvido ao POVO LIVRE.",
            "success"
        );
    } catch (erro) {
        console.error("Erro ao remover integrante:", erro);
        mostrarNotificacao(
            "NÃ£o foi possÃ­vel remover o integrante.",
            "error"
        );
    }
}

// ======================================
// RENOMEAR
// ======================================

function abrirModalRenomearFrota(idFrota) {
    const frota = buscarFrota(idFrota);

    if (!frota || frota.fixa) return;

    abrirModal(`
        <div class="modal-cabecalho">
            <div>
                <span class="modal-subtitulo">
                    ALTERAÃ‡ÃƒO DE IDENTIFICAÃ‡ÃƒO
                </span>
                <h2>Renomear Frota</h2>
            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="abrirGerenciamentoFrota('${idFrota}')">
                Ã—
            </button>
        </div>

        <form id="form-renomear-frota" class="formulario-sistema">
            <div class="campo-formulario">
                <label for="novo-nome-frota">Novo nome</label>

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
                    onclick="abrirGerenciamentoFrota('${idFrota}')">
                    Voltar
                </button>

                <button type="submit" class="btn-principal">
                    Salvar AlteraÃ§Ã£o
                </button>
            </div>
        </form>
    `);

    const formulario = document.getElementById("form-renomear-frota");

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        renomearFrota(idFrota, formulario.nome.value);
    });

    const campoNome = document.getElementById("novo-nome-frota");
    campoNome.focus();
    campoNome.select();
}

async function renomearFrota(idFrota, nomeInformado) {
    const frota = buscarFrota(idFrota);
    const novoNome = String(nomeInformado || "").trim();

    if (!frota || frota.fixa || !novoNome) {
        mostrarNotificacao("Digite um nome vÃ¡lido.", "error");
        return;
    }

    if (nomeFrotaJaExiste(novoNome, idFrota)) {
        mostrarNotificacao(
            "JÃ¡ existe outra frota com esse nome.",
            "error"
        );
        return;
    }

    try {
        const { error } = await supabaseClient
            .from("frotas")
            .update({ nome: novoNome })
            .eq("id", String(idFrota));

        if (error) throw error;

        await carregarFrotasSupabase(false);

        atualizarTelaFrotas();
        abrirGerenciamentoFrota(idFrota);

        mostrarNotificacao(
            "Frota renomeada com sucesso!",
            "success"
        );
    } catch (erro) {
        console.error("Erro ao renomear frota:", erro);
        mostrarNotificacao(
            "NÃ£o foi possÃ­vel renomear a frota.",
            "error"
        );
    }
}

// ======================================
// EXCLUSÃƒO
// ======================================

function solicitarExclusaoFrota(idFrota) {
    const frota = buscarFrota(idFrota);

    if (!frota) return;

    if (frota.fixa) {
        mostrarNotificacao(
            "A frota POVO LIVRE nÃ£o pode ser excluÃ­da.",
            "error"
        );
        return;
    }

    confirmar(
        `
            Excluir a frota
            <strong>${escaparHTML(frota.nome)}</strong>?
            Os integrantes serÃ£o devolvidos ao POVO LIVRE.
        `,
        () => excluirFrota(idFrota)
    );
}

async function excluirFrota(idFrota) {
    const frota = buscarFrota(idFrota);
    const povoLivre = buscarPovoLivre();

    if (!frota || !povoLivre || frota.fixa) return;

    try {
        if (frota.integrantes.length > 0) {
            const { error: erroMover } = await supabaseClient
                .from("frota_integrantes")
                .update({
                    frota_id: povoLivre.id,
                    data_entrada: new Date().toISOString()
                })
                .eq("frota_id", String(idFrota));

            if (erroMover) throw erroMover;
        }

        const { error: erroExcluir } = await supabaseClient
            .from("frotas")
            .delete()
            .eq("id", String(idFrota));

        if (erroExcluir) throw erroExcluir;

        await carregarFrotasSupabase(false);

        fecharModal();
        atualizarTelaFrotas();

        mostrarNotificacao(
            "Frota excluÃ­da com sucesso.",
            "success"
        );
    } catch (erro) {
        console.error("Erro ao excluir frota:", erro);
        mostrarNotificacao(
            "NÃ£o foi possÃ­vel excluir a frota.",
            "error"
        );
    }
}

// ======================================
// AUXILIARES
// ======================================

function buscarFrota(id) {
    return frotasSupabase.find(
        frota => String(frota.id) === String(id)
    );
}

function buscarPovoLivre() {
    return frotasSupabase.find(
        frota => frota.fixa === true
    );
}

function nomeFrotaJaExiste(nome, idIgnorado = null) {
    const nomeNormalizado = String(nome).trim().toLowerCase();

    return frotasSupabase.some(frota => {
        const mesmoNome =
            frota.nome.trim().toLowerCase() === nomeNormalizado;

        const frotaDiferente =
            String(frota.id) !== String(idIgnorado);

        return mesmoNome && frotaDiferente;
    });
}

function atualizarTelaFrotas() {
    const paginaFrotas = document.getElementById("pagina-frotas");

    if (paginaFrotas) {
        conteudo.innerHTML = telaFrotas();
    }

    if (typeof atualizarIndicadoresMenu === "function") {
        atualizarIndicadoresMenu();
    }
}

function formatarQuantidadeIntegrantes(quantidade) {
    return quantidade === 1
        ? "1 integrante"
        : `${quantidade} integrantes`;
}

function obterNomeCor(valor) {
    const corEncontrada = CORES_FROTA.find(
        cor => cor.valor === valor
    );

    if (corEncontrada) return corEncontrada.nome;
    if (valor === "#888888") return "Cinza";

    return valor;
}

function obterIniciais(nome) {
    return String(nome || "")
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

// ======================================
// INTEGRAÃ‡ÃƒO COM AUTENTICAÃ‡ÃƒO
// ======================================

document.addEventListener(
    "usuarioAutenticado",
    () => {
        carregarFrotasSupabase();
    }
);
