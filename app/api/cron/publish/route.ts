import {autoPublishDueWallpapers} from "@/lib/wallpaper-publish";

export const runtime="nodejs";

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET?.trim();
  const authorization=request.headers.get("authorization");

  if(!secret||authorization!=="Bearer "+secret){
    return new Response("Unauthorized",{status:401});
  }

  try{
    const published=await autoPublishDueWallpapers();
    return Response.json({
      ok:true,
      published,
      timestamp:new Date().toISOString()
    },{
      headers:{
        "Cache-Control":"no-store",
        "X-Content-Type-Options":"nosniff"
      }
    });
  }catch{
    return Response.json(
      {ok:false,error:"Publish job failed."},
      {status:500,headers:{"Cache-Control":"no-store"}}
    );
  }
}
