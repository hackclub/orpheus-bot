import FormData from 'form-data'
import { getInfoForUser, transcript, initBot, airPatch, airFind, timeout } from '../../utils'
import fetch from 'isomorphic-unfetch'

const approveUser = async (user) =>
  new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('user', user)
    form.append('token', process.env.SLACK_INVITE_TOKEN)
    fetch(
      'https://slack.com/api/users.admin.setRegular?slack_route=T0266FRGM',
      {
        method: 'POST',
        body: form,
      }
    )
      .then((res) => {
        console.log(res)
        resolve(res)
      })
      .catch((err) => reject(err))
  })

const inviteUserToChannel = async (user, channel) => {
  console.log("Inviting user", user, "to channel", channel)

  return fetch('https://slack.com/api/conversations.invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`
    },
    body: JSON.stringify({
      channel,
      users: user
    })
  })
}

const interactionSOMPromote = async (bot = initBot(), message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  if (!taggedUserID) {
    return // do something if we don't tag a user
  }
  const user = {}
  user.tagged = await getInfoForUser(taggedUserID)
  user.caller = await getInfoForUser(message.user)
  if (user.caller.slackUser.is_restricted) {
    console.log('caller is restricted, cancelling')
    return
  }
  if (!user.tagged.slackUser.is_restricted) {
    console.log('tagged is not restricted, cancelling')
    return
  }

  const guest = await airFind(
    'Join Requests',
    `AND(Approver=BLANK(),{Email Address}='${user.tagged.person.fields['Email']}')`,
    null,
    { base: 'som' }
  )

  if (!guest) {
    console.log('tagged is not an SOM guest, cancelling')
    return
  }

  fetch('https://clippy-bot-hackclub.herokuapp.com/promote', {
    method: 'POST',
    body: JSON.stringify({
      promotedId: taggedUserID,
      promoterId: message.user
    })
  })
}

export default interactionSOMPromote
