import {
  getInfoForUser,
  text as transcript,
  airFind,
  airCreate,
} from '../utils'

const promos = [
  {
    name: 'Notion Student Plan',
    details: 'Anyone',
    run: (bot, message) => {
      bot.replyPrivateDelayed(message, transcript('promos.notion'))
    },
  },
  {
    name: 'GitHub Grant',
    details:
      'Club leaders only. Must have a meeting time set with `/meeting-time`',
    run: (bot, message) =>
      getInfoForUser(user)
        .then(({ leader, club }) => {
          if (!leader || !club) {
            bot.replyPrivateDelayed(
              message,
              transcript('promos.githubGrant.notAuthorized')
            )
            return
          }

          return airFind(
            'GitHub Grants',
            `{Club} = '${club.fields['ID']}'`
          ).then(grant => {
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
            }).then(grant => {
              const hcb = Boolean(club.fields['Club has HCB account'])
              bot.replyPrivateDelayed(
                message,
                transcript('promos.githubGrant.success.hcbMessage.' + hcb, {
                  firstLine: leader.fields['Address (first line)'],
                  secondLine: leader.fields['Address (second line)'],
                  city: leader.fields['Address (city)'],
                  state: leader.fields['Address (state)'],
                  zipCode: leader.fields['Address (zip code)'],
                })
              )
              setTimeout(() => {
                bot.replyPrivateDelayed(
                  message,
                  transcript(`promo.success.general`, {
                    record: grant.id,
                    hcb,
                    user,
                  })
                )
              }, 5000)
            })
          })
        })
        .catch(err => {
          console.error(err)
          bot.replyPrivateDelayed(
            message,
            transcript('errors.general', { err })
          )
        }),
  },
]

const interactionPromo = (bot, message) => {
  const args = message.text.toLowerCase()

  const selectedPromo = promos.find(promo => promo.name.toLowerCase() == args)

  if (selectedPromo) {
    selectedPromo.run(bot, message)
  } else {
    bot.replyPrivateDelayed(message, transcript('promo.list', { promos }))
  }
}

export default interactionPromo
