import _ from 'lodash'
import { getInfoForUser } from '../utils'

const interactionStats = (bot, message) => {
  const { user } = message

  bot.replyAcknowledge()

  const loadingMessage = _.sample([
    'chugging the data juice',
    'crunching the numbers',
    'gurgling the bits',
    'juggling the electrons',
    'reticulating the splines',
    'rolling down data hills',
    'skiing the data slopes',
    'zooming through the cyber-pipes',
    'grabbing the stats'
  ])

  bot.replyAndUpdate(message, `:beachball: _${loadingMessage}_`, (err, src, updateResponse) => {
    if (err) console.error(err)
    getInfoForUser(user).then(({leader, club, history}) => {
      setTimeout(() => {
        if (!leader || !club) {
          updateResponse(_.sample([
            ":confused-dino: I can't find you in my files",
            ":confused-dino-2: I don't see your records",
            ":angry-dino: you aren't a registered leader– what are you trying to pull here?"
          ]))
          return
        }

        const content = {
          blocks: [{
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Stats for *${club.fields['Name']}*`
              }
            },
            {
              type: 'divider'
            },
            {
              type: "image",
              title: {
                type: "plain_text",
                text: "attendance"
              },
              image_url: graphUrl(history, club),
              alt_text: "attendance"
            }
          ]
        }
        console.log(graphUrl(history, club))
        updateResponse(content, err => {
          console.error(err)
        })
      }, 2000)
    }).catch(err => console.error(err))
  })
}

const graphUrl = (history, club) => {
  const attendance = history.meetings.map(h => h.fields['Attendance'])
  const dates = meetings.map(h => h.fields['Date'])
  const config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: club.fields['Name'],
        data: attendance,
        backgroundColor: 'rgba(228,45,66,0.5)'
      }]
    }
  }
  return encodeURI(`https://quickchart.io/chart?width=500&height=300&c=${JSON.stringify(config)}`)
}

export default interactionStats