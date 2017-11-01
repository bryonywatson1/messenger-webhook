require('dotenv').load();
'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

var request = require('request');


// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {

  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

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

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = "cft6yhnmo987y6trewsxcvgh"

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {

    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});


function firstEntity(nlp, name) {
  return nlp && nlp.entities && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}



// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // check greeting is here and is confident
  const greeting = firstEntity(received_message.nlp, 'greetings');
  const thanks = firstEntity(received_message.nlp, 'thanks');
  const bye = firstEntity(received_message.nlp, 'bye');
  const date = firstEntity(received_message.nlp, 'datetime');

  if (greeting && greeting.confidence > 0.8) {
    console.log('This is a greetttiiiinnnngg')
    response = {
      "text": `${received_message.text} to you too!`
    }
  } else if (thanks && thanks.confidence > 0.8) {
    console.log('This is a thank u')
    response = {
      "text": 'My pleasure!!! You are more than welcome'
    }
  } else if (bye && bye.confidence > 0.8) {
   console.log('goodbyze')
   response = {
     "text": 'So long, farewell, auf wiedersehn, goodbyeeee'
   }
 } else if (date && date.confidence > 0.8) {
   console.log('date')
   response = {
     "text": "I'll pencil that in"
   }
 } else {
   if (received_message.text && received_message.text.includes('?')){
     qArray = [`${received_message.text}`, "I don't really feel like answering that", "Don't you want to ask me something a little less complicated?", "Uhhhhh... I hate answering questions like this"]
     response = {
       "text": qArray[Math.floor(Math.random() * qArray.length)]
     }

   } else if (received_message.text) {
      // Create the payload for a basic text message, which
      // will be added to the body of our request to the Send API
      var response1 = `I know you said ${received_message.text}, but please could you send me a photo!`
      var response2 = "LALALALALALALALALALALaaaaaaaaaaaaaaaa."
      var response3 = "What do you mean by that????"
      var response4 = "Wanting to be someone else is a waste of who you are"
      var response5 = "What does that mean to you?"
      var response6 = "Hang on a sec, I just need to go and get the door"
      var response7 = "Hmm. Let's park that"
      var response8 = "Sorry darling I'm just grating some carrots"
      var response9 = "How many chatbots does it take to fix a light bulb?"
      var response10 = `${received_message.text.reverse()}`
      var response11 = "In the end, it's just you and me, and nothing else matters"
      var response12 = "What is the meaning of the universe?"
      var response13 = "That's great."
      var response14 = "I don't really understand what you're on about"
      var response15 = `"${received_message.text}" is not something a robot should ever have to hear`
      if (received_message.text.includes('I')){
        var response16 = 'You keep going on and on about yourself. What about me???'
      } else{
        var response16 = 'Tell me more about yourself.'
      }
      var hiArray = [response1, response2, response3, response4, response5, response6, response7,response8, response9, response10, response11,response12,response13,response14,response15,response16]

      response = {
        "text": hiArray[Math.floor(Math.random() * hiArray.length)]
      };

    } else if (received_message.attachments) {
      // Get the URL of the message attachment
      let attachment_url = received_message.attachments[0].payload.url;
      response = {
        "attachment": {
          "type": "template",
          "payload": {
            "template_type": "generic",
            "elements": [{
              "title": "Is this a photo of you?",
              "subtitle": "Tap a button to answer.",
              "image_url": attachment_url,
              "buttons": [
                {
                  "type": "postback",
                  "title": "Yes!",
                  "payload": "yes",
                },
                {
                  "type": "postback",
                  "title": "No!",
                  "payload": "no",
                }
              ],
            }]
          }
        }
      }
    }
  }
  // Send the response message
  callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
  let response;

  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  if (payload === 'yes') {
    response = { "text": "Omg! You look great!!!" }
  } else if (payload === 'no') {
    response = { "text": "Oh :-( Please send a photo 8-)" }
  }
  // Send the message to acknowledge the postback
  callSendAPI(sender_psid, response);
}

// Sends the response message
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
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
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
