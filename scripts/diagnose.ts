import "dotenv/config";
import crypto from "node:crypto";
import mongoose from "mongoose";

function ok(label:string,detail?:string){
  console.log("✅ "+label+(detail?" — "+detail:""));
}
function fail(label:string,detail:string){
  console.error("❌ "+label+" — "+detail);
}
function valueSet(name:string){
  return Boolean(process.env[name]?.trim());
}

async function main(){
  let failed=false;

  for(const name of [
    "MONGODB_URI","MONGODB_DB_NAME","NEXTAUTH_URL","NEXTAUTH_SECRET",
    "BUNNY_STORAGE_ZONE","BUNNY_STORAGE_PASSWORD","BUNNY_STORAGE_HOSTNAME",
    "BUNNY_CDN_HOSTNAME","BUNNY_CDN_TOKEN_KEY"
  ]){
    if(valueSet(name)) ok("Environment "+name);
    else { failed=true; fail("Environment "+name,"missing"); }
  }

  if(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length>=32) ok("NextAuth secret","length is sufficient");
  else { failed=true; fail("NextAuth secret","must be at least 32 characters"); }

  const mongoUri=process.env.MONGODB_URI?.trim();
  if(mongoUri){
    if(/^mongodb(\+srv)?:\/\/.+/i.test(mongoUri)){
      ok("MongoDB URI","format looks valid");
    }else{
      failed=true;
      fail("MongoDB URI","must start with mongodb:// or mongodb+srv://");
    }
  }

  if(process.env.BUNNY_STORAGE_ZONE?.trim()){
    if(/^\d+$/.test(process.env.BUNNY_STORAGE_ZONE.trim())){
      console.warn("⚠️ Bunny Storage Zone looks numeric. The Storage API expects the Storage Zone name in the object URL.");
    }else{
      ok("Bunny Storage Zone","looks like a zone name");
    }
  }

  try{
    const {connectDB}=await import("../lib/mongodb");
    const connection=await connectDB();
    await connection.connection.db?.command({ping:1});
    ok("MongoDB connection","ping succeeded");
  }catch(error){
    failed=true;
    fail("MongoDB connection",error instanceof Error?error.message:"connection failed");
  }

  const storageHost=(process.env.BUNNY_STORAGE_HOSTNAME||"").replace(/^https?:\/\//,"").replace(/\/$/,"");
  const zone=process.env.BUNNY_STORAGE_ZONE?.trim();
  const accessKey=process.env.BUNNY_STORAGE_PASSWORD?.trim();
  const cdnHost=(process.env.BUNNY_CDN_HOSTNAME||"").replace(/^https?:\/\//,"").replace(/\/$/,"");

  if(storageHost&&zone&&accessKey&&cdnHost){
    const path="diagnostics/health-"+Date.now()+"-"+crypto.randomBytes(4).toString("hex")+".txt";
    const objectUrl="https://"+storageHost+"/"+encodeURIComponent(zone)+"/"+path.split("/").map(encodeURIComponent).join("/");
    const cdnUrl="https://"+cdnHost+"/"+path.split("/").map(encodeURIComponent).join("/");
    const body=Buffer.from("wallpaper-saas-diagnostic");

    try{
      const checksum=crypto.createHash("sha256").update(body).digest("hex").toUpperCase();
      const upload=await fetch(objectUrl,{
        method:"PUT",
        headers:{AccessKey:accessKey,"Content-Type":"text/plain",Checksum:checksum},
        body:body as unknown as BodyInit
      });
      if(!upload.ok){
        failed=true;
        fail("Bunny Storage upload",String(upload.status));
      }else{
        ok("Bunny Storage upload");
        let delivered=false;
        for(let attempt=1;attempt<=3;attempt++){
          const cdn=await fetch(cdnUrl,{cache:"no-store"});
          if(cdn.ok){
            delivered=true;
            break;
          }
          await new Promise(resolve=>setTimeout(resolve,1000));
        }
        if(delivered) ok("Bunny CDN delivery");
        else { failed=true; fail("Bunny CDN delivery","uploaded object was not reachable through the configured CDN hostname"); }

        const del=await fetch(objectUrl,{method:"DELETE",headers:{AccessKey:accessKey}});
        if(del.ok||del.status===404) ok("Bunny Storage cleanup");
        else { failed=true; fail("Bunny Storage cleanup",String(del.status)); }
      }
    }catch(error){
      failed=true;
      fail("Bunny integration",error instanceof Error?error.message:"request failed");
    }
  }

  await mongoose.connection.close().catch(()=>{});

  if(failed){
    console.error("\nDiagnostics found one or more failures. Fix these before testing publisher upload.");
    process.exitCode=1;
  }else{
    console.log("\nAll local integration diagnostics passed.");
  }
}

main().catch(error=>{
  console.error(error instanceof Error?error.message:error);
  process.exitCode=1;
});
