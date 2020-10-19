import { transcript } from "../utils"

const replyFancy = async ({bot, message, textSteps}) => {
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
      return ` *${l.toUpperCase()}*`
    case 1:
      return ` **${l.toUpperCase()}**`
    case 2:
      return ` _${l.toUpperCase()}_`
  }
}

const interactionDocumentation = async (bot, message) => {
  try {
    const content = transcript('documentation.flavor')
    const textSteps = content.split('').map((letter, i, array) => {
      const text = array.slice(0, i).join('') + randomFlavor(array[i])
      return transcript('documentation.formatLink', { text } )
    })

    await replyFancy({bot, message, textSteps})
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}

export default interactionDocumentation