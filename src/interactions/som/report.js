import { getInfoForUser, airCreate } from '../../utils'

const interactionSOMReport = async (bot, message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  if (!taggedUserID) {
    console.log("No tagged user!")
    return // do something if we don't tag a user
  }

  // const submitter = await getInfoForUser(message.user)
  // const subject = await getInfoForUser(taggedUserID)

  const report = await airCreate('Conduct Reports', {
    'Submitter Slack ID': message.user,
    'Subject Slack ID': taggedUserID,
  }, { base: 'som' })
  const reportFormUrl = 'http://hack.af/slack-report?prefill_Report%20ID=' + report.id

  bot.replyPrivateDelayed(message, reportFormUrl)
}

export default interactionSOMReport
