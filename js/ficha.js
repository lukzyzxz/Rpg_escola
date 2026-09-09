// ======================================
// FICHA DO TRIPULANTE — NAVE 3B
// Atributos automáticos por missões
// ======================================

const FICHA_AVATAR_BUCKET = "avatares-perfil";

let minhaFicha = null;

// Persistência imediata das escolhas de Codex. A cópia local evita perder a
// seleção se o usuário trocar de página antes da resposta do Supabase.
const CHAVE_CODEX_SELECOES_FICHA = "nave3b_codex_selecoes_v1";

function carregarSelecoesCodexLocaisFicha() {
    try {
        const bruto = JSON.parse(localStorage.getItem(CHAVE_CODEX_SELECOES_FICHA) || "{}");
        return bruto && typeof bruto === "object" ? bruto : {};
    } catch {
        return {};
    }
}

function obterSelecoesCodexLocaisFicha(userId = window.usuarioAtual?.id) {
    if (!userId) return {};
    const todas = carregarSelecoesCodexLocaisFicha();
    const atual = todas[String(userId)];
    return atual && typeof atual === "object" && !Array.isArray(atual) ? { ...atual } : {};
}

function salvarSelecoesCodexLocaisFicha(selecoes, userId = window.usuarioAtual?.id) {
    if (!userId) return;
    try {
        const todas = carregarSelecoesCodexLocaisFicha();
        todas[String(userId)] = { ...(selecoes || {}) };
        localStorage.setItem(CHAVE_CODEX_SELECOES_FICHA, JSON.stringify(todas));
    } catch (erro) {
        console.warn("Não foi possível salvar o cache local dos Codex.", erro);
    }
}

function obterSelecoesCodexFicha() {
    const remotas = minhaFicha?.codex_selecoes && typeof minhaFicha.codex_selecoes === "object"
        ? minhaFicha.codex_selecoes
        : {};
    // O cache local vem por último porque pode conter a escolha feita instantes
    // antes de uma troca de página, ainda não refletida na leitura do servidor.
    return { ...remotas, ...obterSelecoesCodexLocaisFicha() };
}

async function persistirSelecoesCodexFicha(selecoes) {
    if (!window.usuarioAtual?.id) return false;
    const copia = { ...(selecoes || {}) };
    salvarSelecoesCodexLocaisFicha(copia);
    if (minhaFicha) minhaFicha.codex_selecoes = copia;

    try {
        const atualizadoEm = new Date().toISOString();
        const { error } = await supabaseClient
            .from("fichas_tripulantes")
            .update({ codex_selecoes: copia, atualizado_em: atualizadoEm })
            .eq("id", window.usuarioAtual.id);
        if (error) throw error;
        if (minhaFicha) minhaFicha.atualizado_em = atualizadoEm;
        return true;
    } catch (erro) {
        console.error("Erro ao persistir escolha do Codex:", erro);
        // A escolha continua preservada no navegador e será reenviada quando a
        // ficha for salva novamente.
        return false;
    }
}
let fichasEquipe = [];
let missoesFicha = [];
let missoesConcluidasFicha = new Set();
let kaijusFicha = [];
let kaijusDerrotadosFicha = new Set();
let carregandoFicha = false;
let salvandoFicha = false;
let enviandoAvatarFicha = false;
let alterandoProgressaoFicha = false;
let canalFichas = null;

function telaFicha() {
    return `
        <section class="ficha-pagina ficha-pagina-expandida">
            <div class="ficha-coluna-principal">
                <article class="ficha-card ficha-propria">
                    <div class="ficha-identidade-perfil">
                        <div class="ficha-avatar-painel">
                            <div id="ficha-avatar-preview" class="ficha-avatar-preview" aria-label="Imagem do perfil">
                                <span>👨‍🚀</span>
                            </div>
                            <label class="ficha-avatar-botao" for="ficha-avatar-arquivo">
                                <span id="ficha-avatar-acao">ALTERAR IMAGEM</span>
                                <input
                                    id="ficha-avatar-arquivo"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif">
                            </label>
                            <small>PNG, JPG, WEBP ou GIF · até 5 MB</small>
                        </div>

                        <div class="ficha-identidade-conteudo">
                            <div class="ficha-cabecalho">
                                <div>
                                    <span class="ficha-selo">FICHA DE COMBATE AUTOMÁTICA</span>
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
                        </div>
                    </div>

                    <div class="ficha-regra-atributos">
                        <strong>ATRIBUTOS CALCULADOS PELO REGISTRO</strong>
                        <span>Base: 20 Vida · 0 Dano Extra · 5 Agilidade · 0 Defesa</span>
                    </div>

                    <div class="ficha-grade ficha-grade-calculada">
                        ${cartaoAtributoCalculado("vida", "❤️", "Vida", 20, "+5 por missão")}
                        ${cartaoAtributoCalculado("dano_extra", "⚔️", "Dano Extra", 0, "+1 por Combatente")}
                        ${cartaoAtributoCalculado("agilidade", "💨", "Agilidade", 5, "+1 por Tripulante")}
                        ${cartaoAtributoCalculado("defesa", "🛡️", "Defesa", 0, "+1 por Embaixador")}
                    </div>

                    <div class="ficha-niveis" id="ficha-niveis">
                        ${cartaoNivelFicha("Embaixador", "🛡️", 0)}
                        ${cartaoNivelFicha("Combatente", "⚔️", 0)}
                        ${cartaoNivelFicha("Tripulante", "💨", 0)}
                    </div>

                    <div class="ficha-editaveis">
                        <label class="ficha-campo-editavel" for="ficha-campo-salva_vidas">
                            <span>🩹 Salva-Vidas</span>
                            <input id="ficha-campo-salva_vidas" type="number" min="0" step="0.1" value="0">
                        </label>

                        <label class="ficha-itens-label" for="ficha-itens-texto">
                            🎒 Itens, Cartas e Passivas
                        </label>
                        <textarea
                            id="ficha-itens-texto"
                            class="ficha-itens-texto"
                            rows="6"
                            placeholder="Descreva os itens, cartas e passivas que você possui..."></textarea>
                    </div>

                    <div class="ficha-inventario-bloco">
                        <div class="ficha-inventario-topo">
                            <div><span class="ficha-inventario-kicker">🎒 INVENTÁRIO PESSOAL</span><h4>Seus Itens</h4></div>
                            <small id="ficha-itens-contador">0 ITENS</small>
                        </div>
                        <div id="ficha-seus-itens" class="ficha-itens-grid"></div>
                    </div>
                    <div class="ficha-inventario-bloco ficha-catalogo-bloco">
                        <div class="ficha-inventario-topo">
                            <div><span class="ficha-inventario-kicker">▦ BANCO DE ESPÓLIOS</span><h4>Todos os Itens</h4></div>
                            <small>ADICIONE OU REMOVA DA SUA FICHA</small>
                        </div>
                        <div id="ficha-todos-itens" class="ficha-itens-grid catalogo"></div>
                    </div>
                    <button id="btn-salvar-ficha" class="btn-salvar-ficha" type="button" disabled>
                        <span>💾</span>
                        <strong>SALVAR ITENS E SALVA-VIDAS</strong>
                    </button>
                </article>

                <article class="ficha-card ficha-progresso-card">
                    <div class="ficha-secao-titulo">
                        <div><span>01</span><h3>Missões concluídas</h3></div>
                        <small>MARQUE AS OPERAÇÕES QUE VOCÊ REALIZOU</small>
                    </div>
                    <div id="ficha-missoes-lista" class="ficha-missoes-lista">
                        <p class="ficha-equipe-vazio">Carregando catálogo de missões...</p>
                    </div>
                </article>

                <article class="ficha-card ficha-progresso-card">
                    <div class="ficha-secao-titulo">
                        <div><span>02</span><h3>Registrar missão pessoal</h3></div>
                        <small>PARA MISSÕES PASSADAS DIRETAMENTE PELO PROFESSOR</small>
                    </div>

                    <form id="form-missao-pessoal" class="ficha-missao-form">
                        <div class="ficha-form-grade">
                            <label>
                                <span>Nome da missão</span>
                                <input name="titulo" type="text" maxlength="100" required placeholder="Ex.: Reparo emergencial do hangar">
                            </label>
                            <label>
                                <span>Classe</span>
                                <select name="classe" required>
                                    <option value="Embaixador">Embaixador</option>
                                    <option value="Combatente">Combatente</option>
                                    <option value="Tripulante">Tripulante</option>
                                </select>
                            </label>
                            <label>
                                <span>Data</span>
                                <input name="data_missao" type="date">
                            </label>
                        </div>
                        <label>
                            <span>Resumo</span>
                            <input name="resumo" type="text" maxlength="220" required placeholder="Explique em uma frase o que foi feito.">
                        </label>
                        <label>
                            <span>Detalhes e validação</span>
                            <textarea name="detalhes" rows="4" maxlength="1500" required placeholder="Descreva a tarefa, o que foi entregue e como o professor validou."></textarea>
                        </label>
                        <button type="submit" class="btn-salvar-ficha ficha-btn-missao">
                            <span>＋</span><strong>ADICIONAR À MINHA FICHA</strong>
                        </button>
                    </form>
                </article>

                <article class="ficha-card ficha-progresso-card">
                    <div class="ficha-secao-titulo">
                        <div><span>03</span><h3>Kaijus derrotados</h3></div>
                        <small>ESSA SELEÇÃO LIBERA AS PEÇAS DO MECHA</small>
                    </div>
                    <div id="ficha-kaijus-lista" class="ficha-kaijus-lista">
                        <p class="ficha-equipe-vazio">Carregando arquivo tático...</p>
                    </div>
                </article>
            </div>

            <aside class="ficha-equipe">
                <h3>Tripulação</h3>
                <p class="ficha-equipe-subtitulo">Atributos calculados pelo banco de dados</p>
                <div id="ficha-lista-equipe" class="ficha-lista-equipe">
                    <p class="ficha-equipe-vazio">Carregando dados da tripulação...</p>
                </div>
            </aside>
        </section>
    `;
}

function cartaoAtributoCalculado(chave, icone, rotulo, valor, regra) {
    return `
        <div class="ficha-atributo ficha-atributo-calculado">
            <span>${icone}</span>
            <div><small>${rotulo}</small><strong id="ficha-valor-${chave}">${valor}</strong><em>${regra}</em></div>
        </div>
    `;
}

function cartaoNivelFicha(classe, icone, valor) {
    return `
        <div class="ficha-nivel classe-${classe.toLowerCase()}">
            <span>${icone}</span>
            <div><small>NÍVEL ${classe.toUpperCase()}</small><strong id="ficha-nivel-${classe.toLowerCase()}">${valor}</strong></div>
        </div>
    `;
}

function inicializarPaginaFicha() {
    // Renderiza o catálogo imediatamente. Antes, os cards só apareciam depois
    // que a consulta da ficha no Supabase terminava; qualquer erro de coluna,
    // conexão ou atraso deixava “Todos os Itens” completamente vazio.
    if (typeof renderizarInventarioFicha === "function") {
        renderizarInventarioFicha();
    }

    document.getElementById("btn-salvar-ficha")?.addEventListener("click", salvarMinhaFicha);
    document.getElementById("ficha-avatar-arquivo")?.addEventListener("change", salvarAvatarFicha);
    document.getElementById("ficha-campo-salva_vidas")?.addEventListener("input", marcarFichaComoAlterada);
    document.getElementById("ficha-itens-texto")?.addEventListener("input", marcarFichaComoAlterada);
    document.getElementById("form-missao-pessoal")?.addEventListener("submit", criarMissaoPessoalFicha);

    renderizarAvatarFicha();
    carregarMinhaFicha();
    carregarDadosProgressaoFicha();
    carregarFichasEquipe();
    iniciarSincronizacaoFichas();
}

async function carregarMinhaFicha(silencioso = false) {
    if (carregandoFicha || !window.usuarioAtual) return;
    carregandoFicha = true;

    if (!silencioso) {
        atualizarStatusFicha("carregando", "Sincronizando com a nave...", "Aguarde a confirmação do servidor.", "◌");
    }

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, itens_texto, itens_catalogo, aprimoramentos_itens, codex_selecoes, nivel_embaixador, nivel_combatente, nivel_tripulante, atualizado_em")
            .eq("id", window.usuarioAtual.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) throw new Error("Ficha não encontrada para este usuário.");

        minhaFicha = data;
        const selecoesRemotas = minhaFicha.codex_selecoes && typeof minhaFicha.codex_selecoes === "object"
            ? minhaFicha.codex_selecoes
            : {};
        const selecoesLocais = obterSelecoesCodexLocaisFicha(window.usuarioAtual.id);
        minhaFicha.codex_selecoes = { ...selecoesRemotas, ...selecoesLocais };
        // Mantém o cache local alinhado também quando a escolha veio de outro dispositivo.
        salvarSelecoesCodexLocaisFicha(minhaFicha.codex_selecoes, window.usuarioAtual.id);
        renderizarMinhaFicha();
        atualizarStatusFicha(
            "disponivel",
            "Ficha sincronizada",
            "Vida, dano, agilidade e defesa são calculados pelas missões concluídas.",
            "●"
        );

        const botao = document.getElementById("btn-salvar-ficha");
        if (botao) botao.disabled = false;
    } catch (erro) {
        console.error("Erro ao carregar ficha:", erro);
        // O banco de espólios é local ao código e deve continuar visível mesmo
        // quando a sincronização da ficha falhar. Assim o usuário não vê dois
        // blocos vazios e consegue identificar se o problema é apenas o banco.
        try { renderizarInventarioFicha(); } catch (erroCatalogo) { console.warn("Falha ao renderizar catálogo de itens.", erroCatalogo); }
        atualizarStatusFicha("erro", "Comunicação indisponível", "O catálogo foi carregado, mas a ficha não sincronizou. Verifique a atualização do Supabase.", "⚠");
    } finally {
        carregandoFicha = false;
    }
}

function renderizarMinhaFicha() {
    if (!minhaFicha) return;

    definirTextoFicha("ficha-nome-tripulante",
        window.profileAtual?.nome || window.profileAtual?.username || "Tripulante");
    renderizarAvatarFicha();
    definirTextoFicha("ficha-valor-vida", minhaFicha.vida ?? 20);
    definirTextoFicha("ficha-valor-dano_extra", minhaFicha.dano_extra ?? 0);
    definirTextoFicha("ficha-valor-agilidade", minhaFicha.agilidade ?? 5);
    definirTextoFicha("ficha-valor-defesa", minhaFicha.defesa ?? 0);
    definirTextoFicha("ficha-nivel-embaixador", minhaFicha.nivel_embaixador ?? 0);
    definirTextoFicha("ficha-nivel-combatente", minhaFicha.nivel_combatente ?? 0);
    definirTextoFicha("ficha-nivel-tripulante", minhaFicha.nivel_tripulante ?? 0);

    const salvaVidas = document.getElementById("ficha-campo-salva_vidas");
    const itens = document.getElementById("ficha-itens-texto");
    if (salvaVidas) salvaVidas.value = minhaFicha.salva_vidas ?? 0;
    if (itens) itens.value = minhaFicha.itens_texto ?? "";
    const ids = Array.isArray(minhaFicha.itens_catalogo)
        ? minhaFicha.itens_catalogo
        : obterItensDoTripulante(window.usuarioAtual.id);
    definirItensDoTripulante(window.usuarioAtual.id, ids);
    const cache=carregarAprimoramentos();
    for(const [item,registro]of Object.entries(minhaFicha.aprimoramentos_itens||{}))cache[`${window.usuarioAtual.id}::${item}`]=registro;
    try{salvarAprimoramentos(cache);}catch(erroCache){console.warn("Cache de aprimoramentos indisponível.");}
    renderizarInventarioFicha();
}

function renderizarAvatarFicha() {
    const preview = document.getElementById("ficha-avatar-preview");
    if (!preview) return;

    const nome = window.profileAtual?.nome || window.profileAtual?.username || "Tripulante";
    const avatar = String(window.profileAtual?.avatar || "").trim();

    preview.innerHTML = avatar
        ? `<img src="${escaparAtributoFicha(avatar)}" alt="Imagem de perfil de ${escaparAtributoFicha(nome)}">`
        : `<span>${escaparTextoFicha(obterIniciaisAvatarFicha(nome))}</span>`;
}

function obterIniciaisAvatarFicha(nome) {
    const partes = String(nome || "Tripulante").trim().split(/\s+/).filter(Boolean);
    return partes.slice(0, 2).map(parte => parte[0]).join("").toUpperCase() || "T";
}

async function salvarAvatarFicha(evento) {
    const campo = evento.currentTarget;
    const arquivo = campo.files?.[0];
    if (!arquivo || enviandoAvatarFicha || !window.usuarioAtual) return;

    const tiposPermitidos = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!tiposPermitidos.includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
        campo.value = "";
        mostrarAvisoFicha("Use uma imagem PNG, JPG, WEBP ou GIF de até 5 MB.", "error");
        return;
    }

    enviandoAvatarFicha = true;
    const acao = document.getElementById("ficha-avatar-acao");
    const botao = document.querySelector(".ficha-avatar-botao");
    if (acao) acao.textContent = "ENVIANDO...";
    botao?.classList.add("enviando");

    try {
        const caminho = `${window.usuarioAtual.id}/avatar-perfil`;
        const { error: erroUpload } = await supabaseClient.storage
            .from(FICHA_AVATAR_BUCKET)
            .upload(caminho, arquivo, {
                cacheControl: "60",
                upsert: true,
                contentType: arquivo.type
            });
        if (erroUpload) throw erroUpload;

        const { data: dadosUrl } = supabaseClient.storage
            .from(FICHA_AVATAR_BUCKET)
            .getPublicUrl(caminho);
        const avatarUrl = dadosUrl?.publicUrl;
        if (!avatarUrl) throw new Error("A imagem foi enviada, mas a URL não foi gerada.");

        const { data, error } = await supabaseClient.rpc("salvar_avatar_perfil", {
            p_avatar_url: avatarUrl
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("O servidor não confirmou a imagem do perfil.");

        window.profileAtual = {
            ...window.profileAtual,
            avatar: `${avatarUrl}?v=${Date.now()}`
        };
        renderizarAvatarFicha();
        mostrarAvisoFicha("Imagem do perfil atualizada!", "success");
    } catch (erro) {
        console.error("Erro ao salvar imagem do perfil:", erro);
        mostrarAvisoFicha("Não foi possível salvar a imagem do perfil.", "error");
    } finally {
        enviandoAvatarFicha = false;
        campo.value = "";
        if (acao) acao.textContent = "ALTERAR IMAGEM";
        botao?.classList.remove("enviando");
    }
}

function marcarFichaComoAlterada() {
    atualizarStatusFicha("alterada", "Alterações não salvas", "Salve seus itens e salva-vidas para confirmar.", "●");
}

async function salvarMinhaFicha() {
    if (salvandoFicha || !window.usuarioAtual) return;
    salvandoFicha = true;

    const botao = document.getElementById("btn-salvar-ficha");
    if (botao) {
        botao.disabled = true;
        botao.innerHTML = "<span>◌</span><strong>SALVANDO...</strong>";
    }

    const valorSalvaVidas = Number(document.getElementById("ficha-campo-salva_vidas")?.value);
    const atualizacao = {
        salva_vidas: Number.isFinite(valorSalvaVidas) && valorSalvaVidas >= 0 ? valorSalvaVidas : 0,
        itens_catalogo: obterItensDoTripulante(window.usuarioAtual.id),
        codex_selecoes: obterSelecoesCodexFicha(),
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
        atualizarStatusFicha("disponivel", "Ficha salva", "Itens e salva-vidas confirmados pelo servidor.", "✓");
        mostrarAvisoFicha("Ficha salva com sucesso!", "success");
    } catch (erro) {
        console.error("Erro ao salvar ficha:", erro);
        atualizarStatusFicha("erro", "Falha ao salvar", "Suas alterações continuam na tela. Tente novamente.", "⚠");
        mostrarAvisoFicha("Não foi possível salvar a ficha agora.", "error");
    } finally {
        salvandoFicha = false;
        if (botao) {
            botao.disabled = false;
            botao.innerHTML = "<span>💾</span><strong>SALVAR ITENS E SALVA-VIDAS</strong>";
        }
    }
}

async function carregarDadosProgressaoFicha() {
    if (!window.usuarioAtual) return;

    try {
        const [catalogo, concluidas, kaijus, derrotados] = await Promise.all([
            supabaseClient
                .from("missoes_catalogo")
                .select("id, titulo, classe, oficial, criado_por, resumo, data_missao, ordem, ganha_nivel")
                .order("ordem", { ascending: true })
                .order("criado_em", { ascending: true }),
            supabaseClient
                .from("tripulante_missoes")
                .select("missao_id")
                .eq("usuario_id", window.usuarioAtual.id)
                .eq("concluida", true),
            supabaseClient
                .from("mecha_kaijus_catalogo")
                .select("id, nome, ordem, imagem_path, imagem_storage")
                .order("ordem"),
            supabaseClient
                .from("mecha_kaijus_derrotados")
                .select("kaiju_id")
                .eq("usuario_id", window.usuarioAtual.id)
        ]);

        [catalogo, concluidas, kaijus, derrotados].forEach(resultado => {
            if (resultado.error) throw resultado.error;
        });

        missoesFicha = catalogo.data || [];
        missoesConcluidasFicha = new Set((concluidas.data || []).map(item => item.missao_id));
        kaijusFicha = await NaveDados.hydrateKaijus(kaijus.data || []);
        kaijusDerrotadosFicha = new Set((derrotados.data || []).map(item => item.kaiju_id));

        renderizarMissoesFicha();
        renderizarKaijusFicha();
    } catch (erro) {
        console.error("Erro ao carregar progressão da ficha:", erro);
        const listaMissoes = document.getElementById("ficha-missoes-lista");
        const listaKaijus = document.getElementById("ficha-kaijus-lista");
        if (listaMissoes) listaMissoes.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar as missões.</p>`;
        if (listaKaijus) listaKaijus.innerHTML = `<p class="ficha-equipe-vazio">Não foi possível carregar os kaijus.</p>`;
    }
}

function renderizarMissoesFicha() {
    const lista = document.getElementById("ficha-missoes-lista");
    if (!lista) return;

    lista.innerHTML = ["Embaixador", "Combatente", "Tripulante"].map(classe => {
        const missoesClasse = missoesFicha.filter(missao => missao.classe === classe);
        if (!missoesClasse.length) return "";
        const concluidas = missoesClasse.filter(missao => missoesConcluidasFicha.has(missao.id)).length;

        return `
            <div class="ficha-missoes-grupo classe-${classe.toLowerCase()}">
                <div class="ficha-missoes-grupo-titulo">
                    <strong>${iconeClasseFicha(classe)} ${classe}</strong>
                    <span>${concluidas}/${missoesClasse.length} concluídas</span>
                </div>
                <div class="ficha-missoes-opcoes">
                    ${missoesClasse.map(missao => {
                        const concluida = missoesConcluidasFicha.has(missao.id);
                        const pessoal = !missao.oficial;
                        return `
                            <label class="ficha-missao-opcao${concluida ? " concluida" : ""}">
                                <input
                                    type="checkbox"
                                    ${concluida ? "checked" : ""}
                                    ${alterandoProgressaoFicha ? "disabled" : ""}
                                    onchange="definirMissaoFicha('${escaparAtributoFicha(missao.id)}', this.checked)">
                                <span class="ficha-check-visual">${concluida ? "✓" : ""}</span>
                                <span class="ficha-missao-texto">
                                    <strong>${escaparTextoFicha(missao.titulo)}</strong>
                                    <small>${missao.ganha_nivel === false ? "SEM NÍVEL GANHO" : "+5 Vida · " + bonusCurtoClasseFicha(classe)}</small>
                                </span>
                                ${pessoal ? `
                                    <button type="button" title="Excluir missão pessoal" onclick="event.preventDefault(); excluirMissaoPessoalFicha('${escaparAtributoFicha(missao.id)}')">×</button>
                                ` : ""}
                            </label>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }).join("");
}

async function definirMissaoFicha(missaoId, concluida) {
    if (alterandoProgressaoFicha) return;
    alterandoProgressaoFicha = true;

    try {
        const { data, error } = await supabaseClient.rpc("definir_missao_concluida", {
            p_missao_id: missaoId,
            p_concluida: concluida
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("Alteração não confirmada.");

        if (concluida) missoesConcluidasFicha.add(missaoId);
        else missoesConcluidasFicha.delete(missaoId);
        if (typeof missoesConcluidasUsuario === "object") {
            if (concluida) missoesConcluidasUsuario.add(missaoId);
            else missoesConcluidasUsuario.delete(missaoId);
        }
        await carregarMinhaFicha(true);
        await carregarFichasEquipe();
        mostrarAvisoFicha(concluida ? "Missão adicionada. Atributos atualizados!" : "Missão removida. Atributos recalculados.", "success");
    } catch (erro) {
        console.error("Erro ao alterar missão da ficha:", erro);
        mostrarAvisoFicha("Não foi possível salvar essa missão.", "error");
    } finally {
        alterandoProgressaoFicha = false;
        renderizarMissoesFicha();
    }
}

async function criarMissaoPessoalFicha(evento) {
    evento.preventDefault();
    if (alterandoProgressaoFicha || !window.usuarioAtual) return;

    const formulario = evento.currentTarget;
    const dados = new FormData(formulario);
    const tituloMissao = String(dados.get("titulo") || "").trim();
    const classe = String(dados.get("classe") || "").trim();
    const resumo = String(dados.get("resumo") || "").trim();
    const detalhes = String(dados.get("detalhes") || "").trim();
    const dataMissao = String(dados.get("data_missao") || "").trim() || null;

    if (!tituloMissao || !resumo || !detalhes) {
        mostrarAvisoFicha("Preencha nome, resumo e detalhes da missão.", "error");
        return;
    }

    alterandoProgressaoFicha = true;
    const botao = formulario.querySelector("button[type='submit']");
    if (botao) botao.disabled = true;

    try {
        const { data, error } = await supabaseClient.rpc("criar_missao_pessoal", {
            p_titulo: tituloMissao,
            p_classe: classe,
            p_resumo: resumo,
            p_detalhes: detalhes,
            p_data_missao: dataMissao
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("Criação não confirmada.");

        formulario.reset();
        await carregarDadosProgressaoFicha();
        await carregarMinhaFicha(true);
        await carregarFichasEquipe();
        mostrarAvisoFicha("Missão pessoal criada e adicionada à ficha!", "success");
    } catch (erro) {
        console.error("Erro ao criar missão pessoal:", erro);
        mostrarAvisoFicha("Não foi possível criar a missão pessoal.", "error");
    } finally {
        alterandoProgressaoFicha = false;
        if (botao) botao.disabled = false;
    }
}

async function excluirMissaoPessoalFicha(missaoId) {
    const missao = missoesFicha.find(item => item.id === missaoId);
    if (!missao || missao.oficial) return;
    if (!window.confirm(`Excluir a missão pessoal "${missao.titulo}"?`)) return;

    try {
        const { data, error } = await supabaseClient.rpc("excluir_missao_pessoal", { p_missao_id: missaoId });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("Exclusão não confirmada.");
        await carregarDadosProgressaoFicha();
        await carregarMinhaFicha(true);
        await carregarFichasEquipe();
        mostrarAvisoFicha("Missão pessoal excluída.", "success");
    } catch (erro) {
        console.error("Erro ao excluir missão pessoal:", erro);
        mostrarAvisoFicha("Não foi possível excluir essa missão.", "error");
    }
}

function renderizarKaijusFicha() {
    const lista = document.getElementById("ficha-kaijus-lista");
    if (!lista) return;

    lista.innerHTML = kaijusFicha.map(kaiju => {
        const derrotado = kaijusDerrotadosFicha.has(kaiju.id);
        const imagem = kaiju.imagem_url || kaiju.imagem_path || "";
        return `
            <label class="ficha-kaiju-opcao${derrotado ? " derrotado" : ""}">
                <input
                    type="checkbox"
                    ${derrotado ? "checked" : ""}
                    ${alterandoProgressaoFicha ? "disabled" : ""}
                    onchange="definirKaijuFicha('${escaparAtributoFicha(kaiju.id)}', this.checked)">
                ${imagem ? `<img src="${escaparAtributoFicha(imagem)}" alt="${escaparAtributoFicha(kaiju.nome)}">` : '<div class="n-kaiju-sem-imagem" aria-hidden="true">◈</div>'}
                <span><strong>${escaparTextoFicha(kaiju.nome)}</strong><small>${derrotado ? "✓ PEÇAS LIBERADAS" : "MARCAR COMO DERROTADO"}</small></span>
            </label>
        `;
    }).join("");
}

async function definirKaijuFicha(kaijuId, derrotado) {
    if (alterandoProgressaoFicha) return;
    alterandoProgressaoFicha = true;

    try {
        const { data, error } = await supabaseClient.rpc("definir_kaiju_derrotado", {
            p_kaiju_id: kaijuId,
            p_derrotado: derrotado
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("Alteração não confirmada.");

        if (derrotado) kaijusDerrotadosFicha.add(kaijuId);
        else kaijusDerrotadosFicha.delete(kaijuId);
        mostrarAvisoFicha(derrotado ? "Kaiju registrado e peças liberadas!" : "Kaiju removido da sua ficha.", "success");
    } catch (erro) {
        console.error("Erro ao alterar kaiju da ficha:", erro);
        mostrarAvisoFicha("Não foi possível salvar o registro do kaiju.", "error");
    } finally {
        alterandoProgressaoFicha = false;
        renderizarKaijusFicha();
    }
}

async function carregarFichasEquipe() {
    const lista = document.getElementById("ficha-lista-equipe");

    try {
        const { data, error } = await supabaseClient
            .from("fichas_tripulantes")
            .select("id, vida, dano_extra, agilidade, defesa, salva_vidas, nivel_embaixador, nivel_combatente, nivel_tripulante, profiles(nome, username, cargo)")
            .order("id");
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
        return `
            <div class="ficha-equipe-item${destaque}">
                <strong>${escaparTextoFicha(nome)}</strong>
                <div class="ficha-equipe-atributos">
                    <span>❤️ ${ficha.vida}</span><span>⚔️ ${ficha.dano_extra}</span>
                    <span>💨 ${ficha.agilidade}</span><span>🛡️ ${ficha.defesa}</span>
                </div>
                <small>E ${ficha.nivel_embaixador || 0} · C ${ficha.nivel_combatente || 0} · T ${ficha.nivel_tripulante || 0}</small>
            </div>
        `;
    }).join("");
}

function iniciarSincronizacaoFichas() {
    if (canalFichas || !window.usuarioAtual) return;
    canalFichas = supabaseClient
        .channel(`ficha-completa-${window.usuarioAtual.id}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "fichas_tripulantes" }, () => {
            if (paginaAtual === "ficha" && !salvandoFicha) {
                carregarMinhaFicha(true);
                carregarFichasEquipe();
            }
        })
        .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "tripulante_missoes",
            filter: `usuario_id=eq.${window.usuarioAtual.id}`
        }, () => {
            if (paginaAtual === "ficha" && !alterandoProgressaoFicha) carregarDadosProgressaoFicha();
        })
        .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "mecha_kaijus_derrotados",
            filter: `usuario_id=eq.${window.usuarioAtual.id}`
        }, () => {
            if (paginaAtual === "ficha" && !alterandoProgressaoFicha) carregarDadosProgressaoFicha();
        })
        .subscribe();
}

function atualizarStatusFicha(tipo, tituloStatus, detalhe, icone) {
    const status = document.getElementById("ficha-status");
    if (!status) return;
    status.className = `ficha-status ${tipo}`;
    definirTextoFicha("ficha-status-titulo", tituloStatus);
    definirTextoFicha("ficha-status-detalhe", detalhe);
    const elementoIcone = status.querySelector(".ficha-status-icone");
    if (elementoIcone) elementoIcone.textContent = icone;
}

function bonusCurtoClasseFicha(classe) {
    return { Embaixador: "+1 Defesa", Combatente: "+1 Dano", Tripulante: "+1 Agilidade" }[classe] || "";
}

function iconeClasseFicha(classe) {
    return { Embaixador: "🛡️", Combatente: "⚔️", Tripulante: "💨" }[classe] || "◆";
}

function definirTextoFicha(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = String(valor);
}

function mostrarAvisoFicha(mensagem, tipo) {
    if (typeof mostrarNotificacao === "function") mostrarNotificacao(mensagem, tipo);
}

function escaparTextoFicha(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributoFicha(valor) {
    return escaparTextoFicha(valor);
}

document.addEventListener("usuarioAutenticado", () => {
    minhaFicha = null;
    fichasEquipe = [];
    missoesFicha = [];
    missoesConcluidasFicha = new Set();
    kaijusFicha = [];
    kaijusDerrotadosFicha = new Set();

    if (canalFichas) {
        supabaseClient.removeChannel(canalFichas);
        canalFichas = null;
    }

    if (paginaAtual === "ficha") {
        carregarMinhaFicha();
        carregarDadosProgressaoFicha();
        carregarFichasEquipe();
    }
});

function renderizarInventarioFicha() {
    const userId=window.usuarioAtual?.id || "local";
    const possui=typeof obterItensDoTripulante==="function" ? obterItensDoTripulante(userId) : [];
    const catalogo=typeof CATALOGO_ITENS_APRIMORAMENTO!=="undefined" ? CATALOGO_ITENS_APRIMORAMENTO : [];
    definirTextoFicha("ficha-itens-contador", `${possui.length} ${possui.length===1?"ITEM":"ITENS"}`);
    const seus=document.getElementById("ficha-seus-itens");
    const todos=document.getElementById("ficha-todos-itens");
    if(seus) seus.innerHTML=possui.length ? catalogo.filter(i=>possui.includes(i.id)).map(i=>cardItemFicha(i,true)).join("") : `<div class="ficha-inventario-vazio"><span>◇</span><strong>NENHUM ITEM ADICIONADO</strong><p>Escolha equipamentos em “Todos os Itens” abaixo.</p></div>`;
    if(todos){
        const itensNormais=catalogo.filter(i=>!i.codexKaijuId);
        const itensCodex=catalogo.filter(i=>!!i.codexKaijuId);
        todos.innerHTML=`
            <div class="ficha-catalogo-grupo ficha-catalogo-codex">
                <div class="ficha-catalogo-grupo-titulo"><div><span>📖</span><div><small>ARQUIVO DE COMBATE</small><strong>Codex dos Kaijus</strong></div></div><b>${itensCodex.length} CODEX</b></div>
                <p class="ficha-catalogo-codex-ajuda">Adicione um Codex à sua ficha e então escolha qual ataque de Ás a 10 daquele Kaiju ele irá reproduzir.</p>
                <div class="ficha-itens-subgrid">${itensCodex.map(i=>cardItemFicha(i,possui.includes(i.id))).join("")}</div>
            </div>
            <div class="ficha-catalogo-grupo ficha-catalogo-equipamentos">
                <div class="ficha-catalogo-grupo-titulo"><div><span>⚔</span><div><small>EQUIPAMENTOS</small><strong>Itens de Espólio</strong></div></div><b>${itensNormais.length}</b></div>
                <div class="ficha-itens-subgrid">${itensNormais.map(i=>cardItemFicha(i,possui.includes(i.id))).join("")}</div>
            </div>`;
    }
    document.querySelectorAll("[data-ficha-toggle-item]").forEach(btn=>btn.addEventListener("click",()=>alternarItemFicha(btn.dataset.fichaToggleItem)));
    document.querySelectorAll("[data-ficha-ver-item]").forEach(btn=>btn.addEventListener("click",()=>abrirDetalhesItemFicha(btn.dataset.fichaVerItem)));
    document.querySelectorAll("[data-ficha-codex-select]").forEach(sel=>sel.addEventListener("change",()=>selecionarAtaqueCodexFicha(sel.dataset.fichaCodexSelect,sel.value)));
}

function cardItemFicha(item,possui){
    const reg=typeof obterAprimoramentosItem==="function" ? obterAprimoramentosItem(window.usuarioAtual?.id||"local",item.id) : {};
    const qtd=Object.keys(reg).filter(k=>["cartas","atributo","adicional"].includes(k)).length;
    const selecao=item.codexKaijuId ? (obterSelecoesCodexFicha()[item.id]||"") : "";
    const ataqueCodex=item.codexKaijuId&&selecao&&typeof obterCodexKaiju==='function' ? obterCodexKaiju(item.codexKaijuId)?.ataques?.[selecao] : null;
    const descricao=ataqueCodex ? `${ataqueCodex.nome}: ${ataqueCodex.descricao}` : item.descricao;
    const cartas=ataqueCodex ? selecao : (item.cartas?.join(', ')||'—');
    const dano=ataqueCodex ? ataqueCodex.dano : (typeof formatarDanoItemApr==='function'?formatarDanoItemApr(item):item.dano);
    const seletorCodex=item.codexKaijuId&&possui ? `<label class="ficha-codex-seletor"><span>📖 ATAQUE DO CODEX</span><select data-ficha-codex-select="${escaparAtributoFicha(item.id)}"><option value="">Selecione um ataque de A a 10</option>${opcoesAtaquesCodexFicha(item,selecao)}</select>${ataqueCodex?`<small><b>${escaparTextoFicha(ataqueCodex.nome)}</b> · Dano ${escaparTextoFicha(ataqueCodex.dano)}</small>`:`<small>Escolha um ataque no Registro de Kaijus para definir este item.</small>`}</label>` : '';
    return `<article class="ficha-item-card ${possui?'possuido':''} ${item.codexKaijuId?'item-codex':''}">
        <div class="ficha-item-card-topo"><span class="ficha-item-icone">${typeof iconeTipo==='function'?iconeTipo(item.tipo):'⚔️'}</span><div><small>${escaparTextoFicha(item.origem)}</small><h5>${escaparTextoFicha(item.nome)}${item.codexKaijuId?' <em class="ficha-codex-badge">CODEX</em>':''}</h5></div><span class="ficha-item-apr-badge">⚙ ${qtd}/3</span></div>
        <p>${escaparTextoFicha(descricao)}</p>
        <div class="ficha-item-meta"><span>Cartas: ${escaparTextoFicha(cartas)}</span><span>Dano: ${escaparTextoFicha(dano)}</span></div>
        ${seletorCodex}
        <div class="ficha-item-acoes"><button type="button" data-ficha-ver-item="${item.id}">⚙ VER APRIMORAMENTOS</button><button type="button" class="${possui?'remover':'adicionar'}" data-ficha-toggle-item="${item.id}">${possui?'− REMOVER':'+ ADICIONAR'}</button></div>
    </article>`;
}

function opcoesAtaquesCodexFicha(item,selecao){
    const codex=typeof obterCodexKaiju==='function'?obterCodexKaiju(item.codexKaijuId):null;
    if(!codex?.ataques)return '';
    const cartas=typeof CARTAS_CODEX_SELECIONAVEIS!=='undefined'?CARTAS_CODEX_SELECIONAVEIS:["A","2","3","4","5","6","7","8","9","10"];
    return cartas.filter(c=>codex.ataques[c]).map(c=>{const a=codex.ataques[c];return `<option value="${escaparAtributoFicha(c)}" ${c===selecao?'selected':''}>${escaparTextoFicha(c)} — ${escaparTextoFicha(a.nome)} (${escaparTextoFicha(a.dano)} dano)</option>`}).join('');
}

async function selecionarAtaqueCodexFicha(itemId,carta){
    if(!minhaFicha || !window.usuarioAtual?.id)return;
    const item=CATALOGO_ITENS_APRIMORAMENTO.find(i=>i.id===itemId&&i.codexKaijuId);if(!item)return;
    const codex=typeof obterCodexKaiju==='function'?obterCodexKaiju(item.codexKaijuId):null;
    const validas=typeof CARTAS_CODEX_SELECIONAVEIS!=='undefined'?CARTAS_CODEX_SELECIONAVEIS:["A","2","3","4","5","6","7","8","9","10"];
    const selecoes=obterSelecoesCodexFicha();
    if(carta&&validas.includes(carta)&&codex?.ataques?.[carta])selecoes[itemId]=carta;else delete selecoes[itemId];

    // Atualiza a tela e o cache local antes da requisição, então a escolha não
    // some ao trocar de página, adicionar/remover outro item ou recarregar.
    minhaFicha.codex_selecoes={...selecoes};
    salvarSelecoesCodexLocaisFicha(selecoes, window.usuarioAtual.id);
    renderizarInventarioFicha();
    atualizarStatusFicha("carregando", "Salvando Codex...", "Registrando o ataque selecionado.", "◌");

    const salvo=await persistirSelecoesCodexFicha(selecoes);
    if(salvo){
        atualizarStatusFicha("disponivel", "Codex salvo", "A escolha permanecerá vinculada ao tripulante.", "✓");
    }else{
        atualizarStatusFicha("alterada", "Codex salvo localmente", "A escolha foi preservada neste navegador; salve a ficha para tentar sincronizar novamente.", "⚠");
    }
}

function alternarItemFicha(itemId){
    const userId=window.usuarioAtual?.id || "local";
    const possui=obterItensDoTripulante(userId).includes(itemId);
    if(possui){
        removerItemDoTripulante(userId,itemId);
        if(minhaFicha?.codex_selecoes){
            delete minhaFicha.codex_selecoes[itemId];
            salvarSelecoesCodexLocaisFicha(minhaFicha.codex_selecoes,userId);
        }
    } else adicionarItemAoTripulante(userId,itemId);
    marcarFichaComoAlterada();
    renderizarInventarioFicha();
}

function abrirDetalhesItemFicha(itemId){
    const item=CATALOGO_ITENS_APRIMORAMENTO.find(i=>i.id===itemId); if(!item)return;
    const reg=obterAprimoramentosItem(window.usuarioAtual?.id||"local",itemId);
    const nomes=typeof CATEGORIAS_APRIMORAMENTO!=="undefined"?CATEGORIAS_APRIMORAMENTO:{};
    let modal=document.getElementById("ficha-item-detalhes-overlay");
    if(!modal){ modal=document.createElement("div"); modal.id="ficha-item-detalhes-overlay"; modal.className="ficha-modal-overlay"; document.body.appendChild(modal); }
    modal.hidden=false;
    const cartaCodex=item.codexKaijuId?obterSelecoesCodexFicha()[item.id]:null; const ataqueCodex=cartaCodex&&typeof obterCodexKaiju==='function'?obterCodexKaiju(item.codexKaijuId)?.ataques?.[cartaCodex]:null;
    modal.innerHTML=`<div class="ficha-modal ficha-item-modal"><div class="ficha-modal-cabecalho"><div><span>${escaparTextoFicha(item.origem)}</span><h3>${escaparTextoFicha(item.nome)}</h3></div><button type="button" class="ficha-modal-fechar" data-fechar-item-modal>×</button></div><p class="ficha-ajuda">${escaparTextoFicha(ataqueCodex?`${cartaCodex} — ${ataqueCodex.nome}: ${ataqueCodex.descricao}`:item.descricao)}</p><div class="ficha-item-aprimoramentos-modal">${Object.entries(nomes).map(([k,c])=>{const a=reg[k];return `<div class="ficha-item-apr-linha ${a?'ativo':''}"><span>${c.icone}</span><div><strong>${escaparTextoFicha(c.nome)}</strong><small>${a?`${rotuloRaridade(a.raridade)} • ${escaparTextoFicha(a.texto)}`:'Ainda não adquirido'}</small></div></div>`}).join('')}</div></div>`;
    modal.querySelector('[data-fechar-item-modal]')?.addEventListener('click',()=>modal.hidden=true);
    modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true},{once:true});
}
