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

        // Aguarda o loading principal da Nave 3B
        setTimeout(
            inicializarAutenticacao,
            1300
        );

    }
);


async function inicializarAutenticacao() {

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


    // Detecta alterações de autenticação
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
                || evento === "USER_UPDATED"
            ) {

                await autenticarUsuarioNoSistema(
                    sessao.user
                );

            }

        }
    );

}


// ======================================
// TELA DE LOGIN
// ======================================

function mostrarTelaLogin(
    mensagem = ""
) {

    removerTelaAuth();

    const tela =
        document.createElement("div");

    tela.id = "auth-screen";

    tela.innerHTML = `

        <div class="auth-decoracao auth-decoracao-1"></div>
        <div class="auth-decoracao auth-decoracao-2"></div>


        <div class="auth-container">

            <!-- IDENTIDADE -->

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


            <!-- ÁREA DE AUTENTICAÇÃO -->

            <div class="auth-area">

                <div class="auth-abas">

                    <button
                        type="button"
                        id="aba-login"
                        class="auth-aba ativa"
                        onclick="mostrarFormularioLogin()">

                        ENTRAR

                    </button>

                    <button
                        type="button"
                        id="aba-cadastro"
                        class="auth-aba"
                        onclick="mostrarFormularioCadastro()">

                        CRIAR CONTA

                    </button>

                </div>


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


                    <!-- USUÁRIO -->

                    <div class="auth-campo">

                        <label for="login-usuario">

                            Nome de usuário

                        </label>

                        <div class="auth-input-wrapper">

                            <span>
                                👨‍🚀
                            </span>

                            <input
                                id="login-usuario"
                                name="usuario"
                                type="text"
                                autocomplete="username"
                                maxlength="30"
                                placeholder="ex.: lucas"
                                required>

                        </div>

                    </div>


                    <!-- SENHA -->

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


                    <!-- MENSAGEM -->

                    <div
                        id="auth-mensagem"
                        class="auth-mensagem
                        ${mensagem ? "visivel erro" : ""}">

                        ${escaparTextoAuth(mensagem)}

                    </div>


                    <!-- BOTÃO -->

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
// CONFIGURAR LOGIN
// ======================================

function configurarFormularioLogin() {

    const formulario =
        document.getElementById(
            "form-login"
        );

    const botaoSenha =
        document.getElementById(
            "btn-mostrar-senha"
        );

    const campoSenha =
        document.getElementById(
            "login-senha"
        );


    if (
        botaoSenha
        && campoSenha
    ) {

        botaoSenha.addEventListener(
            "click",
            () => {

                const senhaVisivel =
                    campoSenha.type === "text";


                campoSenha.type =
                    senhaVisivel
                        ? "password"
                        : "text";


                botaoSenha.textContent =
                    senhaVisivel
                        ? "◉"
                        : "◎";

            }
        );

    }


    if (formulario) {

        formulario.addEventListener(
            "submit",
            realizarLogin
        );

    }

}


// ======================================
// REALIZAR LOGIN
// ======================================

async function realizarLogin(evento) {

    evento.preventDefault();


    const formulario =
        evento.currentTarget;


    const username =
        normalizarUsername(
            formulario.usuario.value
        );


    const senha =
        formulario.senha.value;


    if (!username || !senha) {

        mostrarErroAuth(
            "Informe o usuário e a senha."
        );

        return;

    }


    alterarEstadoBotaoLogin(true);

    limparErroAuth();


    const emailInterno =
        criarEmailInterno(username);


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth
                .signInWithPassword({

                    email: emailInterno,

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
// CADASTRO
// ======================================

function mostrarFormularioCadastro() {

    const area =
        document.querySelector(
            ".auth-area"
        );


    if (!area) {
        return;
    }


    area.innerHTML = `

        <div class="auth-abas">

            <button
                type="button"
                id="aba-login"
                class="auth-aba"
                onclick="mostrarFormularioLogin()">

                ENTRAR

            </button>

            <button
                type="button"
                id="aba-cadastro"
                class="auth-aba ativa">

                CRIAR CONTA

            </button>

        </div>


        <form
            id="form-cadastro"
            class="auth-form">

            <div class="auth-titulo">

                <span>
                    NOVO TRIPULANTE
                </span>

                <h2>
                    Criar Conta
                </h2>

                <p>
                    Registre suas credenciais
                    para acessar a Nave 3B.
                </p>

            </div>


            <!-- NOME -->

            <div class="auth-campo">

                <label for="cadastro-nome">

                    Nome

                </label>

                <div class="auth-input-wrapper">

                    <span>
                        👤
                    </span>

                    <input
                        id="cadastro-nome"
                        name="nome"
                        type="text"
                        autocomplete="name"
                        maxlength="60"
                        placeholder="Ex.: Lucas Felipe"
                        required>

                </div>

            </div>


            <!-- USERNAME -->

            <div class="auth-campo">

                <label for="cadastro-usuario">

                    Nome de usuário

                </label>

                <div class="auth-input-wrapper">

                    <span>
                        🚀
                    </span>

                    <input
                        id="cadastro-usuario"
                        name="usuario"
                        type="text"
                        autocomplete="username"
                        maxlength="30"
                        placeholder="Ex.: lucas"
                        required>

                </div>

            </div>


            <!-- SENHA -->

            <div class="auth-campo">

                <label for="cadastro-senha">

                    Senha

                </label>

                <div class="auth-input-wrapper">

                    <span>
                        ◈
                    </span>

                    <input
                        id="cadastro-senha"
                        name="senha"
                        type="password"
                        autocomplete="new-password"
                        minlength="6"
                        maxlength="72"
                        placeholder="Mínimo 6 caracteres"
                        required>

                    <button
                        id="btn-mostrar-senha-cadastro"
                        type="button"
                        class="auth-ver-senha"
                        aria-label="Mostrar senha">

                        ◉

                    </button>

                </div>

            </div>


            <!-- CONFIRMAR SENHA -->

            <div class="auth-campo">

                <label for="cadastro-confirmar-senha">

                    Confirmar senha

                </label>

                <div class="auth-input-wrapper">

                    <span>
                        ◈
                    </span>

                    <input
                        id="cadastro-confirmar-senha"
                        name="confirmarSenha"
                        type="password"
                        autocomplete="new-password"
                        minlength="6"
                        maxlength="72"
                        placeholder="Digite a senha novamente"
                        required>

                </div>

            </div>


            <div
                id="auth-mensagem"
                class="auth-mensagem">
            </div>


            <button
                id="btn-cadastro"
                type="submit"
                class="auth-btn">

                CRIAR CONTA

            </button>


            <div class="auth-status">

                <span class="auth-status-ponto"></span>

                Novo tripulante será vinculado
                à frota POVO LIVRE

            </div>

        </form>

    `;


    configurarFormularioCadastro();

}


// ======================================
// CONFIGURAR CADASTRO
// ======================================

function configurarFormularioCadastro() {

    const formulario =
        document.getElementById(
            "form-cadastro"
        );


    const campoSenha =
        document.getElementById(
            "cadastro-senha"
        );


    const campoConfirmacao =
        document.getElementById(
            "cadastro-confirmar-senha"
        );


    const botaoSenha =
        document.getElementById(
            "btn-mostrar-senha-cadastro"
        );


    if (
        botaoSenha
        && campoSenha
        && campoConfirmacao
    ) {

        botaoSenha.addEventListener(
            "click",
            () => {

                const senhaVisivel =
                    campoSenha.type === "text";


                const novoTipo =
                    senhaVisivel
                        ? "password"
                        : "text";


                campoSenha.type =
                    novoTipo;


                campoConfirmacao.type =
                    novoTipo;


                botaoSenha.textContent =
                    senhaVisivel
                        ? "◉"
                        : "◎";

            }
        );

    }


    if (formulario) {

        formulario.addEventListener(
            "submit",
            realizarCadastro
        );

    }


    const usuario =
        document.getElementById(
            "cadastro-usuario"
        );


    if (usuario) {

        usuario.addEventListener(
            "input",
            () => {

                const normalizado =
                    normalizarUsername(
                        usuario.value
                    );


                if (
                    usuario.value
                    !== normalizado
                ) {

                    usuario.value =
                        normalizado;

                }

            }
        );

    }

}


// ======================================
// REALIZAR CADASTRO
// ======================================

async function realizarCadastro(evento) {

    if (evento) {
        evento.preventDefault();
    }


    const nome =
        document
            .getElementById(
                "cadastro-nome"
            )
            ?.value
            .trim();


    const username =
        normalizarUsername(
            document
                .getElementById(
                    "cadastro-usuario"
                )
                ?.value
        );


    const senha =
        document
            .getElementById(
                "cadastro-senha"
            )
            ?.value;


    const confirmarSenha =
        document
            .getElementById(
                "cadastro-confirmar-senha"
            )
            ?.value;


    if (
        !nome
        || !username
        || !senha
        || !confirmarSenha
    ) {

        mostrarErroAuth(
            "Preencha todos os campos."
        );

        return;

    }


    if (nome.length < 2) {

        mostrarErroAuth(
            "Informe um nome válido."
        );

        return;

    }


    if (username.length < 3) {

        mostrarErroAuth(
            "O nome de usuário precisa ter pelo menos 3 caracteres."
        );

        return;

    }


    if (
        !/^[a-z0-9._-]+$/.test(
            username
        )
    ) {

        mostrarErroAuth(
            "O usuário pode conter apenas letras, números, ponto, hífen e underline."
        );

        return;

    }


    if (senha.length < 6) {

        mostrarErroAuth(
            "A senha precisa ter pelo menos 6 caracteres."
        );

        return;

    }


    if (senha !== confirmarSenha) {

        mostrarErroAuth(
            "As senhas não são iguais."
        );

        return;

    }


    limparErroAuth();

    alterarEstadoBotaoCadastro(true);


    const emailInterno =
        criarEmailInterno(
            username
        );


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email:
                    emailInterno,

                password:
                    senha,

                options: {

                    data: {

                        nome:
                            nome,

                        username:
                            username

                    }

                }

            });


        if (error) {
            throw error;
        }


        if (!data.user) {

            throw new Error(
                "Não foi possível criar a conta."
            );

        }


        if (
            typeof mostrarNotificacao
            === "function"
        ) {

            mostrarNotificacao(
                "Conta criada com sucesso!",
                "success"
            );

        }


        // Se confirmação de e-mail estiver
        // desativada, haverá sessão imediatamente.
        if (data.session) {

            await autenticarUsuarioNoSistema(
                data.user
            );

        } else {

            mostrarTelaLogin(
                "Conta criada. Faça login para continuar."
            );

        }


    } catch (erro) {

        console.error(
            "Erro ao criar conta:",
            erro
        );


        mostrarErroAuth(
            traduzirErroCadastro(
                erro
            )
        );


    } finally {

        alterarEstadoBotaoCadastro(false);

    }

}


// ======================================
// VOLTAR AO LOGIN
// ======================================

function mostrarFormularioLogin() {

    mostrarTelaLogin();

}


// ======================================
// AUTENTICAR NO SISTEMA
// ======================================

async function autenticarUsuarioNoSistema(
    usuario
) {

    try {

        window.usuarioAtual =
            usuario;


        const profile =
            await carregarProfileUsuario(
                usuario.id
            );


        window.profileAtual =
            profile;


        removerTelaAuth();

        mostrarSistema();

        atualizarUsuarioInterface();


        console.log(
            "✅ Usuário autenticado:",
            profile?.username
            || profile?.nome
            || usuario.email
        );


        document.dispatchEvent(

            new CustomEvent(
                "usuarioAutenticado",
                {

                    detail: {

                        usuario:
                            usuario,

                        profile:
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


        window.usuarioAtual =
            null;

        window.profileAtual =
            null;


        try {

            await supabaseClient.auth
                .signOut();

        } catch (erroLogout) {

            console.error(
                "Erro ao limpar sessão:",
                erroLogout
            );

        }


        ocultarSistema();


        mostrarTelaLogin(
            "Não foi possível carregar o perfil do usuário."
        );

    }

}


// ======================================
// CARREGAR PROFILE
// ======================================

async function carregarProfileUsuario(
    usuarioId
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, nome, username, cargo, avatar, created_at"
            )
            .eq(
                "id",
                usuarioId
            )
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
            await supabaseClient.auth
                .signOut();


        if (error) {
            throw error;
        }


        window.usuarioAtual =
            null;

        window.profileAtual =
            null;


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


    if (!profile) {
        return;
    }


    const nome =
        document.getElementById(
            "usuario-logado-nome"
        );


    const username =
        document.getElementById(
            "usuario-logado-username"
        );


    const cargo =
        document.getElementById(
            "usuario-logado-cargo"
        );


    if (nome) {

        nome.textContent =
            profile.nome;

    }


    if (username) {

        username.textContent =
            `@${profile.username}`;

    }


    if (cargo) {

        cargo.textContent =
            profile.cargo;

    }

}


// ======================================
// CONTROLE DO SISTEMA
// ======================================

function ocultarSistema() {

    const app =
        document.getElementById(
            "app"
        );


    if (app) {

        app.style.visibility =
            "hidden";

        app.style.pointerEvents =
            "none";

    }

}


function mostrarSistema() {

    const app =
        document.getElementById(
            "app"
        );


    if (app) {

        app.style.visibility =
            "visible";

        app.style.pointerEvents =
            "auto";

    }

}


// ======================================
// TELA DE VERIFICAÇÃO
// Mantida para uso futuro
// ======================================

function mostrarTelaVerificacao() {

    removerTelaAuth();


    const tela =
        document.createElement(
            "div"
        );


    tela.id =
        "auth-screen";


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


    document.body.appendChild(
        tela
    );

}


// ======================================
// REMOVER TELA
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


// ======================================
// ERROS
// ======================================

function mostrarErroAuth(
    mensagem
) {

    const elemento =
        document.getElementById(
            "auth-mensagem"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensagem;


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


    if (!elemento) {
        return;
    }


    elemento.textContent =
        "";


    elemento.classList.remove(
        "visivel",
        "erro"
    );

}


// ======================================
// BOTÃO LOGIN
// ======================================

function alterarEstadoBotaoLogin(
    carregando
) {

    const botao =
        document.getElementById(
            "btn-login"
        );


    if (!botao) {
        return;
    }


    botao.disabled =
        carregando;


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


// ======================================
// BOTÃO CADASTRO
// ======================================

function alterarEstadoBotaoCadastro(
    carregando
) {

    const botao =
        document.getElementById(
            "btn-cadastro"
        );


    if (!botao) {
        return;
    }


    botao.disabled =
        carregando;


    botao.innerHTML =
        carregando
            ? `
                <span class="auth-btn-loading">
                    REGISTRANDO...
                </span>
            `
            : `
                CRIAR CONTA
            `;

}


// ======================================
// ERROS DE LOGIN
// ======================================

function traduzirErroLogin(
    erro
) {

    const mensagem =
        String(
            erro?.message || ""
        ).toLowerCase();


    if (
        mensagem.includes(
            "invalid login credentials"
        )
    ) {

        return "Usuário ou senha incorretos.";

    }


    if (
        mensagem.includes(
            "email not confirmed"
        )
    ) {

        return "Esta conta ainda não foi liberada.";

    }


    if (
        mensagem.includes(
            "too many requests"
        )
        ||
        mensagem.includes(
            "rate limit"
        )
    ) {

        return "Muitas tentativas. Aguarde alguns instantes.";

    }


    if (!navigator.onLine) {

        return "Sem conexão com a internet.";

    }


    return "Não foi possível realizar o login.";

}


// ======================================
// ERROS DE CADASTRO
// ======================================

function traduzirErroCadastro(
    erro
) {

    const mensagem =
        String(
            erro?.message || ""
        ).toLowerCase();


    if (
        mensagem.includes(
            "already registered"
        )
        ||
        mensagem.includes(
            "already been registered"
        )
        ||
        mensagem.includes(
            "user already"
        )
    ) {

        return "Esse nome de usuário já está em uso.";

    }


    if (
        mensagem.includes(
            "password"
        )
    ) {

        return "A senha informada não atende aos requisitos.";

    }


    if (
        mensagem.includes(
            "rate limit"
        )
        ||
        mensagem.includes(
            "too many requests"
        )
    ) {

        return "Muitas contas foram criadas recentemente. Aguarde um pouco.";

    }


    if (!navigator.onLine) {

        return "Sem conexão com a internet.";

    }


    return "Não foi possível criar a conta.";

}


// ======================================
// USERNAME
// ======================================

function normalizarUsername(
    valor
) {

    return String(
        valor || ""
    )
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9._-]/g,
            ""
        );

}


// ======================================
// E-MAIL INTERNO DO SUPABASE
// ======================================

function criarEmailInterno(
    username
) {

    return `${username}@nave3b.app`;

}


// ======================================
// SEGURANÇA DE TEXTO
// ======================================

function escaparTextoAuth(
    valor
) {

    return String(
        valor ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}