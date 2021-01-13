import { transcript, getInfoForUser } from '../utils'
import interactionMocking from './mocking'

const interactionCatchall = (bot, message) => {
  const { ts: timestamp, channel, user } = message

  getInfoForUser(user).then(({ slackUser }) => {
    if (slackUser.is_bot) {
      bot.replyInThread(message, transcript('catchall.botReply'))
    } else {
      if (Math.random() > 0.5) {
        if (Math.random() > 0.15) {
          bot.replyInThread(message, transcript('catchall.reply'))
        } else {
          interactionMocking(bot, message)
        }
      } else {
        bot.api.reactions.add(
          { timestamp, channel, name: transcript('catchall.emoji') },
          err => {
            if (err) console.error(err)
          }
        )
      }
    }
  })
}

export default interactionCatchall
