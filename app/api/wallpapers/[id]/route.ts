import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {signedMediaUrl} from "@/lib/media";

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params; await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
  if(!wallpaper) return NextResponse.json({error:"Wallpaper not found"},{status:404});
  return NextResponse.json({
    id:String(wallpaper._id),title:wallpaper.title,slug:wallpaper.slug,category:wallpaper.category,tags:wallpaper.tags,devices:wallpaper.devices?.length?wallpaper.devices:["desktop"],
    likes:wallpaper.likeCount,saves:wallpaper.saveCount,downloads:wallpaper.downloadCount,
    desktopUrl:wallpaper.variants?.desktop?.key?signedMediaUrl(wallpaper.variants.desktop.key):null,
    tabletUrl:wallpaper.variants?.tablet?.key?signedMediaUrl(wallpaper.variants.tablet.key):null,
    mobileUrl:wallpaper.variants?.mobile?.key?signedMediaUrl(wallpaper.variants.mobile.key):null
  });
}