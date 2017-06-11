// load module
const vufo = require('vuforiajs');
const request = require('request');
const PythonShell = require('python-shell');



let options = {
    // provision_access_key
    'accessKey': '58cdd20f6c529853080e9b40e26aad0e83ba8cbb',
    // server_secret_key
    'secretKey': 'e04ef47448b678c3cf1480d520d0c1aa6052b163'
};

class Vuforia {

  constructor() {
    // init client with valid credentials
    this.client = vufo.client(options);
    // util for base64 encoding and decoding
    this.util = vufo.util();
  }

  addTarget( name, image ) {
    var target = {

    // name of the target, unique within a database
    'name':name,
    // width of the target in scene unit
    'width': 32.0,
    // the base64 encoded binary recognition image data
    'image': this.util.encodeFileBase64( image ),
    // indicates whether or not the target is active for query
    'active_flag': true,
    // the base64 encoded application metadata associated with the target
    'application_metadata': this.util.encodeBase64( name )
};
    return new Promise((resolve, reject) => {
      this.client.addTarget(target, function (error, result) {
        if (error) {
             reject(error);
        } else {
            console.log(result);
            resolve(result);
        }
      });
    });
  }

  listTargets() {
    return new Promise((resolve, reject) => {
      this.client.listTargets(function (error, result) {
        if (error) {
             reject(error);
        } else {
             resolve(result);
        }

      });
    });
  }

  retrieveTarget( id ) {
    return new Promise((resolve, reject) => {
      this.client.retrieveTarget( id, function (error, result) {
        if (error) {
             reject(error);
        } else {
             resolve(result);
        }
      });
    });
  }

  updateTarget( id, update ){
    return new Promise((resolve, reject) => {
      this.client.updateTarget( id, update, function (error, result) {
        if (error) {
             reject(error);
        } else {
            // util.decodeBase64(application_metadata);
            resolve(result);
        }

      });
    });
  }

  deleteTarget( id ) {
    return new Promise((resolve, reject) => {
      this.client.deleteTarget( id, function (error, result) {
        if (error) {
             reject(error);
        } else {
            resolve(result);
        }
      });
    });
  }

  recognitionQuery( image ) {
    //CLIENT ACCESS KEY
    let name;
    options = {
        // provision_access_key
        'accessKey': '1847a94da3891a1db743556d98be9e7354355e50',
        // server_secret_key
        'secretKey': 'a3e373cd2fad3382f32cdaf26988c2c68ce40c54'
    };

    let pythonOptions = {
      mode: 'json',
      scriptPath: __dirname + '/python/',
      args: ['--access-key', options.accessKey, '--secret-key', options.secretKey, image ]
    };

    PythonShell.defaultOptions = { scriptPath: __dirname + '/python/' };

    return new Promise((resolve, reject) => {
      PythonShell.run('cloud_query.py', pythonOptions, function (err, results) {
        if (err) reject(err);
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
        if( results[0].results.length > 0) {
          name = results[0].results[0].target_data.name;
          resolve(name);
        } else {
          reject('error');
        }
      });
    });
  }


}

module.exports = Vuforia;
