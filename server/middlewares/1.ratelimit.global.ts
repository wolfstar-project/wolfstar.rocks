import defineRateLimitMiddleware from "~~/server/utils/middlewares/ratelimit";

export default defineEventHandler((event) => {
  return defineRateLimitMiddleware(event, {
    time: 5,
    max: 10
  });
});
