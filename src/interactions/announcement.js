import {
  text as transcript,
  getInfoForUser,
  initBot,
  airPatch,
  userRecord as uR,
  airFind,
  airGet,
} from '../utils'

//                     \`-\`-._
//                      \` )`. `-.__      ,
//   '' , . _       _,-._;'_,-`__,-'    ,/
//  : `. ` , _' :- '--'._ ' `------._,-;'
//   `- ,`- '            `--..__,,---'   credit: http://ascii.co.uk/art/dragon
// max@maxwofford.com: caution, here there be dragons

const sendAnnouncements = (bot, message) => {
  bot.replyPrivateDelayed(message, transcript('announcement.starting'))
  return uR(message.user)
    .then(userRecord =>
      userRecord
        .patch({ announcement: { safety: false } })
        .then(() => sendAnnouncementRecursive(bot, message.user))
        .catch(err => {
          throw err
        })
    )
    .catch(err => {
      throw err
    })
}

// max@maxwofford.com: I know your first impulse will be to refactor this mess.
// before you re-write this, have a full understanding of the design decisions
// made here.

// - Announcements are sent in human time, not milliseconds. Damage control on an accidental announcement is much harder when 10 announcements are batched every 100ms
// - No (batching|caching) the club list. If an admin needs to change the clubs being addressed after the announcement is fired, they can make immediate changes
// - Admins know what's happening on a per-channel basis by following along in AirTable
// - Admins have to manually add their own announcement message so no one accidentally messes with an in-progress announcement
// - Admins have to manually check which channels are being messaged to ensure responsible use
// - Announcements will stop sending if anything goes wrong until the admin manually restarts

const sendAnnouncementRecursive = (bot, announcer) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        Promise.all([
          uR(announcer),
          airFind(
            'Clubs',
            'AND({Announcement Queued}, {Slack Channel ID} != BLANK())'
          ),
        ])
          .then(values => {
            const [userRecord, club] = values

            if (userRecord.fields.announcement.safety) {
              reject(new Error('Safety is on! Not firing the announcement'))
            }
            initBot().say(
              {
                text: userRecord.fields.announcement.message,
                channel: club.fields['Slack Channel ID'],
              },
              (err, res) => {
                if (err) reject(err)

                bot.replyPrivateDelayed(
                  transcript('announcement.progress', {
                    channel: club.fields['Slack Channel ID'],
                  })
                )

                return airPatch('Clubs')
                  .then(() => resolve(sendAnnouncementRecursive(text)))
                  .catch(err => reject(err))
              }
            )
          })
          .catch(err => reject(err)),
      1000
    )
  )

const getAnnFromSlack = content =>
  new Promise((resolve, reject) => {
    const slackUrlRegex = /^https?:\/\/hackclub.slack.com\/archives\/([a-zA-Z0-9]+)\/p([0-9]+)/
    const [match, channel, timestamp] = content.match(slackUrlRegex)
    const oldest = Number.parseFloat(timestamp / 1000000).toFixed(6) // Slack requires floating zeroes to the 6th decimal place

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
            if (!message || message.ts != oldest) {
              reject(new Error(transcript('announcement.notExactSlackMatch')))
            }

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
            if (!message || message.ts != oldest) {
              reject(new Error(transcript('announcement.notExactSlackMatch')))
            }

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
            if (!message || message.ts != oldest) {
              reject(new Error(transcript('announcement.notExactSlackMatch')))
            }

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
  Promise.all([
    uR(message.user),
    airGet(
      'Clubs',
      'AND({Announcement Queued}, {Slack Channel ID} != BLANK())'
    ),
  ])
    .then(values => {
      const [userRecord, clubs] = values
      const announcementData = JSON.stringify(
        {
          ...userRecord.fields.announcement,
          channels: clubs
            .map(
              club =>
                `<#${club.fields['Slack Channel ID']}> (AirTable record ${
                  club.id
                })`
            )
            .join(', '),
        },
        null,
        2 // https://stackoverflow.com/a/7220510
      )
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
  } else if (!'record address status send stop'.split(' ').includes(verb)) {
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

      if (verb == 'stop') {
        return userRecord
          .patch({ announcement: { safety: true } })
          .then(() => sendStatus(bot, message))
          .catch(err => {
            throw err
          })
      } else if (verb == 'record') {
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
        bot.replyPrivateDelayed(message, transcript('announcement.address'))
        return
      } else if (verb == 'status') {
        return sendStatus(bot, message).catch(err => {
          throw err
        })
      } else if (verb == 'send') {
        console.log('got Send command')
        return sendAnnouncements(bot, message).catch(err => {
          throw err
        })
      }
    })
    .catch(err => {
      console.error(err)
      bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
    })
}

export default interactionAnnouncement
