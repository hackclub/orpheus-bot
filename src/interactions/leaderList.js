import { getInfoForUser, airGet, text as transcript } from '../utils'

const interactionLeaderList = (bot, message) => {
  const { channel, user } = message
  getInfoForUser(user)
    .then(({ leader, club }) => {
      if (!leader) {
        console.log(
          `${user} isn't a leader, so I told them this was restricted`
        )
        bot.replyPrivateDelayed(message, transcript('leaderList.invalidUser'))
        return
      }

      if (!club) {
        console.log(`${user} doesn't have a club`)
        bot.replyPrivateDelayed(message, transcript('leaderList.invalidClub'))
        return
      }

      if (club.fields['Slack Channel ID'] != channel) {
        console.log(`${user} doesn't own channel ${channel}`)
        bot.replyPrivateDelayed(
          message,
          transcript('leaderList.invalidChannel')
        )
        return
      }

      console.log(club.fields)
      airGet(
        'Leaders',
        `OR(${club.fields['Leaders'].map(l => `RECORD_ID()='${l}'`).join(',')})`
      )
        .then(leaders => {
          console.log(leaders)
          bot.replyPrivateDelayed(
            message,
            transcript('leaderList.list', { leaders, channel })
          )
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      bot.replyPrivateDelayed(err)
      console.error(err)
    })
}

export default interactionLeaderList
