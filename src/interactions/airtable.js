import { getInfoForUser, transcript } from '../utils'

export default async (bot, message) => {
  try {
    const { slackUser } = await getInfoForUser(message.user)

    if (!slackUser.is_owner) {
      throw new Error('Only Slack owners can run this command!')
    }

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
    results.personAirtableRecord = `https://airtable.com/tbl4xjBzoIJGHhWxF/${info.person.id}?blocks=hide`
    if (info.club && info.club.id) {
      results.clubAirtableRecord = `https://airtable.com/tbloCEFJtbxsKYJEv/${info.club.id}?blocks=hide`
    }
    if (info.club && info.club.fields['HCB Account URL']) {
      results.hcbAccount = info.club.fields['HCB Account URL']
    }
    if (info.club && info.club.fields['Slack Channel ID']) {
      results.clubChannel = `<#${info.club['Slack Channel ID']}>`
    }
    if (info.mailSender) {
      results.senderAirtableRecord = `https://airtable.com/tblvW60Qdo2AdoN1s/${info.mailSender.id}?blocks=hide`
    }

    bot.replyPrivateDelayed(
      message,
      `
    \`\`\`
    ${JSON.stringify(results, null, 2)}
    \`\`\`
    `
    )
  } catch (err) {
    console.error(err)
    bot.replyPrivateDelayed(message, transcript('errors.general', { err }))
  }
}
