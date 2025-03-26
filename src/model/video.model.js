import mongoose,{Schema} from "mongoose"
import { User } from "./user.model"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const VideoSchema=new Schema({
    videoFile:{
        type:String,//cloudnary
        required:true
    },
    thumbnail:{
        type:String, //cloudnary
        required:true
    },
    title:{
        type:String,
        require
    },
    discription:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

VideoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",VideoSchema) 