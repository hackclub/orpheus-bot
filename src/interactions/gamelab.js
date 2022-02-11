import { transcript, getInfoForUser, reaction } from '../utils'

const interactionGamelab = (bot, message) => {
  const { ts: timestamp, channel, user } = message

  getInfoForUser(user).then(({ slackUser }) => {
    if (slackUser.is_bot) {
      bot.replyInThread(message, transcript('catchall.botReply'))
    } else {
      bot.replyInThread(message, transcript('gamelab.autoReply'))
      reaction(bot, 'add', channel, timestamp, transcript('gamelab.gamelabEmoji'))
      reaction(bot, 'add', channel, timestamp, transcript('gamelab.warningEmoji'))
    }
  })
}

export default interactionGamelab
