import { userRecord, memoryErrorMessage } from '../utils'

const interactionMeetingTutorial = (bot, message) => {
  const { user } = message
  console.log('Running meeting tutorial')

  userRecord(user)
    .then(userRecord => {
      if (userRecord.fields['Flag: Initiated tutorial']) {
        bot.whisper(
          message,
          `Go ahead and type \`/meeting-time next wednesday at 4 PM\`. If you're not sure what to do next, go ahead and send a screenshot of this message to <@U0C7B14Q3>.`
        )
      } else {
        bot.whisper(
          message,
          `Hey <@${user}>! Welcome to the check-in tutorial. First I'll need to know when your first meeting is. Run this command to let me know: \`/meeting-time next wednesday at 4 PM\``,
          (err, res) => {
            if (err) { throw err }
            bot.whisper(
              message,
              "(Don't have an exact date set for your first meeting? Just set it to a week from now– you can change this later on your own)"
            )
          }
        )
      }
      userRecord.patch({ 'Flag: Initiated tutorial': true }).catch(err => {
        throw { err }
      })
    })
    .catch(err => {
      bot.whisper(message, memoryErrorMessage(err))
    })
}
export default interactionMeetingTutorial
