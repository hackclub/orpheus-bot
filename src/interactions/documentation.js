import { transcript } from "../utils"

const documentationURL = 'https://github.com/hackclub/orpheus-bot'

const interactionDocumentation = async (bot, message) => {
  try {
    let sent = await bot.reply(message, 'READ')
    sent = await bot.updateMessage({
      text: 'read MY',
      ...sent
    })
    sent = await bot.updateMessage({
      text: 'read my DOCS',
      ...sent
    })
    sent = await bot.updateMessage({
      text: 'read my docs',
      ...sent
    })
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}

export default interactionDocumentation