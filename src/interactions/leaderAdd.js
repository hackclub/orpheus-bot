import { getInfoForUser, airCreate, airPatch, transcript } from '../utils'

const interactionLeaderAdd = (bot, message) => {
  const { user, text, channel } = message

  if (text === '' || text === 'help') {
    bot.replyPrivateDelayed(message, transcript('leaderAdd.help'))
    return
  }

  return getInfoForUser(user)
    .then(commandUser => {
      if (!commandUser.leader) {
        console.log(
          `${commandUser.user} isn't a leader, so I told them this was restricted`
        )
        bot.replyPrivateDelayed(message, transcript('leaderAdd.invalidUser'))
        return
      }

      if (!(commandUser.club && commandUser.ambassador)) {
        console.log(`${commandUser.user} doesn't have a club`)
        bot.replyPrivateDelayed(message, transcript('leaderAdd.invalidClub'))
        return
      }

      if (commandUser.club.fields['Slack Channel ID'] != channel) {
        console.log(`${user} doesn't own channel ${channel}`)
        bot.replyPrivateDelayed(message, transcript('leaderAdd.invalidChannel'))
        return
      }

      const taggedUserID = (message.text.match(/\<@(.*)\|/) || [])[1]
      if (!taggedUserID) {
        throw new Error('Invalid Slack user')
      }

      return getInfoForUser(taggedUserID)
        .then(taggedUser => {
          console.log('found tagged user')
          if (taggedUser.slackUser.is_bot) {
            throw new Error('bots cannot be club leaders')
          }
          if (!taggedUser.person) {
            // if user doesn't exist in Airtable
            const profile = taggedUser.slackUser.profile
            const fields = {
              Email: taggedUser.slackUser.profile.email,
              'Slack ID': taggedUser.slackUser.id,
              'Full Name': profile.real_name || profile.display_name,
            }
            console.log(fields)
            return airCreate('Person', fields)
              .then(taggedPerson => {
                return taggedPerson
              })
              .catch(err => {
                console.error(
                  'Ran into issue creating new Person record in Airtable'
                )
                throw err
              })
          } else {
            return taggedUser.person
          }
        })
        .then(taggedPerson => {
          // ensure we can assign the person as a leader to this club
          const clubs = taggedPerson.fields['Clubs'] || []
          if (clubs.includes(commandUser.club.id)) {
            bot.replyPrivateDelayed(
              message,
              transcript('leaderAdd.alreadyLeader')
            )
            return
          }
          clubs.push(commandUser.club.id)
          return airPatch('People', taggedPerson.id, {
            Clubs: clubs,
          })
            .then(() => {
              bot.replyPrivateDelayed(
                message,
                transcript('leaderAdd.success', { taggedUserID, channel })
              )
            })
            .catch(err => {
              throw err
            })
        })
        .catch(err => {
          throw err
        })
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    })
}

export default interactionLeaderAdd
