const express = require('express')
const cookieParser = require("cookie-parser")
const cors = require("cors")
const app = express()

app.set('trust proxy', 1);

app.use(express.json())
app.use(cookieParser())
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://preppilot-backend-9xwv.onrender.com",
  "https://prep-pilot-zeta.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}))

/*require all the routes here*/
const authRouter = require("./routes/auth.routes")
const interviewRouter = require('./routes/interview.routes')
const jobsRouter = require('./routes/jobs.routes')

/*using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/jobs", jobsRouter)

module.exports = app