import { authedGHRequest } from '../../adapter/github'
import { airFind, airPatch } from '../../utils'
import { xor, uniq } from 'lodash'

export default async (bot = initBot(), message, dryRun = true) => {
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
    ...repoData.data
      .filter(node => node.author)
      .map(node => node.author.html_url),
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

  console.log(dinoisseurBadge.fields['People'], result.fields['People'])
  const changeInContributors = xor(
    dinoisseurBadge.fields['People'],
    result.fields['People']
  )

  changeInContributors.map(async recordID => {
    const person = await airFind('People', `RECORD_ID() = '${recordID}'`)
    console.log(
      `I'm letting <@${recordID}> know they've earned the smug-dino badge`
    )
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
