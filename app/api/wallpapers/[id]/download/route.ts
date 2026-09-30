import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";
import {bunnyPublicUrl} from "@/lib/bunny";

function signedCdnUrl(path:string){
  const host=process.env.BUNNY_CDN_HOSTNAME; const key=process.env.BUNNY_CDN_TOKEN_KEY;
  if(!host) throw new Error("Missing BUNNY_CDN_HOSTNAME");
  const url="https://"+host.replace(/^https?:\\/\\//,"")+"/"+path.split("/").map(encodeURIComponent).join("/");
  if(!key)return url;
  const expires=Math.floor(Date.now()/1000)+300;
  const data=new TextEncoder().encode(key+new URL(url).pathname+expires);
  const hash=crypto.createHash("sha256").update(data).digest();
  const token=hash.toString("base64url");
  return url+"?token="+encodeURIComponent("HS256-"+token)+"&expires="+expires;
}
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getServerSession(authOptions);
  const {id}=await params; await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
  if(!wallpaper?.variants?.desktop?.key) return NextResponse.json({error:"Wallpaper not found"},{status:404});
  const requestId=crypto.randomUUID();
  await Download.create({userId:session?.user?.id||undefined,wallpaperId:id,requestId});
  await Wallpaper.findByIdAndUpdate(id,{$inc:{downloadCount:1}});
  const url=signedCdnUrl(wallpaper.variants.desktop.key);
  return NextResponse.json({url});
}