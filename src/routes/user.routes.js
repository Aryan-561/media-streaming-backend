import {Router} from "express"
import {userRegister, loginUser, logOut} from "../controllers/user.controllers.js"
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

export default router;