import Airtable from 'airtable'

const base = new Airtable({apiKey: process.env.AIRTABLE_KEY}).base(process.env.AIRTABLE_BASE)

const getLeaderFrom = user => new Promise((resolve, reject) => {
  base('Leaders').select({
    filterByFormula: `{Slack ID} = "${user}"`
  }).firstPage((err, records) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(records[0])
  })
})

const getClubFrom = leader => new Promise((resolve, reject) => {
  if (!leader) {resolve(null)}
  base('Clubs').select({
    filterByFormula: `SEARCH("${leader.fields['ID']}", ARRAYJOIN(Leaders))`
  }).firstPage((err, records) => {
    if (err) {
      console.error(err)
      reject(err)
    }
    resolve(records[0])
  })
})

const getHistoryFrom = club => new Promise((resolve, reject) => {
  const result = []
  if (!club) {resolve(null)}
  base('History').select({
    filterByFormula: `Club = "${club.fields['ID']}"`
  }).eachPage((records, fetchNextPage) => {
    records.forEach(record => result.push(record))
    fetchNextPage()
  }, err => {
    if (err) {reject(err)}
    resolve(result)
  })
})

export const getInfoForUser = user => new Promise((resolve, reject) => {
  const results = {}
  
  getLeaderFrom(user)
    .then(leader => results.leader = leader)
    .then(() => getClubFrom(results.leader))
    .then(club => results.club = club)
    .then(() => getHistoryFrom(results.club))
    .then(history => {
      results.history = {
        records: history,
        meetings: history.filter(h => h.fields['Attendance']).sort((a,b) => Date.parse(a.fields['Date']) - Date.parse(b.fields['Date']))
      }
    })
    .then(() => resolve(results))
    .catch(e => reject(e))
})

export const getAllClubs = () => (
  base('Clubs').select().all()
)

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
    cb(record)
  })
}