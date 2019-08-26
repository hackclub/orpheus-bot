import { getAllClubs } from '../utils'

const getAdmin = (bot, user) => new Promise((resolve, reject) => {
  bot.api.users.info({ user }, (err, res) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(res.user.is_owner)
  })
})

const triggerInteraction = (bot, message) => {
  getAdmin(bot, message.user).then((admin) => {
    if (!admin) {
      bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'broken_heart'
      })
      throw new Error('user_not_leader')
    }

    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'heartbeat'
    })

    getAllClubs().then(clubs => clubs.forEach(club => {
      const day = club.fields['Checkin Day']
      const hour = club.fields['Checkin Hour']
      const channel = club.fields['Slack Channel ID']

      if (!day) { return }
      if (!hour) { return }
      if (!channel) { return }

      console.log(`*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`)
      bot.replyInThread(message, `I'm reaching out to <#${channel}> (database ID ${club.fields['ID']})`)
      // TODO: Trigger a check-in from here
    }))
  }).catch(err => {
    console.error(err)
    bot.whisper(message, `Got error: \`${err}\``)
  })

  // new Promise((resolve, reject) => {
  //   bot.api.users.info(message, (err, res) => {
  //     console.log(err, res)
  //     if (err) { reject(err) }
  //     const isAuthed = res.user.is_admin || res.user.is_owner
  //     resolve(isAuthed)
  //   })
  // }).then((isAuthed) => {
  //   // ensure posted by admins
  //   if (!isAuthed) {
  //     bot.api.reactions.add({
  //       timestamp: message.ts,
  //       channel: message.channel,
  //       name: 'broken_heart'
  //     })
  //     return
  //   }

  //   bot.api.reactions.add({
  //     timestamp: message.ts,
  //     channel: message.channel,
  //     name: 'heartbeat'
  //   })
    
  //   getAllClubs().then(clubs => clubs.forEach(club => {
  //     const day = club.fields['Checkin Day']
  //     const hour = club.fields['Checkin Hour']
  //     const channel = club.fields['Slack Channel ID']

  //     if (!day) { return }
  //     if (!hour) { return }
  //     if (!channel) { return }

  //     console.log(`*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`)
  //     // TODO: Trigger a check-in from here
  //   }))
  // }).catch(err => {
  //   console.error(err)
  //   bot.whisper(message, `Got error: \`${err}\``)
  // })
}

export default triggerInteraction