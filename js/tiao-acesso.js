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
 document.addEventListener('usuarioDesconectado',()=>{
  mestre=false;
  if(typeof fecharModal==='function')fecharModal();
  if(typeof catalogoKaijusRegistro!=='undefined')catalogoKaijusRegistro=[];
  if(typeof fecharCodexKaiju==='function')fecharCodexKaiju();
 });
 return {carregar,ehTiao:()=>mestre,desbloquear};
})();
