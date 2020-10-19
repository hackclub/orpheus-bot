import { parseDate } from 'chrono-node'

import { getInfoForUser, airPatch, transcript } from '../utils'

const interactionMeetingTime = (bot, message) => {
  const { user, text } = message

  if (text === '' || text === 'help') {
    bot.replyPrivateDelayed(message, transcript('meetingTime.help'))
    return
  }

  getInfoForUser(user).then(({ leader, club, slackUser, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.replyPrivateDelayed(message, transcript('meetingTime.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} doesn't have a club`)
      bot.replyPrivateDelayed(message, transcript('meetingTime.invalidClub'))
      return
    }

    const currDay = club.fields['Checkin Day']
    const currHour = club.fields['Checkin Hour']

    const inputDate = parseDate(text)

    if (inputDate) {
      const offsetDate = new Date(
        inputDate.getTime() - slackUser.tz_offset * 1000
      )
      const updatedFields = {
        'Checkin Hour': offsetDate.getUTCHours().toString(),
        'First Meeting Time': offsetDate,
        'Checkin Day': offsetDate.toLocaleString('en-GB', {
          weekday: 'long',
          timeZone: 'UTC',
        }),
      }

      airPatch('Clubs', club.id, updatedFields)
        .then(record => {
          bot.replyPrivateDelayed(
            message,
            transcript('meetingTime.success', {
              offsetDate,
              channelID: club.fields['Slack Channel ID'],
            }),
            (err, res) => {
              if (err) {
                throw err
              }

            }
          )
        })
        .catch(err => {
          bot.replyPrivateDelayed(message, transcript('errors.memory', { err }))
        })
    } else {
      bot.replyPrivateDelayed(message, transcript('meetingTime.parsingError'))

      if (!currDay || !currHour) {
        bot.replyPrivateDelayed(
          message,
          `_Currently, ${club.fields['Name']} doesn't have a meeting time set_`
        )
      } else {
        bot.replyPrivateDelayed(
          message,
          `_The club's current meeting time is *${currDay}* at *${currHour}:00*_`
        )
      }
    }
  })
}
export default interactionMeetingTime
