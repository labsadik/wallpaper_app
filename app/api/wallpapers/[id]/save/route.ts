import {NextResponse} from "next/server";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import Save from "@/models/Save";
import Wallpaper from "@/models/Wallpaper";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getActiveSession(); if(!session?.user?.id) return NextResponse.json({error:"Unauthorized"},{status:401});
  const {id}=await params; await connectDB();
  const existing=await Save.findOne({userId:session.user.id,wallpaperId:id});
  if(existing){await existing.deleteOne();await Wallpaper.findByIdAndUpdate(id,{$inc:{saveCount:-1}});return NextResponse.json({saved:false});}
  try{await Save.create({userId:session.user.id,wallpaperId:id});await Wallpaper.findByIdAndUpdate(id,{$inc:{saveCount:1}});return NextResponse.json({saved:true});}
  catch{return NextResponse.json({error:"Unable to save wallpaper"},{status:409});}
}