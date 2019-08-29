import { parseDate } from 'chrono-node'
import { getInfoForUser } from '../utils'

const interactionDate = (bot, message) => {
  getInfoForUser(message.user).then(({ slackUser }) => {
    const msg = `${message.text.replace('date', '')} ${slackUser.tz}`
    const meetingDate = parseDate(msg)
    bot.reply(message, `I parsed input ${msg} as ${meetingDate}`)
  })
}

export default interactionDate
