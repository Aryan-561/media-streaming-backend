import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Tweet} from "../models/tweet.model.js"
import mongoose,{ isValidObjectId } from "mongoose";



const validateTweetId = async(tweetId)=>{
    if(!tweetId){
        throw new ApiError(400, "tweetId is required")
    }
    

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid id!")
    }
};


const createTweet = asyncHandler(async(req, res)=>{
    // get content from req.body
    // validate it
    // create a tweet object - create entry in db
    // extract owner details through populate
    // retuen res

    const {content} = req.body
    
    if(!content){
        throw new ApiError(400, "Content is required!");
    }

    const newTweet = await Tweet.create({
        content,
        owner:req.user?._id
    })

    const tweet = await Tweet.findById(newTweet._id).populate("owner", "username fullName avatar")

    if(!tweet){
        throw new ApiError(400, "Failed to create a tweet!")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully"))

})


const getTweet = asyncHandler(async(req, res)=>{

    const {tweetId} = req.params

    await validateTweetId(tweetId)

    const tweet = await Tweet.findById(tweetId).populate("owner", "username fullName avatar").populate("owner", "username fullName avatar")
    
    if(!tweet){
        throw new ApiError(404, "Tweet not Found!")
    }

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet fetched Successfully"))

})

const deleteTweet = asyncHandler(async(req, res)=>{
    
    const {tweetId} = req.params
    
    await validateTweetId(tweetId)

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not Found!")
    }

    if(!(tweet.owner.equals(req.user?._id))){
        throw new ApiError("Only owner delete this tweet")
    }

    await Tweet.deleteOne({_id:tweetId})

    return res.status(200).json(new ApiResponse(200, {},"Tweet deleted successfully."))

    

})

const updateTweet = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params
    await validateTweetId(tweetId)
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "content field is required")
    }

   const tweet = await Tweet.findOneAndUpdate({
        _id:tweetId ,owner:req.user?._id
        },
        {
            $set:{
                content:content
            }
        },
        {
            new:true
        }
    ).populate("owner", "username avatar fullName")

    if(!tweet){
        throw new ApiError(400, "Failed to updating the tweet")
    }    

    return res.status(200).json(new ApiResponse(200, tweet, "Successfully upadted the tweet"))

})

const getUserTweets = asyncHandler(async(req, res)=>{
    const {userId} = req.params
    if(!userId){
        throw new ApiError(400, "userId is required")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid userId" )
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[{
                    $project:{
                        username:1,
                        avatar:1,
                        fullName:1
                    }
                }]
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project:{
                _id:0,
                tweetId:"$_id",
                content:1,
                createdAt:1,
                owner:1
            }
        }
    ])

    if(!tweets){
        throw new ApiError(400, "Failed to fetched the tweets")
    }

    return res.status(200).json(new ApiResponse(200, tweets, "Successfully fetched tweets"))
})

export {
    createTweet,
    getTweet,
    deleteTweet,
    updateTweet,
    getUserTweets  

}