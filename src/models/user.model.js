import mongoose, {Schema} from "mongoose";

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

export const User = mongoose.model("User", userSchema);