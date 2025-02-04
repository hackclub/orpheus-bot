import { reaction, transcript } from "../utils"
import { format } from "haiku-detect"
import { disabledUsers } from '../data/disabledHaikuUsers'

const interactionHaiku = async (bot, message) => {
  const { text, user, ts, channel } = message
  
  // Skip if user has disabled haiku detection
  if (disabledUsers.has(user)) {
    return
  }

  const noLineText = text.replace(/\n/g, ' ')
  const haikuLines = format(noLineText)
  if (haikuLines.length == 3) {
    await bot.replyInThread(message, transcript('haiku', { haikuLines, user }))
    await reaction(bot, 'add', channel, ts, 'haiku')
  }
}

export default interactionHaiku