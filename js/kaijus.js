// ======================================
// REGISTRO TÁTICO + CODEX DE KAIJUS
// ======================================

const ORDEM_CARTAS_CODEX = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const CODEX_KAIJUS = {
    "rei-verdejante": {
        vida: 220,
        agilidade: 6,
        codex: "Ao acertar o nome e o efeito de todas as habilidades deste Kaiju, você recebe um ataque dele de Ás a 10.",
        ataques: {
            A: { nome: "Foco no vigor", dano: 7, descricao: "7 de dano no jogador com mais vida." },
            2: { nome: "Foco no vigor", dano: 6, descricao: "6 de dano no jogador com mais vida." },
            3: { nome: "Teste de juventude", dano: 6, descricao: "6 de dano no jogador mais novo." },
            4: { nome: "Teste de juventude", dano: 7, descricao: "7 de dano no jogador mais novo." },
            5: { nome: "Respeito aos anciões", dano: 6, descricao: "6 de dano no jogador mais velho." },
            6: { nome: "Respeito aos anciões", dano: 7, descricao: "7 de dano no jogador mais velho." },
            7: { nome: "Predador cruel", dano: 5, descricao: "Acerta o jogador com menos vida." },
            8: { nome: "Predador cruel", dano: 5, descricao: "Acerta o jogador com menos vida." },
            9: { nome: "Explosão de pólen", dano: 2, descricao: "Causa 2 de dano em todos os jogadores." },
            10: { nome: "Terremoto da selva", dano: 3, descricao: "Causa 3 de dano em todos os jogadores." },
            J: { nome: "Elo da natureza", dano: 0, descricao: "Todos os jogadores ficam de mãos dadas." },
            Q: { nome: "Mil olhos da floresta", dano: 0, descricao: "Descarta duas cartas do baralho." },
            K: { nome: "A horda do chefe", dano: 3, descricao: "Invoca 2 Kaijus; o grupo escolhe um jogador para tomar 3 de dano toda rodada." }
        }
    },
    "rei-porco": {
        vida: 110,
        agilidade: 5,
        codex: "Ao acertar o nome e o efeito de todas as habilidades deste Kaiju, você recebe um ataque dele de Ás a 10.",
        ataques: {
            A: { nome: "Mordida frontal", dano: 4, descricao: "Acerta o jogador do meio." },
            2: { nome: "Coice pela direita", dano: 4, descricao: "O Kaiju avança e acerta o jogador mais à esquerda da mesa." },
            3: { nome: "Mordida frontal", dano: 4, descricao: "Acerta o jogador do meio." },
            4: { nome: "Mordida frontal", dano: 4, descricao: "Acerta o jogador do meio." },
            5: { nome: "Coice pela direita", dano: 5, descricao: "Acerta o jogador da direita da mesa." },
            6: { nome: "Coice pela direita", dano: 6, descricao: "Acerta o jogador da direita da mesa." },
            7: { nome: "Fúria às cegas", dano: 6, descricao: "Atinge um alvo aleatório." },
            8: { nome: "Guincho aterrorizante", dano: 4, descricao: "Escolha qual jogador vai receber 4 de dano." },
            9: { nome: "Fúria suína", dano: 60, descricao: "Todos os oponentes perdem 3 de vida." },
            10: { nome: "Atropelamento desconcertado", dano: 3, descricao: "Corre e acerta dois alvos aleatórios." },
            J: { nome: "Porco cego e mudo", dano: 4, descricao: "O grupo fecha os olhos e aponta para quem toma 4 de dano. Se todos discordarem, o grupo todo toma 4." },
            Q: { nome: "Cuspindo ácido", dano: 5, descricao: "Dá 5 de dano e descarta duas cartas do baralho." },
            K: { nome: "Rei: nhoc e porco", dano: 4, descricao: "Ao falar “nhoc”, passa para outra pessoa; “porco” inverte a ordem. Quem falar errado ou fora da vez toma 4." }
        }
    },
    "cobra-falante": {
        vida: 180,
        agilidade: 7,
        codex: "Ao acertar o nome e o efeito de todas as habilidades deste Kaiju, você recebe um ataque dele de Ás a 10.",
        ataques: {
            A: { nome: "Bote preciso", dano: 7, descricao: "Atinge o jogador à direita." },
            2: { nome: "Sufocamento", dano: 7, descricao: "Atinge o jogador à esquerda." },
            3: { nome: "Presa caótica", dano: 7, descricao: "Atinge um alvo aleatório." },
            4: { nome: "Bate nas extremidades", dano: 5, descricao: "Bate nas extremidades." },
            5: { nome: "Giro rasteiro", dano: 3, descricao: "Quem sofre o dano troca de lugar." },
            6: { nome: "Cuspida tóxica", dano: 5, descricao: "Acerta o jogador mais ao meio." },
            7: { nome: "Espreita ilusória", dano: 7, descricao: "Acerta um alvo aleatório." },
            8: { nome: "Bote surpresa", dano: 5, descricao: "Ataca o jogador do meio." },
            9: { nome: "Bote cego", dano: 5, descricao: "Acerta um jogador aleatório." },
            10: { nome: "Cauda chicote tempestuoso", dano: 3, descricao: "Causa 3 de dano em todos os jogadores." },
            J: { nome: "Jogo da memória", dano: 5, descricao: "Memorize: Escama, veneno, bote, asas, chocalho, sombras. Se errar, recebe 5 de dano." },
            Q: { nome: "Abrir asas", dano: 5, descricao: "Todo golpe tem 50% de chance de erro." },
            K: { nome: "Serpente enfeitiçou", dano: 7, descricao: "Enfeitiça o jogador e causa 7 de dano." }
        }
    },
    hidra: {
        vida: 400,
        agilidade: 7,
        codex: "Uma criatura de múltiplas cabeças capaz de atacar seus inimigos de diferentes formas. Seus ataques podem atingir vários jogadores e causar efeitos de caos.",
        ataques: {
            A: { nome: "Mordida corrosiva", dano: 10, descricao: "Causa 10 de dano em um jogador e 5 de dano no restante." },
            2: { nome: "Foco do predador Alfa", dano: 14, descricao: "Causa 14 de dano no último jogador que recebeu dano." },
            3: { nome: "Bote impiedoso", dano: 13, descricao: "Causa 13 de dano no jogador da ponta com mais vida." },
            4: { nome: "Investida caótica", dano: 12, descricao: "Causa 12 de dano em um jogador aleatório." },
            5: { nome: "Miasma do Caos", dano: 6, descricao: "Causa 6 de dano em todos os jogadores." },
            6: { nome: "Ressonância do Caos", dano: 0, descricao: "Repete a última carta da rodada." },
            7: { nome: "Prisão de escamas", dano: 7, descricao: "Causa 7 de dano no centro; os dois jogadores do meio não podem causar dano neste turno." },
            8: { nome: "Rugido paralisante", dano: 9, descricao: "Causa 9 de dano e bloqueia o dano de 2 jogadores." },
            9: { nome: "Mutação regenerativa", dano: 0, descricao: "Recupera 20 de vida com a cabeça que estiver com menos vida." },
            10: { nome: "Apocalipse Kaiju", dano: "4X de -4", descricao: "Bate 4 vezes, causando 4 de dano em cada golpe." },
            J: { nome: "Maldição das vozes", dano: 0, descricao: "Cada jogador só pode falar 1 palavra até todos terem falado. Quem errar perde 4 de vida." },
            Q: { nome: "Enigma do caos", dano: 6, descricao: "Os jogadores devem repetir o trava-língua apresentado. Quem errar perde 6 de vida." },
            K: { nome: "Dança da hidra", dano: 0, descricao: "Um jogador é escolhido como a mente da Hidra; tudo que ele fizer deve ser repetido pelos demais por 3 turnos." }
        }
    },
    "tartaruga-dragao": {
        vida: 340,
        agilidade: 6,
        defesa: 2,
        codex: "Uma criatura colossal que combina a resistência de uma tartaruga com o poder destrutivo de um dragão.",
        ataques: {
            A: { nome: "Esmagar defesa", dano: 9, descricao: "Causa 9 de dano no alvo escolhido pela equipe." },
            2: { nome: "Casco esmagador", dano: 12, descricao: "Causa 12 de dano no jogador com mais vida." },
            3: { nome: "Tremor de terra", dano: 1, descricao: "Causa 1 de dano em todos os jogadores." },
            4: { nome: "Punição do casco", dano: 4, descricao: "Causa 4 de dano; a equipe escolhe quem recebe." },
            5: { nome: "Mordida quebra-ossos", dano: 4, descricao: "Causa 4 de dano; se o alvo atacou o Kaiju, causa 8." },
            6: { nome: "Âncora de dano", dano: 7, descricao: "Causa 7 de dano; a equipe escolhe quem recebe." },
            7: { nome: "Repulsa brutal", dano: 5, descricao: "Causa 5 de dano; a equipe escolhe quem recebe." },
            8: { nome: "Muralha de espinhos", dano: 5, descricao: "Devolve 3 de dano." },
            9: { nome: "Gêiser subterrâneo", dano: 6, descricao: "Causa 6 de dano em um jogador aleatório." },
            10: { nome: "Peso do milênio", dano: 1, descricao: "O dano é dobrado." },
            J: { nome: "Instância mutável", dano: 2, descricao: "2 de dano e 5 de defesa, ou 2 de dano e -2." },
            Q: { nome: "Distorção temporal", dano: 0, descricao: "Um jogador fica em estátua, inquieto, agitado e lento. O efeito acaba quando o Kaiju sofre 80 de dano." },
            K: { nome: "Palácio do equilíbrio", dano: 4, descricao: "Se a torre de cartas cair, o Kaiju fica imune, recebe 20 cartas e toma 4 de dano." }
        }
    }
};

let catalogoKaijusRegistro = [];
let pecasKaijusRegistro = [];
let kaijusDerrotadosRegistro = new Set();
let carregandoRegistroKaijus = false;
let codexKaijuAtual = null;
let historicoCodexKaijus = [];
let intervaloRoletaCodex = null;
let esperaRoletaCodex = null;
let ultimoAbridorCodex = null;

function telaKaijus() {
    return `
        <section class="kaijus-pagina">
            <div class="kaijus-hero">
                <div>
                    <span class="kaijus-selo">ARQUIVO TÁTICO — CRIATURAS ENFRENTADAS</span>
                    <h2>Registro de Kaijus</h2>
                    <p>
                        Consulte vida, agilidade, Codex, ataques, situação de combate
                        e peças disponíveis para o desenvolvimento dos mechas.
                    </p>
                </div>
                <div class="kaijus-contagem">
                    <strong id="kaijus-total-derrotados">0/5</strong>
                    <span>REGISTRADOS NA SUA FICHA</span>
                </div>
            </div>

            <div class="n-actions kaiju-admin-actions"><button class="n-button primary" type="button" onclick="KaijuEditor.open()">Novo Kaiju</button><button class="n-button" type="button" onclick="carregarRegistroKaijus()">Atualizar registros</button></div>
            <div id="kaijus-lista" class="kaijus-grade">
                <div class="kaijus-carregando"><span>◌</span><p>Decodificando arquivo biológico...</p></div>
            </div>
        </section>

        <div id="kaiju-codex-modal" class="kaiju-codex-modal" role="dialog" aria-modal="true" aria-hidden="true" aria-labelledby="kaiju-codex-nome">
            <div class="kaiju-codex-painel">
                <button type="button" class="kaiju-codex-fechar" aria-label="Fechar Codex" onclick="fecharCodexKaiju()">×</button>

                <header class="kaiju-codex-cabecalho">
                    <div class="kaiju-codex-imagem">
                        <img id="kaiju-codex-imagem" src="" alt="">
                        <span>AMEAÇA DETECTADA</span>
                    </div>
                    <div>
                        <small>REGISTRO KAIJU</small>
                        <h2 id="kaiju-codex-nome"></h2>
                        <div class="kaiju-codex-status">
                            <span><small>VIDA</small><strong id="kaiju-codex-vida">—</strong></span>
                            <span><small>AGILIDADE</small><strong id="kaiju-codex-agilidade">—</strong></span>
                            <span id="kaiju-codex-defesa-box"><small>DEFESA</small><strong id="kaiju-codex-defesa">—</strong></span>
                        </div>
                    </div>
                </header>

                <section class="kaiju-codex-bloco">
                    <div class="kaiju-codex-titulo"><span>▣</span><h3>Codex</h3></div>
                    <p id="kaiju-codex-descricao"></p>
                </section>

                <section class="kaiju-codex-roleta">
                    <div>
                        <small>SISTEMA DE RECOMPENSA</small>
                        <h3>Roletar ataque</h3>
                        <p>Role para sortear aleatoriamente uma das cartas deste Kaiju.</p>
                    </div>
                    <button id="kaiju-codex-botao-roleta" type="button" onclick="roletarAtaqueCodex()">🎲 ROLAR ATAQUE</button>
                    <div id="kaiju-codex-resultado" class="kaiju-codex-resultado" aria-live="polite">
                        <strong id="kaiju-codex-carta">?</strong>
                        <div>
                            <small>ATAQUE SORTEADO</small>
                            <h4 id="kaiju-codex-ataque-nome">ROLE PARA DESCOBRIR</h4>
                            <span id="kaiju-codex-ataque-dano">—</span>
                            <p id="kaiju-codex-ataque-descricao">Seu próximo ataque aparecerá aqui.</p>
                        </div>
                    </div>
                    <div class="kaiju-codex-historico">
                        <h4>HISTÓRICO DE ROLAGENS</h4>
                        <div id="kaiju-codex-historico-lista"><span>Nenhum ataque sorteado ainda.</span></div>
                    </div>
                </section>

                <section class="kaiju-codex-bloco">
                    <div class="kaiju-codex-titulo"><span>🃏</span><h3>Ataques do Kaiju</h3></div>
                    <div id="kaiju-codex-ataques" class="kaiju-codex-ataques"></div>
                </section>
            </div>
        </div>
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
                .select("*")
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

        catalogoKaijusRegistro = await NaveDados.hydrateKaijus(kaijus.data || []);
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
        const codex = obterCodexKaiju(kaiju.id);

        return `
            <article class="kaiju-registro-card${derrotado ? " derrotado" : ""}">
                <div class="kaiju-imagem-wrap">
                    ${kaiju.imagem_url||kaiju.imagem_path ? `<img src="${escaparAtributoKaiju(kaiju.imagem_url||kaiju.imagem_path)}" alt="${escaparAtributoKaiju(kaiju.nome)}" loading="lazy">` : `<div class="kaiju-imagem-vazia" aria-hidden="true">◇</div>`}
                    <span class="kaiju-numero">K-${String(indice + 1).padStart(2, "0")}</span>
                    <span class="kaiju-status">${derrotado ? "✓ DERROTADO" : escaparTextoKaiju(kaiju.status || "NÃO REGISTRADO")}</span>
                </div>

                <div class="kaiju-registro-corpo">
                    <span class="kaiju-classificacao">AMEAÇA COLOSSAL</span>
                    <h3>${escaparTextoKaiju(kaiju.nome)}</h3>
                    <p>${escaparTextoKaiju(kaiju.descricao)}</p>

                    ${codex ? `
                        <div class="kaiju-resumo-codex">
                            <span><small>VIDA</small><strong>${escaparTextoKaiju(codex.vida)}</strong></span>
                            <span><small>AGILIDADE</small><strong>${escaparTextoKaiju(codex.agilidade)}</strong></span>
                            ${codex.defesa !== undefined ? `<span><small>DEFESA</small><strong>${escaparTextoKaiju(codex.defesa)}</strong></span>` : ""}
                        </div>
                        <button type="button" class="kaiju-abrir-codex" onclick="abrirCodexKaiju('${escaparAtributoKaiju(kaiju.id)}')">
                            <span>▣</span> ACESSAR CODEX E ATAQUES
                        </button>
                    ` : ""}

                    <div class="kaiju-admin-actions">${kaiju.personalizado&&kaiju.criado_por===window.usuarioAtual?.id?`<button class="n-button" type="button" onclick="KaijuEditor.open('${escaparAtributoKaiju(kaiju.id)}')">Editar</button>`:''}<button class="n-button" type="button" onclick="KaijuEditor.open('${escaparAtributoKaiju(kaiju.id)}',true)">Duplicar</button></div>
                    ${kaiju.ataques_legado?.trim() && kaiju.ataques_legado.trim() !== '{}' ? `
                        <details class="kaiju-arquivo-detalhes">
                            <summary>VER ATAQUES DO CADASTRO ANTIGO <span>⌄</span></summary>
                            <p>Conteúdo original preservado. Revise as cartas antes de usá-las no combate.</p>
                            <p style="white-space:pre-wrap;overflow-wrap:anywhere">${escaparTextoKaiju(kaiju.ataques_legado)}</p>
                        </details>
                    ` : ''}
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

async function abrirCodexKaiju(kaijuId) {
    const codex = obterCodexKaiju(kaijuId);
    const registro = catalogoKaijusRegistro.find(item => item.id === kaijuId);
    const modal = document.getElementById("kaiju-codex-modal");
    if (!codex || !registro || !modal) return;

    codexKaijuAtual = kaijuId;
    historicoCodexKaijus = [];
    ultimoAbridorCodex = document.activeElement;

    const imagem = document.getElementById("kaiju-codex-imagem");
    imagem.src = registro.imagem_url||registro.imagem_path;
    imagem.hidden = !imagem.getAttribute("src");
    imagem.alt = registro.nome;
    document.getElementById("kaiju-codex-nome").textContent = registro.nome;
    document.getElementById("kaiju-codex-vida").textContent = codex.vida;
    document.getElementById("kaiju-codex-agilidade").textContent = codex.agilidade;
    document.getElementById("kaiju-codex-descricao").textContent = codex.codex;

    const defesaBox = document.getElementById("kaiju-codex-defesa-box");
    defesaBox.hidden = codex.defesa === undefined;
    if (codex.defesa !== undefined) {
        document.getElementById("kaiju-codex-defesa").textContent = codex.defesa;
    }

    document.getElementById("kaiju-codex-ataques").innerHTML = ORDEM_CARTAS_CODEX
        .filter(carta => codex.ataques[carta])
        .map(carta => criarCartaAtaqueCodex(carta, codex.ataques[carta]))
        .join("");

    limparResultadoCodex();
    atualizarHistoricoCodex();
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector(".kaiju-codex-fechar").focus();
    await carregarHistoricoCodex(kaijuId);
}

function fecharCodexKaiju() {
    const modal = document.getElementById("kaiju-codex-modal");
    if (!modal) return;

    cancelarRoletaCodex();
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    codexKaijuAtual = null;

    if (ultimoAbridorCodex && typeof ultimoAbridorCodex.focus === "function") {
        ultimoAbridorCodex.focus();
    }
    ultimoAbridorCodex = null;
}

function criarCartaAtaqueCodex(carta, ataque) {
    const dano = Number(ataque.dano) === 0 ? "EFEITO" : `DANO ${escaparTextoKaiju(ataque.dano)}`;
    return `
        <article class="kaiju-codex-carta">
            <strong>${escaparTextoKaiju(carta)}</strong>
            <div>
                <small>${dano}</small>
                <h4>${escaparTextoKaiju(ataque.nome)}</h4>
                <p>${escaparTextoKaiju(ataque.descricao)}</p>
            </div>
        </article>
    `;
}

async function roletarAtaqueCodex() {
    const id=codexKaijuAtual, codex=obterCodexKaiju(id);
    const button=document.getElementById('kaiju-codex-botao-roleta');
    if(!codex||!button||button.disabled)return;
    button.disabled=true;button.textContent='Sorteando…';
    const requestId=operacoesCodex.get(id)||NaveDados.uuid();operacoesCodex.set(id,requestId);
    try {
        const result=await NaveDados.request('nave_sortear_ataque',{p_kaiju_id:id,p_operacao:requestId});
        operacoesCodex.delete(id);
        if(codexKaijuAtual!==id)return;
        mostrarResultadoAtaqueCodex(result.carta,result.ataque);
        await carregarHistoricoCodex(id);
    }catch(error){mostrarNotificacao(NaveDados.message(error),'error');}
    finally{if(button.isConnected){button.disabled=false;button.textContent='Sortear ataque';}}
}
const operacoesCodex=new Map();
function mostrarResultadoAtaqueCodex(carta,ataque=obterCodexKaiju(codexKaijuAtual)?.ataques[carta]) {
    if(!ataque)return;
    document.getElementById('kaiju-codex-carta').textContent=carta;
    document.getElementById('kaiju-codex-ataque-nome').textContent=ataque.nome;
    document.getElementById('kaiju-codex-ataque-dano').textContent=Number(ataque.dano)===0?'Efeito especial':`Dano: ${ataque.dano}`;
    document.getElementById('kaiju-codex-ataque-descricao').textContent=ataque.descricao;
}
async function carregarHistoricoCodex(id){
    try{const result=await supabaseClient.from('kaiju_rolagens').select('carta,ataque,criado_em').eq('kaiju_id',id).eq('usuario_id',window.usuarioAtual.id).order('id',{ascending:false}).limit(20);
    if(result.error)throw result.error;if(codexKaijuAtual!==id)return;
    historicoCodexKaijus=(result.data||[]).map(r=>({carta:r.carta,...r.ataque}));atualizarHistoricoCodex();
    }catch(error){if(codexKaijuAtual===id)document.getElementById('kaiju-codex-historico-lista').textContent='Histórico indisponível. Atualize após conferir a conexão e o SQL V7.';}
}

function limparResultadoCodex() {
    cancelarRoletaCodex();
    document.getElementById("kaiju-codex-carta").textContent = "?";
    document.getElementById("kaiju-codex-ataque-nome").textContent = "ROLE PARA DESCOBRIR";
    document.getElementById("kaiju-codex-ataque-dano").textContent = "—";
    document.getElementById("kaiju-codex-ataque-descricao").textContent = "Seu próximo ataque aparecerá aqui.";
    document.getElementById("kaiju-codex-resultado").classList.remove("rolando");
    const botao = document.getElementById("kaiju-codex-botao-roleta");
    if (botao) {
        botao.disabled = false;
        botao.textContent = "🎲 ROLAR ATAQUE";
    }
}

function atualizarHistoricoCodex() {
    const lista = document.getElementById("kaiju-codex-historico-lista");
    if (!lista) return;

    lista.innerHTML = historicoCodexKaijus.length
        ? historicoCodexKaijus.map(item => `
            <span><strong>${escaparTextoKaiju(item.carta)}</strong> ${escaparTextoKaiju(item.nome)} · ${Number(item.dano) === 0 ? "efeito" : `dano ${escaparTextoKaiju(item.dano)}`}</span>
        `).join("")
        : "<span>Nenhum ataque sorteado ainda.</span>";
}

function cancelarRoletaCodex() {
    if (intervaloRoletaCodex !== null) window.clearInterval(intervaloRoletaCodex);
    if (esperaRoletaCodex !== null) window.clearTimeout(esperaRoletaCodex);
    intervaloRoletaCodex = null;
    esperaRoletaCodex = null;
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

document.addEventListener("click", evento => {
    if (evento.target?.id === "kaiju-codex-modal") fecharCodexKaiju();
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && document.getElementById("kaiju-codex-modal")?.classList.contains("aberto")) {
        fecharCodexKaiju();
    }
});

document.addEventListener("usuarioAutenticado", () => {
    catalogoKaijusRegistro = [];
    pecasKaijusRegistro = [];
    kaijusDerrotadosRegistro = new Set();
    if (paginaAtual === "kaijus") carregarRegistroKaijus();
});

function obterCodexKaiju(id){
    const registro=catalogoKaijusRegistro.find(k=>k.id===id);
    if(registro&&(registro.personalizado||Object.keys(registro.ataques||{}).length))return {vida:registro.vida,agilidade:registro.agilidade,defesa:registro.defesa,codex:registro.codex_texto||registro.descricao,ataques:registro.ataques||{}};
    return CODEX_KAIJUS[id];
}
