import dinoBadge from './dinoBadge'
import scheduleCheckin from './scheduleCheckin'
import updateBreakouts from './updateBreakouts'
import { initBot, reaction } from '../../utils'

const getAdmin = (bot, user) =>
  new Promise((resolve, reject) => {
    bot.api.users.info({ user }, (err, res) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(res.user.is_admin)
    })
  })

const triggerInteraction = (bot = initBot(), message) => {
  const { ts, channel, user, text } = message
  const dryRun = !text.includes('thump thump')

  getAdmin(bot, user)
    .then(admin => {
      if (!admin) {
        reaction(bot, 'add', channel, ts, 'broken_heart')
        throw new Error('user_not_leader')
      }

      console.log(
        'I can hear my heart beat in my chest... it fills me with determination'
      )
      reaction(bot,'add', channel, ts, 'heartbeat')

      return Promise.all([
        // We're forcing dryrun to true on schedule checkin while the pandemic
        // is closing clubs
        // scheduleCheckin(bot, message, /*dryRun*/ true),
        // dinoBadge(bot, message, /*dryRun*/ true),
        updateBreakouts(bot, message, dryRun),
      ])
    })
    .catch(err => {
      console.error(err)
      bot.whisper(message, `Got error: \`${err}\``)
    })
}

export default triggerInteraction
