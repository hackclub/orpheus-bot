import { getInfoForUser, initBot, text } from '../utils'

const interactionMeetingTutorial = (_bot, message) => {
  const { user } = message
  const bot = initBot()

  getInfoForUser(user)
    .then(({ userRecord, club }) => {
      if (userRecord.fields['Flag: Initiated tutorial']) {
        bot.whisper(message, text('tutorial.alreadyStarted'))
      } else {
        bot.whisper(
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
      bot.whisper(message, text('errors.memory', { err }))
    })
}
export default interactionMeetingTutorial
