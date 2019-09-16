const interactionInfo = (bot, message) => {
  const ts = process.env.STARTUP_TIME

  bot.reply(
    message,
    `_Dino started at ${ts} (${Math.round(
      (Date.now() - ts) / 1000 / 60
    )} minutes since last incident)_`
  )
}

export default interactionInfo
