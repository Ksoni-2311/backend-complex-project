import { ApiError } from '../utils/ApiErrors.js';
import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../model/user.model.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        console.log(token);
        console.log(process.env. ACCESS_TOKENS_SECRET);
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKENS_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})