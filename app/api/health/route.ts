import {connectDB} from "@/lib/mongodb";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(request:Request){
  const deep=new URL(request.url).searchParams.get("deep")==="1";
  let database:"ok"|"error"|"skipped"="skipped";

  if(deep){
    try{
      const connection=await connectDB();
      await connection.connection.db?.command({ping:1});
      database="ok";
    }catch{
      database="error";
    }
  }

  const ok=database!=="error";

  return Response.json(
    {
      ok,
      service:"wallpaper-saas",
      timestamp:new Date().toISOString(),
      ...(deep?{database}: {})
    },
    {
      status:ok?200:503,
      headers:{
        "Cache-Control":"no-store",
        "X-Content-Type-Options":"nosniff"
      }
    }
  );
}
