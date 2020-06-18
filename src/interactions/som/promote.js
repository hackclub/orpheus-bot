import FormData from 'form-data'
import { getInfoForUser, transcript, initBot, airPatch, airFind } from '../../utils'
import fetch from 'isomorphic-unfetch'

const inviteUserToChannel = async (user, channel) => (
  new Promise((resolve, reject) => {
    initBot().api.conversations.invite({ users: user, channel }, (err, res) => {
      if (err) { reject(err) }
      resolve(res)
    })
  }
  ))

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
    bot.replyPrivateDelayed(message, transcript('som.approve.restricted'))
    return
  }
  if (!user.tagged.slackUser.is_restricted) {
    console.log('tagged is not restricted, cancelling')
    bot.replyPrivateDelayed(message, transcript('som.approve.notRestricted'))
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
    bot.replyPrivateDelayed(message, transcript('som.approve.notGuest'))
    return
  }

  try {
    await airPatch('Join Requests', guest.id, { Approver: message.user }, { base: 'som' })
    await approveUser(taggedUserID)

    await Promise.all([
      inviteUserToChannel(user, 'C0C78SG9L'), //hq
      inviteUserToChannel(user, 'C0266FRGV'), //lounge
      inviteUserToChannel(user, 'C0M8PUPU6'), //ship
      inviteUserToChannel(user, 'C0EA9S0A0') //code
    ])

    bot.replyPrivateDelayed(message, transcript('som.approve.success'))
  } catch (e) {
    console.error(e)
  }
}

export default interactionSOMPromote
