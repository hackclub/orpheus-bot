import { initBot, transcript, getInfoForUser } from '../utils'
import interactionMeetingTutorial from './meetingTutorial'

const interactionRename = (bot, message) => {
  const { user, channel } = message

  if (message.text === '' || message.text === 'help') {
    console.log(`I responded to ${user} with a help message`)
    bot.replyPrivateDelayed(message, transcript('renameChannel.help'))
    return
  }

  getInfoForUser(user).then(({ leader, club, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.replyPrivateDelayed(message, transcript('renameChannel.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} didn't run this in a club channel`)
      bot.replyPrivateDelayed(
        message,
        transcript('renameChannel.noClubChannel')
      )
      return
    }

    if (club.fields['Slack Channel ID'] != channel) {
      console.log(
        `${channel} isn't ${user}'s channel, so I asked them to run it there`
      )
      bot.replyPrivateDelayed(
        message,
        transcript('renameChannel.invalidChannel', {
          channel: club.fields['Slack Channel ID'],
        })
      )
      return
    }

    const name = message.text.toLowerCase()
    console.log(`*Renaming the channel to "${name}*`)
    bot.replyPrivateDelayed(
      message,
      transcript('renameChannel.progress', { name })
    )
    initBot(true).api.conversations.rename({ channel, name }, err => {
      if (err) {
        console.error(err)
        bot.replyPrivateDelayed(
          message,
          transcript('renameChannel.error', { name, err })
        )
        return
      }

      bot.replyPrivateDelayed(message, transcript('renameChannel.success'))

      // Additional tutorial for first-time users
      interactionMeetingTutorial(bot, message)
    })
  })
}
export default interactionRename
