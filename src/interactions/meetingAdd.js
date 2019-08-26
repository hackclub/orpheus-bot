import { parseDate } from 'chrono-node'

const meetingAdd = (bot, message) => {
  bot.whisper(message, { blocks: [
    {
      type: 'context',
      elements: [ {
        type: 'mrkdwn',
        text: `/meeting-add ${message.text}`
      } ]
    }
  ]})

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

  bot.whisper(message, { blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Just to confirm, is the following correct?`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Date: *${date}*`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `Attendance: *${attendance}*`
      }
    },
    {
      type: 'divider'
    },
    {
      "type": "actions",
      "elements": [{
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "✅ submit",
            "emoji": true
          },
          "value": "submit"
        },
        {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "⛔️ cancel",
            "emoji": true
          },
          "value": "cancel"
        }]
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
  ]}, (err, response) => {
    if (err) {console.error(err)}
  })
}
export default meetingAdd