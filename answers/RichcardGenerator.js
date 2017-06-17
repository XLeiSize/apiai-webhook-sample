const Utils = require('../helpers/utils.js');
const ResponseMessage = require('./ResponseMessage.js');
const Template = require('./TemplateEngine.js');

const Wikiart = require('../database/wikiart.js');
const Custom = require('../database/custom.js');

class RichcardGenerator {

  constructor( ) {

  }

  richcard( entity, category ) {
    this.category = category
		return new Promise( (resolve, reject) => {
	    switch( category ) {
	      case "artist":
						this.artistRichcard(entity).then( richcard => {
						 resolve(richcard)
					 } ).catch( err => {
						 reject(err)
					 })
					 break;
	      case "artwork":
						this.artworkRichcard(entity).then( richcard => {
						 resolve(richcard)
					 } ).catch( err => {
						 reject(err)
					 })
	        break;
	      case "movement":
	        this.movementRichcard(entity).then( richcard => {
						resolve(richcard)
					} ).catch( err => {
						reject(err)
					})
	        break;
	    }
		})
  }

  artistRichcard( artist ) {
    let imageUrl, title, movement;
		let birthdate = '';
		let deathdate = '';

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
			if(artist.yearOfDeath) {
				deathdate = artist.yearOfDeath;
				if(artist.monthOfDeath) {
					deathdate = artist.monthOfDeath + '/' + deathdate;
					if(artist.dayOfDeath) {
						deathdate = artist.dayOfDeath + '/' + deathdate;
					}
				}
			}
			imageUrl = "https:" + artist.portrait.fields.file.url;
		} else {
			title = artist.artistName;

			if(artist.birthDayAsString) {
				birthdate = artist.birthDayAsString
			}
			if(artist.deathDayAsString) {
				deathdate = artist.deathDayAsString
			}
			imageUrl = artist.image
			// TEMPORARY FIX FOR ARTIST COMING FROM WIKIART
			return new Promise( (resolve, reject) => { resolve( this.generate() ) });
		}

		movement = artist.movements[0].fields

		return new Promise( (resolve, reject) => {
			this.generateSubitems(movement, "mainArtists", artist).then( subitems => {

				this.title = title
				this.subtitle = birthdate + " - " + deathdate
				this.imageUrl = imageUrl

				this.description = this.generateTextFromTemplate('richards_description', artist)

				console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°", this.description);
				this.subitems = {
					title: "Artistes similaires",
					items: subitems
				}
				console.log("32232323232222323223232222232232", this.subitems);
				let richcard = this.generate()

				resolve(richcard)
			}).catch( err => {
				console.log(err);
				reject()
			} )
		} )
  }

  artworkRichcard(artwork) {
		console.log("WTFFFFFFFFFFFF", artwork);
    let date, imageUrl, title, movement
		artwork = artwork.fields
		date = artwork.endYear
		movement = artwork.movements[0].fields
		return new Promise( (resolve, reject) => {
			this.generateSubitems(movement, "mainArtworks").then( subitems => {

				this.title = artwork.title

				const author = artwork.author.fields.firstName + ' ' + artwork.author.fields.lastName

		    this.subtitle = date + " - " + author
				this.imageUrl = 'https:' + artwork.images[0].fields.file.url

		    this.description = this.generateTextFromTemplate('richards_description', artwork)

				console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°", this.description);
				this.subitems = {
					title: "Oeuvres similaires",
					items: subitems
				}
				console.log("32232323232222323223232222232232", this.subitems);
				let richcard = this.generate()

				resolve(richcard)
			}).catch( err => {
				console.log(err);
				reject()
			} )
		} )
  }

  movementRichcard(movement) {
		if( typeof movement.fields == "object" ){
			movement = movement.fields
		}
		return new Promise( (resolve, reject) => {
			this.generateSubitems(movement, "mainArtworks").then( subitems => {

				this.title = movement.name;

				const endYear = movement.endYear ? movement.endYear : 'Actuel'

		    this.subtitle = movement.startYear + " - " + endYear

		    this.imageUrl = "https:" + movement.image.fields.file.url

		    this.description = this.generateTextFromTemplate('richards_description', movement)
		    console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°", this.description);
				this.subitems = {
					title: "Oeuvres principaux",
					items: subitems
				}
				console.log("32232323232222323223232222232232", this.subitems);
				let richcard = this.generate()

				resolve(richcard)
			}).catch( err => {
				console.log(err);
				reject()
			} )
		} )


  }

  generateTextFromTemplate(action, entity) {
    console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%action", action);
		const template = new Template(action, entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%template", template);
		return template.message;
  }

  generateSubitems(entity, key, currentEntity) {
    let custom = new Custom()
    let wikiart = new Wikiart()
    let list = entity[key]
		let type;
		switch( key ){
			case "mainArtworks":
				type = "artwork"
				break;
			case "mainArtists":
				type = "artist"
				break;
			case "movement":
				type = "movement"
				break;
		}
    console.log("ùùùùùùùùùùùùùùù", list, type);
    let promises = [];
		for( let i = 0; i < list.length; i++ ){
      promises.push(
        custom.getEntityByName(type, list[i])
      )
		}
		return new Promise( (resolve, reject) => {
			Promise.all(promises)
			.then( results => {
				let subitems = [];
				for (let j = 0; j < results.length; j++) {
					const entity = results[j].fields
					//console.log("WESHALORS", entity);
					if( entity.lastName !== currentEntity.lastName ||  entity.title !== currentEntity.title ||  entity.name !== currentEntity.name  ) {
						const title = ( entity.title ) ? entity.title : ( entity.name ) ? entity.name : ( entity.lastName ) ? entity.firstName + " " + entity.lastName : entity.title
	          const url = (entity.image) ? entity.image.fields.file.url : ( entity.images ) ? entity.images[0].fields.file.url : entity.portrait.fields.file.url
	          const imageUrl = "https:"+ url
	          subitems.push({
	            title: title,
	            imageUrl: imageUrl,
	            postback: title
	          })
					}

				}
				resolve( subitems );
			}).catch( err => {
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", err);
				// WIKIART
				let wikiartPromises = [];
				let length = list.length > 5 ? 5 : list.length
				for( let i = 0; i < length; i++ ) {
					switch ( type ) {
						case 'artist':
							console.log(list[i]);
							wikiartPromises.push(wikiart.getArtistByName( list[i] ))
							break;
						case 'artwork':
							wikiartPromises.push(wikiart.getArtworkByName( list[i] ))
							break;
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


  generate() {
    return new ResponseMessage(1, {
			title: this.title,
			subtitle: this.subtitle,
			category: this.category,
			subitems: this.subitems,
			desc: this.description,
			imageUrl: this.imageUrl,
			buttons: [
				{
					type: 'postback',
					title: 'Qui est-ce ?',
					payload: 'Qui est ' + this.title
				}
			]
		});
  }

}

module.exports = new RichcardGenerator();
