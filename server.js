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
        io.sockets.emit('fuji',"3340, 1580,  478, 342,  476, 342,  476, 1162,  476, 344,  478, 1160,  504, 316,  504, 316,  478, 342,  502, 1134,  478, 1160,  478, 342,  478, 340,  504, 316,  478, 1162,  502, 1136,  504, 316,  476, 340,  478, 342,  478, 342,  478, 342,  478, 340,  476, 344,  504, 314,  478, 342,  506, 314,  478, 340,  504, 316,  504, 316,  504, 1136,  476, 342,  504, 318,  502, 316,  478, 342,  478, 340,  478, 342,  504, 316,  478, 1162,  476, 342,  478, 342,  478, 342,  478, 342,  478, 1162,  504, 1136,  476, 1162,  478, 1162,  478, 1160,  478, 1162,  478, 1160,  480, 340,  504, 1136,  476, 342,  478, 1162,  478, 1160,  476, 342,  478, 340,  478, 344,  502, 316,  502, 316,  478, 342,  504, 316,  478, 340,  478, 340,  504, 1134,  480, 340,  478, 1160,  478, 344,  476, 342,  476, 342,  478, 1162,  478, 1160,  480, 1160,  504, 318,  478, 1160,  476, 342,  478, 340,  504, 316,  478, 340,  478, 342,  504, 316,  476, 342,  502, 316,  478, 342,  476, 342,  476, 342,  476, 1162,  502, 1136,  478, 342,  476, 342,  478, 342,  476, 342,  478, 340,  504, 314,  504, 316,  478, 340,  504, 314,  506, 314,  476, 344,  476, 342,  504, 316,  478, 342,  478, 340,  478, 342,  476, 342,  478, 340,  478, 342,  504, 314,  478, 342,  504, 316,  476, 342,  478, 342,  478, 342,  478, 342,  476, 1162,  502, 1136,  476, 342,  502, 1136,  504, 1136,  504, 1136,  478, 1162,  504, 1136,  476, 342,  506, 314,  478, 1162,  478, 342,  478, 1162,  476, 354,  502, 318,  478, 342,  478, 342,  478, 1162,  502, 316,  478, 342,  478, 342,  502, 316,  476, 1162,  504, 316,  504, 316,  478, 340,  478, 340,  504, 316,  504, 316,  478, 342,  478, 342,  478, 342,  504, 1136,  476, 342,  478, 342,  478, 340,  478, 342,  478, 340,  478, 342,  478, 342,  504, 1136,  504, 1136,  502, 1136,  504, 316,  504, 316,  476, 342,  478, 342,  504, 314,  478, 340,  478, 1162,  504, 316,  476, 342,  478, 342,  478, 1160,  504, 316,  504, 314,  478, 342,  478, 342,  504, 314,  504, 316,  504, 316,  504, 316,  478, 1160,  478, 342,  476, 342,  478, 342,  504, 314,  506, 314,  502, 318,  502, 316,  478, 1162,  502, 318,  502, 316,  502, 1136,  478, 342,  476, 342,  502, 1136,  480, 338,  504, 314,  504, 314,  506, 314,  496, 322,  502, 1138,  478, 1162,  478, 1162,  480, 1158,  478, 342,  504, 314,  478, 342,  504, 314,  504, 1134,  504, 1136,  476, 342,  504, 1136,  504, 1134,  504, 316,  504, 314,  504, 316,  506, 1134,  504, 314,  504, 316,  476, 342,  504, 316,  502, 1138,  476, 342,  504, 316,  488, 330,  478, 342,  504, 316,  478, 342,  502, 316,  504, 316,  504, 1134,  504, 1136,  504, 1136,  476, 1162,  504, 1136,  504, 1136,  478, 1162,  504, 1136,  506, 1134,  478, 1162,  504, 1136,  504, 1136,  502, 1136,  478, 1162,  504, 1136,  476, 1162,  502, 1138,  478, 1160,  504, 1136,  502, 1136,  504, 1136,  478, 1160,  478, 1162,  478, 1162,  504, 316,  502, 316,  478, 342,  504, 316,  504, 328,  500, 318,  478, 342,  476, 342,  476, 342,  504, 316,  478, 342,  478, 1162,  478, 342,  504, 1136,  504, 1134,  504, 1136,  478"}
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