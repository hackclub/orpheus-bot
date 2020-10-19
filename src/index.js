process.env.STARTUP_TIME = Date.now()
import bugsnag from '@bugsnag/js'

import controller, { initBot } from './controller'
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
import interactionTutorial from './interactions/tutorial'
import interactionCatchall from './interactions/catchall'
import interactionPromo from './interactions/promo'
import interactionGet from './interactions/get'
import interactionAnnouncement from './interactions/announcement'
import interactionHacktoberfest from './interactions/hacktoberfest'
import interactionLeaderInvite from './interactions/leaderInvite'
import interactionAddress from './interactions/address'
import interactionClubAddress from './interactions/clubAddress'
import interactionDM from './interactions/dm'
import interactionStartup from './interactions/startup'
import interactionForget from './interactions/forget'
import interactionAirtable from './interactions/airtable'
import interactionCheckinNotification from './interactions/checkinNotification'
import interactionCheckinReply from './interactions/checkinReply'
import interactionClubCard from './interactions/clubCard'
import interactionFindOrCreate from './interactions/findOrCreate'

import interactionBreakout from './interactions/breakout'
import interactionBreakoutUpdate from './interactions/trigger/updateBreakouts'

import interactionFileShare from './interactions/fileShare'

import interactionSOMPromote from './interactions/som/promote.js'
import interactionSOMLookup from './interactions/som/lookup'
import interactionClubInit from './interactions/clubInit'

export const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY)

controller.hears(
  'checkin notification',
  'direct_message,direct_mention',
  async (bot, message) => {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: 'thumbsup-dino',
    })

    interactionCheckinNotification(undefined, { user: message.user })
  }
)

controller.hears('checkin', 'direct_message,direct_mention', (bot, message) => {
  bot.api.reactions.add({
    timestamp: message.ts,
    channel: message.channel,
    name: 'thumbsup-dino',
  })

  interactionCheckin(bot, message)
})

controller.hears('thump', 'ambient', interactionTrigger)
controller.hears('update breakouts', 'direct_mention', interactionBreakoutUpdate)

controller.hears('info', 'direct_message,direct_mention', interactionInfo)

controller.hears('hacktoberfest', 'ambient', interactionHacktoberfest)

controller.hears('dm', 'direct_message,direct_mention', interactionDM)

controller.hears('forget', 'direct_mention,direct_message', interactionForget)

controller.hears(
  ['thanks', 'thank', 'thnx', 'thanx', 'thx', 'thnk'],
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

// controller.hears(
//   'stats',
//   'direct_mention,direct_message',
//   interactionStats.default
// )

controller.hears(
  'what are you doing',
  'mention,direct_mention,direct_message',
  (bot, message) => {
    bot.reply(message, transcript('whatAreYouDoing'))
  }
)

controller.hears('find or create', 'direct_mention', interactionFindOrCreate)

controller.hears('date', 'direct_mention', interactionDate)

controller.hears('breakout', 'direct_mention', interactionBreakout)

controller.hears(/(\d+)/, 'message_replied', async (bot, message) => {
  if (message.thread.originalPoster) {
    interactionCheckinReply(bot, message)
  }
})

controller.hears('hello', 'direct_mention,direct_message', interactionHello)

// catch-all for direct messages
controller.hears('.*', 'direct_message,direct_mention', interactionCatchall)

controller.on('slash_command', async (bot, message) => {
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
    async (err, res) => {
      if (err) {
        console.error(err)
      }

      try {
        switch (command) {
          case '/promote':
          case '/som-promote':
          case '/som-approve':
            await interactionSOMPromote(bot, message)
            break
          case '/som-lookup':
            await interactionSOMLookup(bot, message)
            break
          // case '/som-report':
          //   await interactionSOMReport(bot, message)
          //   break
          // case '/som-ban':
          //   await interactionSOMBan(bot, message)
          //   break
          // case '/som-invite':
          //   await interactionSOMInvite(bot, message)
          //   break
          case '/stats':
          case '/meeting-stats':
            await interactionStats(bot, message)
            break

          case '/announcement':
            await interactionAnnouncement(bot, message)
            break

          case '/airtable':
            await interactionAirtable(bot, message)
            break

          case '/address':
          case '/leader-address':
            await interactionAddress(bot, message)
            break

          case '/club-address':
            await interactionClubAddress(bot, message)
            break

          case '/club-card':
            await interactionClubCard(bot, message)
            break

          case '/promo':
            await interactionPromo(bot, message)
            break

          case '/get':
            await interactionGet(bot, message)
            break

          case '/rename-channel':
            await interactionRename(bot, message)
            break

          case '/meeting-time':
            await interactionMeetingTime(bot, message)
            break

          case '/meeting-add':
            await interactionMeetingAdd(bot, message)
            break

          case '/meeting-remove':
            await interactionMeetingRemove(bot, message)
            break

          case '/meeting-list':
            await interactionMeetingList(bot, message)
            break

          case '/orpheus-tutorial':
          case '/meeting-tutorial':
            await interactionTutorial(bot, message)
            break

          case '/leader-add':
            await interactionLeaderAdd(bot, message)
            break

          case '/leader-list':
            await interactionLeaderList(bot, message)
            break

          default:
            bot.replyPrivateDelayed(
              message,
              "I don't know how to do that ¯\\_(ツ)_/¯"
            )
            break
        }
      } catch (err) {
        console.error(err)
        bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
      }
    }
  )
})

controller.on('block_actions', (bot, message) => {
  try {
    const { channel, text } = message
    interactionStats.blockActions(bot, message)
  } catch (err) {
    console.log(err)
  }
})

controller.on('file_share', (bot, message) => {
  try {
    interactionFileShare(bot, message)
  } catch (err) {
    console.log(err)
  }
})

interactionStartup()
