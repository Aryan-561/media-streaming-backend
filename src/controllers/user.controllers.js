import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiErr.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {User} from "../models/user.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(userId)=>{

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};
}


const userRegister = asyncHandler( async(req, res)=>{
     //  get user details from frontend
    //  validationn - not empty
    //  check if already exist or not
    //  check for image, check for avatar
    //  upload them on cloudinary, avatar
    //  create user object - create entry on db
    //  remove password and refersh token field from response
    //  check for user creation
    //  return response

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
    "-password -refreshToken"
   )

   if(!createUser){
    throw new ApiError(500, "something went wrong while registering the user")
   }

   return res.status(201).json(
    new ApiResponse(200, createUser, "user registered successfully")
   )

})

const loginUser = asyncHandler( async(req, res)=>{

    // get data from res.body
    // validate it
    // check user exist or not
    // check password
    // generate access and refersh token
    // send cookies

   const {email, password, username} =  req.body;
    console.log(email, username, password)
   if((!username && !email)){
        throw new ApiError(400, "Username or email are required")
   }

  const user = await User.findOne({
                 $or: [{username}, {email}]
                });
    
  if(!user){
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordValid =  await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(401, "Password is Incorrect");
  }

  const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id);

  const loggedUser =  await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly : true,
    secure : true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200, {
    user:loggedUser, accessToken, refreshToken
  }, "User Logged in Successfully"))

})

const logOut = asyncHandler(async (req, res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }
    },{
        new: true
    })

    const options = {
        httpOnly : true,
        secure : true
      }

      return res.status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"))

})

export {userRegister, loginUser, logOut};