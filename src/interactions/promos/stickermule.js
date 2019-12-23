import { getInfoForUser, transcript } from '../../utils'

export const names = ['StickerMule credit', 'sticker mule', 'stickermule']
export const details = 'Available to club leaders'
export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)
  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickermule.notAuthorized')
    )
    return
  }

  await bot.replyPrivateDelayed(
    message,
    transcript('promos.stickermule.success')
  )
}
