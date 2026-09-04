// ======================================
// REGISTRO TÁTICO DE KAIJUS — NAVE 3B
// ======================================

let catalogoKaijusRegistro = [];
let pecasKaijusRegistro = [];
let kaijusDerrotadosRegistro = new Set();
let carregandoRegistroKaijus = false;

function telaKaijus() {
    return `
        <section class="kaijus-pagina">
            <div class="kaijus-hero">
                <div>
                    <span class="kaijus-selo">ARQUIVO TÁTICO — CRIATURAS ENFRENTADAS</span>
                    <h2>Registro de Kaijus</h2>
                    <p>
                        Imagens oficiais, situação de combate e peças disponíveis para
                        o desenvolvimento dos mechas de 20 metros.
                    </p>
                </div>
                <div class="kaijus-contagem">
                    <strong id="kaijus-total-derrotados">0/5</strong>
                    <span>REGISTRADOS NA SUA FICHA</span>
                </div>
            </div>

            <div id="kaijus-lista" class="kaijus-grade">
                <div class="kaijus-carregando"><span>◌</span><p>Decodificando arquivo biológico...</p></div>
            </div>
        </section>
    `;
}

function inicializarPaginaKaijus() {
    carregarRegistroKaijus();
}

async function carregarRegistroKaijus() {
    if (carregandoRegistroKaijus || !window.usuarioAtual) return;
    carregandoRegistroKaijus = true;

    try {
        const [kaijus, pecas, derrotados] = await Promise.all([
            supabaseClient
                .from("mecha_kaijus_catalogo")
                .select("id, nome, ordem, imagem_path, descricao, status")
                .order("ordem"),
            supabaseClient
                .from("mecha_pecas_catalogo")
                .select("id, kaiju_id, slot, nome, efeito_resumo, descricao")
                .order("slot"),
            supabaseClient
                .from("mecha_kaijus_derrotados")
                .select("kaiju_id")
                .eq("usuario_id", window.usuarioAtual.id)
        ]);

        [kaijus, pecas, derrotados].forEach(resultado => {
            if (resultado.error) throw resultado.error;
        });

        catalogoKaijusRegistro = kaijus.data || [];
        pecasKaijusRegistro = pecas.data || [];
        kaijusDerrotadosRegistro = new Set(
            (derrotados.data || []).map(item => item.kaiju_id)
        );
        renderizarRegistroKaijus();
    } catch (erro) {
        console.error("Erro ao carregar registro de kaijus:", erro);
        const lista = document.getElementById("kaijus-lista");
        if (lista) {
            lista.innerHTML = `
                <div class="kaijus-estado-vazio erro">
                    <span>⚠</span>
                    <strong>Arquivo tático indisponível.</strong>
                    <p>Execute o SQL desta atualização para carregar os registros.</p>
                </div>
            `;
        }
    } finally {
        carregandoRegistroKaijus = false;
    }
}

function renderizarRegistroKaijus() {
    const lista = document.getElementById("kaijus-lista");
    const contador = document.getElementById("kaijus-total-derrotados");
    if (!lista) return;

    if (contador) {
        contador.textContent = `${kaijusDerrotadosRegistro.size}/${catalogoKaijusRegistro.length}`;
    }

    lista.innerHTML = catalogoKaijusRegistro.map((kaiju, indice) => {
        const derrotado = kaijusDerrotadosRegistro.has(kaiju.id);
        const pecas = pecasKaijusRegistro.filter(peca => peca.kaiju_id === kaiju.id);

        return `
            <article class="kaiju-registro-card${derrotado ? " derrotado" : ""}">
                <div class="kaiju-imagem-wrap">
                    <img src="${escaparAtributoKaiju(kaiju.imagem_path)}" alt="${escaparAtributoKaiju(kaiju.nome)}">
                    <span class="kaiju-numero">K-${String(indice + 1).padStart(2, "0")}</span>
                    <span class="kaiju-status">${derrotado ? "✓ DERROTADO" : escaparTextoKaiju(kaiju.status || "NÃO REGISTRADO")}</span>
                </div>

                <div class="kaiju-registro-corpo">
                    <span class="kaiju-classificacao">AMEAÇA COLOSSAL</span>
                    <h3>${escaparTextoKaiju(kaiju.nome)}</h3>
                    <p>${escaparTextoKaiju(kaiju.descricao)}</p>

                    <details class="kaiju-arquivo-detalhes">
                        <summary>VER PEÇAS E EFEITOS <span>⌄</span></summary>
                        <div class="kaiju-pecas-lista">
                            ${pecas.length ? pecas.map(criarLinhaPecaKaiju).join("") : `
                                <p class="kaiju-sem-pecas">Nenhuma peça catalogada.</p>
                            `}
                        </div>
                    </details>
                </div>
            </article>
        `;
    }).join("");
}

function criarLinhaPecaKaiju(peca) {
    return `
        <div class="kaiju-peca-registro">
            <span>${iconeSlotKaiju(peca.slot)}</span>
            <div>
                <small>${nomeSlotKaiju(peca.slot)}</small>
                <strong>${escaparTextoKaiju(peca.nome)}</strong>
                <p>${escaparTextoKaiju(peca.efeito_resumo || peca.descricao)}</p>
            </div>
        </div>
    `;
}

function nomeSlotKaiju(slot) {
    return {
        cabeca: "CABEÇA",
        torso: "TRONCO",
        bracos: "BRAÇOS",
        pernas: "PERNAS"
    }[slot] || String(slot || "PARTE").toUpperCase();
}

function iconeSlotKaiju(slot) {
    return { cabeca: "◉", torso: "⬡", bracos: "⚔", pernas: "◢" }[slot] || "◆";
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
    catalogoKaijusRegistro = [];
    pecasKaijusRegistro = [];
    kaijusDerrotadosRegistro = new Set();
    if (paginaAtual === "kaijus") carregarRegistroKaijus();
});
