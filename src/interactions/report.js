import { airCreate, transcript } from '../utils'

const interactionReport = async (bot, message) => {
  const report = await airCreate(
    'User Instance',
    { 'Slack ID': message.user, },
    { base: 'conduct' }
  )

  const reportFormUrl =
    'http://hack.af/slack-report?prefill_Report%20ID=' + report.id

  bot.replyPrivateDelayed(
    message,
    transcript('report', { reportFormUrl })
  )
}

export default interactionReport