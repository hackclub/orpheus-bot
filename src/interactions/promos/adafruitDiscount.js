import { transcript } from '../../utils'

export const names = [
  'Adafruit',
  'Adafruit Discount',
  'Cheap Adafruit',
  'Discounted Adafruit',
]
export const details = 'Available to anyone'
export async function run(bot, message) {
  await bot.replyPrivateDelayed(message, transcript('promos.notion'))
}
