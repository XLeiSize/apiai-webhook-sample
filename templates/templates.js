module.exports = {
	'search_artist': [
		{
			id: 3,
			params: [
				"lastName",
				"yearOfBirth",
				"movements",
			],
			templates: [
				"{{firstName}} {{lastName}} ({{yearOfBirth}}) est un{{#ifCond gender '==' 'female'}}e{{/ifCond}} artiste contemporain{{#ifCond gender '==' 'female'}}e{{/ifCond}} du mouvement {{#movements}} {{{fields.name}}} {{/movements}}"
			]
		},
		{
			id: 4,
			params: [
				"OriginalArtistName",
				"year_of_birth"
			],
			templates: [
				"{{OriginalArtistName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{year_of_birth}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'search_movement': [
		{
			id: 1,
			params: [
				'content'
			],
			templates: [
				"{{#content}}{{#fields.content}} {{{ fields.body }}} {{/fields.content}}{{/content}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'search_artwork': [
		{
			id: 1,
			params: [
				'content'
			],
			templates: [
				"{{#content}}{{#fields.content}} {{{ fields.body }}} {{/fields.content}}{{/content}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artist_birthplace': [
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'cityOfBirth',
				'countryOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} à {{cityOfBirth}}, {{countryOfBirth}}",
				"il est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} à {{cityOfBirth}}, {{countryOfBirth}}"
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'cityOfBirth',
				'countryOfBirth'
			],
			templates: [
				"{{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} à {{cityOfBirth}}, {{countryOfBirth}}"
			]
		},
		{
			id: 3,
			params: [
				'lastName',
				'countryOfBirth'
			],
			templates: [
				"{{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} {{preposition countryOfBirth}}"
			]
		},
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artist_birthdate': [
		{
			id: 0,
			params: [
				'firstName',
				'lastName',
				'dayOfBirth',
				'monthOfBirth',
				'yearOfBirth',
				'cityOfBirth',
				'countryOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfBirth}} {{month monthOfBirth}} {{yearOfBirth}} à {{cityOfBirth }}, {{countryOfBirth}}"
			]
		},
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'dayOfBirth',
				'monthOfBirth',
				'yearOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfBirth}} {{month monthOfBirth}} {{yearOfBirth}}"
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'dayOfBirth',
				'monthOfBirth',
				'yearOfBirth'
			],
			templates: [
				"{{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfBirth}} {{month monthOfBirth}} {{yearOfBirth}}"
			]
		},
		{
			id: 3,
			params: [
				'firstName',
				'lastName',
				'monthOfBirth',
				'yearOfBirth'
			],
			templates: [
				"{{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{month monthOfBirth}} {{yearOfBirth}}"
			]
		},
		{
			id:4,
			params: [
				'firstName',
				'lastName',
				'yearOfBirth'
			],
			templates: [
				"{{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{yearOfBirth}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artist_death': [
		{
			id: 0,
			params: [
				'firstName',
				'lastName'
			],
			templates: [
				"{{firstName}} {{lastName}} n'est pas mort ...",
				"il est encore en vie 😐"
			]
		},
		{
			id: 0,
			params: [
				'lastName'
			],
			templates: [
				"{{firstName}} {{lastName}} n'est pas mort ...",
				"il est encore en vie 😐"
			]
		},
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'dayOfDeath',
				'monthOfDeath',
				'yearOfDeath'
			],
			templates: [
				"{{firstName}} {{lastName}} est mort{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfDeath}} {{month monthOfDeath}} {{yearOfDeath}}, RIP 🙏"
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'dayOfDeath',
				'monthOfDeath',
				'yearOfDeath'
			],
			templates: [
				"{{lastName}} est mort{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfDeath}} {{month monthOfDeath}} {{yearOfDeath}}, Rest in Piece 🌹"
			]
		},
		{
			id: 3,
			params: [
				'firstName',
				'lastName',
				'monthOfDeath',
				'yearOfDeath'
			],
			templates: [
				"{{lastName}} est mort{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{month monthOfDeath}} {{yearOfDeath}}. Paix à son âme 🙏"
			]
		},
		{
			id:4,
			params: [
				'firstName',
				'lastName',
				'yearOfDeath'
			],
			templates: [
				"{{lastName}} est mort{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{yearOfDeath}}. Paix à son âme 🙏"
			]
		},
		{
			id: 5,
			params: [
				'firstName',
				'lastName',
				'dayOfDeath',
				'monthOfDeath',
				'yearOfDeath',
				'cityOfDeath',
				'countryOfDeath'
			],
			templates: [
				"{{firstName}} {{lastName}} est mort{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfDeath}} {{month monthOfDeath}} {{yearOfDeath}}, à {{cityOfDeath}}, {{countryOfDeath}}. Paix à son âme 🙏"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artwork_artistName': [
		{
			id: 1,
			params: [
				'title',
				'author'
			],
			templates: [
				"{{title}} a été réalisé par {{#author}}{{{ fields.firstName }}} {{{ fields.lastName }}}{{/author}}",
				"{{title}} a été fait par {{#author}}{{{ fields.firstName }}} {{{ fields.lastName }}}{{/author}}",
				"C'est {{#author}}{{{ fields.firstName }}} {{{ fields.lastName }}}{{/author}} 😎",
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artwork_date': [
		{
			id: 1,
			params: [
				'title',
				'startYear',
				'endYear'
			],
			templates: [
				"{{title}} a été commencé en {{startYear}} et terminé {{endYear}}",
				"{{title}} a été réalisé en {{endYear}}",
				"{{title}} a été fait en {{endYear}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artwork_dimensions': [
		{
			id: 1,
			params: [
				'title',
				'dimensions'
			],
			templates: [
				'{{ dimensions }}',
				"{{ title }} fait {{ dimensions }} très exactement 🤓"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artwork_movement': [
		{
			id: 1,
			params: [
				'title',
				'movements'
			],
			templates: [
				"{{ title }} appartient {{#ifCond movements.length '>' 1}}aux courants artistiques {{else}} au courant artistique {{/ifCond}} {{#movements}}{{{ fields.name }}}{{#ifCond @last '==' true }} {{else}}, {{/ifCond}}{{/movements}}"
			]
		}
	],
}
