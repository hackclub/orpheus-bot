const spongebobTransform = (text) => {
  let inBracket = 0
  return text.split('').map((l, i) => {
    if (l == '<') {
      inBracket++
      return l
    } else if (l == '>') {
      inBracket--
      return l
    } else if (inBracket > 0) {
      return l
    } else {
      if (i%2==1) {
        return l
      } else {
        if (l.toUpperCase() === l) {
          return l.toLowerCase();
        } else {
          return l.toUpperCase();
        }
      }
    }
  }).join('')
}

const interactionMocking = (bot, message) => {
  return bot.replyInThread(message, ":spongebob-mocking:\n"+ spongebobTransform(message.text))
}

export default interactionMocking