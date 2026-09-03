// ======================================
// APP.JS
// Controlador Principal da Nave 3B
// ======================================

const titulo = document.getElementById("tituloPagina");
const conteudo = document.getElementById("conteudo");

let paginaAtual = "dashboard";
let sistemaInicializado = false;

// ======================================
// INICIALIZAÇÃO
// ======================================

function inicializarSistema() {

    if (sistemaInicializado) return;

    sistemaInicializado = true;

    if (typeof inicializarUI === "function") {
        inicializarUI();
    }

    configurarNavegacao();
    configurarEventosGlobais();

    atualizarRelogioNave();
    atualizarIndicadoresMenu();

    abrirPagina("dashboard");

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        inicializarSistema
    );

} else {

    inicializarSistema();

}

// ======================================
// LOADING
// ======================================

window.addEventListener("load", () => {

    const loading =
        document.getElementById("loading-screen")
        || document.getElementById("loading");

    if (!loading) return;

    setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {

            loading.style.display = "none";

        }, 600);

    }, 1200);

});

// ======================================
// RELÓGIO
// ======================================

function atualizarRelogioNave() {

    const elementoRelogio =
        document.querySelector("#clock");

    if (!elementoRelogio) {

        console.warn("Elemento #clock não encontrado.");
        return;

    }

    const agora = new Date();

    const horas = String(
        agora.getHours()
    ).padStart(2, "0");

    const minutos = String(
        agora.getMinutes()
    ).padStart(2, "0");

    const segundos = String(
        agora.getSeconds()
    ).padStart(2, "0");

    elementoRelogio.textContent =
        `${horas}:${minutos}:${segundos}`;

}

atualizarRelogioNave();

setInterval(
    atualizarRelogioNave,
    1000
);

// ======================================
// NAVEGAÇÃO
// ======================================

function configurarNavegacao() {

    const rotas = [
        "dashboard",
        "mapa",
        "missoes",
        "frotas",
        "inventario",
        "integridade",
        "arena",
        "torre",
        "ficha",
        "kaijus",
        "mechas"
    ];

    rotas.forEach(pagina => {

        const botao =
            document.getElementById(`btn-${pagina}`);

        if (!botao) return;

        botao.addEventListener("click", () => {

            abrirPagina(pagina);

        });

    });

}

function abrirPagina(pagina) {

    if (
        paginaAtual === "torre"
        && pagina !== "torre"
        && typeof encerrarAcessoTorreArmas === "function"
    ) {
        encerrarAcessoTorreArmas();
    }

    paginaAtual = pagina;

    marcarBotaoAtivo(pagina);

    switch (pagina) {

        case "dashboard":

            titulo.textContent = "Dashboard";

            conteudo.innerHTML = executarTela(
                "telaDashboard",
                telaDashboard
            );

            break;

        case "mapa":

            titulo.textContent = "Mapa Estelar";

            conteudo.innerHTML =
                typeof telaMapa === "function"
                    ? telaMapa()
                    : telaEmDesenvolvimento(
                        "Mapa Estelar",
                        "O sistema estelar será implementado em breve."
                    );

            break;

        case "missoes":

            titulo.textContent = "Registro de Missões";

            conteudo.innerHTML =
                typeof telaMissoes === "function"
                    ? telaMissoes()
                    : telaEmDesenvolvimento(
                        "Registro de Missões",
                        "O módulo de missões será implementado em breve."
                    );

            break;

        case "frotas":

            titulo.textContent = "Frotas";

            conteudo.innerHTML =
                typeof telaFrotas === "function"
                    ? telaFrotas()
                    : telaEmDesenvolvimento(
                        "Frotas",
                        "Não foi possível carregar o módulo."
                    );

            break;

        case "inventario":

            titulo.textContent = "Inventário";

            conteudo.innerHTML =
                typeof telaInventario === "function"
                    ? telaInventario()
                    : telaEmDesenvolvimento(
                        "Inventário",
                        "O módulo de inventário será implementado em breve."
                    );

            break;

        case "integridade":

            titulo.textContent = "Integridade da Nave";

            conteudo.innerHTML =
                typeof telaIntegridade === "function"
                    ? telaIntegridade()
                    : telaEmDesenvolvimento(
                        "Integridade da Nave",
                        "Não foi possível carregar o módulo."
                    );

            if (typeof inicializarPaginaIntegridade === "function") {
                requestAnimationFrame(inicializarPaginaIntegridade);
            }

            break;

        case "arena":

            titulo.textContent = "Arena de Combate";

            conteudo.innerHTML =
                typeof telaArena === "function"
                    ? telaArena()
                    : telaEmDesenvolvimento(
                        "Arena de Combate",
                        "Não foi possível carregar a arena."
                    );

            if (typeof inicializarPaginaArena === "function") {
                requestAnimationFrame(inicializarPaginaArena);
            }

            break;

        case "torre":

            titulo.textContent = "Torre de Armas";

            conteudo.innerHTML =
                typeof telaTorreArmas === "function"
                    ? telaTorreArmas()
                    : telaEmDesenvolvimento(
                        "Torre de Armas",
                        "Não foi possível carregar o controle de armamento."
                    );

            if (typeof inicializarPaginaTorreArmas === "function") {
                requestAnimationFrame(inicializarPaginaTorreArmas);
            }

            break;

        case "ficha":

            titulo.textContent = "Ficha do Tripulante";

            conteudo.innerHTML =
                typeof telaFicha === "function"
                    ? telaFicha()
                    : telaEmDesenvolvimento(
                        "Ficha do Tripulante",
                        "Não foi possível carregar o módulo."
                    );

            if (typeof inicializarPaginaFicha === "function") {
                requestAnimationFrame(inicializarPaginaFicha);
            }

            break;

        case "kaijus":

            titulo.textContent = "Registro de Kaijus";

            conteudo.innerHTML =
                typeof telaRegistroKaijus === "function"
                    ? telaRegistroKaijus()
                    : telaEmDesenvolvimento(
                        "Registro de Kaijus",
                        "Não foi possível carregar o banco de criaturas."
                    );

            if (typeof inicializarPaginaKaijus === "function") {
                requestAnimationFrame(inicializarPaginaKaijus);
            }

            break;

        case "mechas":

            titulo.textContent = "Desenvolvimento de Mechas";

            conteudo.innerHTML =
                typeof telaMechas === "function"
                    ? telaMechas()
                    : telaEmDesenvolvimento(
                        "Desenvolvimento de Mechas",
                        "Não foi possível carregar o hangar individual."
                    );

            if (typeof inicializarPaginaMechas === "function") {
                requestAnimationFrame(inicializarPaginaMechas);
            }

            break;

        default:

            paginaAtual = "dashboard";

            titulo.textContent = "Dashboard";

            conteudo.innerHTML =
                typeof telaDashboard === "function"
                    ? telaDashboard()
                    : telaEmDesenvolvimento(
                        "Dashboard",
                        "Não foi possível carregar o painel."
                    );

            marcarBotaoAtivo("dashboard");

    }

    atualizarIndicadoresMenu();

}

function executarTela(nome, funcao) {

    if (typeof funcao === "function") {
        return funcao();
    }

    return telaEmDesenvolvimento(
        nome,
        "Este módulo ainda não foi carregado."
    );

}

function telaEmDesenvolvimento(tituloTela, mensagem) {

    return `

        <section class="estado-vazio">

            <span>🛠️</span>

            <h2>${tituloTela}</h2>

            <p>${mensagem}</p>

        </section>

    `;

}

function marcarBotaoAtivo(pagina) {

    document
        .querySelectorAll("nav button")
        .forEach(botao => {

            botao.classList.remove("ativo");

        });

    const botaoAtual =
        document.getElementById(`btn-${pagina}`);

    if (botaoAtual) {
        botaoAtual.classList.add("ativo");
    }

}

// ======================================
// EVENTOS GLOBAIS
// ======================================

function configurarEventosGlobais() {

    document.addEventListener(
        "bancoAtualizado",
        () => {

            atualizarIndicadoresMenu();
            atualizarPaginaAtual();

        }
    );

}

function atualizarPaginaAtual() {

    const overlay =
        document.getElementById("modal-overlay");

    const modalAberto =
        overlay
        && overlay.style.display !== "none"
        && overlay.style.display !== "";

    if (paginaAtual === "frotas" && modalAberto) {
        return;
    }

    abrirPagina(paginaAtual);

}

// ======================================
// INDICADORES
// ======================================

function atualizarIndicadoresMenu() {

    if (typeof banco === "undefined") return;

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
            : 0;

    atualizarIndicador(
        "menu-total-integrantes",
        totalIntegrantes
    );

    atualizarIndicador(
        "menu-total-frotas",
        totalFrotas
    );

    atualizarIndicador(
        "menu-total-missoes",
        totalMissoes
    );

}

function atualizarIndicador(id, valor) {

    const elemento =
        document.getElementById(id);

    if (!elemento) return;

    const numeroFormatado =
        typeof formatarNumero === "function"
            ? formatarNumero(valor)
            : String(valor).padStart(2, "0");

    elemento.textContent = numeroFormatado;

}
