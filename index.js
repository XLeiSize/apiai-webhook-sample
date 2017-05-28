'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Bernie = require('./Bernie.js');
let bernie = new Bernie();


const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = 'empty speech';

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {
                speech = '';

                if (requestBody.result.fulfillment) {
                    speech += requestBody.result.fulfillment.speech;
                    speech += ' ';
                }

                if (requestBody.result.action) {
                    speech += 'action: ' + requestBody.result.action;
                }

                bernie.processAPIAIResult(requestBody).then(( {type, messages} ) => {
					console.log("XXXXXXXXXXXXXXXXXXXX", type, messages);
                    console.log('result: ', speech);

                    messages.forEach( ( msg ) => {
                        console.log(msg);
                        if( msg.speech && msg.speech !== "" ){
                            bernie.parseSentMessages( msg ).then(( {sender, response } ) => {
                				console.log( "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@SHIT", sender, response );
                			}).catch( error => {
                                console.log( error );
                            } )
                        }
                    } )

                    return res.json({
                        speech: speech,
                        displayText: speech,
                        messages: messages,
                        source: 'berniewebhook'
                    });

				}).catch( err => {
                    console.log("errr", err);
                    reject(err);
                });;

            }
        }


        // "fulfillment": {
        //     "speech": " action: search_artist",
        //     "source": "berniewebhook",
        //     "displayText": " action: search_artist",
        //     "messages": [
        //     {
        //       "type": 0,
        //       "speech": " action: search_artist"
        //     },
        //     {
        //       "type": 1,
        //       "speech": " MDR"
        //     }
        //     ],
        //     "data": {
        //     "hologramme": "lol",
        //     "shit": true
        //     }
        // }


    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
