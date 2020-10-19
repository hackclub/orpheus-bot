import { transcript } from "../utils"

const documentationURL = 'https://github.com/hackclub/orpheus-bot'

const interactionDocumentation = async (bot, message) => {
  try {

    bot.replyAndUpdate(
      message,
      'READ',
      (err, src, updateResponse) => {
        if (err) {
          console.error(err)
          return
        }
        setTimeout(() => {
          updateResponse('read MY', err => {
            if (err) console.error(err)
          })
          setTimeout(() => {
            updateResponse('read my DOCS', err => {
              if (err) console.error(err)
            })
          }, Math.random() * 1000 + 1000)
        }, Math.random() * 1000 + 1000)
      }
    )
    // let sent = await bot.reply(message, 'READ')
    // sent = await bot.updateMessage({
    //   text: 'read MY',
    //   ...sent
    // })
    // sent = await bot.updateMessage({
    //   text: 'read my DOCS',
    //   ...sent
    // })
    // sent = await bot.updateMessage({
    //   text: 'read my docs',
    //   ...sent
    // })
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}

export default interactionDocumentation