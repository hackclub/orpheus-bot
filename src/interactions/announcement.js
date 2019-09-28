import {
  text as transcript,
  getInfoForUser,
  userRecord,
  initBot,
} from '../utils'

const getAnnFromSlack = content =>
  new Promise((resolve, reject) => {
    const slackUrlRegex = /^https?:\/\/hackclub.slack.com\/archives\/([a-zA-Z0-9]+)\/p([0-9]+)/
    const [match, channel, timestamp] = content.match(slackUrlRegex)
    const oldest = timestamp / 1000000

    // How to handle different types of Slack links:

    // Channel ID starts with 'C'? use channel.history
    // https://hackclub.slack.com/archives/C1C3K2RQV/p1569610292034800

    // Channel ID starts with 'G'? use conversations.history
    // https://hackclub.slack.com/archives/GADJZHQJD/p1569558290000500

    // Channel ID starts with 'D'? use im.history
    // https://hackclub.slack.com/archives/DM4F8ES8P/p1569703631000200
    switch (channel[0]) {
      case 'G':
        initBot(true).api.conversations.history(
          {
            channel,
            oldest,
            inclusive: 1,
            limit: 1,
          },
          (err, res) => {
            if (err) reject(err)
            const message = res.messages[0]
            if (!message) reject(new Error('Message not found!'))

            resolve(message.text)
          }
        )
        break
      case 'C':
        initBot(true).api.channels.history(
          {
            channel,
            oldest,
            inclusive: 1,
            count: 1,
          },
          (err, res) => {
            if (err) reject(err)
            const message = res.messages[0]
            if (!message) reject(new Error('Message not found!'))

            resolve(message.text)
          }
        )
        break
      case 'D':
        initBot(true).api.im.history(
          {
            channel,
            oldest,
            inclusive: 1,
            count: 1,
          },
          (err, res) => {
            if (err) reject(err)
            const message = res.messages[0]
            if (!message) reject(new Error('Message not found!'))

            resolve(message.text)
          }
        )
        break
      default:
        resolve(content)
        break
    }
  })

const sendStatus = (bot, message) =>
  getInfoForUser(message.user)
    .then(({ userRecord }) => {
      const announcementData = JSON.stringify(userRecord.fields.announcement)
      bot.replyPrivateDelayed(
        message,
        transcript('announcement.status', { announcementData })
      )
    })
    .catch(err => {
      throw err
    })

const interactionAnnouncement = (bot, message) => {
  const { text, user } = message

  const verb = text.split(' ')[0]
  const content = text.replace(verb, '').trim()

  if (verb == 'help') {
    bot.replyPrivateDelayed(message, transcript('announcement.help'))
  } else if (!'record address status send'.split(' ').includes(verb)) {
    bot.replyPrivateDelayed(
      message,
      transcript('announcement.unrecognizedCommand')
    )
  }

  return getInfoForUser(user)
    .then(({ slackUser, userRecord }) => {
      if (!slackUser.is_owner) {
        throw new Error('This command can only be run by Slack Owner accounts')
      }

      const announcementData = userRecord.fields.announcement
      if (verb == 'record') {
        return getAnnFromSlack(content)
          .then(message =>
            userRecord.patch({ announcement: { message } }).catch(err => {
              throw err
            })
          )
          .then(() => sendStatus(bot, message))
          .catch(err => {
            throw err
          })
      } else if (verb == 'address') {
        return userRecord
          .patch({ announcement: { target: content } })
          .then(() => sendStatus(bot, message))
          .catch(err => {
            throw err
          })
      } else if (verb == 'status') {
        return sendStatus(bot, message).catch(err => {
          throw err
        })
      } else if (verb == 'send') {
        console.log('got Send command')
      }
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    })
}

export default interactionAnnouncement
