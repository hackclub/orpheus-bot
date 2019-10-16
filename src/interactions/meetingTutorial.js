import { getInfoForUser, initBot, transcript } from '../utils'

const interactionMeetingTutorial = (_bot, message) => {
  const { user } = message
  const bot = initBot()

  getInfoForUser(user)
    .then(({ userRecord, club }) => {
      if (userRecord.fields['Flag: Initiated tutorial']) {
        bot.replyPrivateDelayed(message, transcript('tutorial.alreadyStarted'))
      } else {
        bot.replyPrivateDelayed(
          message,
          transcript('tutorial.start', {
            user,
            channel: club.fields['Slack Channel ID'],
          })
        )
      }
      userRecord.patch({ 'Flag: Initiated tutorial': true }).catch(err => {
        throw err
      })
    })
    .catch(err => {
      bot.replyPrivateDelayed(message, transcript('errors.memory', { err }))
    })
}
export default interactionMeetingTutorial
