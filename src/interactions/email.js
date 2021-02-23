import { getInfoForUser, transcript } from '../utils'
const interactionEmail = async (bot, message) => {
  const { person } = await getInfoForUser(message.user)
  const email = person.fields['Email']

  if (email) {
    bot.replyPrivateDelayed(message, `The email we have on file for you is '${email}'.`)
  } else {
    bot.replyPrivateDelayed(message, "We don't have an email address on file for you.")
  }
}

export default interactionEmail