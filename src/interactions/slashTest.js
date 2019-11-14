export default (bot, message) => {
  try {
    const initialMessage = {
      "blocks": [
        {
          "type": "actions",
          "block_id": "stats",
          "elements": [
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Send",
                "emoji": true
              },
              "value": "send"
            },
            {
              "type": "button",
              "text": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
              },
              "value": "cancel"
            },
          ]
        }
      ]
    }
    bot.replyPrivateDelayed(message, initialMessage, (err, newMessage) => {
      console.log(err, newMessage)
      setTimeout(() => {
        // bot.api.chat.update({
        //   channel: newMessage.channel,
        //   text: 'new text',
        //   ts: newMessage.ts
        // })
      }, 2000)
    })
  } catch (err) {
    console.error(err)
  }
}