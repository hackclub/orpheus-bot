import Botkit from 'botkit'
import redisStorage from 'botkit-storage-redis'
import { transcript } from './utils'

const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage({ url: process.env.REDISCLOUD_URL }),
})

controller.middleware.receive.use((bot, message, next) => {
  console.log(bot, message)
  next()
})
// const SCRYING_CHANNEL = 'GQ4EJ1FU3'
// controller.middleware.receive.use((bot, message, convo, next) => {
//   const data = { bot, message, convo }
//   const stringifiedData = JSON.stringify(
//     data,
//     null,
//     2 // https://stackoverflow.com/a/7220510
//   )

//   console.log('scrying', stringifiedData)
//   // const scryBot = controller.spawn({ token: process.env.SLACK_BOT_TOKEN, })
//   // scryBot.say({
//   //   text: transcript('mirror', { stringifiedData }),
//   //   channel: SCRYING_CHANNEL
//   // })
//   next()
// })

controller.startTicking()

controller.setupWebserver(process.env.PORT || 3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
})

export default controller
