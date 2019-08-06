const interactionInfo = (bot, message) => {
  const ts = process.env.STARTUP_TIME
  bot.reply(message, `_Dino started at ${ts} (${Date.now() - ts} milliseconds since last incident)_`)

  console.log('user timezone detected as', bot.api.users.info({ user: message.user }))
}

module.exports = interactionInfo