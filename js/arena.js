// ======================================
// ARENA.JS
// Arena externa incorporada à Nave 3B
// ======================================

function telaArena() {
    return `
        <section class="arena-integrada">
            <div class="arena-integrada-barra">
                <div>
                    <span>⚔ MÓDULO TÁTICO</span>
                    <strong>Os dados de cada equipe são salvos automaticamente neste navegador.</strong>
                </div>

                <div class="arena-integrada-acoes">
                    <button id="btn-recarregar-arena" type="button">↻ Recarregar</button>
                    <button id="btn-tela-cheia-arena" type="button">⛶ Tela cheia</button>
                </div>
            </div>

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

function inicializarPaginaArena() {
    const frame = document.getElementById("arena-frame");
    const recarregar = document.getElementById("btn-recarregar-arena");
    const telaCheia = document.getElementById("btn-tela-cheia-arena");

    if (!frame) return;

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
}
