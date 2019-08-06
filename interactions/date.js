const chrono = require('chrono-node')

const interactionDate = (bot, message) => {
  const trimmedMessage = message.text.replace('date', '')
  console.log(trimmedMessage)
  // bot.api.users.info({ user: message.user }, (err, res) => {
    const meetingDate = chrono.parse(trimmedMessage)
    console.log(`"${trimmedMessage}" parsed as ${JSON.stringify(meetingDate)}`)
    bot.reply(message, "I parsed that as `" + JSON.stringify(meetingDate) + "`")
  // }
}

module.exports = interactionDate