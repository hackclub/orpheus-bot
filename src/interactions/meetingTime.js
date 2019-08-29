import { getInfoForUser, airPatch } from '../utils'
import { parseDate } from 'chrono-node'

const interactionMeetingTime = (bot, message) => {
  getInfoForUser(message.user).then(({ club, slackUser }) => {
    const currDay = club.fields['Checkin Day']
    const currHour = club.fields['Checkin Hour']

    const inputDate = parseDate(`${message.text}`)
    const offsetDate = new Date(
      inputDate.getTime() - slackUser.tz_offset * 1000
    )

    if (inputDate) {
      const updatedFields = {}
      updatedFields['Checkin Day'] = offsetDate.toLocaleString('en-GB', {
        weekday: 'long',
        timeZone: 'UTC',
      })
      updatedFields['Checkin Hour'] = offsetDate.getUTCHours().toString()
      if (!club.fields['legacy'] && !club.fields['First Meeting Time']) {
        updatedFields['First Meeting Time'] = offsetDate
      }

      airPatch('Clubs', club.id, updatedFields)
        .then(record => {
          bot.whisper(
            message,
            `Ok, I'll post a message in your club's channel around ${
              record.fields['Checkin Hour']
            }:00 on ${record.fields['Checkin Day']} Coordinated Universal Time`
          )
        })
        .catch(err => {
          bot.whisper(message, `Got error: \`${err}\``)
        })
    } else {
      bot.whisper(
        message,
        `Use this command to record when your meetings will occur each week. Ex. \`/meeting-time next Tuesday at 3:30 PM\``
      )

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
