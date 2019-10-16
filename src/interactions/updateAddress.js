import { getInfoForUser, text } from '../utils'

const interactionUpdateAddress = (bot, message) => {
  // check that they're a user
  const { user } = message

  getInfoForUser(user).then(({ leader, leaderAddress }) => {
    if (!leader) {
      throw new Error('Command can only be run by leaders!')
    }

    bot.replyPrivateDelayed(
      message,
      text('updateAddress', { address: leaderAddress.fields })
    )
  })
}

export default interactionUpdateAddress
