import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiErr.js";
import { Subscription} from "../models/subscription.model.js"
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async(req, res)=>{
    
    // get channel id from req.params
    // validate it
    // check cann't subscribe own channel
    // check channel already subscribed or not
    // create a subscription document
    // return response

    const {channelId} = req.params;
    const userId = req.user?._id
    if(!channelId?.trim()){
        throw new ApiError(400, "channel id is required!")
    }


    if(!isValidObjectId(channelId)){
        throw new ApiError(404, "Channel not found!");
    }

    if(userId == channelId){
        throw new ApiError(400, "Cann't subscribe own channel!")
    }

    const isSubscribed = await Subscription.findOne({
        $and: [{subscriber:userId}, {channel:channelId}]
    })

    if(isSubscribed){
        
        try {
            const deletedSubscription =  await Subscription.findByIdAndDelete(isSubscribed?._id)
    
            if(!deletedSubscription){
                throw new ApiError(404, "subscription not found")
            }
    
            return res.status(200).json(new ApiResponse(200,deletedSubscription, "channel is unsubscribed"))

        } catch (error) {
            throw new ApiError(500, error.message)
        }
        
    }


    const subscriptionDocument = await Subscription.create({
        subscriber:userId,
        channel:channelId
    });

    if(!subscriptionDocument){
        throw new ApiError(500, "Failed to subscription the channel!")
    }

    return res.status(200).json(new ApiResponse(200, subscriptionDocument, "Channel subscribed successfully"))

})

const getUserFollower = asyncHandler(async (req, res) => {
   const {userId} = req.params;

   if(!userId){
    throw new ApiError(400, "user id is required")
   }

   if(!isValidObjectId(userId)){
    throw new ApiError(404, "Followers not found")
   }

   const followers = await Subscription.aggregate([

        {
            $match:{
                channel: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"followers"
            }
        },

        {
            $unwind:"$followers"
        },
        {
            $project:{
                _id:0,
                id:"$followers._id",
                username:"$followers.username",
                fullName:"$followers.fullName",
                avatar:"$followers.avatar"
            }
        }

   ])

   console.log(followers); 

   if(!followers){
    throw new ApiError(500, "Failed to fetch followers")
   }

   return res.status(200).json(new ApiResponse(200,followers,"followers fetched successfully!")) 

})

const getUserFollowing = asyncHandler(async(req, res)=>{

    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400, "user id is required")
    }
    
    if(!isValidObjectId(userId)){
        throw new ApiError(404, "Followers not found")
    }

    const following = await Subscription.aggregate([

        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },

        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"following"
            }
        },

        {
            $unwind:"$following"
        },

        {
            $project:{
                _id:0,
                id:"$following._id",
                username:"$following.username",
                fullName:"$following.fullName",
                avatar:"$following.avatar"
            }
        }

    ])

    if(!following){
        throw new ApiError(500, "failed to fetch following user")
    }

    return res.status(200).json(new ApiResponse(200, following, "Folowing channel fetch successfully"))

})

export {
    toggleSubscription,
    getUserFollower,
    getUserFollowing
}

