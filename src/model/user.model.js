import mongoose,{Schema} from "mongoose"
import {jwt} from 'jsonwebtoken'
const UserSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    fullname:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    avatar:{
        type:String,  //cloudanary url
        required:true,
    },
    coverImage:{
        type:String,
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    refreshTokens:{
        type:String
    }
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
UserSchema.methods.generateAccessTokens=function(){
    jwt.sign(
        {
            _id:this.id,
            email:this.email
        },process.env.ACCESS_TOKENS_SECTET,{
            expiresIn:ACCESS_TOKENS_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshTokens=function(){
    return jwt.sign(
        {
            _id:this.id,
            email:this.email
        },process.env.REFRESH_TOKEN_SECTET,{
            expiresIn:REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",UserSchema) 