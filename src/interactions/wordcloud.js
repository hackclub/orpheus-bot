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

  const banner = `
   .d8888b.        d8888 888      8888888888       
  d88P  Y88b      d88888 888      888             
  Y88b.          d88P888 888      888             
   "Y888b.      d88P 888 888      8888888         
      "Y88b.   d88P  888 888      888             
        "888  d88P   888 888      888             
  Y88b  d88P d8888888888 888      888             
   "Y8888P" d88P     888 88888888 8888888888      `

  const bannerLines= banner.split('\n')
  const maxFrames = 50
  const contentForFrame = (frame) => {
    const updatedArray = bannerLines.map(line => {
      let currentFrame = frame % maxFrames
      return line.slice(currentFrame)+line.substring(0, currentFrame)
    })
    return updatedArray.join('\n')
  }
  // let i = 0
  // setInterval(() => {
  //   console.log(contentForFrame(i))
  //   i++

  // }, 1000)
  '  x'
  ' x '
  'x  '
  '   '

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
  // setInterval(async () => {
  //   const text = await getMessage({channel, ts})
  //   index = (index + 1) % states.length
  //   const newText = text.replace(/(```([^`])*```)/g, states[index])
  //   if (newText !== text) {
  //     console.log('moving to state', index)
  //     await updateMessage({channel, ts, text: newText})
  //   } else {
  //     console.log('no change')
  //   }
  // }, 1000)

  setInterval(async () => {
    const text = await getMessage({channel, ts})
    index+=3
    const newText = text.replace(/(```([^`])*```)/g, "```\n" + contentForFrame(index) + "\n```")
    if (newText !== text) {
      console.log('moving to frame #', index)
      await updateMessage({channel, ts, text: newText})
    } else {
      console.log('no change')
    }
  }, 1200)
}

export default interactionWordcloud