const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const R = require('../js/mecha-novo-regras.js');
const M = require('../js/combate-motor.js');
const ficha = { id: 'u1', nivel_combatente: 5, nivel_tripulante: 11, nivel_embaixador: 3, vida: 115, dano_extra: 5, agilidade: 16, defesa: 3 };
test('regra corrigida: 11 Trip dá 110 vida; braços 2 × Trip dão 22 de dano sem dobrar vida', () => {
    const catalogo = [{ id:'torso', slot:'torso', vidaPorNivel:{tripulante:10} }, {id:'dobro',slot:'bracos',danoPorNivel:{tripulante:2}}];
    assert.equal(R.calcular(ficha, {torso:'torso'}, catalogo).vida,110);
    const r=R.calcular(ficha,{torso:'torso',bracos:'dobro'},catalogo);
    assert.equal(r.base.tripulante,11);assert.equal(r.vida,110);
    assert.equal(r.dano_extra,22);assert.equal(r.agilidade,16);assert.equal(r.defesa,3);
});
test('catálogo contém somente 28 peças finais e quatro slots por kaiju', () => {
    assert.equal(R.pecas.length,28);
    for(const k of R.kaijus)assert.deepEqual(R.pecas.filter(p=>p.kaiju===k.id).map(p=>p.slot),R.slots);
    assert.equal(new Set(R.pecas.map(p=>p.id)).size,28);
});
test('bônus explícitos somam atributos sem alimentar os multiplicadores das peças', () => {
    const r=R.calcular(ficha,{cabeca:'verde-cabeca',torso:'verde-torso',bracos:'verde-bracos',pernas:'verde-pernas'});
    assert.deepEqual(r.base,{embaixador:3,combatente:5,tripulante:11});
    assert.equal(r.vidaTorso,150);assert.equal(r.vida,84);
    assert.equal(r.dano_extra,16);assert.equal(r.agilidade,12);assert.equal(r.defesa,3);
});
test('braços 2 × EMB só definem dano; pernas +1 TRIP só somam agilidade', () => {
    const a=R.calcular(ficha,{torso:'tartaruga-torso',bracos:'tartaruga-bracos'});
    assert.equal(a.base.embaixador,3);assert.equal(a.dano_extra,6);assert.equal(a.vida,120);assert.equal(a.defesa,3);
    const b=R.calcular(ficha,{torso:'hidra-torso',pernas:'cobra-pernas'});
    assert.equal(b.vida,275);assert.equal(b.base.tripulante,11);assert.equal(b.agilidade,17);
});
test('braços do Urso dependem de armas simples; vida fixa não recebe chassi extra', () => {
    const config={torso:'urso-torso',bracos:'urso-bracos',pernas:'urso-pernas',armas_simples:true};
    assert.equal(R.calcular(ficha,config).dano_extra,16);
    assert.equal(R.calcular(ficha,{...config,armas_simples:false}).dano_extra,6);
    assert.equal(R.calcular(ficha,config).vida,240);
});
test('recalcular, recarregar, retirar peças e mudar missão não acumulam bônus antigos', () => {
    const original=JSON.stringify(ficha),config={torso:'verde-torso',bracos:'verde-bracos'};
    const primeiro=R.calcular(ficha,config);
    for(let i=0;i<10;i++)assert.deepEqual(R.calcular(ficha,JSON.parse(JSON.stringify(config))),primeiro);
    assert.equal(R.calcular(ficha,{torso:'verde-torso'}).vida,150);
    assert.equal(R.calcular({...ficha,nivel_combatente:6},config).vida,180);
    assert.equal(JSON.stringify(ficha),original);
    const baixo=R.calcular({nivel_tripulante:1},{pernas:'verde-pernas',torso:'hidra-torso'});
    assert.equal(baixo.base.tripulante,1);assert.equal(baixo.agilidade,2);assert.equal(baixo.vida,0);
});
test('cada braço define seu dano extra, sem somar a fórmula padrão ou afetar outros atributos', () => {
    const esperado={porco:5,verde:10,cobra:11,hidra:10,tartaruga:6,urso:15,aranha:6};
    for(const [kaiju,dano] of Object.entries(esperado)){
        const r=R.calcular(ficha,{torso:'hidra-torso',bracos:`${kaiju}-bracos`,armas_simples:true});
        assert.equal(r.dano_extra,dano,kaiju);assert.equal(r.vida,275,kaiju);
        assert.equal(r.agilidade,16,kaiju);assert.equal(r.defesa,3,kaiju);
    }
});
test('trocar o torso só muda a vida e retirar os braços restaura o dano padrão', () => {
    const config={cabeca:'porco-cabeca',bracos:'tartaruga-bracos',pernas:'cobra-pernas'};
    for(const torso of R.pecas.filter(p=>p.slot==='torso')){
        const r=R.calcular(ficha,{...config,torso:torso.id});
        assert.equal(r.dano_extra,6);assert.equal(r.defesa,3);assert.equal(r.agilidade,17);
    }
    assert.equal(R.calcular(ficha,{...config,bracos:null}).dano_extra,5);
});
test('fórmulas de cabeça, torso, pernas e braços leem a mesma base sem realimentação', () => {
    const catalogo=[
        {id:'c',slot:'cabeca',defesaPorNivel:{embaixador:2}},
        {id:'t',slot:'torso',vidaPorNivel:{tripulante:10}},
        {id:'b',slot:'bracos',danoPorNivel:{embaixador:3}},
        {id:'p',slot:'pernas',agilidadePorNivel:{tripulante:2}}
    ];
    const r=R.calcular(ficha,{cabeca:'c',torso:'t',bracos:'b',pernas:'p'},catalogo);
    assert.equal(r.defesa,6);assert.equal(r.vida,110);assert.equal(r.dano_extra,9);assert.equal(r.agilidade,22);
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
    assert.equal(p.maxHp,150);assert.equal(p.defense,3);assert.equal(p.speed,16);
    assert.equal(p.mechaLevels.combatente,5);
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
