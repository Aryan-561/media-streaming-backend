import {Router} from "express"
import {jwtVerfiy} from "../middlewares/auth.middleware.js"
import {
    createPlaylist,
    addVideoToPlaylist,
    removeVideoToPlaylist,
    updatePlaylistDetails,
    deletePlaylist,
    getUserPlaylist,
    getPlaylistById
  } from "../controllers/playlist.controllers.js"

const router = Router();

router.use(jwtVerfiy);

router.route("/").post(createPlaylist)

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoToPlaylist)

router.route("/:playlistId").get(getPlaylistById).patch(updatePlaylistDetails).delete(deletePlaylist)

router.route("/user/:userId/").get(getUserPlaylist)

export default router;