import { getInfoForUser, transcript, getClubInfo } from '../utils'

const interactionStats = (bot, message) => {
  const { user, text } = message

  if (text.includes('help')) {
    return bot.replyPrivateDelayed(message, transcript('stats.help'))
  }

  const loaderPromise = new Promise((resolve, reject) => {
    bot.replyPrivateDelayed(
      message,
      transcript('stats.loadingMessage', { user }),
      err => {
        if (err) {
          reject(err)
        }
        resolve()
      }
    )
  })

  const minWaitPromise = new Promise(resolve => {
    setTimeout(resolve, 2000)
  })

  const taggedUserID = (text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  const taggedChannelID = (text.match(/<#([a-zA-Z0-9]*)|/) || [])[1]

  let infoPromise = getInfoForUser(user)
  if (taggedUserID) {
    infoPromise = getInfoForUser(taggedUserID)
  } else if (taggedChannelID) {
    infoPromise = getClubInfo({ channelID: taggedChannelID })
  }

  Promise.all([loaderPromise, infoPromise, minWaitPromise])
    .then(values => {
      const loadingMessage = values[0]
      const info = values[1]
      const { club, history } = info

      if (!club) {
        bot.replyPrivateDelayed(message, transcript('stats.notFound'))
        return
      }
      if (!history || !history.meetings) {
        bot.replyPrivateDelayed(message, transcript('stats.noMeeting'))
        return
      }

      const content = {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Stats for *${club.fields['Name']}* (<#${club.fields['Slack Channel ID']}>)`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `The club is <@${history.isActive ? 'active' : 'inactive'}>`,
              },
            ],
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
      bot.replyPublicDelayed(message, content, err => {
        if (err) throw err
      })
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    })

  // try {
  //   bot.replyAndUpdate(
  //     message,
  //     transcript('stats.loadingMessage'),
  //     (err, src, updateResponse) => {
  //       if (err) {
  //         throw err
  //       }
  //       getInfoForUser(user)
  //         .then(({ leader, club, history }) => {
  //           setTimeout(() => {
  //             if (!leader || !club) {
  //               updateResponse(transcript('stats.notFound'))
  //               return
  //             }
  //             if (!history || !history.meetings) {
  //               updateResponse(transcript('stats.noMeeting'))
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
  //           updateResponse(transcript('stats.error', { err }))
  //           throw { err }
  //         })
  //     }
  //   )
  // } catch (err) {
  //   console.error(err)
  //   bot.whisper(message, transcript('errors.general', { err }))
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

export const blockActions = (bot, message) => {
  const { text } = message
  console.log('deleting', message.channel, message.ts)
  bot.api.chat.delete({ channel: message.channel, ts: message.ts }, err =>
    console.error(err)
  )
  if (text === 'send') {
    // bot.say()
  }
}

export default interactionStats
