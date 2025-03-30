import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../model/user.model.js'
import { ApiError } from "../utils/ApiErrors.js";
import {uploadOnCloudianary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser=asyncHandler(async (req,res)=>{
    /*ALGORITHM FOR REGISTER USER
    // return res.status(200).json({
    //     message:"ok KESAHV "
    // })


    //1 take details from frontend 
    //2 validaate- not empty
    //3 check weather the user is already registered or not If registered throw error else register it
    //4chk for avatar,images 
    //5 upload it to cloudinary,avatar
    //6 create user object-create entry on db
    //7 remove pass and refresh token field from response
    //8 chk for user creation
    //9 return res
    */

    // s1
    const {fullname,email,username,password}=req.body
    console.log("email:",email,"pass:",password);

    // s2
    /*FOR BEGGINNERS WE CAN CHECK BY CHECKING EACH FIELD BY USIN IF AND ELSE STATEMENTS
    #BUT SIR'S STYLE WE ARE USING SOME METHORD 
    */
   if ([fullname,email,username,password].some((field)=> field?.trim==="")){
    throw new Error(400,"all fields are required");
   }

   const existedUser=User.findOne({
    $or:[{username},{email}]
   })

    //3rd point check    
   if(existedUser){
    throw new ApiError(409,"User with this email and username already exist");
   }

   const avatarLocalPath=req.files?.avatar[0]?.path;
   const coverImageLocalPath=req.files?.coverImage[0]?.path;


   if(!avatarLocalPath){
    throw new ApiError(400,"Avatar to lagega hi lagega");
   }

   const avatar=await uploadOnCloudianary(avatarLocalPath)
   const coverImage=await uploadOnCloudianary(coverImageLocalPath)

   if(!avatar){
    throw new ApiError(400,"Avatar to lagega hi lagega");
   }

    // User is directly talking to data base so we are using create methords to add all the required details to database directly    
   const user=await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage.url || "",
    email,password,
    username:username.toLowerCase()
   })

   const createdUser=await User.findById(user._id).select("-password -refreshToken")

   if(!createdUser){
        throw new ApiError(500,"Something went wrong while regiistrating user")
   }
   return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully") 
   )

})

export {registerUser}