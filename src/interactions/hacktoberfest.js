import { getInfoForUser, transcript } from '../utils'

const interactionHacktoberfest = (bot, message) => {
  // only run in october
  if (new Date().getMonth() != 9) {
    return
  }

  const { user, channel } = message
  return getInfoForUser(user).then(({ userRecord }) => {
    if (!userRecord.fields['Flag: Hacktoberfest 2020']) {
      userRecord.patch({ 'Flag: Hacktoberfest 2020': true })

      bot.sendEphemeral({ channel, user, text: transcript('hacktoberfest') })
    }
  })
}

export default interactionHacktoberfest
