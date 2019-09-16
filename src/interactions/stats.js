import _ from 'lodash'
import { getInfoForUser, text } from '../utils'

const interactionStats = (bot, message) => {
  const { user } = message

  bot.replyAndUpdate(
    message,
    text('stats.loadingMessage'),
    (err, src, updateResponse) => {
      if (err) console.error(err)
      getInfoForUser(user)
        .then(({ leader, club, history }) => {
          setTimeout(() => {
            if (!leader || !club) {
              updateResponse(text('stats.notFound'))
              return
            }
            if (!history || !history.meetings) {
              updateResponse(text('stats.noMeeting'))
              return
            }

            const content = {
              blocks: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: `Stats for *${club.fields['Name']}*`,
                  },
                },
                {
                  type: 'divider',
                },
                {
                  type: 'image',
                  title: {
                    type: 'plain_text',
                    text: 'attendance',
                  },
                  image_url: graphUrl(history, club),
                  alt_text: 'attendance',
                },
                {
                  type: 'context',
                  elements: [
                    {
                      type: 'mrkdwn',
                      text: `Requested by <@${message.user}>`,
                    },
                  ],
                },
              ],
            }
            console.log(graphUrl(history, club))
            updateResponse(content, err => {
              if (err) console.error(err)
            })
          }, 2000)
        })
        .catch(err => {
          updateResponse(`Hmmm... something's wrong. I got \`${err}\``)
          console.error(err)
        })
    }
  )
}

const graphUrl = (history, club) => {
  const attendance = history.meetings.map(h => h.fields['Attendance'])
  const dates = history.meetings.map(h => h.fields['Date'])
  const config = {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: club.fields['Name'],
          data: attendance,
          backgroundColor: 'rgba(228,45,66,0.5)',
        },
      ],
    },
  }
  return encodeURI(
    `https://quickchart.io/chart?width=500&height=300&c=${JSON.stringify(
      config
    )}`
  )
}

export default interactionStats
