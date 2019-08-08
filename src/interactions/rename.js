import { airFind } from '../utils'

const renameInteraction = (bot, message) => {
  const { user, channel, text } = message

  bot.replyAcknowledge()

  airFind('Clubs', 'Slack Channel ID', channel).then(club => {
    if (club.fields['Leader Slack IDs'].indexOf(user) === -1) {
      // user not found in club's list of leaders
      bot.whisper(message, `Only this club's leaders can run this command. You aren't marked as this club's leader.`)
    } else {
      bot.whisper(message, `You got it boss! Renaming the channel to "${text}"...`)
      bot.api.channels.rename({
        channel,
        name: text,
        token: process.env.SLACK_TOKEN
      }, (err, res) => {
        if (err) console.error(err)
      })
    }
  }).catch(err => {
    bot.whisper(message, `This command only works on club channels.`)
    console.error(err)
  })
}
export default renameInteraction