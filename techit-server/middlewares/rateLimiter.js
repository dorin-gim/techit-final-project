const rateLimit = require('express-rate-limit');

// Custom store for tracking requests per user
class UserRateLimitStore {
  constructor() {
    this.hits = new Map();
    this.resetTimes = new Map();
  }

  incr(key, callback) {
    const now = Date.now();
    const windowStart = now - (24 * 60 * 60 * 1000); // 24 hours ago
    
    if (!this.hits.has(key)) {
      this.hits.set(key, []);
      this.resetTimes.set(key, now + (24 * 60 * 60 * 1000));
    }

    // Clean old hits
    const userHits = this.hits.get(key).filter(time => time > windowStart);
    this.hits.set(key, userHits);

    // Add current hit
    userHits.push(now);
    this.hits.set(key, userHits);

    const totalHits = userHits.length;
    const msBeforeNext = this.resetTimes.get(key) - now;

    callback(null, {
      totalHits,
      timeToExpire: Math.max(0, Math.ceil(msBeforeNext / 1000))
    });
  }

  decrement(key) {
    // Not implemented for this use case
  }

  resetAll() {
    this.hits.clear();
    this.resetTimes.clear();
  }
}

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'יותר מדי בקשות מכתובת IP זו, נסה שוב מאוחר יותר.',
    retryAfter: '15 דקות'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userKey = req.payload?._id || 'anonymous';
    return `${req.ip}:${userKey}`;
  }
});

// Strict limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    error: 'יותר מדי ניסיונות התחברות, נסה שוב בעוד 15 דקות.',
    attempts: 5,
    window: '15 דקות'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// User-specific daily limiter
const dailyUserLimiter = rateLimit({
  store: new UserRateLimitStore(),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000,
  message: {
    error: 'חרגת ממספר הבקשות המותר ליום (1000), נסה שוב מחר.',
    daily_limit: 1000,
    reset_time: '24 שעות'
  },
  keyGenerator: (req) => {
    return req.payload?._id || req.ip;
  },
  skip: (req) => {
    // Skip rate limiting for admin users
    return req.payload?.isAdmin === true;
  }
});

// Strict limiter for admin operations
const adminLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,
  message: {
    error: 'יותר מדי פעולות ניהול, נסה שוב בעוד 10 דקות.',
    admin_limit: 50,
    window: '10 דקות'
  },
  keyGenerator: (req) => {
    return `admin:${req.payload?._id || req.ip}`;
  }
});

module.exports = {
  generalLimiter,
  loginLimiter,
  dailyUserLimiter,
  adminLimiter
};