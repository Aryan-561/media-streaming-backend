import { response } from "express";

const asyncHandler = (fn) => async (req, res, next)=>{
    try{
        await fn(req, res, next)
    }catch(err){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}

export  {asyncHandler};

// pormise

// const asyncHandler = (resquestHandler)=>{
//     (req,res,next)=>{
//         Promise.resolve(resquestHandler(req, res, next)).catch(err=>console.log("ERR:",err))
//     }
// }