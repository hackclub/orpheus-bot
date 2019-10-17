import humanizeDuration from 'humanize-duration'
import { parseDate } from 'chrono-node'

import { getInfoForUser } from '../utils'

const interactionMeetingList = (bot, message) => {
  getInfoForUser(message.user).then(({ leader, club, history }) => {
    let reply = ''

    if (history.meetings && history.meetings.length > 0) {
      reply = history.meetings
        .map(
          h =>
            `- \`${h.id}\` On *${h.fields['Date']}* _(${humanizeDuration(
              Date.now() - parseDate(h.fields['Date']),
              { largest: 1 }
            )} ago)_, with *${h.fields['Attendance']} attendees*`
        )
        .join('\n')
    }

    if (history.meetings && history.meetings.length === 0) {
      reply = `:warning: No meetings recorded for ${club.fields['Name']}`
    }

    if (!leader || !club) {
      reply =
        ":warning: This command can only be run by club leaders. You aren't registered as a club leader."
    }

    bot.replyPrivateDelayed(message, reply, (err, response) => {
      if (err) {
        console.error(err)
      }
    })
  })
}

export default interactionMeetingList
