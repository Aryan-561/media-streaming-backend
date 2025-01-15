import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = Schema({

    videoFile:{
        type:String, // cloudinary url
        required:true,
    },

    thumbnail:{
        type:String, // cloudinary url
        requied: true,
    },

    title:{
        type:String, 
        required: true,
    },

    description:{
        type: String, 
        required: true,
    },

    views:{
        type: Number,
        default: 0,
    },

    duration:{
        type:String, // cloudinary url
        requied:true,
    },

    isPublished:{
        type:Boolean,
        default:true
    },

    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }


},{timestamps:true});


videoSchema.plugin(mongooseAggregatePaginate);

export const  Video = mongoose.model("Video", videoSchema)