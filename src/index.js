process.env.STARTUP_TIME = Date.now()
import _ from 'lodash'
import bugsnag from '@bugsnag/js'

import controller from './controller'
import { transcript } from './utils'

import interactionCheckin from './interactions/checkin'
import interactionDate from './interactions/date'
import interactionInfo from './interactions/info'
import interactionStats from './interactions/stats'
import interactionHello from './interactions/hello'
import interactionTrigger from './interactions/trigger'
import interactionRename from './interactions/rename'
import interactionLeaderAdd from './interactions/leaderAdd'
import interactionLeaderList from './interactions/leaderList'
import interactionMeetingList from './interactions/meetingList'
import interactionMeetingAdd from './interactions/meetingAdd'
import interactionMeetingRemove from './interactions/meetingRemove'
import interactionMeetingTime from './interactions/meetingTime'
import interactionMeetingTutorial from './interactions/meetingTutorial'
import interactionCatchall from './interactions/catchall'
import interactionPromo from './interactions/promo'
import interactionAnnouncement from './interactions/announcement'
import interactionHacktoberfest from './interactions/hacktoberfest'
import interactionLeaderInvite from './interactions/leaderInvite'
import interactionAddress from './interactions/address'
import interactionClubAddress from './interactions/clubAddress'
import interactionDM from './interactions/dm'
import interactionStartup from './interactions/startup'
import interactionForget from './interactions/forget'

export const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY)

// controller.on('reaction_added', (bot, message) => {
//   if (bot.identity.id == message.item_user) {
//     console.log('I was reacted to')
//     initBot(true).api.channels.history(
//       {
//         channel: message.item.channel,
//         count: 1,
//         inclusive: true,
//         latest: message.item.ts,
//       },
//       (err, res) => {
//         if (err) {
//           throw err
//         }
//         if (res.messages.length === 0) {
//           throw new Error('Message not found')
//         }

//         const item = res.messages[0]
//         const checkinSubstring = 'reacting to this message'

//         if (!item.text.includes(checkinSubstring)) {
//           return
//         }

//         const firstReaction =
//           item.reactions.length === 1 && item.reactions[0].count === 1

//         if (firstReaction) {
//           bot.whisper(
//             { channel: message.item.channel, user: message.user },
//             "I'll DM you now!",
//             err => {
//               if (err) {
//                 console.error(err)
//                 return
//               }

//               // This is part of the tutorial
//               userRecord(user).then(userRecord => {
//                 if (
//                   userRecord.fields['Flag: Tutorial /meeting-time'] &&
//                   !userRecord.fields['Flag: Tutorial reacted to notification']
//                 ) {
//                   userRecord.patch({
//                     'Flag: Tutorial reacted to notification': true,
//                   })
//                 }
//               })

//               interactionCheckin(undefined, message)
//             }
//           )
//         } else {
//           bot.whisper(
//             { channel: message.item.channel, user: message.user },
//             "Someone else reacted first, so I'll assume they're checking in instead. Just in case though, you can DM me the word `checkin` and I'll chat with you about your meeting.",
//             err => {
//               if (err) {
//                 console.error(err)
//               }
//             }
//           )
//         }
//       }
//     )
//   }
// })

controller.hears('checkin', 'direct_message,direct_mention', (bot, message) => {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'thumbsup-dino',
  })

  interactionCheckin(bot, message)
})

controller.hears('thump', 'ambient', interactionTrigger)

controller.hears('info', 'direct_message,direct_mention', interactionInfo)

controller.hears('hacktoberfest', 'ambient', interactionHacktoberfest)

controller.hears('dm', 'direct_message,direct_mention', interactionDM)

controller.hears('forget', 'direct_mention,direct_message', interactionForget)

controller.hears(
  ['thanks', 'thank', 'thnx', 'thanx'],
  'mention,direct_mention,direct_message',
  (bot, message) => {
    bot.reply(message, transcript('thanks'))
  }
)

controller.hears(
  'add this team to the leaders channel',
  'direct_mention',
  interactionLeaderInvite
)

controller.hears('stats', 'direct_mention,direct_message', interactionStats)

controller.hears(
  'what are you doing',
  'mention,direct_mention,direct_message',
  (bot, message) => {
    bot.reply(message, transcript('whatAreYouDoing'))
  }
)

controller.hears('date', 'direct_mention', interactionDate)

controller.on('slash_command', (bot, message) => {
  const { command, user, channel, text } = message

  console.log(`Received ${command} command from user ${user} in ${channel}`)

  bot.replyAcknowledge()

  bot.replyPrivateDelayed(
    message,
    {
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `${command} ${text}`,
            },
          ],
        },
      ],
    },
    (err, res) => {
      if (err) {
        console.error(err)
      }

      switch (command) {
        case '/stats':
        case '/meeting-stats':
          interactionStats(bot, message)
          break

        case '/announcement':
          interactionAnnouncement(bot, message)
          break

        case '/address':
        case '/leader-address':
          interactionAddress(bot, message)
          break

        case '/club-address':
          interactionClubAddress(bot, message)
          break

        case '/promo':
          interactionPromo(bot, message)
          break

        case '/rename-channel':
          interactionRename(bot, message)
          break

        case '/meeting-time':
          interactionMeetingTime(bot, message)
          break

        case '/meeting-add':
          interactionMeetingAdd(bot, message)
          break

        case '/meeting-remove':
          interactionMeetingRemove(bot, message)
          break

        case '/meeting-list':
          interactionMeetingList(bot, message)
          break

        case '/orpheus-tutorial':
        case '/meeting-tutorial':
          interactionMeetingTutorial(bot, message)
          break

        case '/leader-add':
          interactionLeaderAdd(bot, message)
          break

        case '/leader-list':
          interactionLeaderList(bot, message)
          break

        default:
          bot.replyPrivateDelayed(
            message,
            "I don't know how to do that ¯\\_(ツ)_/¯"
          )
          break
      }
    }
  )
})

controller.hears('hello', 'direct_mention,direct_message', interactionHello)

// catch-all for direct messages
controller.hears('.*', 'direct_message,direct_mention', interactionCatchall)

interactionStartup()
