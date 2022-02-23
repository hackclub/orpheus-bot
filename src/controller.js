import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'
import { get } from 'lodash'
import { transcript } from './utils'

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

const mentionMiddleware = message => {
  if (message.type == 'ambient' && message.text.toLowerCase().includes('orpheus')) {
    message.type = 'indirect_mention'
  }
}

const scryMiddleware = message => {
  const SCRYING_CHANNEL = 'GQJ1QV8CF'

  let quote = ''
  let type = message.type
  if (message.raw_message) {
    type = message.raw_message.subtype || message.type
  }
  switch (message.type) {
    case 'direct_mention':
    case 'indirect_mention':
    case 'mention':
      quote = message.text
      break
    case 'slash_command':
      quote = `${message.command} ${message.text}`
      break
    case 'message_action':
      quote = JSON.stringify(message, undefined, 2)
      break
    case 'view_submission':
      quote = JSON.stringify(message.view.state, undefined, 2)
      break
    default:
      console.log(`Middleware: Not scrying message with type '${type}'`)
      return
  }
  console.log(`Middleware: I'm scrying a ${type} in my crystal ball`)

  const contextPoints = []
  if (message.type) {
    contextPoints.push(`a ${message.type.replace(/_/, ' ')}`)
  }
  if (message.user) {
    contextPoints.push(`from <@${message?.user?.id || message.user}>`)
  }
  if (message.channel) {
    contextPoints.push(`in <#${message.channel}> (${message.channel})`)
  }
  if (message.type === 'view_submission') {
    console.log({contextPoints})
  }
  const context = contextPoints.join(' ')

  initBot().say({
    text: `Scried "${quote}"`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '> ' + quote.replace(/\n/g, '\n> '),
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

controller.middleware.normalize.use(async (bot, message, next) => {
  try {
    const threadTS = get(message, 'raw_message.event.thread_ts')
    const eventTS = get(message, 'raw_message.event.ts')
    if (threadTS && threadTS != eventTS) {
      const parentChannel = message.raw_message.event.channel
      const [slackID, replies] = await Promise.all([
        new Promise((resolve, reject) => {
          bot.api.auth.test({}, (err, res) => {
            if (err) reject(err)
            resolve(res.user_id)
          })
        }),
        new Promise((resolve, reject) => {
          // (max) we're doing weird things with the api token here. context:
          // Slack's conversations.replies acts differently depending on the type
          // of key it's given. see the docs here:
          // https://api.slack.com/methods/conversations.history
          // to access public & private channel threads, we need to use an app
          // token, but botkit 0.7.4 automatically uses a bot token.
          // See github comment for how to make slack api calls with app token:
          // https://github.com/howdyai/botkit/issues/840#issuecomment-304750962
          bot.api.conversations.replies(
            {
              token: bot.config.bot.access_token,
              channel: parentChannel,
              ts: threadTS,
              inclusive: 1,
              limit: 1,
            },
            (err, res) => {
              if (err) {
                reject(err)
              }
              resolve(res)
            }
          )
        }),
      ])
      console.log(`Middleware: I've marked a message as 'message_replied'`)
      message.type = 'message_replied'
      message.thread = {}
      message.thread.replies = replies
      message.thread.originalText = replies.messages[0].text
      message.thread.originalPoster =
        slackID == message.raw_message.event.parent_user_id
    }
  } catch (err) {
    console.error(err)
  } finally {
    next()
  }
})

controller.middleware.receive.use((bot, message, next) => {
  try {
    mentionMiddleware(message)
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
  controller.createHomepageEndpoint(controller.webserver)

  webserver.get('/ping', (req, res) => {
    res.json({
      pong: true,
      message: transcript('statusCheck')
    })
  })
})

export default controller
