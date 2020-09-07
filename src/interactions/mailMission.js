import { initBot, transcript } from '../utils'

const DEFAULT_CHANNEL = 'GNTFDNEF8'
const POSTMASTER = 'UNRAW3K7F'

const interactionMailMission = (
  bot = initBot(),
  message = {},
  options = {}
) => {
  const channel = message.channel || DEFAULT_CHANNEL
  const recipient = options.recipient || `<@${message.user}>`
  const scenario = message.text
  const note = message.note || ''
  const command = message.test ? 'test' : 'send'

  const text = transcript('mailMission', {
    postmaster: POSTMASTER,
    recipient,
    scenario,
    note,
    command,
  })

  console.log(`I'm asking Minnie to send out a mail mission!`)
  console.log(
    `The details are channel=${channel}, recipient=${recipient}, scenario=${scenario}`
  )
  bot.say({ text, channel })
}

export default interactionMailMission
