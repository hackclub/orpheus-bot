import { getInfoForUser, transcript, airPatch } from '../utils'

const interactionMeetingRemove = async (bot, message) => {
  const { user, text } = message

  try {
    const { leader, club, history } = await getInfoForUser(user)

    if (text.trim == 'help' || text.trim == '') {
      bot.replyPrivateDelayed(message, transcript('meetingRemove.help'))
      return
    }

    if (!leader) {
      throw new Error('This command can only be run by club leaders')
    }

    if (!club) {
      throw new Error('No club found')
    }

    const meeting = history.meetings.find(h => h.id === text)
    if (meeting) {
      airPatch('History', meeting.id, { 'Deleted At': Date.now() }).then(
        _record => {
          bot.replyPrivateDelayed(
            message,
            transcript('meetingRemove.success')
          )
        }
      )
    } else {
      bot.replyPrivateDelayed(message, transcript('meetingRemove.help'))
    }
  } catch (err) {
    console.error(err)
    bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
  }
}

export default interactionMeetingRemove
