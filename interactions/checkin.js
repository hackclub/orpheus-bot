const { getInfoForUser, recordMeeting } = require('../utils.js')
const _ = require('lodash')

const interactionCheckin = (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      console.log(err)
    }

    convo.addMessage({
      delay: 500,
      text: `Give me a sec... let me pull up my database`
    })
    convo.addMessage({
      delay: 1000,
      text: `*typewriter noises*`
    })

    getInfoForUser(message.user).then(({
      leader,
      club,
      history
    }) => {
      if (!leader || !club) {
        convo.say({
          delay: 2000,
          text: `I don't have any record of you being a club leader (ಠ_ಠ)`
        })
        convo.stop()
        return
      }
      convo.addMessage({
        delay: 2000,
        text: `Found you! It's *${leader.fields['Full Name']}*, right?`
      }, 'found')
      convo.addMessage({
        delay: 2000,
        text: `From ${club.fields['Name']}`,
        action: 'date'
      }, 'found')

      convo.addMessage({
        delay: 2000,
        text: _.sample([
          'done!',
          'finished!',
          'pleasure doing business with you!',
          'See ya!',
          'cya!',
          'aloha!',
          'bye!',
          'bye bye!',
          'come back soon!',
          'until next time!',
          'adios!'
        ])
      }, 'done')

      convo.addMessage({
        delay: 2000, 
        text: 'Ok, just to confirm...\n> *Attendance:* {{vars.attendance}} hackers\n> *Meeting date:* {{{vars.date}}}'
      }, 'confirm')
      convo.addQuestion({
        text: 'Is this correct?',
        blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "Just to double check, this is what I'm about to submit to your club history record"
          }
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
                "text": "↩️ restart",
                "emoji": true
              },
              "value": "restart"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "⛔️ cancel",
                "emoji": true
              },
              "value": "cancel"
            }
          ]
        }]
      }, [{
        pattern: 'submit',
        callback: (response, convo) => {
          console.log('*user submitted their checkin!*')
          bot.replyInteractive(response, '_✅ You confirm everything is accurate_')

          convo.say("I'll write it in my notepad...")
          const { date, attendance } = convo.vars
          recordMeeting(club, { date, attendance }, (meetingRecord) => {
            console.log(meetingRecord)
            convo.say({
              text: "Got it recorded",
              action: 'done'
            })
            convo.next()
          })
        }
      }, {
        pattern: 'restart',
        callback: (response, convo) => {
          console.log('*user wants to restart their checkin*')
          bot.replyInteractive(response, '_↩️ You ask orpheus to start again_')
          bot.replyAndUpdate(response, `:beachball: _resetting time_`, (err, src, updateResponse) => {
            if (err) console.error(err)

            setTimeout(() => {
              updateResponse("Ok, you got me– I don't actually know how to restart this conversation currently")
              convo.gotoThread('done')
              convo.next()
            }, 5000)
          })
        }
      }, {
        pattern: 'cancel',
        callback: (response, convo) => {
          console.log('*user clicked "cancel"*')
          bot.replyInteractive(response, '_⛔ You ask orpheus to cancel the checkin_')
          convo.gotoThread('done')
        }
      }], {}, 'confirm')

      convo.addMessage('What day was your meeting on?', 'date')
      convo.addQuestion({
        text: 'When was your meeting?',
        blocks: [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "(You can tell me a date in `YYYY-MM-DD` format, or click a shortcut button"
            }
          },
          {
            "type": "actions",
            "elements": [{
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": `Today (${new Date(Date.now()).toLocaleDateString('en-us', { weekday: 'long' })})`
              },
              "value": "today"
            }]
          }
        ]
      }, [{
          pattern: 'today',
          callback: (response, convo) => {
            console.log('*User met today*')
            convo.setVar('date', new Date(Date.now()).toLocaleDateString())
            bot.replyInteractive(response, '_You tell orpheus you met today_')
            convo.say({
              text: `Ok, I'll record that you met today, *{{{vars.date}}}*`,
              action: 'attendance'
            })
            convo.next()
          }
        },
        {
          default: true,
          callback: (response, convo) => {
            console.log(response, convo)
            convo.repeat()
          }
        }
      ], {}, 'date')

      convo.addQuestion(`How many people showed up? (please just enter digits– I'm fragile)`, (response, convo) => {
        const attendance = +response.text
        console.log(`*User said they had "${response.text}" in attendance`)
        convo.setVar('attendance', attendance)

        convo.say({
          text: `I parsed that as *{{vars.attendance}}* hackers`,
          action: 'confirm'
        })
        convo.next()
      }, {}, 'attendance')

      convo.gotoThread('found')
    })
  })
}

module.exports = interactionCheckin