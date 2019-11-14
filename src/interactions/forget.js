import { getInfoForUser, transcript } from '../utils'

const interactionForget = (bot, message) => {
  const { user } = message
  getInfoForUser(user).then(({ slackUser, userRecord }) => {
    if (slackUser.is_admin) {
      userRecord.delete()
      bot.reply(message, transcript('forget.success', { user }))
    } else {
      bot.reply(message, transcript('forget.notAuthed'))
    }
  })
}

export default interactionForget
