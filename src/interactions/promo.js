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
        bot.whisper(message, transcript('promo.notAuthorized'))
        return
      }

      if (text.toLowerCase() == 'github semester') {
        if (!club.fields['HCB Account Requested']) {
          bot.whisper(message, transcript('promo.noHCBAccount'))
          return
        }

        return airFind('GitHub Grants', `{Club} = '${club.fields['ID']}'`)
          .then(grant => {
            if (grant) {
              if (club.fields['Leaders'].length == 1) {
                bot.whisper(message, transcript('promo.duplicate.soloLeader'))
              } else {
                bot.whisper(message, transcript('promo.duplicate.coleaders'))
              }
              return
            }
            return airCreate('GitHub Grants', {
              Club: [club.id],
              Leader: [leader.id],
              Type: 'Semesterly ($50)',
              'Club has HCB account': true,
              'Fee amount': 0,
              'Grant amount': 0,
            })
              .then(grant => {
                bot.whisper(
                  message,
                  transcript('promo.success', {
                    record: grant.id,
                    user,
                  })
                )
              })
              .catch(err => {
                throw err
              })
          })
          .catch(err => {
            throw err
          })
      } else {
        bot.whisper(message, transcript('promo.help'))
      }
    })
    .catch(err => {
      console.error(err)
      bot.whisper(message, transcript('errors.general', { err }))
    })
}

export default interactionPromo
