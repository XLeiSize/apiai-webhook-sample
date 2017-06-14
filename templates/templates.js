module.exports = {
	'search_artist': [
		{
			id: 1,
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
			id: 2,
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
				""
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
			id: 0,
			params: [
				'firstName',
				'lastName',
				'monthOfBirth',
				'yearOfBirth',
				'dayOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} quelques part sur terre le {{dayOfBirth}} {{month monthOfBirth}} {{yearOfBirth}} ... 😅",
				"Je sais pas où est-ce qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}}, mais je sais qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} le {{dayOfBirth}} {{month monthOfBirth}} {{yearOfBirth}}, au cas où ça t'intéresse ... héhé 😅 "
			]
		},
		{
			id: 1,
			params: [
				'lastName',
				'monthOfBirth',
				'yearOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} quelques part sur terre en {{month monthOfBirth}} {{yearOfBirth}} ... 😅",
				"Je sais pas où est-ce qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}}, mais je sais qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{month monthOfBirth}} {{yearOfBirth}}, au cas où ça t'intéresse ... héhé 😅 "
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'yearOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} quelque part sur terre en {{yearOfBirth}} ... 😅",
				"Je sais pas où est-ce qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}}, mais je sais qu'{{#ifCond gender '==' 'female'}}elle{{else}}il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} en {{yearOfBirth}}, au cas où ça t'intéresse ... héhé 😅 ",
				"Quelque part sur cette 🌎, en l'an {{yearOfBirth}} 🌚"
			]
		},
		{
			id: 3,
			params: [
				'firstName',
				'lastName',
				'cityOfBirth',
				'countryOfBirth'
			],
			templates: [
				"{{firstName}} {{lastName}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} à {{cityOfBirth}}, {{countryOfBirth}}",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} est né{{#ifCond gender '==' 'female'}}e{{/ifCond}} à {{cityOfBirth}}, {{countryOfBirth}}"
			]
		},
		{
			id: 4,
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
			id: 5,
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
				"Non, {{firstName}} {{lastName}} n'est pas mort ...",
				"Voyons, {{firstName}} {{lastName}} n'est pas mort ... （￣ー￣；）",
				"il est encore en vie 😐",
				"Je sais pas, je prédis pas le futur 🤷 "
			]
		},
		{
			id: 0,
			params: [
				'lastName'
			],
			templates: [
				"Voyons, {{lastName}} n'est pas mort...",
				"Voyons, {{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} n'est pas mort...",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} est encore en vie 😐",
				"Je sais pas, je prédis pas le futur 🤷 "
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
	'artist_movement': [
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'movements'
			],
			templates: [
				"{{ firstName }} {{ lastName }} appartient {{#ifCond movements.length '>' 1}}aux courants artistiques {{else}} au courant artistique {{/ifCond}} {{#movements}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ fields.name }}}{{/movements}}"
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'movements'
			],
			templates: [
				"{{ lastName }} appartient {{#ifCond movements.length '>' 1}}aux courants artistiques {{else}} au courant artistique {{/ifCond}} {{#movements}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ fields.name }}}{{/movements}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artist_nationality': [
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'nationality'
			],
			templates: [
				"{{ lastName }} est de nationalité {{emoji nationality }}",
				"{{firstName}} {{ lastName }} est de nationalité {{emoji nationality }}",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} est de nationalité {{emoji nationality }}",
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'nationality'
			],
			templates: [
				"{{ lastName }} est de nationalité {{emoji nationality }}",
				"{{ lastName }} est de nationalité {{emoji nationality }}",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} est de nationalité {{emoji nationality }}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'artist_technique': [
		{
			id: 1,
			params: [
				'firstName',
				'lastName',
				'field'
			],
			templates: [
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} travaille surtout dans les domaines de {{#field}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ technique fields.name }}}{{/field}}. {{#ifCond field.length '>' 2 }} Un artiste couteau-suisse 😏 {{/ifCond}}  "
			]
		},
		{
			id: 2,
			params: [
				'lastName',
				'field'
			],
			templates: [
				"{{lastName}} travaille surtout dans les domaines de {{#field}}{{{ fields.name }}}{{#ifCond @last '==' true }} {{else}}, {{/ifCond}}{{/field}}",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} travaille surtout dans les domaines de {{#field}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ fields.name }}}{{/field}}"
			]
		},
		{ // If is dead, then PAST
			id: 3,
			params: [
				'lastName',
				'field',
				'yearOfDeath'
			],
			templates: [
				"{{lastName}} travaillait surtout dans les domaines de {{#field}}{{{ fields.name }}}{{#ifCond @last '==' true }} {{else}}, {{/ifCond}}{{/field}}",
				"{{#ifCond gender '==' 'female'}}Elle{{else}}Il{{/ifCond}} travaillait surtout dans les domaines de{{#field}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ fields.name }}}{{/field}}"
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
				"{{title}} a été réalisé de {{startYear}} à {{endYear}}",
				"{{title}} a été fait de {{startYear}} à {{endYear}}"
			]
		},
		{
			id: 2,
			params: [
				'title',
				'endYear'
			],
			templates: [
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
				'{{ dimensions }}, précisemment',
				'{{title}} fait {{ dimensions }}, précisemment',
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
				"{{ title }} appartient {{#ifCond movements.length '>' 1}}aux courants artistiques {{else}} au courant artistique {{/ifCond}} {{#movements}}{{#ifCond @last '==' true }}{{#ifCond @first '==' true}} {{else}} et {{/ifCond}} {{else}}{{#ifCond @first '==' true }} {{else}}, {{/ifCond}} {{/ifCond}}{{{ fields.name }}}{{/movements}}"
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'movement_start': [
		{
			id: 1,
			params: [
				'name',
				'startYear'
			],
			templates: [
				"Le mouvement {{name}} a débuté {{#ifCond displayAsCentury '==' false }}en {{startYear}} {{else}}au {{centurify startYear}}{{/ifCond}} {{#ifCond startYear '<' 1900 }}👴🏼{{ else }}👦🏻 {{/ifCond}} "
			]
		}
	],
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	// *****************************************************************************************************************************
	'movement_end': [
		{
			id: 1,
			params: [
				'name'
			],
			templates: [
				"On ne peut pas encore determiner la fin du mouvement, étant donnée que c'est assez récent 👶"
			]
		},
		{
			id: 2,
			params: [
				'name',
				'endYear'
			],
			templates: [
				"Le mouvement {{name}} s'est finit aux alentours {{#ifCond displayAsCentury '==' false }}de {{startYear}} {{else}}du {{centurify startYear}}{{/ifCond}}",
				"{{#ifCond displayAsCentury '==' false }} mmmh ... Aux environ de {{startYear}} je dirais 🤔 {{else}}C'est difficile de donner une date de fin à un concept ... 🤔 Mais on peut à peu près la situer approximativement autour du {{centurify startYear}} 🤓 {{/ifCond}}"
			]
		},
	]
}
