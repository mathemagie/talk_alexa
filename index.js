/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, tell Greeter to say hello"
 *  Alexa: "Hello World!"
 */

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.echo-sdk-ams.app.255b2ec3-7ff5-452a-9a15-ffec0b3c2cfb"; //replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";

/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');


/**
 * Philips for variable integration
*/
var https = require('https');
 
var bridge = "001788fffe27815f";
 
var requestData = {
      on: true,
      effect: "none"
};

var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dbx7Jm9cWYyuHEV6c597dfdowYXd'
};


var optionsLivingRoom = {
    host: 'api.meethue.com',
    path: '/v1/bridges/'+bridge+'/lights/2/state',
    method: 'PUT',
    headers: headers
};

var optionsBedroom = {
    host: 'api.meethue.com',
    path: '/v1/bridges/'+bridge+'/lights/1/state',
    method: 'PUT',
    headers: headers
};

var optionsKitchen = {
    host: 'api.meethue.com',
    path: '/v1/bridges/'+bridge+'/lights/3/state',
    method: 'PUT',
    headers: headers
};

var lights = ["living room", "bedroom", "kitchen"];
var optionsArray = [optionsLivingRoom, optionsBedroom, optionsKitchen];

/**
 * Talk2MyHand is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var Talk2MyHand = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Talk2MyHand.prototype = Object.create(AlexaSkill.prototype);
Talk2MyHand.prototype.constructor = Talk2MyHand;

Talk2MyHand.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("Talk2MyHand onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);
    var sessionAttributes = {};
   sessionAttributes.indexCoverage = 0;
    sessionAttributes.indexSecurity = 0;
    sessionAttributes.indexFloodingZone = 0;
    sessionAttributes.indexFloodingHelp = 0;
   session.attributes = sessionAttributes;
    // any initialization logic goes here
};

Talk2MyHand.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("Talk2MyHand onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
    var speechOutput = "Hello, What can I do for you?";
    var repromptText = "Is there any way I can help you?";
    response.ask(speechOutput, repromptText);
};

Talk2MyHand.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("Talk2MyHand onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);
    // any cleanup logic goes here
};

Talk2MyHand.prototype.intentHandlers = {
    // register custom intent handlers
    "ErrandIntent": function (intent, session, response) {
        response.ask('Would you like me to look after your house while you\'re away?','');
     },

    "ActivateSecurityIntent": function (intent, session, response) {
        //response.ask("Your security system will switch to out of home and the presence simulation will be activated. I'll protect your home", "Greeter", "Hello World!");
        var sessionAttributes = session.attributes;
        console.log("index id dans intent =>" + sessionAttributes.indexSecurity);
         if(sessionAttributes.indexSecurity == 0){
            switchOnAlarm(sessionAttributes, session, response);
            return;
        }
        if(sessionAttributes.indexSecurity == 1){
            switchOnPresenceSimulation(sessionAttributes, session, response);
            return;
        }
         if(sessionAttributes.indexSecurity == 2){
            response.tell('Enjoy your errands!');
        }

        sessionAttributes.indexSecurity = sessionAttributes.indexSecurity + 1;
        session.attributes = sessionAttributes;

        response.ask(text, reprompt);


    },

 "DeviceCoverageIntent": function (intent, session, response) {
        //response.ask("Your security system will switch to out of home and the presence simulation will be activated. I'll protect your home", "Greeter", "Hello World!");
        var sessionAttributes = session.attributes;
        console.log("index id dans intent =>" + sessionAttributes.indexCoverage);
         if(sessionAttributes.indexCoverage == 0){
            sessionAttributes.device = intent.slots.MyDevice.value;
            console.log("getPriceFromAPI");
            getPriceFromAPI(intent.slots.MyDevice.value, function(data){
                    sessionAttributes.indexCoverage = sessionAttributes.indexCoverage + 1;
                    session.attributes = sessionAttributes;
                    if ( data != null && data.results !== 'undefined' && data.results.length > 0 ) {
                        var text = 'price => ' + data.results[0].price;
                        sessionAttributes.price = data.results[0].price;
                        var reprompt = '';
                        response.ask(text, reprompt);
                    }
                    else {
                        var text = 'Your ' + sessionAttributes.device + ' is covered by your home insurance against fire, water, theft and burglary but only at a discounted value. There is an option to cover it at replacement value';
                        var reprompt = '';
                        sessionAttributes.price = 339.95;
                        response.ask(text, reprompt);
                    }
            });
            console.log("call done");
            return;
        }
        if(sessionAttributes.indexCoverage == 1){
              var text = 'Discounted value takes into account the usage of your ' + sessionAttributes.device + ' and thus that it will be worth less every year. Replacement value means that you will be reimbursed exactly '+sessionAttributes.price+', what you would need to have a brand new replacement';
              var reprompt = '';
        }
        if(sessionAttributes.indexCoverage == 2){
            if (sessionAttributes.device == "iPhone") var text = 'The option costs 5 additional euros per year, and it will also increase the coverage of your TV and your iPad';
            else var text = 'The option costs 5 additional euros per year, and it will also increase the coverage of your TV and your iPhone';
              var reprompt = '';
        }
        if(sessionAttributes.indexCoverage == 3){
              var text = 'Sure!<break time="1s"/> Your ' + sessionAttributes.device + ' is now fully covered. You will be charged for it at the end of the month';
              var reprompt = '';
        }
         if(sessionAttributes.indexCoverage == 4){
            response.tell("I was really happy to help you.");
        }

        sessionAttributes.indexCoverage = sessionAttributes.indexCoverage + 1;
        session.attributes = sessionAttributes;

        response.ask(text, reprompt);


    },


    "FloodingZoneIntent": function (intent, session, response) {
        //response.ask("Your security system will switch to out of home and the presence simulation will be activated. I'll protect your home", "Greeter", "Hello World!");
        var sessionAttributes = session.attributes;
        console.log("index id dans intent =>" + sessionAttributes.indexFloodingZone);
         if(sessionAttributes.indexFloodingZone == 0){
            sessionAttributes.home = intent.slots.MyHome.value;
            var text = 'Your ' + sessionAttributes.home + ' in risk mid to high risk zone';
            var reprompt = '';
        }
        if(sessionAttributes.indexFloodingZone == 1){
              response.tell('Sure, I will send you a SMS');
        }

        sessionAttributes.indexFloodingZone = sessionAttributes.indexFloodingZone + 1;
        session.attributes = sessionAttributes;

        response.ask(text, reprompt);


    },


    "FloodingHelpIntent": function (intent, session, response) {
        //response.ask("Your security system will switch to out of home and the presence simulation will be activated. I'll protect your home", "Greeter", "Hello World!");
        var sessionAttributes = session.attributes;
        console.log("index id dans intent =>" + sessionAttributes.indexFloodingHelp);
         if(sessionAttributes.indexFloodingHelp == 0){
            var text = 'We can send François tomorrow at 5 pm, there will be a fee of 50 euros, do you want me to confirm?';
            var reprompt = '';
        }
        if(sessionAttributes.indexFloodingHelp == 1){
              response.tell('Great, you’ll receive the bill in your monthly recap');
        }

        sessionAttributes.indexFloodingHelp = sessionAttributes.indexFloodingHelp + 1;
        session.attributes = sessionAttributes;

        response.ask(text, reprompt);


    },

    "DeactivateSecurityIntent": function (intent, session, response) {
        switchOffAlarm(response);
     },


    "YesIntent": function (intent, session, response) {
        ActivateSecurityIntent(intent, session, response);
     },

     "TurnOn": function(intent, session, response) {
        setLightToTurnOn(intent, session, response);
    },

    "TurnOff": function(intent, session, response) {
        setLightToTurnOff(intent, session, response);
     },

    "StopIntent": function (intent, session, response) {
        response.tell("That was my pleasure.");
     },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Talk to Axe is here to help you, I can for example protect your home when you are away or tell you if your items are covered.", "How can I help you?");
    }
};

function getPriceFromAPI(deviceId, callback){

  var url = "/test/v1/products?q={\"search\":\"ipad\"}";

  var options = {
    hostname: "api.semantics3.com",
    method: "GET",
    path: url,//I don't know for some reason i have to use full url as a path
    headers : {
        "api_key": "SEM33591FCD0473723EF347D83576053B49C"
    }
  };

  https.get(options, function(res){
    var body = '';

    res.on('data', function(data){
      body += data;
    });

    res.on('end', function(){
      var result = JSON.parse(body);
      callback(result);
    });

  }).on('error', function(e){
    callback(null);
  });
};

function setLightToTurnOn(intent, session, alexaResponse) {
    var cardTitle = intent.name;
    var lightToTurnOn = intent.slots.Light.value;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
    var lightIndex = lights.indexOf(lightToTurnOn.toLowerCase());
    
    console.log("light to turn on: " + lightToTurnOn);
    console.log("lightIndex: " + lightIndex);
    
    if ( lightIndex < 0 ) {
        callback.tell("Sorry, I didn't understand. Could you please repeat?");
    }
    else {
        sendCommandToLight(true, lightIndex, sessionAttributes, cardTitle, speechOutput, repromptText, shouldEndSession, alexaResponse);
    }
    
}

function setLightToTurnOff(intent, session, alexaResponse) {
    var cardTitle = intent.name;
    var lightToTurnOff = intent.slots.Light.value;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
     var lightIndex = lights.indexOf(lightToTurnOff.toLowerCase());
    
    console.log("light to turn off: " + lightToTurnOff);
    console.log("lightIndex: " + lightIndex);
    
    if ( lightIndex < 0 ) {
        alexaResponse.tell("Sorry, I didn't understand. Could you please repeat?");
    }
    else {
        sendCommandToLight(false, lightIndex, sessionAttributes, cardTitle, speechOutput, repromptText, shouldEndSession, alexaResponse);
    } 
}

function sendCommandToLight(turnOn, lightIndex, sessionAttributes, cardTitle, speechOutput, repromptText, shouldEndSession, alexaResponse) {

    console.log('sendCommandToLight');
    requestData.on = turnOn;

    var philipsCallback = function(error) {
        if ( error ) {
            console.error(err.stack);
            alexaResponse.tell("Sorry, I couldn't complete the requested action");
        }
        else {
            if ( turnOn ) {
                alexaResponse.tell("Sure, I'm turning on the light of the "+lights[lightIndex]);
            }
            else {
                alexaResponse.tell("Roger, I'm turning it off");
            }
        }
    }

    callPhilipsAPI(optionsArray[lightIndex], requestData, philipsCallback);

}

function switchOnAlarm(sessionAttributes, session, alexaResponse) {
    var option = {
        host: 'api.meethue.com',
        path: '/v1/bridges/'+bridge+'/lights/1/state',
        method: 'PUT',
        headers: headers
    }

    var requestBody = {
      hue: 46920,
      transitiontime: 30
    };

    var philipsCallback = function(error) {
        if ( error ) {
            console.error(err.stack);
            alexaResponse.tell("Sorry, I couldn't complete the requested action");
        }
        else {
            var text = 'I\'m activating your security system, do you also want to activate the presence simulation?';
            var reprompt = '';
            sessionAttributes.indexSecurity = sessionAttributes.indexSecurity + 1;
            session.attributes = sessionAttributes;

            alexaResponse.ask(text, reprompt);
        }
    };

    callPhilipsAPI(option, requestBody, philipsCallback);
}

function switchOffAlarm(alexaResponse) {
    var option = {
        host: 'api.meethue.com',
        path: '/v1/bridges/'+bridge+'/lights/1/state',
        method: 'PUT',
        headers: headers
    }

    var requestBody = {
      on: false
    };

    var philipsCallback = function(error) {
        if ( error ) {
            console.error(err.stack);
            alexaResponse.tell("Sorry, I couldn't complete the requested action");
        }
        else {
            alexaResponse.tell("Welcome Home!");
        }
    };

    callPhilipsAPI(option, requestBody, philipsCallback);
}

function switchOnPresenceSimulation(sessionAttributes, session, alexaResponse) {
    var option = {
        host: 'api.meethue.com',
        path: '/v1/bridges/'+bridge+'/lights/1/state',
        method: 'PUT',
        headers: headers
    }

    var requestBody = {
      hue: 46920,
      alert: "select"
    };

    var philipsCallback = function(error) {
        if ( error ) {
            console.error(err.stack);
            alexaResponse.tell("Sorry, I couldn't complete the requested action");
        }
        else {
            var reprompt = '';
            sessionAttributes.indexSecurity = sessionAttributes.indexSecurity + 1;
            session.attributes = sessionAttributes;
            var mp3 = "https://s3.eu-central-1.amazonaws.com/da-storage/da-storage/pink6.mp3";
            var text = 'The presence simulation is set up. I\'ll protect your home while you\'re away. ';
            var respWithMP3 = {
                speech: "<speak>" + text +  "<break time=\"1s\"/><audio src=\""+mp3+"\" />" + "</speak>",
                type: AlexaSkill.speechOutputType.SSML

            };
            
            alexaResponse.tell(respWithMP3);
        }
    };

    callPhilipsAPI(option, requestBody, philipsCallback);
}

function callPhilipsAPI(apiCall, callBody, philipsCallback) {
    var callback = function(response) {
        var str = '';
    

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function(chunk) { 
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function() {
            console.log("response received");
            console.log(str);
            philipsCallback(null);
            
        });
        
        response.on('error', function(err) {
            // This prints the error message and stack trace to `stderr`.
            console.error(err.stack);
            philipsCallback(err);
        });
    };
   
    if ( callBody ) {
        var body = JSON.stringify(callBody);
        https.request(apiCall, callback).end(body);
    }
    else {
        https.request(apiCall, callback).end();
    }
    
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Talk2MyHand skill.
    var talk2MyHand = new Talk2MyHand();
    talk2MyHand.execute(event, context);
};
