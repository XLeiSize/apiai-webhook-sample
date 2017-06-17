const request = require('request');
const Utils = require('../helpers/utils.js');

const CUSTOM_HOST = process.env.CUSTOM_HOST || 'http://localhost:5345';

class Custom {
  constructor() {
    this.host = CUSTOM_HOST;
  }

  getEntityByName( type, name ) {
    let url = this.host + '/search/' + type + '/' + Utils.slugify( name );
    return new Promise((resolve, reject) => {
        let res;
        request(url, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
            console.log(" Custom promise url", url);
            let res = Utils.parseJSON(response.body)
            if( !res ) {
              reject('undefined');
            } else {
              resolve( res )
            }

        });
    });
  }

  getEntityById( type, id ) {
    let url = this.host + '/' + type + '/' + id;
    return new Promise((resolve, reject) => {
        request(url, (error, response) => {
            if (error) {
                console.log('Error sending message: ', error);
                reject(error);
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
                reject(new Error(response.body.error));
            }
           console.log("THIS IS FROM THOMAS BOULONGNE API", response.body);
            resolve(response.body);
        });
    });
  }

}

module.exports = Custom;
