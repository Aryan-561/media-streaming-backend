import { Router } from "express";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideo } from "../controllers/like.controllers.js";
import {jwtVerfiy} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(jwtVerfiy)

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/videos").get(getLikedVideo)
export default router;