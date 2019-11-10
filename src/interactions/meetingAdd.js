import { parseDate } from 'chrono-node'

import { recordMeeting, getInfoForUser, transcript, initBot } from '../utils'

const reactOnSuccess = ({club, history})=> {
  const channel = club.fields['Slack Channel ID']
  const meetingCount = history.meetings.length + 1 // Increase by one because we've just successfully added a new club meeting

  const p = new Promise(resolve => {
    initBot(true).api.conversations.info({ channel }, (err, res) => {
      if (!err && res.channel && res.channel.name) {
        resolve(res.channel.name)
      }
    })
    initBot(true).api.channels.info({ channel }, (err, res) => {
      if (!err && res.channel && res.channel.name) {
        resolve(res.channel.name)
      }
    })
  })
    .then(
      channelName =>
        new Promise((resolve, reject) => {
          initBot(true).api.search.messages(
            {
              query: `"you are responsible" in:#${channelName}`,
              count: 1,
              sort: 'timestamp',
            },
            (err, res) => {
              if (err) {
                reject(err)
              } else {
                resolve(res.messages.matches[0])
              }
            }
          )
        })
    )
    .then(message => {
      initBot().api.reactions.add(
        {
          timestamp: message.ts,
          channel: message.channel.id,
          name: 'white_check_mark',
        },
        err => {
          if (err) {
            console.error(err)
          }
        }
      )

      console.log(message)
      initBot().replyInThread(
        {channel: message.channel.id},
        `${transcript(
          'meetingAdd.successThread.confirmation'
        )} ${transcript('meetingAdd.successThread.count', { meetingCount })}`,
          err => {
            if (err) {
              console.error(err)
            }
          }
      )
    })
}

const interactionMeetingAdd = (bot, message) => {
  getInfoForUser(message.user).then(({ club, history, slackUser }) => {
    if (message.text.indexOf(',') === -1) {
      // either the user typed "help" or an incorrectly formatted command
      bot.replyPrivateDelayed(
        message,
        transcript('meetingAdd.help', { day: history.lastMeetingDay }),
        (err, response) => {
          if (err) {
            console.error(err)
          }
        }
      )
      return
    }

    const [rawDate, rawAttendance, ...other] = message.text.split(',')
    const date = parseDate(rawDate)
    const dayName = date.toLocaleDateString('en-us', {
      weekday: 'long',
      timeZone: slackUser.tz,
    })
    const mmddyyyy = date.toLocaleDateString('en-us', {
      timeZone: slackUser.tz,
    })
    const attendance = parseInt((rawAttendance.match(/(\d+)/) || [])[0])

    recordMeeting(
      club,
      { date: mmddyyyy, attendance },
      (err, meetingRecord) => {
        if (err) {
          console.error(err)
          bot.replyPrivateDelayed(message, `Got error: \`${err}\``)
          return
        }

        const formUrl = `https://airtable.com/shrMyUEbqWXqImXE3?prefill_Meeting+ID=${meetingRecord.id}`
        bot.replyPrivateDelayed(
          message,
          transcript('meetingAdd.success', { formUrl })
        )

        reactOnSuccess({club, history})
      }
    )
    return

    bot.replyPrivate(
      message,
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Just to confirm, is the following correct?',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Date: *${dayName} (${mmddyyyy})}*\nAttendance: *${attendance}*`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '✅ submit',
                  emoji: true,
                },
                value: 'true',
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '⛔️ cancel',
                  emoji: true,
                },
                value: 'false',
              },
            ],
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'For help, type `/meeting-add help`',
              },
            ],
          },
        ],
      },
      [
        {
          pattern: 'true',
          callback: response => {
            recordMeeting(
              club,
              { date: date.mmddyyyy, attendance },
              (err, meetingRecord) => {
                if (err) {
                  bot.replyInteractive(
                    response,
                    `_⚠️ looks like something isn't working. All it says on my end is \`${err}\`._`
                  )
                } else {
                  bot.replyInteractive(
                    response,
                    `_✅ You confirm everything is accurate._`
                  )
                }
              }
            )
          },
        },
        {
          pattern: 'false',
          callback: response => {
            bot.replyInteractive(response, `_⛔️ You cancelled the command._`)
          },
        },
        {
          default: true,
          callback: response => {
            console.log('ignoring button')
          },
        },
      ]
    )
  })
}

export default interactionMeetingAdd
