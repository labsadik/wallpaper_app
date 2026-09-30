import {NextResponse} from "next/server";
import crypto from "node:crypto";
import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import Download from "@/models/Download";

function signedCdnUrl(path:string){
  const host=process.env.BUNNY_CDN_HOSTNAME;
  const key=process.env.BUNNY_CDN_TOKEN_KEY;
  if(!host) throw new Error("Missing BUNNY_CDN_HOSTNAME");
  if(!key) throw new Error("Missing BUNNY_CDN_TOKEN_KEY");
  const url="https://"+host.replace(/^https?:\/\//,"")+"/"+path.split("/").map(encodeURIComponent).join("/");
  const expires=Math.floor(Date.now()/1000)+300;
  const data=new TextEncoder().encode(key+new URL(url).pathname+expires);
  const hash=crypto.createHmac("sha256",key).update(data).digest();
  const token=hash.toString("base64url");
  return url+"?token="+encodeURIComponent("HS256-"+token)+"&expires="+expires;
}

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const session=await getServerSession(authOptions);
  const {id}=await params;
  await connectDB();
  const wallpaper=await Wallpaper.findOne({_id:id,status:"published"}).lean();
  if(!wallpaper?.variants?.desktop?.key) return NextResponse.json({error:"Wallpaper not found"},{status:404});
  const requestId=crypto.randomUUID();
  await Download.create({userId:session?.user?.id||undefined,wallpaperId:id,requestId});
  await Wallpaper.findByIdAndUpdate(id,{$inc:{downloadCount:1}});
  return NextResponse.json({url:signedCdnUrl(wallpaper.variants.desktop.key)});
}