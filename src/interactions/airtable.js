import { getInfoForUser, transcript } from '../utils'

export default async (bot, message) => {
  try {
    const taggedUserID = (message.text.trim().match(/<@([a-zA-Z0-9]*)|/) || [])[1]

    if (!taggedUserID) {
      throw new Error('No user was tagged in the message!')
    }

    const info = await getInfoForUser(taggedUserID)
    const caller = await getInfoForUser(message.user)
    const runByAdmin = caller?.slackUser?.is_admin
    const runBySelf = message.user == taggedUserID

    if (!info.person) {
      throw new Error(
        'No Airtable could be found or created for the user in question'
      )
    }

    const results = {}
    results.personAirtableRecord = `<https://airtable.com/tbl4xjBzoIJGHhWxF/${info.person.id}?blocks=hide|Person record>`
    if (info.address && info.address.id) {
      results.addressAirtableRecord = `<https://airtable.com/tblbcZKrj9gFPzj1l/${info.address.id}?blocks=hide|Address record>`
    }
    if (info.leaderV2) {
      results.leaderV2Record = `<https://airtable.com/tblF84agXEjAX9pOh/${info.leaderV2.id}?blocks=hide|Leader V2 record>`
      results.leaderV2Status = info.leaderV2.fields['Status']
    }
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
    if (runByAdmin || runBySelf) {
      results.fullName = info.person.fields['Full Name']
      results.email = info.person.fields['Email']
      results.phoneNumber = info.person.fields['Phone number']
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
