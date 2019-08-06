const chrono = require('chrono-node')

const interactionDate = (bot, message) => {
    const trimmedMessage = message.text.replace('date', '')
  // bot.api.users.info({ user: message.user }, (err, res) => {
    const meetingDate = chrono.parseDate(trimmedMessage)
    bot.reply(message, `I parsed that as ${meetingDate}`)
  // }
}

module.exports = interactionDate