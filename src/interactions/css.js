import { reaction } from "../utils"
let validateCss = require('css-validator');

const interactionCSS = async (bot, message) => {
  const { text, channel, ts } = message
  validateCss({text}, async function (_, data) {
    if(data.validity){
      await reaction(bot, 'add', channel, ts, 'art')
    }
  });
}

export default interactionCSS