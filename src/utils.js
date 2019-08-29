import { controller } from './'

import Airtable from 'airtable'
const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
)

export const airPatch = (baseName, recordID, values) =>
  new Promise((resolve, reject) => {
    base(baseName).update(recordID, values, (err, record) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(record)
    })
  })

export const airFind = (baseName, fieldName, value) =>
  new Promise((resolve, reject) => {
    // see airGet() for usage
    airGet(baseName, fieldName, value)
      .then(results => resolve(results[0]))
      .catch(err => reject(err))
  })

export const airGet = (baseName, searchArg = null, tertiaryArg = null) =>
  new Promise((resolve, reject) => {
    // usage:
    // for key/value lookup: `airGet('Clubs', 'Slack Channel ID', slackChannelID)`
    // for formula lookup: `airGet('Clubs', '{Slack Channel ID} = BLANK()')`
    // for all records: `airGet('Leaders')`

    const options = {}
    if (searchArg === null) {
      console.log(
        `I'm asking AirTable to send me ALL records in the "${baseName}" base`
      )
    } else {
      options.filterByFormula =
        tertiaryArg != null
          ? `{${searchArg}} = "${tertiaryArg}"` // this is a key/value lookup
          : searchArg // this is a formula lookup

      console.log(
        `I wrote a query & sent it to AirTable: BASE=${baseName} FILTER=${options.filterByFormula}`
      )
    }

    base(baseName)
      .select(options)
      .all((err, data) => {
        if (err) {
          console.error(err)
          reject(err)
        }
        resolve(data)
      })
  })

const getSlackUser = user =>
  new Promise((resolve, reject) => {
    initBot().api.users.info({ user }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res)
    })
  })

export const getInfoForUser = user =>
  new Promise((resolve, reject) => {
    const results = {}

    getSlackUser(user)
      .then(slackUser => (results.slackUser = slackUser))
      // Get the leader from the user
      .then(() => airFind('Leaders', 'Slack ID', user))
      .then(leader => (results.leader = leader))
      // Then club from leader
      .then(() =>
        airFind('Clubs', `FIND("${results.leader.fields['ID']}", Leaders)`)
      )
      .then(club => (results.club = club))
      // Then club's history from club
      .then(() => airGet('History', 'Club', results.club.fields['ID']))
      .then(history => {
        results.history = {
          records: history,
          meetings: history
            .filter(h => h.fields['Attendance'])
            .sort(
              (a, b) =>
                Date.parse(a.fields['Date']) - Date.parse(b.fields['Date'])
            ),
        }
      })
      .then(() => resolve(results))
      .catch(e => reject(e))
  })

export const recordMeeting = (club, meeting, cb) => {
  console.log(club, meeting)
  base('History').create(
    {
      Type: ['Meeting'],
      Club: [club.id],
      Date: meeting.date,
      Attendance: meeting.attendance,
      Notes: `@orpheus-bot created this entry from a Slack checkin`,
    },
    (err, record) => {
      if (err) {
        console.error(err)
      }
      cb(err, record)
    }
  )
}

export const initBot = (admin = false) =>
  // we need to create our "bot" context for interactions that aren't initiated by the user.
  // ex. we want to send a "hello world" message on startup w/o waiting for a user to trigger it.

  // (max@maxwofford.com) Warning about admin tokens: this runs with my
  // workspace token. Whatever is done with this token will look like I did it
  // (ex. "@msw has renamed this channel")
  controller.spawn({
    token: admin ? process.env.SLACK_LEGACY_TOKEN : process.env.SLACK_BOT_TOKEN,
  })

// class Interaction {
//   constructor(bot=initBot(), message, options) {
//     self.bot = bot
//     self.message = message
//   }
// }
