import { getInfoForUser, transcript } from '../utils'

export default async (bot, message) => {
  const { user } = message
  const { card, club } = await getInfoForUser(user)

  if (!club) {
    throw transcript('clubCard.noClub')
  }
  if (!card) {
    throw transcript('clubCard.noCard')
  }

  bot.replyPrivateDelayed(message, transcript('clubCard.dmNotification'))

  bot.say({
    text: transcript('clubCard.url', { url: card.fields['Embed URL'] }),
    channel: user,
  })
}
