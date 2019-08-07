const interactionInfo = (bot, message) => {
  const ts = process.env.STARTUP_TIME
  bot.reply(message, `_Dino started at ${ts} (${Date.now() - ts} milliseconds since last incident)_`)
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (err) console.error(err)
    const user = res.user

    console.log(user)
  })
}

export default interactionInfo