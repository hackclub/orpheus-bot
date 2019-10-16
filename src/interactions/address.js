import { getInfoForUser, transcript } from '../utils'

const interactionAddress = (bot, message) => {
  // check that they're a user
  const { user } = message

  getInfoForUser(user).then(({ leader, leaderAddress }) => {
    if (!leader) {
      throw new Error('Command can only be run by leaders!')
    }

    bot.replyPrivateDelayed(
      message,
      transcript('address', { address: leaderAddress.fields })
    )
  })
}

export default interactionAddress
