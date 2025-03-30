import dotenv from 'dotenv'
import {app} from './app.js'
import express from "express"
import connectDBs  from './db/index.js'
dotenv.config({
    path:'./env'
})

connectDBs()
.then(app.listen(process.env.PORT ||8000),()=>{

    app.on("error",(error)=>{
        console.log("Err in src/index.js:",error);
        throw error        
    })

    console.log(`Server is running at port ${process.env.PORT}`);
    
})
.catch((err)=>console.log("MONGOO db connection failed:",err)
)













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