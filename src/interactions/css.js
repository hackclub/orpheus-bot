import { reaction } from "../utils"
let validateCss = require('css-validator');
let Pusher = require("pusher");

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

const pusher = new Pusher({
  appId: "1435548",
  key: "de6cd13556d73c05beed",
  secret: process.env.pusher,
  cluster: "us2",
  useTLS: true
});

const interactionCSS = async (bot, message) => {
  const { text, channel, ts } = message
  let trimmedText = replaceAll(text, '```', '')
  validateCss({text: trimmedText}, async function (_, data) {
    if(data.validity){
      await reaction(bot, 'add', channel, ts, 'art')
      pusher.trigger("css", "new", {
        message: trimmedText
      });
    }
  });
}

export default interactionCSS