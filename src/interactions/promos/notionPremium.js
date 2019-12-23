export const names = [
  'Notion Premium account',
  'notion',
  'free notion',
  'notion premium',
]
export const details = 'Available to anyone'
export async function run(bot, message) {
  await bot.replyPrivateDelayed(message, transcript('promos.notion'))
}
