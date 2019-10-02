import { getInfoForUser, airFind, initBot, text as transcript } from '../utils'
const LEADERS_CHANNEL = 'GAE0FFNFN'

const invitePromise = leaderRecordID =>
  new Promise((resolve, reject) => {
    airFind('Leaders', `'${leaderRecordID}' = RECORD_ID()`)
      .then(leader => {
        initBot(true).api.groups.invite(
          {
            user: leader['Slack ID'],
            channel: LEADERS_CHANNEL,
          },
          err => {
            if (err) {
              reject(err)
            } else {
              resolve(leader['Slack ID'])
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
