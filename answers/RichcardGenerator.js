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
					birthdate = ('0' + artist.monthOfBirth).slice(-2) + '/' + birthdate;
					if(artist.dayOfBirth) {
						birthdate = ('0' + artist.dayOfBirth).slice(-2) + '/' + birthdate;
					}
				}
			}
			if(artist.yearOfDeath) {
				deathdate = artist.yearOfDeath;
				if(artist.monthOfDeath) {
					deathdate = ('0' + artist.monthOfDeath).slice(-2) + '/' + deathdate;
					if(artist.dayOfDeath) {
						deathdate = ('0' + artist.dayOfDeath).slice(-2) + '/' + deathdate;
					}
				}
			}
			imageUrl = "https:" + artist.portrait.fields.file.url;
		} else {
			//IF INFOS COMES FROM WIKIART
			this.title = artist.artistName;

			if(artist.birthDayAsString) {
				this.birthdate = artist.birthDayAsString
			}
			if(artist.deathDayAsString) {
				this.deathdate = artist.deathDayAsString
			}
			this.imageUrl = artist.image
			this.subtitle = this.deathdate ? this.birthdate + " - " + this.deathdate : this.birthdate
			// TEMPORARY FIX FOR ARTIST COMING FROM WIKIART
			return new Promise( (resolve, reject) => { resolve( this.generate() ) });
		}

		movement = artist.movements[0].fields

		return new Promise( (resolve, reject) => {
			this.generateSubitems(artist, "mainArtworks", title).then( subitems => {

				this.title = title
				this.subtitle = deathdate ? birthdate + " - " + deathdate : birthdate
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
		title = artwork.title
		date = artwork.endYear
		movement = artwork.movements[0].fields
		return new Promise( (resolve, reject) => {
			this.generateSubitems(movement, "mainArtworks", title).then( subitems => {

				this.title = title

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
		const template = new Template(action, entity);
		return template.message;
  }

  generateSubitems(entity, key, current) {
		let subitems = [];
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
    console.log("ùùùùùùùùùùùùùùù", key, list, type, entity);
    let promises = [];
		for( let i = 0; i < list.length; i++ ){
			console.log("comparing",current, list[i]);
			if( list[i] !== current ){
				promises.push(
					custom.getEntityByName(type, list[i])
				)
			}

		}
		return new Promise( (resolve, reject) => {
			Promise.all(promises)
			.then( results => {
        let entity, title, url, imageUrl;
				for (let j = 0; j < results.length; j++) {
          if( results[j].fields ) {
            entity = results[j].fields
  					//console.log("WESHALORS", entity);
  					title = ( entity.title ) ? entity.title : ( entity.name ) ? entity.name : ( entity.lastName ) ? entity.firstName + " " + entity.lastName : entity.title
            url = (entity.image) ? entity.image.fields.file.url : ( entity.images ) ? entity.images[0].fields.file.url : entity.portrait.fields.file.url
            imageUrl = "https:"+ url
          }

          subitems.push({
            title: title,
            imageUrl: imageUrl,
            postback: title
          })
				}
				resolve( subitems );
			}).catch( err => {
				console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$", err.slug);
				// WIKIART
				let wikiartPromises = [];
				let length = list.length > 5 ? 5 : list.length
        switch ( type ) {
          case 'artist':
            console.log("ARTIST NAME", err.slug);
            wikiartPromises.push(wikiart.getArtistByName( err.slug ))
            break;
          case 'artwork':
            wikiartPromises.push(wikiart.getArtworkByName( err.slug ))
            break;
        }
				Promise.all(wikiartPromises)
				.then((results) => {
					console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&++++++++++++++++++++++++++++", results);
					for (let j = 0; j < results.length; j++) {
						const entity = results[j]
						//console.log("WESHALORS", entity);
						const title = ( entity.artistName ) ? entity.artistName : entity.title
	          const url = entity.image
	          const imageUrl = url
	          subitems.push({
	            title: title,
	            imageUrl: imageUrl,
	            postback: title
	          })
						resolve( subitems );
					}
				})
				.catch( error => {
					console.log("ERRRRRROOOOOOROROROROROROROROR richcards/", err, error)
					reject(error);
				} );
			})
		})
  }


  generate() {
		let buttonTitle;
		switch(this.category){
			case'artist':
				buttonTitle = "Qui est-ce ?"
				break;
			case'artwork':
				buttonTitle = "Dis m'en plus"
				break;
			case'movement':
				buttonTitle = "C'est quoi ?"
				break;
		}
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
					title: buttonTitle,
					payload: this.title
				}
			]
		});
  }

}

module.exports = new RichcardGenerator();
