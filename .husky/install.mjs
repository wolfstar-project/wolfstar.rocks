/* eslint-disable antfu/no-top-level-await */
/* eslint-disable no-console */
import process from 'node:process'
// Skip Husky install in production and CI
if (process.env.NODE_ENV === 'production' || process.env.CI === 'true') {
  process.exit(0)
}
const husky = (await import('husky')).default
console.log(husky())
