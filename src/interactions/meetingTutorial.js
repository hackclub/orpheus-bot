import { getInfoForUser, initBot, text } from '../utils'

const interactionMeetingTutorial = (_bot, message) => {
  const { user } = message
  const bot = initBot()

  getInfoForUser(user)
    .then(({ userRecord, club }) => {
      if (userRecord.fields['Flag: Initiated tutorial']) {
        bot.replyPrivateDelayed(message, text('tutorial.alreadyStarted'))
      } else {
        bot.replyPrivateDelayed(
          message,
          text('tutorial.start', {
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
      bot.replyPrivateDelayed(message, text('errors.memory', { err }))
    })
}
export default interactionMeetingTutorial
