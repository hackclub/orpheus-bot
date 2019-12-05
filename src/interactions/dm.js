import { getInfoForUser, transcript, airFind } from '../utils'

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

const interactionDM = (bot, message) => {
  const { user, text } = message
  getInfoForUser(user)
    .then(({ slackUser }) => {
      if (!slackUser.is_owner) {
        throw new Error('This command is admin only')
      }

      const encodedText = text
        .replace('&lt;', '<text')
        .replace('&gt;', '>')
        .replace(/@_/, '@')
      const messageRegex = /dm <.*?[@#](.+?(?=[>\|])).*?>\s*((?:.|\s)*)/
      const [, targetChannel, targetMessage] = encodedText.match(messageRegex)

      return substitutions(targetMessage, targetChannel).then(
        substitutedMessage => {
          bot.say(
            { text: substitutedMessage, channel: targetChannel },
            (err, response) => {
              if (err) {
                throw err
              }
              bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'white_check_mark',
              })
            }
          )
        }
      )
    })
    .catch(err => {
      console.error(err)
      bot.reply(message, transcript('errors.general', { err }))

      bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'no_entry',
      })
    })
}

export default interactionDM
