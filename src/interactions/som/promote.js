import FormData from 'form-data'
import { getInfoForUser, transcript, initBot } from '../../utils'
import fetch from 'isomorphic-unfetch'

const approveUser = async user =>
  new Promise((resolve, reject) => {
    console.log("DISABLED-TEMP")
    /*
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
      .then(res => {
        console.log(res)
        resolve(res)
      })
      .catch(err => reject(err))*/
  })

const clippyApprove = async ({ promoterId, promotedId }) => {
  return await fetch('https://clippy-bot-hackclub.herokuapp.com/promote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: process.env.CLIPPY_KEY,
      promotedId,
      promoterId,
    }),
  })
}

const interactionSOMPromote = async (bot = initBot(), message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  console.log('promote user id', taggedUserID)
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
  if (!user.caller.slackUser.is_admin) {
    console.log('caller is not an admin, cancelling')
    bot.replyPrivateDelayed(message, transcript('som.approve.notAdmin'))
    return
  }
  if (!user.tagged.slackUser.is_restricted) {
    console.log('tagged is not restricted, cancelling')
    return
  }
  await Promise.all([
    approveUser(taggedUserID),
    clippyApprove({ promotedId: taggedUserID, promoterId: message.user }),
    bot.replyPrivateDelayed(message, transcript('som.approve.success')),
  ])
}

export default interactionSOMPromote
