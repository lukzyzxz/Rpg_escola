/* Motor puro: não acessa DOM, banco ou relógio. Estado e sorteios ficam no histórico. */
(function(root){
'use strict';
const CARDS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const KINDS={stun:'Atordoado',poison:'Veneno',burn:'Queimadura',bleed:'Sangramento',attack:'Dano',defense:'Defesa',speed:'Agilidade',shield:'Escudo',protection:'Redução de dano recebido',weakness:'Fraqueza',blind:'Cegueira',regen:'Regeneração',healing:'Cura',reflect:'Reflexão',evasion:'Esquiva',skip:'Pular ataque',haste:'Prioridade'};
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const card=v=>['1','as','ás'].includes(norm(v))?'A':String(v??'').toUpperCase().trim();
const clone=v=>JSON.parse(JSON.stringify(v));
const round=v=>Math.round(v*100)/100;
function random(state){state.seed=(Math.imul(state.seed,1664525)+1013904223)>>>0;return state.seed/4294967296;}
function rule(){return {name:'',text:'',damage:null,heal:0,cost:0,target:'auto',effects:[],warnings:[],special:'',reviewed:false};}
function parse(text,{boss=false,names=[]}={}){
 const r=rule();r.text=String(text||'');let s=norm(text);if(!s)return r;
 r.name=r.text.split(/[.;\n]/)[0].slice(0,65);
 let m=s.match(/(?:causa|causar|causando|dano\s*[:=])\s*(\d+(?:[.,]\d+)?)\s*(?:de dano)?/)||s.match(/(\d+(?:[.,]\d+)?)\s*(?:pontos?\s*)?de dano/);
 if(m)r.damage=Number(m[1].replace(',','.'));
 if(r.damage===null){m=s.match(/(?:perde|perdem)\s*(\d+)\s*(?:de )?(?:vida|hp)/);if(m)r.damage=Number(m[1]);}
 m=s.match(/(?:cura|curar|recupera|recuperar|regenera)\s*(\d+(?:[.,]\d+)?)/);if(m)r.heal=Number(m[1].replace(',','.'));
 m=s.match(/(?:sacrifica|sacrificar|custa)\s*(\d+)\s*(?:hp|vida)/);if(m)r.cost=Number(m[1]);
 if(/todos|toda a equipe|grupo todo/.test(s))r.target='all';
 else if(/dois alvos|2 alvos/.test(s))r.target='random2';
 else if(/aleatori/.test(s))r.target='random';
 else if(/menos vida|menor vida/.test(s))r.target='lowest';
 else if(/mais vida|maior vida/.test(s))r.target='highest';
 else if(/esquerda/.test(s))r.target='left';
 else if(/direita/.test(s))r.target='right';
 else if(/meio|central/.test(s))r.target='middle';
 else if(/si mesmo|proprio|a si|no usuario/.test(s))r.target='self';
 for(const name of [...names].sort((a,b)=>b.length-a.length)){if(name&&new RegExp('(?:^|[^a-z0-9])'+norm(name).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?:$|[^a-z0-9])').test(s)){r.target='name:'+name;break;}}
 if(r.heal&&r.target.startsWith('name:'))r.healTarget='target';
 if(r.heal&&/todos.*aliados|toda.*equipe/.test(s)){r.effects.push({kind:'healing',value:r.heal,duration:1,chance:100,target:'allies'});r.heal=0;}
 const duration=Math.max(1,n(s.match(/(?:por|durante)\s*(\d+)\s*(?:rodada|turno)/)?.[1],1));
 const chance=n(s.match(/(\d+)\s*%\s*(?:de chance|de probabilidade)/)?.[1],100);
 const add=(kind,value=0,target)=>r.effects.push({kind,value,duration,chance,target:target||'target'});
 if(/atordoa|atordoado|atordoamento|paralisa|congela/.test(s))add('stun');
 if(/envenena|veneno|sangra|sangramento|queima|queimadura/.test(s)){
   const kind=/sangra/.test(s)?'bleed':/queim/.test(s)?'burn':'poison';
   const v=s.match(/(?:veneno|sangramento|queimadura)\s*[:=]?\s*(\d+)/)?.[1]||s.match(/(\d+)\s*(?:de dano\s*)?(?:por|a cada)\s*(?:rodada|turno)/)?.[1];
   if(v){add(kind,Number(v));if(!/(?:e|mais|alem).*?(?:veneno|queim|sangr)/.test(s)&&/por rodada|por turno|a cada rodada/.test(s))r.damage=null;}
   else r.warnings.push('Informe o dano por rodada do efeito contínuo.');
 }
 if(/cega|cegueira/.test(s))add('blind');
 if(/lentidao|pula? (?:a )?carta|passa (?:a )?carta/.test(s))add('skip');
 if(/fraqueza|reduz.*dano.*50%|diminui.*50%.*dano/.test(s))add('weakness',50);
 if(/ataca antes|ataca primeiro|prioridade/.test(s))add('haste',0,'self');
 m=s.match(/(?:escudo|barreira)\s*(?:de|:|=)?\s*(\d+)/);if(m)add('shield',Number(m[1]),boss?'target':'self');
 m=s.match(/regenera(?:cao)?\s*(\d+)\s*(?:de vida\s*)?(?:por|a cada)/);if(m){r.heal=0;add('regen',Number(m[1]),'self');}
 for(const [pt,kind] of [['dano','attack'],['defesa','defense'],['agilidade','speed']]){
   m=s.match(new RegExp('([+-]\\s*\\d+(?:[.,]\\d+)?)\\s*(?:de )?'+pt));
   if(m)add(kind,Number(m[1].replace(/\s/g,'').replace(',','.')),/no alvo|do alvo|jogador|inimigo|adversario/.test(s)?'target':'self');
   else {m=s.match(new RegExp('(reduz|diminui|aumenta|ganha)\\s*(?:a |o )?'+pt+'\\s*(?:em |de |:)?\\s*(\\d+)'));if(m)add(kind,Number(m[2])*(/reduz|diminui/.test(m[1])?-1:1),/no alvo|do alvo|jogador|inimigo|adversario/.test(s)?'target':'self');}
 }
 if(/reflet|reflex/.test(s)){add('reflect',100,'self');if(/esquiva/.test(s)){r.effects.at(-1).onEvade=true;r.effects.at(-1).chance=100;add('evasion',100,'self');}}
 else if(/esquiva/.test(s))add('evasion',100,'self');
 if(/mais novo|mais velho|discord|nome do.*ataque|escolh|descart|baralho|maos dadas|troca.*lugar|invoca|inverte|nhoc|sorte|chance.*nao/.test(s))r.warnings.push('Há uma escolha ou condição física: defina o alvo/efeito na preparação.');
 if(/(?:jogador|player)\s+x\b|\bx\s+(?:jogador|player)/.test(s))r.warnings.push('Substitua X pelo nome do jogador ou selecione um alvo.');
 if(r.damage===null&&!r.heal&&!r.cost&&!r.effects.length)r.warnings.push('Texto sem efeito reconhecido: configure a regra da carta.');
 // A análise reconhece comandos simples; nenhuma descrição extra é aprovada silenciosamente.
 if(!r.warnings.length && !/^(?:causa|dano|cura|recupera|atordoa|paralisa|envenena|veneno|sangramento|queimadura|cega|cegueira|escudo|regenera|[+-]|reduz|fraqueza|ataca)/.test(s))r.warnings.push('Revise a descrição e confirme a interpretação abaixo.');
 return r;
}
function effectLabel(e){const alvo={target:'alvo da carta',self:'próprio usuário',allies:'aliados',boss:'Kaiju'}[e.target]||String(e.target||'alvo da carta').replace('name:','');return `${KINDS[e.kind]||e.kind}${e.value?' '+(e.value>0&&['attack','defense','speed'].includes(e.kind)?'+':'')+e.value:''} · ${e.duration} rodada(s) · ${alvo}`;}
function actor(raw){const a=clone(raw);a.maxHp=Math.max(1,n(a.maxHp,20));a.hp=Math.min(a.maxHp,Math.max(0,n(a.hp,a.maxHp)));a.speed=n(a.speed,5);a.defense=n(a.defense);a.extra=n(a.extra);a.effects=a.effects||[];a.cards=a.cards||{};a.memory=a.memory||{shots:{},combo:0,drone:0,nextDamage:0,lastDamage:0};return a;}
function create({teams,boss,title='Combate',seed=1}){
 if(!teams?.length||teams.length>2)throw Error('Selecione uma ou duas frotas.');
 for(const t of teams){if(!t.players?.length||t.players.length>5)throw Error('Cada frota precisa de 1 a 5 integrantes.');const names=new Set();for(const a of t.players){if(names.has(norm(a.name)))throw Error('Use nomes diferentes dentro de cada frota para permitir alvos exatos.');names.add(norm(a.name));}}
 return {schema:1,title,round:0,status:'active',seed:seed>>>0,teams:teams.map((t,index)=>({id:t.id||'t'+index,name:t.name,players:t.players.map(p=>actor({...p,id:(t.id||'t'+index)+'::'+p.id})),boss:actor({...clone(t.boss||boss),id:'boss-'+index})})),log:[]};
}
function stat(a,key){if(key==='defense'&&a.noDefense)return 0;const kind={extra:'attack',speed:'speed',defense:'defense'}[key];return (key==='defense'&&a.noDefense?0:n(a[key])+(key==='defense'?n(a.equipmentDefense):0))+a.effects.filter(e=>e.kind===kind).reduce((sum,e)=>sum+n(e.value),0);}
function targetList(r,source,team,state){
 const enemies=source.id===team.boss.id?team.players:[team.boss];const alive=enemies.filter(a=>a.hp>0);const target=r.target||'auto';
 if(target==='self')return [source];if(target==='all')return alive;
 if(target.startsWith('name:')){const named=[...team.players,team.boss].filter(a=>norm(a.name)===norm(target.slice(5)));if(!named.length)throw Error(`Alvo ${target.slice(5)} não existe em ${team.name}. Edite o alvo da carta.`);return named.filter(a=>a.hp>0);}
 if(!alive.length)return [];
 if(target==='random'||target==='random2'){const candidates=[...alive],out=[];for(let j=0;j<(target==='random2'?2:1)&&candidates.length;j++)out.push(candidates.splice(Math.floor(random(state)*candidates.length),1)[0]);return out;}
 if(target==='lowest')return [[...alive].sort((a,b)=>a.hp-b.hp)[0]];
 if(target==='highest')return [[...alive].sort((a,b)=>b.hp-a.hp)[0]];
 if(target==='right')return [alive.at(-1)];if(target==='middle')return [alive[Math.floor((alive.length-1)/2)]];
 return [alive[0]];
}
function log(s,t,msg){s.log.push({round:s.round,team:t.id,text:msg});}
function damage(s,t,source,victim,value,{direct=false,reflect=true}={}){
 if(!victim||victim.hp<=0||value<=0)return 0;
 const evade=victim.effects.find(e=>e.kind==='evasion');
 const reflected=victim.effects.find(e=>e.kind==='reflect');
 if(!direct&&evade&&random(s)*100<n(evade.chance,100)){log(s,t,`${victim.name} esquivou.`);if(reflect&&reflected&&source)damage(s,t,victim,source,value*Math.max(0,n(reflected.value,100))/100,{direct:true,reflect:false});return 0;}
 let amount=direct?value:Math.max(0,value-Math.max(0,stat(victim,'defense'))-(source?.activeCard && (card(source.activeCard)==='A'?1:n(source.activeCard))%2===1?n(victim.oddReduction):0));
 if(!direct){const reduction=Math.max(0,...victim.effects.filter(e=>e.kind==='protection').map(e=>Math.min(100,n(e.value))));amount*=1-reduction/100;}
 if(!direct&&victim.memory.drone>0){const blocked=Math.min(amount,victim.memory.drone);victim.memory.drone=round(victim.memory.drone-blocked);amount-=blocked;log(s,t,`Drone de ${victim.name} absorveu ${blocked}.`);}
 for(const shield of direct?[]:victim.effects.filter(e=>e.kind==='shield')){const blocked=Math.min(amount,shield.value);shield.value-=blocked;amount-=blocked;}
 const dealt=Math.min(victim.hp,round(Math.max(0,amount)));victim.hp=round(victim.hp-dealt);
 log(s,t,`${source?.name||'Efeito'} → ${victim.name}: −${dealt} PV${victim.hp<=0?' · derrotado':''}.`);
 if(!direct&&reflect&&source&&reflected&&!reflected.onEvade&&dealt>0)damage(s,t,victim,source,dealt*Math.max(0,n(reflected.value,100))/100,{direct:true,reflect:false});
 return dealt;
}
function heal(s,t,a,v){if(a.hp<=0)return;const amount=Math.min(a.maxHp-a.hp,Math.max(0,v));a.hp=round(a.hp+amount);log(s,t,`${a.name}: +${round(amount)} PV.`);}
function applyEffect(s,t,source,victims,e){
 const dest=e.target==='self'?[source]:e.target==='allies'?t.players.filter(a=>a.hp>0):e.target==='boss'?[t.boss]:e.target?.startsWith('name:')?[...t.players,t.boss].filter(a=>norm(a.name)===norm(e.target.slice(5))):victims;
 if(e.target?.startsWith('name:')&&!dest.length)throw Error('Alvo do efeito não encontrado: '+e.target.slice(5));
 const oneChance=e.kind==='evasion'?100:n(e.chance,100);
 if(random(s)*100>=oneChance){log(s,t,`${KINDS[e.kind]} de ${source.name} não ativou.`);return;}
 for(const a of dest){if(a.hp<=0)continue;
  if(e.kind==='healing'){heal(s,t,a,n(e.value));continue;}
  if(e.fromExtra)e={...e,value:Math.max(0,stat(source,'extra'))};
  const actionKind=['stun','blind','skip','poison','burn','bleed','regen'].includes(e.kind);
  const status={...clone(e),starts:e.nextRound?s.round+1:s.round,source:source.id,remaining:Math.max(1,n(e.duration,1)),actionKind,expires:s.round+Math.max(1,n(e.duration,1))-1};
  // Mesmo efeito da mesma fonte renova a duração; fontes distintas acumulam.
  const previous=a.effects.findIndex(x=>x.kind===e.kind&&x.source===source.id);
  if(previous>=0)a.effects.splice(previous,1);a.effects.push(status);log(s,t,`${a.name}: ${effectLabel(e)}.`);
 }
}
function turn(s,t,a,r,bossCard,repeated=false){
 if(a.hp<=0)return;
 const current=repeated?(a.repeatEffects||[]):a.effects.filter(e=>e.actionKind&&(e.starts||0)<=s.round);
 if(!repeated)a.repeatEffects=current;
 for(const e of repeated?[]:current){if(['poison','burn','bleed'].includes(e.kind))damage(s,t,null,a,n(e.value),{direct:true});else if(e.kind==='regen')heal(s,t,a,n(e.value));}
 const blocked=current.some(e=>['stun','skip'].includes(e.kind));
 const finish=()=>{for(const e of repeated?[]:current)e.remaining--;a.effects=a.effects.filter(e=>!e.actionKind||e.remaining>0);};
 if(a.hp<=0){finish();return;}
 if(blocked){a.skippedRound=s.round;a.memory.combo=0;log(s,t,`${a.name} não age: atordoamento/pular ataque.`);finish();return;}
 if(r.warnings?.length&&!r.reviewed)throw Error(`Revise ${a.name}: ${r.name||'carta'}.`);
 let base=n(r.damage),healing=n(r.heal),effects=clone(r.effects||[]);
 if(r.cost){a.hp=Math.max(0,round(a.hp-n(r.cost)));log(s,t,`${a.name} sacrificou ${r.cost} PV.`);if(a.hp<=0){finish();return;}}
 const targets=targetList(r,a,t,s);
 switch(r.special){
 case 'combo': base+=a.memory.combo;a.memory.combo++;break;
 case 'cannon': if(a.memory.shots[r.itemId]){base=0;a.memory.shots[r.itemId]=false;log(s,t,`${a.name} recarregou o canhão.`);}else a.memory.shots[r.itemId]=true;break;
 case 'vorpal': if(stat(a,'speed')>stat(t.boss,'speed'))base*=3;break;
 case 'odd': if(CARDS.indexOf(card(bossCard))<10&&(card(bossCard)==='A'?1:n(bossCard))%2===1)base=8;break;
 case 'overload': a.memory.nextDamage+=10;break;
 case 'drone': a.memory.drone=15;log(s,t,`${a.name} invocou drone com 15 PV.`);break;
 case 'guincho': if(a.hp>a.maxHp/2)healing=4;else base=2*n(r.choiceDamage);break;
 case 'memory': if(r.condition)base=12;break;
 }
 if(r.special!=='combo')a.memory.combo=0;
 if(healing>0){const recipients=r.healTarget==='target'?targets:[a];for(const v of recipients)heal(s,t,v,healing);}
 // Escudo/esquiva de uma carta protegem antes do ataque e não dependem de acertar.
 const defensive=effects.filter(e=>(e.target==='self'||e.target==='allies')&&!e.reaction&&e.kind!=='haste');
 for(const e of defensive)applyEffect(s,t,a,targets,e);
 let amount=0;
 if(base>0){amount=(base*n(r.multiplier,1)+stat(a,'extra')+n(a.memory.nextDamage)+(a.memory.drone>0?4:0));a.memory.nextDamage=0;
 const reduction=Math.max(0,...a.effects.filter(e=>e.kind==='weakness').map(e=>Math.min(100,n(e.value,50))));amount*=1-reduction/100;
 if(current.some(e=>e.kind==='blind')){log(s,t,`${a.name} errou por cegueira.`);amount=0;}
 for(const v of targets){const dealt=damage(s,t,a,v,amount);a.memory.lastDamage=dealt;}
 }else log(s,t,`${a.name}: ${r.name||'sem ataque nesta carta'}.`);
 for(const e of effects.filter(e=>e.target!=='self'&&e.target!=='allies'&&!e.reaction)){if(!current.some(x=>x.kind==='blind'))applyEffect(s,t,a,targets,e);}
 finish();
}
function validate(s){
 for(const t of s.teams){
  const names=[...t.players,t.boss].map(a=>norm(a.name));
  for(const a of [...t.players,t.boss])for(const [c,r]of Object.entries(a.cards)){
   if(r.warnings?.length&&!r.reviewed)throw Error(`Revise ${a.name}, carta ${c}.`);
   for(const target of [r.target,...(r.effects||[]).map(e=>e.target)])if(target?.startsWith('name:')&&!names.includes(norm(target.slice(5))))throw Error(`${t.name}: alvo ${target.slice(5)} não existe. Ajuste os alvos do Kaiju desta frota.`);
   for(const e of r.effects||[])if(!Object.hasOwn(KINDS,e.kind)||n(e.duration)<1||n(e.chance,100)<0||n(e.chance,100)>100)throw Error(`${a.name}, carta ${c}: efeito inválido.`);
  }
 }
 return s;
}
function resolve(input,orders){
 const s=clone(input);if(s.status!=='active')throw Error('Combate encerrado.');s.round++;s.log=[];
 for(const t of s.teams){
  if(t.boss.hp<=0||!t.players.some(p=>p.hp>0))continue;
  const order=orders[t.id];if(!order||!CARDS.includes(card(order.card))||!CARDS.includes(card(order.bossCard)))throw Error(`Informe as cartas de ${t.name} e do Kaiju.`);
  const pc=card(order.card),bc=card(order.bossCard);
  const actions=t.players.map(p=>({actor:p,rule:p.cards[pc]||{...rule(),name:pc==='J'||pc==='Q'||pc==='K'?'Sem ataque':'Soco',damage:['J','Q','K'].includes(pc)?0:3}}));
  actions.push({actor:t.boss,rule:t.boss.cards[bc]||{...rule(),name:'Sem ataque',damage:0}});
  for(const x of actions){if(x.actor.hp>0&&!x.actor.effects.some(e=>['stun','skip'].includes(e.kind)&&e.remaining>0)){for(const e of x.rule.effects||[])if(e.reaction||(e.kind==='haste'&&e.target==='self'))applyEffect(s,t,x.actor,[],e);}}
  for(const action of actions)action.priority=stat(action.actor,'speed')+(action.actor.effects.some(e=>e.kind==='haste')?100000:0);
  actions.sort((a,b)=>b.priority-a.priority); // Empate: ordem dos jogadores, Kaiju por último.
  log(s,t,`${t.name}: ${pc} · ${t.boss.name}: ${bc}.`);
  for(const x of actions){if(t.boss.hp<=0||!t.players.some(p=>p.hp>0))break;x.actor.activeCard=x.actor===t.boss?bc:pc;turn(s,t,x.actor,x.rule,bc);if(x.rule.repeat===2 && x.actor.skippedRound!==s.round && x.actor.hp>0 && t.boss.hp>0)turn(s,t,x.actor,{...x.rule,repeat:1},bc,true);}
  for(const a of [...t.players,t.boss]){delete a.repeatEffects;a.effects=a.effects.filter(e=>e.actionKind?e.remaining>0:e.expires>s.round||e.permanent);}
 }
 if(s.teams.every(t=>t.boss.hp<=0||!t.players.some(p=>p.hp>0)))s.status='finished';
 return s;
}
const api={CARDS,KINDS,norm,card,clone,parse,rule,create,validate,resolve,effectLabel,stat};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CombateMotor=api;
})(typeof window!=='undefined'?window:this);
