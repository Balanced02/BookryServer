import mongoose from 'mongoose';

const option = {
  socketTimeoutMS: 30000,
  keepAlive: true,
  reconnectTries: 30000,
};

const connectDb = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, option);
    // eslint-disable-next-line no-console
    console.log('database_connected');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};

export default connectDb;
