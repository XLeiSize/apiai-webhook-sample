const Template = require('./TemplateEngine.js');

const TemplateEngine = require('./TemplateEngine.js');

const ProcessData = require('../ProcessData.js');
const Utils = require('../helpers/utils.js');

class ResponseMessage {

  constructor( type, options ) {
    this.type = type
    this.subitems = options.subitems
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
    this.category = options.category
    this.title = options.title
    this.subtitle = options.subtitle
    this.desc = options.desc
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
