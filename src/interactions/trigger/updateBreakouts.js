import { airGet, initBot, airPatch, transcript } from '../../utils'
import interactionJoinChannel from '../joinChannel'

export default async (bot = initBot(), message) => {
  console.log({message })
  const breakoutChannels = await airGet(
    'Breakout Channel',
    '{Archived Channel Name} = BLANK()'
  )
  breakoutChannels.map(async breakout => {
    try {
      bot.api.conversations.history(
        { channel: breakout.fields['Breakout Channel ID'] },
        (err, res) => {
          if (err) {
            console.error(`Unable to close channel ID ${breakout.fields['Breakout Channel ID']}:`,err)
            return
          }
          const { messages } = res

          const timestamps = messages.map(m => m.ts) || []
          const latestTimestamp = timestamps.sort()[messages.length - 1]
          console.log("What's up with the TIME", messages)

          const timeSinceLastUpdate =
            Date.now() - parseInt(latestTimestamp.replace('.', '')) / 1000
          const overTimeLimit = timeSinceLastUpdate > 1000 * 60 * 1

          console.log({breakout})
          // we should close the channel if the last post was @orpheus' warning that archiving is coming
          if (
            overTimeLimit &&
            latestTimestamp == breakout?.fields['Archive Warning Timestamp']
          ) {
            bot.replyInThread(
              message,
              `Closing <#${breakout.fields['Breakout Channel ID']}> because the most recent post was me saying`
            )
            closeBreakout(bot, message, breakout)
          } else if (overTimeLimit) {
            // we should warn the channel it will be archived if there is no activity within 30 minutes
            bot.replyInThread(
              message,
              `I'm warning <#${breakout.fields['Breakout Channel ID']}> that it's on deck to be archived`
            )
            warnBreakout(bot, message, breakout)
          } else {
            // not over the time limit? That's fine– let's update the timestamp
            airPatch('Breakout Channel', breakout.id, {
              'Last Updated Timestamp': latestTimestamp,
            })
          }
        }
      )
    } catch (e) {
      console.error(e)
    }
  })
}

const closeBreakout = async (bot, message, breakout) => {
  await interactionJoinChannel(null, { channel: breakout.fields['Breakout Channel ID'] })
  const archivedName =
    'archived-' +
    breakout.fields['Breakout Channel Name'] +
    '-' +
    new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')
  bot.api.conversations.rename(
    {
      channel: breakout.fields['Breakout Channel ID'],
      name: archivedName,
    },
    (err, res) => {
      if (err) {
        console.error('stage 1', err)
      }
      // we need an admin token for this b/c Hack Club's Slack settings make archiving return 'restricted_action'
      initBot(true).api.conversations.archive(
        { channel: breakout.fields['Breakout Channel ID'] },
        (err, res) => {
          if (err) {
            console.error('stage 2', err)
          }
          airPatch('Breakout Channel', breakout.id, {
            'Archived Channel Name': archivedName,
          })
          console.log('I just archived', breakout.fields['Breakout Channel ID'])
        }
      )
    }
  )
}

const warnBreakout = async (bot, message, breakout) => {
  bot.say(
    {
      text: transcript('breakout.warning'),
      channel: breakout.fields['Breakout Channel ID'],
    },
    (err, res) => {
      if (err) {
        console.error(err)
      }
      console.log(res)

      airPatch('Breakout Channel', breakout.id, {
        'Last Updated Timestamp': res.ts,
        'Archive Warning Timestamp': res.ts,
      })
    }
  )
}
