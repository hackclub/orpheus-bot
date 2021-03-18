import { initBot } from '../controller'

const joinChannel = async channel => {
  return new Promise((resolve, reject) => {
    initBot().api.conversations.join({ channel }, (err, res) => {
      if (err) {
        reject(err)
      }
      resolve(res.channel)
    })
  })
}

const interactionJoinChannel = async (bot = initBot(), message = {}) => {
  const { channel } = message

  const result = await joinChannel(channel)

  return result
}

export default interactionJoinChannel
