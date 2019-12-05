import { getInfoForUser, transcript } from '../utils'

const interactionAddress = async (bot, message) => {
  const { person, personAddress } = await getInfoForUser(message.user)

  if (!person) {
    throw new Error(`Couldn't find Slack ID in Airtable!`)
  }

  bot.replyPrivateDelayed(
    message,
    transcript('address', { address: personAddress.fields })
  )
}

export default interactionAddress
