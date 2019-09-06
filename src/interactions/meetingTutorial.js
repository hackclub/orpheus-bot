import { airRecord } from '../utils'

const interactionMeetingTutorial = (bot, message) => {
  const { user } = message

  // bot.whisper(message, `Hey <@${user}>! Welcome to the check-in tutorial. First I'll need to know when your first meeting is. Run this command to let me know: \`/meeting-time next wednesday at 4 PM\``)
  // bot.whisper(message, "(If you don't know when your first meeting will be, just set it for a couple weeks for now so we can get through the tutorial, then you can change it later)")
  airRecord(user).then(userRecord => {
    console.log(userRecord)
  }).catch(err => {
    bot.whisper(`Hmmmm... I'm getting \`${err}\` and I'm pretty sure that's not right`)
  })
}
export default interactionMeetingTutorial