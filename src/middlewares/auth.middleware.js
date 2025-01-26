import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErr.js";


export const jwtVerfiy = asyncHandler(async (req, res, next) =>{

    try {
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
     if(!token){
      throw new ApiError(401, "Unauthorization Token");
     }
  
     const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_CODE);
  
     const user = User.findById(decodedToken._id).select("-password -refreshToken");
  
     req.user = user;
     next();
    } catch (error) {
     throw new ApiError(401, error?.message || "invalid token")
    }
 
 })