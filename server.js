require('dotenv').config()
const express = require('express')
//const fs = require('fs')
const bodyParser = require('body-parser')
const request = require('request')
//const https = require('https')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

var ledIRcode=[{name:"1102472602",code:"on"},{name:"1102462402",code:"sleep"},{name:"1102478722",code:"off"},{name:"1102503202",code:"-"},{name:"1102470562",code:"+"}];
var statusOfAir= {header:"28c60008087f900c",mid:"00000004",byte9:"",byte10:"",byte11:"",byte16:""}
var state=[{name:"on",val:"0"},{name:"off",val:"8"}]
var temp=[{name:"16C",val:"0"},
          {name:"17C",val:"8"},
          {name:"18C",val:"4"},
          {name:"19C",val:"c"},
          {name:"20C",val:"2"},
          {name:"21C",val:"a"},
          {name:"22C",val:"6"},
          {name:"23C",val:"e"},
          {name:"24C",val:"1"},
          {name:"25C",val:"9"},
          {name:"26C",val:"5"},
          {name:"27C",val:"d"},
          {name:"28C",val:"3"},
          {name:"29C",val:"b"},
          {name:"30C",val:"7"},]
var mode=[{name:"cold"}]
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
      let country = ledIRcode.find(el => el.code ===received_message.text.split(" ")[1]);
      if (country){
        io.sockets.emit('event',country["name"])
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