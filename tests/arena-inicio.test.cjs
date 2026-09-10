const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const M=require('../js/combate-motor.js');
const source=fs.readFileSync('js/arena.js','utf8');
const start=source.slice(source.indexOf(' async function start()'),source.indexOf('\n',source.indexOf('renderBattle();}',source.indexOf(' async function start()'))));
async function iniciar(item,cards){
 const ctx=vm.createContext({M,crypto:require('node:crypto').webcrypto,$:()=>({checked:true}),pending:()=>0,renderBattle(){},CATALOGO_ITENS_APRIMORAMENTO:[item],D:{create:async estado=>({estado})},draft:{title:'Teste',boss:{name:'Chefe',maxHp:100,cards:{}},teams:[{id:'t1',name:'Frota',players:[{id:'u1',name:'Piloto',maxHp:50,cards}]}]}});
 vm.runInContext(start,ctx);await vm.runInContext('start()',ctx);return ctx.row;
}
test('Codex Porco não bloqueia início por capacidade zero ou quantidade de cartas',async()=>{
 for(const quantidade of [1,10]){
  const cards=Object.fromEntries(M.CARDS.slice(0,quantidade).map(c=>[c,{...M.rule(),itemId:'codex-porco',damage:7}]));
  const row=await iniciar({id:'codex-porco',nome:'Codex Kaiju Porco',cartas:[],codexKaijuId:'rei-porco'},cards);
  assert.equal(row.estado.status,'active');
 }
});
test('capacidade dos equipamentos comuns permanece validada',async()=>{
 await assert.rejects(iniciar({id:'arma',nome:'Arma',cartas:['A']},{A:{...M.rule(),itemId:'arma'},'2':{...M.rule(),itemId:'arma'}}),/excede a capacidade/);
});
