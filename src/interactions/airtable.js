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
    results.personAirtableRecord = `<Person record|https://airtable.com/tbl4xjBzoIJGHhWxF/${info.person.id}?blocks=hide>`
    if (info.club && info.club.id) {
      results.clubAirtableRecord = `<Club record|https://airtable.com/tbloCEFJtbxsKYJEv/${info.club.id}?blocks=hide>`
    }
    if (info.club && info.club.fields['HCB Account URL']) {
      results.hcbAccount = `<Bank URL|info.club.fields['HCB Account URL']>`
    }
    if (info.club && info.club.fields['Slack Channel ID']) {
      results.clubChannel = `<#${info.club.fields['Slack Channel ID']}>`
    }
    if (info.mailSender) {
      results.senderAirtableRecord = `https://airtable.com/tblvW60Qdo2AdoN1s/${info.mailSender.id}?blocks=hide`
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
