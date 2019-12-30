import { airCreate, getInfoForUser } from "../utils"

export default async (bot, message) => {
  const { channel, thread_ts, user, text, parent_user_id } = message
  if (!thread_ts) { return }

  const { club } = await getInfoForUser(user)

  if (!club) {
    bot.reply(`I thought you were asking me to record a meeting but I'm not because you're not a registered leader`)
    return
  }

  if (club.fields['Slack Channel ID'] != channel) {
    bot.reply(message, `I thought you were telling me to record a meeting, but I'm not going to because this isn't your club channel`)
    return
  }

  const fields = {
    Type: ['Meeting'],
    Club: [club.id],
    Date: new Date(thread_ts * 1000).toISOString(),
    Attendance: parseInt(text.replace( /[^\d.]/g, '' )),
    Notes: `@orpheus-bot created this entry from a Slack checkin`
  }

  const meeting = await airCreate('History', fields)

  bot.reply(message, `I've recorded a club meeting <!date^${new Date(meeting.fields['Date']).getTime()}^{date_short_pretty}|on ${meeting.fields['Date']}> with ${meeting.fields['Attendance']} members`)
}
