import { getInfoForUser } from "../utils";

const meetingListInteraction = (bot, message) => {

  getInfoForUser(user).then(({ leader, club, history }) => {
    let reply = ''

    if (history.meetings && history.meetings.length > 0) {
      reply = history.meetings.map(h => `- On *${h.fields['Date']}*, with *${h.fields['Attendance']} attendees*`).join("\n")
    }

    if (history.meetings && history.meetings.length === 0) {
      reply = `:warning: No meetings recorded for ${club.fields['Name']}`
    }

    if (!leader || !club) {
      reply = ":warning: This command can only be run by club leaders. You aren't registered as a club leader."
    }

    bot.whisper(message, reply, (err, response) => {
      if (err) {console.error(err)}
    })
  })
}

export default meetingListInteraction