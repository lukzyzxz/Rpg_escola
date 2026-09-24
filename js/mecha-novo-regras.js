/* PARTES KAIJUS (1).xlsx — aba VERSÃO FINAL.
 * Cada fórmula lê os níveis originais da ficha; peças não modificam níveis.
 */
const MechaNovoRegras = (() => {
    const slots = ['cabeca', 'torso', 'bracos', 'pernas'];
    const classes = ['embaixador', 'combatente', 'tripulante'];
    const kaijus = [
        { id: 'porco', nome: 'Kaiju Porco' },
        { id: 'verde', nome: 'Rei Verdejante' },
        { id: 'cobra', nome: 'Cobra Falante' },
        { id: 'hidra', nome: 'Hidra Caótica' },
        { id: 'tartaruga', nome: 'Tartaruga Dragão' },
        { id: 'urso', nome: 'Urso' },
        { id: 'aranha', nome: 'Aranha' }
    ];
    const nomesSlots = { cabeca: 'Cabeça', torso: 'Torso', bracos: 'Braços', pernas: 'Pernas' };
    const p = (kaiju, slot, texto, efeito = {}) => ({
        id: `${kaiju}-${slot}`, kaiju, slot,
        nome: `${nomesSlots[slot]} — ${kaijus.find(k => k.id === kaiju).nome}`,
        texto, ...efeito
    });
    const pecas = [
        p('porco', 'cabeca', 'Defesa padrão: 1 por nível original de Embaixador.'),
        p('verde', 'cabeca', 'Defesa padrão; −30% de vida; +4 de dano extra.', { bonus: { dano_extra: 4 }, percentualVida: -30 }),
        p('cobra', 'cabeca', 'Padrão; esquiva de 1 ataque.', { passiva: 'Esquiva de 1 ataque: declare ao usar.' }),
        p('hidra', 'cabeca', 'Dobra o dano de uma carta.', { passiva: 'Dobra o dano da carta escolhida.' }),
        p('tartaruga', 'cabeca', 'Pode levantar e redirecionar ataques individuais para você; sua defesa, esquiva e redução não são contabilizadas.', { passiva: 'Cabeçada: ao redirecionar um ataque individual para você, ignore sua defesa, esquiva e redução.' }),
        p('urso', 'cabeca', 'Morder: ataque extra de 6 de dano com armas simples.', { passiva: 'Morder: ataque extra de 6 de dano, somente com armas simples.' }),
        p('aranha', 'cabeca', 'Pinça: se adivinhar a próxima carta do chefe, você não leva dano.', { passiva: 'Pinça: declare a previsão; ao acertar a próxima carta do chefe, não recebe dano.' }),
        p('porco', 'torso', '100 de vida.', { vidaFixa: 100 }),
        p('verde', 'torso', '30 de vida por nível original de Combatente.', { vidaPorNivel: { combatente: 30 } }),
        p('cobra', 'torso', '120 de vida.', { vidaFixa: 120 }),
        p('hidra', 'torso', '25 de vida por nível original de Tripulante.', { vidaPorNivel: { tripulante: 25 } }),
        p('tartaruga', 'torso', '40 de vida por nível original de Embaixador.', { vidaPorNivel: { embaixador: 40 } }),
        p('urso', 'torso', '200 de vida.', { vidaFixa: 200 }),
        p('aranha', 'torso', '40 de vida por nível original de Tripulante.', { vidaPorNivel: { tripulante: 40 } }),
        p('porco', 'bracos', 'Dano extra padrão: 1 por nível original de Combatente.'),
        p('verde', 'bracos', 'Dano extra = 2 × nível original de Combatente.', { danoPorNivel: { combatente: 2 } }),
        p('cobra', 'bracos', 'Dano extra = 1 × nível original de Tripulante.', { danoPorNivel: { tripulante: 1 } }),
        p('hidra', 'bracos', 'Dano extra = 2 × nível original de Combatente.', { danoPorNivel: { combatente: 2 } }),
        p('tartaruga', 'bracos', 'Dano extra = 2 × nível original de Embaixador.', { danoPorNivel: { embaixador: 2 } }),
        p('urso', 'bracos', 'Dano extra = 3 × nível original de Combatente com armas simples; caso contrário, dano extra padrão.', { danoPorNivel: { combatente: 3 }, apenasArmasSimples: true }),
        p('aranha', 'bracos', '6 de dano extra.', { danoFixo: 6 }),
        p('porco', 'pernas', 'Agilidade padrão: 5 + nível original de Tripulante.'),
        p('verde', 'pernas', 'Agilidade padrão −4; −30 de vida; +2 de dano extra.', { bonus: { vida: -30, agilidade: -4, dano_extra: 2 } }),
        p('cobra', 'pernas', 'Agilidade padrão +1.', { bonus: { agilidade: 1 } }),
        p('hidra', 'pernas', 'Agilidade padrão; +50 de vida.', { bonus: { vida: 50 } }),
        p('tartaruga', 'pernas', 'Causa 30 de dano ao sofrer dano.', { passiva: 'Retaliação: causa 30 de dano ao sofrer dano.' }),
        p('urso', 'pernas', 'Agilidade padrão; +40 de vida; +1 de dano extra.', { bonus: { vida: 40, dano_extra: 1 } }),
        p('aranha', 'pernas', 'Agilidade padrão +1; −40 de vida; +1 de dano extra.', { bonus: { vida: -40, agilidade: 1, dano_extra: 1 } })
    ];
    const numero = valor => Number.isFinite(Number(valor)) ? Number(valor) : 0;
    const arredondar = valor => Math.round(valor * 100) / 100;

    // Cabeça → defesa; torso → vida; braços → dano extra; pernas → agilidade.
    // Efeitos explícitos somam atributos, sem alimentar as fórmulas de outras peças.
    function calcular(ficha = {}, config = {}, catalogo = pecas) {
        const equipadas = slots.map(slot => catalogo.find(item => item.id === config[slot] && item.slot === slot)).filter(Boolean);
        const base = Object.fromEntries(classes.map(classe => [classe, Math.max(0, numero(ficha[`nivel_${classe}`]))]));
        const porSlot = Object.fromEntries(equipadas.map(item => [item.slot, item]));
        const atributos = { cabeca: 'defesa', torso: 'vida', bracos: 'dano_extra', pernas: 'agilidade' };
        const nomes = { defesa: 'Defesa', vida: 'Vida', dano_extra: 'Dano extra', agilidade: 'Agilidade' };
        const principais = { defesa: base.embaixador, vida: 0, dano_extra: base.combatente, agilidade: 5 + base.tripulante };
        const formulas = {
            cabeca: `1 × ${base.embaixador} Embaixador`, torso: '0 (sem torso)',
            bracos: `1 × ${base.combatente} Combatente`, pernas: `5 + ${base.tripulante} Tripulante`
        };
        const regras = {
            cabeca: ['defesaFixa', 'defesaPorNivel'], torso: ['vidaFixa', 'vidaPorNivel'],
            bracos: ['danoFixo', 'danoPorNivel'], pernas: ['agilidadeFixa', 'agilidadePorNivel']
        };
        for (const slot of slots) {
            const item = porSlot[slot];
            if (!item || (item.apenasArmasSimples && !config.armas_simples)) continue;
            const [fixo, porNivel] = regras[slot];
            if (item[fixo] != null) {
                principais[atributos[slot]] = numero(item[fixo]);
                formulas[slot] = `${numero(item[fixo])} fixos`;
            } else if (item[porNivel]) {
                principais[atributos[slot]] = classes.reduce((total, classe) => total + numero(item[porNivel][classe]) * base[classe], 0);
                formulas[slot] = classes.filter(classe => numero(item[porNivel][classe])).map(classe => `${numero(item[porNivel][classe])} × ${base[classe]} ${classe}`).join(' + ') || '0';
            }
        }
        const bonus = { defesa: 0, vida: 0, dano_extra: 0, agilidade: 0 };
        let percentualVida = 0;
        const efeitos = [];
        for (const item of equipadas) {
            if (item.apenasArmasSimples && !config.armas_simples) continue;
            for (const atributo of Object.keys(bonus)) {
                const valor = numero(item.bonus?.[atributo]);
                bonus[atributo] += valor;
                if (valor) efeitos.push(`${item.nome}: ${valor > 0 ? '+' : '−'}${Math.abs(valor)} de ${nomes[atributo].toLowerCase()}`);
            }
            percentualVida += numero(item.percentualVida);
            if (item.percentualVida) efeitos.push(`${item.nome}: ${item.percentualVida}% de vida`);
        }
        const totais = Object.fromEntries(Object.keys(bonus).map(atributo => [atributo, Math.max(0, arredondar((principais[atributo] + bonus[atributo]) * (atributo === 'vida' ? 1 + percentualVida / 100 : 1)))]));
        return {
            base, equipadas, bonus, efeitos, ...totais,
            vidaTorso: principais.vida, vidaExtra: bonus.vida, percentualVida,
            calculos: slots.map(slot => ({ slot, atributo: nomes[atributos[slot]], formula: formulas[slot], valor: principais[atributos[slot]] })),
            completo: !!porSlot.torso,
            passivas: equipadas.filter(item => item.passiva).map(item => ({ nome: item.nome, texto: item.passiva }))
        };
    }
    return { slots, classes, kaijus, nomesSlots, pecas, calcular };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MechaNovoRegras;
