const urlAPI = 'https://mock-api.driven.com.br/api/v6/uol';

let nome; // guardar o nome do usuário (login)

let tipoMensagem = 'message';

let destinatario = 'Todos';

function toggleMenu(){
    
    const menu = document.querySelector('.menu');
    const divFundo = document.querySelector('.menu-fundo');

    menu.classList.toggle('escondido');
    divFundo.classList.toggle('fundo-escondido');
}

function selecionarDestinatario(pessoa, elementoClicado){
    destinatario = pessoa;

    const elementoSelecionadoAnteriormente = document.querySelector('.contatos .selecionado');
    elementoSelecionadoAnteriormente.classList.remove('selecionado');

    elementoClicado.classList.add('selecionado');
}

function renderizarParticipantes(resposta){
    console.log('RENDERIZANDO PARTICIPATES');
    
    console.log(resposta.data);

    const ulContatos = document.querySelector('.contatos');

    // criando o item todos
    ulContatos.innerHTML = `
        <li class="visibilidade-publico selecionado" onclick = "selecionarDestinatario('Todos', this)" >
            <ion-icon name="people"></ion-icon><span class="nome">Todos</span><ion-icon class="check" name="checkmark-outline">
            </ion-icon>
        </li>        
    `;

    let template;

    let usuario;

    let classeSelecionado = '';

    for( let i = 0; i < resposta.data.length; i++){
        
        usuario = resposta.data[i];
        
        if ( usuario.name === destinatario){
            classeSelecionado = 'selecionado';
        }else{
            classeSelecionado = '';
        }

        template = `
            <li class="visibilidade-publico ${classeSelecionado}"  onclick="selecionarDestinatario('${usuario.name}', this)">
                <ion-icon name="person-circle"></ion-icon><span class="nome">${usuario.name}</span><ion-icon class="check" name="checkmark-outline">
                </ion-icon>
            </li>
        `;

        ulContatos.innerHTML += template;
    }

}

function carregarParticipantes(){
    // promisse de busca de participantes - ESCOPO É LOCAL
    const promise = axios.get(`${urlAPI}/participants`);
    promise.then(renderizarParticipantes);
}

function erroLogin(error){
    console.log('DEU RUIM AO LOGAR!!!!');
}

function posicionaNaUltimaMensagem(){
  
    const ultimaMensagem = document.querySelector('.mensagens-container li:last-child');
    ultimaMensagem.scrollIntoView();
}

function ehMensagemPrivada(mensagem){
    if (mensagem.to === nome || (mensagem.type === 'private_message' && mensagem.from === destinatario)){
        return true;
    }
    return false;
}

function renderizarMensagens(resposta){    
    
    console.log(resposta.data);

    const ulMensagens = document.querySelector('.mensagens-container');

    ulMensagens.innerHTML = '';

    let mens;
    let templateMensagem;

    for(let i = 0; i < resposta.data.length; i++){
        
        mens = resposta.data[i];
        
        if ( ehMensagemPrivada(mens) ){
            // MENSAGEM PRIVADA
            templateMensagem = `
                <li class="conversa-privada" data-test="message">
                <span class="horario">(${mens.time})</span>
                    <strong>${mens.from}</strong>
                        <span> reservadamente para </span>
                    <strong>${mens.to}: </strong>
                <span>${mens.text}</span>
                </li>
            `;
        }
        if (mens.type === 'message'){
            // MENSAGEM PUBLICA
            templateMensagem = `
            <li class="conversa-publica" data-test="message">
                <span class="horario">(${mens.time})</span>
                    <strong>${mens.from}</strong>
                        <span> para </span>
                    <strong>${mens.to}: </strong>
                <span>${mens.text}</span>
            </li>
            `;
        }
        if (mens.type === 'status'){
            // MENSAGEM STATUS
            templateMensagem = `
            <li class="entrada-saida" data-test="message">
                <span class="horario">(${mens.time})</span>
                    <strong>${mens.from}</strong>
                    <span> para </spa</strong>
                        <span> para </span>
                    <strong>${mens.to}: </strong>
                <span>E${mens.text}</span>
            </li>
            `;
        }

        ulMensagens.innerHTML += templateMensagem;
        
    }

    posicionaNaUltimaMensagem();
}

function carregarMensagens(resposta){
    console.log('BUSCANDO MENSAGENS');
    if ( nome !== undefined){
        const promise = axios.get(`${urlAPI}/messages`);
        promise.then(renderizarMensagens);
    }
}

function perguntarUsuario(){
    nome = prompt('Qual é o seu nome?');
    // validações

    // ESCOPO LOCAL
    const promise = axios.post(`${urlAPI}/participants`, {name: nome});
    promise.then(carregarMensagens);
    promise.catch(erroLogin);
}

function manterLogado(){
    console.log('STATUS');
    if ( nome !== undefined ){
        axios.post(`${urlAPI}/status`, {name: nome});
    }
}

function enviarMensagem(){

    const elementoMensagem = document.querySelector('.entrada-mensagem input');
    // verificações

    console.log('ENVIADNDO MENS.', tipoMensagem);

    const promise = axios.post(`${urlAPI}/messages`,{
        from: nome, // var. global 
        to: destinatario,
        text: elementoMensagem.value,
        type: tipoMensagem // ou "private_message" para o bônus
    });

    promise.then(carregarMensagens);

}

function defineTipoMensagem(tipo, elementoClicado){
    tipoMensagem = tipo;

    // remover o check do elemento que esta com a classe selecionado
    const elemenoSelecionadoAnteriormente = document.querySelector('.visibilidades .selecionado');
    elemenoSelecionadoAnteriormente.classList.remove('selecionado');
    
    elementoClicado.classList.add('selecionado');
}

// ponto de entrada da aplicação
function entrarChat(){
    console.log('INICIANDO CHAT');

    carregarParticipantes();

    perguntarUsuario();

    setInterval(carregarMensagens, 3000);
    setInterval(manterLogado, 5000);
    setInterval(carregarParticipantes, 10000);


}
entrarChat();