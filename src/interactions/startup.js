import { initBot, transcript } from '../utils'

const BOT_SPAM_CHANNEL = 'C0P5NE354'

const interactionStartup = (bot = initBot(), message) => {
  if (process.env.NODE_ENV === 'development') {
    return
  }
  bot.say({
    text: transcript('startup.message'),
    channel: BOT_SPAM_CHANNEL,
  })
}

export default interactionStartup
