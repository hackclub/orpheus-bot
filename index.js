const Botkit = require('botkit')
const Airtable = require('airtable')
const _ = require('lodash')

const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE);

const redisConfig = {
  url: process.env.REDISCLOUD_URL
}
const redisStorage = require('botkit-storage-redis')(redisConfig)

console.log("reticulating splines...")
console.log("booting dinosaur...")

const controller = new Botkit.slackbot({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  clientSigningSecret: process.env.SLACK_CLIENT_SIGNING_SECRET,
  scopes: ['bot', 'chat:write:bot'],
  storage: redisStorage
});

controller.startTicking()

controller.setupWebserver(process.env.PORT, function(err,webserver) {
  controller.createWebhookEndpoints(controller.webserver)
  controller.createOauthEndpoints(controller.webserver)
});

controller.hears('checkin', 'direct_message,direct_mention', (bot, message) => {
  const { text, user } = message

  // ignore threaded messages
  if (_.has(message.event, 'parent_user_id')) return

  bot.replyInThread(message, "I'll send you a check-in right now!")

  bot.startPrivateConversation(message, (err, convo) => {
    if(err) {console.log(err)}
    convo.say({
      delay: 2000,
      text: `Give me a sec... let me pull up my database`
    })
    convo.say({
      delay: 2000,
      text: `*typewriter noises*`
    })

    getLeader(user, leader => {
      if (leader) {
        convo.say({
          delay: 2000,
          text: `Found you! It's **${leader.fields['Full Name']}**, right?`
        })
      } else {
        convo.say({
          delay: 2000,
          text: `I don't have any record of you being a club leader (ಠ_ಠ)`
        })
      }
    })
  })
})

// catch-all
controller.hears('.*', 'direct_message,direct_mention', (bot, message) => {
  const { text, user } = message

  // ignore threaded messages
  if (_.has(message.event, 'parent_user_id')) return

  const response = _.sample([
    `*slowly blinks one eye*`,
    `*stares off into the distance, dazed*`,
    `*eyes slowly glaze over in boredom*`,
    `*tilts head in confusion*`,
    `*UWU*`
  ])

  bot.replyInThread(message, response)
})



function getLeader(user, cb = () => {}) {
  base('Leaders').select({
    filterByFormula: `{Slack ID} = "${user}"`
  }).firstPage((err, records) => {
    if (err) {
      console.error(err)
      return
    }
    cb(records[0])
  })
}
