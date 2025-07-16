import type { REST } from '@discordjs/rest'
import { API } from '@discordjs/core/http-only'

export default (rest: REST) => {
  return new API(rest)
}
