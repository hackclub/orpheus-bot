import { initBot, transcript } from '../utils'

const BOT_SPAM_CHANNEL = 'C0P5NE354'

const interactionStartup = (bot = initBot(), message) => {
  const text = transcript('startup.message')
  if (process.env.NODE_ENV === 'development') {
    console.log(text)
  } else {
    bot.say({ text, channel: BOT_SPAM_CHANNEL }, (err, resp) => {
      if (err) console.error(err)
      const syntheticMessage = {...resp, user: 'U0C7B14Q3'}
      console.log('synthetic message', syntheticMessage)
      bot.startConversationInThread(syntheticMessage)
    })
  }
}

export default interactionStartup
