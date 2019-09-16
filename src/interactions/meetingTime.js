import { getInfoForUser, airPatch, text as transcript } from '../utils'
import { parseDate } from 'chrono-node'
import interactionCheckinNotification from './checkinNotification'

const interactionMeetingTime = (bot, message) => {
  const { user, text } = message

  if (text === '' || text === 'help') {
    bot.whisper(message, transcript('meetingTime.help'))
    return
  }

  getInfoForUser(user).then(({ leader, club, slackUser, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.whisper(message, transcript('meetingTime.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} doesn't have a club`)
      bot.whisper(message, transcript('meetingTime.invalidClub'))
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
          bot.whisper(
            message,
            transcript('meetingTime.success', {
              hour: record.fields['Checkin Hour'],
              day: record.fields['Checkin Day'],
            }),
            (err, res) => {
              if (err) {
                throw err
              }

              // Check if this is part of the tutorial
              if (!userRecord.fields['Flag: Tutorial /meeting-time']) {
                bot.whisper(
                  message,
                  transcript('tutorial.setMeetingTime', {
                    channel: record.fields['Slack Channel ID'],
                  })
                )

                setTimeout(() => {
                  interactionCheckinNotification(undefined, {
                    channel: record.fields['Slack Channel ID'],
                    user,
                  })
                }, 4000)

                userRecord
                  .patch({ 'Flag: Tutorial /meeting-time': true })
                  .catch(err => {
                    throw err
                  })
              }
            }
          )
        })
        .catch(err => {
          bot.whisper(message, transcript('errors.memory', { err }))
        })
    } else {
      bot.whisper(message, transcript('meetingTime.parsingError'))

      if (!currDay || !currHour) {
        bot.whisper(
          message,
          `_Currently, ${club.fields['Name']} doesn't have a meeting time set_`
        )
      } else {
        bot.whisper(
          message,
          `_The club's current meeting time is *${currDay}* at *${currHour}:00*_`
        )
      }
    }
  })
}
export default interactionMeetingTime
