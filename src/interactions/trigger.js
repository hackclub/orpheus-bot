import { getAllClubs } from '../utils'

const triggerInteraction = (bot, message) => {
  // TODO ensure triggered by admin & zap only

  console.log('*orpheus hears her heart beat in her chest*')

  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'white_check_mark'
  })
  
  getAllClubs().then(clubs => clubs.forEach(club => {
    const day = club.fields['Checkin Day']
    const hour = club.fields['Checkin Hour']
    const channel = club.fields['Slack Channel ID']

    if (!day) { return }
    if (!hour) { return }
    if (!channel) { return }

    console.log(`*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`)
    // TODO: Trigger a check-in from here
  }))
}

export default triggerInteraction