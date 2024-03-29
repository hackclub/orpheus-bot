import animals from 'animals'
import { plural } from 'pluralize'

import { getInfoForUser, initBot, airCreate, transcript, reaction } from '../utils'

const getChannelName = async channel =>
  new Promise((resolve, reject) => {
    console.log(`I'm asking Slack the humanized name of channel #${channel}`)
    initBot().api.conversations.info(
      {
        channel,
      },
      (err, res) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        console.log(
          `Turns out that the humans call <#${channel}> ${res.channel.name}`
        )
        resolve(res.channel.name)
      }
    )
  })

const createUniqueChannel = async channel => {
  const baseName = await getChannelName(channel)
  const appendedName = '-for-' + plural(animals())
  const nameLengthLimit = 80 // this is Slack's limit
  const name = baseName.slice(0, nameLengthLimit - appendedName.length) + appendedName
  console.log({baseName, appendedName, name})

  return new Promise(async (resolve, reject) => {
    initBot().api.conversations.create(
      {
        name,
      },
      async (err, res) => {
        if (err) {
          if (err == 'name_taken') {
            resolve(await createUniqueChannel(channel))
          }
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

  await reaction(bot, 'add', channel, timestamp, 'beachball')

  if (slackUser.is_restricted) {
    await Promise.all([
      reaction(bot, 'remove', channel, timestamp, 'beachball'),
      reaction(bot, 'add', channel, timestamp, 'no_entry')
    ])
    return // MCG can't create channels
  }

  const breakout = await createUniqueChannel(channel)
  console.log('I just created a new channel!', breakout.name, breakout.id)

  bot.say({
    channel: breakout.id,
    text: transcript('breakout.intro', { channel }),
  })
  bot.reply(message, transcript('breakout.created', { channel: breakout.id }))

  await airCreate('Breakout Channel', {
    'Breakout Channel ID': breakout.id,
    'Breakout Channel Name': breakout.name,
    'Parent Channel ID': channel,
    Creator: user,
    'Creation Timestamp': timestamp,
    'Last Updated Timestamp': timestamp,
  })
  reaction(bot, 'remove', channel, timestamp, 'beachball'),
  reaction(bot, 'add', channel, timestamp, 'thumbsup-dino')
}

export default interactionBreakout
