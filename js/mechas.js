// ======================================
// DESENVOLVIMENTO DE MECHAS — NAVE 3B
// Mecha individual de 20 metros
// ======================================

const MECHA_VIDA_BASE = 10;
const MECHA_BUCKET = "mechas-designs";
const MECHA_SLOTS = [
    { id: "cabeca", nome: "Cabeça", icone: "◉" },
    { id: "torso", nome: "Torso", icone: "⬡" },
    { id: "braco_esquerdo", nome: "Braço Esquerdo", icone: "◀" },
    { id: "braco_direito", nome: "Braço Direito", icone: "▶" },
    { id: "perna_esquerda", nome: "Perna Esquerda", icone: "◢" },
    { id: "perna_direita", nome: "Perna Direita", icone: "◣" }
];

let mechaAtual = null;
let catalogoKaijusMecha = [];
let catalogoPecasMecha = [];
let kaijusDerrotadosMecha = new Set();
let pecasEquipadasMecha = {};
let imagemMechaPendente = null;
let imagemMechaPendenteUrl = "";
let imagemMechaUrl = "";
let carregandoMecha = false;
let salvandoMecha = false;
let mechaAlterado = false;
let canalMecha = null;

function telaMechas() {
    return `
        <section class="mecha-pagina">
            <div class="mecha-topo">
                <div>
                    <span class="mecha-selo">PROJETO TITÃ — UNIDADE INDIVIDUAL</span>
                    <h2>Desenvolvimento de Mechas</h2>
                    <p>
                        Construa seu mecha de 20 metros com materiais dos kaijus que
                        você derrotou. Cada peça modifica vida, ataque, defesa,
                        agilidade e libera uma passiva.
                    </p>
                </div>
                <div class="mecha-altura">
                    <strong>20</strong>
                    <span>METROS</span>
                </div>
            </div>

            <div id="mecha-status" class="mecha-status carregando">
                <span class="mecha-status-icone">◌</span>
                <div>
                    <strong id="mecha-status-titulo">Sincronizando hangar...</strong>
                    <span id="mecha-status-detalhe">Carregando seu projeto individual.</span>
                </div>
            </div>

            <div class="mecha-layout">
                <div class="mecha-coluna-principal">
                    <article class="mecha-painel mecha-identidade">
                        <div class="mecha-painel-titulo">
                            <div>
                                <span>01</span>
                                <h3>Identidade e Design</h3>
                            </div>
                            <small id="mecha-piloto-nome">PILOTO: --</small>
                        </div>

                        <div class="mecha-design-grid">
                            <div id="mecha-imagem-preview" class="mecha-imagem-preview">
                                <div class="mecha-imagem-vazia">
                                    <span>◇</span>
                                    <strong>DESIGN NÃO ENVIADO</strong>
                                    <small>PNG, JPG, WEBP ou GIF — até 5 MB</small>
                                </div>
                            </div>

                            <div class="mecha-formulario">
                                <label for="mecha-nome">Nome do mecha</label>
                                <input id="mecha-nome" type="text" maxlength="60" placeholder="Ex.: Aegis Verdejante">

                                <label for="mecha-descricao">Notas do projeto</label>
                                <textarea id="mecha-descricao" rows="5" maxlength="1200" placeholder="Descreva o visual, as cores e o estilo de combate..."></textarea>

                                <label class="mecha-upload" for="mecha-arquivo-imagem">
                                    <input id="mecha-arquivo-imagem" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
                                    <span>▣</span>
                                    <strong>ADICIONAR IMAGEM DO DESIGN</strong>
                                </label>
                                <small id="mecha-arquivo-nome" class="mecha-arquivo-nome">Nenhuma nova imagem selecionada.</small>
                            </div>
                        </div>
                    </article>

                    <article class="mecha-painel">
                        <div class="mecha-painel-titulo">
                            <div>
                                <span>02</span>
                                <h3>Kaijus Derrotados</h3>
                            </div>
                            <small>SELECIONE APENAS OS QUE VOCÊ DERROTOU</small>
                        </div>
                        <div id="mecha-lista-kaijus" class="mecha-lista-kaijus">
                            <p class="mecha-vazio">Carregando registros de batalha...</p>
                        </div>
                    </article>

                    <article class="mecha-painel">
                        <div class="mecha-painel-titulo">
                            <div>
                                <span>03</span>
                                <h3>Montagem das Peças</h3>
                            </div>
                            <small id="mecha-contador-pecas">0/6 EQUIPADAS</small>
                        </div>
                        <div id="mecha-slots" class="mecha-slots">
                            <p class="mecha-vazio">Selecione um kaiju derrotado para desbloquear peças.</p>
                        </div>
                    </article>
                </div>

                <aside class="mecha-resumo">
                    <div class="mecha-resumo-sticky">
                        <span class="mecha-resumo-selo">CONFIGURAÇÃO ATUAL</span>
                        <h3 id="mecha-resumo-nome">MECHA 20M</h3>
                        <p>Vida base do chassi: <strong>10</strong></p>

                        <div class="mecha-atributos">
                            <div><span>♥</span><small>VIDA</small><strong id="mecha-total-vida">10</strong></div>
                            <div><span>⚔</span><small>ATAQUE</small><strong id="mecha-total-ataque">0</strong></div>
                            <div><span>⬡</span><small>DEFESA</small><strong id="mecha-total-defesa">0</strong></div>
                            <div><span>»</span><small>AGILIDADE</small><strong id="mecha-total-agilidade">0</strong></div>
                        </div>

                        <div class="mecha-passivas-cabecalho">
                            <span>PASSIVAS ATIVAS</span>
                            <strong id="mecha-total-passivas">0</strong>
                        </div>
                        <div id="mecha-lista-passivas" class="mecha-lista-passivas">
                            <p>Nenhuma peça equipada.</p>
                        </div>

                        <button id="btn-salvar-mecha" class="btn-salvar-mecha" type="button" disabled>
                            <span>◆</span>
                            <strong>SALVAR MECHA</strong>
                        </button>
                        <small class="mecha-salvamento-aviso">
                            O projeto fica vinculado somente à sua conta.
                        </small>
                    </div>
                </aside>
            </div>
        </section>
    `;
}

function inicializarPaginaMechas() {
    limparImagemMechaPendente();
    mechaAlterado = false;

    document.getElementById("btn-salvar-mecha")
        ?.addEventListener("click", salvarDesenvolvimentoMecha);

    document.getElementById("mecha-nome")
        ?.addEventListener("input", () => {
            renderizarResumoMecha();
            marcarMechaAlterado();
        });

    document.getElementById("mecha-descricao")
        ?.addEventListener("input", marcarMechaAlterado);

    document.getElementById("mecha-arquivo-imagem")
        ?.addEventListener("change", selecionarImagemMecha);

    carregarDesenvolvimentoMecha();
    iniciarSincronizacaoMecha();
}

async function carregarDesenvolvimentoMecha(silencioso = false) {
    if (carregandoMecha || !window.usuarioAtual) return;
    carregandoMecha = true;

    if (!silencioso) {
        atualizarStatusMecha(
            "carregando",
            "Sincronizando hangar...",
            "Carregando seu projeto individual.",
            "◌"
        );
    }

    try {
        const usuarioId = window.usuarioAtual.id;
        const [kaijus, pecas, mecha, derrotados, equipadas] = await Promise.all([
            supabaseClient.from("mecha_kaijus_catalogo").select("id, nome, ordem").order("ordem"),
            supabaseClient.from("mecha_pecas_catalogo").select("id, kaiju_id, slot, nome, vida, ataque, defesa, agilidade, passiva, descricao"),
            supabaseClient.from("mechas_20m").select("usuario_id, nome, vida_base, descricao, imagem_path, atualizado_em").eq("usuario_id", usuarioId).maybeSingle(),
            supabaseClient.from("mecha_kaijus_derrotados").select("kaiju_id").eq("usuario_id", usuarioId),
            supabaseClient.from("mecha_pecas_equipadas").select("slot, peca_id").eq("usuario_id", usuarioId)
        ]);

        [kaijus, pecas, mecha, derrotados, equipadas].forEach(resultado => {
            if (resultado.error) throw resultado.error;
        });

        catalogoKaijusMecha = kaijus.data || [];
        catalogoPecasMecha = pecas.data || [];
        mechaAtual = mecha.data || {
            usuario_id: usuarioId,
            nome: "MECHA 20M",
            vida_base: MECHA_VIDA_BASE,
            descricao: "",
            imagem_path: null
        };
        kaijusDerrotadosMecha = new Set(
            (derrotados.data || []).map(item => item.kaiju_id)
        );
        pecasEquipadasMecha = {};
        (equipadas.data || []).forEach(item => {
            pecasEquipadasMecha[item.slot] = item.peca_id;
        });

        imagemMechaUrl = await obterUrlImagemMecha(mechaAtual.imagem_path);
        renderizarDesenvolvimentoMecha();
        mechaAlterado = false;

        const botao = document.getElementById("btn-salvar-mecha");
        if (botao) botao.disabled = false;

        atualizarStatusMecha(
            "disponivel",
            "Hangar sincronizado",
            "Selecione os kaijus e monte a sua configuração.",
            "●"
        );
    } catch (erro) {
        console.error("Erro ao carregar o desenvolvimento do mecha:", erro);
        atualizarStatusMecha(
            "erro",
            "Hangar indisponível",
            "Execute o SQL de Desenvolvimento de Mechas e tente novamente.",
            "⚠"
        );
    } finally {
        carregandoMecha = false;
    }
}

async function obterUrlImagemMecha(caminho) {
    if (!caminho) return "";

    const { data, error } = await supabaseClient.storage
        .from(MECHA_BUCKET)
        .createSignedUrl(caminho, 3600);

    if (error) {
        console.warn("Não foi possível assinar a imagem do mecha:", error);
        return "";
    }

    return data?.signedUrl || "";
}

function renderizarDesenvolvimentoMecha() {
    const nome = document.getElementById("mecha-nome");
    const descricao = document.getElementById("mecha-descricao");
    const piloto = document.getElementById("mecha-piloto-nome");

    if (nome) nome.value = mechaAtual?.nome || "MECHA 20M";
    if (descricao) descricao.value = mechaAtual?.descricao || "";
    if (piloto) {
        const nomePiloto = window.profileAtual?.nome
            || window.profileAtual?.username
            || "Tripulante";
        piloto.textContent = `PILOTO: ${String(nomePiloto).toUpperCase()}`;
    }

    renderizarImagemMecha();
    renderizarKaijusMecha();
    renderizarSlotsMecha();
    renderizarResumoMecha();
}

function renderizarImagemMecha() {
    const preview = document.getElementById("mecha-imagem-preview");
    if (!preview) return;

    const url = imagemMechaPendenteUrl || imagemMechaUrl;

    preview.innerHTML = url
        ? `<img src="${escaparAtributoMecha(url)}" alt="Design do mecha do tripulante">`
        : `
            <div class="mecha-imagem-vazia">
                <span>◇</span>
                <strong>DESIGN NÃO ENVIADO</strong>
                <small>PNG, JPG, WEBP ou GIF — até 5 MB</small>
            </div>
        `;
}

function renderizarKaijusMecha() {
    const lista = document.getElementById("mecha-lista-kaijus");
    if (!lista) return;

    lista.innerHTML = catalogoKaijusMecha.map((kaiju, indice) => {
        const selecionado = kaijusDerrotadosMecha.has(kaiju.id);
        return `
            <label class="mecha-kaiju${selecionado ? " selecionado" : ""}">
                <input type="checkbox" data-mecha-kaiju="${escaparAtributoMecha(kaiju.id)}" ${selecionado ? "checked" : ""}>
                <span class="mecha-kaiju-numero">0${indice + 1}</span>
                <div>
                    <strong>${escaparTextoMecha(kaiju.nome)}</strong>
                    <small>${selecionado ? "PEÇAS DESBLOQUEADAS" : "NÃO REGISTRADO"}</small>
                </div>
                <i>${selecionado ? "✓" : "+"}</i>
            </label>
        `;
    }).join("");

    lista.querySelectorAll("[data-mecha-kaiju]").forEach(campo => {
        campo.addEventListener("change", alterarKaijuDerrotadoMecha);
    });
}

function alterarKaijuDerrotadoMecha(evento) {
    const kaijuId = evento.currentTarget.dataset.mechaKaiju;

    if (evento.currentTarget.checked) {
        kaijusDerrotadosMecha.add(kaijuId);
    } else {
        kaijusDerrotadosMecha.delete(kaijuId);

        Object.keys(pecasEquipadasMecha).forEach(slot => {
            const peca = obterPecaMecha(pecasEquipadasMecha[slot]);
            if (peca?.kaiju_id === kaijuId) delete pecasEquipadasMecha[slot];
        });
    }

    renderizarKaijusMecha();
    renderizarSlotsMecha();
    renderizarResumoMecha();
    marcarMechaAlterado();
}

function renderizarSlotsMecha() {
    const container = document.getElementById("mecha-slots");
    if (!container) return;

    if (!kaijusDerrotadosMecha.size) {
        container.innerHTML = `<p class="mecha-vazio">Selecione um kaiju derrotado para desbloquear peças.</p>`;
        atualizarContadorPecasMecha();
        return;
    }

    container.innerHTML = MECHA_SLOTS.map(slot => {
        const disponiveis = catalogoPecasMecha.filter(peca =>
            peca.slot === slot.id && kaijusDerrotadosMecha.has(peca.kaiju_id)
        );
        const selecionadaId = pecasEquipadasMecha[slot.id] || "";
        const selecionada = obterPecaMecha(selecionadaId);

        const opcoes = disponiveis.map(peca => {
            const kaiju = catalogoKaijusMecha.find(item => item.id === peca.kaiju_id);
            return `
                <option value="${escaparAtributoMecha(peca.id)}" ${peca.id === selecionadaId ? "selected" : ""}>
                    ${escaparTextoMecha(peca.nome)} — ${escaparTextoMecha(kaiju?.nome || "Kaiju")}
                </option>
            `;
        }).join("");

        return `
            <div class="mecha-slot${selecionada ? " equipado" : ""}">
                <div class="mecha-slot-icone">${slot.icone}</div>
                <div class="mecha-slot-conteudo">
                    <label for="mecha-slot-${slot.id}">${slot.nome}</label>
                    <select id="mecha-slot-${slot.id}" data-mecha-slot="${slot.id}">
                        <option value="">Sem peça equipada</option>
                        ${opcoes}
                    </select>
                    ${selecionada ? renderizarDetalhePecaMecha(selecionada) : ""}
                </div>
            </div>
        `;
    }).join("");

    container.querySelectorAll("[data-mecha-slot]").forEach(campo => {
        campo.addEventListener("change", evento => {
            const slot = evento.currentTarget.dataset.mechaSlot;
            const valor = evento.currentTarget.value;

            if (valor) pecasEquipadasMecha[slot] = valor;
            else delete pecasEquipadasMecha[slot];

            renderizarSlotsMecha();
            renderizarResumoMecha();
            marcarMechaAlterado();
        });
    });

    atualizarContadorPecasMecha();
}

function renderizarDetalhePecaMecha(peca) {
    return `
        <div class="mecha-peca-detalhe">
            <div>
                <span>♥ +${peca.vida}</span>
                <span>⚔ +${peca.ataque}</span>
                <span>⬡ +${peca.defesa}</span>
                <span>» +${peca.agilidade}</span>
            </div>
            <p>${escaparTextoMecha(peca.descricao)}</p>
        </div>
    `;
}

function atualizarContadorPecasMecha() {
    const contador = document.getElementById("mecha-contador-pecas");
    const total = MECHA_SLOTS.filter(slot => pecasEquipadasMecha[slot.id]).length;
    if (contador) contador.textContent = `${total}/6 EQUIPADAS`;
}

function renderizarResumoMecha() {
    const pecas = MECHA_SLOTS
        .map(slot => obterPecaMecha(pecasEquipadasMecha[slot.id]))
        .filter(Boolean);

    const totais = pecas.reduce((resultado, peca) => ({
        vida: resultado.vida + Number(peca.vida || 0),
        ataque: resultado.ataque + Number(peca.ataque || 0),
        defesa: resultado.defesa + Number(peca.defesa || 0),
        agilidade: resultado.agilidade + Number(peca.agilidade || 0)
    }), { vida: MECHA_VIDA_BASE, ataque: 0, defesa: 0, agilidade: 0 });

    const nome = document.getElementById("mecha-nome")?.value?.trim() || "MECHA 20M";
    definirTextoMecha("mecha-resumo-nome", nome);
    definirTextoMecha("mecha-total-vida", totais.vida);
    definirTextoMecha("mecha-total-ataque", totais.ataque);
    definirTextoMecha("mecha-total-defesa", totais.defesa);
    definirTextoMecha("mecha-total-agilidade", totais.agilidade);
    definirTextoMecha("mecha-total-passivas", pecas.length);

    const passivas = document.getElementById("mecha-lista-passivas");
    if (passivas) {
        passivas.innerHTML = pecas.length
            ? pecas.map(peca => `
                <div class="mecha-passiva">
                    <strong>${escaparTextoMecha(peca.nome)}</strong>
                    <p>${escaparTextoMecha(peca.passiva)}</p>
                </div>
            `).join("")
            : `<p>Nenhuma peça equipada.</p>`;
    }

    atualizarContadorPecasMecha();
}

function obterPecaMecha(id) {
    return catalogoPecasMecha.find(peca => peca.id === id) || null;
}

function selecionarImagemMecha(evento) {
    const arquivo = evento.currentTarget.files?.[0];
    const nomeArquivo = document.getElementById("mecha-arquivo-nome");
    if (!arquivo) return;

    const tiposPermitidos = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        evento.currentTarget.value = "";
        mostrarAvisoMecha("Use uma imagem PNG, JPG, WEBP ou GIF de até 5 MB.", "error");
        return;
    }

    limparImagemMechaPendente();
    imagemMechaPendente = arquivo;
    imagemMechaPendenteUrl = URL.createObjectURL(arquivo);
    if (nomeArquivo) nomeArquivo.textContent = arquivo.name;

    renderizarImagemMecha();
    marcarMechaAlterado();
}

function limparImagemMechaPendente() {
    if (imagemMechaPendenteUrl) URL.revokeObjectURL(imagemMechaPendenteUrl);
    imagemMechaPendente = null;
    imagemMechaPendenteUrl = "";
}

async function enviarImagemMecha() {
    if (!imagemMechaPendente || !window.usuarioAtual) {
        return mechaAtual?.imagem_path || null;
    }

    const extensaoOriginal = imagemMechaPendente.name.split(".").pop()?.toLowerCase();
    const extensao = ["png", "jpg", "jpeg", "webp", "gif"].includes(extensaoOriginal)
        ? extensaoOriginal
        : "png";
    const caminho = `${window.usuarioAtual.id}/design-${Date.now()}.${extensao}`;

    const { error } = await supabaseClient.storage
        .from(MECHA_BUCKET)
        .upload(caminho, imagemMechaPendente, {
            cacheControl: "3600",
            upsert: false,
            contentType: imagemMechaPendente.type
        });

    if (error) throw error;
    return caminho;
}

async function salvarDesenvolvimentoMecha() {
    if (salvandoMecha || !window.usuarioAtual) return;
    salvandoMecha = true;

    const botao = document.getElementById("btn-salvar-mecha");
    if (botao) {
        botao.disabled = true;
        botao.innerHTML = "<span>◌</span><strong>SALVANDO PROJETO...</strong>";
    }

    atualizarStatusMecha(
        "salvando",
        "Transferindo projeto...",
        "Aguarde a confirmação do hangar.",
        "◌"
    );

    try {
        const imagemPath = await enviarImagemMecha();
        const nome = document.getElementById("mecha-nome")?.value?.trim() || "MECHA 20M";
        const descricao = document.getElementById("mecha-descricao")?.value?.trim() || "";
        const pecas = {};
        MECHA_SLOTS.forEach(slot => {
            pecas[slot.id] = pecasEquipadasMecha[slot.id] || null;
        });

        const { data, error } = await supabaseClient.rpc(
            "salvar_desenvolvimento_mecha",
            {
                p_nome: nome,
                p_descricao: descricao,
                p_imagem_path: imagemPath,
                p_kaijus: Array.from(kaijusDerrotadosMecha),
                p_pecas: pecas
            }
        );

        if (error) throw error;
        if (!data?.sucesso) throw new Error("O hangar não confirmou o salvamento.");

        mechaAtual = {
            ...mechaAtual,
            nome,
            descricao,
            imagem_path: imagemPath,
            vida_base: MECHA_VIDA_BASE,
            atualizado_em: data.atualizado_em
        };

        if (imagemMechaPendente) {
            imagemMechaUrl = await obterUrlImagemMecha(imagemPath);
            limparImagemMechaPendente();
            renderizarImagemMecha();
            const nomeArquivo = document.getElementById("mecha-arquivo-nome");
            if (nomeArquivo) nomeArquivo.textContent = "Imagem salva no hangar.";
        }

        mechaAlterado = false;
        atualizarStatusMecha(
            "disponivel",
            "Projeto salvo",
            "Sua configuração individual foi confirmada.",
            "✓"
        );
        mostrarAvisoMecha("Mecha salvo com sucesso!", "success");
    } catch (erro) {
        console.error("Erro ao salvar o mecha:", erro);
        atualizarStatusMecha(
            "erro",
            "Falha ao salvar",
            "Suas escolhas continuam na tela. Tente novamente.",
            "⚠"
        );
        mostrarAvisoMecha("Não foi possível salvar o mecha agora.", "error");
    } finally {
        salvandoMecha = false;
        if (botao) {
            botao.disabled = false;
            botao.innerHTML = "<span>◆</span><strong>SALVAR MECHA</strong>";
        }
    }
}

function marcarMechaAlterado() {
    if (carregandoMecha || salvandoMecha) return;
    mechaAlterado = true;
    atualizarStatusMecha(
        "alterado",
        "Alterações não salvas",
        "Clique em SALVAR MECHA para registrar a configuração.",
        "●"
    );
}

function atualizarStatusMecha(tipo, tituloStatus, detalhe, icone) {
    const status = document.getElementById("mecha-status");
    if (!status) return;

    status.className = `mecha-status ${tipo}`;
    definirTextoMecha("mecha-status-titulo", tituloStatus);
    definirTextoMecha("mecha-status-detalhe", detalhe);

    const elementoIcone = status.querySelector(".mecha-status-icone");
    if (elementoIcone) elementoIcone.textContent = icone;
}

function iniciarSincronizacaoMecha() {
    if (canalMecha || !window.usuarioAtual) return;

    canalMecha = supabaseClient
        .channel(`mecha-individual-${window.usuarioAtual.id}`)
        .on(
            "postgres_changes",
            {
                event: "UPDATE",
                schema: "public",
                table: "mechas_20m",
                filter: `usuario_id=eq.${window.usuarioAtual.id}`
            },
            () => {
                if (paginaAtual === "mechas" && !mechaAlterado && !salvandoMecha) {
                    carregarDesenvolvimentoMecha(true);
                }
            }
        )
        .subscribe();
}

function definirTextoMecha(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor);
}

function mostrarAvisoMecha(mensagem, tipo) {
    if (typeof mostrarNotificacao === "function") {
        mostrarNotificacao(mensagem, tipo);
    }
}

function escaparTextoMecha(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributoMecha(valor) {
    return escaparTextoMecha(valor);
}

document.addEventListener("usuarioAutenticado", () => {
    mechaAtual = null;
    catalogoKaijusMecha = [];
    catalogoPecasMecha = [];
    kaijusDerrotadosMecha = new Set();
    pecasEquipadasMecha = {};
    limparImagemMechaPendente();

    if (canalMecha) {
        supabaseClient.removeChannel(canalMecha);
        canalMecha = null;
    }

    if (paginaAtual === "mechas") carregarDesenvolvimentoMecha();
});

