import { getInfoForUser, transcript, airFind, airCreate } from '../../utils'

export const names = [
  'Hack Pack',
  'github student developer pack',
  'github pack',
  'sdp',
  'github sdp',
]
export const details = 'Available for club leaders to give their members'
export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)

  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.githubSDP.notAuthorized')
    )
    return
  }

  const findPackReferrer = await airFind(
    'Sources',
    'Name',
    club.fields['Name'],
    { base: 'sdp' }
  )
  const newRecordFields = {
    Name: club.fields['Name'],
    Notes: `Airtable club id: ${club.id}`,
    Type: 'Hack Club',
  }
  const packReferrer =
    findPackReferrer ||
    (await airCreate('Sources', newRecordFields, { base: 'sdp' }))

  await bot.replyPrivateDelayed(
    message,
    transcript('promos.githubSDP.success', {
      referrer: packReferrer.fields['Name'],
    })
  )
}
