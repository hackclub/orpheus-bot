import { getInfoForUser, transcript, airCreate } from '../utils'

const initAddress = async personID => {
  console.log(
    `I couldn't find an address for ${personID}, so I'm initializing a blank record`
  )
  const fields = {
    Person: personID,
    'Currently assigned to Person': personID,
  }
  await airCreate('Address', fields)
}

const interactionAddress = async (bot, message) => {
  const { person, personAddress } = await getInfoForUser(message.user)

  if (!person) {
    throw new Error(`Couldn't find Slack ID in Airtable!`)
  }

  const address = personAddress || (await initAddress(person.id))

  bot.replyPrivateDelayed(
    message,
    transcript('address', { address: address.fields })
  )
}

export default interactionAddress
