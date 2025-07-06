import { API } from '@discordjs/core/http-only'
import { rest } from '~~/server/utils/rest'

export default () => {
  return new API(rest)
}
