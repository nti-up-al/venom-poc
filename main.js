const venom = require('venom-bot');
const axios = require('axios'); // node
const sharp = require('sharp');
console.log(sharp);
const fs = require('fs');
console.log(fs.existsSync('./0.png')); 
const sessions = [];
const titulo = "Conceito: Tendo em vista que o conceito de solução é resolver um problema, sabemos que também precisamos achar uma solução para as mudanças climáticas que o mundo está sofrendo, o que você acha que precisamos fazer para ajudar? \n \n Economizar energia pode ser considerada uma solução climática, o que mais você considera uma solução?"

const bicicleta = ['B','I','C','I','C','L','E','T','A'];
const solar = ['S','O','L','A','R'];
const verdura = ['V','E','R','D','U','R','A'];
const leveis = [{
  nivel:0,
  palavra:solar ,
  dica:  'TEMA - ENERGIA \n com *5* letras  \n DICA: UMA FORMA SUSTENTÁVEL DE FORNECER  ENERGIA',
  resposta:'*PARABÉNS!* O uso de energia solar é uma excelente alternativa para combater o uso de energia não-renovável.'

},{
  nivel:1,
  palavra: bicicleta,
  dica:'TEMA - TRANSPORTE  \n com *9* letras \n DICA: As crianças adoram e as vezes são usadas com rodinhas ',
  resposta:'*PARABÉNS!* O uso da bicicleta reduz o uso de transportes que utilizam gasolina e diesel, reduz a emissão de gases de efeito estufa, além de contribuir com a sua saúde e bem-estar.'
},{
  nivel:2,
  palavra:verdura ,
  dica:  'TEMA - ALIMENTAÇÃO \n com *7* letras  \n DICA:  É UMA CLASSIFICAÇÃO ALIMENTAR QUE ABRIGA UMA DIVERSIDADE DE ALIMENTOS ',
  resposta:'*PARABÉNS!* As verduras são bastante importantes no desenvolvimento humano, também contribui para o meio ambiente, porque reduz a necessidade de máquinas para processar alimentos.'
}];

venom
.create(
  //session
  'sessionName', //Pass the name of the client you want to start the bot
  //catchQR
  (base64Qrimg, asciiQR, attempts, urlCode) => {
    console.log('Number of attempts to read the qrcode: ', attempts);
    console.log('Terminal qrcode: ', asciiQR);
    console.log('base64 image string qrcode: ', base64Qrimg);
    console.log('urlCode (data-ref): ', urlCode);
  },
  // statusFind
  (statusSession, session) => {
    console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
    //Create session wss return "serverClose" case server for close
    console.log('Session name: ', session);
  },
  // options
  {
   headless: 'new', // you should no longer use boolean false or true, now use false, true or 'new' learn more https://developer.chrome.com/articles/new-headless/
  },

  // BrowserInstance
  (browser, waPage) => {
    console.log('Browser PID:', browser.process().pid);
    waPage.screenshot({ path: 'screenshot.png' });
  }
)
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

async function start(client) {
  client.onMessage(async (message) => {
    let sessao;
    if (message.body === 'tec-game' && message.isGroupMsg === false) {
      await createSession(message);
      await client.sendText(message.from, titulo);
      sessao = checkSession(message.from);
      let mensagem = getMessage(sessao,message, true)
      await client.sendText(message.from,mensagem);
    }else if (message.body === '99' && message.isGroupMsg === false) {
      removeSession(message)
      await client.sendText(message.from,'Ok, você saiu do jogo, se quiser jogar novamente mande: tec-game');
    }else if (message.body === '00' && message.isGroupMsg === false) {
      removeSession(message);
      await createSession(message);
      await client.sendText(message.from, titulo);
      sessao = checkSession(message.from);
      let mensagem = getMessage(sessao,message, true)
      await client.sendText(message.from,mensagem);
    }
    else{
      sessao = checkSession(message.from)
      if(sessao){
        let mensagem = getMessage(sessao,message,false)
        if(mensagem.finishLevel){
          await client.sendText(message.from,mensagem.message);  
          let newMensage = getMessage(sessao,message, true)
          await client.sendText(message.from,newMensage);
        }else{
          await client.sendText(message.from,mensagem);
        }
       }
    }
  });
}

function getMessage(sessao, message, isFirst) {
  let retorno;
  let levelAtual = getSessionLevel(sessao); // Obtém o nível atual do jogo

  if(!isFirst && message.body !== 'tec-game'){
    if (message.body.length !== 1) {
      return "Digite apenas *UMA LETRA* por vez!!!!";
    }
    if (isNumber(message.body)) {
      return "Digite letras para jogar!!!!";
    }
    let letra = message.body.toUpperCase(); // Normaliza a letra para evitar diferenças de maiúsculas/minúsculas
  
    // Verifica se a letra já foi tentada
    if (sessao.nivel.letrasAcerto.includes(letra) || sessao.nivel.letrasErros.includes(letra)) {
      return "VOCÊ JÁ TENTOU ESSA LETRA, LETRAS JÁ TENTADAS: " + 
             sessao.nivel.letrasAcerto.join(", ") + " " + sessao.nivel.letrasErros.join(", ");
    }
  
    // Se a letra existe na palavra
    if (levelAtual.palavra.includes(letra)) {
      sessao.nivel.letrasAcerto.push(letra); // Adiciona ao array de acertos
      retorno = getMessageSucesso(sessao, levelAtual, letra);
    } else {
      sessao.nivel.letrasErros.push(letra); // Adiciona ao array de erros
      retorno = getMessageErro(sessao, levelAtual, letra);
    }
    return retorno;
  }else {
    let palavraOculta = levelAtual.palavra.map(() => "_").join(" ");
    return `Jogo da Forca! Digite 00 para reiniciar 😢 , 99 para sair 😭, ou a próxima letra da palavra para jogar! 😄🏆\n\n` +
           `${forcaEstagios[0]}\n\n` + 
           `Palavra: ${palavraOculta}\n\n` +
           `${levelAtual.dica
           }`;
  }
}

function getMessageErro(sessao, level, letra) {
  let palavraRetorno = level.palavra
  .map((char) => (sessao.nivel.letrasAcerto.includes(char) ? char : "_"))
  .join(" "); // Mantém espaços entre os caracteres para visualização
  let erros = sessao.nivel.letrasErros.length;
  let forca = forcaEstagios[Math.min(erros, forcaEstagios.length - 1)]; // Mostra o estágio correto da forca

  return `❌ Letra "${letra}" não encontrada!\n` + 
         `${forca}\n\n` +
         `${6 - erros !== 0?   "Palavra: " +  palavraRetorno +"\n" : ''}` +
         `Você tem *${6 - erros} tentativas* restantes.` +
         `${6 - erros !== 0? level.dica : ''}`;
}

function isNumber(value) {
  return typeof value === 'number' || !isNaN(value);
}

function getMessageSucesso(sessao, level, letra) {
  let erros = sessao.nivel.letrasErros.length;
  let forca = forcaEstagios[Math.min(erros, forcaEstagios.length - 1)]; // Mostra o estágio correto da forca

  let palavraRetorno = level.palavra
    .map((char) => (sessao.nivel.letrasAcerto.includes(char) ? char : "_"))
    .join(" "); // Mantém espaços entre os caracteres para visualização

  // Verifica se a palavra foi completamente descoberta
  if (!palavraRetorno.includes("_")) {
    sessao.nivel.nivelAtual = sessao.nivel.nivelAtual+1 
    sessao.nivel.letrasAcerto=  [];
    sessao.nivel.letrasErros= [];
    if(sessao.nivel.nivelAtual ==  leveis.length){
      return `🎉 Parabéns! Você descobriu a palavra: ${level.palavra.join("")} \n ${level.resposta}  \n \n 🎉 Parabéns! Você finalizou o jogo! Digite 99 para sair ou 00 para reiniciar!`;

    }
    return {message: `🎉 Parabéns! Você descobriu a palavra: ${level.palavra.join("")} \n ${level.resposta} `, finishLevel:true} ;
  }

  return `${forca}  \n ✅ Letra "${letra}" correta! \n Palavra: ${palavraRetorno} \n ${level.dica}` ;
}


function  getSessionLevel(sessao){
  for (const element of leveis) {
    if (element.nivel === sessao.nivel.nivelAtual) {
        return element; 
    }
  }
}

function removeSession(message) {
  const index = sessions.findIndex(session => session.telefone === message.from);
  if (index !== -1) {
    sessions.splice(index, 1); // Remove o elemento na posição index
  }
}

async function createSession(message){
  sessions.push({telefone :message.from, nivel: {nivelAtual:0, letrasAcerto:[],  letrasErros:[]}});
}

function checkSession(from){
    for (const element of sessions) {
      if (element.telefone === from) {
          return element; 
      }
    }
    return null; // Retorna null se não encontrar
}





const forcaEstagios = [
  `
  +------+
  |         |
  |          
  |
  |
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |         
  |
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |         |
  |
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |       /|
  |
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |       /|\\
  |
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |       /|\\
  |       /
  |
  =========
  `,
  `
  +------+
  |         |
  |        O 
  |       /|\\
  |       / \\
  |
  =========
  💀 GAME OVER! 💀 \n Digite *00* Para reiniciar! ou *99* Para sair
  `
];

/*
function getMessage(sessao,message){
  let retorno;
  if (message.body.length > 0){
    return 'DIGITE APENAS *UMA LETRA* POR VEZ!!!!'
  }else{
    let levelAtual = getSessionLeven(sessao);
    if (sessao.nivel.letrasAcerto.includes(message.body) || sessao.nivel.letrasErros.includes(message.body)  ){
        return 'VOCÊ JÁ TENTOU ESSA LETRA, LETRAS JÁ TENTADAS:' + letrasAcerto + letrasErros;
    }
    if(levelAtual.includes(message.body)){
      letrasAcerto.add(message.body);
      retorno = getMessageSucesso(sessao, levelAtual, message.body)
    }else{
      letrasErros.add(message.body);
      retorno = getMessageErro(sessao, levelAtual, message.body)
    }
  }
  return retorno 
}

function getMessageErro(sessao, level, letra){

}

function getMessageSucesso(sessao, level, letra){
    
  let palavraRetorno;
   for (const element of levelAtual.palavra) {
    if (element === letra) {
        return element; 
    }
  }
}
*/


/*if (message.body === 'tec-game' && message.isGroupMsg === false) {
          axios.get('http://localhost:3001/api/createsession/'+message.from.replace('@c.us',''))
          .then(function (response) {
            session.push(message.from);
            client.sendText(message.from, response.data.message[0].descricao);  
          })
          .catch(function (error) {
            console.log(error);
          });        
         
    }else if(await checkSession(message.from) ){
      const response = await axios.post('http://localhost:3001/api/', message);
      const responseData =response.data.message[0];
      if(responseData.tipo){
        switch(responseData.tipo){
          case 'chat':
            client.sendText(message.from,responseData.descricao)      
          case 'document' :
            client.sendFileFromBase64(message.from,responseData.document,responseData.documentName, responseData.descricao)     
          case 'image' :
            client.sendImageFromBase64(message.from,responseData.document,responseData.documentName, responseData.descricao)     
        }
      }else{
        client.sendText(message.from,responseData.descricao)      
      }
     
    
    
      
    };
    */

