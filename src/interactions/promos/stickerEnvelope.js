import { transcript, airFind, getInfoForUser } from '../../utils'
import interactionMailMission from '../mailMission'
import interactionTutorial from '../tutorial'
import interactionAddress from '../address'

export const names = ['Sticker Envelope']
export const details =
  'Available to active club leaders.'
export async function run(bot, message) {

  const creator = await getInfoForUser(message.user)

  if (!creator.leader || !creator.club) {
    await bot.replyPrivateDelayed(message, transcript('promos.stickerEnvelope.notAuthorized'))
    return
  }

  let recipientID = message.text.replace(/sticker envelope/i, '').trim()

  if (!recipientID) {
    await bot.replyPrivateDelayed(message, transcript('promos.stickerEnvelope.help', { user: message.user, email: creator.person.fields['Email'] }))
    return
  }

  let recipientRecord
  let selfSend = false
  let slackID, email
  const slackRegex = /<@([a-zA-Z0-9]+).*>/
  const emailRegex = /mailto:(.+)\|/
  console.log({recipientID})
  if (slackRegex.test(recipientID)) {
    console.log('I think this is a slack user')
    slackID = recipientID.match(slackRegex)[1].replace(/\|.*/,'')
    selfSend = slackID == message.user
    if (selfSend) {
      console.log('I think this is a user sending to themselves')
      recipientRecord = creator.person
    } else {
      console.log('I think this is a user sending to someone else')
      recipientRecord = (await getInfoForUser(slackID)).person
    }
    recipientID = slackID
  } else if (emailRegex.test(recipientID)) {
    console.log('I think this is an email')
    email = recipientID.match(emailRegex)[1]
    recipientID = email
    if (creator.person.fields['Email'] == email) {
      selfSend = true
      recipientRecord = creator.person
    } else {
      recipientRecord = await airFind('People', 'Email', email)
    }
  } else {
    // we couldn't match with anything, give the help text
    await bot.replyPrivateDelayed(message, transcript('promos.stickerEnvelope.help', { user: message.user, email: creator.person.fields['Email'] }))
    return
  }

  if (recipientRecord && recipientRecord.mailMissions) {
    console.log('cake')
    console.log(recipientRecord.mailMissions.length)
  }

  if (recipientRecord) {
    recipientID = recipientRecord.fields['Slack ID'] || recipientID
  }
  await Promise.all([
    interactionMailMission(undefined, {
      user: message.user,
      text: 'sticker_envelope',
      note: ''
    }, {recipient: recipientID}),
    bot.replyPrivateDelayed(message, transcript('promos.stickerEnvelope.success'))
  ])

  // const formula = `AND(${[
  //   `{Scenario Name}='Sticker Envelope'`,
  //   `{Receiver Address}='${personAddress.fields['ID']}'`,
  //   `OR('1 Unassigned'={Status},'2 Assigned'={Status},'3 Purchased'={Status})`,
  // ].join(',')})`
  // const existingMission = await airFind('Mail Missions', formula)

  // const note = message.text.replace(/sticker envelope/i, '')

  // if (existingMission) {
  //   await bot.replyPrivateDelayed(
  //     message,
  //     transcript('promos.stickerEnvelope.alreadyOrdered')
  //   )
  // } else {
  //   await interactionMailMission(undefined, {
  //     user,
  //     text: 'sticker_envelope',
  //     note,
  //   })

  //   await bot.replyPrivateDelayed(
  //     message,
  //     transcript('promos.stickerEnvelope.success')
  //   )
  // }

  // if (personAddress.fields['Missing Fields']) {
  //   await interactionAddress(bot, message)
  // }

  await interactionTutorial(bot, message)
}
