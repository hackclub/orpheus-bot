import { airFind, initBot } from '../utils'

const renameInteraction = (bot, message) => {
  const { user, channel, text } = message

  airFind('Clubs', 'Slack Channel ID', channel).then(club => {
    if (!club || !club.fields) {
      console.log('*no club or fields set*')
      bot.whisper(message, `This command only works on club channels.`)
    } else if (club.fields['Leader Slack IDs'].indexOf(user) === -1) {
      console.log("*user isn't a leader*")
      bot.whisper(message, `Only this club's leaders can run this command. You aren't marked as this club's leader.`)
    } else {
      console.log(`*Renaming the channel to "${text}*`)
      initBot(true).api.channels.rename({
        channel,
        name: text
      }, (err, res) => {
        if (err) {
          console.error(err)
          bot.whisper(message, `hmm... something went wrong. I tried saving "${text}" but it says \`${err}\` in red`)
          return
        }

        bot.whisper(message, `You got it boss! Renaming the channel to "${text}"...`)
      })
    }
  }).catch(err => {
    console.error(err)
  })
}
export default renameInteraction