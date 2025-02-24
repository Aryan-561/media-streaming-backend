
import { ApiError } from "../utils/ApiErr.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    try {
        res.status(200).json(new ApiResponse(200, "Server is running", "Health check successful"))

    } catch (error) {
        console.error("error", error)
        throw new ApiError(500, "An error occurred while performing the health check")
    }
})

export {
    healthcheck
}
