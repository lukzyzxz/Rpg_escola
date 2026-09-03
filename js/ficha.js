// ======================================
// FICHA DO TRIPULANTE — NAVE 3B
// Atributos, imagens, missões e Kaijus derrotados
// ======================================

const PERSONAGEM_BUCKET = "personagens-fichas";

let minhaFicha = null;
let fichasEquipe = [];
let minhasMissoes = [];
let catalogoKaijusFicha = [];
let kaijusDerrotadosFicha = new Set();
let carregandoFicha = false;
let salvandoFicha = false;
let canalFichas = null;
let fichaAlterada = false;
let missaoEmEdicaoId = null;
let salvandoMissao = false;
let salvandoDerrotados = false;
let imagensPersonagem = {
    frente: { arquivo: null, preview: "", url: "" },
    verso: { arquivo: null, preview: "", url: "" }
};

function telaFicha() {
    return `
        <section class="ficha-pagina">
            <div class="ficha-conteudo-principal">
                <article class="ficha-card ficha-propria">
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

                    <div class="ficha-secao-cabecalho">
                        <div><span>01</span><h3>Visual do personagem</h3></div>
                        <small>FRENTE E VERSO</small>
                    </div>
                    <div class="ficha-imagens-grid">
                        ${slotImagemPersonagem("frente", "FRENTE")}
                        ${slotImagemPersonagem("verso", "VERSO")}
                    </div>

                    <div class="ficha-secao-cabecalho">
                        <div><span>02</span><h3>Níveis por missão</h3></div>
                        <small id="ficha-total-missoes-nivel">0 MISSÕES</small>
                    </div>
                    <div class="ficha-niveis">
                        <div><span>🤝</span><small>EMBAIXADOR</small><strong id="ficha-nivel-embaixador">0</strong></div>
                        <div><span>⚔</span><small>COMBATENTE</small><strong id="ficha-nivel-combatente">0</strong></div>
                        <div><span>🚀</span><small>TRIPULANTE</small><strong id="ficha-nivel-tripulante">0</strong></div>
                    </div>

                    <div class="ficha-secao-cabecalho">
                        <div><span>03</span><h3>Atributos e equipamento</h3></div>
                    </div>
                    <div class="ficha-grade" id="ficha-grade-atributos">
                        ${campoAtributo("vida", "❤️ Vida", 0)}
                        ${campoAtributo("dano_extra", "⚔️ Dano Extra", 0)}
                        ${campoAtributo("agilidade", "💨 Agilidade", 0)}
                        ${campoAtributo("defesa", "🛡️ Defesa", 0)}
                        ${campoAtributo("salva_vidas", "🩹 Salva-Vidas", 0)}
                    </div>
                    <label class="ficha-itens-label" for="ficha-itens-texto">🎒 Itens e Cartas</label>
                    <textarea id="ficha-itens-texto" class="ficha-itens-texto" rows="5"
                        placeholder="Descreva os itens, cartas e passivas que você possui..."></textarea>
                    <button id="btn-salvar-ficha" class="btn-salvar-ficha" type="button" disabled>
                        <span>💾</span><strong>SALVAR FICHA</strong>
                    </button>
                </article>

                <article class="ficha-card ficha-painel-secundario">
                    <div class="ficha-secao-cabecalho ficha-secao-com-acao">
                        <div><span>04</span><h3>Missões realizadas</h3></div>
                        <button id="btn-nova-missao-ficha" class="ficha-btn-acao" type="button">＋ REGISTRAR MISSÃO</button>
                    </div>
                    <div id="ficha-resumo-missoes" class="ficha-resumo-missoes"></div>
                    <div id="ficha-lista-missoes" class="ficha-lista-missoes">
                        <p class="ficha-equipe-vazio">Carregando seu histórico...</p>
                    </div>
                </article>

                <article class="ficha-card ficha-painel-secundario">
                    <div class="ficha-secao-cabecalho ficha-secao-com-acao">
                        <div><span>05</span><h3>Kaijus derrotados</h3></div>
                        <button id="btn-selecionar-kaijus-ficha" class="ficha-btn-acao" type="button">＋ SELECIONAR KAIJUS</button>
                    </div>
                    <p class="ficha-ajuda">Clique em um Kaiju selecionado para abrir todas as informações do registro.</p>
                    <div id="ficha-kaijus-derrotados" class="ficha-kaijus-derrotados">
                        <p class="ficha-equipe-vazio">Carregando registros de combate...</p>
                    </div>
                </article>
            </div>

            <aside class="ficha-equipe">
                <h3>Tripulação</h3>
                <div id="ficha-lista-equipe" class="ficha-lista-equipe">
                    <p class="ficha-equipe-vazio">Carregando dados da tripulação...</p>
                </div>
            </aside>

            ${modalMissaoFicha()}
            ${modalKaijusFicha()}
        </section>
    `;
}

function slotImagemPersonagem(lado, tituloImagem) {
    return `
        <div class="ficha-imagem-card">
            <div id="ficha-imagem-${lado}" class="ficha-imagem-preview">
                <div class="ficha-imagem-vazia"><span>◇</span><strong>${tituloImagem}</strong><small>SEM IMAGEM</small></div>
            </div>
            <label for="ficha-arquivo-${lado}" class="ficha-upload">
                <input id="ficha-arquivo-${lado}" type="file" accept="image/png,image/jpeg,image/webp,image/gif">
                <span>▣</span> ADICIONAR ${tituloImagem}
            </label>
            <small id="ficha-arquivo-nome-${lado}">PNG, JPG, WEBP ou GIF — até 5 MB</small>
        </div>
    `;
}

function modalMissaoFicha() {
    return `
        <div id="ficha-missao-overlay" class="ficha-modal-overlay" hidden>
            <div class="ficha-modal" role="dialog" aria-modal="true" aria-labelledby="ficha-missao-titulo-modal">
                <div class="ficha-modal-cabecalho">
                    <div><span>HISTÓRICO PESSOAL</span><h3 id="ficha-missao-titulo-modal">Registrar missão</h3></div>
                    <button type="button" class="ficha-modal-fechar" data-fechar-modal-ficha>×</button>
                </div>
                <form id="ficha-missao-form">
                    <label>Nome da missão
                        <input id="ficha-missao-nome" type="text" maxlength="120" required placeholder="Ex.: Reconhecimento no planeta Verdejante">
                    </label>
                    <div class="ficha-missao-linha">
                        <label>Categoria
                            <select id="ficha-missao-tipo">
                                <option value="embaixador">Embaixador</option>
                                <option value="combatente">Combatente</option>
                                <option value="tripulante">Tripulante</option>
                            </select>
                        </label>
                        <label>Data<input id="ficha-missao-data" type="date"></label>
                    </div>
                    <label>Relatório da missão
                        <textarea id="ficha-missao-descricao" rows="5" maxlength="2200" placeholder="O que aconteceu, qual foi seu papel e qual foi o resultado..."></textarea>
                    </label>
                    <button id="btn-salvar-missao-ficha" class="btn-salvar-ficha" type="submit">
                        <span>💾</span><strong>SALVAR MISSÃO</strong>
                    </button>
                </form>
            </div>
        </div>
    `;
}

function modalKaijusFicha() {
    return `
        <div id="ficha-kaijus-overlay" class="ficha-modal-overlay" hidden>
            <div class="ficha-modal ficha-modal-kaijus" role="dialog" aria-modal="true" aria-labelledby="ficha-kaijus-titulo-modal">
                <div class="ficha-modal-cabecalho">
                    <div><span>REGISTRO DE COMBATE</span><h3 id="ficha-kaijus-titulo-modal">Selecionar Kaijus derrotados</h3></div>
                    <button type="button" class="ficha-modal-fechar" data-fechar-modal-ficha>×</button>
                </div>
                <p class="ficha-ajuda">Marque todos os Kaijus que você já derrotou.</p>
                <div id="ficha-kaijus-opcoes" class="ficha-kaijus-opcoes"></div>
                <button id="btn-salvar-kaijus-ficha" class="btn-salvar-ficha" type="button">
                    <span>💾</span><strong>SALVAR SELEÇÃO</strong>
                </button>
            </div>
        </div>
    `;
}

function campoAtributo(chave, rotulo, valorInicial) {
    return `
        <div class="ficha-atributo">
            <label for="ficha-campo-${chave}">${rotulo}</label>
            <input id="ficha-campo-${chave}" type="number" min="0" step="0.1"
                inputmode="decimal" data-atributo="${chave}" value="${valorInicial}">
        </div>
    `;
}

function inicializarPaginaFicha() {
    fichaAlterada = false;
    limparTodasImagensPersonagemPendentes();
    document.getElementById("btn-salvar-ficha")?.addEventListener("click", salvarMinhaFicha);
    document.getElementById("btn-nova-missao-ficha")?.addEventListener("click", () => abrirModalMissaoFicha());
    document.getElementById("btn-selecionar-kaijus-ficha")?.addEventListener("click", abrirModalKaijusDerrotados);
    document.getElementById("btn-salvar-kaijus-ficha")?.addEventListener("click", salvarKaijusDerrotadosFicha);
    document.getElementById("ficha-missao-form")?.addEventListener("submit", salvarMissaoFicha);

    document.querySelectorAll("[data-fechar-modal-ficha]").forEach(botao => botao.addEventListener("click", fecharModaisFicha));
    document.querySelectorAll(".ficha-modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", evento => {
            if (evento.target === overlay) fecharModaisFicha();
        });
    });
    document.querySelectorAll("[data-atributo], #ficha-itens-texto").forEach(campo => campo.addEventListener("input", marcarFichaComoAlterada));
    ["frente", "verso"].forEach(lado => {
        document.getElementById(`ficha-arquivo-${lado}`)?.addEventListener("change", evento => selecionarImagemPersonagem(evento, lado));
    });

    carregarMinhaFicha();
    carregarFichasEquipe();
    carregarMissoesFicha();
    carregarKaijusFicha();
    iniciarSincronizacaoFichas();
}

async function carregarMinhaFicha(silencioso = false) {
    if (carregandoFicha || !window.usuarioAtual) return;
    carregandoFicha = true;
    if (!silencioso) atualizarStatusFicha("carregando", "Sincronizando com a nave...", "Aguarde a confirmação do servidor.", "◌");

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, itens_texto, nivel_embaixador, nivel_combatente, nivel_tripulante, personagem_frente_path, personagem_verso_path, atualizado_em")
            .eq("id", window.usuarioAtual.id)
            .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Ficha não encontrada para este usuário.");

        minhaFicha = data;
        const [urlFrente, urlVerso] = await Promise.all([
            obterUrlImagemPersonagem(data.personagem_frente_path),
            obterUrlImagemPersonagem(data.personagem_verso_path)
        ]);
        imagensPersonagem.frente.url = urlFrente;
        imagensPersonagem.verso.url = urlVerso;
        renderizarMinhaFicha();
        atualizarStatusFicha("disponivel", "Ficha sincronizada", "Seus atributos, imagens e históricos estão salvos na nave.", "●");
        const botaoSalvar = document.getElementById("btn-salvar-ficha");
        if (botaoSalvar) botaoSalvar.disabled = false;
    } catch (erro) {
        console.error("Erro ao carregar ficha:", erro);
        atualizarStatusFicha("erro", "Comunicação indisponível", "Execute o novo SQL e tente novamente.", "⚠");
    } finally {
        carregandoFicha = false;
    }
}

function renderizarMinhaFicha() {
    if (!minhaFicha) return;
    definirTextoFicha("ficha-nome-tripulante", window.profileAtual?.nome || window.profileAtual?.username || "Tripulante");
    ["vida", "dano_extra", "agilidade", "defesa", "salva_vidas"].forEach(chave => {
        const campo = document.getElementById(`ficha-campo-${chave}`);
        if (campo) campo.value = minhaFicha[chave] ?? 0;
    });
    const itens = document.getElementById("ficha-itens-texto");
    if (itens) itens.value = minhaFicha.itens_texto ?? "";
    renderizarNiveisFicha();
    renderizarImagemPersonagem("frente");
    renderizarImagemPersonagem("verso");
    fichaAlterada = false;
}

function renderizarNiveisFicha() {
    const embaixador = Number(minhaFicha?.nivel_embaixador || 0);
    const combatente = Number(minhaFicha?.nivel_combatente || 0);
    const tripulante = Number(minhaFicha?.nivel_tripulante || 0);
    definirTextoFicha("ficha-nivel-embaixador", embaixador);
    definirTextoFicha("ficha-nivel-combatente", combatente);
    definirTextoFicha("ficha-nivel-tripulante", tripulante);
    definirTextoFicha("ficha-total-missoes-nivel", `${embaixador + combatente + tripulante} MISSÕES`);
    renderizarResumoMissoesFicha();
}

function marcarFichaComoAlterada() {
    fichaAlterada = true;
    atualizarStatusFicha("alterada", "Alterações não salvas", "Clique em SALVAR FICHA para enviar os novos dados.", "●");
}

function selecionarImagemPersonagem(evento, lado) {
    const arquivo = evento.currentTarget.files?.[0];
    if (!arquivo) return;
    const permitidos = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!permitidos.includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        evento.currentTarget.value = "";
        notificarFicha("Use uma imagem PNG, JPG, WEBP ou GIF de até 5 MB.", "error");
        return;
    }
    limparImagemPersonagemPendente(lado);
    imagensPersonagem[lado].arquivo = arquivo;
    imagensPersonagem[lado].preview = URL.createObjectURL(arquivo);
    definirTextoFicha(`ficha-arquivo-nome-${lado}`, arquivo.name);
    renderizarImagemPersonagem(lado);
    marcarFichaComoAlterada();
}

function renderizarImagemPersonagem(lado) {
    const preview = document.getElementById(`ficha-imagem-${lado}`);
    if (!preview) return;
    const url = imagensPersonagem[lado].preview || imagensPersonagem[lado].url;
    const tituloImagem = lado === "frente" ? "FRENTE" : "VERSO";
    preview.innerHTML = url
        ? `<img src="${escaparAtributoFicha(url)}" alt="Personagem visto de ${lado}">`
        : `<div class="ficha-imagem-vazia"><span>◇</span><strong>${tituloImagem}</strong><small>SEM IMAGEM</small></div>`;
}

async function obterUrlImagemPersonagem(caminho) {
    if (!caminho) return "";
    const { data, error } = await supabaseClient.storage.from(PERSONAGEM_BUCKET).createSignedUrl(caminho, 3600);
    if (error) return "";
    return data?.signedUrl || "";
}

async function enviarImagemPersonagem(lado) {
    const item = imagensPersonagem[lado];
    if (!item.arquivo || !window.usuarioAtual) return minhaFicha?.[`personagem_${lado}_path`] || null;
    const extensaoOriginal = item.arquivo.name.split(".").pop()?.toLowerCase();
    const extensao = ["png", "jpg", "jpeg", "webp", "gif"].includes(extensaoOriginal) ? extensaoOriginal : "png";
    const caminho = `${window.usuarioAtual.id}/${lado}-${Date.now()}.${extensao}`;
    const { error } = await supabaseClient.storage.from(PERSONAGEM_BUCKET).upload(caminho, item.arquivo, {
        cacheControl: "3600", upsert: false, contentType: item.arquivo.type
    });
    if (error) throw error;
    return caminho;
}

async function salvarMinhaFicha() {
    if (salvandoFicha || !window.usuarioAtual) return;
    salvandoFicha = true;
    const botaoSalvar = document.getElementById("btn-salvar-ficha");
    if (botaoSalvar) {
        botaoSalvar.disabled = true;
        botaoSalvar.innerHTML = "<span>◌</span><strong>SALVANDO...</strong>";
    }

    try {
        const [frentePath, versoPath] = await Promise.all([enviarImagemPersonagem("frente"), enviarImagemPersonagem("verso")]);
        const atualizacao = {
            vida: lerCampoNumerico("vida"), dano_extra: lerCampoNumerico("dano_extra"),
            agilidade: lerCampoNumerico("agilidade"), defesa: lerCampoNumerico("defesa"),
            salva_vidas: lerCampoNumerico("salva_vidas"),
            itens_texto: document.getElementById("ficha-itens-texto")?.value?.trim() || "",
            personagem_frente_path: frentePath, personagem_verso_path: versoPath,
            atualizado_em: new Date().toISOString()
        };
        const { data, error } = await supabaseClient.from("fichas_tripulantes")
            .update(atualizacao).eq("id", window.usuarioAtual.id).select().single();
        if (error) throw error;

        minhaFicha = data;
        limparTodasImagensPersonagemPendentes();
        imagensPersonagem.frente.url = await obterUrlImagemPersonagem(data.personagem_frente_path);
        imagensPersonagem.verso.url = await obterUrlImagemPersonagem(data.personagem_verso_path);
        fichaAlterada = false;
        renderizarImagemPersonagem("frente");
        renderizarImagemPersonagem("verso");
        atualizarStatusFicha("disponivel", "Ficha salva", "Os novos dados foram confirmados pelo servidor.", "●");
        notificarFicha("Ficha salva com sucesso!", "success");
    } catch (erro) {
        console.error("Erro ao salvar ficha:", erro);
        atualizarStatusFicha("erro", "Falha ao salvar", "Suas alterações continuam na tela. Tente novamente.", "⚠");
        notificarFicha("Não foi possível salvar a ficha agora.", "error");
    } finally {
        salvandoFicha = false;
        if (botaoSalvar) {
            botaoSalvar.disabled = false;
            botaoSalvar.innerHTML = "<span>💾</span><strong>SALVAR FICHA</strong>";
        }
    }
}

async function carregarMissoesFicha() {
    if (!window.usuarioAtual) return;
    try {
        const { data, error } = await supabaseClient.from("missoes_tripulantes")
            .select("id, titulo, tipo, data_missao, descricao, criado_em, atualizado_em")
            .eq("usuario_id", window.usuarioAtual.id)
            .order("data_missao", { ascending: false }).order("criado_em", { ascending: false });
        if (error) throw error;
        minhasMissoes = data || [];
        renderizarMissoesFicha();
        renderizarResumoMissoesFicha();
    } catch (erro) {
        console.error("Erro ao carregar missões da ficha:", erro);
        const lista = document.getElementById("ficha-lista-missoes");
        if (lista) lista.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar o histórico de missões.</p>`;
    }
}

function renderizarResumoMissoesFicha() {
    const resumo = document.getElementById("ficha-resumo-missoes");
    if (!resumo) return;
    const totalNivel = Number(minhaFicha?.nivel_embaixador || 0) + Number(minhaFicha?.nivel_combatente || 0) + Number(minhaFicha?.nivel_tripulante || 0);
    resumo.innerHTML = `<div><span>TOTAL CONCLUÍDO</span><strong>${totalNivel}</strong></div>
        <div><span>REGISTROS DETALHADOS</span><strong>${minhasMissoes.length}</strong></div>`;
}

function renderizarMissoesFicha() {
    const lista = document.getElementById("ficha-lista-missoes");
    if (!lista) return;
    if (!minhasMissoes.length) {
        lista.innerHTML = `<p class="ficha-equipe-vazio">Você ainda não registrou os detalhes das suas missões.</p>`;
        return;
    }
    lista.innerHTML = minhasMissoes.map(missao => `
        <article class="ficha-missao-item">
            <div class="ficha-missao-icone tipo-${escaparAtributoFicha(missao.tipo)}">${iconeTipoMissao(missao.tipo)}</div>
            <div class="ficha-missao-conteudo">
                <span>${rotuloTipoMissao(missao.tipo)} · ${formatarDataFicha(missao.data_missao)}</span>
                <h4>${escaparTextoFicha(missao.titulo)}</h4>
                ${missao.descricao ? `<p>${escaparTextoFicha(missao.descricao)}</p>` : ""}
            </div>
            <div class="ficha-missao-acoes">
                <button type="button" data-editar-missao="${escaparAtributoFicha(missao.id)}" title="Editar missão">✎</button>
                <button type="button" data-excluir-missao="${escaparAtributoFicha(missao.id)}" title="Excluir missão">×</button>
            </div>
        </article>`).join("");
    lista.querySelectorAll("[data-editar-missao]").forEach(botao => botao.addEventListener("click", () => abrirModalMissaoFicha(botao.dataset.editarMissao)));
    lista.querySelectorAll("[data-excluir-missao]").forEach(botao => botao.addEventListener("click", () => excluirMissaoFicha(botao.dataset.excluirMissao)));
}

function abrirModalMissaoFicha(id = null) {
    missaoEmEdicaoId = id;
    const missao = minhasMissoes.find(item => item.id === id);
    const overlay = document.getElementById("ficha-missao-overlay");
    if (!overlay) return;
    document.getElementById("ficha-missao-form")?.reset();
    definirTextoFicha("ficha-missao-titulo-modal", missao ? "Editar missão" : "Registrar missão");
    definirValorFicha("ficha-missao-nome", missao?.titulo || "");
    definirValorFicha("ficha-missao-tipo", missao?.tipo || "embaixador");
    definirValorFicha("ficha-missao-data", missao?.data_missao || dataAtualFicha());
    definirValorFicha("ficha-missao-descricao", missao?.descricao || "");
    overlay.hidden = false;
    document.body.classList.add("modal-aberto");
}

async function salvarMissaoFicha(evento) {
    evento.preventDefault();
    if (salvandoMissao || !window.usuarioAtual) return;
    const tituloMissao = document.getElementById("ficha-missao-nome")?.value?.trim();
    if (!tituloMissao) return;
    salvandoMissao = true;
    const botao = document.getElementById("btn-salvar-missao-ficha");
    if (botao) botao.disabled = true;
    try {
        const dados = {
            usuario_id: window.usuarioAtual.id, titulo: tituloMissao,
            tipo: document.getElementById("ficha-missao-tipo")?.value || "tripulante",
            data_missao: document.getElementById("ficha-missao-data")?.value || dataAtualFicha(),
            descricao: document.getElementById("ficha-missao-descricao")?.value?.trim() || "",
            atualizado_em: new Date().toISOString()
        };
        if (missaoEmEdicaoId) dados.id = missaoEmEdicaoId;
        const { error } = await supabaseClient.from("missoes_tripulantes").upsert(dados, { onConflict: "id" });
        if (error) throw error;
        fecharModaisFicha();
        await carregarMissoesFicha();
        await carregarApenasNiveisFicha();
        notificarFicha("Missão salva no histórico!", "success");
    } catch (erro) {
        console.error("Erro ao salvar missão:", erro);
        notificarFicha("Não foi possível salvar a missão.", "error");
    } finally {
        salvandoMissao = false;
        if (botao) botao.disabled = false;
    }
}

async function excluirMissaoFicha(id) {
    const missao = minhasMissoes.find(item => item.id === id);
    if (!missao || !confirm(`Excluir a missão "${missao.titulo}"?`)) return;
    try {
        const { error } = await supabaseClient.from("missoes_tripulantes").delete()
            .eq("id", id).eq("usuario_id", window.usuarioAtual.id);
        if (error) throw error;
        await carregarMissoesFicha();
        await carregarApenasNiveisFicha();
        notificarFicha("Missão removida do histórico.", "success");
    } catch (erro) {
        console.error("Erro ao excluir missão:", erro);
        notificarFicha("Não foi possível excluir a missão.", "error");
    }
}

async function carregarApenasNiveisFicha() {
    if (!window.usuarioAtual || !minhaFicha) return;
    const { data, error } = await supabaseClient.from("fichas_tripulantes")
        .select("nivel_embaixador, nivel_combatente, nivel_tripulante")
        .eq("id", window.usuarioAtual.id).single();
    if (error) return;
    Object.assign(minhaFicha, data);
    renderizarNiveisFicha();
}

async function carregarKaijusFicha() {
    if (!window.usuarioAtual) return;
    try {
        const [catalogo, derrotados] = await Promise.all([
            supabaseClient.from("mecha_kaijus_catalogo")
                .select("id, nome, ordem, vida, agilidade, defesa, nivel_ameaca, status, descricao, ataques, habilidades, fraquezas, imagem_path").order("ordem"),
            supabaseClient.from("mecha_kaijus_derrotados").select("kaiju_id").eq("usuario_id", window.usuarioAtual.id)
        ]);
        if (catalogo.error) throw catalogo.error;
        if (derrotados.error) throw derrotados.error;
        catalogoKaijusFicha = catalogo.data || [];
        kaijusDerrotadosFicha = new Set((derrotados.data || []).map(item => item.kaiju_id));
        renderizarKaijusDerrotadosFicha();
    } catch (erro) {
        console.error("Erro ao carregar Kaijus da ficha:", erro);
        const lista = document.getElementById("ficha-kaijus-derrotados");
        if (lista) lista.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar os Kaijus derrotados.</p>`;
    }
}

function renderizarKaijusDerrotadosFicha() {
    const lista = document.getElementById("ficha-kaijus-derrotados");
    if (!lista) return;
    const derrotados = catalogoKaijusFicha.filter(kaiju => kaijusDerrotadosFicha.has(kaiju.id));
    if (!derrotados.length) {
        lista.innerHTML = `<p class="ficha-equipe-vazio">Nenhum Kaiju derrotado selecionado.</p>`;
        return;
    }
    lista.innerHTML = derrotados.map(kaiju => {
        const imagem = typeof obterUrlPublicaKaiju === "function" ? obterUrlPublicaKaiju(kaiju.imagem_path) : "";
        return `<button type="button" class="ficha-kaiju-chip" data-detalhes-kaiju="${escaparAtributoFicha(kaiju.id)}">
            ${imagem ? `<img src="${escaparAtributoFicha(imagem)}" alt="">` : `<span>🐲</span>`}
            <strong>${escaparTextoFicha(kaiju.nome)}</strong><i>→</i></button>`;
    }).join("");
    lista.querySelectorAll("[data-detalhes-kaiju]").forEach(botao => {
        botao.addEventListener("click", () => {
            const kaiju = catalogoKaijusFicha.find(item => item.id === botao.dataset.detalhesKaiju);
            if (kaiju && typeof abrirDetalhesKaiju === "function") abrirDetalhesKaiju(kaiju);
        });
    });
}

function abrirModalKaijusDerrotados() {
    const overlay = document.getElementById("ficha-kaijus-overlay");
    const opcoes = document.getElementById("ficha-kaijus-opcoes");
    if (!overlay || !opcoes) return;
    opcoes.innerHTML = catalogoKaijusFicha.length ? catalogoKaijusFicha.map(kaiju => {
        const marcado = kaijusDerrotadosFicha.has(kaiju.id);
        const imagem = typeof obterUrlPublicaKaiju === "function" ? obterUrlPublicaKaiju(kaiju.imagem_path) : "";
        return `<label class="ficha-kaiju-opcao${marcado ? " selecionado" : ""}">
            <input type="checkbox" value="${escaparAtributoFicha(kaiju.id)}" ${marcado ? "checked" : ""}>
            ${imagem ? `<img src="${escaparAtributoFicha(imagem)}" alt="">` : `<span>🐲</span>`}
            <strong>${escaparTextoFicha(kaiju.nome)}</strong><i>${marcado ? "✓" : "+"}</i></label>`;
    }).join("") : `<p class="ficha-equipe-vazio">Nenhum Kaiju foi criado no Registro de Kaijus.</p>`;

    opcoes.querySelectorAll("input").forEach(campo => campo.addEventListener("change", () => {
        campo.closest("label")?.classList.toggle("selecionado", campo.checked);
        const icone = campo.closest("label")?.querySelector("i");
        if (icone) icone.textContent = campo.checked ? "✓" : "+";
    }));
    overlay.hidden = false;
    document.body.classList.add("modal-aberto");
}

async function salvarKaijusDerrotadosFicha() {
    if (salvandoDerrotados || !window.usuarioAtual) return;
    salvandoDerrotados = true;
    const botao = document.getElementById("btn-salvar-kaijus-ficha");
    if (botao) botao.disabled = true;
    const selecionados = new Set(Array.from(document.querySelectorAll("#ficha-kaijus-opcoes input:checked")).map(campo => campo.value));
    const adicionar = [...selecionados].filter(id => !kaijusDerrotadosFicha.has(id));
    const remover = [...kaijusDerrotadosFicha].filter(id => !selecionados.has(id));
    try {
        if (remover.length) {
            const { error } = await supabaseClient.from("mecha_kaijus_derrotados").delete()
                .eq("usuario_id", window.usuarioAtual.id).in("kaiju_id", remover);
            if (error) throw error;
        }
        if (adicionar.length) {
            const linhas = adicionar.map(kaijuId => ({ usuario_id: window.usuarioAtual.id, kaiju_id: kaijuId }));
            const { error } = await supabaseClient.from("mecha_kaijus_derrotados").insert(linhas);
            if (error) throw error;
        }
        kaijusDerrotadosFicha = selecionados;
        renderizarKaijusDerrotadosFicha();
        fecharModaisFicha();
        notificarFicha("Kaijus derrotados atualizados!", "success");
    } catch (erro) {
        console.error("Erro ao salvar Kaijus derrotados:", erro);
        await carregarKaijusFicha();
        notificarFicha("Não foi possível salvar a seleção.", "error");
    } finally {
        salvandoDerrotados = false;
        if (botao) botao.disabled = false;
    }
}

async function carregarFichasEquipe() {
    const lista = document.getElementById("ficha-lista-equipe");
    try {
        const { data, error } = await supabaseClient.from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, nivel_embaixador, nivel_combatente, nivel_tripulante, profiles(nome, username, cargo)").order("id");
        if (error) throw error;
        fichasEquipe = data || [];
        renderizarFichasEquipe();
    } catch (erro) {
        console.error("Erro ao carregar tripulação:", erro);
        if (lista) lista.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar a tripulação.</p>`;
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
        const nome = ficha.profiles?.nome || ficha.profiles?.username || "Tripulante";
        const destaque = ficha.id === window.usuarioAtual?.id ? " ficha-equipe-item-eu" : "";
        const totalMissoes = Number(ficha.nivel_embaixador || 0) + Number(ficha.nivel_combatente || 0) + Number(ficha.nivel_tripulante || 0);
        return `<div class="ficha-equipe-item${destaque}"><strong>${escaparTextoFicha(nome)}</strong>
            <div class="ficha-equipe-atributos"><span>❤️ ${ficha.vida}</span><span>⚔️ ${ficha.dano_extra}</span>
            <span>💨 ${ficha.agilidade}</span><span>🛡️ ${ficha.defesa}</span><span>🩹 ${ficha.salva_vidas}</span><span>📜 ${totalMissoes}</span></div></div>`;
    }).join("");
}

function iniciarSincronizacaoFichas() {
    if (canalFichas) return;
    canalFichas = supabaseClient.channel("ficha-tripulante-completa")
        .on("postgres_changes", { event: "*", schema: "public", table: "fichas_tripulantes" }, payload => {
            if (typeof paginaAtual === "undefined" || paginaAtual !== "ficha") return;
            carregarFichasEquipe();
            const idAlterado = payload.new?.id || payload.old?.id;
            if (idAlterado === window.usuarioAtual?.id && !fichaAlterada && !salvandoFicha) carregarMinhaFicha(true);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "missoes_tripulantes" }, () => {
            if (typeof paginaAtual !== "undefined" && paginaAtual === "ficha") carregarMissoesFicha();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "mecha_kaijus_derrotados" }, () => {
            if (typeof paginaAtual !== "undefined" && paginaAtual === "ficha") carregarKaijusFicha();
        }).subscribe();
}

function fecharModaisFicha() {
    document.querySelectorAll(".ficha-modal-overlay").forEach(overlay => overlay.hidden = true);
    document.body.classList.remove("modal-aberto");
    missaoEmEdicaoId = null;
}

function limparImagemPersonagemPendente(lado) {
    const item = imagensPersonagem[lado];
    if (item.preview) URL.revokeObjectURL(item.preview);
    item.arquivo = null;
    item.preview = "";
}

function limparTodasImagensPersonagemPendentes() {
    limparImagemPersonagemPendente("frente");
    limparImagemPersonagemPendente("verso");
}

function atualizarStatusFicha(tipo, tituloStatus, detalhe, icone) {
    const caixa = document.getElementById("ficha-status");
    if (!caixa) return;
    caixa.className = `ficha-status ${tipo}`;
    definirTextoFicha("ficha-status-titulo", tituloStatus);
    definirTextoFicha("ficha-status-detalhe", detalhe);
    const elementoIcone = caixa.querySelector(".ficha-status-icone");
    if (elementoIcone) elementoIcone.textContent = icone;
}

function lerCampoNumerico(chave) {
    const valor = Number(document.getElementById(`ficha-campo-${chave}`)?.value);
    return Number.isFinite(valor) && valor >= 0 ? valor : 0;
}

function dataAtualFicha() {
    const agora = new Date();
    return new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function formatarDataFicha(valor) {
    if (!valor) return "SEM DATA";
    const [ano, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${ano}`;
}

function rotuloTipoMissao(tipo) {
    return ({ embaixador: "EMBAIXADOR", combatente: "COMBATENTE", tripulante: "TRIPULANTE" })[tipo] || "MISSÃO";
}

function iconeTipoMissao(tipo) {
    return ({ embaixador: "🤝", combatente: "⚔", tripulante: "🚀" })[tipo] || "◆";
}

function definirTextoFicha(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = valor;
}

function definirValorFicha(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.value = valor;
}

function notificarFicha(mensagem, tipo) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao(mensagem, tipo);
}

function escaparTextoFicha(valor) {
    return String(valor ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function escaparAtributoFicha(valor) {
    return escaparTextoFicha(valor);
}

document.addEventListener("usuarioAutenticado", () => {
    minhaFicha = null;
    fichaAlterada = false;
    if (typeof paginaAtual !== "undefined" && paginaAtual === "ficha") {
        carregarMinhaFicha();
        carregarFichasEquipe();
        carregarMissoesFicha();
        carregarKaijusFicha();
    }
});
