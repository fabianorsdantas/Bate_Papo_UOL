let usuario = { name: '' };
let destinatario = "Todos";
let mensagemArray = [];
let usuariosOnline = [];
let statusDaMensagem = "message";
let tipoDeVisibilidade;
let destacarMensagem;
let ultimaMensagem = { time: 0 };
let formaDeExibicao = "publicamente";
let intervaloEntreMensagens;

enviarMensagem();

function autenticarUsuario() {
    usuario = {
        name: document.querySelector("aside input").value
    };

    let promessaEnviada = axios.post('https://mock-api.driven.com.br/api/v6/uol/participants/83c66857-f7a1-43e7-a19e-e85055df6f58', usuario);
    promessaEnviada.catch(verificarErro);
    promessaEnviada.then(entrarNoChat);
}

function verificarErro(erro) {
    if (erro.response.status === 400) {
        alert("Esse nome já esta sendo utilizado, escolha outro por favor.")
    }
}

function entrarNoChat() {
    document.querySelector("aside").classList.add("none");
    document.querySelector("body").classList.remove("overflow");

    setInterval(usuarioConectado, 5000);
    setInterval(usuariosConectados, 10000);
    intervaloEntreMensagens = setInterval(baixarMensagens, 3000);

    usuariosConectados();
    baixarMensagemReservada();
}

function usuarioConectado() {
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status/83c66857-f7a1-43e7-a19e-e85055df6f58', usuario)
}

function atualizarMensagem(){
    clearInterval(intervaloEntreMensagens);
    baixarMensagens();
    intervaloEntreMensagens = setInterval(baixarMensagens, 3000);
}

function baixarMensagens() {
    let promessaMensagens = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages/83c66857-f7a1-43e7-a19e-e85055df6f58');
    promessaMensagens.then(exibirMensagens);
}

function exibirMensagens(mensagem) {
    mensagemArray = mensagem.data;
    document.querySelector('main').innerHTML = '';

    mensagemArray.forEach((element) => {
        if (usuario.name === element.to || usuario.name === element.from || element.to === 'Todos') {
            document.querySelector('main').innerHTML += (`<article class="${element.type}">
            <p data-identifier="message"><em>${element.time}</em>  <strong>${element.from}</strong> para <strong>${element.to}</strong>:  ${element.text}</p>
            </article>`);

             scrollarChat();
        }


    });
    ultimaMensagem = mensagemArray[mensagemArray.length - 1];
}

function  scrollarChat() {
    if (mensagemArray[mensagemArray.length - 1].time !== ultimaMensagem.time) {

        destacarMensagem = document.querySelector('main').lastChild;
        destacarMensagem.scrollIntoView({ behavior: 'smooth'});

    }
}

function carregarNoServidor() {
    let mensagemAEnviar = {
        from: usuario.name,
        to: destinatario,
        text: document.querySelector(".enviar-msg").value,
        type:  statusDaMensagem
    };
    let promessaMensagemEnviada = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages/83c66857-f7a1-43e7-a19e-e85055df6f58', mensagemAEnviar);
    promessaMensagemEnviada.then(atualizarMensagem);
    promessaMensagemEnviada.catch(reiniciarPagina);
    document.querySelector(".enviar-msg").value = "";
}

function reiniciarPagina() {
    window.location.reload();
}

function ocultarSidebar() {
    document.querySelector(".fundo-escuro").removeAttribute("onclick");
    document.querySelector(".usuarios-online").classList.add("none");
    document.querySelector(".fundo-escuro").classList.add("none");
}

function exibirSidebar() {
    document.querySelector(".usuarios-online").classList.remove("none");
    document.querySelector(".fundo-escuro").classList.remove("none");
    document.querySelector(".fundo-escuro").setAttribute("onclick", "ocultarSidebar();");
}

function usuariosConectados() {
    let promessaUsuariosOnline = axios.get('https://mock-api.driven.com.br/api/v6/uol/participants/83c66857-f7a1-43e7-a19e-e85055df6f58');
    promessaUsuariosOnline.then(exibirConectados)
}

function exibirConectados(usuarios) {
    usuariosOnline = usuarios.data;
    document.querySelector('.usuarios').innerHTML = `
    <li data-identifier="participant" onclick="escolherDestinatario(this)">
        <ion-icon name="people"></ion-icon>
        <p>Todos</p>
        <ion-icon class="none icone" name="checkmark-outline"></ion-icon>
    </li>`;
    usuariosOnline.forEach((element) => {

        document.querySelector('.usuarios').innerHTML += `
            <li data-identifier="participant" onclick="escolherDestinatario(this)">
                <ion-icon name="person-circle"></ion-icon>
                <p>${element.name}</p>
                <ion-icon class="none icone" name="checkmark-outline"></ion-icon>
            </li>`;
    })
}

function escolherDestinatario(elemento) {
    retirarSelecao(elemento.parentNode);
    elemento.querySelector(".icone").classList.remove("none");
    destinatario = elemento.querySelector("p").innerHTML;

    baixarMensagemReservada();
}

function retirarSelecao(elemento) {
    const selec = elemento.querySelector(`.icone:not(.none)`);
    if (selec !== null) {
        selec.classList.add("none");
    }
}

function escolherVisibilidade(elemento) {
    retirarSelecao(elemento.parentNode);
    elemento.querySelector(".icone").classList.remove("none");

    tipoDeVisibilidade = elemento.querySelector("p").innerHTML;
    if (tipoDeVisibilidade === "Reservadamente") {
        formaDeExibicao = 'reservadamente';
         statusDaMensagem = 'private_message';
        document.querySelector(".msg-visibilidade").innerText =
            `Enviando para ${destinatario} (${formaDeExibicao})`;
    } else {
        formaDeExibicao = "publicamente";
         statusDaMensagem = 'message';
        document.querySelector(".msg-visibilidade").innerText = `Enviando para ${destinatario} (${formaDeExibicao})`;
    }
}

function baixarMensagemReservada() {
    document.querySelector(".msg-visibilidade").innerText =
        `Enviando para ${destinatario} (${formaDeExibicao})`;
}

function enviarMensagem() {
    window.addEventListener('keyup', event => {

        if (event.code === 'NumpadEnter' || event.code === 'Enter') {
            if (document.querySelector(".enviar-msg").value !== '') {
                carregarNoServidor();
            } else if (document.querySelector(".tela-login input").value !== '') {
                autenticarUsuario();
            }
        }
    });
}