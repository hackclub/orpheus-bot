import { userRecord, airPatch } from '../utils'

const interactionMeetingTutorial = (bot, message) => {
  const { user } = message
  console.log('Running meeting tutorial')

  userRecord(user).then(userRecord => {
    const oldRecordData = JSON.parse(userRecord.fields['Data'])
    if (oldRecordData['Flag: Initiated tutorial']) {
      bot.whisper(message, `Hmmm.... looks like we've already started this tutorial`)
    } else {
      bot.whisper(message, `Hey <@${user}>! Welcome to the check-in tutorial. First I'll need to know when your first meeting is. Run this command to let me know: \`/meeting-time next wednesday at 4 PM\``)
      bot.whisper(message, "(If you don't know when your first meeting will be, just set it for a couple weeks for now so we can get through the tutorial, then you can change it later)")
    }
    const newRecordData = oldRecordData
    newRecordData['Flag: Initiated tutorial'] = true

    airPatch('Orpheus', userRecord.id, { Data: JSON.stringify(newRecordData) }).then((newRecord) => {
      console.log('patching...')
    }).catch(err => { throw err })
  }).catch(err => {
    console.error(err)
    bot.whisper(`Hmmmm... I'm getting \`${err}\` and I'm pretty sure that's not right`)
  })
}
export default interactionMeetingTutorial