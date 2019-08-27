process.env.STARTUP_TIME = Date.now()
import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'
import _ from 'lodash'

import { initBot } from './utils'

import checkinInteraction from './interactions/checkin'
import dateInteraction from './interactions/date'
import infoInteraction from './interactions/info'
import statsInteraction from './interactions/stats'
import helloInteraction from './interactions/hello'
import triggerInteraction from './interactions/trigger'
import renameInteraction from './interactions/rename'
import meetingListInteraction from './interactions/meetingList'
import meetingAddInteraction from './interactions/meetingAdd'

export const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL })
})

controller.startTicking()

controller.setupWebserver(process.env.PORT, function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

// const SLACK_LOGS_CHANNEL = process.env.SLACK_LOGS_CHANNEL
// if (SLACK_LOGS_CHANNEL) {
//   controller.middleware.capture.use((bot, message, convo, next) => {
//     console.log("Message", message)
//     console.log("Convo", convo)


//     initBot().api.user.info({ user: message.user }).then(user => {
//       user.profile

//       const attachments = [{
//         color: convo ? `#${convo.id.toString(16)}` : null,
//         pretext: null,
//         author_name: user.profile
//       }]
//       const blocks = {}

//       block.push({
//         type: "context",
//         elements: [{
//           type: 'image',
//           image_url: message.user.profile
//         }]
//       })
//       if (message.event.type === 'message') {
//         attachments.blocks.push({
//           type: "context",
//           elements: [{
//             type: 'mrkdwn',
//             text: `Convo #${convo.id}`
//           }]
//         })
//       }
//       if (convo) {
//         block.color = `#${convo.id.toString(16)}`

//         attachments.blocks.push({
//           type: "context",
//           elements: [{
//             type: 'mrkdwn',
//             text: `Convo #${convo.id}`
//           }]
//         })
//       }
//       // switch(message.event.type) {
//       //   case 'message':
//       //     break
//       //   default:

//       //     break

//       // }
//       bot.say({
//         attachments: { [ block ] },
//         channel: SLACK_LOGS_CHANNEL
//       })
//     })

//     next()
//   })
// } else {
//   console.log("WARN: SLACK_LOGS_CHANNEL config var unset, skipping")
// }

const init = (bot=initBot()) => {
  const reply = _.sample([
    '_out of the ashes a small dinosaur pops its head out of the ground. the cycle goes on_',
    '_the cracks in the egg gave way to a small head with curious eyes. the next iteration sets its gaze upon the world_'
  ])
  bot.say({
    text: reply,
    channel: 'C0P5NE354' // #bot-spam
  })
}
// init()

controller.hears('checkin', 'direct_message,direct_mention', (bot, message) => {
  bot.replyInThread(message, "I'll send you a check-in right now!")

  checkinInteraction(bot, message)
})

controller.hears('thump', 'ambient', triggerInteraction)

controller.hears('date', 'direct_mention', dateInteraction)

controller.hears('info', 'direct_message,direct_mention', infoInteraction)

controller.hears('hello', 'ambient', helloInteraction)

controller.on('slash_command', (bot, message) => {
  const { command, user, channel } = message
  console.log(`Received ${command} command from user ${user} in ${channel}`)

  bot.replyAcknowledge()

  switch (command) {
    case '/stats':
      statsInteraction(bot, message)
      break
    
    case '/rename-channel':
      renameInteraction(bot, message)
      break

    case '/meeting-add':
      meetingAddInteraction(bot, message)
      break

    case '/meeting-list':
      meetingListInteraction(bot, message)
      break
  
    default:
      bot.replyPrivate(message, "I don't know how to do that ¯\\_(ツ)_/¯")
      break
  }
})

// catch-all for direct messages
controller.hears('.*', 'direct_message,direct_mention', (bot, message) => {
  const { text, user } = message

  // ignore threaded messages
  if (_.has(message.event, 'parent_user_id')) return

  if (Math.random() > 0.5) {
    const response = _.sample([
      `*slowly blinks one eye*`,
      `*stares off into the distance, dazed*`,
      `*eyes slowly glaze over in boredom*`,
      `*tilts head in confusion*`,
      `*UWU*`
    ])

    bot.replyInThread(message, response)
  } else {
    bot.api.reactions.add({
      timestamp: message.ts,
      channel: message.channel,
      name: _.sample([
        'parrot_confused',
        'confused-dino',
        'question',
        'grey_question'
      ]),
    }, (err, res) => {
      if (err) console.error(err)
    })
  }
})

// fire-hose
controller.hears('.*', 'ambient', (bot, message) => {
  console.log(message)
})