import { getInfoForUser, airPatch } from '../utils'
import { parseDate } from 'chrono-node'

const interactionMeetingTime = (bot, message) => {
  getInfoForUser(message.user).then(({ club, slackUser }) => {
    const currDay = club.fields['Checkin Day']
    const currHour = club.fields['Checkin Hour']

    const inputDate = parseDate(`${message.text} ${slackUser.tz} timezone`)
    console.log(inputDate)

    if (inputDate) {
      const updatedFields = {}
      updatedFields['Checkin Day'] = 'Monday'
      updatedFields['Checkin Hour'] = '2'
      if (!club.fields['legacy'] && club.fields['First Meeting Time']) {
        updatedFields['First Meeting Time'] = inputDate
      }

      airPatch('Clubs', club.id, updatedFields)
        .then(record => {
          bot.whisper(
            message,
            `Ok, I'll post a message in your club's channel at ${
              record.fields['Checkin Hour']
            }:00 on ${record.fields['Checkin Day']}`
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
