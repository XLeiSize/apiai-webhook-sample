const apiai = require('apiai');
const request = require('request');
const vision = require('@google-cloud/vision');
const fs = require('fs');

const Wikiart = require('./database/wikiart.js');
const Custom = require('./database/custom.js');
const Vuforia = require('./database/vuforia.js');
const Utils = require('./helpers/utils.js');


const visionClient = vision({
  projectId: 'protogobbot',
  keyFilename: 'protogobbot.json'
});
let tempImg = 'temporary.jpg'

class ProcessData {
  constructor( apiaiToken, options ) {
    //connection to API.AI
    this.apiAiService = apiai(apiaiToken, options);
  }

  apiaiRequest(options) {

    let sender = options.sender;

    let apiaiRequest = this.apiAiService.textRequest(options.text,
        {
            sessionId: options.sessionId,
            originalRequest: {
                data: options.event,
                source: "webhook"
            }
        });
    return new Promise((resolve, reject) => {
    //get response from api.ai
      apiaiRequest.on('response', (response) => {
          resolve( response );
      });
      apiaiRequest.on('error', (error) => reject(error));
      apiaiRequest.end();
    });

  }

  apiaiRequestWithContext(options) {

    let sender = options.sender;

    let apiaiRequest = this.apiAiService.textRequest(options.text,
        {
            sessionId: options.sessionId,
            originalRequest: {
                data: options.event,
                source: "facebook"

            }
        });
    return new Promise((resolve, reject) => {
    //get response from api.ai
      apiaiRequest.on('response', (response) => {
          resolve( response );
      });
      apiaiRequest.on('error', (error) => reject(error));
      apiaiRequest.end();
    });

  }

  imageRecognition( url ) {
    return new Promise((resolve, reject) => {
      this.download( url, tempImg, function(){
        let wikiart =  new Wikiart();
        let custom =  new Custom();
        let vuforia = new Vuforia();
        vuforia.recognitionQuery( tempImg ).then( ( name ) => {

          if( name ){
            //PATTERN MUST BE slug_id
            let ids = name.split('_')
            let slug = ids[0]
            custom.getEntityByName('artwork', slug)
            .then((result) => {

              let entity = result.fields;

              if ( entity != null ) {
                resolve( { source: 'custom', painting: entity } );
              }
            }).catch( err =>{
              reject('IMAGE NOT RECOGNIZED')
            } )

          } else {
            reject('IMAGE NOT RECOGNIZED')
          }
        }).catch( err => {
          visionClient.detectLogos( tempImg, {verbose: true}, function( err, logos, apiResponse ) {
            //get response from api.ai
            //send user's text to api.ai service
            if( logos && logos[0] && logos[0].desc ){
              console.log( "###############################CLOUDVISION_LOGOS", logos );
              wikiart.getPaintingByName( logos[0].desc ).then( (painting ) => {
                  resolve( { source: 'wikiart', painting: painting } );
              })
            } else {
              reject( 'IMAGE NOT RECOGNIZED' );
            }
          } );
        } );
      });
    });
  }

  download(uri, filename, callback){
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
  }

}

module.exports = ProcessData;
