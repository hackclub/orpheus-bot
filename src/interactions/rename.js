import { airFind } from '../utils'

const renameInteraction = (bot, message) => {
  const { user, channel } = message

  const callerInfo = {
    clubRecord: null,
    leaderRecord: null
  }

  Promise.all([
    airFind('Leaders', 'Slack ID', user).then(l => callerInfo.leaderRecord = l),
    airFind('Clubs', 'Slack Channel ID', channel).then(c => callerInfo.leaderRecord = c)
  ]).then(() => {
    if (!callerInfo.leaderRecord) {
      
    }

    if (!callerInfo.clubRecord) {

    }

    console.log(callerInfo.leaderRecord.fields)
    console.log(callerInfo.clubRecord.fields)

  })
}
export default renameInteraction