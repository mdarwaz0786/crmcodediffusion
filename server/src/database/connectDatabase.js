import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 60000,
    });

    console.log("✅ Server is successfully connected to MongoDB database.");
  } catch (error) {
    console.log("❌ Error while connecting MongoDB database:", error);
  };
};

export default connectDatabase;
