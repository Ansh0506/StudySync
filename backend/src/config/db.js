import mongoose from "mongoose";

// Opens the MongoDB connection used by every Mongoose model.
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed");
    process.exit(1);
  }
};

export default connectDB;
