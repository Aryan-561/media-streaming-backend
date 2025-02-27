import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";


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

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "video not found!")
    }

    const isLiked = await Like.findOne({
        video: video._id,
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the video."))
    }

    const likeVideo = await Like.create({
        likedBy:req.user?._id,
        video: video._id
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

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "tweet not found!")
    }

    const isLiked = await Like.findOne({
        tweet:tweet._id,
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the tweet."))
    }

    const likeTweet = await Like.create({
        likedBy:req.user?._id,
        tweet:tweet._id
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

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "comment not found!")
    }

    const isLiked = await Like.findOne({
        comment:comment._id,
        likedBy:req.user?._id
    })
    
    if(isLiked){
        await Like.deleteOne(isLiked._id)
        return res.status(200).json(new ApiResponse(200, {}, "unliked the comment."))
    }

    const likeComment = await Like.create({
        likedBy:req.user?._id,
        comment: comment._id
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