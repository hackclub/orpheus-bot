import { airCreate, getInfoForUser, transcript } from "../utils"

export default async (bot, message) => {
  const { channel, thread_ts, user, text, parent_user_id } = message
  if (!thread_ts) { return }

  try {
    const date = new Date(thread_ts * 1000).toISOString().replace(/T.*/, '')
    const attendance = parseInt(text.replace( /[^\d.]/g, '' ))

    const { club } = await getInfoForUser(user)

    if (!club || club.fields['Slack Channel ID'] != channel) {
      bot.reply(message, transcript('checkinReply.notAuth', { attendance, channel }))
      return
    }

    const fields = {
      Type: ['Meeting'],
      Club: [club.id],
      Date: date,
      Attendance: attendance,
      Notes: `@orpheus-bot created this entry from a Slack checkin`
    }

    const meeting = await airCreate('History', fields)

    bot.reply(message, transcript('checkinReply.success', { date: meeting.fields['Date'], attendance: meeting.fields['Attendance'] }))
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}
