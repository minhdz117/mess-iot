require('dotenv').config()
const express = require('express')
//const fs = require('fs')
const bodyParser = require('body-parser')
const request = require('request')
//const https = require('https')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

var ledIRcode=[{val:"1102472602",name:"on"},{val:"1102462402",name:"sleep"},{val:"1102478722",name:"off"},{val:"1102503202",name:"-"},{val:"1102470562",name:"+"}];
var airIRcode=[{name:"cool",val:[{name:"18",val:""},]},
              {name:"head"}]
//const privateKey = fs.readFileSync('./server.key', 'utf8');
//const certificate = fs.readFileSync('./server.crt', 'utf8');
//const credentials = { key: privateKey, cert: certificate };

app.set('views', './views')
app.set('view engine', 'ejs')

app.use(bodyParser.json())

app.route('/')
  .get((req, res) => {
    res.send('login')
  })

app.route('/webhook')
  .post((req, res) => {
    let body = req.body;
    if (body.object === 'page') {
      body.entry.forEach(function (entry) {

        // Gets the body of the webhook event
        let webhook_event = entry.messaging[0];
        console.log(webhook_event);

        // Get the sender PSID
        let sender_psid = webhook_event.sender.id;
        console.log('Sender PSID: ' + sender_psid);

        // Check if the event is a message or postback and
        // pass the event to the appropriate handler function
        if (webhook_event.message) {
          handleMessage(sender_psid, webhook_event.message);
        } else if (webhook_event.postback) {
          handlePostback(sender_psid, webhook_event.postback);
        }

      });

      res.status(200).send('EVENT_RECEIVED');
    } else {
      res.sendStatus(404);
    }

  })
  .get((req, res) => {
    let mode  = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
      } else {
        res.sendStatus(403);
      }
    }
  });

const port = 3001
//var server = https.createServer(credentials, app);
server.listen(port, () => {
  console.log(`app listen on port : ${port}`)
})

// Handles messages events
function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {
      if (received_message.text.split(" ")[0]=="led"){
        let country = ledIRcode.find(el => el.name ===received_message.text.split(" ")[1]);
        if (country){
          io.sockets.emit('event',country["val"])
        }
      }
      if (received_message.text.split(" ")[0]=="air"){
        io.sockets.emit('fuji',"3306, 1636,  420, 376,  442, 398,  422, 1218,  420, 398,  422, 1218,  420, 398,  422, 378,  442, 376,  442, 1200,  442, 1216,  422, 398,  420, 374,  446, 398,  420, 1218,  422, 1194,  444, 398,  420, 378,  442, 398,  420, 400,  422, 374,  444, 398,  422, 398,  420, 400,  420, 400,  420, 376,  444, 372,  446, 376,  442, 398,  422, 1216,  422, 376,  442, 396,  422, 398,  422, 400,  420, 398,  422, 398,  422, 398,  420, 1218,  422, 398,  420, 398,  422, 376,  442, 398,  422, 1218,  420, 1218,  420, 1218,  422, 1218,  422, 1196,  444, 1216,  422, 1196,  442, 398,  420, 1218,  420, 398,  422, 1196,  442, 1196,  444, 398,  420, 398,  422, 398,  422, 396,  422, 378,  440, 378,  442, 398,  420, 396,  422, 398,  420, 1196,  444, 378,  442, 1218,  420, 398,  422, 396,  422, 396,  424, 1194,  444, 398,  422, 1216,  422, 396,  422, 1216,  420, 398,  422, 398,  422, 398,  422, 378,  442, 398,  420, 398,  422, 376,  442, 398,  422, 398,  422, 374,  444, 376,  442, 1198,  442, 1218,  422, 398,  422, 398,  420, 398,  424, 396,  420, 398,  422, 398,  420, 398,  420, 398,  420, 398,  422, 396,  422, 398,  422, 398,  422, 396,  422, 376,  442, 396,  424, 376,  442, 398,  420, 376,  444, 398,  420, 398,  422, 398,  422, 396,  422, 396,  422, 376,  444, 396,  422, 398,  422, 1216,  422, 1218,  422, 374,  444, 1218,  422, 1196,  442, 1194,  446, 1196,  442, 1194,  446, 374,  444, 398,  422, 1216,  422, 396,  422, 1216,  422, 410,  422, 374,  444, 398,  422, 378,  442, 1194,  444, 398,  422, 376,  442, 398,  424, 1194,  444, 398,  420, 398,  422, 398,  422, 396,  422, 398,  422, 398,  420, 376,  442, 400,  422, 376,  442, 398,  422, 1216,  422, 376,  442, 400,  420, 398,  420, 376,  444, 398,  420, 398,  420, 398,  422, 1216,  422, 378,  442, 1216,  422, 378,  442, 1218,  422, 398,  422, 376,  440, 400,  420, 398,  420, 398,  420, 1218,  422, 1198,  442, 398,  420, 398,  420, 378,  440, 380,  440, 398,  422, 376,  442, 378,  444, 396,  422, 398,  420, 400,  420, 1218,  422, 398,  422, 378,  442, 398,  422, 398,  420, 398,  420, 376,  442, 400,  422, 1196,  442, 400,  420, 398,  422, 1218,  420, 378,  442, 398,  420, 1194,  444, 398,  420, 398,  422, 378,  440, 378,  442, 398,  420, 1198,  442, 1218,  422, 1218,  422, 1218,  420, 398,  422, 378,  440, 398,  422, 396,  420, 1218,  420, 1218,  422, 398,  420, 1194,  444, 1196,  442, 398,  420, 376,  442, 378,  442, 1218,  422, 398,  422, 376,  442, 378,  444, 376,  440, 1198,  442, 398,  422, 398,  420, 378,  442, 398,  422, 398,  422, 398,  420, 376,  444, 396,  420, 1196,  444, 1218,  422, 1196,  444, 1218,  422, 1194,  444, 1220,  420, 1218,  422, 1196,  442, 1198,  442, 1218,  422, 1218,  422, 1218,  420, 1198,  442, 1194,  444, 1218,  422, 1198,  442, 1218,  422, 1218,  422, 1194,  444, 1220,  420, 1196,  444, 1198,  442, 1194,  444, 1218,  420, 398,  422, 398,  422, 398,  420, 398,  424, 408,  422, 374,  444, 398,  422, 398,  422, 396,  422, 398,  422, 374,  444, 398,  422, 1216,  422, 1216,  424, 398,  420, 398,  420,")
      }
    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}"`
    }
  }

  // Sends the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": VERIFY_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  });
}