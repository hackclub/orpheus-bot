import { getInfoForUser, initBot, airFind, transcript } from '../../utils'

const interactionSOMLookup = async (bot = initBot(), message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  if (!taggedUserID) {
    console.log("No tagged user!")
    return // do something if we don't tag a user
  }

  const { person, slackUser } = await getInfoForUser(taggedUserID)

  if (slackUser.is_restricted) {
    bot.replyPrivateDelayed(
      message,
      transcript('som.lookup.stillGuest', { user: taggedUserID })
    )
    return
  }

  const record = await airFind(
    'Join Requests',
    `AND(NOT(Approver=BLANK()),{Email Address}='${person.fields['Email']}')`,
    null,
    { base: 'som' }
  )

  if (record) {
    bot.replyPrivateDelayed(
      message,
      transcript('som.lookup.found', {
        user: taggedUserID,
        approver: record.fields['Approver'],
      })
    )
  } else {
    bot.replyPrivateDelayed(
      message,
      transcript('som.lookup.notFound', { user: taggedUserID })
    )
  }
}

export default interactionSOMLookup
