import { Router } from "express";
import { jwtVerfiy } from "../middlewares/auth.middleware.js";
import { toggleSubscription, getUserFollower, getUserFollowing } from "../controllers/subscription.controllers.js";

const router = Router();

router.use(jwtVerfiy)

router.route("/channel/:channelId").post(toggleSubscription)
router.route("/followers/:userId").get(getUserFollower)
router.route("/following/:userId").get(getUserFollowing)

export default router;