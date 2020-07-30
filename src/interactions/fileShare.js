import Bottleneck from 'bottleneck'
import fetch from 'isomorphic-unfetch'

import { initBot, transcript, airGet, airCreate } from '../utils'

const ratelimiter = new Bottleneck({
  maxConcurrent: 1,
})

const generateLink = file => {
  console.log('generating link for file', file.id)
  return new Promise((resolve, reject) => {
    initBot(true).api.files.sharedPublicURL({ file: file.id }, (err, res) => {
      if (err) {
        if (err == 'already_public') {
          resolve(file.permalink_public)
        }
        console.error(err)
        reject(err)
      }
      resolve(res.file.permalink_public)
    })
  })
}

const generateLinks = async files => {
  console.log('Generating links for ', files.length, 'file(s)')
  return await Promise.all(
    files.map(async file => {
      console.log(file)
      const pageURL = await generateLink(file)
      console.log('public page url', pageURL)
      const urlRegex = /([A-Za-z0-9]+)/g
      const urlChunks = pageURL
        .replace('https://slack-files.com/', '')
        .match(urlRegex)
      const [teamID, fileID, pubSecret] = urlChunks
      console.log('url chunks', urlChunks)
      const fileURL = `${file.url_private}?pub_secret=${pubSecret}`
      // const fileURL = await scrapePage(pageURL)
      console.log('file url', fileURL)
      const shortURL = await ratelimiter.schedule(() =>
        createShortLink(fileURL, 'cdn')
      )
      return shortURL
    })
  )
}

const reaction = async (bot = initBot(), addOrRemove, channel, ts, name) => {
  return new Promise((resolve, reject) => {
    bot.api.reactions[addOrRemove](
      { channel, timestamp: ts, name },
      (err, res) => {
        if (err) {
          console.error('error while', addOrRemove, name, ':', err)
          reject(err)
        } else {
          resolve(name)
        }
      }
    )
  })
}

const createShortLink = async (url = '/', preferredPath) => {
  console.log(
    'Creating a short link for',
    url,
    'with the preferred slug of',
    preferredPath
  )
  const existingRecords = await airGet(
    'Links',
    `FIND('${preferredPath}',{slug}) > 0`,
    null,
    { base: 'hackaf' }
  )
  const takenSlugs = existingRecords.map(r => r.fields['slug'])
  console.log('takenSlugs are', takenSlugs)

  let i = 0
  let preferredSlug = preferredPath
  while (takenSlugs.includes(preferredSlug)) {
    console.log(
      'preferredSlug',
      preferredSlug,
      'already exists in hack.af, trying something else...'
    )
    preferredSlug = preferredPath + '-' + i++
  }

  console.log('using slug', preferredSlug, 'because it is unused')

  const shortRecord = await airCreate(
    'Links',
    { slug: preferredSlug, destination: url },
    { base: 'hackaf' }
  )

  return 'https://hack.af/' + shortRecord.fields['slug']
}

const uploadToCDN = (files) => {
  console.log('Generating links for ', files.length, 'file(s)')
  console.log('File links are:', files)
  return new Promise((resolve, reject) => {
    fetch('https://cdn.hackclub.com/api/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(files)
    }).then(r => r.json()).then(resolve).catch(reject)
  })
}

export default async (bot = initBot(), message) => {
  const cdnChannelID = 'C016DEDUL87'

  const { ts, channel, files } = message
  if (channel != cdnChannelID) {
    return
  }

  try {
    const results = {}
    await Promise.all([
      reaction(bot, 'add', channel, ts, 'beachball'),
      uploadToCDN(files).then(f => {
        results.links = f
      }).catch(e => {
        results.error = e
      })
      // generateLinks(files)
      //   .then(f => {
      //     results.links = f
      //   })
      //   .catch(e => {
      //     results.error = e
      //   }),
    ])
    if (results.error) {
      throw results.error
    }

    if (results.links) {
      await Promise.all([
        reaction(bot, 'remove', channel, ts, 'beachball'),
        reaction(bot, 'add', channel, ts, 'white_check_mark'),
        bot.replyInThread(
          message,
          transcript('fileShare.success', { links: results.links })
        ),
      ])
    }
  } catch (err) {
    await Promise.all([
      reaction(bot, 'remove', channel, ts, 'beachball'),
      reaction(bot, 'add', channel, ts, 'no_entry'),
      bot.replyInThread(message, transcript('errors.general', { err })),
    ])
  }
}
