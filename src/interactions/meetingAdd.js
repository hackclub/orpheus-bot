import { parseDate } from 'chrono-node'

import { recordMeeting } from '../utils'

const getTz = (bot, user) => new Promise((resolve, reject) => {
  bot.api.users.info({ user }, (err, res) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(res.user.tz)
  })
})

const meetingAdd = (bot, message) => {
  getTz(bot, message.user).then(timeZone => {
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
      const manualMsg = "_Placeholder usage instructions_"
      bot.whisper(message, manualMsg, (err, response) => {
        if (err) {console.error(err)}
      })
      return
    }
    
    const [ rawDate, rawAttendance, ...other ] = message.text.split(',')
    const date = parseDate(rawDate)
    const dayName = date.toLocaleDateString('en-us', { weekday: 'long', timeZone })
    const mmddyyyy = date.toLocaleDateString('en-us', {timeZone})
    const attendance = parseInt((rawAttendance.match(/(\d+)/) || [])[0])
    
    console.log(date, attendance)
    bot.replyPrivate('test')
    
    bot.replyPrivate({ blocks: [
      {  
        "type":"section",
        "text":{  
          "type":"mrkdwn",
          "text":"Just to confirm, is the following correct?"
        }
      },
      {  
        "type":"divider"
      },
      {  
        "type":"section",
        "text":{  
          "type":"mrkdwn",
          "text":`Date: *${dayName} (${mmddyyyy})}*\nAttendance: *${attendance}*`
        }
      },
      {  
        "type":"divider"
      },
      {  
        "type":"actions",
        "elements":[
          {  
            "type":"button",
            "text":{  
              "type":"plain_text",
              "text":"✅ submit",
              "emoji":true
            },
            "value":"true"
          },
          {  
            "type":"button",
            "text":{  
              "type":"plain_text",
              "text":"⛔️ cancel",
              "emoji":true
            },
            "value":"false"
          }
        ]
      },
      {  
        "type":"context",
        "elements":[  
          {  
            "type":"mrkdwn",
            "text":"For help, type `/meeting-add help`"
          }
        ]
      }
    ]},[
      {
        pattern: 'true',
        callback: (response) => {
          recordMeeting(club, { date: date.mmddyyyy, attendance }, (err, meetingRecord) => {
            if (err) {
              bot.replyInteractive(response, `_⚠️ looks like something isn't working. All it says on my end is \`${err}\`._`)
            } else {
              bot.replyInteractive(response, `_✅ You confirm everything is accurate._`)
            }
          })
        }
      },
      {
        pattern: 'false',
        callback: (response) => {
          bot.replyInteractive(response, `_⛔️ You cancelled the command._`)
        }
      },
      {
        default: true,
        callback: (response) => {
          console.log('ignoring button')
        }
      }
    ])
  })
}
export default meetingAdd