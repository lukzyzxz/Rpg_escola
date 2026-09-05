const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const A='11111111-1111-4111-8111-111111111111',B='22222222-2222-4222-8222-222222222222';
let db;
const scalar=async(sql,params=[])=>Object.values((await db.query(sql,params)).rows[0])[0];
async function login(id=A,role='authenticated'){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role '+role);}
async function rpc(name,...args){return scalar(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')})`,args.map(a=>typeof a==='object'&&a!==null?JSON.stringify(a):a));}
const op=()=>require('node:crypto').randomUUID();
async function criarBancoTeste(){
 const banco=new PGlite();
 await banco.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE SCHEMA auth;CREATE SCHEMA storage;
 CREATE TABLE auth.users(id uuid primary key);
 CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 GRANT USAGE ON SCHEMA auth,storage TO authenticated,anon;
 CREATE TABLE public.profiles(id uuid primary key references auth.users(id),nome text,username text);
 CREATE TABLE public.fichas_tripulantes(id uuid primary key references auth.users(id),salva_vidas integer not null default 0,itens_catalogo jsonb,atualizado_em timestamptz default now());
 CREATE TABLE public.missoes_catalogo(id bigint primary key,planeta text);INSERT INTO public.missoes_catalogo VALUES (1,'Verdejante');
 CREATE TABLE public.mechas_20m(usuario_id uuid primary key references auth.users(id));
 CREATE TABLE public.mecha_pecas_equipadas(usuario_id uuid references auth.users(id),peca_id text);
 CREATE TABLE public.mecha_kaijus_catalogo(id text primary key,nome text unique not null,ordem smallint unique not null,imagem_path text default '',descricao text default '',status text default 'Desconhecido' check(status in ('Desconhecido','Conhecido','Derrotado')));
 ALTER TABLE public.mecha_kaijus_catalogo ENABLE ROW LEVEL SECURITY;
 GRANT SELECT ON public.mecha_kaijus_catalogo TO authenticated;
 CREATE POLICY catalogo_ler ON public.mecha_kaijus_catalogo FOR SELECT TO authenticated USING(true);
 CREATE TABLE storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 CREATE TABLE storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
 GRANT SELECT,INSERT,DELETE ON storage.objects TO authenticated;
 CREATE FUNCTION storage.foldername(name text) RETURNS text[] LANGUAGE sql AS $$ SELECT string_to_array(name,'/') $$;
 INSERT INTO public.mecha_kaijus_catalogo(id,nome,ordem) VALUES ('rei-porco','Kaiju Porco',1),('rei-verdejante','Rei Verdejante',2),('cobra-falante','Cobra Falante',3),('hidra','Hidra',4),('tartaruga-dragao','Tartaruga Dragão',5);
 INSERT INTO auth.users VALUES ('${A}'),('${B}');INSERT INTO profiles VALUES ('${A}','Piloto A','a'),('${B}','Piloto B','b');
 INSERT INTO fichas_tripulantes(id,salva_vidas,itens_catalogo) VALUES ('${A}',5,'["manoplas-porco"]'),('${B}',3,'[]');`);
 return banco;
}
before(async()=>{
 db=await criarBancoTeste();
 for(const file of ['EXECUTAR-COMBATE-AUTOMATICO-V6.sql','EXECUTAR-REVISAO-GERAL-V7.sql'])await db.exec(fs.readFileSync(file,'utf8'));
 await login();
});
after(async()=>{await db?.close();});
test('migração cria catálogo e importa os cinco Codex sem apagar os originais',async()=>{
 assert.equal(await scalar('select count(*)::int from nave_itens_catalogo'),12);
 assert.equal(await scalar("select count(*)::int from mecha_kaijus_catalogo where ataques<>'{}'"),5);
 assert.equal(await scalar('select count(*)::int from nave_planetas'),4);
 await db.exec('reset role');assert.equal(await scalar('select planeta_id::int from missoes_catalogo where id=1'),1);await login();
});
test('planetas: nova ficha, revisão concorrente e planeta inicial disponível',async()=>{
 const p=await rpc('nave_salvar_planeta',null,null,{nome:'Órbita',descricao:'Nova expedição',desbloqueado:true});assert.equal(p.versao,1);
 const edited=await rpc('nave_salvar_planeta',p.id,p.versao,{...p,nome:'Órbita Azul'});assert.equal(edited.versao,2);
 await assert.rejects(()=>rpc('nave_salvar_planeta',p.id,p.versao,p),/Outra pessoa/);
 const first=await rpc('nave_salvar_planeta',1,0,{nome:'Verdejante',descricao:'Preservado',desbloqueado:false});assert.equal(first.desbloqueado,true);
});
test('estoque: movimentação única, proteção de saldo e edição com versão',async()=>{
 const p=await rpc('nave_salvar_item',null,null,{nome:'Kit de reparo',categoria:'Ferramenta',quantidade:1,descricao:'Repara a nave'});
 const operation=op(),one=await rpc('nave_movimentar_item',p.id,-1,operation),retry=await rpc('nave_movimentar_item',p.id,-1,operation);
 assert.deepEqual(one,retry);assert.equal(one.quantidade,0);
 await assert.rejects(()=>rpc('nave_movimentar_item',p.id,-1,op()),/insuficiente/);
 await assert.rejects(()=>rpc('nave_salvar_item',p.id,p.versao,p),/outra pessoa/);
 const two=await rpc('nave_movimentar_item',p.id,1,op());assert.equal(two.quantidade,1);
 assert.equal(await scalar("select count(*)::int from nave_eventos where modulo='inventario' and registro_id=$1",[String(p.id)]),3);
 const archived=await rpc('nave_arquivar_item',p.id,two.versao);assert(archived.arquivado);
 await assert.rejects(()=>rpc('nave_movimentar_item',p.id,1,op()),/indisponível/);
});
test('importação local pode ser repetida e nunca soma ou substitui estoque existente',async()=>{
 const items=[{nome:'KIT DE REPARO',categoria:'Ferramenta',quantidade:20,descricao:'Não substituir'},{nome:'Ração',categoria:'Suprimento',quantidade:8,descricao:'Reserva'}];
 const planets=[{id:1,nome:'Não substituir',descricao:'Antigo',desbloqueado:true},{id:2,nome:'Oceano',descricao:'Costa azul',desbloqueado:true}];
 const once=await rpc('nave_importar_legado','teste-v7',planets,items),twice=await rpc('nave_importar_legado','teste-v7',planets,items);
 assert.deepEqual(once,twice);assert.equal(once.itens,1);assert.equal(once.planetas,1);
 assert.equal(await scalar('select nome from nave_planetas where id=1'),'Verdejante');assert.equal(await scalar("select quantidade from nave_inventario where nome='Kit de reparo'"),1);
});
let createdKaiju;
const bossData=()=>({nome:'Guardião de teste',vida:150,agilidade:0,defesa:2,descricao:'Novo chefe',passivas:'',codex_texto:'Teste',imagem_path:'',ataques:{A:{nome:'Impacto',dano:5,descricao:'Causa 5 de dano e atordoa por 1 rodada'}},regras_combate:{A:{name:'Impacto',text:'Causa 5 de dano e atordoa por 1 rodada',damage:5,target:'left',effects:[{kind:'stun',value:0,duration:1,chance:100,target:'target'}],reviewed:true}}});
test('Kaiju novo persiste atributos, cartas e efeitos com controle de autoria',async()=>{
 createdKaiju=await rpc('nave_salvar_kaiju',null,null,bossData());assert(createdKaiju.personalizado);assert.equal(createdKaiju.agilidade,0);assert.equal(createdKaiju.regras_combate.A.effects[0].kind,'stun');
 await login(B);await assert.rejects(()=>rpc('nave_salvar_kaiju',createdKaiju.id,1,{...bossData(),nome:'Tentativa'}),/autor|própri|permiss|editar/i);
 await login();const updated=await rpc('nave_salvar_kaiju',createdKaiju.id,1,{...bossData(),vida:170});assert.equal(updated.vida,170);
 await assert.rejects(()=>rpc('nave_salvar_kaiju',createdKaiju.id,1,bossData()),/mudou/);
 await assert.rejects(()=>rpc('nave_salvar_kaiju','rei-porco',0,bossData()),/autor|própri|permiss|editar/i);
});
test('sorteio de ataque mantém histórico privado e resultado idempotente',async()=>{
 const id=op(),first=await rpc('nave_sortear_ataque',createdKaiju.id,id),again=await rpc('nave_sortear_ataque',createdKaiju.id,id);assert.deepEqual(first,again);assert.equal(first.carta,'A');
 assert.equal(await scalar('select count(*)::int from kaiju_rolagens'),1);
 await login(B);assert.equal(await scalar('select count(*)::int from kaiju_rolagens'),0);await login();
});
test('oficina sorteia no servidor, debita uma vez e nunca repete categoria',async()=>{
 const categories=new Set();for(let i=0;i<3;i++){const id=op(),result=await rpc('nave_sortear_aprimoramento','manoplas-porco',id),again=await rpc('nave_sortear_aprimoramento','manoplas-porco',id);assert.deepEqual(result,again);assert.equal(result.saldo,4-i);assert(!categories.has(result.categoria));categories.add(result.categoria);}
 assert.equal(categories.size,3);await assert.rejects(()=>rpc('nave_sortear_aprimoramento','manoplas-porco',op()),/totalmente/);
 await login(B);await assert.rejects(()=>rpc('nave_sortear_aprimoramento','manoplas-porco',op()),/ficha primeiro/);await login();
});
test('acesso direto às escritas e recibos é bloqueado; visitantes não podem salvar',async()=>{
 await assert.rejects(()=>db.exec("insert into nave_inventario(nome,categoria,quantidade) values('Direto','Outro',1)"),/permission denied/);
 await assert.rejects(()=>db.exec('select * from nave_operacoes'),/permission denied/);
 await login('','anon');await assert.rejects(()=>rpc('nave_salvar_planeta',null,null,{nome:'Visitante'}),/permission denied/);await login();
});
test('imagens: envio no próprio diretório e preservação de imagem referenciada',async()=>{
 await assert.rejects(()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['kaijus-imagens',B+'/errado.png']),/row-level security/);
 await db.query('insert into storage.objects(bucket_id,name) values($1,$2)',['kaijus-imagens',A+'/chefe.png']);
 await rpc('nave_salvar_kaiju',createdKaiju.id,2,{...bossData(),imagem_storage:{bucket:'kaijus-imagens',path:A+'/chefe.png'}});
 await db.query('delete from storage.objects where name=$1',[A+'/chefe.png']);assert.equal(await scalar('select count(*)::int from storage.objects'),1);
});
test('reaplicar a V7 preserva planetas editados, estoque, cartas e melhorias',async()=>{
 await db.exec('reset role');await db.exec(fs.readFileSync('EXECUTAR-REVISAO-GERAL-V7.sql','utf8'));await login();
 assert.equal(await scalar('select nome from nave_planetas where id=2'),'Oceano');assert.equal(await scalar("select quantidade from nave_inventario where nome='Ração'"),8);
 assert.equal(await scalar('select count(*)::int from kaiju_rolagens'),1);
 assert.equal(await scalar('select vida from mecha_kaijus_catalogo where id=$1',[createdKaiju.id]),150);
});

test('banco recusa cartas com dano divergente e efeitos fora dos limites',async()=>{
 const wrong=bossData();wrong.regras_combate.A.damage=9;await assert.rejects(()=>rpc('nave_salvar_kaiju',null,null,wrong),/dano da carta/);
 const invalid=bossData();invalid.regras_combate.A.effects[0].duration=0;await assert.rejects(()=>rpc('nave_salvar_kaiju',null,null,invalid),/duração/);
});

for(const tipo of ['text','varchar','json']){
 test(`migração do cadastro antigo com ataques ${tipo} preserva textos e cartas`,async()=>{
  const antigo=await criarBancoTeste();
  try{
   const defaultAntigo=tipo==='json'?"'{}'":"''";
   await antigo.exec(`alter table mecha_kaijus_catalogo add column ataques ${tipo} default ${defaultAntigo}${tipo==='text'?' not null':''}`);
   await assert.rejects(()=>antigo.query("select ataques='{}'::jsonb from mecha_kaijus_catalogo"),{code:'42883'});
   const cartas={A:{nome:'Ataque preservado',dano:17,descricao:'Causa 17 de dano.'}};
   const narrativa='Carta A: atordoa por 1 rodada.\nNão apagar esta anotação.';
   const originais=[JSON.stringify(cartas),tipo==='json'?JSON.stringify(narrativa):narrativa,'[]','null','"texto JSON"'];
   if(tipo!=='json')originais.push('   ','{"JSON incompleto":');
   if(tipo!=='text')originais.push(null);
   for(let i=0;i<originais.length;i++){
    await antigo.query('insert into mecha_kaijus_catalogo(id,nome,ordem,ataques) values($1,$2,$3,$4)',[`legado-${i}`,`Kaiju legado ${i}`,i+6,originais[i]]);
   }
   await antigo.exec(fs.readFileSync('EXECUTAR-COMBATE-AUTOMATICO-V6.sql','utf8'));
   const migracao=fs.readFileSync('EXECUTAR-REVISAO-GERAL-V7.sql','utf8');
   await antigo.exec(migracao);
   const tipoFinal=await antigo.query("select udt_name,column_default,is_nullable from information_schema.columns where table_schema='public' and table_name='mecha_kaijus_catalogo' and column_name='ataques'");
   assert.equal(tipoFinal.rows[0].udt_name,'jsonb');
   assert.equal(tipoFinal.rows[0].column_default,"'{}'::jsonb");
   assert.equal(tipoFinal.rows[0].is_nullable,'NO');
   const snapshot=()=>antigo.query("select id,ataques,ataques_legado from mecha_kaijus_catalogo where id like 'legado-%' order by id");
   const antes=(await snapshot()).rows;
   for(let i=0;i<originais.length;i++){
    const row=antes.find(r=>r.id===`legado-${i}`);
    assert.equal(row.ataques_legado,originais[i]??'');
    assert.deepEqual(row.ataques,i===0?cartas:{});
   }
   assert.equal((await antigo.query("select count(*)::int as total from mecha_kaijus_catalogo where id not like 'legado-%' and ataques<>'{}'::jsonb")).rows[0].total,5);
   await antigo.exec(migracao);
   assert.deepEqual((await snapshot()).rows,antes);
   await antigo.query("select set_config('request.jwt.claim.sub',$1,false)",[A]);
   await antigo.exec('set role authenticated');
   const salvo=(await antigo.query('select nave_salvar_kaiju(null,null,$1::jsonb) as kaiju',[JSON.stringify(bossData())])).rows[0].kaiju;
   assert.equal(salvo.regras_combate.A.effects[0].kind,'stun');
  }finally{await antigo.close();}
 });
}
