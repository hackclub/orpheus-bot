import {
  text
} from '../utils'

const interactionCatchall = (bot, message) => {
  const {
    ts: timestamp,
    channel,
  } = message

  if (Math.random() > 0.5) {
    bot.replyInThread(message, text('catchall.reply'))
  } else {
    bot.api.reactions.add({
      timestamp,
      channel,
      name: text('catchall.emoji'),
    }, (err) => {
      if (err) console.error(err)
    })
  }
}

export default interactionCatchall