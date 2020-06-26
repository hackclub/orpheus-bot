import { airGet, initBot, airPatch, transcript } from '../../utils'

export default async (bot = initBot(), message) => {
  const breakoutChannels = await airGet(
    'Breakout Channel',
    '{Archived Channel Name} = BLANK()'
  )
  breakoutChannels.map(async breakout => {
    bot.api.conversations.history(
      { channel: breakout.fields['Breakout Channel ID'] },
      (err, res) => {
        if (err) {
          console.error(err)
        }
        const { messages } = res

        const latestTimestamp = messages.map(m => m.ts).sort()[
          messages.length - 1
        ]

        const timeSinceLastUpdate =
          Date.now() - parseInt(latestTimestamp.replace('.', '')) / 1000
        const overTimeLimit = timeSinceLastUpdate > 1000 * 60 * 30

        // we should close the channel if the last post was @orpheus' warning that archiving is coming
        if (
          overTimeLimit &&
          latestTimestamp == breakout.fields['Archive Warning Timestamp']
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
            `Keeping open <#${breakout.fields['Breakout Channel ID']}>`
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
  })
}

const closeBreakout = async (bot, message, breakout) => {
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
        console.error(err)
      }
      // we need an admin token for this b/c Hack Club's Slack settings make archiving return 'restricted_action'
      initBot(true).api.conversations.archive(
        { channel: breakout.fields['Breakout Channel ID'] },
        (err, res) => {
          if (err) {
            console.error('stage 3', err)
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
    { text: transcript('breakout'), channel: breakout.id },
    (err, res) => {
      if (err) {
        console.error(err)
      }

      airPatch('Breakout Channel', breakout.id, {
        'Last Updated Timestamp': res.ts,
        'Archive Warning Timestamp': res.ts,
      })
    }
  )
}
