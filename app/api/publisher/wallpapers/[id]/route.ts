import {NextResponse} from "next/server";
import mongoose from "mongoose";
import {connectDB} from "@/lib/mongodb";
import {getActiveSession} from "@/lib/admin";
import Wallpaper from "@/models/Wallpaper";
import User from "@/models/User";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});

  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id."},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findById(id);
  if(!wallpaper)return NextResponse.json({error:"Wallpaper not found."},{status:404});

  const user=await User.findById(session.user.id).select("role").lean();
  const isOwner=String(wallpaper.publisherId)===session.user.id;
  const isAdmin=user?.role==="admin";
  if(!isOwner&&!isAdmin)return NextResponse.json({error:"You can only manage your own wallpapers."},{status:403});

  if(wallpaper.status!=="pending_review"){
    return NextResponse.json({ok:true,status:wallpaper.status,published:wallpaper.status==="published"});
  }

  wallpaper.status="published";
  wallpaper.publishedAt=new Date();
  wallpaper.publishAt=undefined;
  wallpaper.moderationReason=undefined;
  wallpaper.removedAt=undefined;
  wallpaper.removedBy=undefined;
  await wallpaper.save();

  return NextResponse.json({ok:true,status:"published",published:true});
}

export async function DELETE(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});

  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id."},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findById(id);
  if(!wallpaper)return NextResponse.json({error:"Wallpaper not found."},{status:404});

  if(String(wallpaper.publisherId)!==session.user.id&&session.user.role!=="admin"){
    return NextResponse.json({error:"You can only delete your own wallpapers."},{status:403});
  }

  wallpaper.status="archived";
  wallpaper.removedAt=new Date();
  wallpaper.removedBy=new mongoose.Types.ObjectId(session.user.id);
  wallpaper.moderationReason="Deleted by publisher";
  await wallpaper.save();

  return NextResponse.json({ok:true,status:"archived"});
}
