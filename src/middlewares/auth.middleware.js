import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";


export const jwtVerfiy = asyncHandler(async (req, res, next) =>{
    // get the token from cookies or req.header
    // validate it
    // decoded token through jwt
    // find the user through id
    // create req.user and insert user in it
    // next()

    try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
     if(!token){
      throw new ApiError(401, "Unauthorization Token");
     }
  
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_CODE);
  
     const user = await User.findById(decodedToken._id).select("-password -refreshToken");
     if(!user){
        throw new ApiError(404, "User doesn't find!")
     }
     req.user = user;
     next();
     
    } catch (error) {
     throw new ApiError(401, error?.message || "invalid token")
    }
 
 })