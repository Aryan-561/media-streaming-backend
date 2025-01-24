import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErr.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


//  get user details from frontend
//  validationn - not empty
//  check if already exist or not
//  check for image, check for avatar
//  upload them on cloudinary, avatar
//  create user object - create entry on db
//  remove password and refersh token field from response
//  check for user creation
//  return response

const userRegister = asyncHandler( async(req, res)=>{
   

   const {username, fullName, email, password} = req.body
//    console.log(username, fullName, email)
//    console.log(req.body)

    if([username, fullName, email, password].some(field=>field.trim() === "")){
        throw new ApiError(400,"All field are required")
    }

    const existedUser = await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "username or email already exists!")
    }

    // console.log(req.files)

   const avatarLocalPath =  req.files?.avatar[0]?.path;

    let coverImageLocalPath;

    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }
   
   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required!")
   }

   const avatar =  await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   
   if(!avatar){
    throw new ApiError(400, "Avatar file is required!")
   }

   const user = await User.create({
    fullName,
    password,
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.toLowerCase()
   })

   const createUser = await User.findById(user._id).select(
    "-password -refershToken"
   )

   if(!createUser){
    throw new ApiError(500, "something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200, createUser, "user registered successfully")
   )

})

export {userRegister};