import { initBot, transcript } from '../utils'

const generateLinks = files => {
  console.log('Generating links for ', files.length, 'file(s)')
  return Promise.all(
    files.map(f => {
      if (f.permalink_public) {
        console.log('file', f.id, 'already has a permalink, skipping!')
        return f.permalink_public
      } else {
        console.log('file', f.id, 'needs a permalink, generating')
        return new Promise((resolve, reject) => {
          initBot(true).api.files.sharedPublicURL(
            { file: f.id },
            (err, res) => {
              if (err) {
                console.error(err)
                reject(err)
              }
              resolve(res.file.permalink_public)
            }
          )
        })
      }
    })
  )
}

const reaction = async (bot = initBot(), addOrRemove, channel, ts, name) => {
  return new Promise((resolve, reject) => {
    bot.api.reactions[addOrRemove]({ channel, timestamp: ts, name }, (err, res) => {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        resolve(name)
      }
    })
  })
}

export default async (bot, message) => {
  const cdnChannelID = 'C016DEDUL87'
  const botSpamChannelID = 'C0P5NE354'

  const { ts, channel, files, user } = message
  console.log('ts', ts)
  if (channel != botSpamChannelID) {
    return
  }

  try {
    const results = {}
    await Promise.all([
      reaction(bot, 'add', channel, ts, 'beachball'),
      generateLinks(files)
        .then(f => (results.links = f))
        .catch(e => (results.error = e)),
    ])
    console.log('results', results)
    if (results.error) {
      throw results.error
    }

    if (results.links) {
      await Promise.all([
        reaction(bot, 'remove', channel, ts, 'beachball'),
        reaction(bot, 'add', channel, ts, 'white_check_box'),
        bot.replyInThread(message, transcript('fileShare.success', { links })),
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
