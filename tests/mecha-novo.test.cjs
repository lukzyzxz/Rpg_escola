const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../js/mecha-novo-regras.js');
const M = require('../js/combate-motor.js');
const ficha = { id: 'u1', nivel_combatente: 5, nivel_tripulante: 11, nivel_embaixador: 3, vida: 115, dano_extra: 5, agilidade: 16, defesa: 3 };
test('exemplo do usuário: 11 Trip dá 110 vida; dobrar Trip dá 22 níveis e 220 vida', () => {
    const catalogo = [{ id:'torso', slot:'torso', vidaPorNivel:{tripulante:10} }, {id:'dobro',slot:'bracos',multiplica:{tripulante:2}}];
    assert.equal(R.calcular(ficha, {torso:'torso'}, catalogo).vida,110);
    const r=R.calcular(ficha,{torso:'torso',bracos:'dobro'},catalogo);
    assert.equal(r.niveis.tripulante,22);assert.equal(r.vida,220);
});
test('catálogo contém somente 28 peças finais e quatro slots por kaiju', () => {
    assert.equal(R.pecas.length,28);
    for(const k of R.kaijus)assert.deepEqual(R.pecas.filter(p=>p.kaiju===k.id).map(p=>p.slot),R.slots);
    assert.equal(new Set(R.pecas.map(p=>p.id)).size,28);
});
test('todas as peças acumulam níveis antes da vida; percentual aplicado no fim', () => {
    const r=R.calcular(ficha,{cabeca:'verde-cabeca',torso:'verde-torso',bracos:'verde-bracos',pernas:'verde-pernas'});
    assert.deepEqual(r.niveis,{embaixador:3,combatente:22,tripulante:7});
    assert.equal(r.vida,441);assert.equal(r.dano_extra,22);assert.equal(r.agilidade,12);
});
test('multiplicador de Embaixador afeta defesa e torso; adição de Trip afeta agilidade e torso', () => {
    const a=R.calcular(ficha,{torso:'tartaruga-torso',bracos:'tartaruga-bracos'});
    assert.equal(a.niveis.embaixador,6);assert.equal(a.vida,240);assert.equal(a.defesa,6);
    const b=R.calcular(ficha,{torso:'hidra-torso',pernas:'cobra-pernas'});
    assert.equal(b.vida,300);assert.equal(b.niveis.tripulante,12);assert.equal(b.agilidade,17);
});
test('braços do Urso dependem de armas simples; vida fixa não recebe chassi extra', () => {
    const config={torso:'urso-torso',bracos:'urso-bracos',pernas:'urso-pernas',armas_simples:true};
    assert.equal(R.calcular(ficha,config).niveis.combatente,18);
    assert.equal(R.calcular(ficha,{...config,armas_simples:false}).niveis.combatente,6);
    assert.equal(R.calcular(ficha,config).vida,240);
});
test('recalcular, recarregar, retirar peças e mudar missão não acumulam bônus antigos', () => {
    const original=JSON.stringify(ficha),config={torso:'verde-torso',bracos:'verde-bracos'};
    const primeiro=R.calcular(ficha,config);
    for(let i=0;i<10;i++)assert.deepEqual(R.calcular(ficha,JSON.parse(JSON.stringify(config))),primeiro);
    assert.equal(R.calcular(ficha,{torso:'verde-torso'}).vida,150);
    assert.equal(R.calcular({...ficha,nivel_combatente:6},config).vida,360);
    assert.equal(JSON.stringify(ficha),original);
    const baixo=R.calcular({nivel_tripulante:1},{pernas:'verde-pernas',torso:'hidra-torso'});
    assert.equal(baixo.niveis.tripulante,0);assert.equal(baixo.vida,0);
});
function contexto(){
    const ctx=vm.createContext({MechaNovoRegras:R,CombateMotor:M,window:{usuarioAtual:{id:'u1'}},crypto:require('node:crypto').webcrypto,console});
    vm.runInContext(fs.readFileSync('js/combate-dados.js','utf8'),ctx);return ctx;
}
test('arena usa os mesmos totais da ficha e preserva modo piloto e mecha original', () => {
    const ctx=contexto(),config={usuario_id:'u1',torso:'verde-torso',bracos:'verde-bracos',cabeca:'hidra-cabeca',carta_dupla:'A'};
    ctx.dados={profiles:[{id:'u1',nome:'Teste'}],fichas:[ficha],mechas:[{usuario_id:'u1'}],equipadas:[],pecas:[],novosMechas:[config]};
    const p=vm.runInContext("CombateDados.importPlayer('u1',dados,'mecha-novo')",ctx);
    assert.equal(p.maxHp,R.calcular(ficha,config).vida);assert.equal(p.extra,10);assert.equal(p.doubleDamageCard,'A');
    assert.equal(vm.runInContext("CombateDados.importPlayer('u1',dados,'piloto').maxHp",ctx),115);
    assert.equal(vm.runInContext("CombateDados.importPlayer('u1',dados,'mecha').maxHp",ctx),10);
});
test('novo mecha sem torso ou sem cadastro não entra silenciosamente com atributos errados', () => {
    const ctx=contexto();ctx.dados={profiles:[{id:'u1'}],fichas:[ficha],novosMechas:[]};
    assert.throws(()=>vm.runInContext("CombateDados.importPlayer('u1',dados,'mecha-novo')",ctx),/salve a configuração/);
    ctx.dados.novosMechas=[{usuario_id:'u1'}];
    assert.throws(()=>vm.runInContext("CombateDados.importPlayer('u1',dados,'mecha-novo')",ctx),/torso/);
});
test('Hidra dobra o dano total da carta escolhida somente no novo mecha', () => {
    const player={id:'u1',name:'Piloto',maxHp:100,extra:5,speed:10,mode:'mecha-novo',doubleDamageCard:'A',cards:{A:{...M.rule(),damage:10}}};
    const criar=p=>M.create({teams:[{id:'t',players:[p]}],boss:{id:'b',name:'Chefe',maxHp:100,speed:0,cards:{K:{...M.rule(),damage:0}}}});
    const resolver=s=>M.resolve(s,{t:{card:'A',bossCard:'K'}});
    assert.equal(resolver(criar(player)).teams[0].boss.hp,70);
    assert.equal(resolver(criar({...player,mode:'mecha'})).teams[0].boss.hp,85);
});
test('retaliação da Tartaruga causa 30 quando recebe dano, sem recursão', () => {
    const criar=defense=>M.create({teams:[{id:'t',players:[{id:'u',maxHp:100,speed:0,defense,mode:'mecha-novo',retaliationDamage:30,cards:{K:{...M.rule(),damage:0}}}]}],boss:{id:'b',maxHp:100,speed:10,cards:{A:{...M.rule(),damage:5}}}});
    const resolver=s=>M.resolve(s,{t:{card:'K',bossCard:'A'}});
    assert.equal(resolver(criar(0)).teams[0].boss.hp,70);
    assert.equal(resolver(criar(10)).teams[0].boss.hp,100);
});
