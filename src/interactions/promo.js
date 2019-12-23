import { getInfoForUser, transcript, airFind, airCreate } from '../utils'
import interactionMailMission from './mailMission'
import * as githubGrant from './promos/githubGrant'

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
    details:
      'Available to club leaders. Must include a note to the nodemaster packing your order.',
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

        const note = message.text.replace(/sticker box/i, '')

        if (!note) {
          bot.replyPrivateDelayed(
            message,
            transcript('promos.stickerBox.noNote')
          )
          return
        }

        bot.replyPrivateDelayed(
          message,
          transcript('promos.stickerBox.success', { note })
        )

        interactionMailMission(undefined, {
          user,
          text: 'sticker_box',
          note,
        })
      })
    },
  },
  {
    names: [
      'Notion Premium account',
      'notion',
      'free notion',
      'notion premium',
    ],
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
    names: [
      'Hack Pack',
      'github student developer pack',
      'github pack',
      'sdp',
      'github sdp',
    ],
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
  githubGrant,
]

const interactionPromo = async (bot, message) => {
  const args = message.text.toLowerCase()

  if (args == 'help') {
    await bot.replyPrivateDelayed(message, transcript('promo.help'))
    return
  }

  const selectedPromo = promos.find(promo => {
    const promoMatchers = promo.names.map(t => t.toLowerCase())

    return promoMatchers.find(matcher => args.indexOf(matcher) === 0)
  })

  if (selectedPromo) {
    try {
      await selectedPromo.run(bot, message)
    } catch (err) {
      console.error(err)
      await bot.replyPrivateDelayed(
        message,
        transcript('errors.general', { err })
      )
    }
  } else {
    await bot.replyPrivateDelayed(message, transcript('promo.list', { promos }))
  }
}

export default interactionPromo
