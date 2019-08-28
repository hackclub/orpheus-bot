import { getInfoForUser } from "../utils";

const interactionMeetingTime = (bot, message) => {
  getInfoForUser(message.user).then(({ leader, club, history }) => {
    const currDay = club.fields['Checkin Day']
    const currHour = club.fields['Checkin Hour']

    if (!currDay || !currHour) {
      bot.whisper('you do not have a current meeting time set')
    }

    if (message === '' || message.includes('help')) {
      bot.whisper('This is the help message')
      return
    }
  })
}
export default interactionMeetingTime