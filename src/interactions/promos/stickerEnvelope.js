import { transcript } from '../../utils'
import interactionMailMission from '../mailMission'
import interactionTutorial from '../tutorial'

export const names = ['Sticker Envelope']
export const details =
  'Available to club leaders. Optionally include a note to the nodemaster packing your order.'
export async function run(bot, message) {
  const { user } = message

  const note = message.text.replace(/sticker envelope/i, '')

  await interactionMailMission(undefined, {
    user,
    text: 'sticker_envelope',
    note,
  })

  await bot.replyPrivateDelayed(
    message,
    transcript('promos.stickerEnvelope.success', { note })
  )

  await interactionTutorial(bot, message)
}
