// ======================================
// APRIMORAMENTOS.JS
// Oficina de aprimoramento dos itens dos tripulantes
// ======================================

const CHAVE_APRIMORAMENTOS = "nave3b_aprimoramentos_v1";
const CHAVE_INVENTARIO_ITENS = "nave3b_inventario_itens_v2";

function carregarInventariosItens(){
    if(cacheInventarios===null){try { cacheInventarios=JSON.parse(localStorage.getItem(CHAVE_INVENTARIO_ITENS) || "{}"); } catch { cacheInventarios={}; }}return structuredClone(cacheInventarios);
}
function salvarInventariosItens(dados){ cacheInventarios=structuredClone(dados||{});try{localStorage.setItem(CHAVE_INVENTARIO_ITENS, JSON.stringify(cacheInventarios));}catch{} }
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

let estadoOficina = {tripulanteId:'',itemId:'',girando:false,salvaVidas:0,carregandoSaldo:false,erro:'',rotacaoRoleta:0,ultimo:null};
const fichasOficina=new Map();
let cacheAprimoramentos=null, cacheInventarios=null;

function telaAprimoramentos(){return `
<section class="aprimoramento-pagina n-workspace" id="pagina-oficina">
 <div class="n-heading"><div><span class="n-kicker">Engenharia</span><h2>Oficina de aprimoramento</h2><p>Um equipamento. Três possibilidades de evolução.</p></div><button type="button" id="btn-apr-regras">Como funciona</button></div>
 <div id="apr-erro" role="alert" hidden></div>
 <div class="apr-layout">
  <aside class="apr-painel apr-controles"><label for="apr-tripulante">Tripulante</label><select id="apr-tripulante" class="apr-select"></select><h3>Equipamentos</h3><p class="n-note">Itens adicionados à ficha</p><div id="apr-lista-itens" class="apr-lista-itens"></div><button type="button" id="apr-atualizar">Atualizar ficha</button></aside>
  <div class="apr-conteudo">
   <section class="apr-painel"><div id="apr-item-detalhe" class="apr-item-detalhe"></div><div class="apr-progress-heading"><h3>Melhorias do item</h3><span id="apr-progresso" class="n-badge"></span></div><div id="apr-slots"></div></section>
   <section class="apr-painel apr-acao"><div class="apr-roleta-wrap" aria-hidden="true"><div class="apr-ponteiro">▼</div><div id="apr-roleta" class="apr-roleta"><div class="apr-roleta-miolo">✦</div></div></div><div><span class="n-kicker">Próxima melhoria</span><h3>Recalibrar equipamento</h3><p>Uma categoria disponível é sorteada. Cada tentativa custa <strong>1 Salva-Vidas</strong>.</p><div class="apr-legenda-raridade"><span><i class="comum"></i>Comum 70%</span><span><i class="incomum"></i>Incomum 20%</span><span><i class="raro"></i>Raro 10%</span></div><button id="btn-aprimorar-item" class="apr-botao-principal" type="button">Aprimorar item</button><p id="apr-custo-info" role="status"></p></div></section>
   <div id="apr-ultimo" aria-live="polite"></div>
  </div>
 </div>
</section>`;}

async function inicializarPaginaAprimoramentos(){
 const select=document.getElementById('apr-tripulante');if(!select)return;
 select.innerHTML=obterTripulantesAprimoramento().map(t=>`<option value="${escApr(t.id)}">${escApr(t.nome)}</option>`).join('');
 select.value=window.usuarioAtual?.id||'';estadoOficina.tripulanteId=select.value;
 select.addEventListener('change',()=>{estadoOficina.tripulanteId=select.value;estadoOficina.itemId='';estadoOficina.ultimo=null;atualizarSaldoSalvaVidas();});
 document.getElementById('btn-aprimorar-item').addEventListener('click',iniciarAprimoramento);
 document.getElementById('btn-apr-regras').addEventListener('click',abrirRegrasAprimoramento);
 document.getElementById('apr-atualizar').addEventListener('click',atualizarSaldoSalvaVidas);
 await atualizarSaldoSalvaVidas();
}
function obterTripulantesAprimoramento(){
 const mapa=new Map(),id=window.usuarioAtual?.id;
 if(id)mapa.set(id,{id,nome:window.profileAtual?.nome||window.profileAtual?.username||'Meu tripulante'});
 for(const f of banco.frotas||[])for(const i of f.integrantes||[])mapa.set(String(i.id),{id:String(i.id),nome:i.nome||i.username||'Tripulante'});
 return [...mapa.values()].sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR'));
}
function carregarAprimoramentos(){if(cacheAprimoramentos===null){try{cacheAprimoramentos=JSON.parse(localStorage.getItem(CHAVE_APRIMORAMENTOS)||'{}');}catch{cacheAprimoramentos={};}}return structuredClone(cacheAprimoramentos);}
function salvarAprimoramentos(d){cacheAprimoramentos=structuredClone(d||{});try{localStorage.setItem(CHAVE_APRIMORAMENTOS,JSON.stringify(cacheAprimoramentos));}catch{}}
function chaveRegistro(){return `${estadoOficina.tripulanteId}::${estadoOficina.itemId}`;}
function registroAtual(){return fichasOficina.get(estadoOficina.tripulanteId)?.aprimoramentos_itens?.[estadoOficina.itemId]||{};}
function pendenciaOficina(alvo=estadoOficina,criar=false){
 const key='nave7-sorteio:'+alvo.tripulanteId+':'+alvo.itemId;
 let id;try{id=localStorage.getItem(key);}catch{}id=id||operacoesOficina.get(key);
 if(!id&&criar){id=NaveDados.uuid();operacoesOficina.set(key,id);try{localStorage.setItem(key,id);}catch{}}
 return {key,id};
}
const operacoesOficina=new Map();
function limparPendenciaOficina(p){operacoesOficina.delete(p.key);try{localStorage.removeItem(p.key);}catch{}}
function renderizarOficinaAprimoramento(){
 if(!document.getElementById('pagina-oficina'))return;
 const ficha=fichasOficina.get(estadoOficina.tripulanteId),ids=ficha?.itens_catalogo||[];
 const items=CATALOGO_ITENS_APRIMORAMENTO.filter(i=>ids.includes(i.id));
 if(!items.some(i=>i.id===estadoOficina.itemId))estadoOficina.itemId=items[0]?.id||'';
 const item=items.find(i=>i.id===estadoOficina.itemId),reg=registroAtual();
 document.getElementById('apr-lista-itens').innerHTML=items.map(i=>`<button type="button" class="apr-item-mini ${i.id===estadoOficina.itemId?'ativo':''}" data-item-id="${escApr(i.id)}" aria-pressed="${i.id===estadoOficina.itemId}"><span>${iconeTipo(i.tipo)}</span><div><strong>${escApr(i.nome)}</strong><small>${escApr(i.origem)}</small></div></button>`).join('')||`<div class="n-empty"><h3>${estadoOficina.carregandoSaldo?'Carregando…':'Sem equipamentos'}</h3><p>Adicione os equipamentos na Ficha do Tripulante para aprimorá-los.</p><button type="button" onclick="abrirPagina('ficha')">Abrir minha ficha</button></div>`;
 document.querySelectorAll('.apr-item-mini').forEach(b=>b.addEventListener('click',()=>{estadoOficina.itemId=b.dataset.itemId;renderizarOficinaAprimoramento();}));
 document.getElementById('apr-item-detalhe').innerHTML=item?`<div class="apr-item-icone">${iconeTipo(item.tipo)}</div><div class="apr-item-copy"><span>${escApr(item.origem)}</span><h3>${escApr(item.nome)}</h3><p>${escApr(item.descricao)}</p><div class="apr-chips"><b>Cartas ${escApr(item.cartas.map(c=>String(c)==='1'?'A':c).join(' · '))}</b><b>Dano ${escApr(formatarDanoItemApr(item))}</b><b>${escApr(item.tipo)}</b></div></div>`:'<div class="n-empty"><h3>Escolha um equipamento</h3><p>As melhorias aparecerão aqui.</p></div>';
 document.getElementById('apr-progresso').textContent=`${Object.keys(CATEGORIAS_APRIMORAMENTO).filter(k=>reg[k]).length} de 3 concluídas`;
 renderizarSlotsAprimoramento();atualizarBotaoAprimorar();
 const ultimo=estadoOficina.ultimo;
 document.getElementById('apr-ultimo').innerHTML=ultimo&&ultimo.itemId===estadoOficina.itemId?`<section class="apr-painel apr-resultado ${ultimo.raridade}"><span class="n-kicker">Última melhoria salva</span><h3>${escApr(CATEGORIAS_APRIMORAMENTO[ultimo.categoria].nome)} · ${rotuloRaridade(ultimo.raridade)}</h3><p>${escApr(ultimo.texto)}</p></section>`:'';
}
function formatarDanoItemApr(item){return item.danoSecundario!=null?`${item.dano} / ${item.danoSecundario} em área`:item.danoParcial!=null?`${item.danoParcial} parcial / ${item.dano} completo`:String(item.dano??0);}
function renderizarSlotsAprimoramento(){
 const box=document.getElementById('apr-slots');if(!box)return;const reg=registroAtual();
 box.innerHTML=Object.entries(CATEGORIAS_APRIMORAMENTO).map(([key,c])=>{const a=reg[key];return `<article class="apr-slot ${a?'concluido':''}"><div class="apr-slot-top"><span>${c.icone}</span><div><strong>${c.nome}</strong><small>${a?rotuloRaridade(a.raridade):'Disponível'}</small></div><b>${a?'✓':'—'}</b></div><p>${escApr(a?.texto||{cartas:'Amplie a quantidade de cartas que ativam este item.',atributo:'Aumente o dano do equipamento.',adicional:'Acrescente um efeito automático ao ataque.'}[key])}</p></article>`;}).join('');
}
async function atualizarSaldoSalvaVidas(){
 const id=estadoOficina.tripulanteId;if(!id)return;
 estadoOficina.carregandoSaldo=true;estadoOficina.erro='';renderizarOficinaAprimoramento();
 try{
  await NaveDados.list('catalogo');
  const r=await supabaseClient.from('fichas_tripulantes').select('id,salva_vidas,itens_catalogo,aprimoramentos_itens').eq('id',id).maybeSingle();
  if(r.error)throw r.error;if(id!==estadoOficina.tripulanteId)return;
  const ficha=r.data||{id,salva_vidas:0,itens_catalogo:[],aprimoramentos_itens:{}};
  // Importação V6 só acrescenta categorias antigas ausentes; o servidor prevalece.
  const locais=carregarAprimoramentos(),importar={};
  if(id===window.usuarioAtual?.id&&r.data)for(const [key,valor]of Object.entries(locais)){const [uid,item]=key.split('::');if(uid===id&&Object.keys(valor||{}).some(c=>!ficha.aprimoramentos_itens?.[item]?.[c]))importar[item]=valor;}
  if(Object.keys(importar).length)ficha.aprimoramentos_itens=await NaveDados.request('combate_importar_aprimoramentos',{p_registros:importar});
  if(id!==estadoOficina.tripulanteId)return;
  fichasOficina.set(id,ficha);estadoOficina.salvaVidas=Math.max(0,Number(ficha.salva_vidas||0));
  definirItensDoTripulante(id,ficha.itens_catalogo||[]);
  for(const key of Object.keys(locais))if(key.startsWith(id+'::'))delete locais[key];
  for(const [item,valor]of Object.entries(ficha.aprimoramentos_itens||{}))locais[id+'::'+item]=valor;
  salvarAprimoramentos(locais);
 }catch(e){if(id===estadoOficina.tripulanteId)estadoOficina.erro=NaveDados.message(e);}
 finally{if(id===estadoOficina.tripulanteId){estadoOficina.carregandoSaldo=false;renderizarOficinaAprimoramento();}}
}
function atualizarBotaoAprimorar(){
 const btn=document.getElementById('btn-aprimorar-item');if(!btn)return;
 const s=estadoOficina,completo=Object.keys(CATEGORIAS_APRIMORAMENTO).every(k=>registroAtual()[k]),outro=s.tripulanteId!==window.usuarioAtual?.id,pendente=!!pendenciaOficina().id;
 btn.disabled=!s.itemId||s.girando||s.carregandoSaldo||outro||!!s.erro||(!pendente&&(completo||s.salvaVidas<1));
 btn.textContent=s.girando?'Salvando melhoria…':s.carregandoSaldo?'Consultando ficha…':outro?'Consulta de outro tripulante':pendente?'Conferir último sorteio':completo?'Item totalmente aprimorado':!s.itemId?'Selecione um item':s.salvaVidas<1?'Sem Salva-Vidas':'Aprimorar por 1 Salva-Vidas';
 document.getElementById('apr-custo-info').textContent=s.carregandoSaldo?'Consultando saldo…':`Saldo disponível: ${s.salvaVidas} Salva-Vidas${pendente?' · Há um sorteio aguardando confirmação.':''}`;
 document.querySelectorAll('#apr-tripulante,.apr-item-mini,#apr-atualizar').forEach(b=>b.disabled=s.girando||s.carregandoSaldo);
 const erro=document.getElementById('apr-erro');erro.hidden=!s.erro;erro.className='n-error';erro.textContent=s.erro;
}
function anguloAlvoDaRaridade(r){return {comum:126,incomum:288,raro:342}[r]||126;}
function girarRoletaParaRaridade(r){const roleta=document.getElementById('apr-roleta');if(!roleta)return;const atual=estadoOficina.rotacaoRoleta;estadoOficina.rotacaoRoleta=atual+720+((360-anguloAlvoDaRaridade(r)-atual%360+360)%360);roleta.style.transform=`rotate(${estadoOficina.rotacaoRoleta}deg)`;}
async function iniciarAprimoramento(){
 const s=estadoOficina;if(s.girando||s.carregandoSaldo||!s.itemId||s.tripulanteId!==window.usuarioAtual?.id)return;
 const alvo={tripulanteId:s.tripulanteId,itemId:s.itemId},pendente=pendenciaOficina(alvo,true);
 s.girando=true;s.erro='';atualizarBotaoAprimorar();
 try{
  const gravado=await NaveDados.request('nave_sortear_aprimoramento',{p_item:alvo.itemId,p_operacao:pendente.id});
  limparPendenciaOficina(pendente);
  if(window.usuarioAtual?.id!==alvo.tripulanteId)return;
  s.ultimo={...gravado,itemId:alvo.itemId};s.salvaVidas=gravado.saldo;
  const ficha=fichasOficina.get(alvo.tripulanteId);if(ficha){ficha.salva_vidas=gravado.saldo;ficha.aprimoramentos_itens=gravado.aprimoramentos;}
  if(typeof minhaFicha!=='undefined'&&minhaFicha?.id===alvo.tripulanteId){minhaFicha.salva_vidas=gravado.saldo;minhaFicha.aprimoramentos_itens=gravado.aprimoramentos;}
  const cache=carregarAprimoramentos();for(const [item,valor]of Object.entries(gravado.aprimoramentos||{}))cache[alvo.tripulanteId+'::'+item]=valor;salvarAprimoramentos(cache);
  girarRoletaParaRaridade(gravado.raridade);
  await new Promise(resolve=>setTimeout(resolve,window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100));
  if(document.getElementById('pagina-oficina')&&s.tripulanteId===alvo.tripulanteId&&s.itemId===alvo.itemId)abrirResultadoAprimoramento(gravado.categoria,gravado.raridade,gravado.texto);
  await atualizarSaldoSalvaVidas();
 }catch(e){
  if(e.code)limparPendenciaOficina(pendente);
  mostrarNotificacao(NaveDados.message(e),'error');
 }finally{s.girando=false;renderizarOficinaAprimoramento();}
}
function abrirResultadoAprimoramento(categoria,raridade,texto){abrirModal(`<div class="n-form apr-resultado ${escApr(raridade)}"><span class="n-kicker">Melhoria salva</span><h2>${rotuloRaridade(raridade)}</h2><h3>${CATEGORIAS_APRIMORAMENTO[categoria].nome}</h3><p>${escApr(texto)}</p><div class="n-actions"><button type="button" onclick="fecharModal()">Continuar na oficina</button></div></div>`);}
function abrirRegrasAprimoramento(){abrirModal(`<div class="n-form"><h2>Como funciona a oficina</h2><p>Cada sorteio consome 1 Salva-Vidas e escolhe uma das categorias ainda livres, com chances iguais entre elas. A categoria concluída não volta a ser sorteada.</p><div class="apr-regras-grid">${Object.values(CATEGORIAS_APRIMORAMENTO).map(c=>`<section><h3>${c.icone} ${c.nome}</h3><p><b>Comum · 70%</b><br>${c.raridades.comum}</p><p><b>Incomum · 20%</b><br>${c.raridades.incomum}</p><p><b>Raro · 10%</b><br>${c.raridades.raro}</p></section>`).join('')}</div><p>Efeitos adicionais incomuns e raros têm chance de ativação de 100% divididos pela quantidade de cartas do item. Cartas extras são escolhidas na preparação do combate.</p><button type="button" onclick="fecharModal()">Entendi</button></div>`);}
function rotuloRaridade(r){return ({comum:'Comum',incomum:'Incomum',raro:'Raro'})[r]||r;}
function iconeTipo(t){return /drone/i.test(t)?'🛸':/defens/i.test(t)?'🛡️':/suporte|artefato|condicional/i.test(t)?'◈':'⚔️';}
function escApr(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
document.addEventListener('usuarioDesconectado',()=>{fichasOficina.clear();estadoOficina.tripulanteId='';estadoOficina.itemId='';estadoOficina.ultimo=null;});
