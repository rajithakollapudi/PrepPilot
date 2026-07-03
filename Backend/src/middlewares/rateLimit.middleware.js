const redis = require("../config/redis.config")

/**
 * @description Rate limiting middleware using Redis
 * Limits user to 5 report generations per hour.
 */
async function rateLimitInterviewGeneration(req, res, next) {
    try {
        const userId = req.user.id
        const key = `rate-limit:interview:${userId}`
        const limit = 5
        const windowInSeconds = 3600 // 1 hour

        const currentRequests = await redis.get(key)

        if (currentRequests && parseInt(currentRequests) >= limit) {
            return res.status(429).json({
                message: "Rate limit exceeded. You can only generate 5 reports per hour.",
                error: "Too many requests"
            })
        }

        // Increment and set expiry if it's the first request in the window
        const multi = redis.multi()
        multi.incr(key)
        if (!currentRequests) {
            multi.expire(key, windowInSeconds)
        }
        await multi.exec()

        next()
    } catch (error) {
        console.error("Rate limit error:", error)
        // If Redis is down, we allow the request but log the error
        next()
    }
}

module.exports = {
    rateLimitInterviewGeneration
}
