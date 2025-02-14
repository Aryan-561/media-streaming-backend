import { Router } from "express";
import { addVideoComment, deleteComment, updateComment, getVideoComments, addTweetComment, getTweetComments } from "../controllers/comment.controllers.js";
import {jwtVerfiy} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(jwtVerfiy)

// video comment routes
router.route("/video/:videoId").post(addVideoComment).get(getVideoComments)

// tweet comment routes
router.route("/tweet/:tweetId").post(addTweetComment).get(getTweetComments)

router.route("/c/:commentId").delete(deleteComment).patch(updateComment)

export default router;