import mongoose from "mongoose";
import dns from "dns";

const connectDb = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("DataBase Connected");
  } catch (error) {
    console.log(`DataBase Error ${error}`);
  }
};

export default connectDb;
