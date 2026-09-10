/* Permissões confirmadas pelo banco. Nunca troca a sessão por outro jogador. */
const TiaoAcesso=(()=>{
 let mestre=false;
 async function carregar(){
  mestre=false;
  const usuario=window.usuarioAtual?.id;
  const {data,error}=await supabaseClient.rpc('nave_eh_tiao');
  if(!error&&window.usuarioAtual?.id===usuario)mestre=data===true;
 }
 function desbloquear(id,concluido){
  NaveUI.form('Desbloquear Kaiju secreto',`<p>A senha revela o Kaiju e libera seus dados para combate nesta conta.</p><label>Senha<input name="senha" type="password" required maxlength="72" autocomplete="off" autofocus></label>`,async form=>{
   const {data,error}=await supabaseClient.rpc('nave_desbloquear_kaiju',{p_id:id,p_senha:form.elements.senha.value});
   form.elements.senha.value='';
   if(error)throw Error('Não foi possível verificar a senha. Tente novamente.');
   if(!data?.sucesso)throw Error(data?.mensagem||'Senha incorreta.');
   if(concluido)await concluido();
   mostrarNotificacao('Kaiju desbloqueado para sua conta.');
  },'Revelar Kaiju');
 }
 async function perfis(){
  try{
   await carregar();if(!mestre)throw Error('Somente TIÃO pode acessar todos os perfis.');
   const [pr,fi]=await Promise.all([supabaseClient.from('profiles').select('*').order('nome'),supabaseClient.from('fichas_tripulantes').select('*')]);
   if(pr.error||fi.error)throw Error('Não foi possível carregar os perfis.');
   const esc=NaveUI.esc;
   abrirModal(`<h2>TIÃO · Perfis da tripulação</h2><p>Consulte os perfis e fichas dos jogadores.</p><label>Buscar jogador<input id="tiao-busca" type="search" placeholder="Nome ou usuário"></label><div id="tiao-perfis"></div><button type="button" class="n-button" onclick="fecharModal()">Fechar</button>`);
   const labels={vida:'Vida',dano_extra:'Dano extra',agilidade:'Agilidade',defesa:'Defesa',salva_vidas:'Salva-vidas',nivel_embaixador:'Nível embaixador',nivel_combatente:'Nível combatente',nivel_tripulante:'Nível tripulante',itens_texto:'Itens e ataques'};
   function render(){
    const busca=document.getElementById('tiao-busca').value.toLocaleLowerCase('pt-BR');
    document.getElementById('tiao-perfis').innerHTML=pr.data.filter(p=>(p.nome+' '+p.username).toLocaleLowerCase('pt-BR').includes(busca)).map(p=>{
     const f=fi.data.find(f=>f.id===p.id);
     const valores=(obj,known={})=>Object.entries(obj||{}).filter(([k])=>!['id','created_at','atualizado_em','avatar'].includes(k)).map(([k,v])=>`<tr><th>${esc(known[k]||k.replaceAll('_',' '))}</th><td style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(v==null?'—':typeof v==='object'?JSON.stringify(v,null,2):v)}</td></tr>`).join('');
     return `<details class="n-state"><summary>${esc(p.nome||p.username)} · @${esc(p.username)}</summary><table class="n-table"><tbody>${valores(p)}</tbody></table><h3>Ficha do tripulante</h3>${f?`<table class="n-table"><tbody>${valores(f,labels)}</tbody></table>`:'<p>Ficha ainda não criada.</p>'}</details>`;
    }).join('')||'<p>Nenhum jogador encontrado.</p>';
   }
   document.getElementById('tiao-busca').addEventListener('input',render);render();
  }catch(e){mostrarNotificacao(e.message,'error');}
 }
 document.addEventListener('usuarioDesconectado',()=>{
  mestre=false;
  if(typeof fecharModal==='function')fecharModal();
  if(typeof catalogoKaijusRegistro!=='undefined')catalogoKaijusRegistro=[];
  if(typeof fecharCodexKaiju==='function')fecharCodexKaiju();
 });
 return {carregar,ehTiao:()=>mestre,desbloquear,perfis};
})();
