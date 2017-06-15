const Utils = require('../helpers/utils.js');
const ResponseMessage = require('./ResponseMessage.js');

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
		}

    let subtitle = birthdate + ' - ' + deathdate

    return this.generate( title, subtitle, imageUrl )
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
		title = artwork.title

		const author = artwork.author.fields.firstName + ' ' + artwork.author.fields.lastName

    const subtitle = date + " - " + author

    return this.generate( title, subtitle, imageUrl )
  }

  movementRichcard(movement) {
    if( typeof movement.fields == "object" ){
			movement = movement.fields
		}
		const title = movement.name;

		const endYear = movement.endYear ? movement.endYear : 'Actuel'

    const subtitle = movement.startYear + " - " + endYear

    const imageUrl = "https:" + movement.image.fields.file.url

    return this.generate( title, subtitle, imageUrl )
  }


  generate(title, subtitle, imageUrl) {
    return new ResponseMessage(1, {
			title: title,
			subtitle: subtitle,
			category: this.category,
			data: { 'yolo': 'yolo', 'yaka': true },
			description: ' Lorem lorem lorem',
			imageUrl: imageUrl,
			buttons: [
				{
					type: 'postback',
					title: 'Qui est-ce ?',
					payload: 'Qui est ' + title
				}
			]
		});
  }

}

module.exports = new RichcardGenerator();
