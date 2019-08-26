import Airtable from 'airtable'

const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE)

// usage: airFind('Club', 'Slack Channel ID', slackChannelID)
export const airFind = () => new Promise((resolve, reject) => {
  airGet.apply(null, arguments)
    .then(results => resolve(results[0]))
    .catch(err => reject(err))
})

export const airGet = (baseName, fieldName=null, value=null) => new Promise((resolve, reject) => {
  const options = {}
  if (fieldName != null) {
    options.filterByFormula = `(${fieldName}) = (${value || 'TRUE()'})`
  }
  console.log(`[QUERY] BASE="${baseName}" "${options.filterByFormula}"`)

  base(baseName).select(options).all((err, data) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(data)
  })
})

export const getInfoForUser = user => new Promise((resolve, reject) => {
  const results = {}

  // Get the leader from the user
  airFind('Leaders', 'Slack ID', user)
    .then(leader => results.leader = leader)
    // Then club from leader
    .then(() => airFind('Clubs', `FIND("${results.leader.fields['ID']}", Leaders)`))
    .then(club => results.club = club)
    // Then club's history from club
    .then(() => airGet('History', 'Club', club.fields['ID']))
    .then(history => {
      results.history = {
        records: history,
        meetings: history.filter(h => h.fields['Attendance']).sort((a,b) => Date.parse(a.fields['Date']) - Date.parse(b.fields['Date']))
      }
    })
    .then(() => resolve(results))
    .catch(e => reject(e))
})

export const recordMeeting = (club, meeting, cb) => {
  console.log(club, meeting)
  base('History').create({
    "Type": ["Meeting"],
    "Club": [club.id],
    "Date": meeting.date,
    "Attendance": meeting.attendance,
    "Notes": `@orpheus-bot created this entry from a Slack checkin`
  }, (err, record) => {
    if (err) {
      console.error(err)
    }
    cb(err, record)
  })
}