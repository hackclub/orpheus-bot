import { initBot, transcript } from '../utils'

const DEFAULT_CHANNEL = 'GNTFDNEF8'
const POSTMASTER = 'UNRAW3K7F'

const interactionMailMission = (bot = initBot(), message = {}, options = {}) => {
  const channel = message.channel || DEFAULT_CHANNEL
  const recipient = message.user
  const scenario = message.text

  const text = transcript('mailMission', { postmaster: POSTMASTER, recipient, scenario })

  console.log(`I'm asking Minnie to send out a mail mission!`)
  console.log(`The details are channel=${channels}, recipient=${recipient}, scenario=${scenario}`)
  bot.say({ text, channel })
}

export default interactionMailMission