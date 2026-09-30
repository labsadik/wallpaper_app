import mongoose from "mongoose";

const uri=process.env.MONGODB_URI;
if(!uri) throw new Error("Missing MONGODB_URI");

declare global{var _mongoose:{conn:typeof mongoose|null;promise:Promise<typeof mongoose>|null}|undefined}
const cached=global._mongoose??{conn:null,promise:null};
global._mongoose=cached;

export async function connectDB(){
  if(cached.conn) return cached.conn;
  if(!cached.promise) cached.promise=mongoose.connect(uri,{dbName:process.env.MONGODB_DB_NAME||"wallpaper_saas"});
  cached.conn=await cached.promise;
  return cached.conn;
}