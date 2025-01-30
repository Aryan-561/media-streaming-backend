import {Router} from "express"
import {userRegister, loginUser, logOut, refreshAccessToken, updateUserPassword, updateUserAvatar, getCurrentUser, updateUserCoverImage, updateUserDetails, deleteUser} from "../controllers/user.controllers.js"
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

router.route("/update-avatar").patch(upload.single("avatar"), jwtVerfiy, updateUserAvatar)

router.route("/update-coverImage").patch(upload.single("coverImage"), jwtVerfiy, updateUserCoverImage)

router.route("/delete-account").delete(jwtVerfiy, deleteUser)


export default router;