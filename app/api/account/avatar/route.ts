import {NextResponse} from "next/server";
import sharp from "sharp";
import crypto from "node:crypto";
import mongoose from "mongoose";
import {getActiveSession} from "@/lib/admin";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import {uploadToBunny,deleteFromBunny} from "@/lib/bunny";
import {getClientKey,rateLimit,rateLimitedResponse} from "@/lib/rate-limit";

export const runtime="nodejs";

export async function POST(request:Request){
  const session=await getActiveSession();
  if(!session?.user?.id)return NextResponse.json({error:"Unauthorized"},{status:401});

  const limiter=rateLimit(
    "avatar:"+session.user.id+":"+getClientKey(request,"ip"),
    10,
    60*60*1000
  );
  if(!limiter.allowed){
    return NextResponse.json({error:"Avatar update limit reached. Please try again later."},rateLimitedResponse(limiter.retryAfterSeconds));
  }

  await connectDB();
  const user=await User.findById(session.user.id);
  if(!user)return NextResponse.json({error:"User not found."},{status:404});

  const form=await request.formData();
  const file=form.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"Avatar image is required."},{status:400});
  if(file.size>5*1024*1024)return NextResponse.json({error:"Avatar must be 5 MB or smaller."},{status:413});

  try{
    const input=Buffer.from(await file.arrayBuffer());
    const metadata=await sharp(input,{failOn:"error"}).metadata();
    if(!metadata.format||!["jpeg","png","webp","avif"].includes(metadata.format)){
      return NextResponse.json({error:"Use JPG, PNG, WebP or AVIF."},{status:400});
    }

    const output=await sharp(input)
      .rotate()
      .resize(320,320,{fit:"cover",withoutEnlargement:false})
      .webp({quality:88})
      .toBuffer();

    const hash=crypto.createHash("sha256").update(output).digest("hex").slice(0,16);
    const key="avatars/"+new mongoose.Types.ObjectId(user._id).toString()+"-"+hash+".webp";
    await uploadToBunny(key,output,"image/webp");

    const oldKey=user.avatarKey;
    user.avatarKey=key;
    await user.save();

    if(oldKey&&oldKey!==key)await deleteFromBunny(oldKey).catch(()=>{});

    return NextResponse.json({ok:true,avatarKey:key});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Avatar processing failed."},{status:400});
  }
}
