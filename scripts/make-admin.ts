import "dotenv/config";
import mongoose from "mongoose";
import {connectDB} from "../lib/mongodb";
import User from "../models/User";

async function main(){
  const email=process.argv[2]?.trim().toLowerCase();
  if(!email){
    console.error("Usage: npm run make-admin -- you@example.com");
    process.exitCode=1;
    return;
  }

  await connectDB();

  const user=await User.findOneAndUpdate(
    {email},
    {$set:{role:"admin",status:"active"}},
    {new:true}
  ).lean();

  if(!user){
    console.error("No application user found for:",email);
    process.exitCode=1;
    return;
  }

  console.log("Admin role granted:",user.email);
}

main()
  .catch((error)=>{
    console.error(error instanceof Error?error.message:error);
    process.exitCode=1;
  })
  .finally(async()=>{
    await mongoose.connection.close().catch(()=>{});
  });
