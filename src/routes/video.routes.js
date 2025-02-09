import {Router} from "express"
import { jwtVerfiy } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideo, getVideoById, togglePublicStatus, updateVideo, uploadVideo } from "../controllers/video.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(jwtVerfiy)
router.route("/upload").post(upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),uploadVideo)

router.route('/').get(getAllVideo)

router.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"), updateVideo)
.delete(deleteVideo)

router.route("/toggle/publish/:videoId").patch(togglePublicStatus)

export default router;