import { initBot } from '../utils'

const getMessage = ({channel, ts}) => new Promise((resolve, reject) => {
  initBot(true).api.conversations.history(
    {
      channel,
      latest: ts,
      inclusive: true,
      limit: 1,
    },
    (err, res) => {
      if (err) reject(err)
      const message = res.messages[0]
      if (!message || message.ts != latest) {
        reject(new Error('message not found'))
      }
      resolve(message.text)
    }
  )
})

const interactionWordcloud = async (bot = initBot(true), message) => {
  const messageUrl = 'https://hackclub.slack.com/archives/DM4F8ES8P/p1629324742000400'
  const channel = messageUrl.split('/')[4]
  const tsString = messageUrl.split('/')[5].replace('p','')
  const ts = tsString.slice(0, 10) + '.' + tsString.slice(10, 16)

  const text = await getMessage({channel, ts})
  console.log({text})
}

export default interactionWordcloud