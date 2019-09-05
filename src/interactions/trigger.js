import { airGet } from '../utils'
import interactionCheckinNotification from './checkinNotification'

const getAdmin = (bot, user) =>
  new Promise((resolve, reject) => {
    bot.api.users.info({ user }, (err, res) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(res.user.is_owner)
    })
  })

const triggerInteraction = (bot, message) => {
  const { text, ts, channel } = message
  console.log(message)

  getAdmin(bot, message.user)
    .then(admin => {
      if (!admin) {
        bot.api.reactions.add({
          timestamp: ts,
          channel: channel,
          name: 'broken_heart',
        })
        throw new Error('user_not_leader')
      }

      bot.api.reactions.add({
        timestamp: ts,
        channel: channel,
        name: 'heartbeat',
      })

      const now = new Date()
      const currentHour = now.getHours()
      const currentDay = now.toLocaleDateString('en', { weekday: 'long' })
      console.log(
        `I can hear my heart beat in my chest. The time is ${currentHour} on ${currentDay}... it fills me with determination`
      )

      airGet(
        'Clubs',
        `AND( IS_BEFORE({First Meeting Time}, TODAY()), {Checkin Hour} = '${currentHour}', {Checkin Day} = '${currentDay}', {Slack Channel ID} != '' )`
      ).then(clubs =>
        clubs.forEach(club => {
          const channel = club.fields['Slack Channel ID']

          console.log(
            `*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`
          )
          bot.replyInThread(
            message,
            `I'm reaching out to <#${channel}> (database ID \`${
              club.fields['ID']
            }\`)`
          )

          interactionCheckinNotification(undefined, { channel })
        })
      )
    })
    .catch(err => {
      console.error(err)
      bot.whisper(message, `Got error: \`${err}\``)
    })
}

export default triggerInteraction
