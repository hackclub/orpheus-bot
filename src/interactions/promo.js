import { getInfoForUser, text as transcript, airCreate, airGet } from '../utils'

const interactionPromo = (bot, message) => {
  const { user, channel, text } = message

  getInfoForUser(user).then(({ leader, club }) => {
    if (!leader || !club) {
      bot.whisper(message, transcript('promo.notAuthorized'))
      return
    }

    if (text.toLowerCase() == 'github semester') {
      if (!club.fields['HCB Account URL']) {
        bot.whisper(message, transcript('promo.noHCBAccount'))
        return
      }

      airFind('GitHub Grants', `{Club} = '${club.id}'`)
        .then(grant => {
          console.log(grant)
          if (grant) {
            throw new Error('You can only request a grant once this semester')
          }
        })
        .catch(err => console.error(err))
      bot.whisper(message, transcript('success'))
    }

    bot.whisper(message, transcript('promo.help'))
  })
}

export default interactionPromo
