const _ = require('lodash')

const interactionHello = (message, bot ) => {
  const mispellings = [
    'hellp',
    'hwllo',
    'helllo',
    'hello',
    'helli',
    'helo',
    'hell',
  ]
  // send a message back with a typo
  bot.replyAndUpdate(message, _.sample(mispellings), function(err, src, updateResponse) {
    if (err) console.error(err);
    // oh no, "hellp" is a typo - let's update the message to "hello"
    setTimeout(() => {
      updateResponse('hello', function(err) {
        console.error(err)
      });
    }, Math.random() * 5000 + 2000)
  });
}

module.exports = interactionHello