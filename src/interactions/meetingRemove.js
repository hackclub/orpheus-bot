import { getInfoForUser, airFind, transcript, airPatch } from '../utils'

const interactionMeetingRemove = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user).then(({ leader, club, history }) => {
    if (!leader) {
      throw new Error('This command can only be run by club leaders')
    }

    if (!club) {
      throw new Error('No club found')
    }

    const meeting = history.meetings.find(h => h.id === text)

    if (meeting) {
      airPatch('History', meeting.id, { 'Deleted At': Date.now() }).then(
        record => {
          bot.replyPrivateDelayed(message, transcript('meetingRemove.success'))
        }
      )
    } else {
      bot.replyPrivateDelayed(message, transcript('meetingRemove.help'))
    }
  })
}

export default interactionMeetingRemove
