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
        response.ask("Would you like me to look after your house while you're away?","");
     },

    "ActivateSecurityIntent": function (intent, session, response) {
        //response.ask("Your security system will switch to out of home and the presence simulation will be activated. I'll protect your home", "Greeter", "Hello World!");
        var sessionAttributes = session.attributes;
        console.log("index id dans intent =>" + sessionAttributes.indexSecurity);
         if(sessionAttributes.indexSecurity == 0){
            var text = 'Your security system will switch to Out Mode in 2 min, do you also want to activate the presence simulation ?';
            var reprompt = '';
        }
        if(sessionAttributes.indexSecurity == 1){
            // TODO: Switch on presence simulation
              var text = 'The presence simulation is set up. I\'ll protect your home while your away. ';
              var reprompt = '';
        }
         if(sessionAttributes.indexSecurity == 2){
            response.tell("Enjoy your errands!");
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
            var text = 'Your ' + sessionAttributes.device + ' is covered by your home insurance against fire, water, theft and burglary but only at a discounted value. There is an option to cover it at replacement value';
            var reprompt = '';
        }
        if(sessionAttributes.indexCoverage == 1){
              var text = 'Discounted value takes into account the usage of your ' + sessionAttributes.device + ' and thus that it will be worth less every year. Replacement value means that you will be reimbursed exactly what you would need to be a brand new replacement';
              var reprompt = '';
        }
        if(sessionAttributes.indexCoverage == 2){
              var text = 'The option costs 5 additional euros per year, and it will also increase the coverage of your TV and your iPhone';
              var reprompt = '';
        }
        if(sessionAttributes.indexCoverage == 3){
              var text = 'Sure!......... Your ' + sessionAttributes.device + ' is now fully covered. You will be charged for it at the end of the month';
              var reprompt = '';
        }
         if(sessionAttributes.indexCoverage == 4){
            response.tell("good bye DeviceCoverage");
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
        // TODO: Switch off presence simulation
        response.tell("Welcome Home!");
     },

    "YesIntent": function (intent, session, response) {
        ActivateSecurityIntent(intent, session, response);
     },

    "StopIntent": function (intent, session, response) {
        response.tell("That was my pleasure.");
     },

    "AMAZON.HelpIntent": function (intent, session, response) {
        response.ask("Talk to Axe is here to help you, I can for example protect your home when you are away or tell you if your items are covered.", "How can I help you?");
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the Talk2MyHand skill.
    var talk2MyHand = new Talk2MyHand();
    talk2MyHand.execute(event, context);
};
