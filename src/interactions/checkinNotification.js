import { initBot, airFind, userRecord, text } from '../utils'

const interactionCheckinNotification = (bot = initBot(), message) => {
  const { channel } = message
  let { user } = message

  if (!user) {
    console.log(text('checkinNotification.log.lookingForPOC', { channel }))
    airFind('Clubs', 'Slack Channel ID', channel)
      .then(club => {
        const pocID = club.fields.POC
        if (pocID) {
          airFind('Leaders', 'ID', club.fields.POC)
            .then(leader => {
              user = leader.fields['Slack ID']
              console.log(
                text('checkinNotification.log.foundPoc', { channel, user })
              )
              bot.say({
                text: text('checkinNotification.named', { user }),
                channel,
              })
            })
            .catch(err => {
              throw err
            })
        } else {
          console.log(text('checkinNotification.log.noPOCFound', { channel }))
          bot.say({ text: text('checkinNotification.unnamed'), channel })
        }
      })
      .catch(err => {
        throw err
      })
  } else {
    console.log(text('checkinNotification.log.posting', { channel, user }))
    bot.say({ text: 'checkinNotification.unnamed', channel })

    return // temporarily disabling this while we're using `/meeting-add` instead of checkin conversation
    userRecord(user).then(userRecord => {
      // If tutorial hasn't been run
      if (
        userRecord.fields['Flag: Tutorial /meeting-time'] &&
        !userRecord.fields['Flag: reacted to checkin notification']
      ) {
        bot.whisper(
          message,
          {
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text:
                    "We'll roleplay as if you've had a meeting, so go ahead and react",
                },
              },
              {
                type: 'image',
                title: {
                  type: 'plain_text',
                  text: 'How to react to a message',
                  emoji: true,
                },
                image_url: 'https://i.imgur.com/HVipvYp.gif',
                alt_text: 'reacting to a message',
              },
            ],
          },
          (err, res) => {
            if (err) {
              console.error(err)
            }
            userRecord.patch({
              'Flag: reacted to checkin notification': true,
            })
          }
        )
      }
    })
  }
}

export default interactionCheckinNotification
