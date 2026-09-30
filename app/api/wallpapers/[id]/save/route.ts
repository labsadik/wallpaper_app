import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Save from "@/models/Save";
import Wallpaper from "@/models/Wallpaper";
import {getClientKey,rateLimit,rateLimitedResponse} from "@/lib/rate-limit";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});

  const limiter=rateLimit("save:"+session.user.id+":"+getClientKey(request,"ip"),60,60*1000);
  if(!limiter.allowed){
    return NextResponse.json({error:"Too many save requests."},rateLimitedResponse(limiter.retryAfterSeconds));
  }

  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id."},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).select("_id").lean();
  if(!wallpaper)return NextResponse.json({error:"Wallpaper is not published."},{status:404});

  const existing=await Save.findOne({userId:session.user.id,wallpaperId:id});
  if(existing){
    await existing.deleteOne();
    await Wallpaper.findByIdAndUpdate(id,{$inc:{saveCount:-1}});
    return NextResponse.json({saved:false});
  }

  try{
    await Save.create({userId:session.user.id,wallpaperId:id});
    await Wallpaper.findByIdAndUpdate(id,{$inc:{saveCount:1}});
    return NextResponse.json({saved:true});
  }catch{
    return NextResponse.json({error:"Unable to save wallpaper"},{status:409});
  }
}
