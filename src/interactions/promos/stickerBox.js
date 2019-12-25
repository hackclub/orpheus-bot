import { getInfoForUser, transcript } from '../../utils'
import interactionMailMission from '../mailMission'
import interactionTutorial from '../tutorial'

export const names = ['Sticker Box']
export const details =
  'Available to club leaders. Must include a note to the nodemaster packing your order.'
export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)
  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerBox.notAuthorized')
    )
    return
  }

  const note = message.text.replace(/sticker box/i, '')

  if (!note) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerBox.noNote')
    )
    return
  }

  await interactionMailMission(undefined, {
    user,
    text: 'sticker_box',
    note,
  })

  await bot.replyPrivateDelayed(
    message,
    transcript('promos.stickerBox.success', { note })
  )

  await interactionTutorial(bot, message)
}
