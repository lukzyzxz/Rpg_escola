// ======================================
// DASHBOARD.JS
// Painel principal da Nave 3B
// ======================================

function telaDashboard() {

    const totalFrotas = banco.frotas.length;

    const totalMissoes = banco.missoes.length;

    const totalIntegrantes = banco.frotas.reduce(
        (total, frota) => total + frota.integrantes.length,
        0
    );

    const planetasExplorados = banco.planetas.filter(
        planeta => planeta.desbloqueado
    ).length;

    return `

        <section id="dashboard" class="dashboard-grid">

            <article class="card dashboard-card">

                <div class="dashboard-icone">
                    🛰️
                </div>

                <div>

                    <h3>Nave</h3>

                    <p>3B</p>

                    <span>Central de Comando</span>

                </div>

            </article>


            <article class="card dashboard-card">

                <div class="dashboard-icone">
                    🌌
                </div>

                <div>

                    <h3>Planetas Explorados</h3>

                    <p>
                        ${formatarNumero(planetasExplorados)}
                        /
                        ${formatarNumero(banco.planetas.length)}
                    </p>

                    <span>Corpos celestes liberados</span>

                </div>

            </article>


            <article class="card dashboard-card">

                <div class="dashboard-icone">
                    🚀
                </div>

                <div>

                    <h3>Frotas</h3>

                    <p>
                        ${formatarNumero(totalFrotas)}
                    </p>

                    <span>Frotas registradas</span>

                </div>

            </article>


            <article class="card dashboard-card">

                <div class="dashboard-icone">
                    📜
                </div>

                <div>

                    <h3>Missões</h3>

                    <p>
                        ${formatarNumero(totalMissoes)}
                    </p>

                    <span>Operações cadastradas</span>

                </div>

            </article>


            <article class="card dashboard-card">

                <div class="dashboard-icone">
                    👨‍🚀
                </div>

                <div>

                    <h3>Tripulação</h3>

                    <p>
                        ${formatarNumero(totalIntegrantes)}
                    </p>

                    <span>Integrantes registrados</span>

                </div>

            </article>


            <article class="card dashboard-card status-card">

                <div class="dashboard-icone">
                    📡
                </div>

                <div>

                    <h3>Status</h3>

                    <p class="status-online">
                        ONLINE
                    </p>

                    <span>Sistemas operacionais</span>

                </div>

            </article>

        </section>

    `;

}

// ======================================
// FORMATAÇÃO
// ======================================

function formatarNumero(numero) {

    return String(numero).padStart(2, "0");

}