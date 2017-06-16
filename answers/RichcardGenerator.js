const Utils = require('../helpers/utils.js');
const ResponseMessage = require('./ResponseMessage.js');
const Template = require('./TemplateEngine.js');

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

    this.description = this.generateFromTemplate('richards_description', movement)
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

    this.description = this.generateFromTemplate('richards_description', movement)
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

    this.description = this.generateFromTemplate('richards_description', movement)
    console.log("°°°°°°°°°°°°°°°°°°°°°°°°°°°°°", this.description);
    return this.generate()
  }

  generateFromTemplate(action, entity) {
    console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%action", action);
		const template = new Template(action, entity);
		console.log(" %%%%%%%%%%%%%%%%%%%%%%%%%%%template", template);
		return template.message;
  }


  generate() {
    return new ResponseMessage(1, {
			title: this.title,
			subtitle: this.subtitle,
			category: this.category,
			subitems: { 'yolo': 'yolo', 'yaka': true },
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
