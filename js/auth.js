// ======================================
// AUTH.JS
// Autenticação da Nave 3B
// ======================================

window.usuarioAtual = null;
window.profileAtual = null;


// ======================================
// INICIALIZAÇÃO
// ======================================

window.addEventListener(
    "load",
    () => {

        setTimeout(
            inicializarAutenticacao,
            1300
        );

    }
);


async function inicializarAutenticacao() {

    // Esconde o sistema até sabermos
    // se existe uma sessão válida.
    ocultarSistema();

    

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        const sessao = data.session;

        if (sessao?.user) {

            await autenticarUsuarioNoSistema(
                sessao.user
            );

        } else {

            mostrarTelaLogin();

        }

    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        mostrarTelaLogin(
            "Não foi possível verificar a sessão."
        );

    }


    // Detecta login/logout e mudanças de sessão.
    supabaseClient.auth.onAuthStateChange(
        async (evento, sessao) => {

            if (
                evento === "SIGNED_OUT"
                || !sessao?.user
            ) {

                window.usuarioAtual = null;
                window.profileAtual = null;

                ocultarSistema();
                mostrarTelaLogin();

                return;

            }

            if (
                evento === "SIGNED_IN"
                || evento === "TOKEN_REFRESHED"
            ) {

                await autenticarUsuarioNoSistema(
                    sessao.user
                );

            }

        }
    );

}


// ======================================
// LOGIN
// ======================================

function mostrarTelaLogin(
    mensagem = ""
) {

    removerTelaAuth();

    const tela = document.createElement("div");

    tela.id = "auth-screen";

    tela.innerHTML = `

        <div class="auth-decoracao auth-decoracao-1"></div>
        <div class="auth-decoracao auth-decoracao-2"></div>

        <div class="auth-container">

            <div class="auth-identidade">

                <span class="auth-selo">
                    SISTEMA OPERACIONAL ORBITAL
                </span>

                <h1>
                    NAVE 3B
                </h1>

                <p>
                    Central de Comando
                </p>

            </div>


            <div class="auth-divisor"></div>


            <form
                id="form-login"
                class="auth-form">

                <div class="auth-titulo">

                    <span>
                        AUTENTICAÇÃO
                    </span>

                    <h2>
                        Acesso ao Sistema
                    </h2>

                    <p>
                        Insira suas credenciais
                        de tripulante.
                    </p>

                </div>


                <div class="auth-campo">

                    <label for="login-email">
                        E-mail
                    </label>

                    <div class="auth-input-wrapper">

                        <span>
                            ✉
                        </span>

                        <input
                            id="login-email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            placeholder="tripulante@email.com"
                            required>

                    </div>

                </div>


                <div class="auth-campo">

                    <label for="login-senha">
                        Senha
                    </label>

                    <div class="auth-input-wrapper">

                        <span>
                            ◈
                        </span>

                        <input
                            id="login-senha"
                            name="senha"
                            type="password"
                            autocomplete="current-password"
                            placeholder="••••••••"
                            required>

                        <button
                            id="btn-mostrar-senha"
                            type="button"
                            class="auth-ver-senha"
                            aria-label="Mostrar senha">

                            ◉

                        </button>

                    </div>

                </div>


                <div
                    id="auth-mensagem"
                    class="auth-mensagem
                    ${mensagem ? "visivel erro" : ""}">

                    ${escaparTextoAuth(mensagem)}

                </div>


                <button
                    id="btn-login"
                    type="submit"
                    class="auth-btn">

                    <span>
                        ENTRAR NO SISTEMA
                    </span>

                </button>


                <div class="auth-status">

                    <span class="auth-status-ponto"></span>

                    Servidor orbital disponível

                </div>

            </form>

        </div>


        <div class="auth-rodape">

            SISTEMA SOLAR TIÃO
            <span>•</span>
            NAVE 3B

        </div>

    `;

    document.body.appendChild(tela);

    configurarFormularioLogin();

}


// ======================================
// FORMULÁRIO
// ======================================

function configurarFormularioLogin() {

    const formulario =
        document.getElementById("form-login");

    const botaoSenha =
        document.getElementById(
            "btn-mostrar-senha"
        );

    const campoSenha =
        document.getElementById(
            "login-senha"
        );


    botaoSenha.addEventListener(
        "click",
        () => {

            const mostrando =
                campoSenha.type === "text";

            campoSenha.type =
                mostrando
                    ? "password"
                    : "text";

            botaoSenha.textContent =
                mostrando
                    ? "◉"
                    : "◎";

        }
    );


    formulario.addEventListener(
        "submit",
        realizarLogin
    );

}


// ======================================
// REALIZAR LOGIN
// ======================================

async function realizarLogin(evento) {

    evento.preventDefault();

    const formulario =
        evento.currentTarget;

    const email =
        formulario.email.value
            .trim()
            .toLowerCase();

    const senha =
        formulario.senha.value;


    if (!email || !senha) {

        mostrarErroAuth(
            "Informe o e-mail e a senha."
        );

        return;

    }


    alterarEstadoBotaoLogin(true);

    limparErroAuth();


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({
                    email,
                    password: senha
                });


        if (error) {
            throw error;
        }


        if (!data.user) {

            throw new Error(
                "Usuário não encontrado."
            );

        }


        await autenticarUsuarioNoSistema(
            data.user
        );


    } catch (erro) {

        console.error(
            "Falha no login:",
            erro
        );

        mostrarErroAuth(
            traduzirErroLogin(erro)
        );

    } finally {

        alterarEstadoBotaoLogin(false);

    }

}


// ======================================
// AUTENTICAR NO SISTEMA
// ======================================

async function autenticarUsuarioNoSistema(
    usuario
) {

    try {

        window.usuarioAtual = usuario;

        const profile =
            await carregarProfileUsuario(
                usuario.id
            );

        window.profileAtual = profile;

        removerTelaAuth();

        mostrarSistema();

        atualizarUsuarioInterface();


        console.log(
            "✅ Usuário autenticado:",
            profile?.nome || usuario.email
        );


        document.dispatchEvent(
            new CustomEvent(
                "usuarioAutenticado",
                {
                    detail: {
                        usuario,
                        profile
                    }
                }
            )
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        await supabaseClient.auth.signOut();

        mostrarTelaLogin(
            "Não foi possível carregar o perfil do usuário."
        );

    }

}


// ======================================
// PROFILE
// ======================================

async function carregarProfileUsuario(
    usuarioId
) {

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select(
            "id, nome, cargo, avatar, created_at"
        )
        .eq("id", usuarioId)
        .single();


    if (error) {
        throw error;
    }

    return data;

}


// ======================================
// LOGOUT
// ======================================

async function logout() {

    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();

        if (error) {
            throw error;
        }


        window.usuarioAtual = null;
        window.profileAtual = null;

        ocultarSistema();

        mostrarTelaLogin();


    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

        if (
            typeof mostrarNotificacao
            === "function"
        ) {

            mostrarNotificacao(
                "Não foi possível encerrar a sessão.",
                "error"
            );

        }

    }

}


// ======================================
// USUÁRIO NA INTERFACE
// ======================================

function atualizarUsuarioInterface() {

    const profile =
        window.profileAtual;

    if (!profile) return;


    const nome =
        document.getElementById(
            "usuario-logado-nome"
        );

    const cargo =
        document.getElementById(
            "usuario-logado-cargo"
        );


    if (nome) {
        nome.textContent = profile.nome;
    }

    if (cargo) {
        cargo.textContent = profile.cargo;
    }

}


// ======================================
// CONTROLE DO SISTEMA
// ======================================

function ocultarSistema() {

    const app =
        document.getElementById("app");

    if (app) {

        app.style.visibility = "hidden";
        app.style.pointerEvents = "none";

    }

}


function mostrarSistema() {

    const app =
        document.getElementById("app");

    if (app) {

        app.style.visibility = "visible";
        app.style.pointerEvents = "auto";

    }

}


// ======================================
// TELA DE VERIFICAÇÃO
// ======================================

function mostrarTelaVerificacao() {

    removerTelaAuth();

    const tela =
        document.createElement("div");

    tela.id = "auth-screen";

    tela.innerHTML = `

        <div class="auth-carregando">

            <div class="auth-loader"></div>

            <h2>
                NAVE 3B
            </h2>

            <p>
                Verificando credenciais...
            </p>

        </div>

    `;

    document.body.appendChild(tela);

}


// ======================================
// AUXILIARES
// ======================================

function removerTelaAuth() {

    const tela =
        document.getElementById(
            "auth-screen"
        );

    if (tela) {
        tela.remove();
    }

}


function mostrarErroAuth(mensagem) {

    const elemento =
        document.getElementById(
            "auth-mensagem"
        );

    if (!elemento) return;

    elemento.textContent = mensagem;

    elemento.classList.add(
        "visivel",
        "erro"
    );

}


function limparErroAuth() {

    const elemento =
        document.getElementById(
            "auth-mensagem"
        );

    if (!elemento) return;

    elemento.textContent = "";

    elemento.classList.remove(
        "visivel",
        "erro"
    );

}


function alterarEstadoBotaoLogin(
    carregando
) {

    const botao =
        document.getElementById(
            "btn-login"
        );

    if (!botao) return;


    botao.disabled = carregando;


    botao.innerHTML =
        carregando
            ? `
                <span class="auth-btn-loading">
                    AUTENTICANDO...
                </span>
            `
            : `
                <span>
                    ENTRAR NO SISTEMA
                </span>
            `;

}


function traduzirErroLogin(erro) {

    const mensagem =
        String(
            erro?.message || ""
        ).toLowerCase();


    if (
        mensagem.includes(
            "invalid login credentials"
        )
    ) {

        return "E-mail ou senha incorretos.";

    }


    if (
        mensagem.includes(
            "email not confirmed"
        )
    ) {

        return "Este e-mail ainda não foi confirmado.";

    }


    if (
        mensagem.includes(
            "too many requests"
        )
    ) {

        return "Muitas tentativas. Aguarde alguns instantes.";

    }


    if (
        !navigator.onLine
    ) {

        return "Sem conexão com a internet.";

    }


    return "Não foi possível realizar o login.";

}


function escaparTextoAuth(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}