// ======================================
// DASHBOARD.JS
// Painel Principal da Nave 3B
// ======================================

function telaDashboard() {

    const totalFrotas =
        Array.isArray(banco.frotas)
            ? banco.frotas.length
            : 0;

    const totalMissoes =
        Array.isArray(banco.missoes)
            ? banco.missoes.length
            : 0;

    const totalIntegrantes =
        typeof obterTotalIntegrantes === "function"
            ? obterTotalIntegrantes()
            : calcularIntegrantesDashboard();

    const totalPlanetas =
        Array.isArray(banco.planetas)
            ? banco.planetas.length
            : 0;

    const planetasDesbloqueados =
        Array.isArray(banco.planetas)
            ? banco.planetas.filter(
                planeta => planeta.desbloqueado
            ).length
            : 0;

    const totalInventario =
        Array.isArray(banco.inventario)
            ? banco.inventario.reduce(
                (total, item) =>
                    total + Number(item.quantidade || 0),
                0
            )
            : 0;

    const missoesConcluidas =
        Array.isArray(banco.missoes)
            ? banco.missoes.filter(
                missao =>
                    missao.status === "Concluída"
            ).length
            : 0;

    return `

        <section id="dashboard" class="dashboard-painel">

            <div class="dashboard-boas-vindas">

                <div>

                    <span class="dashboard-selo">
                        CENTRAL OPERACIONAL
                    </span>

                    <h2>
                        Sistema Solar Tião
                    </h2>

                    <p>

                        Monitoramento geral da Nave 3B
                        e das operações da tripulação.

                    </p>

                </div>

                <div class="dashboard-status-geral">

                    <span class="status-pulso"></span>

                    <div>

                        <small>STATUS DO SISTEMA</small>

                        <strong>NAVE 3B</strong>

                    </div>

                </div>

            </div>


            <div class="dashboard-grid">

                ${criarCardDashboard(
                    "🚀",
                    "Frotas",
                    formatarNumeroDashboard(totalFrotas),
                    "Grupos operacionais registrados"
                )}

                ${criarCardDashboard(
                    "📜",
                    "Missões",
                    formatarNumeroDashboard(totalMissoes),
                    `${missoesConcluidas} concluída(s)`
                )}

                ${criarCardDashboard(
                    "🌌",
                    "Planetas",
                    `${formatarNumeroDashboard(planetasDesbloqueados)} / ${formatarNumeroDashboard(totalPlanetas)}`,
                    "Corpos celestes identificados"
                )}

                ${criarCardDashboard(
                    "👨‍🚀",
                    "Integrantes",
                    formatarNumeroDashboard(totalIntegrantes),
                    "Tripulantes registrados"
                )}

                ${criarCardDashboard(
                    "📦",
                    "Inventário",
                    formatarNumeroDashboard(totalInventario),
                    "Unidades disponíveis"
                )}

                ${criarCardDashboard(
                    "📡",
                    "Comunicação",
                    "ATIVA",
                    "Canal orbital estabilizado",
                    true
                )}

            </div>


            <div class="dashboard-inferior">

                <div class="card dashboard-operacao">

                    <div class="titulo-painel-dashboard">

                        <div>

                            <span>VISÃO OPERACIONAL</span>

                            <h3>Progresso das Missões</h3>

                        </div>

                        <strong>
                            ${calcularProgressoGeralMissoes()}%
                        </strong>

                    </div>

                    <div class="barra-dashboard">

                        <div
                            class="barra-dashboard-preenchimento"
                            style="width:${calcularProgressoGeralMissoes()}%">
                        </div>

                    </div>

                    <p>

                        Média do progresso de todas
                        as operações cadastradas.

                    </p>

                </div>


                <div class="card dashboard-resumo">

                    <span class="dashboard-resumo-icone">
                        🛰️
                    </span>

                    <div>

                        <small>NAVE</small>

                        <h3>NAVE 3B</h3>

                        <p>
                            Central de Comando Orbital
                        </p>

                    </div>

                </div>

            </div>

        </section>

    `;

}


// ======================================
// CARDS
// ======================================

function criarCardDashboard(
    icone,
    tituloCard,
    valor,
    descricao,
    status = false
) {

    return `

        <article class="card dashboard-card">

            <div class="dashboard-icone">

                ${icone}

            </div>

            <div class="dashboard-card-conteudo">

                <span>

                    ${tituloCard}

                </span>

                <strong
                    class="${status ? "dashboard-valor-status" : ""}">

                    ${valor}

                </strong>

                <small>

                    ${descricao}

                </small>

            </div>

        </article>

    `;

}


// ======================================
// PROGRESSO GERAL
// ======================================

function calcularProgressoGeralMissoes() {

    if (
        !Array.isArray(banco.missoes)
        || banco.missoes.length === 0
    ) {

        return 0;

    }

    const soma =
        banco.missoes.reduce(
            (total, missao) => {

                const progresso =
                    Number(missao.progresso);

                return total + (
                    Number.isFinite(progresso)
                        ? Math.max(
                            0,
                            Math.min(100, progresso)
                        )
                        : 0
                );

            },
            0
        );

    return Math.round(
        soma / banco.missoes.length
    );

}


// ======================================
// AUXILIARES
// ======================================

function calcularIntegrantesDashboard() {

    if (!Array.isArray(banco.frotas)) {
        return 0;
    }

    return banco.frotas.reduce(
        (total, frota) => {

            return total + (
                Array.isArray(frota.integrantes)
                    ? frota.integrantes.length
                    : 0
            );

        },
        0
    );

}


function formatarNumeroDashboard(numero) {

    return String(
        Number(numero) || 0
    ).padStart(2, "0");

}
// Compatibilidade com os outros módulos
function formatarNumero(numero){

    return formatarNumeroDashboard(numero);

}