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
			return country
		});
	}

}

module.exports = Template;
