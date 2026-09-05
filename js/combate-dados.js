/* Importação da ficha e adaptação do catálogo para regras executáveis. */
const CombateDados=(()=>{
 const M=CombateMotor;
 const photoCache=new Map();
 async function photoUrl(source){
  if(!source?.path||!['mechas-designs','kaijus-imagens'].includes(source.bucket))return '';
  const key=source.bucket+'/'+source.path,cached=photoCache.get(key);
  if(cached&&cached.until>Date.now())return cached.url;
  try{const result=await supabaseClient.storage.from(source.bucket).createSignedUrl(source.path,3600);if(result.error)return '';const url=result.data?.signedUrl||'';if(url)photoCache.set(key,{url,until:Date.now()+3000000});return url;}catch{return '';}
 }
 async function refreshPhotos(row){
  if(!row?.estado?.teams)return row;
  await Promise.all(row.estado.teams.flatMap(t=>[t.boss,...t.players]).map(async a=>{if(a.photoSource){const url=await photoUrl(a.photoSource);a.photo=url||a.photoFallback||'';}}));
  return row;
 }
 const aliases={'manoplas-porco':['manopla'],'olho-porco':['olho do porco','olho kaiju'],'martelo-femur':['martelo femur'],'guincho-porco':['guincho'],'lingua-cobra':['lingua de cobra'],'mascara-cobra':['mascara'],'laminas-gemeas':['laminas gemeas'],'lamina-vorpal':['vorpal'],'coracao-verdejante':['coracao'],'lamina-verdejante':['lamina verdejante'],'canhao-verdejante':['canhao'],'vigilancia-verdejante':['drone','vigilancia']};
 const special={'manoplas-porco':'combo','canhao-verdejante':'cannon','lamina-vorpal':'vorpal','coracao-verdejante':'overload','vigilancia-verdejante':'drone','guincho-porco':'guincho','lamina-verdejante':'odd','lingua-cobra':'memory'};
 function itemRule(item,up={},count=item.cartas.length){
  const r={...M.rule(),name:item.nome,text:item.descricao,damage:item.dano,itemId:item.id,special:special[item.id]||'',reviewed:true,effects:[]};
  if(item.id==='coracao-verdejante')r.cost=4;
  if(item.id==='mascara-cobra')r.effects=[{kind:'evasion',value:100,duration:1,chance:50,target:'self',reaction:true},{kind:'reflect',value:100,duration:1,chance:100,target:'self',onEvade:true,reaction:true}];
  if(item.id==='laminas-gemeas')r.damage=count>=4?9:5;
  if(item.id==='olho-porco'){r.warnings=['Reordenação de baralho físico: registre o resultado na carta que será informada.'];r.reviewed=false;}
  if(item.id==='lingua-cobra'){r.warnings=['Defina na preparação se a condição da pergunta foi atendida; pode editar na batalha.'];r.condition=false;r.reviewed=false;}
  if(item.id==='guincho-porco'){r.warnings=['Defina o dano da carta escolhida para o caso de vida ≤ 50%.'];r.choiceDamage=0;r.reviewed=false;}
  if(up.atributo)r.multiplier={comum:1.2,incomum:1.4,raro:1.6}[up.atributo.raridade]||1;
  if(up.adicional){
   const kind={'Ágil':'haste','Envenenamento':'poison','Fraqueza':'protection','Curandeiro':'heal','Cegueira':'blind','Lentidão':'skip'}[up.adicional.efeito];
   const chance=up.adicional.raridade==='comum'?100:Math.round(100/count*100)/100;
   if(kind==='heal')r.effects.push({kind:'healing',value:15,duration:1,chance,target:'self'});
   else if(kind)r.effects.push({kind,value:kind==='poison'?0:kind==='protection'?50:0,duration:1,chance,target:['haste','protection'].includes(kind)?'self':'target',fromExtra:kind==='poison',nextRound:kind==='poison'});
  }
  return r;
 }
 function makePlayer(profile={},ficha={},items=[],upgrades={}){
  const rawText=ficha.itens_texto||'';const ids=new Set(Array.isArray(ficha.itens_catalogo)?ficha.itens_catalogo:[]);
  const text=M.norm(rawText);
  for(const [id,keys] of Object.entries(aliases))if(keys.some(k=>text.includes(k)))ids.add(id);
  const owned=items.filter(i=>ids.has(i.id));const p={id:profile.id||'convidado-'+Array.from(crypto.getRandomValues(new Uint32Array(4)),x=>x.toString(16).padStart(8,'0')).join(''),profileId:profile.id||null,name:profile.nome||profile.username||'Convidado',photo:profile.avatar||ficha.personagem_frente_path||'',maxHp:Number(ficha.vida??20),extra:Number(ficha.dano_extra||0),speed:Number(ficha.agilidade??5),defense:Number(ficha.defesa||0),cards:{},options:{},notes:rawText,upgrades,owned:owned.map(i=>i.id),reviewNotes:[]};
  for(const c of M.CARDS){const matches=owned.filter(i=>i.cartas.map(M.card).includes(c));p.options[c]=matches.map(i=>itemRule(i,upgrades[i.id]));if(matches[0])p.cards[c]=M.clone(p.options[c][0]);if(matches.length>1)p.reviewNotes.push(`Carta ${c}: escolha entre ${matches.map(i=>i.nome).join(' / ')}.`);}
  // Linhas com carta explícita prevalecem sobre o catálogo, mantendo a descrição para revisão.
  for(const line of rawText.split('\n').filter(Boolean)){
   const match=line.match(/^\s*((?:A|1[0]?|[2-9]|[JQK])(?:\s*[,/]\s*(?:A|1[0]?|[2-9]|[JQK]))*)\s*[):—-]\s*(.*)$/i);
   if(match){for(const c of match[1].split(/[,/]/).map(M.card)){
    const described=M.norm(match[2]);const known=owned.find(i=>aliases[i.id]?.some(k=>described.includes(k)));
    p.cards[c]=known?itemRule(known,upgrades[known.id]):M.parse(match[2]);
    if(known){const custom=M.parse(match[2]);const extras=custom.effects.filter(e=>['stun','poison','burn','bleed','blind','skip','shield','regen'].includes(e.kind));p.cards[c].effects.push(...extras);p.cards[c].text=match[2];}
   }}
  }
  if(rawText)p.reviewNotes.push('Confira todas as linhas do texto original: regras personalizadas, passivas e ataques de Codex precisam estar representados nas cartas.');
  for(const [id,u] of Object.entries(upgrades))if(u.cartas)p.reviewNotes.push(`${items.find(i=>i.id===id)?.nome||id}: escolha ${ {comum:1,incomum:2,raro:3}[u.cartas.raridade]||1} carta(s) adicional(is) no editor.`);
  for(const c of M.CARDS)for(const i of owned){if(!p.options[c].some(r=>r.itemId===i.id))p.options[c].push({...itemRule(i,upgrades[i.id]),extraAssignment:true});}
  updatePassives(p);return p;
 }
 function updatePassives(p){
  const counts={};for(const r of Object.values(p.cards))if(r.itemId)counts[r.itemId]=(counts[r.itemId]||0)+1;
  for(const r of Object.values(p.cards))if(r.itemId==='laminas-gemeas')r.damage=counts[r.itemId]>=4?9:5;
  p.equipmentDefense=Object.values(p.cards).some(r=>r.itemId==='lamina-vorpal')?-2:0;}
 function makeBoss(raw={}){
  const codex=typeof CODEX_KAIJUS!=='undefined'?CODEX_KAIJUS[raw.id]:null;
  const fromDatabase=raw.personalizado||Object.keys(raw.ataques||{}).length>0;
  const b={id:'boss',name:raw.nome||'Kaiju',photo:raw.imagem_url||raw.imagem_path||'',maxHp:Number(raw.vida||codex?.vida||100),speed:Number(fromDatabase?raw.agilidade??5:raw.agilidade||codex?.agilidade||5),extra:0,defense:Number(raw.defesa??codex?.defesa??0),cards:{},notes:raw.passivas||'',reviewNotes:[]};
  if(raw.imagem_storage?.path){b.photoSource=M.clone(raw.imagem_storage);b.photoFallback=raw.imagem_path||'';}
  const attacks=fromDatabase?raw.ataques:codex?.ataques;
  for(const [key,a] of Object.entries(attacks||{})){
   const c=M.card(key);if(!M.CARDS.includes(c))continue;
   const parsed=M.parse(a.descricao||'',{boss:true}),stored=raw.regras_combate?.[c];
   const r=stored?{...M.rule(),...M.clone(stored)}:{...parsed,name:a.nome||'Ataque',damage:Number.isFinite(Number(a.dano))?Number(a.dano):0,text:a.descricao||''};
   r.warnings=[...(r.warnings||[])];
   if(!stored&&(!Number.isFinite(Number(a.dano))||(parsed.damage!=null&&parsed.damage!==Number(a.dano)))){r.warnings.push('O dano informado no Codex precisa de conferência: valor e descrição não definem o mesmo dano.');r.reviewed=false;}
   b.cards[c]=r;
  }
  for(const c of M.CARDS)if(!b.cards[c])b.cards[c]={...M.rule(),damage:0,name:'Sem ataque'};
  if(b.notes)b.reviewNotes.push('Passivas do Kaiju: confira a aplicação nas cartas e nos atributos.');return b;
 }
 async function load(){
  if(typeof NaveDados!=='undefined')await NaveDados.list('catalogo');
  const requests=[['profiles','*'],['fichas_tripulantes','*'],['frotas','id,nome,cor,fixa'],['frota_integrantes','frota_id,usuario_id'],['mecha_kaijus_catalogo','*'],['mechas_20m','*'],['mecha_pecas_equipadas','*'],['mecha_pecas_catalogo','*']];
  const result=await Promise.all(requests.map(async([table,cols])=>{const r=await supabaseClient.from(table).select(cols);if(r.error)throw Error(`${table}: ${r.error.message}`);return r.data||[];}));
  const [profiles,fichas,frotas,members,kaijus,mechas,equipadas,pecas]=result;
  if(typeof NaveDados!=='undefined')await NaveDados.hydrateKaijus(kaijus);
  await Promise.all(mechas.map(async m=>{if(m.imagem_path&&!/^(https?:|assets\/)/.test(m.imagem_path))m.photoUrl=await photoUrl({bucket:'mechas-designs',path:m.imagem_path});}));
  return {profiles,fichas,frotas,members,kaijus,mechas,equipadas,pecas};
 }
 function importPlayer(id,data,mode='piloto'){
  const profile=data.profiles.find(x=>x.id===id)||{};const ficha=data.fichas.find(x=>x.id===id)||{};
  const local=typeof carregarAprimoramentos==='function'?carregarAprimoramentos():{};
  const upgrades=M.clone(ficha.aprimoramentos_itens||{});
  // Dados locais só são importados para a própria conta. Nunca substituem o servidor.
  if(id===window.usuarioAtual?.id&&ficha.aprimoramentos_itens==null)for(const [key,value]of Object.entries(local)){const [uid,item]=key.split('::');if(uid===id)upgrades[item]={...value,...upgrades[item]};}
  const p=makePlayer(profile,ficha,typeof CATALOGO_ITENS_APRIMORAMENTO!=='undefined'?CATALOGO_ITENS_APRIMORAMENTO:[],upgrades);
  if(!ficha.id)p.reviewNotes.push('Ficha não encontrada no banco: confira os atributos antes de começar.');
  if(mode==='mecha'){
   const mech=data.mechas.find(x=>x.usuario_id===id);if(mech?.imagem_path){if(/^(https?:|assets\/)/.test(mech.imagem_path))p.photo=mech.imagem_path;else{p.photoSource={bucket:'mechas-designs',path:mech.imagem_path};p.photoFallback=p.photo;p.photo=mech.photoUrl||p.photo;if(!mech.photoUrl)p.reviewNotes.push('Imagem do mecha indisponível: confira as permissões de leitura do SQL V6 ou envie uma imagem para esta batalha.');}}
   if(!mech)p.reviewNotes.push('Mecha não encontrado: confira as peças e os atributos antes de começar.');
   p.maxHp=10;p.extra=0;p.speed=0;p.defense=0;p.name=profile.nome||profile.username||'Piloto';p.mode='mecha';
   for(const equipped of data.equipadas.filter(x=>x.usuario_id===id)){
    const part=data.pecas.find(x=>x.id===equipped.peca_id);if(!part)continue;const e=part.efeito||{};
    p.maxHp+=(e.vida||0)+(e.vida_por_nivel_combatente||0)*(ficha.nivel_combatente||0)+(e.vida_por_nivel_total||0)*((ficha.nivel_combatente||0)+(ficha.nivel_tripulante||0)+(ficha.nivel_embaixador||0))+(e.vida_por_agilidade||0)*(ficha.agilidade||0);
    p.extra+=(e.ataque||0)+(e.ataque_igual_agilidade?(ficha.agilidade||0):0);p.speed+=(e.agilidade||0);p.defense+=(e.defesa||0);if(e.bloqueia_defesa)p.noDefense=true;
    if(part.id==='verde-bracos')for(const c of M.CARDS)p.cards[c]={...M.rule(),damage:9,name:'Lâmina Verdejante (mecha)'};
    if(part.id==='tartaruga-cabeca')p.oddReduction=5;
    if(part.id==='hidra-cabeca')p.reviewNotes.push('Cabeça Extra: escolha uma carta numérica e marque Repetir 2x no editor.');
    if(part.id==='hidra-bracos')p.reviewNotes.push('Braços da Hidra: no baralho físico, até 5 trocas de carta; informe a carta final.');
   }
   if(p.noDefense)p.defense=0;p.maxHp=Math.max(1,p.maxHp);updatePassives(p);
  }
  return p;
 }
 async function list(offset=0){const r=await supabaseClient.from('combate_batalhas').select('id,titulo,criado_por,revisao,atualizado_em').order('atualizado_em',{ascending:false}).range(offset,offset+29);if(r.error)throw r.error;return r.data;}
 async function open(id){const r=await supabaseClient.from('combate_batalhas').select('*').eq('id',id).single();if(r.error)throw r.error;return refreshPhotos(r.data);}
 async function create(state){const r=await supabaseClient.rpc('combate_criar',{p_estado:state});if(r.error)throw r.error;return refreshPhotos(r.data);}
 async function save(row,state,type='rodada'){const r=await supabaseClient.rpc('combate_salvar',{p_id:row.id,p_revisao:row.revisao,p_estado:state,p_tipo:type});if(r.error)throw r.error;return refreshPhotos(r.data);}
 return {load,list,open,create,save,makePlayer,makeBoss,importPlayer,itemRule,updatePassives};
})();
