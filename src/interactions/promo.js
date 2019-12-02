import { getInfoForUser, transcript, airFind, airCreate } from '../utils'
import interactionMailMission from './mailMission'

const sdpReferrer = club =>
  new Promise((resolve, reject) =>
    airFind('Sources', 'Name', club.fields['Name'], { base: 'sdp' })
      .then(entry => {
        if (entry) {
          resolve(entry)
        } else {
          const newRecord = {
            Name: club.fields['Name'],
            Notes: `Airtable club id: ${club.id}`,
            Type: 'Hack Club',
          }
          return airCreate('Sources', newRecord, { base: 'sdp' })
            .then(resolve)
            .catch(reject)
        }
      })
      .catch(err => {
        console.error(err)
        throw err
      })
  )

const promos = [
  {
    names: ['Sticker Box'],
    details: 'Available to club leaders. Optionally include a note to the nodemaster packing your order.',
    run: (bot, message) => {
      const { user } = message
      return getInfoForUser(user).then(({ leader, club }) => {
        if (!leader || !club) {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.stickerBox.notAuthorized')
          )
          return
        }

        const note = message.text.replace('Sticker Box', '')

        if (!note) {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.stickerBox.noNote')
          )
        }

        bot.replyPrivateDelayed(
          message,
          transcript('promos.stickerBox.success')
        )

        interactionMailMission(undefined, {
          user,
          text: 'sticker_box',
          note,
          test: true,
        })

        if (note) {
          bot.replyPrivateDelayed(message, transcript('promos.stickerBox.note'))
        }
      })
    },
  },
  {
    names: ['Notion Premium account', 'notion', 'free notion', 'notion premium'],
    details: 'Available to anyone',
    run: (bot, message) => {
      bot.replyPrivateDelayed(message, transcript('promos.notion'))
    },
  },
  {
    names: ['StickerMule credit', 'sticker mule', 'stickermule'],
    details: 'Available to club leaders',
    run: (bot, message) => {
      const { user } = message
      return getInfoForUser(user).then(({ leader, club }) => {
        if (!leader || !club) {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.stickermule.notAuthorized')
          )
          return
        }

        bot.replyPrivateDelayed(
          message,
          transcript('promos.stickermule.success')
        )
      })
    },
  },
  {
    names: ['Hack Pack', 'github student developer pack', 'github pack', 'sdp', 'github sdp'],
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

        sdpReferrer(club)
          .then(entry => {
            bot.replyPrivateDelayed(
              message,
              transcript('promos.githubSDP.success', {
                referrer: entry.fields['Name'],
              })
            )
          })
          .catch(err => {
            throw err
          })
      })
    },
  },
  {
    names: ['GitHub Grant', 'club grant'],
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
                  interactionMailMission(undefined, {
                    user,
                    text: 'new_club_grant',
                  })
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

  const selectedPromo = promos.find(promo => {
    const promoMatchers = promo.names.map(t => t.toLowerCase())

    return promoMatchers.find(matcher => args.indexOf(matcher) === 0)
  })

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
