import { airCreate, getInfoForUser, transcript } from '../utils'

export default async (bot, message) => {
  const { channel, text, thread_ts, user } = message

  try {
    const date = new Date(thread_ts * 1000).toISOString().replace(/T.*/, '')
    const attendance = parseInt(text)

    if (!attendance || attendance < 1) {
      bot.reply(message, transcript('checkinReply.notNumber'))
      return
    }

    const { club } = await getInfoForUser(user)

    if (!club || club.fields['Slack Channel ID'] != channel) {
      bot.reply(
        message,
        transcript('checkinReply.notAuth', { attendance, channel })
      )
      return
    }

    const fields = {
      Type: ['Meeting'],
      Club: [club.id],
      Date: date,
      Attendance: attendance,
      Notes: '@orpheus-bot created this entry from a Slack checkin reply',
    }

    const meeting = await airCreate('History', fields)

    bot.reply(
      message,
      transcript('checkinReply.success', {
        date: meeting.fields['Date'],
        attendance: meeting.fields['Attendance'],
        photoURL: meeting.fields['Photo Upload URL'],
      })
    )
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}
