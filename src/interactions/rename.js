import { initBot, text as transcript, getInfoForUser } from '../utils'

const interactionRename = (bot, message) => {
  const { user, channel } = message

  if (message.text === '' || message.text === 'help') {
    console.log(`I responded to ${user} with a help message`)
    bot.whisper(message, transcript('renameChannel.help'))
    return
  }

  getInfoForUser(user).then(({ leader, club }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`)
      bot.whisper(message, transcript('renameChannel.invalidUser'))
      return
    }

    if (!club) {
      console.log(`${user} didn't run this in a club channel`)
      bot.whisper(message, transcript('renameChannel.noClubChannel'))
      return
    }

    if (club.fields['Slack Channel ID'] != channel) {
      console.log(
        `${channel} isn't ${user}'s channel, so I asked them to run it there`
      )
      bot.whisper(
        message,
        transcript('renameChannel.invalidChannel', {
          channel: club.fields['Slack Channel ID'],
        })
      )
      return
    }

    const name = message.text.toLowerCase()
    console.log(`*Renaming the channel to "${name}*`)
    bot.whisper(message, transcript('renameChannel.progress', { name }))
    initBot(true).api.conversations.rename({ channel, name }, err => {
      if (err) {
        console.error(err)
        bot.whisper(message, transcript('renameChannel.error', { name, err }))
        return
      }

      bot.whisper(message, transcript('renameChannel.success'))

      // Additional tutorial for first-time users
      setTimeout(() => {
        if (!userRecord.fields['Flag: renamed channel']) {
          bot.whisper(
            message,
            text('tutorial.renamedChannel', {
              channel: record.fields['Slack Channel ID'],
            })
          )

          userRecord.patch({ 'Flag: renamed channel': true }).catch(err => {
            throw err
          })
        }
      }, 2000)
    })
  })
}
export default interactionRename
