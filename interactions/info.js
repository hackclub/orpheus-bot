const interactionInfo = (bot, message) => {
  bot.reply(`_Dino started at ${STARTUP_TIME} (${Date.now() - STARTUP_TIME} milliseconds since last incident)_`)
}

module.exports = interactionInfo