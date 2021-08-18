import { initBot } from '../utils'

const getMessage = ({channel, ts}) => new Promise((resolve, reject) => {
  initBot().api.conversations.history(
    {
      channel,
      latest: ts,
      inclusive: true,
      limit: 1,
    },
    (err, res) => {
      if (err) reject(err)
      const message = res.messages[0]
      if (!message || message.ts != ts) {
        reject(new Error('message not found'))
      }
      resolve(message.text)
    }
  )
})

const updateMessage = ({channel, ts, text}) => new Promise((resolve, reject) => {
  initBot(true).api.conversations.chat.update(
    {
      channel,
      ts,
      text,
    },
    (err, res) => {
      if (err) reject(err)
      resolve(res)
    }
  )
})

const interactionWordcloud = async (bot = initBot(true), message) => {
  const messageUrl = 'https://hackclub.slack.com/archives/DM4F8ES8P/p1629324742000400'
  const channel = messageUrl.split('/')[4]
  const tsString = messageUrl.split('/')[5].replace('p','')
  const ts = tsString.slice(0, 10) + '.' + tsString.slice(10, 16)

  const text = await getMessage({channel, ts})
  let updatedText

  if (text.includes('state 1')) {
    updatedText = text.replace("state 1", "state 2")
    console.log("I've changed to state 2")
  }
  if (text.includes('state 2')) {
    updatedText = text.replace("state 2", "state 1")
    console.log("I've changed to state 1")
  }

  await updateMessage({channel, ts, text: updatedText})
}

export default interactionWordcloud