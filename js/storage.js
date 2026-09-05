// ======================================
// STORAGE.JS
// Banco de Dados Local da Nave 3B
// ======================================

const CHAVE_BANCO = "nave3b_db";

// ======================================
// ESTRUTURA PADRÃO
// ======================================

const bancoPadrao = {

    frotas: [
        {
            id: 1,
            nome: "POVO LIVRE",
            cor: "#888888",
            integrantes: []
        }
    ],

    missoes: [],

    inventario: [],

    planetas: [
        {
            id: 1,
            nome: "Verdejante",
            desbloqueado: true,
            descricao: "Primeiro planeta disponível para exploração."
        },
        {
            id: 2,
            nome: "Incógnita",
            desbloqueado: false,
            descricao: "Dados ainda não revelados."
        },
        {
            id: 3,
            nome: "Incógnita",
            desbloqueado: false,
            descricao: "Dados ainda não revelados."
        },
        {
            id: 4,
            nome: "Incógnita",
            desbloqueado: false,
            descricao: "Dados ainda não revelados."
        }
    ]

};

// ======================================
// CÓPIA SEGURA
// ======================================

function copiarDados(dados) {

    return JSON.parse(
        JSON.stringify(dados)
    );

}

// ======================================
// VALIDAÇÃO E CORREÇÃO
// ======================================

function normalizarBanco(dados) {

    const padrao = copiarDados(bancoPadrao);

    const bancoNormalizado = {

        frotas: Array.isArray(dados?.frotas)
            ? dados.frotas
            : padrao.frotas,

        missoes: Array.isArray(dados?.missoes)
            ? dados.missoes
            : [],

        inventario: Array.isArray(dados?.inventario)
            ? dados.inventario
            : [],

        planetas: Array.isArray(dados?.planetas)
            ? dados.planetas
            : padrao.planetas

    };

    bancoNormalizado.frotas =
        bancoNormalizado.frotas.map(frota => ({

            id: frota.id,

            nome: String(
                frota.nome || "FROTA SEM NOME"
            ),

            cor: String(
                frota.cor || "#888888"
            ),

            integrantes: Array.isArray(frota.integrantes)
                ? frota.integrantes
                : []

        }));

    bancoNormalizado.missoes =
        bancoNormalizado.missoes.map(missao => ({

            ...missao,

            id: Number(missao.id)

        }));

    bancoNormalizado.inventario =
        bancoNormalizado.inventario.map(item => ({

            ...item,

            id: Number(item.id)

        }));

    bancoNormalizado.planetas =
        bancoNormalizado.planetas.map(planeta => ({

            ...planeta,

            id: Number(planeta.id),

            desbloqueado:
                Boolean(planeta.desbloqueado)

        }));

    return bancoNormalizado;

}

// ======================================
// CARREGAMENTO
// ======================================

function carregarBanco() {
    // O cache antigo permanece intacto para a importação explícita pelo módulo V7.
    return normalizarBanco({frotas:[],missoes:[],inventario:[],planetas:[]});
}

// ======================================
// BANCO EM MEMÓRIA
// ======================================

let banco = carregarBanco();

// ======================================
// SALVAMENTO
// ======================================

function salvarBanco() {
    // Compatibilidade com módulos anteriores: atualiza apenas a projeção em memória.
    // Escritas persistentes usam os serviços/RPCs de cada módulo.
    banco = normalizarBanco(banco);
    emitirAtualizacaoBanco();
}

// ======================================
// EVENTO GLOBAL
// ======================================

function emitirAtualizacaoBanco() {

    document.dispatchEvent(

        new CustomEvent(
            "bancoAtualizado",
            {
                detail: copiarDados(banco)
            }
        )

    );

}

// ======================================
// RESTAURAÇÃO
// ======================================

function restaurarBanco() {

    banco = copiarDados(bancoPadrao);

    salvarBanco();

}

// ======================================
// GERAÇÃO DE ID
// ======================================

function gerarId(lista) {

    if (!Array.isArray(lista) || lista.length === 0) {

        return 1;

    }

    const idsValidos = lista
        .map(item => Number(item.id))
        .filter(id => Number.isFinite(id));

    if (idsValidos.length === 0) {

        return 1;

    }

    return Math.max(...idsValidos) + 1;

}

// ======================================
// CONSULTAS AUXILIARES
// ======================================

function obterTotalIntegrantes() {

    return banco.frotas.reduce(
        (total, frota) => {

            const quantidade =
                Array.isArray(frota.integrantes)
                    ? frota.integrantes.length
                    : 0;

            return total + quantidade;

        },
        0
    );

}

function obterPlanetasDesbloqueados() {

    return banco.planetas.filter(
        planeta => planeta.desbloqueado
    );

}