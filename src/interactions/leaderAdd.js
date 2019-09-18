import {
  getInfoForUser,
  airCreate,
  airPatch,
  text as transcript,
} from '../utils'

const interactionLeaderAdd = (bot, message) => {
  const { user, text, channel } = message

  if (text === '' || text === 'help') {
    bot.whisper(message, transcript('leaderAdd.help'))
    return
  }

  getInfoForUser(user).then(commandUser => {
    if (!commandUser.leader) {
      console.log(
        `${commandUser.user} isn't a leader, so I told them this was restricted`
      )
      bot.whisper(message, transcript('leaderAdd.invalidUser'))
      return
    }

    if (!commandUser.club) {
      console.log(`${commandUser.user} doesn't have a club`)
      bot.whisper(message, transcript('leaderAdd.invalidClub'))
      return
    }

    if (commandUser.club.fields['Slack Channel ID'] != channel) {
      console.log(`${user} doesn't own channel ${channel}`)
      bot.whisper(message, transcript('leaderAdd.invalidChannel'))
      return
    }

    const taggedUserID = message.text.match(/\<@(.*)\|/)[1]
    getInfoForUser(taggedUserID)
      .then(taggedUser => {
        console.log('found tagged user')
        // if user doesn't exist
        if (!taggedUser.leader) {
          const profile = taggedUser.slackUser.profile
          const fields = {
            Email: taggedUser.slackUser.profile.email,
            'Slack ID': taggedUser.slackUser.id,
            'Full Name': profile.real_name || profile.display_name,
          }
          console.log(fields)
          return airCreate('Leaders', fields).catch(err => {
            console.error('Ran into issue creating new leader airtable record')
            throw err
          })
        }
        return taggedUser
      })
      .then(taggedUser => {
        // ensure we can assign the leader to this club
        console.log(taggedUser.leader)
        const clubs = [
          commandUser.club.id,
          ...taggedUser.leader.fields['Clubs'],
        ]
        return airPatch('Leaders', taggedUser.leader.id, { Clubs: clubs }).then(
          () => {
            bot.whisper(
              message,
              transcript('leaderAdd.success', { taggedUserID, channel })
            )
          }
        )
      })
      .catch(err => {
        console.error(err)
      })
  })
}

export default interactionLeaderAdd
