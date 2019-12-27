const interactionPromo = (bot, message) => {
  const { text } = message
  bot.replyPrivateDelayed(
    message,
    `/promo has been renamed to /get. Try running "/get ${text}"`
  )
}
export default interactionPromo
