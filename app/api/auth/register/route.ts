import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import {slugify} from "@/lib/images";
import {getClientKey,rateLimit,rateLimitedResponse} from "@/lib/rate-limit";

const schema=z.object({
  name:z.string().trim().min(2).max(80),
  email:z.string().email(),
  password:z.string().min(8).max(128)
});

async function uniqueUsername(name:string){
  const base=(slugify(name)||"user").slice(0,60);
  let candidate=base;
  let suffix=1;

  while(await User.exists({username:candidate})){
    suffix++;
    candidate=(base.slice(0,Math.max(1,60-String(suffix).length-1))+"-"+suffix).slice(0,80);
  }

  return candidate;
}

export async function POST(request:Request){
  const limiter=rateLimit(getClientKey(request,"register"),5,15*60*1000);
  if(!limiter.allowed){
    return NextResponse.json(
      {error:"Too many registration attempts. Please try again later."},
      rateLimitedResponse(limiter.retryAfterSeconds)
    );
  }

  const body=await request.json().catch(()=>null);
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Invalid registration data"},{status:400});

  await connectDB();
  const email=parsed.data.email.toLowerCase();
  if(await User.exists({email}))return NextResponse.json({error:"Email already registered"},{status:409});

  const username=await uniqueUsername(parsed.data.name);
  const passwordHash=await bcrypt.hash(parsed.data.password,12);
  await User.create({name:parsed.data.name,email,username,passwordHash,role:"user"});

  return NextResponse.json({ok:true,username},{status:201});
}
