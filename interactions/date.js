const chrono = require('chrono-node')

const interactionDate = (bot, message) => {
  bot.api.users.info({ user: message.user }, (err, res) => {
    const msg = `${message.text.replace('date', '')} ${res.user.tz}`
    const meetingDate = chrono.parseDate(msg)
    bot.reply(message, `I parsed input ${msg} as ${meetingDate}`)
  }
}

module.exports = interactionDate 