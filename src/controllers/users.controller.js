import {asyncHandler} from '../utils/asyncHandler.js'
import {User} from '../model/user.model.js'
import { ApiError } from "../utils/ApiErrors.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    const accessToken = user.generateAccessToken;
    const refreshToken = user.generateRefreshToken;

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };

  } catch (error) {
    console.error("Token generation error:", error); // log the actual error
    throw new ApiError(500, "Something went wrong while generating refresh and access token");
  }
};


  
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

const loginUser=asyncHandler(async(req,res)=>{
  // (username or email) and password req
  // if no username and email give =>errror
  // chk pass
  // if pass yes add user and generate  refresh and access token
  // send cookies
  const {email,username,password}=req.body
  console.log(email,username,password);

  
  if(!username && !email){
    throw new ApiError(400,"username or password is required");
  }

  // User ->mongoose ka object h baki ye user apna banaya hua h 
  const user=await User.findOne({
    // we are using mongodb function from mongoose to find user by either username or email 
    // {email} ->directly using destructure we can access email
    $or:[{username},{email}]
  },{}
  )
  if(!user){
    throw new ApiError(404,"User do not exist")
  }

  const PasswordValid= await user.isPasswordCorrect(password)

  if(!PasswordValid){
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

const refreshAccessToken=asyncHandler(async (req,res)=>{
  try {
    const incomingRefreshToken=req.cookies.refreshToken
    if(!incomingRefreshToken){
      throw new ApiError("401","Unauthoruzed request");   
    }
    const decodedToken=jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECTET)
  
    const user=await User.findById(decodedToken?._id)
  
    if(!user){
      throw new ApiError(401,"Invalid refresh token");
    }
  
    if(incomingRefreshToken!==user?.refreshAccessToken){
      throw new ApiError(401,"Refresh Token is expired or used"); 
    }
  
    const options={
      httpOnly:true,
      secure:true
    }
  
    return res 
    .status(200)
    .cookies("accessToken",accessToken,options)
    .cookies("refreshToken",newRefreshToken,options)
    .json (new ApiResponse(
      200,{accessToken,refreshAccessToken:newRefreshToken},
        "accessToken refreshed"
    ))
  }
   catch (error) {
    throw new ApiError(401,error?.message||"Invalid refresg token");
    
  }
})


const getCurrentUser=asyncHandler(async (req,res)=>{
  return res
  .status(200)
  .json(200,req.user,"current user fetched successfully")
})

const updateAcccountDetails=asyncHandler(async(req,res)=>{
  const {fullName,email}=req.body

  if(!fullName || !email){
    throw new ApiError(200,"All foelds are required");
    
  }
  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName,
        email
      }
    }
    ,{new:true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse (200,"Acount Details updated successfully"))
})


const updateUserAvatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=req.file?.path
  
  if(!avatarLocalPath){
    throw new ApiError(400,req.message||"Avatar file not found");    
  }

  const avatar=await uploadOnCloudinary(avatarLocalPath)

  if(!avatar.url){
    throw new ApiError(400,req.message||"Avatar file url not found");    
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {$set:{
        avatar:avatar.url
    }},
    {new:true}
  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse (200,"avatar set successfully"))

})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
  const coverImageLocalPath=req.file?.path
  
  if(!coverImageLocalPath){
    throw new ApiError(400,req.message||"coverImage file not found");    
  }

  const coverImage=await uploadOnCloudinary(avatarLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,req.message||"coverImage file url not found");    
  }

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {$set:{
      coverImage:avatar.url
    }},
    {new:true}
  ).select("-password")


  return res
  .status(200)
  .json(new ApiResponse (200,"coverImage set successfully"))

})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAcccountDetails,
  updateUserAvatar,
  updateUserCoverImage
}