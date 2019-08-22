import { parseDate } from 'chrono-node'

const meetingAdd = (bot, message) => {
  bot.replyAcknowledge()

  if (message.text.indexOf(',') === -1) {
    // either the user typed "help" or an incorrectly formatted command
    const manual = "_Placeholder usage instructions_"
    bot.whisper(message, manual, (err, response) => {
      if (err) {console.error(err)}
    })
    return
  }

  const [ rawDate, rawAttendance, ...other ] = message.text.split(',')
  const date = parseDate(rawDate)
  const attendance = parseInt(rawAttendance.match(/(\d+)/)[0])

  bot.whisper(message, {
    blocks: [{
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `This is the *CONFIRMATION STAGE*`
        }
      },
      {
        type: 'divider'
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: 'For help, type `/meeting-add help`'
          }
        ]
      }
    ]
  }, (err, response) => {
    if (err) {console.error(err)}
  })
}
export default meetingAdd