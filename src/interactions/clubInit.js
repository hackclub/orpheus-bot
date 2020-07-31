import { initBot, airCreate, getInfoForUser, airPatch } from '../utils'

const interactionClubInit = async (bot = initBot(), message) => {
  // find person record, create if it doesn't exist
  // create a new club record for the user
  // create a new club channel and add the user to it
  // update the record with the channel info
  // send a welcome message in the club channel

  const userId = message.user
  const userInfo = await getInfoForUser(userId)
  const personRecord = userInfo.person
  const fullName = userInfo.slackUser.real_name
  console.log('user info', userInfo)
  console.log('person', personRecord)

  const clubRecord = await airCreate('Clubs', {
    'POC': [personRecord.id],
    'Leaders': [personRecord.id],
    'High School Name': fullName
  })
  const clubId = clubRecord.fields['ID']
  const clubChannel = await createClubChannel(clubId, userId)
  await Promise.all([
    airPatch('Clubs', clubRecord.id, {
      'Slack Channel ID': clubChannel
    }),
    bot.api.chat.postMessage({
      token: bot.config.bot.access_token,
      channel: clubChannel,
      text: 'hiiii'
    })
  ])

  // Fill in any fields that aren't already filled in
  getInfoForUser(userId)
}

const createClubChannel = (id, user) => (
  new Promise(async (resolve, reject) => {
    const channel = await bot.api.conversations.create({
      token: bot.config.bot.access_token,
      name: id
    })
    await bot.api.conversations.invite({
      token: bot.config.bot.access_token,
      channel: channel.channel.id,
      users: `${user},UM1L1C38X`
    }).then(() => resolve(channel.channel.id))
  })
)

export default interactionClubInit