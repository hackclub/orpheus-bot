import { getInfoForUser, initBot, transcript } from '../utils'

function asyncReply(bot, message, reply, callback = () => {}) {
  return new Promise((resolve, reject) => {
    try {
      const content = {
        attachments: [
          {
            text: reply,
            fallback: reply,
            author_name: 'Tutorial',
          },
        ],
      }
      bot.replyPrivateDelayed(message, content, () => {
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
        await asyncReply(bot, message, transcript('tutorial.getSticker.start'))
        userRecord.patch({ 'Flag: renamed channel': true })
      }
      break
    case '/meeting-add':
      const finishedMeetingAddTutorial =
        userRecord.fields['Flag: Tutorial /meeting-add']
      const recordedMeetings = history.meetings.length

      // if this is the first meeting recorded, let them know to add another
      if (recordedMeetings == 1 && !finishedMeetingAddTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.meetingAdd.progress')
        )
        return
      }
      // if there are 2 meetings recorded, go to the next step in the tutorial
      if (recordedMeetings == 2 && !finishedMeetingAddTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.meetingAdd.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.getGrant.start'))
        userRecord.patch({ 'Flag: Tutorial /meeting-add': true })
      }
      break
    case '/get':
      const isStickerPromo = text.includes('sticker envelope')
      const finishedStickerTutorial =
        userRecord.fields['Flag: Tutorial /promo sticker envelope']
      if (isStickerPromo && !finishedStickerTutorial) {
        await asyncReply(
          bot,
          message,
          transcript('tutorial.getSticker.finished')
        )
        await asyncReply(bot, message, transcript('tutorial.meetingAdd.start'))
        userRecord.patch({ 'Flag: Tutorial /promo sticker envelope': true })
        return
      }

      const isGrantPromo = text.includes('grant')
      const finishedGrantTutorial =
        userRecord.fields['Flag: Tutorial /promo github grant']
      if (isGrantPromo && !finishedGrantTutorial) {
        await asyncReply(bot, message, transcript('tutorial.getGrant.finished'))
        await asyncReply(bot, message, transcript('tutorial.meetingTime.start'))
        userRecord.patch({ 'Flag: Tutorial /promo github grant': true })
      }
      break
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
      break
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
      break
  }
}
export default interactionTutorial
