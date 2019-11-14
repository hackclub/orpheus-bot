export default (bot, message) => {
  try {
    const initialMessage = {
      "blocks": [
        {
          "type": "actions",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Post",
                "emoji": true
              },
              "value": "click_me_123"
            }
          ]
        }
      ]
    }
    bot.replyPrivateDelayed(message, initialMessage, (err, newMessage) => {
      console.log(err, newMessage)
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