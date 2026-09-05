// ======================================
// APRIMORAMENTOS.JS
// Oficina de aprimoramento dos itens dos tripulantes
// ======================================

const CHAVE_APRIMORAMENTOS = "nave3b_aprimoramentos_v1";
const CHAVE_INVENTARIO_ITENS = "nave3b_inventario_itens_v2";

function carregarInventariosItens(){
    try { return JSON.parse(localStorage.getItem(CHAVE_INVENTARIO_ITENS) || "{}"); } catch { return {}; }
}
function salvarInventariosItens(dados){ localStorage.setItem(CHAVE_INVENTARIO_ITENS, JSON.stringify(dados || {})); }
function obterItensDoTripulante(tripulanteId){
    const id=String(tripulanteId || window.usuarioAtual?.id || "local");
    const dados=carregarInventariosItens();
    return Array.isArray(dados[id]) ? [...new Set(dados[id])] : [];
}
function definirItensDoTripulante(tripulanteId, ids){
    const id=String(tripulanteId || window.usuarioAtual?.id || "local");
    const dados=carregarInventariosItens();
    const validos=new Set(CATALOGO_ITENS_APRIMORAMENTO.map(i=>i.id));
    dados[id]=[...new Set(ids || [])].filter(x=>validos.has(x));
    salvarInventariosItens(dados);
    return dados[id];
}
function adicionarItemAoTripulante(tripulanteId,itemId){
    return definirItensDoTripulante(tripulanteId,[...obterItensDoTripulante(tripulanteId),itemId]);
}
function removerItemDoTripulante(tripulanteId,itemId){
    return definirItensDoTripulante(tripulanteId,obterItensDoTripulante(tripulanteId).filter(id=>id!==itemId));
}
function serializarInventarioFicha(ids){ return JSON.stringify({versao:2,itens:[...new Set(ids||[])]}); }
function interpretarInventarioFicha(valor){
    if(!valor) return [];
    try { const obj=JSON.parse(valor); return Array.isArray(obj?.itens)?obj.itens:[]; } catch { return []; }
}
function obterAprimoramentosItem(tripulanteId,itemId){
    const dados=carregarAprimoramentos();
    return dados[`${String(tripulanteId)}::${itemId}`] || {};
}

const CATALOGO_ITENS_APRIMORAMENTO = [
    { id:"manoplas-porco", nome:"Manoplas do Porco Kaiju", origem:"Kaiju Porco", cartas:[1,2,9,10], dano:5, tipo:"Arma", descricao:"Combinação Esmagadora: para cada soco usado em sequência (turnos consecutivos), adicione +1 de dano acumulativo ao ataque." },
    { id:"olho-porco", nome:"Olho do Porco Kaiju", origem:"Kaiju Porco", cartas:["J"], dano:0, tipo:"Suporte", descricao:"Visão do Porco Caído: permite ver as próximas 3 cartas do topo do baralho e colocar uma no topo, garantindo o próximo saque." },
    { id:"martelo-femur", nome:"Martelo Fêmur", origem:"Kaiju Porco", cartas:[4,8], dano:6, danoSecundario:4, tipo:"Arma AoE", descricao:"Onda de Choque (AoE): causa 6 de dano no alvo principal e 4 de dano nos demais inimigos da área." },
    { id:"guincho-porco", nome:"Guincho do Porco", origem:"Kaiju Porco", cartas:["Q"], dano:0, tipo:"Condicional", descricao:"Com HP ≤ 50%, escolha uma carta de dano já usada no descarte e cause 2x o dano. Com HP > 50%, cura 4 de vida." },
    { id:"lingua-cobra", nome:"Língua de Cobra", origem:"Serpente Falante", cartas:[4,8], dano:4, tipo:"Arma", descricao:"Memória Tática: acertar o nome do último ataque do chefe antes de rolar o dano eleva o ataque para 12." },
    { id:"mascara-cobra", nome:"Máscara de Cobra", origem:"Serpente Falante", cartas:[6,7,8], dano:0, tipo:"Defensivo", descricao:"Contra-ataque: 50% de chance de esquivar de 100% do dano e refletir tudo de volta." },
    { id:"laminas-gemeas", nome:"Lâminas Gêmeas", origem:"Serpente Falante", cartas:[1,2,3,4], dano:9, danoParcial:5, tipo:"Arma", descricao:"Equipar apenas 2 cartas causa 5 de dano. Dedicar as cartas 1, 2, 3 e 4 causa 9 de dano por acerto." },
    { id:"lamina-vorpal", nome:"Lâmina Vorpal", origem:"Serpente Falante", cartas:[1,3,9,10], dano:5, tipo:"Arma", descricao:"Se a Velocidade do Mecha for maior que a do inimigo, o dano triplica para 15. Enquanto equipada, recebe -2 de Defesa Fixa." },
    { id:"coracao-verdejante", nome:"Coração Verdejante", origem:"Kaiju Rei Verdejante", cartas:["Q"], dano:0, tipo:"Artefato", descricao:"Sobrecarga: sacrifica 4 HP do Mecha e concede +10 de dano ao próximo ataque com qualquer arma." },
    { id:"lamina-verdejante", nome:"Lâmina Verdejante", origem:"Kaiju Rei Verdejante", cartas:[4,5,6], dano:5, tipo:"Arma", descricao:"Condicional: se a carta do inimigo neste turno for ímpar, a lâmina causa 8 de dano no total." },
    { id:"canhao-verdejante", nome:"Canhão Verdejante", origem:"Kaiju Rei Verdejante", cartas:[2,8], dano:15, tipo:"Arma", descricao:"Recarga: começa carregado. Depois do disparo, tirar 2 ou 8 causa 0 de dano naquele acionamento e recarrega a arma." },
    { id:"vigilancia-verdejante", nome:"Vigilância Verdejante", origem:"Kaiju Rei Verdejante", cartas:["K"], dano:0, tipo:"Drone", descricao:"Invocação (15 HP): cria um drone. Enquanto ativo, ataques bem-sucedidos recebem +4 de dano, e o drone absorve dano antes do Mecha." }
];

const CATEGORIAS_APRIMORAMENTO = {
    cartas: {
        nome:"Capacidade de Cartas", icone:"🃏",
        raridades:{
            comum:"Pode ser usado em +1 carta à escolha do jogador.",
            incomum:"Pode ser usado em +2 cartas à escolha do jogador.",
            raro:"Pode ser usado em +3 cartas à escolha do jogador."
        }
    },
    atributo: {
        nome:"Aprimoramento de Atributo", icone:"⚡",
        raridades:{
            comum:"Dano do item aumentado em 20%.",
            incomum:"Dano do item aumentado em 40%.",
            raro:"Dano do item aumentado em 60%."
        }
    },
    adicional: {
        nome:"Atributo Adicional", icone:"✦",
        raridades:{ comum:"Ágil ou Envenenamento", incomum:"Fraqueza ou Curandeiro", raro:"Cegueira ou Lentidão" }
    }
};

const EFEITOS_ADICIONAIS = {
    comum:[
        {nome:"Ágil", texto:"Independente da agilidade do Kaiju, o jogador ataca antes."},
        {nome:"Envenenamento", texto:"O dano extra causado no turno atual se mantém como dano adicional no turno seguinte."}
    ],
    incomum:[
        {nome:"Fraqueza", texto:"Diminui em 50% o dano que o Kaiju causa no jogador."},
        {nome:"Curandeiro", texto:"O jogador recupera 15 de vida."}
    ],
    raro:[
        {nome:"Cegueira", texto:"O ataque do Kaiju não acerta o jogador."},
        {nome:"Lentidão", texto:"Passa a carta atual do Kaiju."}
    ]
};

let estadoOficina = { tripulanteId:"", itemId:"", girando:false, salvaVidas:null, carregandoSaldo:false, rotacaoRoleta:0 };

function telaAprimoramentos(){
    return `
    <section class="aprimoramento-pagina">
        <div class="apr-hero">
            <div><span class="apr-kicker">SETOR DE ENGENHARIA • MÓDULO EXPERIMENTAL</span><h2>Oficina de Aprimoramento</h2><p>Use um Salva-Vidas para recalibrar um item. Cada item aceita apenas um aprimoramento em cada categoria.</p></div>
            <div class="apr-status"><span class="apr-status-ponto"></span><div><strong>SISTEMA OPERACIONAL</strong><small>Probabilidade calibrada: 70 / 20 / 10</small></div></div>
        </div>

        <div class="apr-layout">
            <aside class="apr-painel apr-controles">
                <div class="apr-passo"><span>01</span><div><strong>TRIPULANTE</strong><small>Selecione quem receberá o aprimoramento</small></div></div>
                <select id="apr-tripulante" class="apr-select"></select>

                <div class="apr-passo"><span>02</span><div><strong>ITEM</strong><small>Escolha um item que este tripulante possui</small></div></div>
                <div id="apr-lista-itens" class="apr-lista-itens"></div>
            </aside>

            <main class="apr-painel apr-oficina">
                <div id="apr-item-detalhe" class="apr-item-detalhe"></div>
                <div class="apr-roleta-area">
                    <div class="apr-roleta-wrap">
                        <div class="apr-ponteiro">▼</div>
                        <div id="apr-roleta" class="apr-roleta">
                            <div class="apr-roleta-miolo">N3B</div>
                        </div>
                    </div>
                    <div class="apr-legenda-raridade">
                        <span><i class="comum"></i> Comum 70%</span><span><i class="incomum"></i> Incomum 20%</span><span><i class="raro"></i> Raro 10%</span>
                    </div>
                    <button id="btn-aprimorar-item" class="apr-botao-principal" type="button">⚙ APRIMORAR ITEM</button>
                    <small id="apr-custo-info">Consome 1 Salva-Vidas do tripulante selecionado.</small>
                </div>
            </main>

            <aside class="apr-painel apr-registro">
                <div class="apr-passo"><span>03</span><div><strong>APRIMORAMENTOS</strong><small>Progresso do item selecionado</small></div></div>
                <div id="apr-slots"></div>
                <button id="btn-apr-regras" class="apr-botao-secundario" type="button">ⓘ VER TODAS AS REGRAS</button>
            </aside>
        </div>
        <div id="apr-modal" class="apr-modal-overlay" hidden></div>
    </section>`;
}

function inicializarPaginaAprimoramentos(){
    const tripulantes = obterTripulantesAprimoramento();
    const select = document.getElementById("apr-tripulante");
    if (!select) return;
    select.innerHTML = tripulantes.map(t=>`<option value="${escApr(t.id)}">${escApr(t.nome)}</option>`).join("") || '<option value="local">Tripulante Atual</option>';
    if (window.usuarioAtual?.id) select.value = window.usuarioAtual.id;
    estadoOficina.tripulanteId = select.value || "local";
    const iniciais=obterItensDoTripulante(estadoOficina.tripulanteId);
    estadoOficina.itemId = iniciais[0] || "";
    select.addEventListener("change",async()=>{
        estadoOficina.tripulanteId=select.value;
        estadoOficina.salvaVidas=null;
        const ids=obterItensDoTripulante(estadoOficina.tripulanteId);
        estadoOficina.itemId=ids[0]||"";
        renderizarOficinaAprimoramento();
        await atualizarSaldoSalvaVidas();
    });
    document.getElementById("btn-aprimorar-item")?.addEventListener("click", iniciarAprimoramento);
    document.getElementById("btn-apr-regras")?.addEventListener("click", abrirRegrasAprimoramento);
    renderizarOficinaAprimoramento();
    atualizarSaldoSalvaVidas();
}

function obterTripulantesAprimoramento(){
    const mapa = new Map();
    if (window.profileAtual || window.usuarioAtual) {
        const id=window.usuarioAtual?.id || "local";
        const nome=window.profileAtual?.nome || window.profileAtual?.username || "Meu Tripulante";
        mapa.set(String(id), {id:String(id),nome});
    }
    if (typeof banco!=="undefined" && Array.isArray(banco.frotas)) {
        banco.frotas.forEach(f=> (f.integrantes||[]).forEach(i=> mapa.set(String(i.id),{id:String(i.id),nome:i.nome||i.username||"Tripulante"})));
    }
    return [...mapa.values()].sort((a,b)=>a.nome.localeCompare(b.nome,"pt-BR"));
}

function carregarAprimoramentos(){ try{return JSON.parse(localStorage.getItem(CHAVE_APRIMORAMENTOS)||"{}")}catch{return {}} }
function salvarAprimoramentos(d){ localStorage.setItem(CHAVE_APRIMORAMENTOS,JSON.stringify(d)); }
function chaveRegistro(){ return `${estadoOficina.tripulanteId}::${estadoOficina.itemId}`; }
function registroAtual(){ return carregarAprimoramentos()[chaveRegistro()] || {}; }

function renderizarOficinaAprimoramento(){
    const idsPossuidos=obterItensDoTripulante(estadoOficina.tripulanteId);
    const itensPossuidos=CATALOGO_ITENS_APRIMORAMENTO.filter(i=>idsPossuidos.includes(i.id));
    if(!itensPossuidos.some(i=>i.id===estadoOficina.itemId)) estadoOficina.itemId=itensPossuidos[0]?.id || "";
    const item=itensPossuidos.find(i=>i.id===estadoOficina.itemId) || null;
    const lista=document.getElementById("apr-lista-itens");
    if(lista){
        lista.innerHTML=itensPossuidos.length ? itensPossuidos.map(i=>`<button class="apr-item-mini ${i.id===estadoOficina.itemId?'ativo':''}" data-item-id="${i.id}" type="button"><span>${iconeTipo(i.tipo)}</span><div><strong>${escApr(i.nome)}</strong><small>${escApr(i.origem)} • ${escApr(i.tipo)}</small></div></button>`).join("") : `<div class="apr-sem-itens"><span>🎒</span><strong>NENHUM ITEM EQUIPADO</strong><p>Adicione itens primeiro em <b>Ficha do Tripulante → Todos os Itens</b>.</p></div>`;
    }
    document.querySelectorAll(".apr-item-mini").forEach(b=>b.addEventListener("click",()=>{estadoOficina.itemId=b.dataset.itemId;renderizarOficinaAprimoramento();}));

    const detalhe=document.getElementById("apr-item-detalhe");
    if(detalhe) detalhe.innerHTML=item ? `<div class="apr-item-icone">${iconeTipo(item.tipo)}</div><div class="apr-item-copy"><span>${escApr(item.origem)}</span><h3>${escApr(item.nome)}</h3><p>${escApr(item.descricao)}</p><div class="apr-chips"><b>Cartas: ${item.cartas.length?item.cartas.join(", "):"não informadas"}</b><b>Dano: ${formatarDanoItemApr(item)}</b><b>${escApr(item.tipo)}</b></div></div>` : `<div class="apr-item-vazio"><span>◇</span><div><h3>Selecione um item do inventário</h3><p>A oficina só aceita equipamentos adicionados à ficha do tripulante.</p></div></div>`;
    renderizarSlotsAprimoramento();
    atualizarBotaoAprimorar();
}

function formatarDanoItemApr(item){
    if(item.danoSecundario!=null) return `${item.dano} / ${item.danoSecundario}`;
    if(item.danoParcial!=null) return `${item.danoParcial} parcial / ${item.dano} total`;
    return String(item.dano ?? 0);
}

function renderizarSlotsAprimoramento(){
    const reg=registroAtual();
    const box=document.getElementById("apr-slots"); if(!box)return;
    if(!estadoOficina.itemId){ box.innerHTML='<div class="apr-slots-vazio">Selecione um item possuído para consultar os aprimoramentos.</div>'; return; }
    box.innerHTML=Object.entries(CATEGORIAS_APRIMORAMENTO).map(([ch,c])=>{
        const a=reg[ch];
        return `<div class="apr-slot ${a?'concluido':''}"><div class="apr-slot-top"><span>${c.icone}</span><div><strong>${c.nome}</strong><small>${a?`${rotuloRaridade(a.raridade)} • concluído`:"Disponível para sorteio"}</small></div>${a?'<b>✓</b>':'<b>—</b>'}</div>${a?`<p>${escApr(a.texto)}</p>`:""}</div>`;
    }).join("");
}

async function atualizarSaldoSalvaVidas(){
    const info=document.getElementById("apr-custo-info");
    if(!estadoOficina.tripulanteId){ estadoOficina.salvaVidas=0; atualizarBotaoAprimorar(); return; }
    const usuarioConsultado=estadoOficina.tripulanteId;
    estadoOficina.carregandoSaldo=true; atualizarBotaoAprimorar();
    if(info) info.textContent="Consultando Salva-Vidas na ficha do tripulante...";
    try{
        const {data,error}=await supabaseClient.from("fichas_tripulantes")
            .select("id, salva_vidas, itens_catalogo, aprimoramentos_itens")
            .eq("id",usuarioConsultado)
            .maybeSingle();
        if(error) throw error;
        if(usuarioConsultado!==estadoOficina.tripulanteId) return;
        if(Array.isArray(data?.itens_catalogo)) definirItensDoTripulante(usuarioConsultado,data.itens_catalogo);
        let aprimoramentosServidor=data?.aprimoramentos_itens||{};
        const dadosLocais=carregarAprimoramentos();
        if(usuarioConsultado===window.usuarioAtual?.id){
            const importar={};
            for(const [chave,valor]of Object.entries(dadosLocais)){
                const [uid,item]=chave.split("::");
                if(uid===usuarioConsultado) importar[item]=valor;
            }
            if(Object.keys(importar).length){
                const migracao=await supabaseClient.rpc("combate_importar_aprimoramentos",{p_registros:importar});
                if(migracao.error)throw migracao.error;
                aprimoramentosServidor=migracao.data;
            }
        }
        if(usuarioConsultado!==estadoOficina.tripulanteId)return;
        for(const [item,valor]of Object.entries(aprimoramentosServidor))dadosLocais[`${usuarioConsultado}::${item}`]=valor;
        try{salvarAprimoramentos(dadosLocais);}catch(erroCache){console.warn("Aprimoramentos disponíveis no servidor, cache local indisponível.");}
        estadoOficina.salvaVidas=Math.max(0,Number(data?.salva_vidas||0));
        renderizarOficinaAprimoramento();
    }catch(erro){
        console.error("Erro ao consultar Salva-Vidas:",erro);
        if(usuarioConsultado!==estadoOficina.tripulanteId) return;
        estadoOficina.salvaVidas=0;
        if(typeof mostrarNotificacao==="function") mostrarNotificacao("Não foi possível consultar os Salva-Vidas da ficha.","error");
    }finally{
        if(usuarioConsultado===estadoOficina.tripulanteId){
            estadoOficina.carregandoSaldo=false;
            atualizarBotaoAprimorar();
        }
    }
}

function atualizarBotaoAprimorar(){
    const btn=document.getElementById("btn-aprimorar-item"); if(!btn)return;
    const info=document.getElementById("apr-custo-info");
    const reg=registroAtual(); const completos=Object.keys(CATEGORIAS_APRIMORAMENTO).every(k=>reg[k]);
    const semItem=!estadoOficina.itemId;
    const semSalvaVidas=Number(estadoOficina.salvaVidas||0)<1;
    const outroTripulante=estadoOficina.tripulanteId!==window.usuarioAtual?.id;
    btn.disabled=semItem || completos || estadoOficina.girando || estadoOficina.carregandoSaldo || semSalvaVidas || outroTripulante;
    const seletor=document.getElementById("apr-tripulante");
    if(seletor) seletor.disabled=estadoOficina.girando;
    document.querySelectorAll(".apr-item-mini").forEach(b=>b.disabled=estadoOficina.girando);
    if(outroTripulante) btn.textContent="CONSULTA DE OUTRO TRIPULANTE";
    else if(estadoOficina.carregandoSaldo) btn.textContent="CONSULTANDO FICHA...";
    else if(semItem) btn.textContent="ADICIONE UM ITEM NA FICHA";
    else if(completos) btn.textContent="✓ ITEM TOTALMENTE APRIMORADO";
    else if(estadoOficina.girando) btn.textContent="CALIBRANDO...";
    else if(semSalvaVidas) btn.textContent="SEM SALVA-VIDAS";
    else btn.textContent="⚙ APRIMORAR ITEM";

    if(info){
        if(estadoOficina.carregandoSaldo) info.textContent="Consultando Salva-Vidas na ficha do tripulante...";
        else if(semSalvaVidas) info.textContent="Este tripulante não possui Salva-Vidas. Não é possível aprimorar.";
        else info.textContent=`Saldo: ${estadoOficina.salvaVidas} Salva-Vidas • este aprimoramento consumirá 1.`;
    }
}

function anguloAlvoDaRaridade(raridade){
    // O conic-gradient começa no topo e avança no sentido horário:
    // comum 0..252°, incomum 252..324°, raro 324..360°.
    // Sorteamos um ponto seguro dentro do setor, longe das divisórias.
    const faixas={comum:[12,240],incomum:[260,316],raro:[330,354]};
    const [min,max]=faixas[raridade]||faixas.comum;
    return min+Math.random()*(max-min);
}

function girarRoletaParaRaridade(raridade){
    const roleta=document.getElementById("apr-roleta");
    if(!roleta) return;
    const alvo=anguloAlvoDaRaridade(raridade);
    // Para que o ponto 'alvo' termine exatamente sob a seta fixa do topo,
    // a roleta precisa terminar com rotação modular 360 - alvo.
    const moduloDesejado=(360-alvo)%360;
    const atual=Number(estadoOficina.rotacaoRoleta||0);
    const moduloAtual=((atual%360)+360)%360;
    const ajuste=(moduloDesejado-moduloAtual+360)%360;
    const voltasCompletas=(4+Math.floor(Math.random()*3))*360;
    estadoOficina.rotacaoRoleta=atual+voltasCompletas+ajuste;
    roleta.style.transform=`rotate(${estadoOficina.rotacaoRoleta}deg)`;
}

async function iniciarAprimoramento(){
    if(estadoOficina.girando || estadoOficina.carregandoSaldo || !estadoOficina.itemId || estadoOficina.tripulanteId!==window.usuarioAtual?.id)return;
    if(!obterItensDoTripulante(estadoOficina.tripulanteId).includes(estadoOficina.itemId)) return;
    const reg=registroAtual();
    const disponiveis=Object.keys(CATEGORIAS_APRIMORAMENTO).filter(k=>!reg[k]);
    if(!disponiveis.length)return;

    const alvo={tripulanteId:estadoOficina.tripulanteId,itemId:estadoOficina.itemId};
    estadoOficina.girando=true; atualizarBotaoAprimorar();
    try{
        const categoria=disponiveis[Math.floor(Math.random()*disponiveis.length)];
        const roll=Math.random()*100; const raridade=roll<70?"comum":roll<90?"incomum":"raro";
        atualizarBotaoAprimorar();
        const ponteiro=document.querySelector(".apr-ponteiro");
        if(ponteiro) ponteiro.className="apr-ponteiro girando";
        girarRoletaParaRaridade(raridade);
        // Salva antes da animação: navegar não pode perder ou redirecionar o resultado.
        const texto=await concluirAprimoramento(categoria,raridade,alvo);
        setTimeout(()=>{
            estadoOficina.girando=false;
            renderizarOficinaAprimoramento();
            const ponteiro=document.querySelector(".apr-ponteiro");
            if(ponteiro) ponteiro.className="apr-ponteiro resultado";
            if(estadoOficina.tripulanteId===alvo.tripulanteId && estadoOficina.itemId===alvo.itemId)
                abrirResultadoAprimoramento(categoria,raridade,texto);
        },2700);
    }catch(erro){
        console.error("Erro ao consumir Salva-Vidas:",erro);
        estadoOficina.girando=false;
        await atualizarSaldoSalvaVidas();
        if(typeof mostrarNotificacao==="function") mostrarNotificacao("Não foi possível consumir o Salva-Vidas da ficha. Reabra a oficina para conferir o resultado no servidor antes de tentar novamente.","error");
    }
}

async function concluirAprimoramento(categoria,raridade,alvo=estadoOficina){
    const item=CATALOGO_ITENS_APRIMORAMENTO.find(i=>i.id===alvo.itemId);
    const dados=carregarAprimoramentos(); const chave=`${alvo.tripulanteId}::${alvo.itemId}`; const reg=dados[chave]||{};
    let texto=CATEGORIAS_APRIMORAMENTO[categoria].raridades[raridade]; let extra=null;
    if(categoria==="atributo" && item?.dano>0){
        const p={comum:.2,incomum:.4,raro:.6}[raridade];
        texto += ` Dano base ${item.dano} → ${(item.dano*(1+p)).toFixed(1).replace('.0','')}.`;
    }
    if(categoria==="adicional"){
        const efeitos=EFEITOS_ADICIONAIS[raridade]; extra=efeitos[Math.floor(Math.random()*efeitos.length)];
        let chance=100;
        if(raridade!=="comum" && item?.cartas?.length) chance=Math.round((100/item.cartas.length)*100)/100;
        texto=`${extra.nome}: ${extra.texto}` + (raridade!=="comum" ? ` Chance de ativação: ${chance}% por carta do item.` : "");
    }
    const resultado={raridade,texto,efeito:extra?.nome||null,data:new Date().toISOString()};
    const {data:gravado,error}=await supabaseClient.rpc("combate_aprimorar",{
        p_item:alvo.itemId,p_categoria:categoria,p_resultado:resultado
    });
    if(error) throw error;
    estadoOficina.salvaVidas=gravado.saldo;
    // O servidor já confirmou custo e resultado atomicamente. Cache local é secundário.
    if(typeof minhaFicha!=="undefined" && minhaFicha?.id===alvo.tripulanteId){
        minhaFicha.salva_vidas=gravado.saldo;minhaFicha.aprimoramentos_itens=gravado.aprimoramentos;
    }
    for(const [id,valor] of Object.entries(gravado.aprimoramentos||{})) dados[`${alvo.tripulanteId}::${id}`]=valor;
    try { salvarAprimoramentos(dados); } catch(erroCache) { console.warn("Cache local indisponível; resultado salvo no servidor."); }
    return texto;
}

function abrirResultadoAprimoramento(categoria,raridade,texto){
    const modal=document.getElementById("apr-modal"); if(!modal)return;
    modal.hidden=false; modal.innerHTML=`<div class="apr-modal-card resultado ${raridade}"><button class="apr-fechar" type="button">×</button><span class="apr-modal-selo">APRIMORAMENTO CONCLUÍDO</span><div class="apr-raridade-grande">${rotuloRaridade(raridade)}</div><h3>${CATEGORIAS_APRIMORAMENTO[categoria].icone} ${CATEGORIAS_APRIMORAMENTO[categoria].nome}</h3><p>${escApr(texto)}</p><button class="apr-botao-principal apr-ok" type="button">CONFIRMAR</button></div>`;
    modal.querySelectorAll(".apr-fechar,.apr-ok").forEach(b=>b.addEventListener("click",()=>modal.hidden=true));
    modal.addEventListener("click",e=>{if(e.target===modal)modal.hidden=true},{once:true});
}

function abrirRegrasAprimoramento(){
    const modal=document.getElementById("apr-modal"); if(!modal)return;
    modal.hidden=false; modal.innerHTML=`<div class="apr-modal-card regras"><button class="apr-fechar" type="button">×</button><span class="apr-modal-selo">BANCO DE DADOS • ENGENHARIA</span><h3>Regras de Aprimoramento</h3><p>Cada item pode receber no máximo 1 melhoria de cada categoria. Uma categoria já concluída é removida dos próximos sorteios.</p><div class="apr-regras-grid">${Object.entries(CATEGORIAS_APRIMORAMENTO).map(([k,c])=>`<div><h4>${c.icone} ${c.nome}</h4><p><b>Comum 70%</b> — ${c.raridades.comum}</p><p><b>Incomum 20%</b> — ${c.raridades.incomum}</p><p><b>Raro 10%</b> — ${c.raridades.raro}</p></div>`).join("")}</div><p class="apr-nota">Atributos adicionais incomuns e raros usam a regra de probabilidade 100% ÷ quantidade de cartas do item quando essa quantidade é conhecida.</p></div>`;
    modal.querySelector(".apr-fechar")?.addEventListener("click",()=>modal.hidden=true);
}

function rotuloRaridade(r){ return ({comum:"COMUM",incomum:"INCOMUM",raro:"RARO"})[r]||r; }
function iconeTipo(t){ if(/drone/i.test(t))return"🛸"; if(/defens/i.test(t))return"🛡️"; if(/suporte|artefato|condicional/i.test(t))return"◈"; return"⚔️"; }
function escApr(v){return String(v??"").replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));}
