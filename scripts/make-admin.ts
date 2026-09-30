import "dotenv/config";
import mongoose from "mongoose";
import {connectDB} from "../lib/mongodb";
import User from "../models/User";

const email=process.argv[2]?.trim().toLowerCase();
if(!email){
  console.error("Usage: npm run make-admin -- you@example.com");
  process.exit(1);
}

await connectDB();
const user=await User.findOneAndUpdate(
  {email},
  {$set:{role:"admin",status:"active"}},
  {new:true}
).lean();

if(!user){
  console.error("No user found for:",email);
  process.exitCode=1;
}else{
  console.log("Admin role granted:",user.email);
}

await mongoose.connection.close();
