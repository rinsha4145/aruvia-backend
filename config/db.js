import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,)
        console.log(`connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`error ${error.message}`);
        process.exit(1);
        
        
    }
}