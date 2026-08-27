// ======================================
// TORRE-ARMAS.JS
// Disparo autenticado que reduz 1 ponto
// da integridade global da Nave 3B.
// ======================================

let senhaTorreTemporaria = "";
let torreDesbloqueada = false;
let validandoSenhaTorre = false;
let disparandoTorre = false;
let estadoTorreArmas = null;
let canalTorreArmas = null;

function telaTorreArmas() {
    encerrarAcessoTorreArmas();

    return `
        <section class="torre-pagina">
            <div class="torre-card" id="torre-card">
                <div class="torre-cabecalho">
                    <div>
                        <span class="torre-selo">SISTEMA DE ARMAMENTO ORBITAL</span>
                        <h2>Torre de Armas da Nave</h2>
                        <p>
                            Cada disparo consome 1 ponto da integridade estrutural.
                            Não existe tempo de recarga entre disparos.
                        </p>
                    </div>
                    <div class="torre-icone" aria-hidden="true">🎯</div>
                </div>

                <div id="torre-bloqueio" class="torre-bloqueio">
                    <div class="torre-cadeado" aria-hidden="true">⌾</div>
                    <span>ACESSO RESTRITO</span>
                    <strong>Digite a senha de quatro dígitos</strong>

                    <form id="form-senha-torre" autocomplete="off">
                        <input
                            id="senha-torre"
                            type="password"
                            inputmode="numeric"
                            pattern="[0-9]*"
                            maxlength="4"
                            aria-label="Senha da Torre de Armas"
                            placeholder="••••"
                            autocomplete="off">
                    </form>

                    <small id="torre-senha-status">
                        O acesso é verificado automaticamente ao completar os quatro dígitos.
                    </small>
                </div>

                <div id="torre-controle" class="torre-controle" hidden>
                    <div class="torre-medidor" aria-live="polite">
                        <span>INTEGRIDADE DISPONÍVEL</span>
                        <strong id="torre-integridade-valor">--/--</strong>
                        <div class="torre-barra" role="progressbar" aria-label="Integridade disponível">
                            <div id="torre-integridade-progresso"></div>
                        </div>
                        <small id="torre-ultimo-disparo">Carregando registro do armamento...</small>
                    </div>

                    <button id="btn-disparar-torre" class="btn-disparar-torre" type="button" disabled>
                        <span>◎</span>
                        <strong>DISPARAR TORRE DE ARMAS</strong>
                    </button>

                    <p class="torre-aviso">
                        Após o disparo, o sistema será bloqueado e exigirá a senha novamente.
                    </p>
                </div>
            </div>
        </section>
    `;
}

function inicializarPaginaTorreArmas() {
    const formulario = document.getElementById("form-senha-torre");
    const input = document.getElementById("senha-torre");
    const botao = document.getElementById("btn-disparar-torre");

    if (!formulario || !input || !botao) return;

    input.focus();

    input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(0, 4);

        if (input.value.length === 4) {
            validarSenhaTorreArmas(input.value);
        }
    });

    formulario.addEventListener("submit", evento => {
        evento.preventDefault();

        if (input.value.length === 4) {
            validarSenhaTorreArmas(input.value);
        }
    });

    botao.addEventListener("click", dispararTorreArmas);
    iniciarSincronizacaoTorreArmas();
}

async function validarSenhaTorreArmas(senha) {
    if (validandoSenhaTorre || torreDesbloqueada || paginaAtual !== "torre") return;

    validandoSenhaTorre = true;
    atualizarStatusSenhaTorre("Verificando autorização...", "carregando");

    try {
        const { data, error } = await supabaseClient.rpc(
            "validar_senha_torre_armas",
            { p_senha: senha }
        );

        if (error) throw error;

        if (data !== true) {
            rejeitarSenhaTorre();
            return;
        }

        senhaTorreTemporaria = senha;
        torreDesbloqueada = true;
        mostrarControleTorreArmas();
        await carregarEstadoTorreArmas();
    } catch (erro) {
        console.error("Erro ao validar a senha da Torre de Armas:", erro);
        atualizarStatusSenhaTorre(
            "Não foi possível validar o acesso. Verifique a configuração do banco.",
            "erro"
        );
        limparInputSenhaTorre(false);
    } finally {
        validandoSenhaTorre = false;
    }
}

function rejeitarSenhaTorre() {
    const card = document.getElementById("torre-card");

    atualizarStatusSenhaTorre("Senha incorreta. Acesso negado.", "erro");
    card?.classList.remove("torre-tremer");
    void card?.offsetWidth;
    card?.classList.add("torre-tremer");
    limparInputSenhaTorre(true);
}

function mostrarControleTorreArmas() {
    const bloqueio = document.getElementById("torre-bloqueio");
    const controle = document.getElementById("torre-controle");

    if (bloqueio) bloqueio.hidden = true;
    if (controle) controle.hidden = false;
}

async function carregarEstadoTorreArmas(silencioso = false) {
    if (!torreDesbloqueada && !silencioso) return;

    try {
        const { data, error } = await supabaseClient
            .from("nave_integridade")
            .select(
                "id, valor, maximo, ultimo_disparo, ultimo_disparo_usuario_nome"
            )
            .eq("id", 1)
            .single();

        if (error) throw error;

        estadoTorreArmas = normalizarEstadoTorreArmas(data);

        if (paginaAtual === "torre" && torreDesbloqueada) {
            renderizarEstadoTorreArmas();
        }
    } catch (erro) {
        console.error("Erro ao carregar a Torre de Armas:", erro);

        const botao = document.getElementById("btn-disparar-torre");
        if (botao) botao.disabled = true;

        if (!silencioso && typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Não foi possível consultar a integridade da nave.", "error");
        }
    }
}

function normalizarEstadoTorreArmas(dados) {
    return {
        valor: Math.max(0, Number(dados?.valor ?? 0)),
        maximo: Math.max(1, Number(dados?.maximo ?? 15)),
        ultimoDisparo: dados?.ultimo_disparo || null,
        ultimoUsuarioNome:
            dados?.ultimo_disparo_usuario_nome
            || "Nenhum tripulante"
    };
}

function renderizarEstadoTorreArmas() {
    if (!estadoTorreArmas) return;

    const valor = Math.min(estadoTorreArmas.valor, estadoTorreArmas.maximo);
    const porcentagem = (valor / estadoTorreArmas.maximo) * 100;
    const texto = document.getElementById("torre-integridade-valor");
    const progresso = document.getElementById("torre-integridade-progresso");
    const ultimo = document.getElementById("torre-ultimo-disparo");
    const barra = document.querySelector(".torre-barra");
    const botao = document.getElementById("btn-disparar-torre");

    if (texto) texto.textContent = `${valor}/${estadoTorreArmas.maximo}`;

    if (progresso) {
        progresso.style.width = `${porcentagem}%`;
        progresso.classList.toggle("critico", porcentagem <= 35);
        progresso.classList.toggle("alerta", porcentagem > 35 && porcentagem < 70);
    }

    if (barra) {
        barra.setAttribute("aria-valuemin", "0");
        barra.setAttribute("aria-valuemax", String(estadoTorreArmas.maximo));
        barra.setAttribute("aria-valuenow", String(valor));
    }

    if (ultimo) {
        ultimo.textContent = estadoTorreArmas.ultimoDisparo
            ? `Último disparo por ${estadoTorreArmas.ultimoUsuarioNome}.`
            : "Nenhum disparo registrado.";
    }

    if (botao) {
        botao.disabled = disparandoTorre || valor <= 0;
        botao.innerHTML = valor <= 0
            ? "<span>×</span><strong>INTEGRIDADE INSUFICIENTE</strong>"
            : "<span>◎</span><strong>DISPARAR TORRE DE ARMAS</strong>";
    }
}

async function dispararTorreArmas() {
    if (disparandoTorre || !torreDesbloqueada || !senhaTorreTemporaria) return;

    disparandoTorre = true;
    const botao = document.getElementById("btn-disparar-torre");

    if (botao) {
        botao.disabled = true;
        botao.innerHTML = "<span>◌</span><strong>EFETUANDO DISPARO...</strong>";
    }

    try {
        const { data, error } = await supabaseClient.rpc(
            "disparar_torre_armas",
            { p_senha: senhaTorreTemporaria }
        );

        if (error) throw error;

        if (data) {
            estadoTorreArmas = normalizarEstadoTorreArmas(data);
        }

        if (data?.sucesso) {
            if (typeof mostrarNotificacao === "function") {
                mostrarNotificacao(
                    `Disparo confirmado. Integridade: ${data.valor}/${data.maximo}.`,
                    "success"
                );
            }
        } else if (data?.codigo === "sem_integridade") {
            if (typeof mostrarNotificacao === "function") {
                mostrarNotificacao("A nave está sem integridade para disparar.", "error");
            }
        } else {
            throw new Error("Resposta inesperada do sistema de armamento.");
        }
    } catch (erro) {
        console.error("Erro ao disparar a Torre de Armas:", erro);

        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("O disparo não pôde ser confirmado.", "error");
        }
    } finally {
        disparandoTorre = false;
        bloquearTorreArmas();
    }
}

function bloquearTorreArmas() {
    senhaTorreTemporaria = "";
    torreDesbloqueada = false;

    const bloqueio = document.getElementById("torre-bloqueio");
    const controle = document.getElementById("torre-controle");

    if (bloqueio) bloqueio.hidden = false;
    if (controle) controle.hidden = true;

    atualizarStatusSenhaTorre(
        "Digite a senha novamente para autorizar outro disparo.",
        ""
    );
    limparInputSenhaTorre(true);
}

function encerrarAcessoTorreArmas() {
    senhaTorreTemporaria = "";
    torreDesbloqueada = false;
    validandoSenhaTorre = false;
}

function limparInputSenhaTorre(focar) {
    const input = document.getElementById("senha-torre");
    if (!input) return;

    input.value = "";
    if (focar) requestAnimationFrame(() => input.focus());
}

function atualizarStatusSenhaTorre(mensagem, tipo) {
    const status = document.getElementById("torre-senha-status");
    if (!status) return;

    status.textContent = mensagem;
    status.className = tipo || "";
}

function iniciarSincronizacaoTorreArmas() {
    if (canalTorreArmas) return;

    canalTorreArmas = supabaseClient
        .channel("torre-armas-integridade-global")
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "nave_integridade",
                filter: "id=eq.1"
            },
            payload => {
                estadoTorreArmas = normalizarEstadoTorreArmas(payload.new);

                if (paginaAtual === "torre" && torreDesbloqueada) {
                    renderizarEstadoTorreArmas();
                }
            }
        )
        .subscribe();
}

document.addEventListener("usuarioAutenticado", () => {
    encerrarAcessoTorreArmas();
    estadoTorreArmas = null;
});
