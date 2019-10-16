import { getInfoForUser } from '../utils'

const interactionWhisper = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user).then(({ slackUser }) => {
    if (!slackUser.is_owner) {
      throw new Error('This command is admin only')
    }

    const messageRegex = /send a whisper to <@(.*?)>:(.*)/
    const [, targetUser, targetMessage] = text.match(messageRegex)

    bot.say({ text: targetMessage, channel: targetUser })
    console.log(message)
    console.log(message.text)
  })
}

export default interactionWhisper
