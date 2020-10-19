import { transcript } from '../../utils'
export const names = [
  'Repl.it Hacker Plan',
  'Replit hacker plan',
  'Replit',
  'Repl.it'
]
export const details = 'Available to anyone'
export async function run(bot, message) {
  await bot.replyPrivateDelayed(message, transcript('promos.replit'))
}
