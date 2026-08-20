// ======================================
// INTEGRIDADE.JS
// Recuperação global da Nave 3B
// ======================================

const INTERVALO_RECUPERACAO_MS = 20 * 60 * 60 * 1000;

let estadoIntegridade = null;
let carregandoIntegridade = false;
let recuperandoIntegridade = false;
let intervaloContagemIntegridade = null;
let intervaloSincronizacaoIntegridade = null;
let canalIntegridade = null;

function telaIntegridade() {
    return `
        <section class="integridade-pagina">
            <div class="integridade-card">
                <div class="integridade-cabecalho">
                    <div>
                        <span class="integridade-selo">SISTEMA DE MANUTENÇÃO</span>
                        <h2>Integridade Estrutural</h2>
                        <p>
                            Cada recuperação restaura 1 ponto e bloqueia o sistema
                            para toda a tripulação durante 20 horas.
                        </p>
                    </div>
                    <div class="integridade-icone" aria-hidden="true">🛡️</div>
                </div>

                <div class="integridade-medidor" aria-live="polite">
                    <div class="integridade-numeros">
                        <span>INTEGRIDADE ATUAL</span>
                        <strong id="integridade-valor">5/15</strong>
                    </div>

                    <div
                        class="integridade-barra"
                        role="progressbar"
                        aria-label="Integridade atual da nave"
                        aria-valuemin="0"
                        aria-valuemax="15"
                        aria-valuenow="5">
                        <div id="integridade-progresso" class="integridade-progresso" style="width:33.333%"></div>
                    </div>

                    <div class="integridade-escala">
                        <span>CRÍTICA</span>
                        <span>ESTÁVEL</span>
                        <span>MÁXIMA</span>
                    </div>
                </div>

                <div id="integridade-status" class="integridade-status carregando">
                    <span class="integridade-status-icone">◌</span>
                    <div>
                        <small>STATUS DO REPARO</small>
                        <strong id="integridade-status-titulo">Sincronizando com a nave...</strong>
                        <span id="integridade-status-detalhe">Aguarde a confirmação do servidor.</span>
                    </div>
                </div>

                <button
                    id="btn-recuperar-integridade"
                    class="btn-recuperar-integridade"
                    type="button"
                    disabled>
                    <span>⚡</span>
                    <strong>RECUPERAR INTEGRIDADE DA NAVE</strong>
                </button>

                <p class="integridade-aviso">
                    A disponibilidade é compartilhada e atualizada online para todos os tripulantes.
                </p>
            </div>
        </section>
    `;
}

function inicializarPaginaIntegridade() {
    const botao = document.getElementById("btn-recuperar-integridade");

    if (!botao) return;

    botao.addEventListener("click", recuperarIntegridadeNave);
    carregarIntegridadeNave();
    iniciarContagemIntegridade();
    iniciarSincronizacaoIntegridade();
}

async function carregarIntegridadeNave(silencioso = false) {
    if (carregandoIntegridade) return;

    carregandoIntegridade = true;

    if (!silencioso && !estadoIntegridade) {
        atualizarStatusIntegridade(
            "carregando",
            "Sincronizando com a nave...",
            "Aguarde a confirmação do servidor.",
            "◌"
        );
    }

    try {
        const { data, error } = await supabaseClient
            .from("nave_integridade")
            .select("id, valor, maximo, ultima_recuperacao, ultimo_usuario_nome")
            .eq("id", 1)
            .single();

        if (error) throw error;

        estadoIntegridade = normalizarEstadoIntegridade(data);
        renderizarIntegridade();
    } catch (erro) {
        console.error("Erro ao carregar integridade:", erro);

        atualizarStatusIntegridade(
            "erro",
            "Comunicação indisponível",
            "Não foi possível consultar o estado online da nave.",
            "⚠"
        );

        const botao = document.getElementById("btn-recuperar-integridade");
        if (botao) botao.disabled = true;
    } finally {
        carregandoIntegridade = false;
    }
}

async function recuperarIntegridadeNave() {
    if (recuperandoIntegridade) return;

    recuperandoIntegridade = true;
    renderizarBotaoRecuperando();

    try {
        const { data, error } = await supabaseClient.rpc(
            "recuperar_integridade_nave"
        );

        if (error) throw error;

        if (data) {
            estadoIntegridade = normalizarEstadoIntegridade(data);
            renderizarIntegridade();
        } else {
            await carregarIntegridadeNave(true);
        }

        if (data?.sucesso) {
            mostrarAvisoIntegridade(
                "Integridade recuperada em 1 ponto!",
                "success"
            );
        } else if (data?.codigo === "integridade_maxima") {
            mostrarAvisoIntegridade(
                "A nave já está com integridade máxima.",
                "info"
            );
        } else {
            mostrarAvisoIntegridade(
                "Outro tripulante já realizou a recuperação. O estado foi atualizado.",
                "info"
            );
        }
    } catch (erro) {
        console.error("Erro ao recuperar integridade:", erro);

        mostrarAvisoIntegridade(
            "Não foi possível recuperar a integridade agora.",
            "error"
        );

        await carregarIntegridadeNave(true);
    } finally {
        recuperandoIntegridade = false;
        renderizarIntegridade();
    }
}

function normalizarEstadoIntegridade(dados) {
    return {
        valor: Number(dados?.valor ?? 5),
        maximo: Number(dados?.maximo ?? 15),
        ultimaRecuperacao:
            dados?.ultima_recuperacao
            || dados?.ultimaRecuperacao
            || null,
        ultimoUsuarioNome:
            dados?.ultimo_usuario_nome
            || dados?.ultimoUsuarioNome
            || "Tripulante não identificado",
        sucesso: Boolean(dados?.sucesso),
        codigo: dados?.codigo || null
    };
}

function renderizarIntegridade() {
    if (!estadoIntegridade) return;

    const valor = limitarNumero(
        estadoIntegridade.valor,
        0,
        estadoIntegridade.maximo
    );
    const maximo = Math.max(1, estadoIntegridade.maximo);
    const porcentagem = (valor / maximo) * 100;

    const textoValor = document.getElementById("integridade-valor");
    const progresso = document.getElementById("integridade-progresso");
    const barra = document.querySelector(".integridade-barra");

    if (textoValor) textoValor.textContent = `${valor}/${maximo}`;

    if (progresso) {
        progresso.style.width = `${porcentagem}%`;
        progresso.classList.toggle("critico", porcentagem <= 35);
        progresso.classList.toggle(
            "alerta",
            porcentagem > 35 && porcentagem < 70
        );
    }

    if (barra) {
        barra.setAttribute("aria-valuemax", String(maximo));
        barra.setAttribute("aria-valuenow", String(valor));
    }

    atualizarDisponibilidadeIntegridade();
}

function atualizarDisponibilidadeIntegridade() {
    if (!estadoIntegridade) return;

    const botao = document.getElementById("btn-recuperar-integridade");
    if (!botao) return;

    if (recuperandoIntegridade) {
        renderizarBotaoRecuperando();
        return;
    }

    if (estadoIntegridade.valor >= estadoIntegridade.maximo) {
        botao.disabled = true;
        botao.innerHTML = "<span>✓</span><strong>INTEGRIDADE MÁXIMA</strong>";

        atualizarStatusIntegridade(
            "maxima",
            "Nave totalmente restaurada",
            "Nenhuma manutenção é necessária no momento.",
            "✓"
        );
        return;
    }

    const restante = obterTempoRestanteIntegridade();

    if (restante > 0) {
        botao.disabled = true;
        botao.innerHTML = `
            <span>⏳</span>
            <strong>DISPONÍVEL EM ${formatarDuracao(restante)}</strong>
        `;

        atualizarStatusIntegridade(
            "bloqueado",
            `Reparo em recarga: ${formatarDuracao(restante)}`,
            `Última recuperação por ${estadoIntegridade.ultimoUsuarioNome}.`,
            "⏳"
        );
        return;
    }

    botao.disabled = false;
    botao.innerHTML = `
        <span>⚡</span>
        <strong>RECUPERAR INTEGRIDADE DA NAVE</strong>
    `;

    const detalhe = estadoIntegridade.ultimaRecuperacao
        ? `Última recuperação por ${estadoIntegridade.ultimoUsuarioNome}.`
        : "Nenhuma recuperação foi registrada ainda.";

    atualizarStatusIntegridade(
        "disponivel",
        "Sistema de reparo disponível",
        detalhe,
        "●"
    );
}

function renderizarBotaoRecuperando() {
    const botao = document.getElementById("btn-recuperar-integridade");
    if (!botao) return;

    botao.disabled = true;
    botao.innerHTML = "<span>◌</span><strong>PROCESSANDO REPARO...</strong>";
}

function atualizarStatusIntegridade(tipo, titulo, detalhe, icone) {
    const caixa = document.getElementById("integridade-status");
    const elementoTitulo = document.getElementById("integridade-status-titulo");
    const elementoDetalhe = document.getElementById("integridade-status-detalhe");
    const elementoIcone = document.querySelector(".integridade-status-icone");

    if (!caixa) return;

    caixa.className = `integridade-status ${tipo}`;
    if (elementoTitulo) elementoTitulo.textContent = titulo;
    if (elementoDetalhe) elementoDetalhe.textContent = detalhe;
    if (elementoIcone) elementoIcone.textContent = icone;
}

function obterTempoRestanteIntegridade() {
    if (!estadoIntegridade?.ultimaRecuperacao) return 0;

    const ultimaRecuperacao = new Date(
        estadoIntegridade.ultimaRecuperacao
    ).getTime();

    if (Number.isNaN(ultimaRecuperacao)) return 0;

    return Math.max(
        0,
        ultimaRecuperacao + INTERVALO_RECUPERACAO_MS - Date.now()
    );
}

function iniciarContagemIntegridade() {
    clearInterval(intervaloContagemIntegridade);

    intervaloContagemIntegridade = setInterval(() => {
        if (paginaAtual !== "integridade") {
            clearInterval(intervaloContagemIntegridade);
            intervaloContagemIntegridade = null;
            return;
        }

        atualizarDisponibilidadeIntegridade();
    }, 1000);
}

function iniciarSincronizacaoIntegridade() {
    if (!canalIntegridade) {
        canalIntegridade = supabaseClient
            .channel("integridade-nave-global")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "nave_integridade",
                    filter: "id=eq.1"
                },
                payload => {
                    estadoIntegridade = normalizarEstadoIntegridade(payload.new);

                    if (paginaAtual === "integridade") {
                        renderizarIntegridade();
                    }
                }
            )
            .subscribe();
    }

    clearInterval(intervaloSincronizacaoIntegridade);

    intervaloSincronizacaoIntegridade = setInterval(() => {
        if (paginaAtual === "integridade") {
            carregarIntegridadeNave(true);
        }
    }, 30000);
}

function formatarDuracao(milissegundos) {
    const totalSegundos = Math.max(
        0,
        Math.ceil(milissegundos / 1000)
    );
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;

    return [horas, minutos, segundos]
        .map(numero => String(numero).padStart(2, "0"))
        .join(":");
}

function limitarNumero(numero, minimo, maximo) {
    return Math.min(maximo, Math.max(minimo, Number(numero) || 0));
}

function mostrarAvisoIntegridade(mensagem, tipo) {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(mensagem, tipo);
    }
}

document.addEventListener("usuarioAutenticado", () => {
    estadoIntegridade = null;

    if (paginaAtual === "integridade") {
        carregarIntegridadeNave();
    }
});
