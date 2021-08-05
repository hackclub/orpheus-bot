import { initBot, transcript, getInfoForUser } from '../utils'
import interactionTutorial from './tutorial'

const interactionRename = (bot, message) => {
  const { user, channel } = message

  getInfoForUser(user).then(({ leader, club, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.replyPrivateDelayed(message, transcript('slackInvite.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} didn't run this in a club channel`)
      bot.replyPrivateDelayed(
        message,
        transcript('slackInvite.noClubChannel')
      )
      return
    }

    if (club.fields['Slack Channel ID'] != channel) {
      console.log(
        `${channel} isn't ${user}'s channel, so I asked them to run it there`
      )
      bot.replyPrivateDelayed(
        message,
        transcript('slackInvite.invalidChannel', {
          channel: club.fields['Slack Channel ID'],
        })
      )
      return
    }
    bot.replyPrivateDelayed(
      message,
      transcript('slackInvite.instructions', {
        channel: club.fields['Slack Channel ID'],
      })
    )
  })
}
export default interactionRename
