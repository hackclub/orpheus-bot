const interactionInfo = (bot, message) => {
  const ts = process.env.STARTUP_TIME
  bot.reply(`_Dino started at ${ts} (${Date.now() - ts} milliseconds since last incident)_`)
}

module.exports = interactionInfo