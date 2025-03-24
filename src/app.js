import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
-cookieParser from 'cookie-parser'
const app=express();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
}))

//13-16 are some basic configurations
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

export  {app};