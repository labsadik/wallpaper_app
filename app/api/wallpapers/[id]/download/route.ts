import {NextResponse} from "next/server";
import crypto from "node:crypto";
import mongoose from "mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";
import {bunnySignedUrl} from "@/lib/bunny";

export const runtime="nodejs";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getServerSession(authOptions);
  const {id}=await params;
  if(!mongoose.isValidObjectId(id)) return NextResponse.json({error:"Invalid wallpaper id"},{status:400});

  try{
    await connectDB();
    const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
    if(!wallpaper?.variants?.desktop?.key) return NextResponse.json({error:"Wallpaper not found"},{status:404});

    const requestId=crypto.randomUUID();
    await Download.create({userId:session?.user?.id||undefined,wallpaperId:id,requestId});
    await Wallpaper.findByIdAndUpdate(id,{$inc:{downloadCount:1}});

    return NextResponse.json({url:bunnySignedUrl(wallpaper.variants.desktop.key)});
  }catch(error){
    const message=error instanceof Error?error.message:"Download failed";
    return NextResponse.json({error:message},{status:500});
  }
}
