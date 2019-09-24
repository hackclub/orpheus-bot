import {
  getInfoForUser,
  text as transcript,
  airFind,
  airCreate,
} from '../utils'

const interactionPromo = (bot, message) => {
  const { user, text } = message

  return getInfoForUser(user)
    .then(({ leader, club }) => {
      if (!leader || !club) {
        bot.replyPrivateDelayed(message, transcript('promo.notAuthorized'))
        return
      }

      if (text.toLowerCase() == 'github grant') {
        return airFind('GitHub Grants', `{Club} = '${club.fields['ID']}'`)
          .then(grant => {
            if (grant) {
              if (club.fields['Leaders'].length == 1) {
                bot.replyPrivateDelayed(
                  message,
                  transcript('promo.duplicate.soloLeader')
                )
              } else {
                bot.replyPrivateDelayed(
                  message,
                  transcript('promo.duplicate.coleaders')
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
                  transcript('promo.success.hcbMessage.' + hcb, {
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
              .catch(err => {
                throw err
              })
          })
          .catch(err => {
            throw err
          })
      } else {
        bot.replyPrivateDelayed(message, transcript('promo.help'))
      }
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    })
}

export default interactionPromo
