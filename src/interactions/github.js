import { getInfoForUser, airFind, airPatch, airGet } from '../utils'

export default async (bot, message) => {
  const { user, text } = message
  const { person } = getInfoForUser(user)

  if (text) {
    airFind('People', 'GitHub URL', githubUsername)
  } else {
    const ghUrl = person.fields['GitHub URL']

    if (ghUrl) {
      bot.replyPrivateDelayed(
        message,
        transcript('github.details', { url: text })
      )
    } else {
      bot.replyPrivateDelayed(message, transcript('github.noDetails'))
    }
  }
}
