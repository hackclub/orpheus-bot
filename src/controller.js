import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'

const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL }),
})

const SCRYING_CHANNEL = 'GQ4EJ1FU3'
controller.middleware.receive.use((bot, message, next) => {
  const scryBot = controller.spawn({ token: process.env.SLACK_BOT_TOKEN })

  let quote = ''
  console.log(message)
  switch (message.type) {
    case 'message':
      quote = JSON.stringify(message.text)
      break
    case 'slash_command':
      quote = `${message.command} ${message.text}`
      break
    default:
      next()
      break
  }

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
  const context = contextPoints.join(' ')

  scryBot.say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `> ${quote}`,
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

  next()
})

controller.startTicking()

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

export default controller
