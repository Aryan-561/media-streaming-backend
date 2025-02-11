import { Router } from "express";
import {jwtVerfiy} from "../middlewares/auth.middleware.js"
import {createTweet, getTweet, updateTweet, deleteTweet, getUserTweets} from "../controllers/tweet.controllers.js"
const router = Router()

router.use(jwtVerfiy)

router.route("/create").post(createTweet)

router.route("/user/:userId").get(getUserTweets)

router.route("/:tweetId")
.get(getTweet)
.patch(updateTweet)
.delete(deleteTweet)

export default router;