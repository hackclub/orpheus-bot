import { getInfoForUser } from '../utils'

const interactionDM = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user).then(({ slackUser }) => {
    if (!slackUser.is_owner) {
      throw new Error('This command is admin only')
    }

    const messageRegex = /send a dm to <@(.*?)>:(.*)/
    const [, targetUser, targetMessage] = text.match(messageRegex)

    bot.say({ text: targetMessage, channel: targetUser })
  })
}

export default interactionDM
