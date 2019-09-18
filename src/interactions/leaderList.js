import { getInfoForUser, airGet } from '../utils'

const interactionLeaderList = (bot, message) => {
  const { channel, user } = message
  getInfoForUser(user)
    .then(({ leader, club }) => {
      if (!leader) {
        console.log(
          `${user} isn't a leader, so I told them this was restricted`
        )
        bot.whisper(message, transcript('leaderList.invalidUser'))
        return
      }

      if (!club) {
        console.log(`${user} doesn't have a club`)
        bot.whisper(message, transcript('leaderList.invalidClub'))
        return
      }

      if (club.fields['Slack Channel ID'] != channel) {
        console.log(`${user} doesn't own channel ${channel}`)
        bot.whisper(message, transcript('leaderList.invalidChannel'))
        return
      }

      console.log(club.fields)
      // airGet('Leaders', '')
      //   .then(leaders => {
      //     bot.whisper(message, transcript('leaderList.leaders', { leaders }))
      //   })
      //   .catch(err => {
      //     throw err
      //   })
    })
    .catch(err => {
      bot.whisper(err)
      console.error(err)
    })
}

export default interactionLeaderList
