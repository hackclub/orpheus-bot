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
  // const messageUrl = 'https://hackclub.slack.com/archives/DM4F8ES8P/p1629324742000400'
  // const messageUrl = 'https://hackclub.slack.com/archives/C02AJJSKVTK/p1629335289006600'
  const messageUrl = 'https://hackclub.slack.com/archives/C0274DWBZQC/p1629335857002800'
  const channel = messageUrl.split('/')[4]
  const tsString = messageUrl.split('/')[5].replace('p','')
  const ts = tsString.slice(0, 10) + '.' + tsString.slice(10, 16)

  // let updatedText
  // let shouldUpdate = false

  const zeroMessage = `\`\`\`
 💵 
  
  
  
  
\`\`\``
  const firstMessage = `\`\`\`
 💵 cheap!
  
  
  
  
\`\`\``
  const secondMessage = `\`\`\`
 💵 cheap!
  
             cheap!
  
  
\`\`\``
  const thirdMessage = `\`\`\`
 💵 cheap!
  
             cheap!
  
      cheap!
\`\`\``
  const states = [zeroMessage, firstMessage, secondMessage, thirdMessage]

  let index = 0
  setInterval(async () => {
    const text = await getMessage({channel, ts})
    index = (index + 1) % states.length
    const newText = text.replace(/(```([^`])*```)/g, states[index])
    if (newText !== text) {
      console.log('moving to state', index)
      await updateMessage({channel, ts, text: newText})
    } else {
      console.log('no change')
    }
  }, 1000)
}

export default interactionWordcloud