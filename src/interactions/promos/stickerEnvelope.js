import { transcript, airFind, getInfoForUser } from '../../utils'
import interactionMailMission from '../mailMission'
import interactionTutorial from '../tutorial'
import interactionAddress from '../address'

export const names = ['Sticker Envelope']
export const details =
  'Available to anyone in the Slack. Optionally include a note to the nodemaster packing your order.'
export async function run(bot, message) {
  const { user } = message

  const { personAddress } = await getInfoForUser(user)
  const formula = `AND(${[
    `{Scenario Name}='Sticker Envelope'`,
    `{Receiver Address}='${personAddress.fields['ID']}'`,
    `OR('1 Unassigned'={Status},'2 Assigned'={Status},'3 Purchased'={Status})`,
  ].join(',')})`
  const existingMission = await airFind('Mail Missions', formula)

  const note = message.text.replace(/sticker envelope/i, '')

  if (existingMission) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.alreadyOrdered')
    )
  } else {
    await interactionMailMission(undefined, {
      user,
      text: 'sticker_envelope',
      note,
    })

    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.success')
    )
  }

  if (personAddress.fields['Missing Fields']) {
    await interactionAddress(bot, message)
  }

  await interactionTutorial(bot, message)
}
