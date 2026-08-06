// ======================================
// UI.JS
// Sistema de Interface da Nave 3B
// ======================================

let modalOverlay = null;
let toastContainer = null;

// ======================================
// INICIALIZAÇÃO
// ======================================

function inicializarUI() {

    criarOverlay();
    criarContainerToast();

}

// ======================================
// MODAL
// ======================================

function criarOverlay() {

    const overlayExistente =
        document.getElementById("modal-overlay");

    if (overlayExistente) {

        modalOverlay = overlayExistente;
        return;

    }

    modalOverlay = document.createElement("div");

    modalOverlay.id = "modal-overlay";
    modalOverlay.style.display = "none";

    document.body.appendChild(modalOverlay);

}

function abrirModal(html) {

    if (!modalOverlay) {

        criarOverlay();

    }

    modalOverlay.innerHTML = `

        <div class="modal-ui">

            ${html}

        </div>

    `;

    modalOverlay.style.display = "flex";

}

function fecharModal() {

    if (!modalOverlay) return;

    modalOverlay.style.display = "none";
    modalOverlay.innerHTML = "";

}

// ======================================
// NOTIFICAÇÕES
// ======================================

function criarContainerToast() {

    const containerExistente =
        document.getElementById("toast-container");

    if (containerExistente) {

        toastContainer = containerExistente;
        return;

    }

    toastContainer = document.createElement("div");

    toastContainer.id = "toast-container";

    document.body.appendChild(toastContainer);

}

function mostrarNotificacao(texto, tipo = "success") {

    if (!toastContainer) {

        criarContainerToast();

    }

    const toast = document.createElement("div");

    toast.className = `toast ${tipo}`;
    toast.textContent = texto;

    toastContainer.appendChild(toast);

    setTimeout(() => {

        toast.classList.add("mostrar");

    }, 10);

    setTimeout(() => {

        toast.classList.remove("mostrar");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}

// ======================================
// CONFIRMAÇÃO
// ======================================

function confirmar(mensagem, callback) {

    abrirModal(`

        <h2>Confirmação</h2>

        <p class="modal-mensagem">

            ${mensagem}

        </p>

        <div class="modal-botoes">

            <button
                type="button"
                class="btn-secundario"
                onclick="fecharModal()">

                Cancelar

            </button>

            <button
                type="button"
                class="btn-principal"
                id="btn-confirmar-acao">

                Confirmar

            </button>

        </div>

    `);

    const botaoConfirmar =
        document.getElementById("btn-confirmar-acao");

    botaoConfirmar.addEventListener("click", () => {

        fecharModal();

        if (typeof callback === "function") {

            callback();

        }

    });

}