import {NextResponse} from "next/server";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";
import {getActiveSession} from "@/lib/admin";
import {bunnySignedUrl} from "@/lib/bunny";
import {verifyMediaSignature} from "@/lib/media";

export const runtime="nodejs";

export async function GET(request:Request,{params}:{params:Promise<{path:string[]}>}){
  const resolved=await params;
  const segments=(resolved.path||[]).filter(Boolean);
  const path="/"+segments.join("/");
  const url=new URL(request.url);
  const expires=Number(url.searchParams.get("e")||0);
  const token=url.searchParams.get("s")||"";

  if(!verifyMediaSignature(path,expires,token)){
    return NextResponse.json({error:"Expired or invalid media URL."},{status:403});
  }

  await connectDB();
  const wallpaper=await Wallpaper.findOne({
    $or:[
      {"variants.desktop.key":path.replace(/^\//,"")},
      {"variants.tablet.key":path.replace(/^\//,"")},
      {"variants.mobile.key":path.replace(/^\//,"")},
      {"variants.thumbnail.key":path.replace(/^\//,"")},
      {"source.sha256":path.replace(/^\//,"")}
    ]
  }).select("publisherId status").lean();

  if(!wallpaper){
    return NextResponse.json({error:"Media not found."},{status:404});
  }

  if(wallpaper.status!=="published"){
    const session=await getActiveSession();
    const isOwner=session?.user?.id&&String(wallpaper.publisherId)===session.user.id;
    const isAdmin=session?.user?.role==="admin";
    if(!isOwner&&!isAdmin){
      return NextResponse.json({error:"Media is not public."},{status:404});
    }
  }

  try{
    const sourceUrl=bunnySignedUrl(path.replace(/^\//,""),90);
    const upstream=await fetch(sourceUrl,{cache:"no-store"});
    if(!upstream.ok){
      return NextResponse.json({error:"Media unavailable."},{status:upstream.status===404?404:502});
    }

    const headers=new Headers();
    const contentType=upstream.headers.get("content-type")||"image/webp";
    headers.set("Content-Type",contentType);
    headers.set("Cache-Control",wallpaper.status==="published"?"public, max-age=60, stale-while-revalidate=300":"private, no-store");
    headers.set("X-Content-Type-Options","nosniff");
    return new Response(upstream.body,{status:200,headers});
  }catch{
    return NextResponse.json({error:"Media delivery failed."},{status:502});
  }
}
