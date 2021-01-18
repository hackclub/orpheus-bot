import { airCreate } from "../utils"

const interactionReportFormSubmit = async (bot, message) => {
  const notes = message.view.state.values.notes.notesValue.value

  const report = await airCreate(
    'User Instance',
    { 'Slack ID': message.user, },
    { base: 'conduct' }
  )

  const submission = await airCreate('Submission', {
    'Report ID': report.id,
    'Summary': 'This would normally contain a link to the post',
    'Notes': notes
  })
}
export default interactionReportFormSubmit