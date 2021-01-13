import { transcript, getInfoForUser } from '../utils'

const spongebobTransform = (text) => {
  let inBracket = 0
  return text.split('').map((l, i) => {
    if (l == '<') {
      inBracket++
      return l
    } else if (l == '>') {
      inBracket--
      return l
    } else if (inBracket > 0) {
      return l
    } else {
      if (i%2==1) {
        return l
      } else {
        if (l.toUpperCase() === l) {
          return l.toLowerCase();
        } else {
          return l.toUpperCase();
        }
      }
    }
  }).join('')
}

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
          bot.replyInThread(message, ":spongebob-mocking:\n"+ spongebobTransform(message.text))
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
