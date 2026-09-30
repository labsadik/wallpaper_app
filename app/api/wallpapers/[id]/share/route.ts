import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {getClientKey,rateLimit,rateLimitedResponse} from "@/lib/rate-limit";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const limiter=rateLimit("share:"+getClientKey(request,"ip"),120,60*1000);
  if(!limiter.allowed){
    return NextResponse.json({error:"Too many share requests."},rateLimitedResponse(limiter.retryAfterSeconds));
  }

  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id."},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findOneAndUpdate(
    {_id:id,status:"published"},
    {$inc:{shareCount:1}},
    {new:true,projection:"shareCount"}
  ).lean();

  if(!wallpaper)return NextResponse.json({error:"Wallpaper is not published."},{status:404});
  return NextResponse.json({shareCount:Number(wallpaper.shareCount)||0});
}

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id."},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).select("shareCount").lean();
  if(!wallpaper)return NextResponse.json({error:"Wallpaper is not published."},{status:404});
  return NextResponse.json({shareCount:Number(wallpaper.shareCount)||0});
}
