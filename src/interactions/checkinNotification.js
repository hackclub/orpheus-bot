import { initBot, airFind, transcript } from '../utils'

const interactionCheckinNotification = async (bot = initBot(), message) => {
  const { channel } = message
  let { user } = message

  // if there isn't a user provided we'll try and set one by looking up the club's POC
  if (!user) {
    console.log(
      transcript('checkinNotification.log.lookingForPOC', { channel })
    )
    const club = await airFind('Clubs', 'Slack Channel ID', channel)
    const pocAirtableID = club.fields['POC']
    let poc
    if (pocAirtableID) {
      poc = await airFind('People', `RECORD_ID() = '${pocAirtableID}'`)
      user = poc.fields['Slack ID']
    }
  }

  let logMessage
  let sayMessage
  if (user) {
    logMessage = transcript('checkinNotification.log.foundPoc', { channel, user })
    sayMessage = transcript('checkinNotification.named', { user })
  } else {
    logMessage = transcript('checkinNotification.log.noPOCFound', { channel })
    sayMessage = transcript('checkinNotification.unnamed')
  }

  console.log(logMessage)
  bot.say({text: sayMessage, channel}, (err, resp) => {
    bot.replyInThread(resp, transcript('checkinNotification.threadDetails'))
  })
}

export default interactionCheckinNotification
