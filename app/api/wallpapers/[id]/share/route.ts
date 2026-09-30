import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
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
  await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).select("shareCount").lean();
  if(!wallpaper)return NextResponse.json({error:"Wallpaper is not published."},{status:404});
  return NextResponse.json({shareCount:Number(wallpaper.shareCount)||0});
}
