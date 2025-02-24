import { Router } from "express";
import {jwtVerfiy} from "../middlewares/auth.middleware.js"
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controllers.js"

const router = Router()

router.use(jwtVerfiy)
router.route("/videos/:channelId").get(getChannelVideos)
router.route("/stats/:channelId").get(getChannelStats)

export default router;