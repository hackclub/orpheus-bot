import { airFind, initBot } from '../utils'

const interactionRename = (bot, message) => {
  const { user, channel, text } = message

  if (text === '') {
    bot.whisper(
      message,
      "Use this command to rename your club's channel. For example: `/rename-channel el-segundo-high-school`"
    )
    return
  }

  airFind('Clubs', 'Slack Channel ID', channel)
    .then(club => {
      if (!club || !club.fields) {
        console.log('*no club or fields set*')
        bot.whisper(message, `This command only works on club channels.`)
      } else if (club.fields['Leader Slack IDs'].indexOf(user) === -1) {
        console.log("*user isn't a leader*")
        bot.whisper(
          message,
          `Only this club's leaders can run this command. You aren't marked as this club's leader.`
        )
      } else {
        console.log(`*Renaming the channel to "${text}*`)
        initBot(true).api.conversations.rename(
          {
            channel,
            name: text.toLowerCase(),
          },
          (err, res) => {
            if (err) {
              console.error(err)
              bot.whisper(
                message,
                `hmm... something went wrong. I tried saving "${text}" but it says \`${err}\` in red`
              )
              return
            }

            bot.whisper(
              message,
              `You got it boss! Renaming the channel to "${text}"...`
            )

            setTimeout(() => {
              bot.whisper(
                message,
                `I don't have permission to change channel names directly, but I've got <@U0C7B14Q3>'s password (he stashes them under his mattress), so I logged in as him to rename it.`
              )
            }, 2000)
          }
        )
      }
    })
    .catch(err => {
      console.error(err)
    })
}
export default interactionRename
