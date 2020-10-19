import { transcript } from "../utils"

const documentationURL = 'https://github.com/hackclub/orpheus-bot'

const replyFancy = async ({bot, message, textSteps}) => {
  bot.replyAndUpdate(message, (err, src, updateResponse) => {
    if (err) {
      console.error(err)
      return
    }
    textSteps.map(step => {
    })
  })
}

const interactionDocumentation = async (bot, message) => {
  try {
    const textSteps = [
      'R',
      'rE',
      'reA',
      'reaD',
      'read ',
      'read M',
      'read mY',
      'read my ',
      'read my D',
      'read my dO',
      'read my doC',
      'read my docS',
      'read my docs',
    ]
    bot.replyAndUpdate(
      message,
      textSteps[0],
      async (err, src, updateResponse) => {
        if (err) {
          console.error(err)
          return
        }
        for (const step in textSteps) {
          await new Promise((resolve,reject)=> {
            updateResponse(step, err => {
              if (err) reject(err)
              resolve()
            })
          })
        }
      }
    )

    // bot.replyAndUpdate(
    //   message,
    //   'READ',
    //   (err, src, updateResponse) => {
    //     if (err) {
    //       console.error(err)
    //       return
    //     }
    //     setTimeout(() => {
    //       updateResponse('read MY', err => {
    //         if (err) console.error(err)
    //       })
    //       setTimeout(() => {
    //         updateResponse('read my DOCS', err => {
    //           if (err) console.error(err)
    //         })
    //       }, Math.random() * 1000 + 1000)
    //     }, Math.random() * 1000 + 1000)
    //   }
    // )

    // let sent = await bot.reply(message, 'READ')
    // sent = await bot.updateMessage({
    //   text: 'read MY',
    //   ...sent
    // })
    // sent = await bot.updateMessage({
    //   text: 'read my DOCS',
    //   ...sent
    // })
    // sent = await bot.updateMessage({
    //   text: 'read my docs',
    //   ...sent
    // })
  } catch (err) {
    console.error(err)
    bot.reply(message, transcript('errors.general', { err }))
  }
}

export default interactionDocumentation