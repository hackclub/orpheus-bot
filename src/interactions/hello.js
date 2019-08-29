import { sample } from 'lodash'

const interactionHello = (bot, message) => {
  const mispelling = sample([
    'hellp',
    'hwllo',
    'helllo',
    'hello',
    'helli',
    'helo',
    'hell',
  ])
  // send a message back with a typo
  bot.replyAndUpdate(message, mispelling, function(err, src, updateResponse) {
    if (err) {
      console.error(err)
      return
    }
    // oh no, "hellp" is a typo - let's update the message to "hello"
    setTimeout(() => {
      updateResponse('hello', function(err) {
        if (err) console.error(err)
      })
    }, Math.random() * 5000 + 2000)
  })
}

export default interactionHello
