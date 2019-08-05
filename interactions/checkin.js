const { getInfoForUser } = require('../utils.js')

const interactionCheckin = (message, bot) => {
  bot.startConversation(message, (err, convo) => {
    if(err) {console.log(err)}

    convo.say({
      delay: 500,
      text: `Give me a sec... let me pull up my database`
    })
    convo.say({
      delay: 2000,
      text: `*typewriter noises*`
    })

    getInfoForUser(user).then(({leader, club, history}) => {
      if (leader) {
        convo.say({
          delay: 2000,
          text: `Found you! It's *${leader.fields['Full Name']}*, right?`
        })
        if (club) {
          convo.say({
            delay: 2000,
            text: `From ${club.fields['Name']}`
          }, 'checkin_w_leader')

          convo.ask({
            delay: 2000,
            text: 'Have you had a club meeting since then?',
            blocks: [
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Want to add another meeting?"
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "actions",
                "elements": [
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "Yep :hack_club:",
                      "emoji": true
                    },
                    "value": "yes"
                  },
                  {
                    "type": "button",
                    "text": {
                      "type": "plain_text",
                      "text": "No :laptop_fire:",
                      "emoji": true
                    },
                    "value": "no"
                  }
                ]
              }
            ]
          }, [
            {
              pattern: bot.utterances.yes,
              callback: (response, convo) => {
                console.log('*User clicks the yes button*')
                bot.replyInteractive(response, '*you do want to click the buttons*')
              }
            },
            {
              pattern: bot.utterances.no,
              callback: (response, convo) => {
                console.log('*User clicks the no button*')
                bot.replyInteractive(response, '_and no button clicking was had_')
              }
            },
            {
              default: true,
              callback: (response, convo) => {
                console.log(response, convo)
              }
            }
          ])

        } else {
          convo.say({
            delay: 4000,
            text: `Hmmm.... I don't see a club record under your name`
          })
        }
      } else {
        convo.say({
          delay: 2000,
          text: `I don't have any record of you being a club leader (ಠ_ಠ)`
        })
      }
    })
  })
}

module.exports = interactionCheckin