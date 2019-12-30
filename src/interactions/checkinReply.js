import { airCreate, getInfoForUser } from "../utils"

export default async (bot, message) => {
  const { channel, thread_ts, user, text } = message
  if (!thread_ts) {
    console.log('not a thread, cancelling')
    return
  }

  const { club } = await getInfoForUser(user)

  if (club.fields['Slack Channel ID'] != channel) {
    bot.reply(message, 'no. you cant do that in this channel')
    return
  }

  const fields = {
    Type: ['Meeting'],
    Club: [club.id],
    Date: new Date(thread_ts * 1000).getTime(),
    Attendance: parseInt(text.replace( /[^\d.]/g, '' )),
    Notes: `@orpheus-bot created this entry from a Slack checkin`
  }

  const record = await airCreate('History', fields)

}
