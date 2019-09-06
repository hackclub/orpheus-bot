const interactionInfo = (bot, message) => {
  const ts = process.env.STARTUP_TIME
  bot.reply(
    message,
    `_Dino started at ${ts} (${Math.round(
      (Date.now() - ts) / 1000 / 60
    )} minutes since last incident)_`
  )
  bot.api.apps.permissions.scopes.list((err, res) => {
    if (err) { console.error(err) }
    bot.reply(message, `
\`\`\`
${res.scopes}
\`\`\`
    `)
  })
  bot.api.users.info({ user: message.user }, (err, res) => {
    if (err) console.error(err)
    const user = res.user

    console.log(user)
  })
}

export default interactionInfo
