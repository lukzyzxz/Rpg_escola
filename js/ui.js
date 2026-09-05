// ======================================
// UI.JS
// Sistema de Interface da Nave 3B
// ======================================

let modalOverlay = null;
let toastContainer = null;
let modalFocoAnterior = null;

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

    if(modalOverlay.style.display !== 'flex')modalFocoAnterior = document.activeElement;
    modalOverlay.innerHTML = `

        <div class="modal-ui" role="dialog" aria-modal="true" tabindex="-1">

            ${html}

        </div>

    `;

    modalOverlay.style.display = "flex";
    const titulo=modalOverlay.querySelector('h2,h3');
    if(titulo){titulo.id= titulo.id || 'modal-ui-titulo';modalOverlay.firstElementChild.setAttribute('aria-labelledby',titulo.id);}
    document.body.classList.add('modal-aberto');
    modalOverlay.querySelector('button,input,select,textarea')?.focus();

}

function fecharModal() {

    if (!modalOverlay) return;

    modalOverlay.style.display = "none";
    modalOverlay.innerHTML = "";
    document.body.classList.remove('modal-aberto');
    modalFocoAnterior?.focus();
    document.dispatchEvent(new CustomEvent('modalFechado'));

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
    toast.setAttribute('role',tipo==='error'?'alert':'status');
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

document.addEventListener('keydown',event=>{
    if(!modalOverlay||modalOverlay.style.display!=='flex')return;
    if(event.key==='Escape'){event.preventDefault();fecharModal();return;}
    if(event.key!=='Tab')return;
    const elements=[...modalOverlay.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(e=>!e.disabled&&e.getClientRects().length);
    const first=elements[0],last=elements.at(-1);
    if(!first){event.preventDefault();modalOverlay.firstElementChild?.focus();}
    else if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

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
