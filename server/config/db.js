const mongoose = require("mongoose");

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 3000
        });
        console.log("MongoDB connected successfully!");
    }
    catch(error){
        console.warn("⚠️  MongoDB connection failed:", error.message);
        console.warn("ℹ️  Backend server running in offline fallback mode. Update server/.env with a MongoDB connection string when available.");
    }
}

module.exports = connectDB;