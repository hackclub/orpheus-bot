import { transcript } from '../utils'

const interactionHello = (bot, message) => {
  const { channel } = message
  if (channel == 'C0266FRGT') {
    return // #announcements
  }
  // send a message back with a typo
  bot.replyAndUpdate(
    message,
    transcript('hello'),
    (err, src, updateResponse) => {
      if (err) {
        console.error(err)
        return
      }
      // oh no, "hellp" is a typo - let's update the message to "hello"
      setTimeout(() => {
        updateResponse('hello', err => {
          if (err) console.error(err)
        })
      }, Math.random() * 5000 + 2000)
    }
  )
}

export default interactionHello
