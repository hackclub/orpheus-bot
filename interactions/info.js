const interactionInfo = (bot, message) => {
  bot.say(`_Dino started at ${STARTUP_TIME} (${Date.now() - STARTUP_TIME} milliseconds since last incident)_`)
}

modules.export = interactionInfo