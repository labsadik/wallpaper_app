import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import {requireAdmin} from "@/lib/admin";
import Wallpaper from "@/models/Wallpaper";

export async function POST(){
  const auth=await requireAdmin();
  if(auth.unauthorized)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(auth.forbidden)return NextResponse.json({error:"Admin access required"},{status:403});

  await connectDB();
  const now=new Date();
  const result=await Wallpaper.updateMany(
    {status:"pending_review"},
    {
      $set:{status:"published",publishedAt:now},
      $unset:{publishAt:1,moderationReason:1,removedAt:1,removedBy:1}
    }
  );

  return NextResponse.json({ok:true,published:result.modifiedCount});
}
