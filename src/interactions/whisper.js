import { getInfoForUser } from '../utils'

const interactionWhisper = (bot, message) => {
  const { user } = message
  getInfoForUser(user).then(({ slackUser }) => {
    if (!slackUser.is_owner) {
      throw new Error('This command is admin only')
    }

    console.log(message)
    console.log(message.text)
  })
}

export default interactionWhisper
