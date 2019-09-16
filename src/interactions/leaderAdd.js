import { getInfoForUser, airFind } from '../utils'

const interactionLeaderAdd = (bot, message) => {
  const { user, text } = message

  if (text === '' || text === 'help') {
    bot.whisper(message, transcript('leaderAdd.help'))
    return
  }

  getInfoForUser(user).then(({ leader, club }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.whisper(message, transcript('leaderAdd.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} doesn't have a club`)
      bot.whisper(message, transcript('leaderAdd.invalidClub'))
      return
    }

    console.log(message.text)
  })
}

export default interactionLeaderAdd
