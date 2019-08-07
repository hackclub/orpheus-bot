import { parseDate } from 'chrono-node'

const interactionDate = (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    const msg = `${message.text.replace('date', '')} ${res.user.tz}`
    const meetingDate = parseDate(msg)
    bot.reply(message, `I parsed input ${msg} as ${meetingDate}`)
  })
}

export default interactionDate