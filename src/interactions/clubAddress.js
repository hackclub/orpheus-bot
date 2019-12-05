import { getInfoForUser, transcript } from '../utils'

const interactionClubAddress = async (bot, message) => {
  const { leader, club, clubAddress } = await getInfoForUser(message.user)

  if (!leader) {
    throw new Error('Command can only be run by leaders!')
  }
  if (!club) {
    throw new Error('Club not found!')
  }

  bot.replyPrivateDelayed(
    message,
    transcript('clubAddress', { address: clubAddress })
  )
}

export default interactionClubAddress
