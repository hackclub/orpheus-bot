import { transcript, getInfoForUser, reaction } from '../utils'

export default async (bot, message) => {
  let name = ':warning:'

  try {
    const taggedUserID = (message.text.match(/.*<@([a-zA-Z0-9]*)|/) || [])[1]

    if (!taggedUserID) {
      throw new Error('No user was tagged in the message!')
    }

    const info = await getInfoForUser(taggedUserID)

    if (!info.person) {
      throw new Error(
        'No Airtable could be found or created for the user in question'
      )
    }

    name = 'white_check_mark'
  } catch (err) {
    console.error(err)
    bot.replyInThread(message, transcript('errors.general', { err }))

    bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    name = 'no_entry'
  }

  await reaction(bot, 'add', message.channel, message.ts, name)
}
