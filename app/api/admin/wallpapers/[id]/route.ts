import {NextResponse} from "next/server";
import {z} from "zod";
import mongoose from "mongoose";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {requireAdmin} from "@/lib/admin";

const schema=z.object({
  action:z.enum(["remove","restore"]),
  reason:z.string().trim().max(500).optional()
});

export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  const auth=await requireAdmin();
  if(auth.unauthorized)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(auth.forbidden)return NextResponse.json({error:"Admin access required"},{status:403});

  const {id}=await params;
  if(!mongoose.isValidObjectId(id))return NextResponse.json({error:"Invalid wallpaper id"},{status:400});

  const parsed=schema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Invalid moderation action"},{status:400});

  await connectDB();
  const wallpaper=await Wallpaper.findById(id);
  if(!wallpaper)return NextResponse.json({error:"Wallpaper not found"},{status:404});

  if(parsed.data.action==="remove"){
    wallpaper.status="archived";
    wallpaper.removedAt=new Date();
    wallpaper.removedBy=new mongoose.Types.ObjectId(auth.session.user.id);
    wallpaper.moderationReason=parsed.data.reason||"Removed by administrator";
  }else{
    wallpaper.status="pending_review";
    wallpaper.removedAt=undefined;
    wallpaper.removedBy=undefined;
    wallpaper.moderationReason=undefined;
  }

  await wallpaper.save();
  return NextResponse.json({
    ok:true,
    wallpaper:{
      id:String(wallpaper._id),
      title:wallpaper.title,
      status:wallpaper.status,
      category:wallpaper.category,
      devices:wallpaper.devices
    }
  });
}
