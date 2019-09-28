import { text as transcript, getInfoForUser, userRecord } from '../utils'

const interactionAnnouncement = (bot, message) => {
  const { text, user } = message

  const verb = text.split(' ')[0]

  if (verb == 'help') {
    bot.replyPrivateDelayed(message, transcript('announcement.help'))
  }
  if (!'record address status send'.split(' ').includes(verb)) {
    bot.replyPrivateDelayed(
      message,
      transcript('announcement.unrecognizedCommand')
    )
  }

  getInfoForUser(user)
    .then(({ slackUser, userRecord }) => {
      if (!slackUser.is_owner) {
        throw new Error('This command can only be run by Slack Owner accounts')
      }

      const announcementData = userRecord.fields.announcement
      if (verb == 'record') {
        const content = text
        userRecord.patch({ announcement: { content } }).catch(err => {
          throw err
        })
      } else if (verb == 'address') {
        const target = text
        userRecord.patch({ announcement: { target } }).catch(err => {
          throw err
        })
      } else if (verb == 'status') {
        bot.replyPrivateDelayed(message, transcript('announcement.status'), {
          announcementData,
        })
      } else if (verb == 'send') {
        console.log('got Send command')
      }
    })
    .catch(err => {
      bot.replyPrivateDelayed(message, transcript('errors.general'), {
        err,
      })
      console.error(err)
    })
}

export default interactionAnnouncement
