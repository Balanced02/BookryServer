import mongoose from "mongoose";

const option = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000,
};

const connectDb = () => {
  mongoose
    .connect(process.env.MONGODB_URI, option)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => console.error(err));
};

export default connectDb;
