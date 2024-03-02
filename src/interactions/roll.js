import { roll }  from 'dnd5e-dice-roller'
import { transcript } from '../utils'

export default async (bot, message) => {
  try {
    const rollResult = roll(message.text)
    const rollType = transcript('roll.rollTypes')
    bot.replyPrivateDelayed(
      message,
      transcript('roll.result', { rollResult, rollType })
    )
  } catch(e) {
    bot.replyPrivateDelayed(message, transcript('roll.help'))
    console.error(e)
  }
}