import { transcript, getInfoForUser } from '../utils'

const interactionCatchall = (bot, message) => {
  const { ts: timestamp, channel, user } = message

  getInfoForUser(user).then(({ slackUser }) => {
    if (slackUser.is_bot) {
      bot.replyInThread(message, transcript('catchall.botReply'))
    } else {
      if (Math.random() > 0.5) {
        if (Math.random() < 0.05) {
          bot.replyInThread(message, transcript('catchall.reply'))
        } else {
          const spongebobMocking = message.text.split('').map((l, i) => i.match(/[a-z]/i) ? i%2==0 ? l.toLowerCase() : l.toUpperCase() : l).join('')
          bot.replyInThread(message, ":spongebob-mocking:\n"+spongebobMocking)
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
