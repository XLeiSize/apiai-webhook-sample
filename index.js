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
					console.log("§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±§±", type, messages);
                    console.log('result: ', speech);
                    let richcardPromises = []
                    let withRichcardsMessages = messages;
                    //NEED TO PREVENT SENDING TWICE
                    messages.forEach( ( msg ) => {
                        console.log("MSGMSGMSGMSGMSGMSGMSG", msg);
                        if( msg.speech && msg.speech !== "" ){
                            richcardPromises.push( new Promise( ( resolve, reject ) => {
                                bernie.parseSentMessages( msg ).then(( {sender, response } ) => {
                				          console.log( "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@SHIT", sender, response );
                                  //put this response after previous one

                                  if( Array.isArray( response ) ){
                                      withRichcardsMessages = withRichcardsMessages.concat( response )
                                  } else {
                                      withRichcardsMessages.push( response )
                                  }

                                  console.log("&&&&&&&&&&& messages &&&&&&&&&&&&&", withRichcardsMessages);
                                  resolve( "richcard" )

            			           }).catch( error => {
                                  console.log( "<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", error );
                                  resolve( "nope" )
                                  if( !msg ){
                                    reject('OH HEEEEELL NO');
                                  }
                              } )
                            } ) )
                        }
                    } )
                    console.log("YEAH ALRIGHT", richcardPromises);
                    Promise.all(richcardPromises)
                    .then( responses => {
                      console.log(responses);
                      let  answerOpt = {
                          speech: speech,
                          displayText: speech,
                          messages: messages,
                          source: 'berniewebhook'
                      }

                        for(let i = 0; i < responses.length; i++ ){
                          if( responses[i] == "richcard" ){
                            console.log( "PARTY PARTY PARTY PARTY PARTY PARTY PARTY PARTY" );
                            answerOpt.messages = withRichcardsMessages;
                          } else {
                            console.log( "RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP" );

                          }
                        }

                        return res.json(answerOpt);

                    }).catch( error => {
                        console.log( error );

                    } )



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

function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}
