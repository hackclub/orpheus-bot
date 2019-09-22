import {
  getInfoForUser,
  text as transcript,
  airFind,
  airCreate,
} from '../utils'

const interactionPromo = (bot, message) => {
  const { user, text } = message

  getInfoForUser(user)
    .then(({ leader, club }) => {
      if (!leader || !club) {
        bot.whisper(message, transcript('promo.notAuthorized'))
        return
      }

      if (text.toLowerCase() == 'github semester') {
        const hcbAccountUrl = 'bank.hackclub.com/event_by_airtable_id/abc/' // temp URL to use while bank.hackclub.com team is building this out
        // if (!club.fields['HCB Account URL']) {
        //   bot.whisper(message, transcript('promo.noHCBAccount'))
        //   return
        // }

        airFind('GitHub Grants', `{Club} = '${club.id}'`)
          .then(grant => {
            console.log(grant)
            if (grant) {
              throw new Error('You can only request a grant once this semester')
            }
            return airCreate('GitHub Grants', {
              Club: club.id,
              Leader: leader.id,
              Type: 'Semesterly ($50)',
              'Club has HCB account': true,
            })
              .then(grant => {
                bot.whisper(message, transcript('promo.success'))
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
      bot.whisper(message, transcript('error.general', { err }))
    })
}

export default interactionPromo
