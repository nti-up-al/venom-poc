const venom = require('venom-bot');

venom
  .create({
    session: 'session-name' //name of session
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

async function start(client) {
  await client
    .sendText('numero-de-telefone@c.us', '👋 Hello from venom!')
    .then((result) => {
      console.log('Result: ', result); //return object success
    })
    .catch((erro) => {
      console.error('Error when sending: ', erro); //return object error
    });
}
