import { getInfoForUser } from '../utils'

const interactionClubAddress = (bot, message) => {
  const { user } = message

  getInfoForUser(user).then(({ leader, club, clubAddress }) => {
    if (!leader) {
      throw new Error('Command can only be run by leaders!')
    }
    if (!club) {
      throw new Error('Club not found!')
    }

    bot.replyPrivateDelayed(
      message,
      text('updateAddress', { address: clubAddress.fields })
    )
  })
}

export default interactionClubAddress
