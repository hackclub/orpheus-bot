import { initBot, getInfoForUser, transcript } from '../utils'

const interactionClubInit = async (bot = initBot(), message) => {
  getInfoForUser(userId)
  bot.replyPrivateDelayed(message, transcript('clubInit'))
}

export default interactionClubInit
