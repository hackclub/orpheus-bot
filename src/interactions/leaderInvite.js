import { getInfoForUser, airFind, initBot, transcript } from '../utils'
const LEADERS_CHANNEL = 'GAE0FFNFN'

const invitePromise = personRecordID =>
  new Promise((resolve, reject) => {
    airFind('Person', `'${personRecordID}' = RECORD_ID()`)
      .then(person => {
        const slackID = person['Slack ID']
        initBot(true).api.groups.invite(
          {
            user: slackID,
            channel: LEADERS_CHANNEL,
          },
          errString => {
            if (errString) {
              // Slack's callback returns error strings, not errors
              resolve(
                transcript('leaderInvite.bullet.success', {
                  slackID,
                  errString,
                })
              )
            } else {
              resolve(transcript('leaderInvite.bullet.success', { slackID }))
            }
          }
        )
      })
      .catch(err => {
        reject(err)
      })
  })

const interactionLeaderInvite = (bot, message) => {
  const { channel, user } = message

  getInfoForUser(user)
    .then(({ slackUser }) => {
      if (!slackUser.is_owner) {
        bot.reply(message, transcript('leaderInvite.notAdmin'))
        return
      }

      // get all leaders for this channel
      return airFind('Clubs', 'Slack Channel ID', channel)
        .then(club => {
          if (!club) {
            bot.reply(message, transcript('leaderInvite.notClubChannel'))
          }

          const invites = club.fields['Leaders'].map(invitePromise)
          return Promise.all(invites)
            .then(values => {
              console.log(values)
              bot.reply(message, transcript('leaderInvite.success'))
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
      bot.reply(message, transcript('errors.general', { err }))
    })
}

export default interactionLeaderInvite
