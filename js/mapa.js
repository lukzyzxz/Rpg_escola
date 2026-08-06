// ======================================
// MAPA.JS
// Sistema Estelar da Nave 3B
// ======================================

// ======================================
// TELA PRINCIPAL
// ======================================

function telaMapa() {

    garantirEstruturaPlanetas();

    const planetasDesbloqueados =
        banco.planetas.filter(
            planeta => planeta.desbloqueado
        ).length;

    return `

        <section id="pagina-mapa">

            <div class="cabecalho-modulo">

                <div>

                    <h2>Mapa Estelar</h2>

                    <p class="descricao-modulo">

                        Analise corpos celestes, consulte dados
                        e libere novos destinos para exploração.

                    </p>

                </div>

                <div class="status-mapa">

                    <span class="pulso-status"></span>

                    ${planetasDesbloqueados}
                    de
                    ${banco.planetas.length}
                    planetas identificados

                </div>

            </div>


            <div class="painel-mapa">

                <div class="universo-interativo">

                    <div class="grade-estelar"></div>

                    <div class="linha-orbital linha-orbital-horizontal"></div>

                    <div class="linha-orbital linha-orbital-vertical"></div>


                    ${renderizarPlanetasMapa()}


                    <div class="nucleo-sistema">

                        <span>✦</span>

                        <small>SISTEMA SOLAR TIÃO</small>

                    </div>

                </div>


                <aside
                    id="painel-planeta"
                    class="painel-planeta">

                    ${renderizarPainelInicialMapa()}

                </aside>

            </div>

        </section>

    `;

}


// ======================================
// PLANETAS
// ======================================

function renderizarPlanetasMapa() {

    const posicoes = [
        "planeta-posicao-centro",
        "planeta-posicao-topo",
        "planeta-posicao-esquerda",
        "planeta-posicao-baixo"
    ];

    return banco.planetas
        .map((planeta, indice) => {

            const posicao =
                posicoes[indice]
                || "planeta-posicao-centro";

            return criarPlanetaMapa(
                planeta,
                posicao
            );

        })
        .join("");

}


function criarPlanetaMapa(
    planeta,
    posicao
) {

    const desbloqueado =
        Boolean(planeta.desbloqueado);

    const nomeExibido =
        desbloqueado
            ? planeta.nome
            : "INCÓGNITA";

    return `

        <button
            type="button"
            class="
                planeta-mapa
                ${posicao}
                ${desbloqueado
                    ? "planeta-disponivel"
                    : "planeta-bloqueado"
                }
            "
            onclick="selecionarPlanetaMapa(${planeta.id})"
            aria-label="Abrir informações de ${escaparTextoMapa(
                nomeExibido
            )}">

            <span class="orbita-planeta"></span>

            <span class="corpo-planeta">

                ${
                    desbloqueado
                        ? obterIconePlaneta(planeta)
                        : "?"
                }

            </span>

            <span class="nome-planeta-mapa">

                ${escaparTextoMapa(nomeExibido)}

            </span>

            <small>

                ${
                    desbloqueado
                        ? "DISPONÍVEL"
                        : "DADOS RESTRITOS"
                }

            </small>

        </button>

    `;

}


// ======================================
// PAINEL LATERAL
// ======================================

function renderizarPainelInicialMapa() {

    return `

        <div class="painel-planeta-vazio">

            <span>🌌</span>

            <h3>Selecione um planeta</h3>

            <p>

                Clique em um corpo celeste para consultar
                informações e permissões de acesso.

            </p>

        </div>

    `;

}


function selecionarPlanetaMapa(idPlaneta) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    const painel =
        document.getElementById(
            "painel-planeta"
        );

    if (!planeta || !painel) return;

    painel.innerHTML =
        planeta.desbloqueado
            ? renderizarPlanetaDesbloqueado(planeta)
            : renderizarPlanetaBloqueado(planeta);

}


function renderizarPlanetaDesbloqueado(
    planeta
) {

    const totalMissoes =
        Array.isArray(banco.missoes)
            ? banco.missoes.filter(
                missao =>
                    Number(missao.planetaId)
                    === Number(planeta.id)
            ).length
            : 0;

    const missoesConcluidas =
        Array.isArray(banco.missoes)
            ? banco.missoes.filter(
                missao =>
                    Number(missao.planetaId)
                    === Number(planeta.id)
                    && missao.status === "Concluída"
            ).length
            : 0;

    return `

        <div class="topo-painel-planeta">

            <span class="icone-painel-planeta">

                ${obterIconePlaneta(planeta)}

            </span>

            <div>

                <small>DESTINO IDENTIFICADO</small>

                <h3>

                    ${escaparTextoMapa(
                        planeta.nome
                    )}

                </h3>

            </div>

        </div>


        <div class="status-planeta status-planeta-disponivel">

            <span></span>

            Acesso liberado

        </div>


        <p class="descricao-planeta">

            ${escaparTextoMapa(
                planeta.descricao
                || "Nenhuma descrição registrada."
            )}

        </p>


        <div class="dados-planeta">

            <div>

                <small>Identificação</small>

                <strong>
                    PLANETA-${String(planeta.id).padStart(2, "0")}
                </strong>

            </div>

            <div>

                <small>Missões registradas</small>

                <strong>
                    ${formatarNumero(totalMissoes)}
                </strong>

            </div>

            <div>

                <small>Missões concluídas</small>

                <strong>
                    ${formatarNumero(missoesConcluidas)}
                </strong>

            </div>

            <div>

                <small>Condição</small>

                <strong>EXPLORÁVEL</strong>

            </div>

        </div>


        <div class="acoes-painel-planeta">

    <button
        type="button"
        class="btn-secundario"
        onclick="abrirModalEditarPlaneta(${planeta.id})">

        Editar Informações

    </button>

    ${
        Number(planeta.id) !== 1
            ? `
                <button
                    type="button"
                    class="btn-perigo"
                    onclick="solicitarBloqueioPlaneta(${planeta.id})">

                    Bloquear Planeta

                </button>
            `
            : `
                <div class="aviso-planeta-fixo">

                    🔒 Verdejante é o planeta inicial
                    e não pode ser bloqueado.

                </div>
            `
    }

</div>

    `;

}


function renderizarPlanetaBloqueado(
    planeta
) {

    return `

        <div class="topo-painel-planeta">

            <span class="icone-painel-planeta bloqueado">

                🔒

            </span>

            <div>

                <small>ASSINATURA DESCONHECIDA</small>

                <h3>PLANETA INCÓGNITO</h3>

            </div>

        </div>


        <div class="status-planeta status-planeta-bloqueado">

            <span></span>

            Acesso restrito

        </div>


        <p class="descricao-planeta">

            Os dados deste corpo celeste ainda não foram
            revelados. Utilize a liberação administrativa
            quando novas informações forem fornecidas.

        </p>


        <div class="dados-corrompidos">

            <span>IDENTIFICAÇÃO</span>

            <strong>████████████</strong>

            <span>ATMOSFERA</span>

            <strong>████████████</strong>

            <span>COORDENADAS</span>

            <strong>███.██ / ███.██</strong>

        </div>


        <div class="acoes-painel-planeta">

            <button
                type="button"
                class="btn-principal"
                onclick="abrirModalDesbloquearPlaneta(${planeta.id})">

                Desbloquear Planeta

            </button>

        </div>

    `;

}


// ======================================
// DESBLOQUEAR PLANETA
// ======================================

function abrirModalDesbloquearPlaneta(
    idPlaneta
) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    if (!planeta) return;

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">

                    LIBERAÇÃO DE DESTINO

                </span>

                <h2>Desbloquear Planeta</h2>

            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="fecharModal()">

                ×

            </button>

        </div>


        <form
            id="form-desbloquear-planeta"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="nome-planeta">

                    Nome do planeta

                </label>

                <input
                    id="nome-planeta"
                    name="nome"
                    type="text"
                    maxlength="50"
                    autocomplete="off"
                    placeholder="Ex.: Solaris"
                    required>

            </div>


            <div class="campo-formulario">

                <label for="descricao-planeta">

                    Descrição

                </label>

                <textarea
                    id="descricao-planeta"
                    name="descricao"
                    maxlength="400"
                    placeholder="Informe as características do planeta..."
                    required></textarea>

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

                    Liberar Acesso

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById(
            "form-desbloquear-planeta"
        );

    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            desbloquearPlaneta(
                idPlaneta,
                formulario.nome.value,
                formulario.descricao.value
            );

        }
    );

    document
        .getElementById("nome-planeta")
        .focus();

}


function desbloquearPlaneta(
    idPlaneta,
    nomeInformado,
    descricaoInformada
) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    const nome =
        nomeInformado.trim();

    const descricao =
        descricaoInformada.trim();

    if (!planeta || !nome || !descricao) {

        mostrarNotificacao(
            "Preencha todos os dados do planeta.",
            "error"
        );

        return;

    }

    planeta.nome = nome;
    planeta.descricao = descricao;
    planeta.desbloqueado = true;

    salvarBanco();

    fecharModal();

    abrirPagina("mapa");

    mostrarNotificacao(
        `Planeta ${nome} desbloqueado!`,
        "success"
    );

}


// ======================================
// EDITAR PLANETA
// ======================================

function abrirModalEditarPlaneta(
    idPlaneta
) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    if (!planeta) return;

    abrirModal(`

        <div class="modal-cabecalho">

            <div>

                <span class="modal-subtitulo">

                    ATUALIZAÇÃO PLANETÁRIA

                </span>

                <h2>Editar Planeta</h2>

            </div>

            <button
                type="button"
                class="btn-fechar-modal"
                onclick="fecharModal()">

                ×

            </button>

        </div>


        <form
            id="form-editar-planeta"
            class="formulario-sistema">

            <div class="campo-formulario">

                <label for="editar-nome-planeta">

                    Nome do planeta

                </label>

                <input
                    id="editar-nome-planeta"
                    name="nome"
                    type="text"
                    maxlength="50"
                    autocomplete="off"
                    value="${escaparAtributoMapa(
                        planeta.nome
                    )}"
                    required>

            </div>


            <div class="campo-formulario">

                <label for="editar-descricao-planeta">

                    Descrição

                </label>

                <textarea
                    id="editar-descricao-planeta"
                    name="descricao"
                    maxlength="400"
                    required>${escaparTextoMapa(
                        planeta.descricao || ""
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

                    Salvar Alterações

                </button>

            </div>

        </form>

    `);

    const formulario =
        document.getElementById(
            "form-editar-planeta"
        );

    formulario.addEventListener(
        "submit",
        evento => {

            evento.preventDefault();

            editarPlaneta(
                idPlaneta,
                formulario.nome.value,
                formulario.descricao.value
            );

        }
    );

}


function editarPlaneta(
    idPlaneta,
    nomeInformado,
    descricaoInformada
) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    const nome =
        nomeInformado.trim();

    const descricao =
        descricaoInformada.trim();

    if (!planeta || !nome || !descricao) {

        mostrarNotificacao(
            "Preencha todos os dados do planeta.",
            "error"
        );

        return;

    }

    planeta.nome = nome;
    planeta.descricao = descricao;

    salvarBanco();

    fecharModal();

    abrirPagina("mapa");

    selecionarPlanetaMapa(idPlaneta);

    mostrarNotificacao(
        "Informações do planeta atualizadas.",
        "success"
    );

}


// ======================================
// ESTRUTURA E AUXILIARES
// ======================================

function garantirEstruturaPlanetas() {

    const planetasPadrao = [
        {
            id: 1,
            nome: "Verdejante",
            desbloqueado: true,
            descricao:
                "Primeiro planeta disponível para exploração."
        },
        {
            id: 2,
            nome: "Incógnita",
            desbloqueado: false,
            descricao:
                "Dados ainda não revelados."
        },
        {
            id: 3,
            nome: "Incógnita",
            desbloqueado: false,
            descricao:
                "Dados ainda não revelados."
        },
        {
            id: 4,
            nome: "Incógnita",
            desbloqueado: false,
            descricao:
                "Dados ainda não revelados."
        }
    ];

    if (!Array.isArray(banco.planetas)) {

        banco.planetas = planetasPadrao;
        salvarBanco();
        return;

    }

    planetasPadrao.forEach(
        planetaPadrao => {

            const existente =
                banco.planetas.find(
                    planeta =>
                        Number(planeta.id)
                        === Number(planetaPadrao.id)
                );

            if (!existente) {

                banco.planetas.push(
                    planetaPadrao
                );

            }

        }
    );

}


function buscarPlanetaMapa(idPlaneta) {

    return banco.planetas.find(
        planeta =>
            Number(planeta.id)
            === Number(idPlaneta)
    );

}


function obterIconePlaneta(planeta) {

    if (Number(planeta.id) === 1) {
        return "🌿";
    }

    const icones = [
        "🪐",
        "🌍",
        "🌑",
        "☄️"
    ];

    return icones[
        (Number(planeta.id) - 1)
        % icones.length
    ];

}
// ======================================
// BLOQUEAR PLANETA
// ======================================

function solicitarBloqueioPlaneta(idPlaneta) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    if (!planeta) {

        mostrarNotificacao(
            "Planeta não encontrado.",
            "error"
        );

        return;

    }

    if (Number(planeta.id) === 1) {

        mostrarNotificacao(
            "Verdejante não pode ser bloqueado.",
            "error"
        );

        return;

    }

    const missoesVinculadas =
        Array.isArray(banco.missoes)
            ? banco.missoes.filter(
                missao =>
                    Number(missao.planetaId)
                    === Number(idPlaneta)
            )
            : [];

    if (missoesVinculadas.length > 0) {

        mostrarNotificacao(
            `Este planeta possui ${missoesVinculadas.length} missão(ões) vinculada(s). Exclua ou altere essas missões antes de bloqueá-lo.`,
            "error"
        );

        return;

    }

    confirmar(
        `
            Bloquear o planeta
            <strong>${escaparTextoMapa(planeta.nome)}</strong>?

            <br><br>

            Ele voltará a aparecer como
            <strong>INCÓGNITA</strong>.
        `,
        () => bloquearPlaneta(idPlaneta)
    );

}


function bloquearPlaneta(idPlaneta) {

    const planeta =
        buscarPlanetaMapa(idPlaneta);

    if (!planeta || Number(planeta.id) === 1) {
        return;
    }

    planeta.nome = "Incógnita";
    planeta.descricao = "Dados ainda não revelados.";
    planeta.desbloqueado = false;

    salvarBanco();

    fecharModal();

    abrirPagina("mapa");

    mostrarNotificacao(
        "Planeta bloqueado e classificado como Incógnita.",
        "success"
    );

}

function escaparTextoMapa(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escaparAtributoMapa(valor) {

    return escaparTextoMapa(valor);

}