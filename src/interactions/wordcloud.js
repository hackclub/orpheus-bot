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
  const maxFrames = bannerLines[1].length
  const contentForFrame = (frame) => {
    let currentFrame = frame % maxFrames
    const updatedArray = bannerLines.map(line => {
      return line.slice(currentFrame)+line.substring(0, currentFrame)
    })
    return updatedArray.join('\n')
  }

  let index = 0
  setInterval(async () => {
    const messageUrl = process.env.WORDCLOUD_URL
    const channel = messageUrl.split('/')[4]
    const tsString = messageUrl.split('/')[5].replace('p','')
    const ts = tsString.slice(0, 10) + '.' + tsString.slice(10, 16)
    const text = await getMessage({channel, ts})
    index = index+3
    let currentContent = contentForFrame(index)
    console.log(currentContent)
    let newText = text.replace(/(```([^`])*```)/g, "```\n" + currentContent + "\n```")
    if (newText.includes('*STARTING YOUR OWN HACK CLUB.*')) {
      console.log('condition 1')
      newText = newText.replace('*STARTING YOUR OWN HACK CLUB.*', 'STARTING YOUR OWN HACK CLUB.')
    } else {
      console.log('condition 2')
      newText = newText.replace('STARTING YOUR OWN HACK CLUB.', '*STARTING YOUR OWN HACK CLUB.*')
    }
    console.log('testing frame #', index)
    if (newText !== text) {
      console.log('moving to frame #', index)
      await updateMessage({channel, ts, text: newText})
    } else {
      console.log('no change')
    }
  }, 2000)
}

export default interactionWordcloud