import {NextResponse} from "next/server";
import crypto from "node:crypto";
import mongoose from "mongoose";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";
import {bunnySignedUrl} from "@/lib/bunny";

const VALID_DEVICES=["desktop","tablet","mobile"] as const;

export const runtime="nodejs";

export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getServerSession(authOptions);
  const {id}=await params;
  if(!mongoose.isValidObjectId(id)) return NextResponse.json({error:"Invalid wallpaper id"},{status:400});

  try{
    await connectDB();
    const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
    if(!wallpaper) return NextResponse.json({error:"Wallpaper not found"},{status:404});

    const requestedDevice=new URL(request.url).searchParams.get("device");
    const available=(wallpaper.devices?.length?wallpaper.devices:["desktop","tablet","mobile"]).filter((device):device is typeof VALID_DEVICES[number] =>
      (VALID_DEVICES as readonly string[]).includes(device)
    );
    const device=(requestedDevice&&available.includes(requestedDevice as typeof VALID_DEVICES[number])
      ? requestedDevice
      : available.includes("desktop")?"desktop":available[0]);

    const variant=wallpaper.variants?.[device as "desktop"|"tablet"|"mobile"];
    if(!variant?.key) return NextResponse.json({error:"Selected device variant is unavailable"},{status:404});

    const requestId=crypto.randomUUID();
    await Download.create({userId:session?.user?.id||undefined,wallpaperId:id,requestId});
    await Wallpaper.findByIdAndUpdate(id,{$inc:{downloadCount:1}});

    const safeTitle=wallpaper.title.trim().replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"wallpaper";
    return NextResponse.json({
      url:bunnySignedUrl(variant.key),
      filename:safeTitle+"-"+device+".webp",
      device
    });
  }catch(error){
    const message=error instanceof Error?error.message:"Download failed";
    return NextResponse.json({error:message},{status:500});
  }
}
