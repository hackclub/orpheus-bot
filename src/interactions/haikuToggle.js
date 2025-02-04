import { transcript } from '../utils'
import { disabledUsers, saveDisabledUsers } from '../data/disabledHaikuUsers'

export const disableHaiku = async (bot, message) => {
  const { user } = message
  
  if (disabledUsers.has(user)) {
    bot.replyPrivateDelayed(message, "Haiku detection is already disabled for you!")
    return
  }

  disabledUsers.add(user)
  saveDisabledUsers()
  bot.replyPrivateDelayed(message, "Haiku detection has been disabled for you. Use `/enable-haiku` to enable it again.")
}

export const enableHaiku = async (bot, message) => {
  const { user } = message
  
  if (!disabledUsers.has(user)) {
    bot.replyPrivateDelayed(message, "Haiku detection is already enabled for you!")
    return
  }

  disabledUsers.delete(user)
  saveDisabledUsers()
  bot.replyPrivateDelayed(message, "Haiku detection has been enabled for you. Use `/disable-haiku` to disable it again.")
} 