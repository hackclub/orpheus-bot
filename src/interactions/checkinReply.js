import { airCreate, getInfoForUser } from "../utils"
import { initBot } from "../controller"

export default async (bot, message) => {
  const { channel, thread_ts, user, text, parent_user_id } = message
  if (!thread_ts) { return console.log('ignoring because this is not a thread')}
  const botID = (await initBot().api.auth.test()).user_id
  if (parent_user_id != botID) { return console.log('ignoring because original post is from someone else') }

  const { club } = await getInfoForUser(user)

  if (club.fields['Slack Channel ID'] != channel) {
    bot.reply(message, 'no. you cant do that in this channel')
    return
  }

  const fields = {
    Type: ['Meeting'],
    Club: [club.id],
    Date: new Date(thread_ts * 1000).toISOString(),
    Attendance: parseInt(text.replace( /[^\d.]/g, '' )),
    Notes: `@orpheus-bot created this entry from a Slack checkin`
  }

  const record = await airCreate('History', fields)

  bot.reply(message, record.id)
}
