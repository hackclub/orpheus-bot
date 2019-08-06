const chrono = require('chrono-node')

const interactionDate = (bot, message) => {
  // bot.api.users.info({ user: message.user }, (err, res) => {
    const meetingDate = chrono.parse(message.text)
    console.log(`"${message.text}" parsed as ${meetingDate}`)
    bot.reply(message, `I parsed that as ${meetingDate}`)
  // }
}

module.exports = interactionDate