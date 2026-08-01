import mongoose from "mongoose";

export async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("MongoDB Connected Succesfully");
    } catch (error) {
        console.log("Something went worng during the connection");
        console.log(error);
        throw error;
    }
}
