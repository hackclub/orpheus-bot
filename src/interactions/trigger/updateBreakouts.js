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
          /* do something */
        }
        const { messages } = res
        console.log("Here are the timestamps lord timekeeper!", messages.map(m => m.ts))
        const latestTimestamp = messages.map(m => m.ts).sort()[messages.length - 1]
        if (latestTimestamp == breakout.fields['Last Updated Timestamp']) {
          bot.replyInThread(
            message,
            `Closing <#${breakout.fields['Breakout Channel ID']}>`
          )
          airPatch('Breakout Channel', breakout.id, {
            Open: false,
          })
          bot.api.conversations.rename(
            {
              channel: breakout.fields['Breakout Channel ID'],
              name: 'archived-' + breakout.fields['Breakout Channel Name'],
            },
            (err, res) => {
              if (err) {
                /* do something */
              }
              bot.api.conversations.archive(
                { channel: breakout.fields['Breakout Channel ID'] },
                (err, res) => {
                  if (err) {
                    /* do something */
                  }
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
