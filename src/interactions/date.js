import { parseDate } from 'chrono-node'
import { getInfoForUser } from '../utils'

const interactionDate = (bot, message) => {
  getInfoForUser(message.user).then(({ slackUser }) => {
    const meetingDate = parseDate(message.text + ' ' + slackUser.tz_label)
    console.log(message.text, slackUser.tz_label)
    bot.reply(message, `I parsed input ${message.text} as ${meetingDate}`)
  })
}

export default interactionDate
