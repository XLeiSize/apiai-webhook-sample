'use strict';

const uuid = require('node-uuid');
const request = require('request');

const Template = require('./TemplateEngine.js');

const Wikiart = require('./database/wikiart.js');
const Custom = require('./database/custom.js');

const TemplateEngine = require('./TemplateEngine.js');

const ProcessData = require('./ProcessData.js');
const Utils = require('./helpers/utils.js');

const WikiAPI = require('wikijs');
const wiki = WikiAPI.default();

const APIAI_ACCESS_TOKEN = process.env.APIAI_ACCESS_TOKEN || 'ede1c18802a34ed68e8ca30aa2a69122';
const APIAI_LANG = process.env.APIAI_LANG || 'fr';


class Bernie {
	constructor( options ) {
		this.processData = new ProcessData(APIAI_ACCESS_TOKEN, {language: APIAI_LANG, requestSource: "fb"});
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
			'text':  message.speech,
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
		console.log("promisespromisespromisespromisespromisespromises", promises);
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


				let action = response.result.action;

				if (this.isDefined(responseMessages) && responseMessages.length > 0) {

					let query;
					let keywords = action.split('_');
					console.log(keywords);

					if( keywords[0] == 'search' && ( keywords[1] == "artist" || keywords[1] == "artwork" || keywords[1] == "movement" ) ) {
						//DO REQUEST TO BACKOFFICE
						//:keyword/query
						let keyword = keywords[1]
						query = response.result.parameters[keyword];
						console.log(query);

						this.custom.getEntityByName(keyword, query)
						.then((result) => {

							this.entity = result.fields;

							if ( this.entity != null ) {
								responseMessages = this.generateResponse( this.entity, action, responseMessages);
								resolve( {type: 'richContent', messages: responseMessages} );
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
								console.log('richcards ' + keys[i] + ' ---> ', richcards);

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
												switch(key[i]) {
													case 'artist':
														responseMessages = this.createArtistRichcard(entity, action, responseMessages);
														break;
													case 'artwork':
														responseMessages = this.createArtworkRichcard(entity, action, responseMessages);
														break;
													case 'movement':
														responseMessages = this.createMovementRichcard(entity, action, responseMessages);
														break;
													default:
														break;
												}
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
																responseMessages = this.createArtistRichcard(artist, action, responseMessages);
															}
															reso('success Wikiart');
														})
														.catch( e => { reject(e) });
														break;
													case 'artwork':
														this.wikiart.getArtworkByName( name ).then(( artwork ) => {
															if (typeof artwork == "object") {
																responseMessages = this.createArtistRichcard( artwork , action, responseMessages);
															}
															reso('success Wikiart');
														})
														.catch( e => { reject(e) });
														break;
													case 'movement':
														this.wikiart.getMovementByName( name ).then(( movement ) => {
															if (typeof artwork == "object") {
																responseMessages = this.createArtistRichcard( movement , action, responseMessages );
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
		return new Promise( (resolve, reject) => {
			this.custom.getEntityByName(keyword, query)
			.then((result) => {
				this.entity = result.fields;
				switch( params ){
					case 'image': // PORTRAIT OR IMAGE
						let images = this.entity.images ? this.entity.images : this.entity.portrait
						if( images.length > 1 ) {
							images.forEach( function( image ){
								responseMessages.push({
									type: 1,
									title: image.fields.title,
									imageUrl: "https:" + image.fields.file.url
								})
							})
						} else {
							let image = Array.isArray( images ) ? images[0] : images
							responseMessages.push({
								type: 3,
								imageUrl: "https:" + image.fields.file.url
							})
						}
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
						this.entity.content.forEach( function( content ) {
							content  = content.fields
							if ( content.type === 'Description' ){
								content.content.forEach( function( description ) {
									description = description.fields
									if( description.body ) {
										responseMessages.push( {
											type: 0,
											speech: description.body
										} )
									}
									if( description.media ) {
										responseMessages.push( {
											type: 3,
											imageUrl: "https:" + description.media[Math.floor(description.media.length * Math.random())].fields.file.url
										} )
									}
								} )
							}
						} )
						break;
					case 'movement':
						responseMessages = this.generateResponse( this.entity, action, responseMessages )
						let movements = this.entity.movements
						for( let i = 0; i < movements.length; i++ ){
							this.createMovementRichcard(movements[i], action, responseMessages)
						}
						console.log( "%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%" , responseMessages );


						break;
					default:
						responseMessages = this.generateResponse( this.entity, action, responseMessages )
						console.log( "%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%" , responseMessages );
						break;

				}

				console.log(responseMessages);
				resolve( responseMessages );

			})
		} )

	}

	createImageRequestResponse( source, image, responseMessages ) {
		console.log("immmmmmmmaaaaaaageeeeeeeee", image);
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
		responseMessages.push( { type: 3, imageUrl: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif' } );

		let moreInfoOpening = {};
		moreInfoOpening.type = 2;
		moreInfoOpening.text = 'Tu veux en savoir plus sur quoi ?';
		moreInfoOpening.quick_replies = [{
			content_type: "text",
			title: "l'oeuvre 🖌️",
			payload: "Qu'est ce que " + artistName + " voulais dire avec "  + title
		},{
			content_type: "text",
			title: "l'artiste 👑",
			payload: "Qui est " + artistName
		}];

		if( movement ){
			moreInfoOpening.quick_replies.push( {
				content_type: "text",
				title: "le mouvement 💫",
				payload: "Qu'est ce que " + movement
			} )
		}
		responseMessages.push(moreInfoOpening);
		return responseMessages;
	}

	createArtistRichcard(artist, action, responseMessages) {
		let imageUrl, title;
		let birthdate = '';

		if( typeof artist.fields == "object" ){
			artist = artist.fields
			title = artist.firstName ? artist.firstName + ' ' + artist.lastName : artist.lastName;

			if(artist.yearOfBirth) {
				birthdate = artist.yearOfBirth;
				if(artist.monthOfBirth) {
					birthdate = artist.monthOfBirth + '/' + birthdate;
					if(artist.dayOfBirth) {
						birthdate = artist.dayOfBirth + '/' + birthdate;
					}
				}
			}
			imageUrl = "https:" + artist.portrait.fields.file.url;
		} else {
			title = artist.artistName;

			if(artist.year_of_birth) {
				birthdate = artist.year_of_birth;
				if(artist.month_of_birth) {
					birthdate = artist.month_of_birth + '/' + birthdate;
					if(artist.day_of_birth) {
						birthdate = artist.day_of_birth + '/' + birthdate;
					}
				}
			}
			imageUrl = artist.image
		}


		const newMsg = {
			type: 1,
			title: title,
			subtitle: birthdate,
			imageUrl: imageUrl,
			buttons: [
				{
					type: 'postback',
					title: 'Qui est-ce ?',
					payload: 'Qui est ' + title
				}
			]
		};

		if(newMsg.title && (newMsg.subtitle || newMsg.imageUrl))
			responseMessages.push(newMsg);

		return responseMessages;
	}

	createArtworkRichcard(artwork, action, responseMessages) {
		let date, url, title
		if( typeof artwork.fields == "object" ){
			artwork = artwork.fields
			date = artwork.endYear
			url = 'https:' + artwork.images[0].fields.file.url
		} else {
			date = artwork.year
			url = artwork.image
		}
		title = artwork.title

		const newMsg = {
			type: 1,
			title: title,
			subtitle: date,
			imageUrl: url,
			buttons: [
				{
					type: 'postback',
					title: 'Dis m\'en plus',
					payload: 'Qu\'est ce que ' + title
				}
			]
		};

		if( newMsg.title && ( newMsg.subtitle || newMsg.imageUrl ) )
			responseMessages.push(newMsg);

		return responseMessages;
	}

	createMovementRichcard( movement, action, responseMessages) {
		console.log(movement);
		if( typeof movement.fields == "object" ){
			movement = movement.fields
		}
		const name = movement.name;

		const endYear = ( movement.endYear !== undefined ) ? movement.endYear : 'Actuel'

		const newMsg = {
			type: 1,
			title: name,
			subtitle: movement.startYear + " - " + movement.endYear,
			imageUrl: "https:" + movement.image.fields.file.url,
			buttons: [
				{
					type: 'postback',
					title: 'C\'est quoi ?',
					payload: 'Qu\'est ce que ' + name
				}
			]
		};

		if(newMsg.title && (newMsg.subtitle || newMsg.imageUrl))
			responseMessages.push(newMsg);

		return responseMessages;
	}

	generateResponse( entity, action, responseMessages ) {
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%entity", entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%action", action);
		const template = new Template(action, entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%template", template);

		let newMsg = { type: 0, speech: template.message };
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%newMsg", newMsg);


		responseMessages.push(newMsg);

		if( action == "search_artist" && entity.movements && template.template && template.template.params.indexOf('movements') > -1) {
			console.log("MOVEMENTS search_artist MORE");
			let moreInfoOpening = {};

			moreInfoOpening.text = 'Tu sais ce que c\'est ?';
			moreInfoOpening.type = 2;
			moreInfoOpening.quick_replies = [{
				content_type: "text",
				title: "Carrément 🎓",
				payload: "Bien sûr que je sais"
			},{
				content_type: "text",
				title: "Pas vraiment 🤔",
				payload: "Qu'est-ce que le " + entity.movements[0].fields.name
			}];

			responseMessages.push(moreInfoOpening);
		}
		else if(Array.isArray(entity.content) && entity.content.length > 1 ) {
			console.log("entity.content");
			console.log(entity.content);
			const contents = entity.content;
			for (let i = 0; i < contents.length; i++) {
				const cont = contents[i];
				if( cont.fields.type == "additionalContents" ){
					if(cont.content[0].fields.body) {
						responseMessages.push({ type: 0, speech: cont.content[0].fields.body });
					}
					if(cont.url) {
						responseMessages.push({ type: 3, imageUrl: 'https:' + cont.url });
					}
				}
			}
		}
		return responseMessages;
	}

	createMovementResponseMessage(movement, action, responseMessages) {

		const template = new Template(action, movement);
		let newMsg = { type: 0, speech: template.message };
		responseMessages.push(newMsg);

		if(Array.isArray(movement.additional_contents)) {
			const contents = movement.additional_contents;

			for (let i = 0; i < contents.length; i++) {
				const cont = contents[i];
				if(cont.text) {
					responseMessages.push({ type: 0, speech: cont.text });
				}
				if(cont.url) {
					responseMessages.push({ type: 3, imageUrl: cont.url });
				}
			}
		}

		return responseMessages;
	}

	createArtworkResponseMessage(artwork, action, responseMessages) {

		const template = new Template(action, artwork);
		let newMsg = { type: 0, speech: template.message };
		responseMessages.push(newMsg);

		if(Array.isArray(artwork.additional_contents)) {
			const contents = artwork.additional_contents;

			for (let i = 0; i < contents.length; i++) {
				const cont = contents[i];
				if(cont.text) {
					responseMessages.push({ type: 0, speech: cont.text });
				}
				if(cont.url) {
					responseMessages.push({ type: 3, imageUrl: cont.url });
				}
			}
		}

		return responseMessages;
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
