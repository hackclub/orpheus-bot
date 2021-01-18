import { transcript } from "../utils"

const interactionReportForm = async (bot, message) => {
  const { trigger_id, channel } = message
  console.log(JSON.stringify(message, undefined, 2))
  const quote = 'message.message.text'

  await bot.api.views.open({trigger_id, view: transcript('reportForm', {quote})})

}

export default interactionReportForm