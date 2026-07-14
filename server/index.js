import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/connectDb.js"
import cookieParser from "cookie-parser"
dotenv.config()
import cors from "cors"
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user.route.js"
import interviewRouter from "./routes/interview.route.js"
import paymentRouter from "./routes/payment.route.js"
import mockTestRouter from "./routes/mockTest.route.js"
import codingTestRouter from "./routes/codingTest.route.js"
import adminRouter from "./routes/admin.route.js"

const app = express()
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://prepnest-ai.netlify.app",
    process.env.CLIENT_URL
].filter(Boolean).map(url => url.replace(/\/+$/, ""));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes("*")) {
            callback(null, true);
        } else {
            console.error(`CORS blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())
app.use("/public", express.static("public"))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/payment", paymentRouter)
app.use("/api/mock-test", mockTestRouter)
app.use("/api/coding-test", codingTestRouter)
app.use("/api/admin", adminRouter)

const PORT = process.env.PORT || 6000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    connectDb()
})
