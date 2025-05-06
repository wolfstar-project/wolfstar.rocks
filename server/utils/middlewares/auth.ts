export default function AuthMiddleware() {
  return defineEventHandler(async (event) => {
    await requireUserSession(event, {
      statusCode: 401,
      message: 'Missing session',
    })
  })
}
