import { getInfoForUser, transcript } from '../utils'

const initAddress = async clubID => {
  console.log(
    `I couldn't find an address for ${clubID}, so I'm initializing a blank record`
  )
  const fields = {
    Club: clubID,
    'Currently assigned to Club': clubID,
  }
  await airCreate('Address', fields)
}

const interactionClubAddress = async (bot, message) => {
  const { leader, club, clubAddress } = await getInfoForUser(message.user)

  if (!leader) {
    throw new Error('Command can only be run by leaders!')
  }
  if (!club) {
    throw new Error('Club not found!')
  }

  const address = clubAddress || (await initAddress(leader.id))

  bot.replyPrivateDelayed(
    message,
    transcript('clubAddress', { address: address.fields })
  )
}

export default interactionClubAddress
