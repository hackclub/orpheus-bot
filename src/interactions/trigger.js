const triggerInteraction = (bot, message) => {
  // TODO ensure admin & zap only

  console.log('*orpheus hears her heart beat in her chest*')

  bot.api.reactions.add({
    timestamp: message.tx,
    channel: message.channel,
    name: 'white_check_mark'
  })
}

export default triggerInteraction