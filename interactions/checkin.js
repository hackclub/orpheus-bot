const { getInfoForUser } = require('../utils.js')

const interactionCheckin = (bot, message) => {
  bot.startConversation(message, (err, convo) => {
    if (err) {
      console.log(err)
    }

    convo.say({
      delay: 500,
      text: `Give me a sec... let me pull up my database`
    })
    convo.say({
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
      }

      convo.say({
        delay: 2000,
        text: `Found you! It's *${leader.fields['Full Name']}*, right?`
      })

      convo.say({
        delay: 2000,
        text: `From ${club.fields['Name']}`
      })

      convo.ask({
        delay: 2000,
        text: 'When was your meeting?',
        blocks: [{
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "What day was it on? (You can tell me a date in `YYYY-MM-DD` format, or click a shortcut button"
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
            bot.replyInteractive(response, '_You tell orpheus you met today_')
            convo.gotoThread('attendance')
          }
        },
        {
          default: true,
          callback: (response, convo) => {
            console.log(response, convo)
            convo.repeat()
          }
        }
      ])

      convo.ask(`How many people showed up? (please just enter digits– I'm fragile)`, (response, convo) => {
        const attendance = +response.text

        convo.say(`I parsed that as *${attendance}* hackers`)
      }, 'attendance')
    })
  })
}

module.exports = interactionCheckin