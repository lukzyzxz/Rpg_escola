// ======================================
// MISSÕES — CATÁLOGO E PROGRESSO PESSOAL
// ======================================

let catalogoMissoes = [];
let missoesConcluidasUsuario = new Set();
let filtroClasseMissao = "Todas";
let filtroStatusMissao = "Todas";
let carregandoMissoes = false;
let alterandoMissao = false;
let canalMissoes = null;

function telaMissoes() {
    return `
        <section id="pagina-missoes" class="missoes-catalogo-pagina">
            <div class="missoes-hero">
                <div>
                    <span class="missoes-selo">ARQUIVO OFICIAL DA NAVE 3B</span>
                    <h2>Registro de Missões</h2>
                    <p>
                        Consulte todas as operações da sala, abra os detalhes e marque
                        somente as missões que você concluiu.
                    </p>
                </div>
                <div class="missoes-regra">
                    <strong>RECOMPENSA POR MISSÃO</strong>
                    <span>+5 Vida e +1 no atributo da classe</span>
                </div>
            </div>

            <div id="missoes-resumo" class="missoes-resumo-novo">
                ${renderizarCarregamentoMissao("Calculando seu progresso...")}
            </div>

            <div class="missoes-filtros">
                <label>
                    <span>CLASSE</span>
                    <select id="filtro-classe-missao">
                        <option>Todas</option>
                        <option>Embaixador</option>
                        <option>Combatente</option>
                        <option>Tripulante</option>
                    </select>
                </label>
                <label>
                    <span>STATUS PESSOAL</span>
                    <select id="filtro-status-missao">
                        <option>Todas</option>
                        <option>Concluídas</option>
                        <option>Pendentes</option>
                    </select>
                </label>
                <div class="missoes-filtro-aviso">
                    Missões pessoais são criadas exclusivamente na sua ficha.
                </div>
            </div>

            <div id="missoes-lista-catalogo" class="missoes-lista-catalogo">
                ${renderizarCarregamentoMissao("Carregando transmissões do banco de dados...")}
            </div>
        </section>
    `;
}

function inicializarPaginaMissoes() {
    document.getElementById("filtro-classe-missao")?.addEventListener("change", evento => {
        filtroClasseMissao = evento.currentTarget.value;
        renderizarCatalogoMissoes();
    });

    document.getElementById("filtro-status-missao")?.addEventListener("change", evento => {
        filtroStatusMissao = evento.currentTarget.value;
        renderizarCatalogoMissoes();
    });

    carregarRegistroMissoes();
    iniciarSincronizacaoMissoes();
}

async function carregarRegistroMissoes(silencioso = false) {
    if (carregandoMissoes || !window.usuarioAtual) return;
    carregandoMissoes = true;

    const lista = document.getElementById("missoes-lista-catalogo");
    if (lista && !silencioso) {
        lista.innerHTML = renderizarCarregamentoMissao("Carregando transmissões do banco de dados...");
    }

    try {
        const [catalogo, progresso] = await Promise.all([
            supabaseClient
                .from("missoes_catalogo")
                .select("id, titulo, classe, periodo, planeta, resumo, etapas, requisitos, entrega, fonte, oficial, criado_por, data_missao, ordem")
                .order("ordem", { ascending: true })
                .order("criado_em", { ascending: true }),
            supabaseClient
                .from("tripulante_missoes")
                .select("missao_id")
                .eq("usuario_id", window.usuarioAtual.id)
                .eq("concluida", true)
        ]);

        if (catalogo.error) throw catalogo.error;
        if (progresso.error) throw progresso.error;

        catalogoMissoes = catalogo.data || [];
        missoesConcluidasUsuario = new Set(
            (progresso.data || []).map(item => item.missao_id)
        );

        sincronizarBancoLocalComMissoes();
        renderizarCatalogoMissoes();
        if (typeof atualizarIndicadoresMenu === "function") atualizarIndicadoresMenu();
    } catch (erro) {
        console.error("Erro ao carregar as missões:", erro);
        if (lista) {
            lista.innerHTML = `
                <div class="missoes-estado-vazio erro">
                    <span>⚠</span>
                    <strong>Não foi possível carregar o registro.</strong>
                    <p>Execute o arquivo SQL desta atualização no Supabase e tente novamente.</p>
                </div>
            `;
        }
    } finally {
        carregandoMissoes = false;
    }
}

function renderizarCatalogoMissoes() {
    const lista = document.getElementById("missoes-lista-catalogo");
    const resumo = document.getElementById("missoes-resumo");
    if (!lista || !resumo) return;

    const concluidas = catalogoMissoes.filter(missao =>
        missoesConcluidasUsuario.has(missao.id)
    );
    const porClasse = contarMissoesPorClasse(concluidas);

    resumo.innerHTML = `
        ${criarResumoMissao("📜", "Total disponível", catalogoMissoes.length, "operações")}
        ${criarResumoMissao("✅", "Concluídas", concluidas.length, `+${concluidas.length * 5} de vida`)}
        ${criarResumoMissao("🛡️", "Embaixador", porClasse.Embaixador, `+${porClasse.Embaixador} defesa`)}
        ${criarResumoMissao("⚔️", "Combatente", porClasse.Combatente, `+${porClasse.Combatente} dano`)}
        ${criarResumoMissao("💨", "Tripulante", porClasse.Tripulante, `+${porClasse.Tripulante} agilidade`)}
    `;

    const filtradas = catalogoMissoes.filter(missao => {
        const concluida = missoesConcluidasUsuario.has(missao.id);
        const classeOk = filtroClasseMissao === "Todas" || missao.classe === filtroClasseMissao;
        const statusOk = filtroStatusMissao === "Todas"
            || (filtroStatusMissao === "Concluídas" && concluida)
            || (filtroStatusMissao === "Pendentes" && !concluida);
        return classeOk && statusOk;
    });

    if (!filtradas.length) {
        lista.innerHTML = `
            <div class="missoes-estado-vazio">
                <span>⌁</span>
                <strong>Nenhuma missão neste filtro.</strong>
                <p>Altere a classe ou o status para ver outras operações.</p>
            </div>
        `;
        return;
    }

    lista.innerHTML = filtradas.map(criarCardCatalogoMissao).join("");
}

function criarCardCatalogoMissao(missao) {
    const concluida = missoesConcluidasUsuario.has(missao.id);
    const pessoal = !missao.oficial;
    const etapas = normalizarListaMissao(missao.etapas);
    const requisitos = normalizarListaMissao(missao.requisitos);

    return `
        <article class="missao-registro-card classe-${missao.classe.toLowerCase()}${concluida ? " concluida" : ""}">
            <div class="missao-registro-topo">
                <div class="missao-registro-identidade">
                    <span class="missao-classe-badge">${iconeClasseMissao(missao.classe)} ${escaparTextoMissao(missao.classe)}</span>
                    <span class="missao-tipo-badge">${pessoal ? "MISSÃO PESSOAL" : "MISSÃO OFICIAL"}</span>
                    <h3>${escaparTextoMissao(missao.titulo)}</h3>
                    <p>${escaparTextoMissao(missao.resumo)}</p>
                </div>

                <label class="missao-check${concluida ? " ativo" : ""}">
                    <input
                        type="checkbox"
                        ${concluida ? "checked" : ""}
                        ${alterandoMissao ? "disabled" : ""}
                        onchange="alternarMissaoConcluida('${escaparAtributoMissao(missao.id)}', this.checked)">
                    <span>${concluida ? "✓ CONCLUÍDA" : "MARCAR COMO FEITA"}</span>
                </label>
            </div>

            <div class="missao-metadados">
                <span>◈ ${escaparTextoMissao(missao.periodo || "Período não informado")}</span>
                <span>⌖ ${escaparTextoMissao(missao.planeta || "Nave 3B")}</span>
                ${missao.data_missao ? `<span>◷ ${formatarDataMissaoCatalogo(missao.data_missao)}</span>` : ""}
            </div>

            <details class="missao-detalhes">
                <summary>ABRIR DETALHES DA MISSÃO <span>⌄</span></summary>
                <div class="missao-detalhes-conteudo">
                    ${criarBlocoListaMissao("ETAPAS DA OPERAÇÃO", etapas)}
                    ${criarBlocoListaMissao("REQUISITOS E REGRAS", requisitos)}
                    <div class="missao-detalhe-bloco">
                        <h4>ENTREGA / VALIDAÇÃO</h4>
                        <p>${escaparTextoMissao(missao.entrega || "Apresente a conclusão ao professor para validação.")}</p>
                    </div>
                    <div class="missao-detalhe-rodape">
                        <span><strong>Bônus:</strong> ${escaparTextoMissao(recompensaClasseMissao(missao.classe))}</span>
                        <span><strong>Fonte:</strong> ${escaparTextoMissao(missao.fonte || "Registro pessoal")}</span>
                        ${pessoal ? `
                            <button type="button" onclick="excluirMissaoPessoal('${escaparAtributoMissao(missao.id)}')">
                                Excluir missão pessoal
                            </button>
                        ` : ""}
                    </div>
                </div>
            </details>
        </article>
    `;
}

async function alternarMissaoConcluida(missaoId, concluida) {
    if (alterandoMissao || !window.usuarioAtual) return;
    alterandoMissao = true;

    if (concluida) missoesConcluidasUsuario.add(missaoId);
    else missoesConcluidasUsuario.delete(missaoId);
    renderizarCatalogoMissoes();

    try {
        const { data, error } = await supabaseClient.rpc("definir_missao_concluida", {
            p_missao_id: missaoId,
            p_concluida: concluida
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("O servidor não confirmou a missão.");

        sincronizarBancoLocalComMissoes();
        if (typeof atualizarIndicadoresMenu === "function") atualizarIndicadoresMenu();
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao(
                concluida ? "Missão adicionada à sua ficha!" : "Missão removida da sua ficha.",
                "success"
            );
        }
    } catch (erro) {
        console.error("Erro ao alterar missão:", erro);
        if (concluida) missoesConcluidasUsuario.delete(missaoId);
        else missoesConcluidasUsuario.add(missaoId);
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Não foi possível salvar essa alteração.", "error");
        }
    } finally {
        alterandoMissao = false;
        renderizarCatalogoMissoes();
    }
}

async function excluirMissaoPessoal(missaoId) {
    const missao = catalogoMissoes.find(item => item.id === missaoId);
    if (!missao || missao.oficial) return;
    if (!window.confirm(`Excluir a missão pessoal "${missao.titulo}"?`)) return;

    try {
        const { data, error } = await supabaseClient.rpc("excluir_missao_pessoal", {
            p_missao_id: missaoId
        });
        if (error) throw error;
        if (!data?.sucesso) throw new Error("Exclusão não confirmada.");
        await carregarRegistroMissoes(true);
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Missão pessoal excluída.", "success");
        }
    } catch (erro) {
        console.error("Erro ao excluir missão pessoal:", erro);
        if (typeof mostrarNotificacao === "function") {
            mostrarNotificacao("Não foi possível excluir essa missão.", "error");
        }
    }
}

function sincronizarBancoLocalComMissoes() {
    if (typeof banco !== "object" || !banco) return;
    banco.missoes = catalogoMissoes.map((missao, indice) => ({
        id: indice + 1,
        nome: missao.titulo,
        descricao: missao.resumo,
        planetaId: localizarPlanetaMissao(missao.planeta),
        responsavelTipo: "todos",
        frotaId: null,
        dificuldade: missao.classe === "Combatente" ? "Difícil" : "Média",
        recompensa: recompensaClasseMissao(missao.classe),
        progresso: missoesConcluidasUsuario.has(missao.id) ? 100 : 0,
        status: missoesConcluidasUsuario.has(missao.id) ? "Concluída" : "Em andamento",
        criadoEm: missao.data_missao || null
    }));
}

function localizarPlanetaMissao(nomePlaneta) {
    if (typeof banco !== "object" || !Array.isArray(banco.planetas)) return 1;
    const alvo = String(nomePlaneta || "").toLowerCase();
    const encontrado = banco.planetas.find(planeta =>
        alvo.includes(String(planeta.nome || "").toLowerCase())
    );
    return encontrado?.id || 1;
}

function contarMissoesPorClasse(lista) {
    return lista.reduce((total, missao) => {
        if (Object.prototype.hasOwnProperty.call(total, missao.classe)) total[missao.classe] += 1;
        return total;
    }, { Embaixador: 0, Combatente: 0, Tripulante: 0 });
}

function criarResumoMissao(icone, rotulo, valor, detalhe) {
    return `
        <div class="missao-resumo-item">
            <span>${icone}</span>
            <div><small>${rotulo}</small><strong>${valor}</strong><em>${detalhe}</em></div>
        </div>
    `;
}

function criarBlocoListaMissao(tituloBloco, itens) {
    if (!itens.length) return "";
    return `
        <div class="missao-detalhe-bloco">
            <h4>${tituloBloco}</h4>
            <ul>${itens.map(item => `<li>${escaparTextoMissao(item)}</li>`).join("")}</ul>
        </div>
    `;
}

function normalizarListaMissao(valor) {
    if (Array.isArray(valor)) return valor.filter(Boolean);
    if (!valor) return [];
    return [String(valor)];
}

function recompensaClasseMissao(classe) {
    const bonus = {
        Embaixador: "+5 Vida e +1 Defesa",
        Combatente: "+5 Vida e +1 Dano Extra",
        Tripulante: "+5 Vida e +1 Agilidade"
    };
    return bonus[classe] || "+5 Vida";
}

function iconeClasseMissao(classe) {
    return { Embaixador: "🛡️", Combatente: "⚔️", Tripulante: "💨" }[classe] || "◆";
}

function formatarDataMissaoCatalogo(valor) {
    if (!valor) return "";
    const data = new Date(`${valor}T12:00:00`);
    return Number.isNaN(data.getTime())
        ? escaparTextoMissao(valor)
        : data.toLocaleDateString("pt-BR");
}

function renderizarCarregamentoMissao(texto) {
    return `<div class="missoes-carregando"><span>◌</span><p>${escaparTextoMissao(texto)}</p></div>`;
}

function escaparTextoMissao(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributoMissao(valor) {
    return escaparTextoMissao(valor);
}

function iniciarSincronizacaoMissoes() {
    if (canalMissoes || !window.usuarioAtual) return;
    canalMissoes = supabaseClient
        .channel(`missoes-${window.usuarioAtual.id}`)
        .on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "tripulante_missoes",
            filter: `usuario_id=eq.${window.usuarioAtual.id}`
        }, () => {
            if (paginaAtual === "missoes" && !alterandoMissao) carregarRegistroMissoes(true);
        })
        .subscribe();
}

document.addEventListener("usuarioAutenticado", async () => {
    catalogoMissoes = [];
    missoesConcluidasUsuario = new Set();
    if (canalMissoes) {
        supabaseClient.removeChannel(canalMissoes);
        canalMissoes = null;
    }
    await carregarRegistroMissoes(paginaAtual !== "missoes");
    if (paginaAtual === "dashboard" && typeof telaDashboard === "function") {
        const areaConteudo = document.getElementById("conteudo");
        if (areaConteudo) areaConteudo.innerHTML = telaDashboard();
    }
});
