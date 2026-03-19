import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    msg: "Too many requests. Please try again later.",
  },
});

export default limiter;
