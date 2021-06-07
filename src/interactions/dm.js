import { getInfoForUser, transcript, airFind, reaction } from '../utils'
import interactionJoinChannel from './joinChannel'

const substitutions = (text, targetChannel) =>
  new Promise((resolve, reject) => {
    const pocRegex = /@poc/
    if (text.match(pocRegex)) {
      airFind('Clubs', 'Slack Channel ID', targetChannel)
        .then(club =>
          airFind('People', `'${club.fields.POC}' = RECORD_ID()`).then(poc => {
            if (!poc || !poc.fields) {
              reject(new Error('No POC for club'))
            }
            if (!poc.fields['Slack ID']) {
              reject(new Error('No Slack ID set for POC'))
            }
            resolve(text.replace(pocRegex, `<@${poc.fields['Slack ID']}>`))
          })
        )
        .catch(reject)
    } else {
      resolve(text)
    }
  })

const interactionDM = async (bot, message) => {
  try {
    const { user, text } = message
    const { slackUser } = await getInfoForUser(user)

    if (!slackUser.is_admin) {
      throw new Error('This command is admin only')
    }

    const encodedText = text
      .replace('&lt;', '<text')
      .replace('&gt;', '>')
      .replace(/@_/, '@')
    const messageRegex = /dm <.*?[@#](.+?(?=[>\|])).*?>\s*((?:.|\s)*)/
    const [_, targetChannel, targetMessage] = encodedText.match(messageRegex)

    if (targetChannel[0].toLowerCase() == 'c') {
      try {
        await interactionJoinChannel(bot, {channel: targetChannel})
      } catch (e) {
        // oh well...
      }
    }

    return substitutions(targetMessage, targetChannel).then(
      substitutedMessage => {
        bot.say(
          { text: substitutedMessage, channel: targetChannel },
          (err, response) => {
            if (err) {
              throw err
            }
            reaction(bot, 'add', message.channel, message.ts, 'white_check_mark')
          }
        )
      }
    )
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))

    reaction(bot, 'add', message.channel, message.ts, 'no_entry')
  }
}

export default interactionDM
