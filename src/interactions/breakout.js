import { getInfoForUser, initBot, airCreate, transcript } from '../utils'

const getChannelName = async (channel) => {
  initBot().api.conversations.info({
    channel
  })
}

const createUniqueChannel = async (channel) => {
  const baseName = await getChannelName(channel)
  return baseName + '-' + Math.random().toString().substr(2, 5)
}

const interactionBreakout = async (bot, message) => {
  const { ts: timestamp, channel, user } = message
  const { slackUser } = await getInfoForUser(user)

  if (slackUser.is_restricted) {
    return // MCG can't create channels
  }

  const breakoutChannel = await createUniqueChannel(channel)

  await airCreate('Breakout Channel', {
    'Breakout Channel ID': breakoutChannel,
    'Parent Channel ID': channel,
    'Creator': user,
    'Creation Timestamp': timestamp
  })

  bot.reply(message, transcript('breakout.created', { channel: breakoutChannel }))
}

export default interactionBreakout