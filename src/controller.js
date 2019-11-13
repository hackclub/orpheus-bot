import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'

const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL }),
})

const scryMiddleware = (message) => {
  const SCRYING_CHANNEL = 'GQ4EJ1FU3'
  const scryBot = controller.spawn({ token: process.env.SLACK_BOT_TOKEN })

  let quote = ''
  switch (message.type) {
    case 'direct_mention':
    case 'mention':
      quote = message.text
      break
    case 'slash_command':
      quote = `${message.command} ${message.text}`
      break
    default:
      console.log(`Not scrying message with type '${message.type}'`)
      next()
      break
  }
  console.log(`I'm scrying a ${message.type} in my crystal ball`)

  const contextPoints = []
  if (message.type) {
    contextPoints.push(`a ${message.type}`)
  }
  if (message.user) {
    contextPoints.push(`from <@${message.user}>`)
  }
  if (message.channel) {
    contextPoints.push(`in <#${message.channel}> (${message.channel})`)
  }
  if (message.text) {
    contextPoints.push(`says ${message.text}`)
  }
  const context = contextPoints.join(' ')

  scryBot.say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> <@${message.user}>: ${quote}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: context,
          },
        ],
      },
    ],
    channel: SCRYING_CHANNEL,
  })
}

controller.middleware.receive.use((bot, message, next) => {
  try {
    scryMiddleware(message)
  } catch (err) {
    console.error(err)
  } finally {
    next()
  }
})

controller.startTicking()

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

export default controller
