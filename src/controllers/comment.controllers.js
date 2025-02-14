import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const validateId = async(id)=>{
    if(!id){
        throw new ApiError(400, "Id is required!")
    }

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid Id!")
    }
}


// video comment
const addVideoComment = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    await validateId(videoId)
    const {comment} = req.body

    if(!comment?.trim()){
        throw new ApiError(400, "Comment content is required!")
    }

    const newComment = await Comment.create({
        video:new mongoose.Types.ObjectId(videoId),
        content:comment,
        owner:req.user?._id
    })

    if(!newComment){
        throw new ApiError(500, "Failed to add comment!")
    }

    return res.status(200).json(new ApiResponse(200, newComment, "Comment added successfully."))
})


const getVideoComments = asyncHandler(async(req, res)=>{
    const {videoId} = req.params
    const {page=1, limit=5}= req.query
    await validateId(videoId)

    

    const videoComments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            fullName:1,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                comment:"$content",
                owner:1,
                createdAt:1
            }
        },
        {
            $skip:(Number(page)-1)*Number(limit)
        },
        {
            $limit:Number(limit)
        }
    ])

    if(!videoComments){
        throw new ApiError(500, "Failed to fetched commnets")
    }

    return res.status(200).json(new ApiResponse(200, videoComments, "Comment fetched successfully."))
})


// tweet comment

const addTweetComment = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params
    await validateId(tweetId)

    const {comment} = req.body
    if(!comment?.trim()){
        throw new ApiError(400, "comment content is required!")
    }

    const newComment = await Comment.create({
        owner:req.user?._id,
        tweet: new mongoose.Types.ObjectId(tweetId),
        content:comment
    }) 
    if(!newComment){
        throw new ApiError(500, "Failed to add comment!")
    }

    return res.status(200).json(new ApiResponse(200, newComment, "Comment added successfully"))
})


const getTweetComments = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params
    const {page=1, limit=5} = req.query
    await validateId(tweetId)

    const tweetComments = await Comment.aggregate([
        {
            $match:{
                tweet: new mongoose.Types.ObjectId(tweetId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            fullName:1,
                            username:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                comment:"$content",
                owner:1,
                createdAt:1
            }
        },
        {
            $skip:(Number(page)-1)*Number(limit)
        },
        {
            $limit:Number(limit)
        }
    ])

    if(!tweetComments){
        throw new ApiError(500, "Failed to fetched tweet comments")
    }

    return res.status(200).json(new ApiResponse(200, tweetComments, "Tweet comments fetched successfully."))
})



const updateComment = asyncHandler(async(req, res)=>{
    const {commentId}= req.params
    await validateId(commentId)

    const {updatedComment} =req.body
    if(!updatedComment?.trim()){
        throw new ApiError(400, "comment content is required!")
    }

    const commentDetails = await Comment.findById(commentId)
    if(!commentDetails){
        throw new ApiError(404, "comment not found!")
    }
    if(!commentDetails.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized Request!")
    }
    commentDetails.content = updatedComment
    await commentDetails.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200, commentDetails, "Comment updated successfully."))
})


const deleteComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params
    await validateId(commentId)
    
    const commentDetails = await Comment.findById(commentId)
    if(!commentDetails){
        throw new ApiError(404, "Comment not Found!")
    }

    if(!commentDetails.owner.equals(req.user?._id)){
        throw new ApiError(401, "Unauthorized request!")
    }

    await Comment.deleteOne({_id:commentId})
    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully."))
})






export{
    addVideoComment,
    getVideoComments,
    addTweetComment,
    getTweetComments,
    updateComment,
    deleteComment,
}