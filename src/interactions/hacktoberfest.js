import { getInfoForUser, text as transcript } from '../utils'

const interactionHacktoberfest = (bot, message) => {
  const { user, channel } = message
  return getInfoForUser(user).then(({ userRecord }) => {
    if (!userRecord.fields['Flag: Hacktoberfest 2019']) {
      userRecord.patch({ 'Flag: Hacktoberfest 2019': true })

      const text = transcript('hacktoberfest')
      bot.sendEphemeral({ channel, user, text })
    }
  })
}

export default interactionHacktoberfest
