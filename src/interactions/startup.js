import { initBot, transcript } from '../utils'

const BOT_SPAM_CHANNEL = 'C0P5NE354'

const interactionStartup = (bot = initBot(), message) => {
  const text = transcript('startup.message')
  if (process.env.NODE_ENV === 'development') {
    console.log(text)
  } else {
    bot.say({ text, channel: BOT_SPAM_CHANNEL })
  }
}

export default interactionStartup
