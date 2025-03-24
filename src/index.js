import dotenv from 'dotenv'

import express from "express"
import connectDBs  from './db/index.js'
const app=express()
dotenv.config({
    path:'./env'
})

connectDBs();













// first apporach
//always try to wrap database
// function connectDB(){} 
/*
;(async ()=>{
    try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error",(error)=>{
        console.log("Err:",error);
        throw error        
    })
    app.listen(process.env.PORT,()=>{
        console.log(`App listening on port ${process.env.PORT}`);
    })

    } catch (error) {
        console.log("Error",error);
        throw error;
    }
})()

*/