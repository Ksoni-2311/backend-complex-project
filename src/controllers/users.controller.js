import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../model/user.model.js'
import { ApiError } from "../utils/ApiErrors.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessTokenAndRefreshToken=async(userId)=>{
  try {
      const user=await User.findById(userId)
      const accessToken=user.generateAccessToken()
      const refreshToken=user.generateRefreshToken()
  
      user.refreshToken=refreshToken
      await user.save({ValiditeBeforeSave:false})
      return {accessToken,refreshToken}
  }
  catch (error) {
    throw new ApiError(500,"Error while generating tokens")
  }
}
  
  //   async(userId){
  //   const user=await User.findById(userId)
  //   const accessToken=user.generateAccessToken()
  //   const refreshToken=user.generateRefreshToken()

  //   user.refreshToken=refreshToken
  //   await user.save({ValiditeBeforeSave:false})
  //   return {accessToken,refreshToken}

  // }
  //  catch (error) {
  //   throw new ApiError(500,"Error while generating tokens")
  // }


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
    const {fullName,email,username,password}=req.body
    console.log("email:",email,"pass:",password);

    // s2
    /*FOR BEGGINNERS WE CAN CHECK BY CHECKING EACH FIELD BY USIN IF AND ELSE STATEMENTS
    #BUT SIR'S STYLE WE ARE USING SOME METHORD 
    */
   if ([fullName,email,username,password].some((field)=> field?.trim==="")){
    throw new ApiError(400,"all fields are required");
   }

   const existedUser=await User.findOne({
    $or:[{username},{email}]
   })

    //3rd point check    
    if (existedUser) {
     throw new ApiError(409, "User with this email or username already exists");
 }
 
 // Safe way to get file paths
 const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

if (!avatarLocalPath) {
  throw new ApiError(409, "Avatar is required");
}

// Ensure Cloudinary Upload Works
const avatar = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

console.log(avatarLocalPath);


if (!avatar) {
  throw new ApiError(400, "Avatar is mandatory");
}
    // User is directly talking to data base so we are using create methords to add all the required details to database directly    
   const user=await User.create({
    fullName,email,password,
    avatar:avatar.url,
    //We were getting error so we make an secureCheck by using ? before .     
    coverImage:coverImage?.url || "",
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

const loginUser=asyncHandler(async (res,req)=>{
  // (username or email) and password req
  // if no username and email give =>errror
  // chk pass
  // if pass yes add user and generate  refresh and access token
  // send cookies

  const {email,username,password}=req.body
  
  if(!username || !email){
    throw new ApiError(400,"username or password is required");
  }

  // User ->mongoose ka object h baki ye user apna banaya hua h 
  const user=await User.findOne(
    // we are using mongodb function from mongoose to find user by either username or email 
    // {email} ->directly using destructure we can access email
    $or[{email},{username}] 
  )
  if(!user){
    throw new ApiError(404,"User do not exist")
  }

  const PasswordValid= await user.isPasswordCorrect(password)

  if(!PasswordVerificationlid){
    throw new ApiError(401,"Invalid user credentials")
  }

  const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

  // select( waha pr wo likhna h wo nhi chyhe with minus sign eg=>"-password" at line 132 60 )
  const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

  // server can modify cookies  if we put httpOnly->True in options 
  const options={
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    // if user is using mobile below is a good practise to send respoinse so that either user will be able to save cookies 
    new ApiResponse(
      200,{
        user:loggedInUser,accessToken,refreshToken
      },
      "User loggedIn successfully"
    )
  )
})

const logoutUser=asyncHandler(async (req,res)=>{
  await User.findByIdAndUpdate(req.user._id,
    {
      $set:{
        refreshToken:undefined
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged Out"))

})

export {
  registerUser,
  loginUser,
  logoutUser
}