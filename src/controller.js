import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'

const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL }),
})

export const initBot = (admin = false) =>
  // we need to create our "bot" context for interactions that aren't initiated by the user.
  // ex. we want to send a "hello world" message on startup w/o waiting for a user to trigger it.

  // (max@maxwofford.com) Warning about admin tokens: this runs with my
  // workspace token. Whatever is done with this token will look like I did it
  // (ex. "@msw has renamed this channel")
  controller.spawn({
    token: admin ? process.env.SLACK_LEGACY_TOKEN : process.env.SLACK_BOT_TOKEN,
  })

const scryMiddleware = message => {
  const SCRYING_CHANNEL = 'GQJ1QV8CF'

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
      return
  }
  console.log(`I'm scrying a ${message.type} in my crystal ball`)

  const contextPoints = []
  if (message.type) {
    contextPoints.push(`a ${message.type.replace(/_/, ' ')}`)
  }
  if (message.user) {
    contextPoints.push(`from <@${message.user}>`)
  }
  if (message.channel) {
    contextPoints.push(`in <#${message.channel}> (${message.channel})`)
  }
  const context = contextPoints.join(' ')

  initBot().say({
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
}

const exclusiveEmojiMiddleware = message => {
  const { channel } = message
  let text = message.text
  let ts = message.raw_message.event.ts

  if (message.type == 'message_changed') {
    // Botkit doesn't give us the text & timestamp of an edited message in the
    // same format as regular messages
    text = message.event.message.text
    ts = message.event.message.ts
  }

  const includesExclusiveEmoji = text == 'she sells sea shells by the sea shore' // test phrase that can't be spoken
  if (includesExclusiveEmoji) {
    console.log(`I've decided to filter a message`)
    initBot(true).api.chat.delete({ channel, ts }, err => {
      if (err) {
        console.log(err)
      }
    })
  }
}

controller.middleware.receive.use((bot, message, next) => {
  try {
    scryMiddleware(message)
    exclusiveEmojiMiddleware(message)
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
