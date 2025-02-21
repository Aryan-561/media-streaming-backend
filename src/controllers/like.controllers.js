import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";


const validateId = async(id)=>{
    if(!id){
        throw new ApiError(400, "Id is required!")
    }

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid Id!")
    }
}


// video like
const toggleVideoLike = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    await validateId(videoId)

    const isLiked = await Like.findOne({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the video."))
    }

    const likeVideo = await Like.create({
        likedBy:req.user?._id,
        video: new mongoose.Types.ObjectId(videoId)
    })

    if(!likeVideo){
        throw new ApiError(400, "Failed to liked the video!")
    }

    return res.status(200).json(new ApiResponse(200, likeVideo, "liked the video successfully."))
})

// tweet like
const toggleTweetLike = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params
    await validateId(tweetId)

    const isLiked = await Like.findOne({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the tweet."))
    }

    const likeTweet = await Like.create({
        likedBy:req.user?._id,
        tweet: new mongoose.Types.ObjectId(tweetId)
    })

    if(!likeTweet){
        throw new ApiError(400, "Failed to liked the tweet!")
    }

    return res.status(200).json(new ApiResponse(200, likeTweet, "liked the tweet successfully."))
})


// comment like
const toggleCommentLike = asyncHandler(async(req, res)=>{
    const {commentId} = req.params
    await validateId(commentId)

    const isLiked = await Like.findOne({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the comment."))
    }

    const likeComment = await Like.create({
        likedBy:req.user?._id,
        comment: new mongoose.Types.ObjectId(commentId)
    })

    if(!likeComment){
        throw new ApiError(400, "Failed to liked the comment!")
    }

    return res.status(200).json(new ApiResponse(200, likeComment, "liked the comment successfully."))
})


// get current user liked vidoes
const getLikedVideo = asyncHandler(async(req, res)=>{
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:req.user?._id,
                video: {$exists: true}
            } 
                
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"video",
            }
        },
        {
            $unwind:"$video"
        },
        {
            $project:{
                _id:0,
                likedId:"$_id",
                videoId:"$video._id",
                title:"$video.title",
                thumbnail:"$video.thumbnail",
                owner:"$video.owner"
            }
        }
    ])

    if(!likedVideos){
        throw new ApiError(400, "failed to fetched to liked video!")
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked video successfully fetched."))

})

export {
    toggleVideoLike,
    toggleTweetLike,
    toggleCommentLike,
    getLikedVideo
}