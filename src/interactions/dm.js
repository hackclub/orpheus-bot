import { getInfoForUser } from '../utils'

const interactionDM = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user)
    .then(({ slackUser }) => {
      if (!slackUser.is_owner) {
        throw new Error('This command is admin only')
      }

      const encodedText = text.replace('&lt;', '<text').replace('&gt;', '>')
      console.log(encodedText)
      const messageRegex = /dm <[@#](.+?(?=[>\|])).*?>(.*)/
      const [, targetUser, targetMessage] = encodedText.match(messageRegex)

      bot.say({ text: targetMessage, channel: targetUser }, (err, response) => {
        if (err) {
          throw err
        }
        bot.api.reactions.add({
          timestamp: message.ts,
          channel: message.channel,
          name: 'white_check_mark',
        })
      })
    })
    .catch(err => {
      console.error(err)
      bot.reply(message, transcript('errors.general', { err }))

      bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'no_entry',
      })
    })
}

export default interactionDM
