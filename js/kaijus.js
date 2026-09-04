// ======================================
// REGISTRO DE KAIJUS — NAVE 3B
// Catálogo colaborativo da tripulação
// ======================================

const KAIJU_BUCKET = "kaijus-registros";

let registrosKaijus = [];
let carregandoKaijus = false;
let salvandoKaiju = false;
let canalKaijus = null;
let arquivoKaijuPendente = null;
let arquivoKaijuPreviewUrl = "";
let kaijuEmEdicaoId = null;

function telaRegistroKaijus() {
    return `
        <section class="kaiju-registro-pagina">
            <div class="kaiju-registro-topo">
                <div>
                    <span class="kaiju-registro-selo">ARQUIVO BIOLÓGICO COMPARTILHADO</span>
                    <h2>Registro de Kaijus</h2>
                    <p>
                        Toda a tripulação pode cadastrar novas criaturas e completar
                        as informações já descobertas pela nave.
                    </p>
                </div>
                <button id="btn-novo-kaiju" class="kaiju-btn-principal" type="button">
                    <span>＋</span> NOVO KAIJU
                </button>
            </div>

            <div class="kaiju-registro-resumo">
                <div><span>REGISTRADOS</span><strong id="kaiju-total-registros">0</strong></div>
                <div><span>ATIVOS</span><strong id="kaiju-total-ativos">0</strong></div>
                <div><span>DERROTADOS</span><strong id="kaiju-total-derrotados">0</strong></div>
            </div>

            <div class="kaiju-registro-ferramentas">
                <label for="kaiju-busca">⌕</label>
                <input id="kaiju-busca" type="search" placeholder="Buscar kaiju pelo nome, ameaça ou descrição...">
            </div>

            <div id="kaiju-registro-status" class="kaiju-registro-status">
                Sincronizando o arquivo biológico...
            </div>

            <div id="kaiju-registro-lista" class="kaiju-registro-lista">
                <p class="kaiju-registro-vazio">Carregando registros...</p>
            </div>

            <div id="kaiju-form-overlay" class="kaiju-modal-overlay" hidden>
                <div class="kaiju-modal" role="dialog" aria-modal="true" aria-labelledby="kaiju-modal-titulo">
                    <div class="kaiju-modal-cabecalho">
                        <div>
                            <span>ARQUIVO KAIJU</span>
                            <h3 id="kaiju-modal-titulo">Novo registro</h3>
                        </div>
                        <button id="btn-fechar-kaiju" class="kaiju-modal-fechar" type="button" aria-label="Fechar">×</button>
                    </div>

                    <form id="kaiju-formulario">
                        <div class="kaiju-form-grid">
                            <div class="kaiju-imagem-coluna">
                                <div id="kaiju-imagem-preview" class="kaiju-imagem-preview">
                                    <div><span>🐲</span><small>SEM IMAGEM</small></div>
                                </div>
                                <label class="kaiju-upload" for="kaiju-imagem-arquivo">
                                    <input id="kaiju-imagem-arquivo" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
                                    <span>▣</span> SELECIONAR IMAGEM
                                </label>
                                <small>PNG, JPG, WEBP ou GIF — até 5 MB</small>
                            </div>

                            <div class="kaiju-campos">
                                <label>Nome do kaiju
                                    <input id="kaiju-nome" type="text" maxlength="80" required placeholder="Ex.: Rei Verdejante">
                                </label>

                                <div class="kaiju-campos-linha">
                                    <label>Vida
                                        <input id="kaiju-vida" type="number" min="0" step="1" value="0">
                                    </label>
                                    <label>Agilidade
                                        <input id="kaiju-agilidade" type="number" min="0" step="1" value="0">
                                    </label>
                                    <label>Defesa
                                        <input id="kaiju-defesa" type="number" min="0" step="1" value="0">
                                    </label>
                                </div>

                                <div class="kaiju-campos-linha kaiju-campos-linha-2">
                                    <label>Nível de ameaça
                                        <select id="kaiju-ameaca">
                                            <option value="Desconhecido">Desconhecido</option>
                                            <option value="Baixo">Baixo</option>
                                            <option value="Médio">Médio</option>
                                            <option value="Alto">Alto</option>
                                            <option value="Extremo">Extremo</option>
                                        </select>
                                    </label>
                                    <label>Situação atual
                                        <select id="kaiju-status-campo">
                                            <option value="DESCONHECIDO">Desconhecido</option>
                                            <option value="ATIVO">Ativo</option>
                                            <option value="DERROTADO">Derrotado</option>
                                        </select>
                                    </label>
                                </div>

                                <label>Descrição e aparência
                                    <textarea id="kaiju-descricao" rows="3" maxlength="1800" placeholder="Aparência, origem, comportamento e outras descobertas..."></textarea>
                                </label>
                                <label>Ataques
                                    <textarea id="kaiju-ataques" rows="4" maxlength="3000" placeholder="Liste os ataques, danos e efeitos conhecidos..."></textarea>
                                </label>
                                <label>Habilidades e passivas
                                    <textarea id="kaiju-habilidades" rows="3" maxlength="2400" placeholder="Registre habilidades especiais e passivas..."></textarea>
                                </label>
                                <label>Fraquezas
                                    <textarea id="kaiju-fraquezas" rows="2" maxlength="1600" placeholder="Fraquezas ou estratégias que funcionaram..."></textarea>
                                </label>
                            </div>
                        </div>

                        <button id="btn-salvar-kaiju" class="kaiju-btn-salvar" type="submit">
                            <span>💾</span> SALVAR REGISTRO
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;
}

function inicializarPaginaKaijus() {
    document.getElementById("btn-novo-kaiju")
        ?.addEventListener("click", () => abrirFormularioKaiju());

    document.getElementById("btn-fechar-kaiju")
        ?.addEventListener("click", fecharFormularioKaiju);

    document.getElementById("kaiju-form-overlay")
        ?.addEventListener("click", evento => {
            if (evento.target === evento.currentTarget) fecharFormularioKaiju();
        });

    document.getElementById("kaiju-formulario")
        ?.addEventListener("submit", salvarRegistroKaiju);

    document.getElementById("kaiju-imagem-arquivo")
        ?.addEventListener("change", selecionarImagemKaiju);

    document.getElementById("kaiju-busca")
        ?.addEventListener("input", renderizarRegistrosKaijus);

    carregarRegistrosKaijus();
    iniciarSincronizacaoKaijus();
}

async function carregarRegistrosKaijus(silencioso = false) {
    if (carregandoKaijus || !window.usuarioAtual) return;
    carregandoKaijus = true;

    if (!silencioso) atualizarStatusRegistroKaiju("Sincronizando o arquivo biológico...", "carregando");

    try {
        const { data, error } = await supabaseClient
            .from("mecha_kaijus_catalogo")
            .select("id, nome, ordem, vida, agilidade, defesa, nivel_ameaca, status, descricao, ataques, habilidades, fraquezas, imagem_path, criado_em, atualizado_em")
            .order("ordem", { ascending: true });

        if (error) throw error;

        registrosKaijus = data || [];
        renderizarRegistrosKaijus();
        atualizarResumoKaijus();
        atualizarStatusRegistroKaiju("Arquivo sincronizado. Clique em um registro para visualizar ou editar.", "disponivel");
    } catch (erro) {
        console.error("Erro ao carregar kaijus:", erro);
        atualizarStatusRegistroKaiju("Não foi possível carregar os kaijus. Execute o novo SQL no Supabase.", "erro");
        const lista = document.getElementById("kaiju-registro-lista");
        if (lista) lista.innerHTML = `<p class="kaiju-registro-vazio">Banco de Kaijus indisponível.</p>`;
    } finally {
        carregandoKaijus = false;
    }
}

function renderizarRegistrosKaijus() {
    const lista = document.getElementById("kaiju-registro-lista");
    if (!lista) return;

    const busca = normalizarBuscaKaiju(document.getElementById("kaiju-busca")?.value);
    const filtrados = registrosKaijus.filter(kaiju => {
        if (!busca) return true;
        return normalizarBuscaKaiju([
            kaiju.nome,
            kaiju.nivel_ameaca,
            kaiju.status,
            kaiju.descricao,
            kaiju.ataques
        ].join(" ")).includes(busca);
    });

    if (!filtrados.length) {
        lista.innerHTML = `<p class="kaiju-registro-vazio">${registrosKaijus.length ? "Nenhum registro corresponde à busca." : "Nenhum kaiju registrado. Crie o primeiro arquivo da nave."}</p>`;
        return;
    }

    lista.innerHTML = filtrados.map(kaiju => {
        const imagem = obterUrlPublicaKaiju(kaiju.imagem_path);
        const status = kaiju.status || "DESCONHECIDO";

        return `
            <article class="kaiju-registro-card" data-kaiju-editar="${escaparAtributoKaiju(kaiju.id)}" tabindex="0">
                <div class="kaiju-registro-card-imagem">
                    ${imagem
                        ? `<img src="${escaparAtributoKaiju(imagem)}" alt="${escaparAtributoKaiju(kaiju.nome)}">`
                        : `<div class="kaiju-sem-imagem">🐲</div>`}
                    <span class="kaiju-status-etiqueta status-${status.toLowerCase()}">${escaparTextoKaiju(status)}</span>
                </div>
                <div class="kaiju-registro-card-corpo">
                    <span class="kaiju-registro-numero">REGISTRO ${String(kaiju.ordem || 0).padStart(3, "0")}</span>
                    <h3>${escaparTextoKaiju(kaiju.nome)}</h3>
                    <p>${escaparTextoKaiju(kaiju.descricao || "Nenhuma descrição registrada.")}</p>
                    <div class="kaiju-registro-atributos">
                        <span>♥ <strong>${numeroKaiju(kaiju.vida)}</strong> VIDA</span>
                        <span>» <strong>${numeroKaiju(kaiju.agilidade)}</strong> AGI</span>
                        <span>⬡ <strong>${numeroKaiju(kaiju.defesa)}</strong> DEF</span>
                    </div>
                    <div class="kaiju-registro-card-rodape">
                        <small>AMEAÇA: ${escaparTextoKaiju(kaiju.nivel_ameaca || "Desconhecido")}</small>
                        <strong>VER / EDITAR →</strong>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    lista.querySelectorAll("[data-kaiju-editar]").forEach(card => {
        const abrir = () => abrirFormularioKaiju(card.dataset.kaijuEditar);
        card.addEventListener("click", abrir);
        card.addEventListener("keydown", evento => {
            if (evento.key === "Enter" || evento.key === " ") {
                evento.preventDefault();
                abrir();
            }
        });
    });
}

function atualizarResumoKaijus() {
    definirTextoKaiju("kaiju-total-registros", registrosKaijus.length);
    definirTextoKaiju("kaiju-total-ativos", registrosKaijus.filter(item => item.status === "ATIVO").length);
    definirTextoKaiju("kaiju-total-derrotados", registrosKaijus.filter(item => item.status === "DERROTADO").length);
}

function abrirFormularioKaiju(id = null) {
    kaijuEmEdicaoId = id;
    const registro = registrosKaijus.find(item => item.id === id) || null;
    const overlay = document.getElementById("kaiju-form-overlay");
    if (!overlay) return;

    limparImagemPendenteKaiju();
    document.getElementById("kaiju-formulario")?.reset();
    definirTextoKaiju("kaiju-modal-titulo", registro ? `Editar ${registro.nome}` : "Novo registro");

    definirValorKaiju("kaiju-nome", registro?.nome || "");
    definirValorKaiju("kaiju-vida", registro?.vida ?? 0);
    definirValorKaiju("kaiju-agilidade", registro?.agilidade ?? 0);
    definirValorKaiju("kaiju-defesa", registro?.defesa ?? 0);
    definirValorKaiju("kaiju-ameaca", registro?.nivel_ameaca || "Desconhecido");
    definirValorKaiju("kaiju-status-campo", registro?.status || "DESCONHECIDO");
    definirValorKaiju("kaiju-descricao", registro?.descricao || "");
    definirValorKaiju("kaiju-ataques", registro?.ataques || "");
    definirValorKaiju("kaiju-habilidades", registro?.habilidades || "");
    definirValorKaiju("kaiju-fraquezas", registro?.fraquezas || "");

    renderizarPreviewImagemKaiju(registro?.imagem_path || null);
    overlay.hidden = false;
    document.body.classList.add("modal-aberto");
    setTimeout(() => document.getElementById("kaiju-nome")?.focus(), 30);
}

function fecharFormularioKaiju() {
    const overlay = document.getElementById("kaiju-form-overlay");
    if (overlay) overlay.hidden = true;
    document.body.classList.remove("modal-aberto");
    kaijuEmEdicaoId = null;
    limparImagemPendenteKaiju();
}

function selecionarImagemKaiju(evento) {
    const arquivo = evento.currentTarget.files?.[0];
    if (!arquivo) return;

    const tipos = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!tipos.includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        evento.currentTarget.value = "";
        notificarKaiju("Use uma imagem PNG, JPG, WEBP ou GIF de até 5 MB.", "error");
        return;
    }

    limparImagemPendenteKaiju();
    arquivoKaijuPendente = arquivo;
    arquivoKaijuPreviewUrl = URL.createObjectURL(arquivo);
    renderizarPreviewImagemKaiju(null, arquivoKaijuPreviewUrl);
}

function renderizarPreviewImagemKaiju(caminho, previewTemporario = "") {
    const preview = document.getElementById("kaiju-imagem-preview");
    if (!preview) return;
    const url = previewTemporario || obterUrlPublicaKaiju(caminho);

    preview.innerHTML = url
        ? `<img src="${escaparAtributoKaiju(url)}" alt="Prévia do kaiju">`
        : `<div><span>🐲</span><small>SEM IMAGEM</small></div>`;
}

async function salvarRegistroKaiju(evento) {
    evento.preventDefault();
    if (salvandoKaiju || !window.usuarioAtual) return;

    const nome = document.getElementById("kaiju-nome")?.value?.trim();
    if (!nome) return;

    salvandoKaiju = true;
    const botao = document.getElementById("btn-salvar-kaiju");
    if (botao) {
        botao.disabled = true;
        botao.innerHTML = "<span>◌</span> SALVANDO...";
    }

    try {
        const registroAnterior = registrosKaijus.find(item => item.id === kaijuEmEdicaoId);
        const id = kaijuEmEdicaoId || gerarIdKaiju(nome);
        const imagemPath = arquivoKaijuPendente
            ? await enviarImagemKaiju(id)
            : registroAnterior?.imagem_path || null;

        const dados = {
            id,
            nome,
            vida: lerNumeroKaiju("kaiju-vida"),
            agilidade: lerNumeroKaiju("kaiju-agilidade"),
            defesa: lerNumeroKaiju("kaiju-defesa"),
            nivel_ameaca: document.getElementById("kaiju-ameaca")?.value || "Desconhecido",
            status: document.getElementById("kaiju-status-campo")?.value || "DESCONHECIDO",
            descricao: document.getElementById("kaiju-descricao")?.value?.trim() || "",
            ataques: document.getElementById("kaiju-ataques")?.value?.trim() || "",
            habilidades: document.getElementById("kaiju-habilidades")?.value?.trim() || "",
            fraquezas: document.getElementById("kaiju-fraquezas")?.value?.trim() || "",
            imagem_path: imagemPath,
            atualizado_por: window.usuarioAtual.id,
            atualizado_em: new Date().toISOString()
        };

        const { error } = await supabaseClient
            .from("mecha_kaijus_catalogo")
            .upsert(dados, { onConflict: "id" });

        if (error) throw error;

        fecharFormularioKaiju();
        await carregarRegistrosKaijus(true);
        notificarKaiju("Registro de Kaiju salvo com sucesso!", "success");
    } catch (erro) {
        console.error("Erro ao salvar kaiju:", erro);
        notificarKaiju("Não foi possível salvar o registro do Kaiju.", "error");
    } finally {
        salvandoKaiju = false;
        if (botao) {
            botao.disabled = false;
            botao.innerHTML = "<span>💾</span> SALVAR REGISTRO";
        }
    }
}

async function enviarImagemKaiju(kaijuId) {
    const extensaoOriginal = arquivoKaijuPendente.name.split(".").pop()?.toLowerCase();
    const extensao = ["png", "jpg", "jpeg", "webp", "gif"].includes(extensaoOriginal)
        ? extensaoOriginal
        : "png";
    const caminho = `${kaijuId}/registro-${Date.now()}.${extensao}`;

    const { error } = await supabaseClient.storage
        .from(KAIJU_BUCKET)
        .upload(caminho, arquivoKaijuPendente, {
            cacheControl: "3600",
            upsert: false,
            contentType: arquivoKaijuPendente.type
        });

    if (error) throw error;
    return caminho;
}

function abrirDetalhesKaiju(registro) {
    document.getElementById("kaiju-detalhes-global")?.remove();
    const imagem = obterUrlPublicaKaiju(registro?.imagem_path);
    const overlay = document.createElement("div");
    overlay.id = "kaiju-detalhes-global";
    overlay.className = "kaiju-modal-overlay kaiju-detalhes-overlay";
    overlay.innerHTML = `
        <article class="kaiju-detalhes-modal" role="dialog" aria-modal="true">
            <button class="kaiju-modal-fechar" data-fechar-detalhes-kaiju type="button" aria-label="Fechar">×</button>
            <div class="kaiju-detalhes-hero">
                ${imagem
                    ? `<img src="${escaparAtributoKaiju(imagem)}" alt="${escaparAtributoKaiju(registro?.nome || "Kaiju")}">`
                    : `<div class="kaiju-sem-imagem">🐲</div>`}
                <div>
                    <span>ARQUIVO BIOLÓGICO</span>
                    <h2>${escaparTextoKaiju(registro?.nome || "Kaiju")}</h2>
                    <p>AMEAÇA ${escaparTextoKaiju(registro?.nivel_ameaca || "DESCONHECIDA")} · ${escaparTextoKaiju(registro?.status || "DESCONHECIDO")}</p>
                </div>
            </div>
            <div class="kaiju-detalhes-atributos">
                <div><small>VIDA</small><strong>${numeroKaiju(registro?.vida)}</strong></div>
                <div><small>AGILIDADE</small><strong>${numeroKaiju(registro?.agilidade)}</strong></div>
                <div><small>DEFESA</small><strong>${numeroKaiju(registro?.defesa)}</strong></div>
            </div>
            ${blocoDetalheKaiju("DESCRIÇÃO", registro?.descricao)}
            ${blocoDetalheKaiju("ATAQUES", registro?.ataques)}
            ${blocoDetalheKaiju("HABILIDADES E PASSIVAS", registro?.habilidades)}
            ${blocoDetalheKaiju("FRAQUEZAS", registro?.fraquezas)}
        </article>
    `;

    const fechar = () => {
        overlay.remove();
        document.body.classList.remove("modal-aberto");
    };
    overlay.addEventListener("click", evento => {
        if (evento.target === overlay || evento.target.closest("[data-fechar-detalhes-kaiju]")) fechar();
    });
    document.body.appendChild(overlay);
    document.body.classList.add("modal-aberto");
}

function blocoDetalheKaiju(tituloBloco, conteudoBloco) {
    return `
        <section class="kaiju-detalhes-bloco">
            <h3>${tituloBloco}</h3>
            <p>${escaparTextoKaiju(conteudoBloco || "Não registrado.")}</p>
        </section>
    `;
}

function iniciarSincronizacaoKaijus() {
    if (canalKaijus) return;
    canalKaijus = supabaseClient
        .channel("registro-kaijus-global")
        .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "mecha_kaijus_catalogo"
        }, () => {
            if (typeof paginaAtual !== "undefined" && paginaAtual === "kaijus") {
                carregarRegistrosKaijus(true);
            }
        })
        .subscribe();
}

function obterUrlPublicaKaiju(caminho) {
    if (!caminho) return "";
    const { data } = supabaseClient.storage.from(KAIJU_BUCKET).getPublicUrl(caminho);
    return data?.publicUrl || "";
}

function gerarIdKaiju(nome) {
    const slug = String(nome)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 45) || "kaiju";
    const sufixo = typeof crypto?.randomUUID === "function"
        ? crypto.randomUUID().slice(0, 8)
        : Date.now().toString(36);
    return `${slug}-${sufixo}`;
}

function limparImagemPendenteKaiju() {
    if (arquivoKaijuPreviewUrl) URL.revokeObjectURL(arquivoKaijuPreviewUrl);
    arquivoKaijuPendente = null;
    arquivoKaijuPreviewUrl = "";
}

function atualizarStatusRegistroKaiju(texto, tipo) {
    const elemento = document.getElementById("kaiju-registro-status");
    if (!elemento) return;
    elemento.textContent = texto;
    elemento.className = `kaiju-registro-status ${tipo}`;
}

function definirTextoKaiju(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function definirValorKaiju(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = valor;
}

function lerNumeroKaiju(id) {
    const valor = Number(document.getElementById(id)?.value);
    return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

function numeroKaiju(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
}

function normalizarBuscaKaiju(valor) {
    return String(valor || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function notificarKaiju(mensagem, tipo) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao(mensagem, tipo);
}

function escaparTextoKaiju(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributoKaiju(valor) {
    return escaparTextoKaiju(valor);
}

document.addEventListener("usuarioAutenticado", () => {
    if (typeof paginaAtual !== "undefined" && paginaAtual === "kaijus") {
        carregarRegistrosKaijus();
    }
});
