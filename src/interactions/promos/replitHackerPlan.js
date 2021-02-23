import { transcript, getInfoForUser } from '../../utils'

export const names = [
  'Replit',
  'Repl.it',
  'Repl.it Hacker Plan',
  'Replit Hacker Plan',
  'Repl.it Hacker',
  'Replit Hacker'
]

export const details = 'Available for club leaders to give their members'
export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)

  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.replit.notAuthorized')
    )
    return
  }

  await bot.replyPrivateDelayed(message, transcript('promos.replit.success'))
}
