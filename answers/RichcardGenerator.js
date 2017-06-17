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
    switch( category ) {
      case "artist":
        return this.artistRichcard(entity)
        break;
      case "artwork":
        return this.artworkRichcard(entity)
        break;
      case "movement":
        return this.movementRichcard(entity)
        break;
    }
  }

  artistRichcard( artist ) {
    let imageUrl, title;
		let birthdate = '';
		let deathdate = '';

    if( typeof artist.fields == "object" ){
			artist = artist.fields
			this.title = artist.firstName ? artist.firstName + ' ' + artist.lastName : artist.lastName;

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
			this.title = artist.artistName;

			if(artist.birthDayAsString) {
				birthdate = artist.birthDayAsString
			}
			if(artist.deathDayAsString) {
				deathdate = artist.deathDayAsString
			}
			imageUrl = artist.image
		}

    this.subtitle = birthdate + ' - ' + deathdate

    this.description = this.generateTextFromTemplate('richards_description', movement)
    return this.generate()
  }

  artworkRichcard(artwork) {
    let date, imageUrl, title
		if( typeof artwork.fields == "object" ) {
			artwork = artwork.fields
			date = artwork.endYear
			imageUrl = 'https:' + artwork.images[0].fields.file.url
		} else {
			date = artwork.year
			imageUrl = artwork.image
		}
		this.title = artwork.title

		const author = artwork.author.fields.firstName + ' ' + artwork.author.fields.lastName

    this.subtitle = date + " - " + author

    this.description = this.generateTextFromTemplate('richards_description', movement)
    return this.generate()
  }

  movementRichcard(movement) {
    if( typeof movement.fields == "object" ){
			movement = movement.fields
		}
		this.title = movement.name;

		const endYear = movement.endYear ? movement.endYear : 'Actuel'

    this.subtitle = movement.startYear + " - " + endYear

    this.imageUrl = "https:" + movement.image.fields.file.url

    this.description = this.generateTextFromTemplate('richards_description', movement)
    console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°", this.description);

    this.subitems = this.generateSubitems(movement, "mainArtworks", "movement")
    return this.generate()
  }

  generateTextFromTemplate(action, entity) {
    console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%action", action);
		const template = new Template(action, entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%template", template);
		return template.message;
  }

  generateSubitems(entity, key, type) {
    let custom = new Custom()
    let wikiart = new Wikiart()
		console.log(entity);
    let list = entity[key]
    console.log("ùùùùùùùùùùùùùùù", list, type);
    let promises = [];
		for( let i = 0; i < list.length; i++ ){
      promises.push(
        this.custom.getEntityByName(type, list[i])
      )
		}
		return new Promise( (resolve, reject) => {
			Promise.all(promises)
			.then( results => {
				let subitems = [];
				for (let j = 0; j < results.length; j++) {
					const entity = results[j]
          const title = entity.fields.lastName ? entity.fields.firstName + " " + entity.fields.lastName : ( entity.fields.name ) ? entity.fields.name : entity.fields.title
          const url = entity.fields.image.fields.file.url ? entity.fields.image.fields.file.url : ( entity.fields.images[0].fields.file.url ) ? entity.fields.images[0].fields.file.url : entity.fields.portrait.fields.file.url
          const imageUrl = "https:" + url
          subitems.push({
            title: title,
            imageUrl: url,
            postback: title
          })
          console.log("SUBITEMS -SUBITEMS -SUBITEMS -SUBITEMS", subitems);

				}
				console.log("%%%%%%%%%%%%%%%%%%" + action + "%%%%%%%%%%%%%%%%%%", responseMessages);
				resolve( subitems );
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
