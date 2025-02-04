import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import {asyncHandler} from "./asyncHandler.js"
import { ApiError } from "./ApiErr.js";

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
);

const uploadOnCloudinary = async function(localFilePath){
    try {
        if(!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
                folder:"ytbackend"
            }
        );

        // console.log("File is upload on cloudinary: ",response.url);
        fs.unlinkSync(localFilePath)
        console.log(response)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null ;
    }
}

const deleteOnCloudinary = asyncHandler(async(url)=>{
    const publicId = url.split('/').pop().split(".")[0];

    const response = await cloudinary.uploader.destroy(`ytbackend/${publicId}`);
    console.log(response)
    
    if(response.result !== "ok"){
        throw new ApiError(400, "something is wrong while deleting in file")
    }

    
})

export {uploadOnCloudinary, deleteOnCloudinary};