import mongoose from 'mongoose'
import {DB_NAME} from "../constants.js"

const connectDBs = async()=>{
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected !! DB Hosted: ${connectionInstance.connection.host}`);
        // console.log(connectionInstance);
    } catch (error) {
        console.log("MONGO error:",error);
        process.exit(1)
    }
}

export default connectDBs;