/* Permissões confirmadas pelo banco. Nunca troca a sessão por outro jogador. */
const TiaoAcesso=(()=>{
 let mestre=false;
 let gestor=false;
 async function carregar(){
  mestre=false;
  gestor=false;
  const usuario=window.usuarioAtual?.id;
  const [{data,error},{data:admin, error:erroAdmin}]=await Promise.all([
   supabaseClient.rpc('nave_eh_tiao'),
   supabaseClient.rpc('nave_eh_admin')
  ]);
  if(!error&&window.usuarioAtual?.id===usuario)mestre=data===true;
  if(!erroAdmin&&window.usuarioAtual?.id===usuario)gestor=admin===true;
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
  gestor=false;
  if(typeof fecharModal==='function')fecharModal();
  if(typeof catalogoKaijusRegistro!=='undefined')catalogoKaijusRegistro=[];
  if(typeof fecharCodexKaiju==='function')fecharCodexKaiju();
 });
 return {carregar,ehTiao:()=>mestre,ehGestor:()=>mestre||gestor,ehAdmin:()=>gestor,desbloquear};
})();

/* O admin escolhe o dono do mecha; a autorização para ler e salvar fica no banco. */
const MechaAlvo = (() => {
 let lista = [], escolhido = null, versao = 0;
 const esc = valor => String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function atual() {
  if (!TiaoAcesso.ehAdmin()) return {id:window.usuarioAtual?.id, nome:window.profileAtual?.nome || 'Você'};
  return lista.find(p => p.id === escolhido) || null;
 }
 function seletor() {
  return TiaoAcesso.ehAdmin() ? '<div class="mecha-painel mecha-seletor-piloto"><label for="mecha-selecionar-piloto">Montar mecha de</label><select id="mecha-selecionar-piloto" disabled><option>Carregando tripulantes…</option></select></div>' : '';
 }
 async function preparar(pagina, continuar) {
  if (!TiaoAcesso.ehAdmin()) { continuar(); return; }
  const token = ++versao, select = document.getElementById('mecha-selecionar-piloto');
  if (!select) return;
  try {
   const {data,error} = await supabaseClient.rpc('nave_diretorio');
   if (error) throw error;
   if (token !== versao || !select.isConnected || paginaAtual !== pagina) return;
   lista = (data || []).filter(p => p.id !== window.usuarioAtual?.id);
   if (!lista.some(p => p.id === escolhido)) escolhido = lista[0]?.id || null;
   select.innerHTML = lista.map(p => `<option value="${esc(p.id)}">${esc(p.nome || p.username)} (@${esc(p.username)})</option>`).join('') || '<option>Nenhum tripulante disponível</option>';
   select.value = escolhido || '';
   select.disabled = !escolhido;
   select.addEventListener('change', () => {
    if (pagina === 'mechas' && salvandoMecha) { select.value = escolhido; return; }
    if (pagina === 'mecha-novo' && MechaNovoUI.ocupado()) { select.value = escolhido; return; }
    const pendente = pagina === 'mechas' ? mechaAlterado : MechaNovoUI.temAlteracoes();
    if (pendente && !confirm('Descartar as alterações não salvas do mecha?')) {
     select.value = escolhido; return;
    }
    escolhido = select.value;
    abrirPagina(pagina);
   });
   if (escolhido) continuar();
  } catch (erro) {
   select.innerHTML = '<option>Não foi possível carregar os tripulantes</option>';
   console.error('Erro ao selecionar piloto:', erro);
  }
 }
 document.addEventListener('usuarioDesconectado', () => { lista=[]; escolhido=null; ++versao; });
 return {atual,seletor,preparar};
})();
