import { getInfoForUser, airFind, initBot } from '../utils'
const LEADERS_CHANNEL = 'GAE0FFNFN'

const invitePromise = leaderRecordID =>
  new Promise((resolve, reject) => {
    airFind('Leader', `${leaderRecordID} = RECORD_ID()`).then(leader => {
      initBot().api.groups.invite(
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
  })

const interationLeaderInvite = (bot, message) => {
  const { channel, user } = message

  getInfoForUser(user).then(({ slackUser }) => {
    if (!slackUser.is_owner) {
      bot.reply(message, transcript('leaderInvite.notAdmin'))
      return
    }

    // get all leaders for this channel
    airFind('Clubs', 'Slack Channel ID', channel).then(club => {
      if (!club) {
        bot.reply(message, transcript('leaderInvite.notClubChannel'))
      }

      const invites = club.fields['Leaders'].map(invitePromise)
      Promise.all(invites).then(values => {
        console.log(values)
        bot.reply(message, transcript('leaderInvite.success'))
      })
    })
  })
}

export default interactionLeaderInvite
