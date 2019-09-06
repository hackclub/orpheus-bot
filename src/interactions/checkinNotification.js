import { initBot, airFind } from '../utils'

const notification = user => user ? 
    `Hey <@${user}>! My calendar shows you had a meeting recently. :point_right: *you are responsible* :point_left: for telling me by reacting to this message` :
    'Hey! My calendar shows you had a meeting recently. If you did, let me know by reacting to this message.'

const interactionCheckinNotification = (bot = initBot(), message) => {
  const { channel } = message
  let { user } = message

  if (!user) {
    console.log(`*Running checkin on channel "${channel} with no default leader, I'll look for a default leader now!*`)
    airFind('Clubs', 'Slack Channel ID', channel).then(club => {
      const pocID = club.fields['POC']
      if (pocID) {
        airFind('Leaders', 'ID', club.fields['POC']).then(leader => {
          user = leader.fields['Slack ID']
          console.log(`*Found a POC! I'll Post a checkin notification in channel "${channel} & tag the POC: "${user}"!*`)
          bot.say({ text: notification(user), channel })
        }).catch(err => { throw err })
      } else {
        console.log(`*I didn't find a POC for the club in channel "${channel}", so I'll just post the notification without tagging anyone*`)
        bot.say({ text: notification(user), channel })
      }
    }).catch(err => { throw err })
  } else {
    console.log(`*Posting a checkin notification in channel "${channel} & tagging user "${user}"!*`)
    bot.say({ text: notification(user), channel })
  }
}

export default interactionCheckinNotification
