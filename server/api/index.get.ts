defineRouteMeta({
  openAPI: {
    description: 'Test route description',
    parameters: [{ in: 'query', name: 'test', required: false }],
  },
})

export default defineEventHandler((event) => {
  const query = getQuery(event)
  if (!query.test) {
    return { message: 'hello world' }
  }
  return { message: `GET: hello world with query test=${query.test}` }
})
