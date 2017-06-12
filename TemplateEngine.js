const templates = require('./templates/templates');
const _         = require('lodash');

const Hb 		= require('handlebars');

class Template {

	constructor(action, params) {
		this.action = action;
		this.params = params;
		this.keys   = Object.keys(this.params);
		this.handlebarsInit();
		this.setMessage();
	}

	getTemplate() {
		const tpl       = templates[this.action];

		let commonParamsArray = [];

		for (let i = 0; i < tpl.length; i++) {
			let commonParams = 0;

			let continueFlag = false;
			for (let j = 0; j < tpl[i].params.length; j++) {
				if(!(tpl[i].params[j] in this.params))
					continueFlag = true;

				if(this.params[tpl[i].params[j]] == '')
					continueFlag = true;

				if(Array.isArray(this.params[tpl[i].params[j]]) && this.params[tpl[i].params[j]].length < 1)
					continueFlag = true;

				commonParams++;

			}


			if(continueFlag) {
				continueFlag = false;
				continue;
			}

			commonParamsArray.push({
				value: commonParams,
				index: i
			});
		}


		const orderedCommonParams = _.orderBy(commonParamsArray, ['value'], ['desc']);
		if(orderedCommonParams.length > 0) {
			return tpl[orderedCommonParams[0].index];
		} else {
			return false;
		}
	}

	setMessage() {
		this.template = this.getTemplate(this.action, this.keys);

		if(!this.template) {
			this.message = false;
			return false;
		}

		this.templateSentence = this.template.templates[Math.floor(Math.random() * this.template.templates.length)];

		this.parseMessage();
	}

	parseMessage() {
		this.templateSentence = Hb.compile(this.templateSentence);
		this.message = this.templateSentence(this.params);
	}

	handlebarsInit() {
		Hb.registerHelper('ifCond', function (v1, operator, v2, options) {
			switch (operator) {
				case '==':
					return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '===':
					return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '!=':
					return (v1 != v2) ? options.fn(this) : options.inverse(this);
				case '!==':
					return (v1 !== v2) ? options.fn(this) : options.inverse(this);
				case '<':
					return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
					return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
					return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
					return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
					return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
					return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
					return options.inverse(this);
			}
		});

		Hb.registerHelper("month", function(month, options) {
	    month = parseFloat(month);

	    return {
	        1: 'Janvier',
	        2: 'Février',
	        3: 'Mars',
	        4: 'Avril',
	        5: 'Mai',
	        6: 'Juin',
	        7: 'Juillet',
	        8: 'Août',
	        9: 'Septembre',
	        10: 'Octobre',
	        11: 'Novembre',
	        12: 'Décembre'
	    }[month];
		});

		Hb.registerHelper("preposition", function(country, options) {
	    switch( country ) {
				case 'USA':
				case 'Etats-Unis':
					country = "aux " + country
					break;
				default:
					country = "en " + country
			}
			return country.toLowerCase()
		});

		Hb.registerHelper("emoji", function(nationality, options) {

	    return nationality + " " +  {
	        'Chinoise': '🇨🇳',
	        'Française': '🇫🇷',
	        'Américaine': '🇺🇸',
	        'Anglaise': '🇬🇧',
	        'Japonaise': '🇯🇵',
	        'Allemande': '🇩🇪'

	    }[nationality] ;
		});

		Hb.registerHelper("technique", function(technique, options) {
			return {
	        'Architecture': 'l\'architecture',
	        'Graphic Design': 'le design graphique',
	        'Installation': 'les installations',
	        'Object Design': 'le design d\'objet',
	        'Painting': 'la peinture',
	        'Performance': 'la performance',
	        'Photography': 'la photographie',
	        'Sculpture': 'la scuplture',
	        'Video': 'la video'
	    }[technique];
		});

		Hb.registerHelper("centurify", function(year, options) {
			year = parseFloat(year);
	    year = Math.floor(year/100) + 1
			return {
	        1: 'I',
	        2: 'II',
	        3: 'III',
	        4: 'IV',
	        5: 'V',
	        6: 'VI',
	        7: 'VII',
	        8: 'VIII',
	        9: 'IX',
	        10: 'X',
	        11: 'XI',
	        12: 'XII',
	        13: 'XIII',
	        14: 'XIV',
	        15: 'XV',
	        16: 'XVI',
	        17: 'XVII',
	        18: 'XVIII',
	        19: 'XIX',
	        20: 'XX',
	        21: 'XXI'
	    }[year] + "e siècle";
		});
	}

}

module.exports = Template;
