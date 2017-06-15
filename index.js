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
                            // richcardPromises.push( new Promise( ( resolve, reject ) => {
                            //     bernie.parseSentMessages( msg ).then(( {sender, response } ) => {
                            //         //put this response after previous one
                            //
                            //         if( Array.isArray( response ) ){
                            //             messages = messages.concat( response )
                            //         } else {
                            //             messages.push( response )
                            //         }
                            //
                            //         console.log("1111111111111messages111111111111111", messages);
                            //         resolve( messages )
                            //
                      			// }).catch( error => {
                            //           console.log( error );
                            //           reject( error )
                            //       } )
                            richcardPromises.push( new Promise( ( resolve, reject ) => {
                                bernie.parseSentMessages( msg ).then(( {sender, response } ) => {
                				          console.log( "@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@SHIT", sender, response );
                                  //put this response after previous one

                                  if( Array.isArray( response ) ){
                                      withRichcardsMessages = withRichcardsMessages.concat( response )
                                  } else {
                                      ‹withRichcardsMessages›.push( response )
                                  }

                                  console.log("1111111111111messages111111111111111", ‹withRichcardsMessages›);
                                  resolve( "richcard" )

            			           }).catch( error => {
                                  console.log( error );
                                  resolve( "nope" )
                              } )
                            } ) )
                        }
                    } )
                    console.log("YEAH ALRIGHT", richcardPromises);
                    Promise.all(richcardPromises)
                    .then( response => {
                      console.log(response);

                        for(let i = 0; i < response.length; i++ ){
                          if( response[i] == "richcard" ){
                            console.log( "PARTY PARTY PARTY PARTY PARTY PARTY PARTY PARTY" );
                            return res.json({
                                speech: speech,
                                displayText: speech,
                                messages: withRichcardsMessages,
                                source: 'berniewebhook'
                            });
                          }
                        }
                        console.log( "RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP" );

                        return res.json({
                            speech: speech,
                            displayText: speech,
                            messages: messages,
                            source: 'berniewebhook'
                        });
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
