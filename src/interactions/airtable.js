import { getInfoForUser, transcript } from '../utils'

export default async (bot, message) => {
  try {
    const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]

    if (!taggedUserID) {
      throw new Error('No user was tagged in the message!')
    }

    const info = await getInfoForUser(taggedUserID)

    if (!info.person) {
      throw new Error(
        'No Airtable could be found or created for the user in question'
      )
    }

    const results = {}
    results.personAirtableRecord = `<https://airtable.com/tbl4xjBzoIJGHhWxF/${info.person.id}?blocks=hide|Person record>`
    if (info.club && info.club.id) {
      results.clubAirtableRecord = `<https://airtable.com/tbloCEFJtbxsKYJEv/${info.club.id}?blocks=hide|Club record>`
    }
    if (info.club && info.club.fields['HCB Account URL']) {
      results.hcbAccount = `<${info.club.fields['HCB Account URL']}|Bank URL>`
    }
    if (info.club && info.club.fields['Slack Channel ID']) {
      results.clubChannel = `<#${info.club.fields['Slack Channel ID']}>`
    }
    if (info.mailSender) {
      results.senderAirtableRecord = `<https://airtable.com/tblvW60Qdo2AdoN1s/${info.mailSender.id}?blocks=hide|Sender record>`
    }

    bot.replyPrivateDelayed(
      message,
      Object.keys(results).map(key => `${key}: ${results[key]}`).join('\n')
    )
  } catch (err) {
    console.error(err)
    bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
  }
}
