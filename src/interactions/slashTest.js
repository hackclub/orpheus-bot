export default (bot, message) => {
  try {
    bot.replyPrivateDelayed(message, 'initial message', (err, newMessage) => {
      console.log(newMessage)
      setTimeout(() => {
        bot.api.chat.update({
          channel: newMessage.channel,
          text: 'new text',
          ts: newMessage.ts
        })
      }, 2000)
    })
  } catch (err) {
    console.error(err)
  }
}