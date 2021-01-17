import { transcript } from "../utils"

const replyFancy = async ({bot, message, content}) => {
  const textSteps = content.split('').map((letter, i, array) => {
    const text = array.slice(0, i).join('') + randomFlavor(array[i])
    return transcript('documentation.formatLink', { text } )
  })

  bot.replyAndUpdate(
    message,
    textSteps[0],
    async (err, src, updateResponse) => {
      if (err) {
        console.error(err)
        return
      }
      for (const step of textSteps) {
        await new Promise((resolve,reject)=> {
          updateResponse(step, err => {
            if (err) reject(err)
            resolve()
          })
        })
      }
    }
  )
}

const randomFlavor = (l) => {
  if (!/^[a-z0-9]+$/i.test(l)) {
    return l
  }
  switch (Math.floor(Math.random() * 3)) {
    case 0:
      return `\u200b*${l.toUpperCase()}*`
    case 1:
      return `\u200b_*${l.toUpperCase()}*_`
    case 2:
      return `\u200b_${l.toUpperCase()}_`
  }
}

const replyTypo = async ({bot, message}) => {
  bot.replyAndUpdate(
    message,
    transcript('documentation.formatLink', {text: transcript('documentation.typos')}),
    (err, src, updateResponse) => {
      if (err) {
        console.error(err)
        return
      }
      setTimeout(() => {
        updateResponse(transcript('documentation.formatLink', {text: 'README'}), err => {
          if (err) console.error(err)
        })
      }, Math.random() * 5000 + 2000)
    }
  )
}

const interactionDocumentation = async (bot, message) => {
  try {
    if (Math.random() < 0.3) {
      replyTypo({bot, message})
    } else {
      await replyFancy({bot, message, content: transcript('documentation.flavor') })
    }
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}

export default interactionDocumentation