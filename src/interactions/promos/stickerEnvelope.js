import { transcript, airFind, getInfoForUser, airGet } from '../../utils'
import interactionMailMission from '../mailMission'
import interactionTutorial from '../tutorial'
import interactionAddress from '../address'

export const names = ['Sticker Envelope']
export const details = 'Available to active club leaders.'
export async function run(bot, message) {
  const creator = await getInfoForUser(message.user)

  if (!creator.leader || !creator.club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.notAuthorized')
    )
    return
  }

  let recipientID = message.text.replace(/sticker envelope/i, '').trim()

  if (!recipientID) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.help', {
        user: message.user,
        email: creator.person.fields['Email'],
      })
    )
    return
  }

  let recipientRecord
  let selfSend = false
  let slackID, email
  const slackRegex = /<@([a-zA-Z0-9]+).*>/
  const emailRegex = /mailto:(.+)\|/
  if (slackRegex.test(recipientID)) {
    console.log('I think this is a slack user')
    slackID = recipientID.match(slackRegex)[1].replace(/\|.*/, '')
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
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.help', {
        user: message.user,
        email: creator.person.fields['Email'],
      })
    )
    return
  }

  if (recipientRecord) {
    const missionIDs =
      recipientRecord.fields['Current Receiver Mail Missions'] || []
    if (missionIDs.length > 0) {
      const formula = `AND(OR(${missionIDs
        .map(m => `RECORD_ID()='${m}'`)
        .join(
          ','
        )},FALSE()),OR({Status}='1 Unassigned',{Status}='2 Assigned',{Status}='3 Purchased'),{Scenario Name}='Sticker Envelope')`
      const missions = await airGet('Mail Missions', formula)
      if (missions.length > 0) {
        const missionTS = Date.parse(missions[0].fields['Created Time']) / 1000
        await bot.replyPrivateDelayed(
          message,
          transcript('promos.stickerEnvelope.alreadyEnroute', {
            missionTS: missionTS,
          })
        )
        return
      }
    }
  }

  if (recipientRecord && recipientRecord.fields['Slack ID']) {
    recipientID = `<@${recipientRecord.fields['Slack ID']}>`
  }
  await Promise.all([
    interactionMailMission(
      undefined,
      {
        user: message.user,
        text: 'sticker_envelope',
        note: `requested by ${creator.person.fields['Full Name']} (<@${message.user}>)`,
      },
      { recipient: recipientID }
    ),
    bot.replyPrivateDelayed(
      message,
      transcript('promos.stickerEnvelope.success')
    ),
  ])

  if (selfSend) {
    await interactionAddress(bot, message)
  }

  await interactionTutorial(bot, message)
}
