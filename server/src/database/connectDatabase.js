import mongoose from "mongoose";

const connectDatabase = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URl);
    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error while connecting MongoDB database: ${error.message}`);
  };
};

export default connectDatabase;
