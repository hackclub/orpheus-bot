import { getInfoForUser, transcript } from '../utils'

const interactionAddress = (bot, message) => {
  // check that they're a user
  const { user } = message

  getInfoForUser(user).then(({ person, personAddress }) => {
    if (!person) {
      throw new Error(`Couldn't find Slack ID in Airtable!`)
    }

    bot.replyPrivateDelayed(
      message,
      transcript('address', { address: personAddress.fields })
    )
  })
}

export default interactionAddress
