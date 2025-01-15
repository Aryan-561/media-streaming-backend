import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema({

    username:{
        type:String,
        required: [true, "username is required!"],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    email: {
        type:String,
        required: [true, "email is required"],
        unique: true,
        trim: true
    },

    fullName:{
        type: String,
        required: [true, "full-name is required"],
        trim: true,
        index: true
    },

    avatar:{
        type: String, // cloudinary url
        required: true
    },

    coverImage:{
        type: String, // cloudinary url
    },

    password:{
        type: String,
        required: [true, "password is required!"],

    }, 

    refershToken:{
        type:String,
    },

    watchedVideo:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ]

},{timestamps:true});

userSchema.pre("save", async function (){
    if (this.isModified("password")) return next();

     this.password = await bcrypt.hash(this.password, 10)

})

userSchema.methods.isPasswordCorrect = async function(){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){

    return jwt.sign(
        
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
            
        },

        process.env.ACCESS_TOKEN_CODE,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )

};


userSchema.methods.generateRefershToken = function (){

    return jwt.sign(

        {
            _id:this._id
        },

        process.env.REFERSH_TOKEN_CODE,

        {
            expiresIn:REFERSH_TOKEN_EXPIRY
        }

    )

};



export const User = mongoose.model("User", userSchema);