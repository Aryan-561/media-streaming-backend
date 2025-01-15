import dotenv from "dotenv"
import { connectDb } from "./db/index.js"
import { app } from "./app.js";

dotenv.config({
    path:'./env'
});

const port = process.env.PORT || 8000;

connectDb()
.then(()=>{
    app.use("error",(err)=>{
        console.log("Error",err)
        throw err
    })
    app.listen(port,()=>{
        console.log(`Server is running at ${port} port.`)
    })
})
.catch(err=>console.log("MongoDB conntection Failed",err))