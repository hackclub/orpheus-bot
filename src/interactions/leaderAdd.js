import { getInfoForUser, airPatch, transcript, airFind } from '../utils'

const interactionLeaderAdd = async (bot, message) => {
  const { user, text, channel } = message

  const taggedUserID = (text.match(/\<@(.*)\|/) || [])[1]
  if (!taggedUserID) {
    bot.replyPrivateDelayed(message, transcript('leaderAdd.help'))
    return
  }

  const taggedUser = await getInfoForUser(taggedUserID)
  const commandUser = await getInfoForUser(user)
  const recipientClub = await airFind('Clubs', 'Slack Channel ID', channel)

  if (!commandUser.club && !commandUser.permissionedAmbassador) {
    throw transcript('leaderAdd.invalidClub')
  }

  if (commandUser.club && commandUser.club.id != recipientClub.id) {
    // A leader is trying to permission someone to a channel that's not their
    // club channel
    throw transcript('leaderAdd.invalidChannel')
  }

  const taggedUserClubs = taggedUser.fields['Clubs'] || []
  if (taggedUserClubs.includes(recipientClub)) {
    throw transcript('leaderAdd.alreadyLeader')
  }

  await airPatch('People', taggedUser.id, {
    Clubs: [...taggedUserClubs, recipientClub],
  })

  bot.replyPrivateDelayed(
    message,
    transcript('leaderAdd.success', { taggedUserID, channel })
  )
}

export default interactionLeaderAdd
