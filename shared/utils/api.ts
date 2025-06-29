import { API } from '@discordjs/core/http-only'
import { rest } from './rest'

export default () => {
  return new API(rest)
}
