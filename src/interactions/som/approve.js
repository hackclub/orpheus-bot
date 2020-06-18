import FormData from 'form-data'
import { getInfoForUser, transcript, initBot } from "../../utils"
import fetch from 'isomorphic-unfetch'

const approveUser = async (user) => new Promise((resolve, reject) => {
  const form = new FormData()
  form.append('user', user)
  form.append('token', process.env.SLACK_INVITE_TOKEN)
  fetch('https://slack.com/api/users.admin.setRegular?slack_route=T0266FRGM', {
    method: 'POST',
    body: form
  }).then(res => resolve(res)).catch(err => reject(err))
})

const interactionSOMApprove = async (bot = initBot(), message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  if (!taggedUserID) {
    return // do something if we don't tag a user
  }
  const user = {}
  user.tagged = await getInfoForUser(taggedUserID)
  user.caller = await getInfoForUser(message.user)
  if (user.caller.slackUser.is_restricted) {
    console.log("caller is restricted, cancelling")
    return
  }
  if (!user.tagged.slackUser.is_restricted) {
    console.log("tagged is not restricted, cancelling")
    return
  }

  try {
    const result = await approveUser(taggedUserID)

    bot.replyPrivateDelayed(
      message,
      transcript('som.approve.success')
    )
  } catch (e) {
    console.error(e)
  }
  // await fetch('https://slack.com/api/users.admin.setRegular?slack_route=T0266FRGM', {
  //   headers: {
  //     'content-type': 'application/json'
  //   }
  //   body: JSON.stringify({
  //     user: taggedUserID,
  //     token: process.env.SLACK_INVITE_TOKEN
  //   })
  // })

    // bot.replyPrivateDelayed(
    //   message,
    //   transcript('som.approve.alreadyApproved')
    // )
    // return

  // initBot().api.users.admin.setRegular()

  // bot.replyPrivateDelayed(
  //   message,
  //   'This command is stubbed'
  // )
}

export default interactionSOMApprove
