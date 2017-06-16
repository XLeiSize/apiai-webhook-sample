'use strict';

const uuid = require('node-uuid');
const request = require('request');

const Template = require('./answers/TemplateEngine.js');

const Wikiart = require('./database/wikiart.js');
const Custom = require('./database/custom.js');

const ProcessData = require('./ProcessData.js');
const ResponseMessage = require('./answers/ResponseMessage.js');
const RichcardGenerator = require('./answers/RichcardGenerator.js');
const Utils = require('./helpers/utils.js');

const WikiAPI = require('wikijs');
const wiki = WikiAPI.default();

const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN || 'e2b37bad2f464a64a42e095ab5528e39';
const APIAI_LANG = process.env.APIAI_LANG || 'fr';


class Bernie {
	constructor( options ) {
		this.processData = new ProcessData(APIAI_ACCESS_TOKEN, {language: APIAI_LANG, requestSource: "webhook"});
		this.sessionIds = new Map();

		this.wikiart = new Wikiart();
		this.custom = new Custom();
	}

	apiaiRequest(options, actionRequested) {
		return new Promise((resolve, reject) => {
			this.options = options;

			this.sender = options.sender;

			if (!this.sessionIds.has(this.sender)) {
				this.sessionIds.set(this.sender, uuid.v4());
			}

			options.sessionId = this.sessionIds.get(this.sender);
			console.log(options.sessionId);

			this.processData.apiaiRequest( options ).then( ( response ) => {
				console.log('----------------------------------------------------------------------------------')
				// console.log('actionRequested', actionRequested);
				console.log('@@@@@@@@@response', response);
				console.log('@@@@@@@@@response.result.action', response.result.action);
				console.log('@@@@@@@@@options', options);
				if(actionRequested) {
					for (let i = 0; i < actionRequested.length; i++) {
						console.log('bbbbbbbbbbbbiatch', actionRequested[i], response.result.action);
						if (response.result.action == actionRequested[i]) {
							this.processAPIAIResult(response, options).then( ( {type, messages} ) => {
								console.log( "MDRR", type, messages );
								resolve( {type: type, sender: this.sender, response: messages} );
							}).catch( err => {
								reject(err);
							});
						} else {
							console.log(' lolilolilolilolilolilolilolilol ');
							reject('not richcard');
						}
					}
				}
				else {
					if( options.image ) {
						let url = options.image
						this.processData.imageRecognition( url ).then(( { source, painting } ) => {
							console.log("@@@@@@@@@@@@@@@@@@@@ HAVE PAINTING @@@@@@@@@@@@@@@@@@@@", painting);
							options.text = url;
							options.image = painting;

							this.processAPIAIResult(response, options).then( ( {type, messages} ) => {
								resolve( {type: type, sender: this.sender, response: messages} );
							}).catch( err => {
								reject(err);
							});
						}).catch(err => {
							options.text = err;
							options.image = '';
							reject(err);
						});
					} else {
						console.log('JPPPPPPPPPPPPPPPPPPP');
						this.processAPIAIResult(response, options).then( ( {type, messages} ) => {
							resolve( {type: type, sender: this.sender, response: messages} );
						}).catch( err => {
							reject(err);
						});
					}
				}
			}).catch( err => {
				console.log("XXXXXXXXXXXX ERROR XXXXXXXXXXXX", err);
				reject(err);
			});
		});
	}

	parseSentMessages( message ){
		let promises = [];
		let responseMessages = [];
		let options = {
			'sender': 'apiai',
			'text':  message.speech ? message.speech : "rien",
			'event': 'event'
		}
		this.sender = options.sender;

		if (!this.sessionIds.has(this.sender)) {
			this.sessionIds.set(this.sender, uuid.v4());
		}

		options.sessionId = this.sessionIds.get(this.sender);

		return new Promise((resolve, reject) => {

			this.apiaiRequest( options, ["richcards"] ).then(( {type, sender, response} ) => {
					console.log("PROMISE apiaiRequest RESPONSE", response);
					responseMessages = response;
					resolve( {sender: sender, response: responseMessages } );
			}).catch( e => { reject(e) } );
		});
	}


	// TRAITE LES DATAS
	processAPIAIResult(response) {
		return new Promise((resolve, reject) => {
			let sender = this.sender;

			if (this.isDefined(response.result) && this.isDefined(response.result.fulfillment)) {
				let responseText = response.result.fulfillment.speech;
				let responseData = response.result.fulfillment.data;
				let responseMessages = response.result.fulfillment.messages;
				let speech = responseMessages[responseMessages.length - 1 ].speech + " "

				console.log("999999999999999999999999999999999999999999999999999999");
				console.log(responseMessages);

				let action = response.result.action;

				if (this.isDefined(responseMessages) && responseMessages.length > 0) {

					let query;
					let keywords = action.split('_');
					console.log(keywords);

					if(action === "input.welcome"){
						let newResponse = new ResponseMessage( 2, {
							text: "Tu as besoin de moi ? 💁",
							quick_replies: [{
				 				content_type: "text",
				 				title: "Oui aide-moi 🙏",
				 				payload: "aide-moi"
				 			},{
				 				content_type: "text",
				 				title: "Non.",
				 				payload: "HELL NO"
				 			}]
						})
						console.log(newResponse);
						responseMessages.push(newResponse);
						resolve( {type: 'richContent', messages: responseMessages} );
					} else if(action === "hellno"){

						responseMessages.push({type: 3, imageUrl: "https://media.giphy.com/media/Ph8OWoJA2M3eM/giphy.gif"})
						resolve( {type: 'richContent', messages: responseMessages} );


					} else if(action === "ofcourse"){

						responseMessages.push({type: 3, imageUrl: "https://media.giphy.com/media/P0RWkdsRpK7ss/giphy.gif"})
						resolve( {type: 'richContent', messages: responseMessages} );

					} else if( keywords[0] == 'search' && ( keywords[1] == "artist" || keywords[1] == "artwork" || keywords[1] == "movement" ) ) {
						//DO REQUEST TO BACKOFFICE
						//:keyword/query
						let keyword = keywords[1]
						query = response.result.parameters[keyword];
						console.log(query);

						this.custom.getEntityByName(keyword, query)
						.then((result) => {

							this.entity = result.fields;
							let hasDescription = false;
							if ( this.entity != null ) {
								if( this.entity.content ) {
									for( let i = 0; i < this.entity.content.length; i++ ) {
										let content = this.entity.content[i]
										if( content.fields.type == "Description" ){
											hasDescription = true
											break;
										}
									}
									responseMessages = this.generateResponse(this.entity, action, responseMessages)
									// if( !hasDescription ) {
									// 	responseMessages = this.generateResponse(this.entity, action, responseMessages)
									// } else {
									// 	responseMessages = this.entityContentResponse(this.entity.content, "Description", responseMessages)
									// }
									resolve( {type: 'richContent', messages: responseMessages} );
								}

							}
						})
						.catch(e => {
							// IF CAN'T FIND IN CONTENTFUL -> GO WIKIART
							console.log("IF CAN'T FIND IN CONTENTFUL -> GO WIKIART");
							switch ( keyword ) {
								case 'artist': {
									this.wikiart.getArtistByName( query ).then((artist) => {
										if ( typeof artist == "object" ) {
											responseMessages = this.generateResponse( artist, action, responseMessages);

											resolve( {type: 'richContent', messages: responseMessages} );
										}
									})
									.catch( err => { reject(err) } );
								}
								break;
								case 'artwork': {
									this.wikiart.getArtworkByName( query ).then((artwork) => {
										if (typeof artwork == "object") {
											responseMessages = artwork;
											resolve( {type: 'richContent', messages: responseMessages} );
										} else {
											reject();
										}
									})
								}
								break;
								case 'movement': {
									this.wikiart.getMovementByName( query ).then(( movement ) => {
										if ( typeof movement == "object" ) {
											responseMessages = this.generateResponse( movement, action, responseMessages);
											resolve( {type: 'richContent', messages: responseMessages} );
										}
									})
									.catch( err => { reject(err) } );
								}
								break;
								default: break;
							}
						});


					} else if ( keywords[0] == "richcards" ) {

						console.log("IN RICHCARDS STUFF");
						let promises = [];

						const keys = [ 'artists', 'artworks', 'movements' ];
						const key = [ 'artist', 'artwork', 'movement' ];
						for( let i = 0; i < key.length; i++ ){
							if( response.result.parameters[ keys[i] ].length > 1 ) {
								const richcards = response.result.parameters[ keys[i] ];

								for (let j = 0; j < richcards.length; j++) {
									console.log(key[i], richcards[j]);
									promises.push(
										this.custom.getEntityByName(key[i], richcards[j])
									);
								}

								Promise.all(promises)
								.then( results => {
									let richcardPromises = [];
									for (let j = 0; j < results.length; j++) {
										const entity = results[j];
										console.log("&&&&&&&&&&&&&&&&&&&&&&&", entity);
										if (typeof entity == 'object') {
											richcardPromises.push(new Promise( reso => {
												console.log('key[i]', key[i]);
												response = this.createRichcard(entity, key[i], responseMessages)
												console.log(" ------------------------ R-E-S-P-O-N-S-E MSG ------------------------ ", responseMessages);
												reso('success Custom');

											}));
										}
										else {
											console.log('entity not found in custom DB');
											const name = entity.fields.slug;

											console.log('entity to search in wikiart', name);

											richcardPromises.push( new Promise( reso => {
												switch(key[i]) {
													case 'artist':
														this.wikiart.getArtistByName( name ).then((artist) => {
															if (typeof artist == "object") {
																responseMessages = this.createRichcard(artist, key[i], responseMessages);
															}
															reso('success Wikiart');
														})
														.catch( e => { reject(e) });
														break;
													case 'artwork':
														this.wikiart.getArtworkByName( name ).then(( artwork ) => {
															if (typeof artwork == "object") {
																responseMessages = this.createRichcard(artwork, key[i], responseMessages);
															}
															reso('success Wikiart');
														})
														.catch( e => { reject(e) });
														break;
													case 'movement':
														this.wikiart.getMovementByName( name ).then(( movement ) => {
															if (typeof artwork == "object") {
																responseMessages = this.createRichcard(movement, key[i], responseMessages);
															}
															reso('success Wikiart');
														})
														.catch( e => { reject(e) });
														break;
													default:
														break;
												}
											}));
										}
									}

									Promise.all(richcardPromises)
									.then( response => {
										console.log(" ------------------------ RICHCARD R-E-S-P-O-N-S-E ------------------------ ", response);
										resolve( {type: 'richContent', messages: responseMessages} );
									})
									.catch( e => {
										console.log(e)
										reject(e);
									});
								})
								.catch(e => {
									console.log('------------------------ Error in promise richcard ------------------------', e);
								});
							}
						}
					} else if ( keywords[0] == "artist" || keywords[0] == "artwork" || keywords[0] == "movement" ) {
						let query = response.result.parameters[keywords[0]]
						this.handleEntityWithParams( query, keywords[0], keywords[1], action, responseMessages ).then( ( messages ) => {
							resolve( {type: 'richContent', messages: messages } );
						} ).catch( err => {
							console.log(err);
							reject(err);
						});

					} else if ( keywords[1] === 'url' ) {
						let image = response.result.resolvedQuery;
						console.log("url", image);
						this.processData.imageRecognition( image ).then(( { source, painting } ) => {
							console.log("@@@@@@@@@@@@@@@@@@@@ HAVE PAINTING IN PROCESS @@@@@@@@@@@@@@@@@@@@" );

							responseMessages = this.createImageRequestResponse( source, painting, responseMessages );
							console.log("ressssspooooooooonnnnnnnsssseeeeeeeeemsg", responseMessages);
							resolve( {type: 'richContent', messages: responseMessages} );
						}).catch( err => {
							console.log(err);
							reject(err);
						});
					} else {
						resolve( {type: 'richContent', messages: responseMessages} );
					}

				}
				// else if (this.isDefined(responseText)) {
				// 	resolve( {type: 'text', messages: responseText } )
				// }
			}
		});
	}

	handleEntityWithParams( query, keyword, params, action, responseMessages ) {
		console.log("|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||", params);
		let hasPromise = false;
		return new Promise( (resolve, reject) => {
			this.custom.getEntityByName(keyword, query)
			.then((result) => {
				this.entity = result.fields;
				switch( params ){
					case 'image': // PORTRAIT OR IMAGE
						responseMessages = this.entityImageResponse( this.entity, responseMessages )
						console.log( "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", responseMessages);
						break;
					case 'artistName':
						responseMessages = this.generateResponse( this.entity, action, responseMessages )
						console.log( "ARTISTNAME %%%%%%%%%%%%%%%%%%", responseMessages );
						let moreInfoOpening = {};
						moreInfoOpening.type = 2;
						moreInfoOpening.text = 'Tu vois qui c\'est ?';
						moreInfoOpening.quick_replies = [{
							content_type: "text",
							title: "Bien sûr 💁",
							payload: "Bien sûr que je sais"
						},{
							content_type: "text",
							title: "mmmh nope 😓",
							payload: "Qui est " + this.entity.author.fields.firstName + " " + this.entity.author.fields.lastName
						}];
						responseMessages.push(moreInfoOpening);
						break;
					case 'context':
						responseMessages = this.entityContentResponse(this.entity, "Description", responseMessages)
						break;
					case 'additionalContent':
						responseMessages = this.entityContentResponse(this.entity, "AdditionalContent", responseMessages)
						break;
					case 'movement':
						responseMessages = this.generateResponse( this.entity, action, responseMessages )
						let movements = this.entity.movements
						// for( let i = 0; i < movements.length; i++ ){
						// 	console.log(action);
						// 	console.log(movements[i]);
						// 	responseMessages = this.createRichcard(movements[i], action, responseMessages)
						// }
						console.log( "%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%" , responseMessages );
						break;
					case 'mainArtists':
					case 'contemporary':
					case 'influencers':
						let artists = [];
						hasPromise = true
						if( params === 'contemporary' ) {
							//GET main artists of movements which this one is associated with
							this.entity.movements
							for (let i = 0; i < this.entity.movements.length; i++) {
								artists = artists.concat( this.entity.movements[i].fields.mainArtists )
							}
						} else {
							artists = this.entity[params]
						}
						console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  ARTISTS", artists);
						this.createRichcardsList( artists, 'artist', query, action, responseMessages )
						.then( responseMessages => {
							resolve(responseMessages)
						} )
						.catch( error => reject(error) );
						break;
					case 'mainArtworks':
						let artworks = this.entity[params];
						hasPromise = true
						console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  ARTWORKS", artworks);
						this.createRichcardsList( artworks, 'artwork', query, action, responseMessages )
						.then( responseMessages => {
							resolve(responseMessages)
						} )
						.catch( error => reject(error) );
						break;
					default:
						responseMessages = this.generateResponse( this.entity, action, responseMessages )
						console.log( "%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%" , responseMessages );
						break;

				}
				if( !hasPromise ) {
					console.log(responseMessages);
					resolve( responseMessages );
				}
			})
		} )

	}

	createRichcardsList( list, type, query, action, responseMessages ) {
		let promises = [];
		for( let i = 0; i < list.length; i++ ){
			if(list[i] !== query){
				promises.push(
					this.custom.getEntityByName(type, list[i])
				)
			}
		}
		return new Promise( (resolve, reject) => {
			Promise.all(promises)
			.then( results => {
				let richcardPromises = [];
				for (let j = 0; j < results.length; j++) {
					const entity = results[j]
					this.createRichcard(entity, type, responseMessages)
					console.log("3####3#3#####3#3333##3###333##3###333#33##333######333333##", responseMessages);
				}
				console.log("%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%", responseMessages);
				resolve( responseMessages );
			}).catch( err => {
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", err);
				// WIKIART
				let wikiartPromises = [];
				let length = list.length > 5 ? 5 : list.length
				for( let i = 0; i < length; i++ ) {
					if (list[i] !== query) {
						switch ( type ) {
							case 'artist':
								console.log(list[i]);
								wikiartPromises.push(this.wikiart.getArtistByName( list[i] ))
								break;
							case 'artwork':
								wikiartPromises.push(this.wikiart.getArtworkByName( list[i] ))
								break;
						}
					}
				}
				Promise.all(wikiartPromises)
				.then((results) => {
					console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&++++++++++++++++++++++++++++", results);
					for (let j = 0; j < results.length; j++) {
						if ( typeof results[j] == "object" ) {
							this.createRichcard(results[j], type, responseMessages)
						}
					}
					console.log(responseMessages);
					resolve( responseMessages );
				})
				.catch( error => { reject(error) } );
					console.log("ERRRRRROOOOOOROROROROROROROROR richcards/", error)
					reject(error);
			})
		})
	}

	createImageRequestResponse( source, image, responseMessages ) {
		let title, artistName, year, movement;

		if( source === 'wikiart' ) {
			title = image.title
			artistName = image.artistName
			year = " en " + image.yearAsString
			movement = "néo-géo"
		} else {
			title = image.title
			artistName = image.author.fields.firstName ? image.author.fields.firstName + " " +  image.author.fields.lastName : image.author.fields.lastName

			if( image.startYear && image.endYear && image.startYear < image.endYear ) {
				year = " entre " + image.startYear + " et " + image.endYear
			} else {
				year = " en " +image.endYear
			}
			if( image.author.fields.movements[0] || image.movements[0] ){
				movement = image.author.fields.movements[0].fields.name
			}
		}
		responseMessages[responseMessages.length - 1].speech += " '" + title + "', réalisé par " + artistName + year + " 🤓";

		responseMessages.push( new ResponseMessage(3, {imageUrl: "https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif"} ) );

		const openingText = [
			'Tu veux en savoir plus sur quoi ?',
			'Qu\'est-ce qui t\'intéresse ?'
		]

		let options = {}
		options.text = openingText[Math.floor(openingText.length * Math.random())];
		options.quick_replies = [{
			content_type: "text",
			title: "l'oeuvre 🖌️",
			payload: "Qu'est ce que " + artistName + " voulais dire avec "  + title
		},{
			content_type: "text",
			title: "l'artiste 👑",
			payload: "Qui est " + artistName
		}];

		if( movement ){
			options.quick_replies.push( {
				content_type: "text",
				title: "le mouvement 💫",
				payload: "Qu'est ce que " + movement
			} )
		}
		let moreInfoOpening = new ResponseMessage( 2, options);
		responseMessages.push(moreInfoOpening);
		return responseMessages;
	}

	createRichcard(entity, category, responseMessages) {
		const msg = RichcardGenerator.richcard(entity, category);
		console.log("@@@@@@", msg);
		responseMessages.push(msg);

		return responseMessages;
	}

	//GENERATE RESPONSE FROM TEMPLATE
	generateResponse( entity, action, responseMessages ) {
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%action", action);
		const template = new Template(action, entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%template", template);


		let newMsg = new ResponseMessage(0, {speech: template.message});

		responseMessages.push(newMsg);

		if( action == "search_artist" && entity.movements && template.template && template.template.params.indexOf('movements') > -1) {
			console.log("MOVEMENTS search_artist MORE");
			let moreInfoOpening = new ResponseMessage( 2,
				{ text : 'Tu sais ce que c\'est ?',
					quick_replies : [{
						content_type: "text",
						title: "Carrément 🎓",
						payload: "Bien sûr que je sais"
					},{
						content_type: "text",
						title: "Pas vraiment 🤔",
						payload: "Qu'est-ce que le " + entity.movements[0].fields.name
					}]
				});

			responseMessages.push(moreInfoOpening);
		}
		else if( !template.message && Array.isArray(entity.content) && entity.content.length > 0 ) {
			responseMessages = this.entityContentResponse(entity, "Description", responseMessages);
			for( let i = 0; i < entity.content.length; i++ ) {
				let content = entity.content[i]
				console.log("§#§#§#§#§#§#§#§#§#§#§#", content);
				 if ( content.fields.type == "AdditionalContent" ) {
						const name =  ( entity.name ) ? entity.name : ( entity.lastName ) ? entity.firstName + " " + entity.lastName : entity.title
						console.log(name);
						const openingText = [
							'Veux-tu en savoir plus ? 😏',
							'Je continue ?',
							'Ça va ou tu veux en savoir plus ? '
						]
						const acceptText = [
							'Dis m\'en plus !',
							'Aller 👍'
						]
						const declineText = [
							'C’était clair 👌',
							'Ça ira ✋'
						]

						let moreInfoOpening = new ResponseMessage( 2,
							{ text : openingText[Math.floor(openingText.length * Math.random())],
								quick_replies : [{
					 				content_type: "text",
					 				title: acceptText[Math.floor(acceptText.length * Math.random())],
					 				payload: "Dis m'en plus sur " + name
					 			},{
					 				content_type: "text",
					 				title: declineText[Math.floor(declineText.length * Math.random())],
					 				payload: "ça ira mon coco"
					 			}]
							});

			 			responseMessages.push(moreInfoOpening);
						break;
				 }
			}
		}

		return responseMessages;
	}

	// PARSE AND GENERATE RESPONSE FROM ENTITY.CONTENT ARRAY
	entityContentResponse(entity, keyword, responseMessages) {
		let content = entity.content
		for( let i = 0; i < content.length; i++ ){
			content = content[i].fields
			if ( content.type === keyword ) {
				content.content.forEach( function( description ) {
					description = description.fields
					if( description.body ) {
						responseMessages.push( new ResponseMessage(0, {speech: description.body} ) );
					}
					if( description.media ) {
						responseMessages.push( new ResponseMessage(3, {imageUrl: "https:" + description.media[Math.floor(description.media.length * Math.random())].fields.file.url} ) );
					}
				} )
			}
		}
		// si Description et est une collection, montrer les images
		if( keyword === "Description" && entity.isACollection ){
			responseMessages = this.entityImageResponse( entity, responseMessages )
		}

		return responseMessages
	}


	entityImageResponse( entity, responseMessages ) {
		let images = entity.images ? entity.images : entity.portrait
		if( images.length > 1 ) {
			images.forEach( function( image ){
				responseMessages.push(
					new ResponseMessage( 1, {
					title: image.fields.title,
					imageUrl: "https:" + image.fields.file.url
				} ))
			})
		} else {
			let image = Array.isArray( images ) ? images[0] : images
			responseMessages.push(
				new ResponseMessage( 3, {
				imageUrl: "https:" + image.fields.file.url
			} ))
		}
		return responseMessages
	}

	isDefined(obj) {
		if (typeof obj == 'undefined') {
			return false;
		}

		if (!obj) {
			return false;
		}

		return obj != null;
	}

	sleep(delay) {
		return new Promise((resolve, reject) => {
			setTimeout(() => resolve(), delay);
		});
	}

}


module.exports = Bernie;
