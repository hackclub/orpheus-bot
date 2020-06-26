import interactionCheckinNotification from '../checkinNotification'
import { initBot, airGet } from '../../utils'

export default async (bot = initBot(), message, dryRun = true) => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.toLocaleDateString('en', { weekday: 'long' })
  console.log(
    `The time is ${currentHour} on ${currentDay}. I'm going to send checkin notifications`
  )
  const clubs = await airGet(
    'Clubs',
    `AND( IS_BEFORE({First Meeting Time}, TODAY()), {Checkin Hour} = '${currentHour}', {Checkin Day} = '${currentDay}', {Slack Channel ID} != '' )`
  )

  return await Promise.all(
    clubs.map((club) => {
      const channel = club.fields['Slack Channel ID']

      console.log(
        `*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`
      )

      if (dryRun) {
        bot.replyInThread(
          message,
          `(Dry run) I'm reaching out to <#${channel}> (database ID \`${club.fields['ID']}\`)`
        )
      } else {
        bot.replyInThread(
          message,
          `I'm reaching out to <#${channel}> (database ID \`${club.fields['ID']}\`)`
        )
        return interactionCheckinNotification(undefined, { channel })
      }
    })
  )
}
