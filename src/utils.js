import { controller } from './'

import { sample } from 'lodash'
import Airtable from 'airtable'
const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
  process.env.AIRTABLE_BASE
)

export const memoryErrorMessage = (err) => sample([
  `I think I'm suffering from amnesia... I'm trying to recall what we were talking about, but all that comes to mind is \`{${err}}\``,
  `Hmmm... something's on the tip of my tongue, but all I can think is \`${err}\``,
  `Do you ever try to remember something, but end up thinking \`${err}\` instead? Wait... what were we talking about?`,
  `Hmmm... I'm having trouble thinking right now. Whenever I focus, \`${err}\` is the only thing that comes to mind`,
  `Aw jeez, this is embarrassing. My database just texted me \`${err}\``,
  `I just opened my notebook to take a note, but it just says \`${err}\` all over the pages`,
])

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
      if (tertiaryArg) {
        // this is a key/value lookup
        options.filterByFormula = `{${searchArg}} = "${tertiaryArg}"`
      } else {
        // this is a formula lookup
        options.filterByFormula = searchArg
      }

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
      resolve(res.user)
    })
  })

export const getInfoForUser = user =>
  new Promise((resolve, reject) => {
    const results = {}

    Promise.all([
      getSlackUser(user).then(slackUser => (results.slackUser = slackUser)),
      userRecord(user).then(userRecord => (results.userRecord = userRecord)),
      // Get the leader from the user
      airFind('Leaders', 'Slack ID', user)
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
            lastMeetingDay: 'monday',
            records: history,
            meetings: history
              .filter(h => h.fields['Attendance'])
              .sort(
                (a, b) =>
                  Date.parse(a.fields['Date']) - Date.parse(b.fields['Date'])
              ),
          }
        })
        .then(() => {
          if (results.history.meetings.length > 0) {
            const lastMeetingDay = new Date(
              results.history.meetings[0].fields['Date']
            ).toLocaleDateString('en-us', {
              weekday: 'long',
              timeZone: results.slackUser.tz,
            })
            results.history.lastMeetingDay = lastMeetingDay
          }
        }),
    ])
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

const buildUserRecord = r => ({
  ...r,
  fields: JSON.parse(r.fields['Data'] || '{}'),
  patch: updatedFields =>
    new Promise((resolve, reject) => {
      const oldFields = buildUserRecord(r).fields
      const newFields = {
        Data: JSON.stringify({ ...oldFields, ...updatedFields }, null, 2),
      }
      airPatch('Orpheus', r.id, newFields)
        .then(newRecord => resolve(buildUserRecord(newRecord)))
        .catch(err => {
          reject(err)
        })
    }),
})

export const userRecord = user =>
  new Promise((resolve, reject) => {
    console.log(`*I'm looking up an airRecord for "${user}"*`)
    airFind('Orpheus', 'User', user)
      .then(record => {
        if (record) {
          console.log(`*I found an airRecord for "${user}"*`)
          // if it already exists, return it
          resolve(buildUserRecord(record))
        } else {
          console.log(
            `*I didn't find an airRecord for "${user}", so I'm creating a new one*`
          )
          // if it doesn't exist, create one...
          base('Orpheus').create(
            {
              User: user,
              Data: '{}',
            },
            (err, record) => {
              if (err) {
                throw err
              }
              console.log(`*I created a new airRecord for "${user}"*`)
              // ... & return it
              resolve(buildUserRecord(record))
            }
          )
        }
      })
      .catch(err => reject(err))
  })

export const initBot = (admin = false) =>
  // we need to create our "bot" context for interactions that aren't initiated by the user.
  // ex. we want to send a "hello world" message on startup w/o waiting for a user to trigger it.

  // (max@maxwofford.com) Warning about admin tokens: this runs with my
  // workspace token. Whatever is done with this token will look like I did it
  // (ex. "@msw has renamed this channel")
  controller.spawn({
    token: admin ? process.env.SLACK_LEGACY_TOKEN : process.env.SLACK_BOT_TOKEN,
  })
