const venom = require('venom-bot');
const axios = require('axios/dist/node/axios.cjs'); // node
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
  client.onMessage((message) => {
    if (message.body === 'agenda-estudante' && message.isGroupMsg === false) {
      client
        .then((result) => {
          axios.get('http://localhost:8080/cremessage/'+response.from)
          .then(function (response) {
            session.push(response.from);
            return result.from;
          })
          .catch(function (error) {
            console.log(error);
          });
          
        }).sendText((result.from, result.message)) = {
            
        }
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    }else if(checkSession(message.from) );

  });

 
}

