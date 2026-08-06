// ================================
// CENTRAL DE COMANDO - NAVE 3B
// ================================

const loading = document.getElementById("loading");
const relogio = document.getElementById("relogio");
const titulo = document.getElementById("tituloPagina");
const conteudo = document.getElementById("conteudo");

// ================================
// LOADING
// ================================

window.addEventListener("load", () => {

    setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {

            loading.style.display = "none";

        }, 600);

    }, 2200);

});

// ================================
// RELÓGIO
// ================================

function atualizarRelogio() {

    const agora = new Date();

    relogio.textContent = agora.toLocaleTimeString("pt-BR");

}

setInterval(atualizarRelogio, 1000);

atualizarRelogio();

// ================================
// DASHBOARD
// ================================

function dashboardHTML() {

    return `

        <div class="dashboard-grid">

            <div class="card">
                <h3>Nave</h3>
                <p>3B</p>
            </div>

            <div class="card">
                <h3>Planetas</h3>
                <p>1 / 4</p>
            </div>

            <div class="card">
                <h3>Frotas</h3>
                <p>1</p>
            </div>

            <div class="card">
                <h3>Missões</h3>
                <p>0</p>
            </div>

        </div>

    `;

}

// ================================
// MAPA
// ================================

function mapaHTML() {

    return `

        <div class="universo">

            <div class="linha-horizontal"></div>
            <div class="linha-vertical"></div>

            <div class="planeta verdejante centro">
                <div class="nome-planeta">
                    Verdejante
                </div>
            </div>

            <div class="planeta desconhecido topo">
                <div class="nome-planeta">
                    ???????
                </div>
            </div>

            <div class="planeta desconhecido esquerda">
                <div class="nome-planeta">
                    ???????
                </div>
            </div>

            <div class="planeta desconhecido direita">
                <div class="nome-planeta">
                    ???????
                </div>
            </div>

        </div>

    `;

}

// ================================
// TROCA DE TELAS
// ================================

function abrirPagina(nome) {

    document
        .querySelectorAll("nav button")
        .forEach(botao => botao.classList.remove("ativo"));

    switch (nome) {

        case "dashboard":

            titulo.textContent = "Dashboard";

            conteudo.innerHTML = dashboardHTML();

            document.getElementById("btn-dashboard").classList.add("ativo");

            break;

        case "mapa":

            titulo.textContent = "Sistema Estelar";

            conteudo.innerHTML = mapaHTML();

            document.getElementById("btn-mapa").classList.add("ativo");

            break;

        case "missoes":

            titulo.textContent = "Missões";

            conteudo.innerHTML = "<h2>Em desenvolvimento...</h2>";

            document.getElementById("btn-missoes").classList.add("ativo");

            break;

        case "frotas":

            titulo.textContent = "Frotas";

            conteudo.innerHTML = telaFrotas();

            document.getElementById("btn-frotas").classList.add("ativo");

            break;

        case "inventario":

            titulo.textContent = "Inventário";

            conteudo.innerHTML = "<h2>Em desenvolvimento...</h2>";

            document.getElementById("btn-inventario").classList.add("ativo");

            break;

    }

}

// ================================
// MENU
// ================================

document.getElementById("btn-dashboard").onclick = () => abrirPagina("dashboard");
document.getElementById("btn-mapa").onclick = () => abrirPagina("mapa");
document.getElementById("btn-missoes").onclick = () => abrirPagina("missoes");
document.getElementById("btn-frotas").onclick = () => abrirPagina("frotas");
document.getElementById("btn-inventario").onclick = () => abrirPagina("inventario");

// Página inicial

abrirPagina("dashboard");