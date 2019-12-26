import { getInfoForUser, initBot, transcript } from '../utils'

function asyncReply(bot, message, reply, callback = () => {}) {
  return new Promise((resolve, reject) => {
    try {
      bot.replyPrivateDelayed(message, reply, () => {
        callback()
        resolve()
      })
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}

// this is a weird interaction. users call it explicitly when we start running
// the command, but it's called by other interactions that should have a
// tutorial command
const interactionTutorial = async (bot, message) => {
  const { user, command, text } = message
  const { userRecord, club, history } = await getInfoForUser(user)

  if (!club) {
    asyncReply(bot, message, transcript('tutorial.notAuthed'))
    return
  }
  switch (command) {
    case '/rename-channel':
      if (!userRecord.fields['Flag: renamed channel']) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.renameChannel.finished')
        )
        await asyncReply(
          bot,
          message,
          transcript('tutorial.promoSticker.start')
        )
        userRecord.patch({ 'Flag: renamed channel': true })
      }
      return
    case '/meeting-add':
      const finishedMeetingAddTutorial =
        userRecord.fields['Flag: Tutorial /meeting-add']
      const hasMeetings = history.meetings.length > 1
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', finishedMeetingAddTutorial, hasMeetings)

      if (hasMeetings && !finishedMeetingAddTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.meetingAdd.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.promoGrant.start'))
        userRecord.patch({ 'Flag: Tutorial /meeting-add': true })
      }
    case '/promo':
      const isStickerPromo = text.includes('sticker box')
      const finishedStickerTutorial =
        userRecord.fields['Flag: Tutorial /promo sticker box']
      if (isStickerPromo && !finishedStickerTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.promoSticker.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.meetingAdd.start'))
        userRecord.patch({ 'Flag: Tutorial /promo sticker box': true })
      }

      const isGrantPromo = text.includes('grant')
      const finishedGrantTutorial =
        userRecord.fields['Flag: Tutorial /promo github grant']
      if (isGrantPromo && !finishedGrantTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.promoGrant.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.meetingTime.start'))
        userRecord.patch({ 'Flag: Tutorial /promo github grant': true })
      }
      return
    case '/meeting-time':
      if (!userRecord.fields['Flag: Tutorial /meeting-time']) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.meetingTime.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.finished'))
        userRecord.patch({ 'Flag: Tutorial /meeting-time': true })
        // setTimeout(() => {
        //   interactionCheckinNotification(undefined, {
        //     channel: record.fields['Slack Channel ID'],
        //     user,
        //   })
        // }, 4000)
      }
      return
    case '/orpheus-tutorial':
    case '/meeting-tutorial':
    default:
      await asyncReply(bot, message, transcript('tutorial.start', { user }))
      await asyncReply(
        bot,
        message,
        transcript('tutorial.renameChannel.start', {
          channel: club.fields['Slack Channel ID'],
        })
      )
      userRecord.patch({ 'Flag: Initiated tutorial': true })
      return
  }
}
export default interactionTutorial
