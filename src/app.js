import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import
import userRouter from './routes/user.routes.js'

// routes declaration 
// apka url bnega aise=>https://localhost:8000/api/v1/users (register[is area m basically jo tum routes banayoge wo iske bad lag jyga and it will runn])
app.use("/api/v1/users",userRouter)


export  {app};