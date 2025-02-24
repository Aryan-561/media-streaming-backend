import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose, {isValidObjectId} from "mongoose";

const validateId = async(id)=>{
    if(!id){
        throw new ApiError(400, "Id is required!")
    }

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid Id!")
    }
}

const getChannelVideos = asyncHandler(async(req, res)=>{
    const {channelId} = req.params
    await validateId(channelId)
    
    const videos = await Video.find({owner:channelId}).select("-updatedAt -description").sort({createdAt:-1})

    return res.status(200).json(new ApiResponse(200, videos, "Channel video fatched successfully."))
})



const getChannelStats = asyncHandler(async(req, res)=>{
    const {channelId} = req.params
    await validateId(channelId)
    
    // video information
    const videosInfo = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{from:"likes",
            localField:"_id",
            foreignField:"video",
            as:"likes"}
        },
        {
            $group:{
                _id:null,
                totalVideos: { $sum:1 },
                totalViews: { $sum:"$views" },
                totalLikes:{ $sum:{ $size:"$likes" } }
            }
        }
    ])

    if(!videosInfo){
        throw new ApiError(400, "Failed to fetched the videos information!")
    }
    console.log(videosInfo)

    // Tweet information
    const tweetsInfo = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"owner",
                as:"likes"
            }
        },
        {
            $group:{
                _id:null,
                totalTweets:{$sum:1},
                totalLikes:{$sum:{$size:"$likes"}}
            }
        }
    ])

    if(!tweetsInfo){
        throw new ApiError(400, "Failed to fetched the tweets information!")
    }
    console.log(tweetsInfo)


    const totalSubscriber = await Subscription.countDocuments({channel:channelId})

    if(totalSubscriber==null || totalSubscriber==undefined){
        throw new ApiErr(500, "Failed to Fethched the subscriber!")
    }

    const response={
        subscribers: totalSubscriber,
        video:{
        total:videosInfo[0].totalVideos,
        views: videosInfo[0].totalViews,
        videosLikes: videosInfo[0].totalLikes,
        },
        tweet:{
            total: tweetsInfo[0].totalTweets,
            tweetsLikes: tweetsInfo[0].totalLikes
        } 
    }

    return res.status(200).json(new ApiResponse(200, response, "Channel stats fetched susseccfully."))
   

})

export{
    getChannelVideos,
    getChannelStats
}