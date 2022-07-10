import { reaction } from "../utils"
let validateCss = require('css-validator');

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1435548",
  key: "de6cd13556d73c05beed",
  secret: process.env.pusher,
  cluster: "us2",
  useTLS: true
});

const interactionCSS = async (bot, message) => {
  const { text, channel, ts } = message
  validateCss({text}, async function (_, data) {
    if(data.validity){
      await reaction(bot, 'add', channel, ts, 'art')
      pusher.trigger("css", "new", {
        message: text
      });
    }
  });
}

export default interactionCSS