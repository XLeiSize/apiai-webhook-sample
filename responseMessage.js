const Template = require('./TemplateEngine.js');

const Wikiart = require('./database/wikiart.js');
const Custom = require('./database/custom.js');

const TemplateEngine = require('./TemplateEngine.js');

const ProcessData = require('./ProcessData.js');
const Utils = require('./helpers/utils.js');

const WikiAPI = require('wikijs');
const wiki = WikiAPI.default();

class ResponseMessage {

  constructor( type, options ) {
    this.type = type
    switch(this.type) {
      case 0: this.textResponse(options)
        break;
      case 1: this.richcardResponse(options)
        break;
      case 2: this.quickRepliesResponse(options)
        break;
      case 3: this.imageResponse(options)
        break;
    }
  }

  textResponse(options) {
    this.speech = options.speech
  }

  richcardResponse(options) {
    this.title = options.title
    this.subtitle = options.subtitle
    this.imageUrl = options.imageUrl
    this.buttons = options.buttons
  }

  quickRepliesResponse(options) {
    this.text = options.text
    this.quick_replies = options.quick_replies
  }

  imageResponse(options) {
    this.imageUrl = options.imageUrl
  }

}

module.exports = ResponseMessage;
