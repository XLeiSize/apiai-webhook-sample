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
	'artwork_movement': [
		{
			id: 1,
			params: [
				'title',
				'movements'
			],
			templates: [
				"{{ title }} appartient {{#ifCond movements.length '>' 1}}aux mouvements {{else}} au mouvement {{/ifCond}} {{#movements}} {{{ fields.name }}} {{#ifCond movements.length '>' @index }}, {{/ifCond}}  {{/movements}}",
				"{{ title }} appartient {{#ifCond movements.length '>' 1}}aux mouvements artistiques {{else}} au mouvement artistique {{/ifCond}} {{#movements}} {{{ fields.name }}} {{#ifCond movements.length '>' @index }}, {{/ifCond}}  {{/movements}}",
				"{{ title }} appartient {{#ifCond movements.length '>' 1}}aux courants artistiques {{else}} au courant artistique {{/ifCond}} {{#movements}} {{{ fields.name }}} {{#ifCond movements.length '>' @position }}{{#ifCond  movements.length '==' 2}} et {{else}}, {{/ifCond}}{{/ifCond}}{{/movements}}"
			]
		}
	],
}
