import { transcript } from "../utils"
import { format } from "haiku-detect"

const interactionHaiku = (bot, message) => {
  const { text, user } = message
  const noLineText = text.replace(/\n/g, ' ')
  const haikuLines = format(noLineText)
  if (haikuLines.length == 3) {
    bot.replyInThread(message, transcript('haiku', { haikuLines, user }))
  }
}

export default interactionHaiku