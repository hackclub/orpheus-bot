import { reaction } from "../utils"
let validateCss = require('css-validator');

const interactionHaiku = async (bot, message) => {
  const { text, ts } = message
  validateCss({text}, async function (_, data) {
    if(data.validity){
      await reaction(bot, 'add', channel, ts, 'art')
    }
  });
}

export default interactionHaiku