import {connectDB} from "@/lib/mongodb";

export const runtime="nodejs";

export async function GET(request:Request){
  const url=new URL(request.url);
  const deep=url.searchParams.get("deep")==="1";

  const checks={
    env:{
      mongo:Boolean(process.env.MONGODB_URI&&process.env.MONGODB_DB_NAME),
      auth:Boolean(process.env.NEXTAUTH_SECRET&&process.env.NEXTAUTH_SECRET.length>=32),
      bunnyStorage:Boolean(process.env.BUNNY_STORAGE_ZONE&&process.env.BUNNY_STORAGE_PASSWORD&&process.env.BUNNY_STORAGE_HOSTNAME),
      bunnyCdn:Boolean(process.env.BUNNY_CDN_HOSTNAME&&process.env.BUNNY_CDN_TOKEN_KEY)
    },
    database:deep?"pending":"skipped"
  };

  let ok=Object.values(checks.env).every(Boolean);

  if(deep&&ok){
    try{
      const connection=await connectDB();
      await connection.connection.db?.command({ping:1});
      checks.database="ok";
    }catch{
      checks.database="failed";
      ok=false;
    }
  }

  return Response.json(
    {ok,service:"wallpaper-saas",checks,timestamp:new Date().toISOString()},
    {status:ok?200:503}
  );
}
