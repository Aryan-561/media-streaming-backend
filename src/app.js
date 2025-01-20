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

app.use("/api/v1/user", userRoutes)
app.get("/message",(req, res)=>{
    res.send(`its's working`)
})
export {app}