// ======================================
// ARENA.JS
// Arena externa incorporada à Nave 3B
// ======================================

const ARENA_FROTA_KEY = "arena-frota-combate-v1";

let frotaArenaSelecionadaId = "";
let integrantesArenaSelecionados = new Set();

function telaArena() {
    return `
        <section class="arena-integrada">
            <div class="arena-integrada-barra">
                <div>
                    <span>⚔ MÓDULO TÁTICO</span>
                    <strong>Escolha a frota e até quatro tripulantes para enfrentar o Kaiju.</strong>
                </div>

                <div class="arena-integrada-acoes">
                    <button id="btn-recarregar-arena" type="button">↻ Recarregar</button>
                    <button id="btn-tela-cheia-arena" type="button">⛶ Tela cheia</button>
                </div>
            </div>

            <section class="arena-frota-painel">
                <div class="arena-frota-cabecalho">
                    <div>
                        <span>FROTA CONTRA O KAIJU</span>
                        <strong>Preparação do grupo de combate</strong>
                    </div>

                    <label class="arena-frota-campo">
                        <span>Escolher frota</span>
                        <select id="arena-frota-select" disabled>
                            <option value="">Carregando frotas...</option>
                        </select>
                    </label>
                </div>

                <div id="arena-frota-vazio" class="arena-frota-vazio">
                    Selecione uma frota para ver seus integrantes.
                </div>

                <div id="arena-integrantes-selecao" class="arena-integrantes-selecao" hidden>
                    <div class="arena-integrantes-topo">
                        <div>
                            <strong>Selecione até 4 combatentes</strong>
                            <small>Os escolhidos preencherão os quatro espaços da equipe.</small>
                        </div>
                        <span id="arena-contador-combatentes">0/4</span>
                    </div>

                    <div id="arena-lista-integrantes" class="arena-lista-integrantes"></div>

                    <button id="btn-aplicar-frota-arena" class="btn-aplicar-frota-arena" type="button" disabled>
                        ENVIAR FROTA PARA A ARENA
                    </button>
                </div>

                <div id="arena-frota-status" class="arena-frota-status" aria-live="polite"></div>
            </section>

            <iframe
                id="arena-frame"
                class="arena-frame"
                src="arena/index.html"
                title="Arena de Combate da Nave 3B"
                allow="fullscreen"
                allowfullscreen>
            </iframe>
        </section>
    `;
}

async function inicializarPaginaArena() {
    const frame = document.getElementById("arena-frame");
    const recarregar = document.getElementById("btn-recarregar-arena");
    const telaCheia = document.getElementById("btn-tela-cheia-arena");
    const seletor = document.getElementById("arena-frota-select");
    const aplicar = document.getElementById("btn-aplicar-frota-arena");

    if (!frame || !seletor || !aplicar) return;

    recarregar?.addEventListener("click", () => {
        frame.src = frame.src;
    });

    telaCheia?.addEventListener("click", async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                return;
            }

            await frame.requestFullscreen();
        } catch (erro) {
            console.error("Não foi possível abrir a arena em tela cheia:", erro);

            if (typeof mostrarNotificacao === "function") {
                mostrarNotificacao("O navegador não permitiu abrir a tela cheia.", "error");
            }
        }
    });

    seletor.addEventListener("change", () => {
        selecionarFrotaParaArena(seletor.value);
    });

    aplicar.addEventListener("click", aplicarFrotaNaArena);

    await carregarFrotasParaArena();
}

async function carregarFrotasParaArena() {
    const seletor = document.getElementById("arena-frota-select");
    if (!seletor) return;

    if (typeof carregarFrotasSupabase === "function") {
        await carregarFrotasSupabase(false);
    }

    const frotasDisponiveis = obterFrotasDisponiveisParaArena();

    if (frotasDisponiveis.length === 0) {
        seletor.innerHTML = '<option value="">Nenhuma frota disponível</option>';
        seletor.disabled = true;
        atualizarStatusFrotaArena(
            "Crie uma frota e adicione integrantes antes de iniciar o combate.",
            "aviso"
        );
        return;
    }

    seletor.innerHTML = `
        <option value="">Selecione uma frota</option>
        ${frotasDisponiveis
            .map(frota => `
                <option value="${escaparAtributoArena(frota.id)}">
                    ${escaparTextoArena(frota.nome)} — ${frota.integrantes.length} integrante${frota.integrantes.length === 1 ? "" : "s"}
                </option>
            `)
            .join("")}
    `;
    seletor.disabled = false;

    restaurarSelecaoFrotaArena();
}

function obterFrotasDisponiveisParaArena() {
    const origem = Array.isArray(frotasSupabase) && frotasSupabase.length > 0
        ? frotasSupabase
        : typeof banco !== "undefined" && Array.isArray(banco.frotas)
            ? banco.frotas
            : [];

    return origem.filter(frota => (
        !frota.fixa
        && String(frota.nome || "").trim().toUpperCase() !== "POVO LIVRE"
    ));
}

function obterFrotaArenaPorId(frotaId) {
    return obterFrotasDisponiveisParaArena().find(
        frota => String(frota.id) === String(frotaId)
    );
}

function selecionarFrotaParaArena(frotaId, idsPreSelecionados = []) {
    const painel = document.getElementById("arena-integrantes-selecao");
    const vazio = document.getElementById("arena-frota-vazio");
    const lista = document.getElementById("arena-lista-integrantes");
    const aplicar = document.getElementById("btn-aplicar-frota-arena");
    const frota = obterFrotaArenaPorId(frotaId);

    frotaArenaSelecionadaId = frota ? String(frota.id) : "";
    const idsValidos = new Set(
        Array.isArray(frota?.integrantes)
            ? frota.integrantes.map(integrante => String(integrante.id))
            : []
    );

    integrantesArenaSelecionados = new Set(
        idsPreSelecionados
            .map(id => String(id))
            .filter(id => idsValidos.has(id))
            .slice(0, 4)
    );

    if (!frota) {
        if (painel) painel.hidden = true;
        if (vazio) vazio.hidden = false;
        if (lista) lista.innerHTML = "";
        if (aplicar) aplicar.disabled = true;
        atualizarContadorCombatentesArena();
        atualizarStatusFrotaArena("", "");
        return;
    }

    if (vazio) vazio.hidden = true;
    if (painel) painel.hidden = false;

    if (!Array.isArray(frota.integrantes) || frota.integrantes.length === 0) {
        lista.innerHTML = `
            <div class="arena-frota-vazio compacto">
                Esta frota ainda não possui integrantes.
            </div>
        `;
        aplicar.disabled = true;
        atualizarContadorCombatentesArena();
        return;
    }

    lista.innerHTML = frota.integrantes
        .map(integrante => {
            const id = String(integrante.id);
            const marcado = integrantesArenaSelecionados.has(id);
            const nome = integrante.nome || integrante.username || "Tripulante";

            return `
                <label class="arena-integrante-opcao${marcado ? " selecionado" : ""}">
                    <input
                        type="checkbox"
                        value="${escaparAtributoArena(id)}"
                        ${marcado ? "checked" : ""}>
                    <span class="arena-integrante-avatar">${obterIniciaisArena(nome)}</span>
                    <span class="arena-integrante-dados">
                        <strong>${escaparTextoArena(nome)}</strong>
                        <small>${escaparTextoArena(integrante.cargo || integrante.username || "Tripulante")}</small>
                    </span>
                    <i>✓</i>
                </label>
            `;
        })
        .join("");

    lista.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener("change", () => alternarCombatenteArena(input));
    });

    atualizarContadorCombatentesArena();
    atualizarStatusFrotaArena("", "");
}

function alternarCombatenteArena(input) {
    const id = String(input.value);

    if (input.checked && integrantesArenaSelecionados.size >= 4) {
        input.checked = false;
        atualizarStatusFrotaArena(
            "A Arena permite no máximo quatro combatentes por batalha.",
            "aviso"
        );
        return;
    }

    if (input.checked) {
        integrantesArenaSelecionados.add(id);
    } else {
        integrantesArenaSelecionados.delete(id);
    }

    input.closest(".arena-integrante-opcao")?.classList.toggle(
        "selecionado",
        input.checked
    );

    atualizarContadorCombatentesArena();
    atualizarStatusFrotaArena("", "");
}

function atualizarContadorCombatentesArena() {
    const contador = document.getElementById("arena-contador-combatentes");
    const aplicar = document.getElementById("btn-aplicar-frota-arena");
    const quantidade = integrantesArenaSelecionados.size;

    if (contador) contador.textContent = `${quantidade}/4`;
    if (aplicar) aplicar.disabled = quantidade === 0 || !frotaArenaSelecionadaId;
}

function aplicarFrotaNaArena() {
    const frota = obterFrotaArenaPorId(frotaArenaSelecionadaId);
    const frame = document.getElementById("arena-frame");

    if (!frota || integrantesArenaSelecionados.size === 0) return;

    const combatentes = frota.integrantes
        .filter(integrante => integrantesArenaSelecionados.has(String(integrante.id)))
        .slice(0, 4)
        .map(integrante => ({
            id: integrante.id,
            nome: integrante.nome || integrante.username || "Tripulante",
            username: integrante.username || null,
            cargo: integrante.cargo || null,
            avatar: integrante.avatar || null
        }));

    const selecao = {
        frotaId: frota.id,
        frotaNome: frota.nome,
        frotaCor: frota.cor || "#3db8ff",
        combatentes,
        atualizadoEm: new Date().toISOString()
    };

    localStorage.setItem(ARENA_FROTA_KEY, JSON.stringify(selecao));

    frame?.contentWindow?.postMessage(
        { tipo: "NAVE_RPG_FROTA_ARENA", selecao },
        window.location.origin
    );

    atualizarStatusFrotaArena(
        `${frota.nome} preparada com ${combatentes.length} combatente${combatentes.length === 1 ? "" : "s"}. Entre em uma equipe para lutar.`,
        "sucesso"
    );

    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao("Frota enviada para a Arena de Combate!", "success");
    }
}

function restaurarSelecaoFrotaArena() {
    try {
        const selecao = JSON.parse(localStorage.getItem(ARENA_FROTA_KEY) || "null");
        const seletor = document.getElementById("arena-frota-select");

        if (!selecao?.frotaId || !seletor) return;

        const frota = obterFrotaArenaPorId(selecao.frotaId);
        if (!frota) return;

        seletor.value = String(frota.id);
        selecionarFrotaParaArena(
            frota.id,
            Array.isArray(selecao.combatentes)
                ? selecao.combatentes.map(combatente => combatente.id)
                : []
        );

        atualizarStatusFrotaArena(
            `${frota.nome} continua preparada para o combate.`,
            "sucesso"
        );
    } catch (erro) {
        console.warn("Não foi possível restaurar a frota da Arena:", erro);
        localStorage.removeItem(ARENA_FROTA_KEY);
    }
}

function atualizarStatusFrotaArena(mensagem, tipo) {
    const status = document.getElementById("arena-frota-status");
    if (!status) return;

    status.textContent = mensagem;
    status.className = `arena-frota-status ${tipo || ""}`;
}

function obterIniciaisArena(nome) {
    return String(nome || "T")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(parte => parte.charAt(0).toUpperCase())
        .join("") || "T";
}

function escaparTextoArena(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributoArena(valor) {
    return escaparTextoArena(valor);
}
