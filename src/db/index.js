import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

export const connectDb = async ()=>{
    try {
       const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       console.log("MongoDB CONNECTED >>> :",connectionInstance.connection)
    } catch (error) {
        console.log("MongoDB connection Failed!", error)
        process.exit(1)
    }
}