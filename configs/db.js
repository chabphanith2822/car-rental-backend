import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected Online!"))
        await mongoose.connect(process.env.MONGODB_URI); 
    } catch (error) {
        console.log("DB Connection Error: ", error.message);
    }
}

export default connectDB;