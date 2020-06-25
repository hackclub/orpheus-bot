import { getInfoForUser, initBot, airCreate, transcript } from '../utils'

const getChannelName = async (channel) =>
  new Promise((resolve, reject) => {
    initBot().api.conversations.info(
      {
        channel,
      },
      (err, res) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log('getChannelName', res)
        resolve(res.channel.name)
      }
    )
  })

const createUniqueChannel = async (channel) => {
  const baseName = await getChannelName(channel)
  console.log('baseName', baseName)
  const name = baseName + '-' + Math.random().toString().substr(2, 5)

  return new Promise((resolve, reject) => {
    initBot().api.conversations.create(
      {
        name,
      },
      (err, res) => {
        if (err) {
          reject(err)
        }
        resolve(res.channel)
      }
    )
  })
}

const interactionBreakout = async (bot, message) => {
  const { ts: timestamp, channel, user } = message
  const { slackUser } = await getInfoForUser(user)

  if (slackUser.is_restricted) {
    return // MCG can't create channels
  }

  const breakout = await createUniqueChannel(channel)
  console.log("I just created a new channel!", breakout.name, breakout.id)

  await airCreate('Breakout Channel', {
    'Breakout Channel ID': breakout.id,
    'Parent Channel ID': channel,
    Creator: user,
    'Creation Timestamp': timestamp,
  })

  bot.reply(
    message,
    transcript('breakout.created', { channel: breakout.id })
  )
}

export default interactionBreakout
