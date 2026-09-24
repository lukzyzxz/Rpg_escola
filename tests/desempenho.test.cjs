const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function ambienteAuth(){
 const eventos=[],timers=new Map(),calls={profile:0,permission:0,session:0,subscription:0},ui={};
 let nextTimer=0,locked=false,profileResolver=null;
 const ctx=vm.createContext({window:{addEventListener(){}},document:{dispatchEvent:e=>eventos.push(e.type)},CustomEvent,console:{log(){},error(){}},setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer},clearTimeout:id=>timers.delete(id),
  supabaseClient:{auth:{async getSession(){calls.session++;return{data:{session:null}}},onAuthStateChange(fn){calls.subscription++;ctx.callback=fn}},from(){assert.equal(locked,false,'consulta iniciou dentro do callback de auth');calls.profile++;let id;return{select(){return this},eq(k,v){id=v;return this},single(){return profileResolver?new Promise(resolve=>profileResolver.push(()=>resolve({data:{id,nome:id}}))):Promise.resolve({data:{id,nome:id}})}}}},
  TiaoAcesso:{async carregar(){assert.equal(locked,false);calls.permission++}},ui});
 vm.runInContext(fs.readFileSync('js/auth.js','utf8'),ctx);
 vm.runInContext("ocultarSistema=()=>{ui.hidden=true};mostrarTelaLogin=()=>{ui.login=true};removerTelaAuth=()=>{};mostrarSistema=()=>{ui.hidden=false};atualizarUsuarioInterface=()=>{};",ctx);
 const run=code=>vm.runInContext(code,ctx);
 return{ctx,calls,eventos,ui,run,
  hold(){profileResolver=[]},release(){profileResolver.splice(0).forEach(fn=>fn());profileResolver=null},
  event(event,user){locked=true;ctx.event=event;ctx.session=user?{user}:null;const result=run('tratarEventoAutenticacao(event,session)');locked=false;return result},
  async flush(){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());await tick();}
 };
}
test('autenticação não consulta banco dentro do callback e inicializa apenas uma vez',async()=>{
 const a=ambienteAuth();assert.equal(a.event('SIGNED_IN',{id:'a'}),undefined);assert.equal(a.calls.profile,0);
 await a.flush();assert.equal(a.calls.profile,1);assert.equal(a.calls.permission,1);assert.deepEqual(a.eventos,['usuarioAutenticado']);
 for(let i=0;i<20;i++){a.event('TOKEN_REFRESHED',{id:'a'});a.event('SIGNED_IN',{id:'a'});}
 await a.flush();assert.equal(a.calls.profile,1);assert.deepEqual(a.eventos,['usuarioAutenticado']);
});
test('login explícito e evento simultâneo compartilham a consulta em andamento',async()=>{
 const a=ambienteAuth();a.hold();a.event('SIGNED_IN',{id:'a'});const login=a.run("autenticarUsuarioNoSistema({id:'a'})");await a.flush();
 const duplicate=a.run("autenticarUsuarioNoSistema({id:'a'})");assert.equal(a.calls.profile,1);
 a.release();await Promise.all([login,duplicate]);assert.deepEqual(a.eventos,['usuarioAutenticado']);
});
test('logout cancela login agendado e impede resposta antiga de reabrir a sessão',async()=>{
 const a=ambienteAuth();a.event('SIGNED_IN',{id:'a'});a.event('SIGNED_OUT');await a.flush();assert.equal(a.calls.profile,0);
 a.hold();const login=a.run("autenticarUsuarioNoSistema({id:'a'})");a.event('SIGNED_OUT');a.release();await login;
 assert.equal(a.ctx.window.usuarioAtual,null);assert.equal(a.ctx.window.profileAtual,null);assert.equal(a.ui.hidden,true);assert(!a.eventos.includes('usuarioAutenticado'));
});
test('atualização do perfil não reinicia módulos; inicialização não duplica listeners',async()=>{
 const a=ambienteAuth();await a.run('inicializarAutenticacao()');await a.run('inicializarAutenticacao()');assert.equal(a.calls.subscription,1);assert.equal(a.calls.session,1);
 await a.run("autenticarUsuarioNoSistema({id:'a'})");a.event('USER_UPDATED',{id:'a'});await a.flush();
 assert.equal(a.calls.profile,2);assert.equal(a.eventos.filter(e=>e==='usuarioAutenticado').length,1);
});
function ambienteFicha(){
 const timers=new Map(),calls={minha:0,equipe:0,progressao:0};let number=0;
 const ctx=vm.createContext({window:{usuarioAtual:{id:'eu'}},document:{addEventListener(){},hidden:false,getElementById(){return null}},paginaAtual:'ficha',console,setTimeout:fn=>{timers.set(++number,fn);return number},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(fs.readFileSync('js/ficha.js','utf8'),ctx);
 return{ctx,calls,run:code=>vm.runInContext(code,ctx),async flush(){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());await tick();}};
}
test('rajada de 50 atualizações de ficha vira uma consulta por área',async()=>{
 const a=ambienteFicha();a.ctx.calls=a.calls;a.run("carregarMinhaFicha=async()=>calls.minha++;carregarFichasEquipe=async()=>calls.equipe++;carregarDadosProgressaoFicha=async()=>calls.progressao++;");
 for(let i=0;i<50;i++)a.run("agendarAtualizacaoFicha('minha','equipe','progressao')");
 await a.flush();assert.deepEqual(a.calls,{minha:1,equipe:1,progressao:1});
 a.run("agendarAtualizacaoFicha('minha');paginaAtual='arena'");await a.flush();assert.equal(a.calls.minha,1);
});
test('eventos de outros jogadores atualizam só a lista de equipe',async()=>{
 const a=ambienteFicha(),handlers=[];
 a.ctx.supabaseClient={channel(){return{on(type,filter,fn){handlers.push({filter,fn});return this},subscribe(){return this}}}};
 a.ctx.calls=a.calls;a.run("carregarMinhaFicha=async()=>calls.minha++;carregarFichasEquipe=async()=>calls.equipe++;iniciarSincronizacaoFichas()");
 for(let i=0;i<30;i++)handlers[0].fn({new:{id:'outro'}});
 await a.flush();assert.equal(a.calls.minha,0);assert.equal(a.calls.equipe,1);
});
test('reabrir ficha durante consulta não deixa a nova tela presa em carregando',async()=>{
 const a=ambienteFicha(),resolvers=[];a.ctx.resolvers=resolvers;
 a.run("executarCarregamentoMinhaFicha=async()=>{carregandoFicha=true;await new Promise(resolve=>resolvers.push(resolve));}");
 const first=a.run('carregarMinhaFicha()');const duplicate=a.run('carregarMinhaFicha()');assert.equal(first,duplicate);
 a.run('consultaFichaVersao++');const second=a.run('carregarMinhaFicha()');assert.notEqual(first,second);
 resolvers[0]();await first;assert.equal(a.run('carregandoFicha'),true);
 resolvers[1]();await second;assert.equal(a.run('carregandoFicha'),false);
});
test('campos em edição e itens locais sobrevivem à atualização automática da ficha',()=>{
 const a=ambienteFicha(),text={value:'Anotação ainda não salva'},life={value:'9'},cache={};
 a.ctx.document.getElementById=id=>id==='ficha-itens-texto'?text:id==='ficha-campo-salva_vidas'?life:null;
 Object.assign(a.ctx,{cache,obterItensDoTripulante:()=>['novo-item'],definirItensDoTripulante:(id,ids)=>cache.ids=ids,carregarAprimoramentos:()=>({}),salvarAprimoramentos(){}});
 a.run("renderizarAvatarFicha=()=>{};renderizarInventarioFicha=()=>{};configurarConsultaFicha=()=>{};minhaFicha={id:'eu',itens_texto:'Texto remoto',salva_vidas:1,itens_catalogo:['antigo']};marcarFichaComoAlterada();renderizarMinhaFicha()");
 assert.equal(text.value,'Anotação ainda não salva');assert.equal(life.value,'9');assert.deepEqual(cache.ids,['novo-item']);
});
test('troca rápida de abas cancela inicialização de módulos abandonados',()=>{
 const source=fs.readFileSync('js/app.js','utf8');
 const start=source.indexOf('function abrirPagina('),end=source.indexOf('\nfunction ',start+10);
 const queue=[],calls=[];
 const ctx=vm.createContext({versaoPagina:0,paginaAtual:'dashboard',modalOverlay:null,titulo:{},conteudo:{},requestAnimationFrame:fn=>queue.push(fn),marcarBotaoAtivo(){},atualizarIndicadoresMenu(){},atualizarStatusConexao(){},document:{getElementById(){return null}},telaFicha:()=>'',telaMechas:()=>'',inicializarPaginaFicha:()=>calls.push('ficha'),inicializarPaginaMechas:()=>calls.push('mechas')});
 vm.runInContext(source.slice(start,end),ctx);vm.runInContext("abrirPagina('ficha');abrirPagina('mechas')",ctx);queue.forEach(fn=>fn());assert.deepEqual(calls,['mechas']);
});
test('consultas simultâneas da mesma imagem são compartilhadas e o cache é limpo no logout',async()=>{
 const handlers={},resolvers=[];let calls=0;
 const ctx=vm.createContext({window:{usuarioAtual:{id:'eu'},addEventListener(){}},document:{addEventListener:(e,fn)=>handlers[e]=fn},setTimeout,clearTimeout,CustomEvent,supabaseClient:{storage:{from(){return{createSignedUrl(){calls++;return new Promise(resolve=>resolvers.push(resolve))}}}}}});
 vm.runInContext(fs.readFileSync('js/nave-dados.js','utf8'),ctx);
 const run=()=>vm.runInContext("NaveDados.imageUrl({bucket:'kaijus-imagens',path:'eu/foto.png'})",ctx);
 const a=run(),b=run();assert.equal(calls,1);resolvers.shift()({data:{signedUrl:'url'}});assert.deepEqual(await Promise.all([a,b]),['url','url']);assert.equal(await run(),'url');assert.equal(calls,1);
 handlers.usuarioDesconectado();const c=run();assert.equal(calls,2);handlers.usuarioDesconectado();resolvers.shift()({data:{signedUrl:'antiga'}});assert.equal(await c,'');
});

test('oficina atualiza botões sem erro e só libera aprimoramento com item e saldo',()=>{
 const elements=Object.fromEntries(['btn-aprimorar-item','apr-custo-info','apr-erro'].map(id=>[id,{}]));
 const ctx=vm.createContext({window:{usuarioAtual:{id:'eu'}},document:{addEventListener(){},getElementById:id=>elements[id],querySelectorAll:()=>[]},localStorage:{getItem(){return null}},structuredClone,console});
 vm.runInContext(fs.readFileSync('js/aprimoramentos.js','utf8'),ctx);
 vm.runInContext("estadoOficina.tripulanteId='eu';estadoOficina.itemId='';estadoOficina.salvaVidas=2;estadoOficina.carregandoSaldo=false;atualizarBotaoAprimorar()",ctx);
 assert.equal(elements['btn-aprimorar-item'].disabled,true);
 vm.runInContext("estadoOficina.itemId='manoplas-porco';atualizarBotaoAprimorar()",ctx);
 assert.equal(elements['btn-aprimorar-item'].disabled,false);
 vm.runInContext("estadoOficina.salvaVidas=0;atualizarBotaoAprimorar()",ctx);
 assert.equal(elements['btn-aprimorar-item'].disabled,true);
});
