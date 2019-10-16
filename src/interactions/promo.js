import { getInfoForUser, transcript, airFind, airCreate } from '../utils'

const sdpLink = club =>
  new Promise((resolve, reject) => {
    const formUrl = `https://airtable.com/shrlf0NgVfVBI51hU?prefill_Club%20Slack%20Channel%20ID=${
      club.fields['Slack Channel ID']
    }`

    airFind('Links', 'destination', formUrl, { base: 'hackaf' })
      .then(entry => {
        if (entry) {
          return entry.fields['slug']
        }
        const newRecord = {
          slug: `sdp-${club.fields['Slack Channel ID']}`,
          destination: formUrl,
          Notes: `Created by @orpheus to use for SDP activations`,
        }
        return airCreate('Links', newRecord, { base: 'hackaf' })
          .then(entry => {
            return entry.fields['slug']
          })
          .catch(err => {
            reject(err)
          })
      })
      .then(slug => {
        resolve(`hack.af/${slug}`)
      })
      .catch(err => {
        reject(err)
      })
  })

const promos = [
  {
    name: 'Free Notion',
    details: 'Available to anyone',
    run: (bot, message) => {
      bot.replyPrivateDelayed(message, transcript('promos.notion'))
    },
  },
  {
    name: 'GitHub Student Developer Pack',
    details: 'Available for club leaders to give their members',
    run: (bot, message) => {
      const { user } = message
      return getInfoForUser(user).then(({ leader, club }) => {
        if (!leader || !club) {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.githubSDP.notAuthorized')
          )
          return
        }

        sdpLink(club).then(url => {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.githubSDP.success', { url })
          )
        })
      })
    },
  },
  {
    name: 'GitHub Grant',
    details:
      'Available to club leaders. Must have a meeting time set with `/meeting-time`',
    run: (bot, message) => {
      const { user } = message
      return getInfoForUser(user)
        .then(({ leader, club, leaderAddress }) => {
          if (!leader || !club) {
            bot.replyPrivateDelayed(
              message,
              transcript('promos.githubGrant.notAuthorized')
            )
            return
          }

          return airFind('GitHub Grants', `{Club} = '${club.fields['ID']}'`)
            .then(grant => {
              if (grant) {
                if (club.fields['Leaders'].length == 1) {
                  bot.replyPrivateDelayed(
                    message,
                    transcript('promos.githubGrant.duplicate.soloLeader')
                  )
                } else {
                  bot.replyPrivateDelayed(
                    message,
                    transcript('promos.githubGrant.duplicate.coleaders')
                  )
                }
                return
              }
              return airCreate('GitHub Grants', {
                Club: [club.id],
                Leader: [leader.id],
                Type: 'First meeting ($100)',
                'Club has HCB account': club.fields['HCB Account Requested'],
                'Fee amount': 0,
                'Grant amount': 100,
              })
                .then(grant => {
                  const hcb = Boolean(club.fields['Club has HCB account'])
                  bot.replyPrivateDelayed(
                    message,
                    transcript('promos.githubGrant.success.hcbMessage.' + hcb, {
                      firstLine: leaderAddress.fields['Street (First Line)'],
                      secondLine: leaderAddress.fields['Street (Second Line)'],
                      city: leaderAddress.fields['City'],
                      state: leaderAddress.fields['State/Province'],
                      country: leaderAddress.fields['Country'],
                      zipCode: leaderAddress.fields['Postal Code'],
                    })
                  )
                  setTimeout(() => {
                    bot.replyPrivateDelayed(
                      message,
                      transcript(`promos.githubGrant.success.general`, {
                        record: grant.id,
                        hcb,
                        user,
                      })
                    )
                  }, 5000)
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
          throw err
        })
    },
  },
]

const interactionPromo = (bot, message) => {
  const args = message.text.toLowerCase()

  if (args == 'help') {
    bot.replyPrivateDelayed(message, transcript('promo.help'))
    return
  }

  const selectedPromo = promos.find(promo => promo.name.toLowerCase() == args)

  if (selectedPromo) {
    try {
      selectedPromo.run(bot, message)
    } catch (err) {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    }
  } else {
    bot.replyPrivateDelayed(message, transcript('promo.list', { promos }))
  }
}

export default interactionPromo
