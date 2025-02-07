import {Router} from "express"

import {
    userRegister, 
    loginUser, 
    logOut, 
    refreshAccessToken, 
    updateUserPassword, 
    updateUserAvatar, 
    getCurrentUser, 
    updateUserCoverImage, 
    updateUserDetails, 
    deleteUser, 
    getUserChannelProfile, 
    getUserWatchHistory} from "../controllers/user.controllers.js"

import {upload} from "../middlewares/multer.middleware.js"
import { jwtVerfiy } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxcount:1
        },
        {
            name:"coverImage",
            maxcount:1
        }
    ])
    ,userRegister);

router.route("/login").post(loginUser);

router.route("/logout").post(jwtVerfiy, logOut);

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").patch(jwtVerfiy, updateUserPassword)

router.route("/current-user").get(jwtVerfiy ,getCurrentUser)

router.route("/update-details").patch(jwtVerfiy, updateUserDetails)

router.route("/update-avatar").patch( jwtVerfiy, upload.single("avatar"), updateUserAvatar)

router.route("/update-coverImage").patch( jwtVerfiy, upload.single("coverImage"), updateUserCoverImage)

router.route("/delete-account").delete(jwtVerfiy, deleteUser)

router.route("/channel/:username").get(jwtVerfiy, getUserChannelProfile)

router.route("/watched-history").get(jwtVerfiy, getUserWatchHistory)
export default router;