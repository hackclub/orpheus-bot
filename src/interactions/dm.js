import { getInfoForUser } from '../utils'

const interactionDM = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user).then(({ slackUser }) => {
    if (!slackUser.is_owner) {
      throw new Error('This command is admin only')
    }

    const messageRegex = /dm <@(.*?)>(.*)/
    const [, targetUser, targetMessage] = text.match(messageRegex)

    bot.say({ text: targetMessage, channel: targetUser }, (err, response) => {
      console.log(response)
      if (err) {
        console.error(err)

        bot.api.reactions.add({
          timestamp: response.ts,
          channel: response.channel,
          name: 'no_entry',
        })

        bot.reply(message, transcript('errors.general', { err }))
      }
      bot.api.reactions.add({
        timestamp: response.ts,
        channel: response.channel,
        name: 'white_check_box',
      })
    })
  })
}

export default interactionDM
