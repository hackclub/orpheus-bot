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
        throw err
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
