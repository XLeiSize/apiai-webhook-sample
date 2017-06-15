'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Bernie = require('./Bernie.js');
const settle = require('promise-settle');

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
                    let hasRichcard = []
                    let richcardPromises = []
                    let withRichcardsMessages = messages;
                    messages.forEach( ( msg ) => {
                        if( msg.speech && msg.speech !== "" ) {
                            richcardPromises.push( new Promise( ( resolve, reject ) => {
                                bernie.parseSentMessages( msg ).then(( {sender, response } ) => {
                                  //put this response after previous one
                                  if( Array.isArray( response ) ){
                                      withRichcardsMessages = withRichcardsMessages.concat( response )
                                  } else {
                                      withRichcardsMessages.push( response )
                                  }
                                  console.log("&&&&&&&&&&& messages &&&&&&&&&&&&&", withRichcardsMessages);
                                  resolve( withRichcardsMessages );

            			           }).catch( error => {
                                  console.log( "$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$SHIT", error );
                                  resolve( error );
                              } )
                            } ) )
                        }
                    } )
                    console.log("YEAH ALRIGHT", richcardPromises);

                    settle(richcardPromises)
                    .then(function (results) {
                      results.forEach(function (result) {
                        if (result.isFulfilled()) {
                          console.log('Promise is fulfilled', result.value());
                        } else {
                          console.log('Promise is rejected', result.reason());
                        }
                      })
                    });
                    // Promise.all(richcardPromises)
                    // .then( values => {
                    //   console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", responses);
                    //   let resolved = values.filter(value => value.status === 'resolved');
                    //   let rejected = values.filter(value => value.status === 'rejected');
                    //   console.log(resolved);
                    //     for(let i = 0; i < values.length; i++ ){
                    //       if( values[i] == "richcard" ){
                    //         console.log( "PARTY PARTY PARTY PARTY PARTY PARTY PARTY PARTY" );
                    //         return res.json({
                    //             speech: speech,
                    //             displayText: speech,
                    //             messages: withRichcardsMessages,
                    //             source: 'berniewebhook'
                    //         });
                    //       }
                    //     }
                    //
                    //     console.log( "RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP RIP" );
                    //     return res.json({
                    //         speech: speech,
                    //         displayText: speech,
                    //         messages: messages,
                    //         source: 'berniewebhook'
                    //     });
                    //
                    // }).catch( error => {
                    //     console.log( "¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥¥*************¥**¥**********¥¥¥¥¥¥¥¥¥¥¥¥¥¥SHIT", error );
                    //
                    // } )



				}).catch( err => {
                    console.log("errr", err);
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
