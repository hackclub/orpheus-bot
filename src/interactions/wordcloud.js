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
  initBot(true).api.chat.update(
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
  let shouldUpdate = false

  const firstMessage = ':blank: :blank: cheap!'
  const secondMessage = ':blank: :blank: :blank: :blank: cheap!'
  const thirdMessage = ':blank: cheap!'
  const newline = ' \n'
  const states = [
    newline + newline + newline + newline,
    newline + firstMessage + newline + newline + newline,
    newline + firstMessage + newline + secondMessage + newline + newline,
    newline + firstMessage + newline + secondMessage + newline + thirdMessage + newline,
  ]

  if (text.includes(states[0])) {
    updatedText = text.replace(states[0], states[1])
    console.log("I've changed to state 0 => 1")
    shouldUpdate = true
  }
  if (text.includes(states[1])) {
    updatedText = text.replace(states[1], states[2])
    console.log("I've changed to state 1 => 2")
    shouldUpdate = true
  }
  if (text.includes(states[2])) {
    updatedText = text.replace(states[2], states[3])
    console.log("I've changed to state 2 => 3")
    shouldUpdate = true
  }
  if (text.includes(states[3])) {
    updatedText = text.replace(states[3], states[0])
    console.log("I've changed to state 3 => 0")
    shouldUpdate = true
  }

  if (shouldUpdate) {
    await updateMessage({channel, ts, text: updatedText})
  } else {
    console.log("No change")
  }
}

export default interactionWordcloud