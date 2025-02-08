import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiErr.js"
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import mongoose, { isValidObjectId } from "mongoose"


const validateVideoId = async(videoId) =>{
    if(!videoId){
        throw new ApiError(400, "video id is required!")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id!")
    }
}

const uploadVideo = asyncHandler(async(req, res)=>{

    // get title and description from req.body
    // validate it
    // check for video and thumbnail
    // upload on cloudinary
    // check for proper upload
    // get video information from clodinary
    // create video object - create entry on db
    // check for video creation
    // return response

    const {title, description} = req.body

    if(!(title && description)){
        throw new ApiError(400, "title or description is required")
    }

    const videoLocalfile = req.files?.video[0].path
    const thumbnailLocalfile = req.files?.thumbnail[0].path

    if(!videoLocalfile){
        throw new ApiError(400, "Video file is required!")
    }
    if(!thumbnailLocalfile){
        throw new ApiError(400, "thumbnail file is required!")
    }

    const videoFile = await uploadOnCloudinary(videoLocalfile);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalfile)

    console.log(videoFile)

    if(!videoFile){
        throw new ApiError(400,"video file is not found!")
    }
    if(!thumbnailFile){
        throw new ApiError(400,"thumbnail file is required!")
    }
    console.log("duration ->", String(videoFile.duration))

    const video = await Video.create({
        videoFile:videoFile.url,
        thumbnail:thumbnailFile.url,
        title,
        description,
        duartion:String(videoFile.duration),
        owner:req.user?._id
    })

    if(!video){
        throw new ApiError(502, "Failed to upload video")
    }

    return res.status(201).json(new ApiResponse(201,video, "Video upload successfully"))

})


const getVideoById = asyncHandler(async(req, res)=>{

    // get id through req.params
    // validate it
    // find video through id
    // return response

    const {videoId} = req.params

    await validateVideoId(videoId)
    

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not Found!")
    }

    return res.status(200).json(new ApiResponse(200, video, "Video found"))

})


const updateVideo = asyncHandler(async(req, res)=>{

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const {videoId} = req.params
    
        await validateVideoId(videoId)
    
        const video = await Video.findById(videoId).session(session);
    
        if(!video){
            throw new ApiError(404, "Video not Found!")
        }
    
        
        console.log(video.owner)
        console.log(req.user?._id)
        console.log(video.owner == req.user?._id)
        
        if(!( video.owner.equals(req.user?._id) )){
            throw new ApiError(401, "only owner of the video update it")
        }
    
        const {title, description} = req.body
    
        if(!(title && description)){
            throw new ApiError(400, "title or description is required")
        }
    
        const thumbnailLocalFile = req.file?.path
    
        if(!thumbnailLocalFile){
            throw new ApiError(400, "Thumbnail file is required!")
        }
    
        const thumbnailFile = await uploadOnCloudinary(thumbnailLocalFile)

        console.log("URL: ",thumbnailFile.url)
    
        if(!thumbnailFile){
            throw new ApiError(400,"thumbnail file is required!")
        }
    
        await deleteOnCloudinary(video.thumbnail);
    
        video.title = title
        video.description = description
        video.thumbnail = thumbnailFile.url
    
        await video.save({session, validateBeforeSave:false})

        await session.commitTransaction()
        session.endSession()
    
        return res.status(200).json(new ApiResponse(200,video, "Details updated of video"))
    
    } catch (error) {
    
        await session.abortTransaction()
        session.endSession()

        throw new ApiError(500, error.message)
    }
    // const  await Video.deleteOne({_id:video._id})

})


const deleteVideo = asyncHandler(async(req, res)=>{

    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const {videoId} = req.params
        await validateVideoId(videoId)
    
        const video = await Video.findById(videoId).session(session)
        
        if(!video){
            throw new ApiError(404, "video not found")
        }

        if(video.videoFile){
            await deleteOnCloudinary(video.videoFile, "video")
        }
        
        if(video.thumbnail){
            await deleteOnCloudinary(video.thumbnail)
        }
    
        await Video.deleteOne({_id:videoId},{session})

        await session.commitTransaction();
        session.endSession();
    
       return res.status(200).json(new ApiResponse(200, {}, "video deleted"))
    
    } catch (error) {
        
        await session.abortTransaction();
        session.endSession()

        throw new ApiError(500, error.message)
    }

})


const togglePublicStatus = asyncHandler(async(req, res)=>{

    const {videoId} = req.params

    await validateVideoId(videoId)

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(!(video.owner.equals(req.user?._id))){
        throw new ApiError(401, "Only owner of video change visibilty!")
    }

    video.isPublished = !video.isPublished;

    await video.save({validateBeforeSave: false});


    return res.status(200).json(new ApiResponse(200, video, `change video visibilty to ${video.isPublished?"Public":"Private"}`))


})

export {
    uploadVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublicStatus
}

