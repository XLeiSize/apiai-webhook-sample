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
				"{{title}} a été réalisé par {{#author}}{{{ fields.firstName }}} {{{ fields.lastName }}}{{/author}}"
			]
		}
	]
};
