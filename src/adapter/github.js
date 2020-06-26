import { request } from '@octokit/request'
export const authedGHRequest = request.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
  },
})
