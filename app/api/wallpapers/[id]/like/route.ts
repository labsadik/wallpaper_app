import {NextResponse} from "next/server";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Like from "@/models/Like";
import Wallpaper from "@/models/Wallpaper";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params; await connectDB();
  const existing=await Like.findOne({userId:session.user.id,wallpaperId:id});
  if(existing){await existing.deleteOne();await Wallpaper.findByIdAndUpdate(id,{$inc:{likeCount:-1}});return NextResponse.json({liked:false});}
  try{await Like.create({userId:session.user.id,wallpaperId:id});await Wallpaper.findByIdAndUpdate(id,{$inc:{likeCount:1}});return NextResponse.json({liked:true});}
  catch{return NextResponse.json({error:"Unable to like wallpaper"},{status:409});}
}