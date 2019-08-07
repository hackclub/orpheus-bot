process.env.STARTUP_TIME = Date.now()
import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'
import _ from 'lodash'

import checkinInteraction from './interactions/checkin'
import dateInteraction from './interactions/date'
import infoInteraction from './interactions/info'
import statsInteraction from './interactions/stats'
import helloInteraction from './interactions/hello'
import triggerInteraction from './interactions/trigger'

const controller = new Botkit.slackbot({
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

controller.hears('thump thump', 'direct_message, direct_mention', triggerInteraction)

controller.hears('checkin', 'direct_message,direct_mention', (bot, message) => {
  bot.replyInThread(message, "I'll send you a check-in right now!")

  checkinInteraction(bot, message)
})

controller.hears('date', 'direct_mention', dateInteraction)

controller.hears('info', 'direct_message,direct_mention', infoInteraction)

controller.on('slash_command', (bot, message) => {
  const { command, user } = message
  console.log(`Received ${command} command from user ${user}`)

  switch (command) {
    case '/stats':
      statsInteraction(bot, message)
      break
  
    default:
      bot.replyPrivate(message, `I don't know how to do that ¯\_(ツ)_/¯`)
      break
  }
})

controller.hears('hello', ['ambient'], helloInteraction)

// catch-all
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