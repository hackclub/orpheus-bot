import { airGet, initBot, airPatch, transcript } from '../../utils'

export default async (bot = initBot(), message) => {
  const breakoutChannels = await airGet(
    'Breakout Channel',
    '{Archived Channel Name} = BLANK()'
  )
  breakoutChannels.map(async breakout => {
    bot.replyInThread(message, `<#${breakout.fields['Breakout Channel ID']}>`)
    bot.api.conversations.history(
      { channel: breakout.fields['Breakout Channel ID'] },
      (err, res) => {
        if (err) {
          console.error('stage 1', err)
          /* do something */
        }
        const { messages } = res
        console.log(
          'Here are the timestamps lord timekeeper!',
          messages.map(m => m.ts)
        )
        const latestTimestamp = messages.map(m => m.ts).sort()[
          messages.length - 1
        ]
        const timeSinceLastUpdate = Date.now() - parseInt(latestTimestamp.split('.')[0])
        if (timeSinceLastUpdate > 1000 * 60 * 1) {
          bot.replyInThread(
            message,
            `Closing <#${breakout.fields['Breakout Channel ID']}>`
          )
          const archivedName =
            'archived-' +
            breakout.fields['Breakout Channel Name'] +
            '-' +
            new Date()
              .toISOString()
              .slice(0, 19)
              .replace(/:/g, '-')
              .replace('T', '_')
          bot.api.conversations.rename(
            {
              channel: breakout.fields['Breakout Channel ID'],
              name: archivedName,
            },
            (err, res) => {
              if (err) {
                console.error('stage 2', err)
                /* do something */
              }
              // we need an admin token for this b/c Hack Club's Slack settings make archiving return 'restricted_action'
              initBot(true).api.conversations.archive(
                { channel: breakout.fields['Breakout Channel ID'] },
                (err, res) => {
                  if (err) {
                    console.error('stage 3', err)
                    /* do something */
                  }
                  airPatch('Breakout Channel', breakout.id, {
                    'Archived Channel Name': archivedName,
                  })
                  console.log(
                    'I just archived',
                    breakout.fields['Breakout Channel ID']
                  )
                }
              )
            }
          )
        } else {
          console.log('time to update the latest ts!')
          bot.replyInThread(
            message,
            `Keeping open <#${breakout.fields['Breakout Channel ID']}>`
          )
          airPatch('Breakout Channel', breakout.id, {
            'Last Updated Timestamp': latestTimestamp,
          })
        }
      }
    )
  })
}

// When online...
// Add " Last Updated Timestamp" column to "Breakout Channel" table
// Add "Open" checkbox to "breakout channel table"
