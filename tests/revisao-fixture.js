/* Apenas demonstração isolada: não importa credenciais nem faz pedidos ao Supabase. */
window.usuarioAtual={id:'11111111-1111-4111-8111-111111111111'};
window.profileAtual={id:window.usuarioAtual.id,nome:'Piloto Aurora',username:'aurora',cargo:'Tripulante'};
const dadosDemonstracao={},recibosDemonstracao=new Map();
const supabaseClient={
 from(table){let filters=[],single=false,limit=Infinity,offset=0,sort=null;const q={select(){return q},eq(k,v){filters.push(r=>r[k]===v);return q},order(k,o){sort=[k,o?.ascending!==false];return q},limit(n){limit=n;return q},range(a,b){offset=a;limit=b-a+1;return q},single(){single=true;return q},maybeSingle(){single=true;return q},then(resolve,reject){try{let rows=(dadosDemonstracao[table]||[]).filter(r=>filters.every(f=>f(r)));if(sort)rows.sort((a,b)=>String(a[sort[0]]).localeCompare(String(b[sort[0]]))*(sort[1]?1:-1));rows=rows.slice(offset,offset+limit);return Promise.resolve({data:structuredClone(single?rows[0]||null:rows),error:null}).then(resolve,reject)}catch(e){return Promise.reject(e).then(resolve,reject)}}};return q;},
 async rpc(name,args={}){
  let result;const uid=window.usuarioAtual.id;
  const record=(module,row,action)=>{dadosDemonstracao.nave_eventos.push({id:dadosDemonstracao.nave_eventos.length+1,modulo:module,registro_id:String(row.id),acao:action,autor_nome:'Piloto de demonstração',resumo:row.nome+' · '+action,criado_em:new Date().toISOString()});};
  const request=name+':'+args.p_operacao;if(args.p_operacao&&recibosDemonstracao.has(request))return {data:structuredClone(recibosDemonstracao.get(request))};
  if(['nave_salvar_planeta','nave_salvar_item','nave_salvar_kaiju'].includes(name)){
   const table={nave_salvar_planeta:'nave_planetas',nave_salvar_item:'nave_inventario',nave_salvar_kaiju:'mecha_kaijus_catalogo'}[name],rows=dadosDemonstracao[table];
   let r=rows.find(r=>r.id===args.p_id);if(!r){r={id:table==='mecha_kaijus_catalogo'?'kaiju-demo-'+rows.length:rows.length+1,ordem:rows.length+1,versao:0,personalizado:true,criado_por:uid,arquivado:false,status:'Desconhecido'};rows.push(r);}Object.assign(r,args.p_dados,{versao:r.versao+1,atualizado_em:new Date().toISOString()});result=r;record(table.replace('nave_','').replace('mecha_kaijus_catalogo','kaijus'),r,'salvo');
  }else if(name==='nave_movimentar_item'){result=dadosDemonstracao.nave_inventario.find(r=>r.id===args.p_id);result.quantidade+=args.p_delta;result.versao++;record('inventario',result,'movimentação');}
  else if(name==='nave_arquivar_item'){result=dadosDemonstracao.nave_inventario.find(r=>r.id===args.p_id);result.arquivado=true;result.versao++;}
  else if(name==='nave_sortear_aprimoramento'){
   const f=dadosDemonstracao.fichas_tripulantes[0],reg=f.aprimoramentos_itens[args.p_item]||{},categoria=['atributo','cartas','adicional'].find(c=>!reg[c]);if(!categoria)return {error:{message:'Item totalmente aprimorado',code:'P0001'}};
   const texto={atributo:'Dano aumentado em 40%. Dano base 5 → 7.',cartas:'Pode ser usado em +2 cartas à escolha do jogador.',adicional:'Fraqueza: reduz o dano recebido em 50%.'}[categoria];reg[categoria]={raridade:'incomum',texto,efeito:categoria==='adicional'?'Fraqueza':null};f.aprimoramentos_itens[args.p_item]=reg;f.salva_vidas--;result={saldo:f.salva_vidas,aprimoramentos:f.aprimoramentos_itens,categoria,raridade:'incomum',texto};
  }else if(name==='nave_sortear_ataque'){const k=dadosDemonstracao.mecha_kaijus_catalogo.find(r=>r.id===args.p_kaiju_id),carta=Object.keys(k.ataques)[0];result={carta,ataque:k.ataques[carta]};dadosDemonstracao.kaiju_rolagens.push({id:dadosDemonstracao.kaiju_rolagens.length+1,usuario_id:uid,kaiju_id:k.id,...result,criado_em:new Date().toISOString()});}
  else if(name==='combate_importar_aprimoramentos'){result=dadosDemonstracao.fichas_tripulantes[0].aprimoramentos_itens;}
  else if(name==='combate_criar'){result={id:'batalha-demo',titulo:args.p_estado.title,criado_por:uid,estado:args.p_estado,revisao:0,cursor_revisao:0,atualizado_em:new Date().toISOString()};dadosDemonstracao.combate_batalhas.push(result);}
  else if(name==='combate_salvar'){result=dadosDemonstracao.combate_batalhas.find(b=>b.id===args.p_id);result.estado=args.p_estado;result.revisao++;result.cursor_revisao=result.revisao;}
  else return {error:{message:'Ação indisponível nesta demonstração.',code:'DEMO'}};
  if(args.p_operacao)recibosDemonstracao.set(request,structuredClone(result));return {data:structuredClone(result),error:null};
 },
 channel(){const c={on(){return c},subscribe(){return c}};return c;},removeChannel(){},
 storage:{from(){return {async createSignedUrl(){return {data:{signedUrl:'assets/kaijus/kaiju-porco.jpg'}}},async upload(){return {error:{message:'Envio de arquivos indisponível na demonstração.'}}}}}}
};
document.addEventListener('DOMContentLoaded',()=>{
 const uid=window.usuarioAtual.id;
 dadosDemonstracao.nave_planetas=[{id:1,nome:'Verdejante',descricao:'Florestas antigas, sinais de vida e uma nova missão para a tripulação.',desbloqueado:true,versao:0,ordem:1},{id:2,nome:'Oceano',descricao:'Um mundo coberto por água. Explore as ilhas e prepare o desembarque.',desbloqueado:true,versao:0,ordem:2},{id:3,nome:'Incógnita',descricao:'Dados ainda não revelados.',desbloqueado:false,versao:0,ordem:3}];
 dadosDemonstracao.nave_inventario=[{id:1,nome:'Kit de reparo',descricao:'Ferramentas para manutenção em campo.',categoria:'Ferramenta',quantidade:8,versao:0,arquivado:false},{id:2,nome:'Manoplas do Porco Kaiju',descricao:'Equipamento recuperado na última expedição.',categoria:'Equipamento',quantidade:2,item_catalogo_id:'manoplas-porco',versao:0,arquivado:false},{id:3,nome:'Ração de emergência',descricao:'Reserva para viagens entre planetas.',categoria:'Suprimento',quantidade:24,versao:0,arquivado:false}];
 dadosDemonstracao.nave_itens_catalogo=CATALOGO_ITENS_APRIMORAMENTO.map((i,index)=>({id:i.id,nome:i.nome,ordem:index,definicao:i}));
 dadosDemonstracao.mecha_kaijus_catalogo=Object.entries(CODEX_KAIJUS).map(([id,c],index)=>({id,nome:{'rei-porco':'Kaiju Porco','rei-verdejante':'Rei Verdejante','cobra-falante':'Cobra Falante','hidra':'Hidra','tartaruga-dragao':'Tartaruga Dragão'}[id],ordem:index+1,vida:c.vida,agilidade:c.agilidade,defesa:0,codex_texto:c.codex,ataques:c.ataques,regras_combate:{},imagem_path:'assets/kaijus/kaiju-porco.jpg',descricao:'Registro de treinamento da tripulação.',status:'Desconhecido',versao:0}));
 dadosDemonstracao.profiles=[window.profileAtual,{id:'22222222-2222-4222-8222-222222222222',nome:'Piloto Horizonte',username:'horizonte',cargo:'Tripulante'}];
 dadosDemonstracao.fichas_tripulantes=dadosDemonstracao.profiles.map((p,index)=>({id:p.id,vida:45,dano_extra:2,agilidade:7-index,defesa:2,salva_vidas:5,itens_texto:'',itens_catalogo:['manoplas-porco','canhao-verdejante','mascara-cobra'],aprimoramentos_itens:{},nivel_combatente:3,nivel_embaixador:1,nivel_tripulante:2,profiles:p}));
 dadosDemonstracao.frotas=[{id:'f0',nome:'POVO LIVRE',cor:'#888888',fixa:true},{id:'f1',nome:'Aurora',cor:'#68d8ff'},{id:'f2',nome:'Horizonte',cor:'#d2a9ff'}];
 dadosDemonstracao.frota_integrantes=dadosDemonstracao.profiles.map((p,i)=>({usuario_id:p.id,frota_id:'f'+(i+1)}));
 dadosDemonstracao.missoes_catalogo=[{id:1,titulo:'Primeiro contato',classe:'Embaixador',oficial:true,resumo:'Conheça a população de Verdejante.',ordem:1},{id:2,titulo:'Defesa da floresta',classe:'Combatente',oficial:true,resumo:'Enfrente o Kaiju e proteja a expedição.',ordem:2}];
 dadosDemonstracao.mechas_20m=[{usuario_id:uid,nome:'Aurora',vida_base:10,descricao:'Projeto de treinamento',imagem_path:'assets/kaijus/kaiju-porco.jpg'}];
 dadosDemonstracao.nave_integridade=[{id:1,valor:10,maximo:15,reserva_extra:2}];
 for(const table of ['nave_eventos','kaiju_rolagens','mecha_pecas_equipadas','mecha_pecas_catalogo','combate_batalhas'])dadosDemonstracao[table]=[];
 document.dispatchEvent(new CustomEvent('usuarioAutenticado'));
});
