import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"24kb"}))
app.use(express.urlencoded({extended:true, limit:"24kb"}))
app.use(express.static("public"));
app.use(cookieParser())

import userRoutes from "./routes/user.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
import videosRoutes from "./routes/video.routes.js"
import tweetRoutes from "./routes/tweet.routes.js"
import commentsRoutes from "./routes/comment.routes.js"
import likeRoutes from "./routes/like.routes.js"
import playlistRoutes from "./routes/playlist.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"
import healthcheckRoutes from "./routes/healthcheck.routes.js"

app.use("/api/v1/user", userRoutes)
app.use("/api/v1/subscription",subscriptionRoutes)
app.use("/api/v1/videos", videosRoutes)
app.use("/api/v1/tweet" ,tweetRoutes)
app.use("/api/v1/comments", commentsRoutes)
app.use("/api/v1/like", likeRoutes)
app.use("/api/v1/playlist", playlistRoutes)
app.use("/api/v1/channel", dashboardRoutes)
app.use("/api/v1/healthcheck", healthcheckRoutes)

export {app}
