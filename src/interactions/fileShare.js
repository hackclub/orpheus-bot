import cheerio from 'cheerio'
import fetch from 'isomorphic-unfetch'

import { initBot, transcript, airGet, airCreate } from '../utils'

const scrapePage = url => {
  console.log('pulling file info from', url)
  return new Promise((resolve, reject) => {
    fetch(url + '?nojs=1')
      .then(r => r.text())
      .then(html => {
        const $ = cheerio.load(html)
        const link = $('a.file_header,a.file_body').attr('href')
        resolve(link)
      })
      .catch(reject)
  })
}

const generateLink = file => {
  console.log('generating link for file', file.id)
  return new Promise((resolve, reject) => {
    initBot(true).api.files.sharedPublicURL({ file: file.id }, (err, res) => {
      if (err) {
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
      const fileURL = await scrapePage(pageURL)
      console.log('file url', fileURL)
      const shortURL = await createShortLink(fileURL, 'cdn')
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

const createShortLink = async (url, preferredPath) => {
  const existingRecords = await airGet(
    'Links',
    `FIND({slug},'${preferredPath}') > 0`,
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

export default async (bot, message) => {
  const cdnChannelID = 'C016DEDUL87'

  const { ts, channel, files } = message
  if (channel != cdnChannelID) {
    return
  }

  try {
    const results = {}
    await Promise.all([
      reaction(bot, 'add', channel, ts, 'beachball'),
      generateLinks(files)
        .then(f => {
          results.links = f
        })
        .catch(e => {
          results.error = e
        }),
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
      reaction(bot, 'remove', channel, ts, 'white_check_mark'),
      reaction(bot, 'add', channel, ts, 'no_entry'),
      bot.replyInThread(message, transcript('errors.general', { err })),
    ])
  }
}
