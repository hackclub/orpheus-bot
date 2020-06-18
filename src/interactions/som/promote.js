import FormData from 'form-data'
import { getInfoForUser, transcript, initBot, airPatch, airFind } from '../../utils'
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
      .then((res) => resolve(res))
      .catch((err) => reject(err))
  })

const inviteUserToChannel = async (user, channel) => (
  fetch('https://slack.com/api/conversations.invite', {
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
)

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

  try {
    await Promise.all([
      airPatch('Join Requests', guest.id, { Approver: message.user }, { base: 'som' }),
      inviteUserToChannel(user, 'C0C78SG9L'), //hq
      inviteUserToChannel(user, 'C0266FRGV'), //lounge
      inviteUserToChannel(user, 'C0M8PUPU6'), //ship
      inviteUserToChannel(user, 'C0EA9S0A0') //code
    ])

    // approveUser will deactive a slack account for an indeterminate amount of time
    // so we should wait for all other Slack API calls to resolve before upgrading to a full account
    await approveUser(taggedUserID)

    bot.replyPrivateDelayed(message, transcript('som.approve.success'))
  } catch (e) {
    console.error(e)
  }
}

export default interactionSOMPromote
