import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";

const schema=z.object({name:z.string().min(2).max(80),email:z.string().email(),password:z.string().min(8).max(128)});

export async function POST(request:Request){
  const body=await request.json().catch(()=>null);
  const parsed=schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({error:"Invalid registration data"},{status:400});
  await connectDB();
  const email=parsed.data.email.toLowerCase();
  if(await User.exists({email})) return NextResponse.json({error:"Email already registered"},{status:409});
  const passwordHash=await bcrypt.hash(parsed.data.password,12);
  await User.create({name:parsed.data.name,email,passwordHash,role:"user"});
  return NextResponse.json({ok:true},{status:201});
}