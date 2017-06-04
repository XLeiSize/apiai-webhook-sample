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
							resolve( {type: 'richContent', sender: this.sender, response: {type:'0', speech: options.text }} );
						}
					}
				}
				else {
					if( options.image ) {
						let url = options.image
						this.processData.imageRecognition( url ).then(( painting ) => {
							console.log("@@@@@@@@@@@@@@@@@@@@PAINTING@@@@@@@@@@@@@@@@@@@@", painting);
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

				if(action == 'send_url') {
					let image = response.result.resolvedQuery;
					console.log("url", image);
					this.processData.imageRecognition( image ).then(( painting ) => {
						responseMessages = this.createImageRequestResponse( painting, responseMessages );
						console.log("ressssspooooooooonnnnnnnsssseeeeeeeeemsg", responseMessages);
						resolve( {type: 'richContent', messages: responseMessages} );
					}).catch( err => {
						console.log(err);
						reject(err);
					});

				}

				if (this.isDefined(responseMessages) && responseMessages.length > 0) {
					console.log("custom entity is defined", this.isDefined(responseMessages) );

					let keywords = action.split('_');
					console.log(keywords);

					const wikiart = new Wikiart();
					const custom = new Custom();

					keywords.forEach(function(keyword) {
						let query = response.result.parameters[keyword];

					  if( keyword !== 'search'  ) {
							if( keyword == "artist" || keyword == "artwork" || keyword == "movement" ){
								//DO REQUEST TO BACKOFFICE
								//:keyword/query

								console.log(query);

								custom.getEntityByName(keyword, query)
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
									switch (keyword) {
										case 'artist': {
											wikiart.getArtistByName( query ).then((artist) => {
												if ( typeof artist == "object" ) {
													responseMessages = this.generateResponse( artist, action, responseMessages);

													resolve( {type: 'richContent', messages: responseMessages} );
												}
											})
											.catch( err => { reject(err) } );
										}
										break;
										case 'artwork': {
											wikiart.getArtworkByName( query ).then((artwork) => {
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
											wikiart.getMovementByName( query ).then(( movement ) => {
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


							} else if ( keyword == "richcards" ) {

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
												custom.getEntityByName(key[i], richcards[j])
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
														reso('success');

													}));
												}
												else {
													console.log('entity not found in custom DB');
													const name = entity.fields.slug;

													console.log('entity to search in wikiart', name);

													richcardPromises.push( new Promise( reso => {
														switch(key[i]) {
															case 'artist':
																wikiart.getArtistByName( name ).then((artist) => {
																	if (typeof artist == "object") {
																		responseMessages = this.createArtistRichcard(artist, action, responseMessages);
																	}
																	reso('success');
																})
																.catch( e => { reject(e) });
																break;
															case 'artwork':
																wikiart.getArtworkByName( name ).then(( artwork ) => {
																	if (typeof artwork == "object") {
																		responseMessages = this.createArtistRichcard( artwork , action, responseMessages);
																	}
																	reso('success');
																})
																.catch( e => { reject(e) });
																break;
															case 'movement':
																wikiart.getMovementByName( name ).then(( movement ) => {
																	if (typeof artwork == "object") {
																		responseMessages = this.createArtistRichcard( movement , action, responseMessages );
																	}
																	reso('success');
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
							} else {
								resolve( {type: 'richContent', messages: responseMessages } )
							}
						}
					}.bind(this));
				}
				// else if (this.isDefined(responseText)) {
				// 	resolve( {type: 'text', messages: responseText } )
				// }
			}
		});
	}

	createImageRequestResponse( image, responseMessages ) {
		console.log("immmmmmmmaaaaaaageeeeeeeee", image);
		responseMessages[responseMessages.length - 1].speech += " '" + image.title + "', réalisé par " + image.artistName + " en " + image.yearAsString + " 🤓";
		responseMessages.push( { type: 3, imageUrl: 'https://media.giphy.com/media/d3mlE7uhX8KFgEmY/giphy.gif' } );

		let moreInfoOpening = {};
		moreInfoOpening.text = 'Tu veux en savoir plus sur quoi ?';
		moreInfoOpening.type = 2;
		moreInfoOpening.quick_replies = [{
			content_type: "text",
			title: "l'oeuvre 🖌️",
			payload: image.title
		},{
			content_type: "text",
			title: "l'artiste 👑",
			payload: "Qui est " + image.artistName
		},{
			content_type: "text",
			title: "le mouvement 💫",
			payload: "néo-géo"
		}];
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
		if( typeof artwork.fields == "object" ){
			artwork = artwork.fields
		}
		const title = artwork.title;

		const newMsg = {
			type: 1,
			title: title,
			subtitle: artwork.date,
			imageUrl: artwork.url,
			buttons: [
				{
					type: 'postback',
					title: 'Qu\'est-ce ?',
					payload: 'Qu\'est ce que ' + title
				}
			]
		};

		if(newMsg.title && (newMsg.subtitle || newMsg.imageUrl))
			responseMessages.push(newMsg);

		return responseMessages;
	}

	createMovementRichcard( movement, action, responseMessages) {
		if( typeof movement.fields == "object" ){
			movement = movement.fields
		}
		const name = movement.name;

		const newMsg = {
			type: 1,
			title: name,
			subtitle: movement.startYear + " - " + movement.endYear,
			imageUrl: "http://www.maison-du-mouvement.com/wp-content/uploads/2015/11/Final-logo.png",
			buttons: [
				{
					type: 'postback',
					title: 'Qu\'est-ce ?',
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

		if(entity.movements && template.template && template.template.params.indexOf('movements') > -1) {
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
		else {
			if(Array.isArray(entity.content) && entity.content.length > 1 ) {
				const contents = entity.content;
				for (let i = 0; i < contents.length; i++) {
					const cont = contents[i];
					if( cont.fields.type == "additionalContents" ){
						if(cont.content[0].fields.body) {
							responseMessages.push({ type: 0, speech: cont.content[0].fields.body });
						}
						if(cont.url) {
							responseMessages.push({ type: 3, imageUrl: cont.url });
						}
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
