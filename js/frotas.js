// ======================================
// FROTAS
// ======================================

let frotas = [

    {
        id: 1,
        nome: "POVO LIVRE",
        cor: "#888888",
        integrantes: []
    }

];

// ======================================

function telaFrotas(){

    let html = `

    <div class="topo-frotas">

        <h2>Frotas</h2>

        <button id="novaFrota">

            + Nova Frota

        </button>

    </div>

    <div id="listaFrotas">

    `;

    frotas.forEach(frota=>{

        html += `

        <div class="card-frota">

            <div class="cor-frota"
                style="background:${frota.cor}">
            </div>

            <div class="dados-frota">

                <h3>${frota.nome}</h3>

                <p>

                    Integrantes:
                    ${frota.integrantes.length}

                </p>

            </div>

            <button
                onclick="abrirFrota(${frota.id})">

                Gerenciar

            </button>

        </div>

        `;

    });

    html += `</div>`;

    return html;

}

// ======================================

function abrirFrota(id){

    alert("Em breve vamos abrir a tela da frota "+id);

}