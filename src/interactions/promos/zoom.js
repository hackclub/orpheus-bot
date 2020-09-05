import fetch from 'isomorphic-unfetch'

import { getInfoForUser, airFind, airPatch, transcript } from '../../utils'

export const names = ['Zoom Pro', 'zoom']
export const details =
  'Available for one club leader at each club (the point of contact). They can add their co-leaders and members to their account.'
export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)

  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.zoom.notAuthorized')
    )
    return
  }

  const pocAirtableID = club.fields['POC']
  if (leader.id != pocAirtableID) {
    if (pocAirtableID) {
      const poc = await airFind('People', `RECORD_ID() = '${pocAirtableID}'`)
      const pocID = poc.fields['Slack ID']

      await bot.replyPrivateDelayed(
        message,
        transcript('promos.zoom.notPOC.exists', { pocID })
      )
    } else {
      await bot.replyPrivateDelayed(
        message,
        transcript('promos.zoom.notPOC.doesntExist')
      )
    }
    return
  }

  // They're a leader & POC
  // let's do the thing

  // Find or Init their Zoom account
  let zoomID = leader.fields['Zoom ID'] || (await createZoomUser(leader)).id
  if (!leader.fields['Zoom ID']) {
    // no Zoom ID set in Airtable? We'll update their airRecord with the newly
    // created Zoom account ID in the background
    airPatch('People', leader.id, { 'Zoom ID': zoomID })
    bot.replyPrivateDelayed(
      message,
      transcript('promos.zoom.createdAccount', {
        email: leader.fields['Email'],
      })
    )
  } else {
    // they already have a Zoom account– let's toggle the account type
    const zoomAccount = getZoomUser(zoomID)
    if (!zoomAccount.type) {
      // account is 'pending' activation– ask the user to check their email
      bot.replyPrivateDelayed(
        message,
        transcript('promos.zoom.pendingAccount', {
          email: leader.fields['Email'],
        })
      )
    } else {
      // toggle account type
      bot.replyPrivateDelayed(message, transcript('promos.zoom.toggleAccount'))
    }
  }
}

// Zoom function stuff
import jwt from 'jsonwebtoken'
const payload = {
  iss: process.ZOOM_KEY,
  exp: new Date().getTime() + 5000,
}
const token = jwt.sign(payload, process.env.ZOOM_SECRET)

async function getZoomUser(zoomID) {
  const result = await fetch(`https://api.zoom.us/v2/users/${zoomID}`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`,
    },
  })

  return await result.json()
}

async function createZoomUser(person) {
  // Autofill name b/c 'first' & 'last' are required by Zoom, but not by us
  const first_name = person.fields['Full Name'].split(' ')[0] || 'Orpheus'
  const last_name = person.fields['Full Name'].split(' ')[1] || 'Hacksworth'
  const email = person.fields['Email']

  const body = JSON.stringify({
    action: 'create',
    user_info: {
      type: 2, // Licensed
      first_name,
      last_name,
      email,
    },
  })

  const result = await fetch('https://api.zoom.us/v2/users', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body,
  })
  console.log({token})
  console.log(result.body)

  return await result.json()
}

async function updateZoomUser(zoomID, upOrDowngrade) {
  const body = JSON.stringify({
    type: upOrDowngrade == 'upgrade' ? 2 : 1,
  })

  const result = await fetch(`https://api.zoom.us/v2/users/${zoomID}`, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    body,
  })

  return await result.json()
}
