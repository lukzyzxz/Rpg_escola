/* PARTES KAIJUS (1).xlsx — aba VERSÃO FINAL.
 * Regras independentes do mecha antigo. Nunca grava níveis derivados na ficha base.
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
        p('porco', 'cabeca', 'Padrão: mantém os níveis de Embaixador.'),
        p('verde', 'cabeca', '−30% de vida; +4 níveis de Combatente.', { soma: { combatente: 4 }, percentualVida: -30 }),
        p('cobra', 'cabeca', 'Padrão; esquiva de 1 ataque.', { passiva: 'Esquiva de 1 ataque: declare ao usar.' }),
        p('hidra', 'cabeca', 'Dobra o dano de uma carta.', { passiva: 'Dobra o dano da carta escolhida.' }),
        p('tartaruga', 'cabeca', 'Pode levantar e redirecionar ataques individuais para você; sua defesa, esquiva e redução não são contabilizadas.', { passiva: 'Cabeçada: ao redirecionar um ataque individual para você, ignore sua defesa, esquiva e redução.' }),
        p('urso', 'cabeca', 'Morder: ataque extra de 6 de dano com armas simples.', { passiva: 'Morder: ataque extra de 6 de dano, somente com armas simples.' }),
        p('aranha', 'cabeca', 'Pinça: se adivinhar a próxima carta do chefe, você não leva dano.', { passiva: 'Pinça: declare a previsão; ao acertar a próxima carta do chefe, não recebe dano.' }),
        p('porco', 'torso', '100 de vida.', { vidaFixa: 100 }),
        p('verde', 'torso', '30 de vida por nível final de Combatente.', { vidaPorNivel: { combatente: 30 } }),
        p('cobra', 'torso', '120 de vida.', { vidaFixa: 120 }),
        p('hidra', 'torso', '25 de vida por nível final de Tripulante.', { vidaPorNivel: { tripulante: 25 } }),
        p('tartaruga', 'torso', '40 de vida por nível final de Embaixador.', { vidaPorNivel: { embaixador: 40 } }),
        p('urso', 'torso', '200 de vida.', { vidaFixa: 200 }),
        p('aranha', 'torso', '40 de vida por nível final de Tripulante.', { vidaPorNivel: { tripulante: 40 } }),
        p('porco', 'bracos', 'Padrão: mantém os níveis de Combatente.'),
        p('verde', 'bracos', 'Multiplica os níveis de Combatente por 2.', { multiplica: { combatente: 2 } }),
        p('cobra', 'bracos', 'Multiplica os níveis de Tripulante por 1.', { multiplica: { tripulante: 1 } }),
        p('hidra', 'bracos', 'Multiplica os níveis de Combatente por 2.', { multiplica: { combatente: 2 } }),
        p('tartaruga', 'bracos', 'Multiplica os níveis de Embaixador por 2.', { multiplica: { embaixador: 2 } }),
        p('urso', 'bracos', 'Multiplica os níveis de Combatente por 3 com armas simples.', { multiplica: { combatente: 3 }, apenasArmasSimples: true }),
        p('aranha', 'bracos', '+6 de dano extra.', { danoExtra: 6 }),
        p('porco', 'pernas', 'Padrão: mantém os níveis de Tripulante.'),
        p('verde', 'pernas', '−30 de vida; −4 níveis de Tripulante; +2 níveis de Combatente.', { vidaExtra: -30, soma: { tripulante: -4, combatente: 2 } }),
        p('cobra', 'pernas', 'Padrão; +1 nível de Tripulante.', { soma: { tripulante: 1 } }),
        p('hidra', 'pernas', '+50 de vida.', { vidaExtra: 50 }),
        p('tartaruga', 'pernas', 'Causa 30 de dano ao sofrer dano.', { passiva: 'Retaliação: causa 30 de dano ao sofrer dano.' }),
        p('urso', 'pernas', '+40 de vida; +1 nível de Combatente.', { vidaExtra: 40, soma: { combatente: 1 } }),
        p('aranha', 'pernas', '−40 de vida; +1 nível de Tripulante; +1 nível de Combatente.', { vidaExtra: -40, soma: { tripulante: 1, combatente: 1 } })
    ];
    const numero = valor => Number.isFinite(Number(valor)) ? Number(valor) : 0;
    const arredondar = valor => Math.round(valor * 100) / 100;

    // Fases fixas: somas de níveis → multiplicadores → vida/dano/agilidade/defesa.
    // Sempre parte dos níveis de missões: salvar/reabrir nunca duplica bônus.
    function calcular(ficha = {}, config = {}, catalogo = pecas) {
        const equipadas = slots.map(slot => catalogo.find(item => item.id === config[slot] && item.slot === slot)).filter(Boolean);
        const base = {}, soma = {}, multiplicador = {}, niveis = {};
        for (const classe of classes) {
            base[classe] = Math.max(0, numero(ficha[`nivel_${classe}`]));
            soma[classe] = 0;
            multiplicador[classe] = 1;
        }
        for (const item of equipadas) {
            if (item.apenasArmasSimples && !config.armas_simples) continue;
            for (const classe of classes) {
                soma[classe] += numero(item.soma?.[classe]);
                multiplicador[classe] *= item.multiplica?.[classe] ?? 1;
            }
        }
        for (const classe of classes) niveis[classe] = Math.max(0, (base[classe] + soma[classe]) * multiplicador[classe]);
        let vidaTorso = 0, vidaExtra = 0, percentualVida = 0, danoExtra = 0;
        const formulas = [];
        for (const item of equipadas) {
            vidaTorso += numero(item.vidaFixa);
            for (const classe of classes) {
                const fator = numero(item.vidaPorNivel?.[classe]);
                if (fator) {
                    vidaTorso += fator * niveis[classe];
                    formulas.push(`${fator} × ${niveis[classe]} ${classe} = ${fator * niveis[classe]} vida`);
                }
            }
            vidaExtra += numero(item.vidaExtra);
            percentualVida += numero(item.percentualVida);
            danoExtra += numero(item.danoExtra);
        }
        const vida = Math.max(0, arredondar((vidaTorso + vidaExtra) * (1 + percentualVida / 100)));
        return {
            base, soma, multiplicador, niveis, equipadas, formulas,
            vidaTorso, vidaExtra, percentualVida, vida,
            dano_extra: niveis.combatente + danoExtra,
            agilidade: 5 + niveis.tripulante,
            defesa: niveis.embaixador,
            completo: equipadas.some(item => item.slot === 'torso'),
            passivas: equipadas.filter(item => item.passiva).map(item => ({ nome: item.nome, texto: item.passiva }))
        };
    }
    return { slots, classes, kaijus, nomesSlots, pecas, calcular };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MechaNovoRegras;
