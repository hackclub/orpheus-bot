import _ from 'lodash'
import { getInfoForUser, text } from '../utils'

const interactionStats = (bot, message) => {
  const { user } = message

  const loaderPromise = new Promise((resolve, reject) => {
    bot.replyPrivateDelayed(
      message,
      text('stats.loadingMessage'),
      (err, res) => {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      }
    )
  })

  const minWaitPromise = new Promise(resolve => {
    setTimeout(resolve, 2000)
  })

  const infoPromise = new Promise(resolve => getInfoForUser(user).then(resolve))

  Promise.all([loaderPromise, infoPromise, minWaitPromise])
    .then((res, info, _timeout) => {
      console.log('info', info)
      const { leader, club, history } = info

      if (!leader || !club) {
        bot.replyPrivateDelayed(message, text('stats.notFound'))
        return
      }
      if (!history || !history.meetings) {
        bot.replyPrivateDelayed(message, text('stats.noMeeting'))
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
      bot.replyPrivateDelayed(message, content, err => {
        if (err) throw err
      })
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, text('errors.general', { err }))
    })

  // try {
  //   bot.replyAndUpdate(
  //     message,
  //     text('stats.loadingMessage'),
  //     (err, src, updateResponse) => {
  //       if (err) {
  //         throw err
  //       }
  //       getInfoForUser(user)
  //         .then(({ leader, club, history }) => {
  //           setTimeout(() => {
  //             if (!leader || !club) {
  //               updateResponse(text('stats.notFound'))
  //               return
  //             }
  //             if (!history || !history.meetings) {
  //               updateResponse(text('stats.noMeeting'))
  //               return
  //             }

  //             const content = {
  //               blocks: [
  //                 {
  //                   type: 'section',
  //                   text: {
  //                     type: 'mrkdwn',
  //                     text: `Stats for *${club.fields['Name']}*`,
  //                   },
  //                 },
  //                 {
  //                   type: 'divider',
  //                 },
  //                 {
  //                   type: 'image',
  //                   title: {
  //                     type: 'plain_text',
  //                     text: 'attendance',
  //                   },
  //                   image_url: graphUrl(history, club),
  //                   alt_text: 'attendance',
  //                 },
  //                 {
  //                   type: 'context',
  //                   elements: [
  //                     {
  //                       type: 'mrkdwn',
  //                       text: `Requested by <@${message.user}>`,
  //                     },
  //                   ],
  //                 },
  //               ],
  //             }
  //             console.log(graphUrl(history, club))
  //             updateResponse(content, err => {
  //               if (err) console.error(err)
  //             })
  //           }, 2000)
  //         })
  //         .catch(err => {
  //           updateResponse(text('stats.error', { err }))
  //           throw { err }
  //         })
  //     }
  //   )
  // } catch (err) {
  //   console.error(err)
  //   bot.whisper(message, text('errors.general', { err }))
  // }
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
  if (dates.length < 1) {
    config.type = 'bar'
    config.options = {
      title: {
        display: true,
        text: 'No meetings yet',
      },
    }
  }
  return encodeURI(
    `https://quickchart.io/chart?width=500&height=300&c=${JSON.stringify(
      config
    )}`
  )
}

export default interactionStats
