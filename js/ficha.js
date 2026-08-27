// ======================================
// FICHA.JS
// Ficha de atributos de cada tripulante — Nave 3B
// ======================================

let minhaFicha = null;
let fichasEquipe = [];
let carregandoFicha = false;
let salvandoFicha = false;
let canalFichas = null;
let fichaAlterada = false;

// ======================================
// TELA
// ======================================

function telaFicha() {
    return `
        <section class="ficha-pagina">

            <div class="ficha-card ficha-propria">
                <div class="ficha-cabecalho">
                    <div>
                        <span class="ficha-selo">FICHA DE COMBATE</span>
                        <h2 id="ficha-nome-tripulante">Carregando...</h2>
                    </div>
                    <div class="ficha-icone" aria-hidden="true">🧬</div>
                </div>

                <div id="ficha-status" class="ficha-status carregando">
                    <span class="ficha-status-icone">◌</span>
                    <div>
                        <strong id="ficha-status-titulo">Sincronizando com a nave...</strong>
                        <span id="ficha-status-detalhe">Aguarde a confirmação do servidor.</span>
                    </div>
                </div>

                <div class="ficha-grade" id="ficha-grade-atributos">
                    ${campoAtributo("vida", "❤️ Vida", 0)}
                    ${campoAtributo("dano_extra", "⚔️ Dano Extra", 0)}
                    ${campoAtributo("agilidade", "💨 Agilidade", 0)}
                    ${campoAtributo("defesa", "🛡️ Defesa", 0)}
                    ${campoAtributo("salva_vidas", "🩹 Salva-Vidas", 0)}
                </div>

                <label class="ficha-itens-label" for="ficha-itens-texto">
                    🎒 Itens e Cartas
                </label>
                <textarea
                    id="ficha-itens-texto"
                    class="ficha-itens-texto"
                    rows="5"
                    placeholder="Descreva os itens, cartas e passivas que você possui..."></textarea>

                <button id="btn-salvar-ficha" class="btn-salvar-ficha" type="button" disabled>
                    <span>💾</span>
                    <strong>SALVAR FICHA</strong>
                </button>
            </div>

            <div class="ficha-equipe">
                <h3>Tripulação</h3>
                <div id="ficha-lista-equipe" class="ficha-lista-equipe">
                    <p class="ficha-equipe-vazio">Carregando dados da tripulação...</p>
                </div>
            </div>

        </section>
    `;
}

function campoAtributo(chave, rotulo, valorInicial) {
    return `
        <div class="ficha-atributo">
            <label for="ficha-campo-${chave}">${rotulo}</label>
            <input
                id="ficha-campo-${chave}"
                type="number"
                min="0"
                step="0.1"
                inputmode="decimal"
                data-atributo="${chave}"
                value="${valorInicial}">
        </div>
    `;
}

// ======================================
// INICIALIZAÇÃO DA PÁGINA
// ======================================

function inicializarPaginaFicha() {
    fichaAlterada = false;

    const botaoSalvar = document.getElementById("btn-salvar-ficha");
    if (botaoSalvar) {
        botaoSalvar.addEventListener("click", salvarMinhaFicha);
    }

    document
        .querySelectorAll("[data-atributo], #ficha-itens-texto")
        .forEach(campo => {
            campo.addEventListener("input", marcarFichaComoAlterada);
        });

    carregarMinhaFicha();
    carregarFichasEquipe();
    iniciarSincronizacaoFichas();
}

// ======================================
// CARREGAR MINHA FICHA
// ======================================

async function carregarMinhaFicha() {
    if (carregandoFicha) return;
    if (!window.usuarioAtual) return;

    carregandoFicha = true;

    atualizarStatusFicha(
        "carregando",
        "Sincronizando com a nave...",
        "Aguarde a confirmação do servidor.",
        "◌"
    );

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, itens_texto, atualizado_em")
            .eq("id", window.usuarioAtual.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error("Ficha não encontrada para este usuário.");
        }

        minhaFicha = data;
        renderizarMinhaFicha();

        atualizarStatusFicha(
            "disponivel",
            "Ficha sincronizada",
            "Os dados abaixo refletem o que está salvo na nave.",
            "●"
        );

        const botaoSalvar = document.getElementById("btn-salvar-ficha");
        if (botaoSalvar) botaoSalvar.disabled = false;

    } catch (erro) {
        console.error("Erro ao carregar ficha:", erro);

        atualizarStatusFicha(
            "erro",
            "Comunicação indisponível",
            "Não foi possível consultar sua ficha agora.",
            "⚠"
        );

    } finally {
        carregandoFicha = false;
    }
}

function renderizarMinhaFicha() {
    if (!minhaFicha) return;

    const nomeTitulo = document.getElementById("ficha-nome-tripulante");
    if (nomeTitulo) {
        nomeTitulo.textContent =
            window.profileAtual?.nome
            || window.profileAtual?.username
            || "Tripulante";
    }

    ["vida", "dano_extra", "agilidade", "defesa", "salva_vidas"].forEach(chave => {
        const campo = document.getElementById(`ficha-campo-${chave}`);
        if (campo) campo.value = minhaFicha[chave] ?? 0;
    });

    const itens = document.getElementById("ficha-itens-texto");
    if (itens) itens.value = minhaFicha.itens_texto ?? "";

    fichaAlterada = false;
}

function marcarFichaComoAlterada() {
    fichaAlterada = true;

    atualizarStatusFicha(
        "alterada",
        "Alterações não salvas",
        "Clique em SALVAR FICHA para enviar os novos valores.",
        "●"
    );
}

// ======================================
// SALVAR MINHA FICHA
// ======================================

async function salvarMinhaFicha() {
    if (salvandoFicha) return;
    if (!window.usuarioAtual) return;

    salvandoFicha = true;

    const botaoSalvar = document.getElementById("btn-salvar-ficha");
    if (botaoSalvar) {
        botaoSalvar.disabled = true;
        botaoSalvar.innerHTML = "<span>◌</span><strong>SALVANDO...</strong>";
    }

    const atualizacao = {
        vida: lerCampoNumerico("vida"),
        dano_extra: lerCampoNumerico("dano_extra"),
        agilidade: lerCampoNumerico("agilidade"),
        defesa: lerCampoNumerico("defesa"),
        salva_vidas: lerCampoNumerico("salva_vidas"),
        itens_texto: document.getElementById("ficha-itens-texto")?.value?.trim() || "",
        atualizado_em: new Date().toISOString()
    };

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .update(atualizacao)
            .eq("id", window.usuarioAtual.id)
            .select()
            .single();

        if (error) throw error;

        minhaFicha = data;
        fichaAlterada = false;

        atualizarStatusFicha(
            "disponivel",
            "Ficha salva",
            "Os novos valores foram confirmados pelo servidor.",
            "●"
        );

        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Ficha salva com sucesso!", "success");
        }

    } catch (erro) {
        console.error("Erro ao salvar ficha:", erro);

        atualizarStatusFicha(
            "erro",
            "Falha ao salvar",
            "Suas alterações continuam na tela. Tente novamente.",
            "⚠"
        );

        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Não foi possível salvar a ficha agora.", "error");
        }

    } finally {
        salvandoFicha = false;

        if (botaoSalvar) {
            botaoSalvar.disabled = false;
            botaoSalvar.innerHTML = "<span>💾</span><strong>SALVAR FICHA</strong>";
        }
    }
}

function lerCampoNumerico(chave) {
    const campo = document.getElementById(`ficha-campo-${chave}`);
    const valor = Number(campo?.value);
    return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

// ======================================
// FICHAS DA TRIPULAÇÃO (SOMENTE LEITURA)
// ======================================

async function carregarFichasEquipe() {
    const lista = document.getElementById("ficha-lista-equipe");

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, profiles(nome, username, cargo)")
            .order("id");

        if (error) throw error;

        fichasEquipe = data || [];
        renderizarFichasEquipe();

    } catch (erro) {
        console.error("Erro ao carregar tripulação:", erro);

        if (lista) {
            lista.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar a tripulação.</p>`;
        }
    }
}

function renderizarFichasEquipe() {
    const lista = document.getElementById("ficha-lista-equipe");
    if (!lista) return;

    if (!fichasEquipe.length) {
        lista.innerHTML = `<p class="ficha-equipe-vazio">Nenhum tripulante encontrado ainda.</p>`;
        return;
    }

    lista.innerHTML = fichasEquipe.map(ficha => {
        const nome =
            ficha.profiles?.nome
            || ficha.profiles?.username
            || "Tripulante";

        const destaque = ficha.id === window.usuarioAtual?.id ? " ficha-equipe-item-eu" : "";

        return `
            <div class="ficha-equipe-item${destaque}">
                <strong>${escaparTextoFicha(nome)}</strong>
                <div class="ficha-equipe-atributos">
                    <span>❤️ ${ficha.vida}</span>
                    <span>⚔️ ${ficha.dano_extra}</span>
                    <span>💨 ${ficha.agilidade}</span>
                    <span>🛡️ ${ficha.defesa}</span>
                    <span>🩹 ${ficha.salva_vidas}</span>
                </div>
            </div>
        `;
    }).join("");
}

// ======================================
// SINCRONIZAÇÃO EM TEMPO REAL
// ======================================

function iniciarSincronizacaoFichas() {
    if (canalFichas) return;

    canalFichas = supabaseClient
        .channel("fichas-tripulantes-global")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "fichas_tripulantes"
            },
            payload => {
                if (paginaAtual === "ficha") {
                    carregarFichasEquipe();

                    const idAlterado = payload.new?.id || payload.old?.id;
                    const alterouMinhaFicha =
                        idAlterado === window.usuarioAtual?.id;

                    if (
                        alterouMinhaFicha
                        && !fichaAlterada
                        && !salvandoFicha
                    ) {
                        carregarMinhaFicha();
                    }
                }
            }
        )
        .subscribe();
}

// ======================================
// STATUS
// ======================================

function atualizarStatusFicha(tipo, titulo, detalhe, icone) {
    const caixa = document.getElementById("ficha-status");
    const elementoTitulo = document.getElementById("ficha-status-titulo");
    const elementoDetalhe = document.getElementById("ficha-status-detalhe");
    const elementoIcone = document.querySelector(".ficha-status-icone");

    if (!caixa) return;

    caixa.className = `ficha-status ${tipo}`;
    if (elementoTitulo) elementoTitulo.textContent = titulo;
    if (elementoDetalhe) elementoDetalhe.textContent = detalhe;
    if (elementoIcone) elementoIcone.textContent = icone;
}

function escaparTextoFicha(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

document.addEventListener("usuarioAutenticado", () => {
    minhaFicha = null;
    fichaAlterada = false;

    if (paginaAtual === "ficha") {
        carregarMinhaFicha();
    }
});
