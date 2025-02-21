import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import mongoose, {isValidObjectId} from "mongoose";


const validateId = async(id)=>{
    if(!id){
        throw new ApiError(400, "Id is required!")
    }

    if(!isValidObjectId(id)){
        throw new ApiError(400, "Invalid Id!")
    }
}


// create-playlist
const createPlaylist = asyncHandler(async(req, res)=>{
  const {name, description}  = req.body

  if(!name?.trim() || !description?.trim()){
    throw new ApiError(400, "Name and Description are required!")
  }

  const newPlaylist = await Playlist.create({
    owner:req.user?._id,
    name,
    description
  })

  if(!newPlaylist){
    throw new ApiError(500, "Failed to create a playlist!")
  }

  return res.status(200).json(new ApiResponse(200, newPlaylist, "PlayList created successfully."))

})


// add-video-to-playlist
const addVideoToPlaylist = asyncHandler(async(req, res)=>{
    const {playlistId, videoId} = req.params
    await validateId(videoId)
    await validateId(playlistId)

    const isVideo = await Video.findById(videoId);
    if(!isVideo){
      throw new ApiError(404, "video is not found!")
    }

    const isPlaylist = await Playlist.findById(playlistId)
    if(!isPlaylist){
      throw new ApiError(404, "playlist is not found!")
    }

    if(!(isPlaylist.owner.equals(req.user?._id))){
      throw new ApiError(403, "Unauthorized request!")
    }

    if(isPlaylist.video.includes(videoId)){
      throw new ApiError(403, "Video already exist in playlist!")
    }

    const filter = {_id:playlistId, owner:req.user?._id}
    const playlist = await Playlist.findOneAndUpdate(filter,{
        $addToSet:{
            video:videoId
        }
    },
    {
      new :true
    }
  )

    if(!playlist){
        throw new ApiError(500, "Failed to add video in playlist")
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video added in playlist successfully."))
})



// remove-video-from-playlist
const removeVideoToPlaylist = asyncHandler(async(req, res)=>{
  const {videoId, playlistId} = req.params
  await validateId(videoId)
  await validateId(playlistId)

  const isVideo = await Video.findById(videoId);
  if(!isVideo){
    throw new ApiError(404, "video is not found!")
  }

  const isPlaylist = await Playlist.findById(playlistId)
  if(!isPlaylist){
    throw new ApiError(404, "playlist is not found!")
  }

  if(!(isPlaylist.owner.equals(req.user?._id))){
    throw new ApiError(403, "Unauthorized request!")
  }

  if(!isPlaylist.video.includes(videoId)){
    throw new ApiError(403, "Video doesn't exist in playlist!")
  }

  const filter = {_id:playlistId, owner:req.user?._id}
  const playlist = await Playlist.findOneAndUpdate(filter, 
    {
      $pull:{video:videoId}
    },{
    new:true
  })

  if(!playlist){
    throw new ApiError(500,"Failed to remove the video in playlist")
  }

  return res.status(200).json(new ApiResponse(200,playlist, "video removed from the playlist successfully."))

})



// update-playlist-details
const updatePlaylistDetails = asyncHandler(async(req, res)=>{
  const {playlistId} = req.params
  await validateId(playlistId)

  const isPlaylist = await Playlist.findById(playlistId)
  if(!isPlaylist){
    throw new ApiError(404, "playlist is not found!")
  }

  if(!(isPlaylist.owner.equals(req.user?._id))){
    throw new ApiError(403, "Unauthorized request!")
  }

  const {name, description} = req.body
  
  if(!name || !description){
    throw new ApiError(400, "Name and Description are required!")
  }
  const filter = {_id:playlistId, owner:req.user?._id}

  const playlist = await Playlist.findOneAndUpdate(filter,{
    $set:{
      name,description
    }
  },{
    new:true
  })

  if(!playlist){
    throw new ApiError(500,"Failed to update playlist details!")
  }

  return res.status(200).json(new ApiResponse(200, playlist, "Playlist details updated successfully."))

})


// delete-playlist
const deletePlaylist = asyncHandler(async(req, res)=>{
  const {playlistId} = req.params
  await validateId(playlistId)

  const isPlaylist = await Playlist.findById(playlistId)
  if(!isPlaylist){
    throw new ApiError(404, "playlist not found!")
  }

  if(!(isPlaylist.owner.equals(req.user?._id))){
    throw new ApiError(403, "Unauthorized request!")
  }

  const deletePlaylist = await Playlist.findOneAndDelete(
    {
      _id:playlistId,
      owner:req.user?._id
    }
  )

  if(!deletePlaylist){
    throw new ApiError(500, "Failed to delete the playlist!")
  }

  return res.status(200).json(new ApiResponse(200, {}, "Playlist successfully deleted."))

})


// get user playlist
const getUserPlaylist = asyncHandler(async(req, res)=>{
  const {userId} = req.params
  await validateId(userId)

  const isUser = await User.findById(userId);
  if(!isUser){
    throw new ApiError(404, "User not found!")
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match:{
        owner:new mongoose.Types.ObjectId(userId),
        video:{$exists:true}
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"video",
        foreignField:"_id",
        as:"video"
      }
    },
    {
      $addFields:{
        playlistThumbnail:{
          $arrayElemAt:["$video.thumbnail",0]
        },
        videoCount:{
          $size:"$video"
        }
        }
      
    },
    {
      $project:{
        _id:0,
        playlistId:"$_id",
        playlistThumbnail:1,
        videoCount:1,
        name:1,
        description:1,
      }
    }
  ])

  if(!userPlaylists){
    throw new ApiError(403,"Failed to fetched the user playlists!")
  }

  return res.status(200).json(new ApiResponse(200,userPlaylists,
    "User playlist successfully fetched."
  ))

})



// get playlist through id
const getPlaylistById = asyncHandler(async(req, res)=>{
  const {playlistId} = req.params
  await validateId(playlistId)

  const isPlaylist = await Playlist.findById(playlistId)
  if(!isPlaylist){
    throw new ApiError(404, "playlist not found!")
  }

  const playlist = await Playlist.aggregate([
    {
      $match:{
        _id: new mongoose.Types.ObjectId(playlistId),
        video:{$exists:true}
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"video",
        foreignField:"_id",
        as:"video",
        pipeline:[
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner"
            }
          },
          {
            $unwind:"$owner"
          },
          {
            $project:{
              _id:0,
              videoId:"$_id",
              title:1,
              thumbnail:1,
              views:1,
              duration:1,
              createdAt:1,
              channelUsername:"$owner.username",
              channelAvatar:"$owner.avatar",
              channelName:"$owner.fullName"
            }
          }
        ]

      }
    },
    {
      $addFields:{
        playlistThumbnail:{
          $arrayElemAt:["$video.thumbnail",0]
        },
        videoCount:{
          $size:"$video"
        }
        }
    },
    {
      $project:{
        _id:0,
        playlistId:"$_id",
        playlistThumbnail:1,
        videoCount:1,
        name:1,
        description:1,
        video:1
      }
    }
  ])

  if(!playlist){
    throw new ApiError(500, "Failed to fetched the playlist!")
  }

  return res.status(200).json(new ApiResponse(200, playlist, "Playlist fetched successfully."))

})



export{
  createPlaylist,
  addVideoToPlaylist,
  removeVideoToPlaylist,
  updatePlaylistDetails,
  deletePlaylist,
  getUserPlaylist,
  getPlaylistById
}