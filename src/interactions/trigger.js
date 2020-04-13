import { xor, uniq } from 'lodash'

import { airGet, airFind, airPatch } from '../utils'
import interactionCheckinNotification from './checkinNotification'
import { authedGHRequest } from '../adapter/github'

const getAdmin = (bot, user) =>
  new Promise((resolve, reject) => {
    bot.api.users.info({ user }, (err, res) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(res.user.is_owner)
    })
  })

const sendCheckinNotifications = async (message, dryRun = true) => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentDay = now.toLocaleDateString('en', { weekday: 'long' })
  console.log(
    `The time is ${currentHour} on ${currentDay}. I'm going to send checkin notifications`
  )
  const clubs = await airGet(
    'Clubs',
    `AND( IS_BEFORE({First Meeting Time}, TODAY()), {Checkin Hour} = '${currentHour}', {Checkin Day} = '${currentDay}', {Slack Channel ID} != '' )`
  )

  return await Promise.all(
    clubs.map(club => {
      const channel = club.fields['Slack Channel ID']

      console.log(
        `*starting checkin w/ "${club.fields['ID']}" in channel ${channel}*`
      )

      if (dryRun) {
        bot.replyInThread(
          message,
          `(Dry run) I'm reaching out to <#${channel}> (database ID \`${club.fields['ID']}\`)`
        )
      } else {
        bot.replyInThread(
          message,
          `I'm reaching out to <#${channel}> (database ID \`${club.fields['ID']}\`)`
        )
        return interactionCheckinNotification(undefined, { channel })
      }
    })
  )
}

const validateDinoisseurBadges = async (message, dryRun = true) => {
  const dinoisseurBadge = await airFind('Badges', 'Name', 'Dinoisseur', {
    priority: 0,
  })
  const repoData = await authedGHRequest(
    'GET /repos/:owner/:repo/stats/contributors',
    {
      owner: 'hackclub',
      repo: 'dinosaurs',
    }
  )
  const prData = await authedGHRequest('GET /repos/:owner/:repo/pulls', {
    owner: 'hackclub',
    repo: 'dinosaurs',
    state: 'open',
  })

  const contributors = [
    ...repoData.data.filter(node => node.author).map(node => node.author.html_url),
    ...prData.data.map(node => node.user.html_url), // submitters of open PRs are also eligible for the badge
  ]

  console.log(`I found ${contributors.length} dino contributors on GitHub!`)

  const airtableContributors = await Promise.all(
    contributors.map(contributor =>
      airFind('People', 'GitHub URL', contributor, { priority: 0 })
    )
  )

  const uniqueRecordIDs = uniq(
    airtableContributors.filter(r => r).map(record => record.id)
  )

  if (dryRun) {
    bot.replyInThread(
      message,
      `(Dry run) I found ${dinoisseurBadge.fields['People'].length} slack users who earned the :dinoisseur-badge:`
    )
    return
  }

  const result = await airPatch(
    'Badges',
    dinoisseurBadge.id,
    { People: uniqueRecordIDs },
    { priority: 0 }
  )

  console.log(
    `I ended up finding ${result.fields['People'].length} who have permission to use the Dinoisseur badge.`
  )

  console.log(
    dinoisseurBadge.fields['People'],
    result.fields['People']
  )
  const changeInContributors = xor(
    dinoisseurBadge.fields['People'],
    result.fields['People']
  )

  changeInContributors.map(async recordID => {
    const person = await airFind('People', `RECORD_ID() = '${recordID}'`)
    console.log(`I'm letting <@${recordID}> know they've earned the smug-dino badge`)
    bot.say({
      channel: person.fields['Slack ID'],
      text:
        "Hey, you've earned the :dinoisseur-badge:! You can use it by typing `:dinoisseur-badge:` or `:smug-dino:`",
    })
  })

  if (changeInContributors.length > 0) {
    bot.replyInThread(
      message,
      `I found ${result.fields['People'].length} slack users who earned the :dinoisseur-badge:`
    )
  }
}

const triggerInteraction = (bot, message) => {
  const { ts, channel, user, text } = message
  const dryRun = !text.includes('thump thump')

  getAdmin(bot, user)
    .then(admin => {
      if (!admin) {
        bot.api.reactions.add({
          timestamp: ts,
          channel: channel,
          name: 'broken_heart',
        })
        throw new Error('user_not_leader')
      }

      console.log(
        'I can hear my heart beat in my chest... it fills me with determination'
      )
      bot.api.reactions.add({
        timestamp: ts,
        channel: channel,
        name: 'heartbeat',
      })

      return Promise.all([
        // sendCheckinNotifications(message, dryRun),
        validateDinoisseurBadges(message, dryRun),
      ])
    })
    .catch(err => {
      console.error(err)
      bot.whisper(message, `Got error: \`${err}\``)
    })
}

export default triggerInteraction
