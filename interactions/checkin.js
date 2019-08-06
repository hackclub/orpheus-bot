const { getInfoForUser, recordMeeting } = require('../utils.js')
const _ = require('lodash')
const chrono = require('chrono-node')

const getToday = (bot, user) => new Promise((resolve, reject) => {
  bot.api.users.info({ user }, (err, res) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    const timeZone = res.user.tz
    const today = new Date(Date.now())
    resolve({
      timeZone,
      dayName: today.toLocaleDateString('en-us', { weekday: 'long', timeZone }),
      mmddyyyy: today.toLocaleDateString('en-us', { timeZone })
    })
  })
})

const interactionCheckin = (bot, message) => {
  getToday(bot, message.user).then((today) => {
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
          text: 'Ok, just to confirm...\n> *Attendance:* {{vars.attendance}} hackers\n> *Meeting date:* {{{vars.date.mmddyyyy}}}'
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
            const reply = _.sample([
              'grins with delight',
              'fidgets in mild excitement',
              'fumbles around with her large stubby arms for a pencil and paper',
              'sifts through the Permian layer to find her notes'
            ])
            bot.replyInteractive(response, `_✅ You confirm everything is accurate as orpheus ${reply}._`)

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

            const reply = _.sample([
              'She looks slightly crestfallen',
              'She promptly tears up the paper on her desk and eats it',
              'She tosses the notes on her desk into her mouth and starts chewing',
              '*VRRRRR* She raises her arm and swipes all the papers off the table into the hungry paper shredder lying by her table.',
            ])
            bot.replyInteractive(response, `_⛔ You ask orpheus to cancel the checkin. ${reply}._`)
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
                "text": "(You can tell me a date in `YYYY-MM-DD` format, say things like `last tuesday`, or click a shortcut button"
              }
            },
            {
              "type": "actions",
              "elements": [{
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": `Today (${today.dayName}, ${today.mmddyyyy})`
                },
                "value": 'today'
              }]
            }
          ]
        }, [{
            pattern: 'today',
            callback: (response, convo) => {
              console.log(`*User met today, ${today}*`)
              convo.setVar('date', today)
              bot.replyInteractive(response, '_You tell orpheus you met today_')
              convo.say({
                text: `Ok, I'll record that you met today, *{{vars.date.dayName}}*`,
                action: 'attendance'
              })
              convo.next()
            }
          },
          {
            default: true,
            callback: (response, convo) => {
              // attempt to parse
              const meetingDate = chrono.parseDate(response.text)
              if (meetingDate) {
                convo.setVar('date', meetingDate)
                convo.say({
                  text: `Ok, I'll record that you met *{{vars.date.dayName}} ({{{vars.date.mmddyyyy}}})*`,
                  action: 'attendance'
                })
              convo.next()
              } else {
                console.log(response, convo)
                convo.repeat()
              }
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
  })
}

module.exports = interactionCheckin