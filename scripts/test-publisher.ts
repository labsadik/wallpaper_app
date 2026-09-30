import "dotenv/config";
import {createServer} from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import {spawn} from "node:child_process";
import sharp from "sharp";

const baseUrl=process.env.TEST_BASE_URL||"http://localhost:3000";
const cookieFile=path.resolve(".test-session-cookie");
const email=process.env.TEST_PUBLISHER_EMAIL;
const password=process.env.TEST_PUBLISHER_PASSWORD;

if(!email||!password){
  console.error("Set TEST_PUBLISHER_EMAIL and TEST_PUBLISHER_PASSWORD in .env.local before running this test.");
  process.exit(1);
}

async function waitForServer(url:string,timeoutMs=30000){
  const started=Date.now();
  while(Date.now()-started<timeoutMs){
    try{
      const res=await fetch(url,{cache:"no-store"});
      if(res.ok)return;
    }catch{}
    await new Promise(r=>setTimeout(r,500));
  }
  throw new Error("Local Next.js server did not become ready");
}

async function main(){
  let child:ReturnType<typeof spawn>|undefined;
  try{
    try{await waitForServer(baseUrl+"/api/health",1500);}catch{
      child=spawn(process.platform==="win32"?"npm.cmd":"npm",["run","dev"],{stdio:"inherit",shell:false});
      await waitForServer(baseUrl+"/api/health",30000);
    }

    const csrfRes=await fetch(baseUrl+"/api/auth/csrf");
    const csrf=await csrfRes.json() as {csrfToken?:string};
    const csrfCookies=csrfRes.headers.getSetCookie?.()||[];
    const csrfCookie=csrfCookies.map(value=>value.split(";",1)[0]).join("; ");
    if(!csrf.csrfToken)throw new Error("Could not obtain NextAuth CSRF token");

    const signIn=await fetch(baseUrl+"/api/auth/callback/credentials?redirect=false",{
      method:"POST",
      headers:{
        "content-type":"application/x-www-form-urlencoded",
        "cookie":csrfCookie
      },
      body:new URLSearchParams({csrfToken:String(csrf.csrfToken),email:String(email),password:String(password),json:"true"}).toString(),
      redirect:"manual"
    });

    const cookies=(signIn.headers.getSetCookie?.()||[]).join("; ");
    if(signIn.status<200||signIn.status>=400)throw new Error("Login failed with status "+signIn.status);

    const png=await sharp({
      create:{width:1920,height:1080,channels:3,background:{r:34,g:40,b:55}}
    }).png().toBuffer();

    const form=new FormData();
    form.set("title","Publisher Smoke Test Wallpaper");
    form.set("category","Testing");
    form.set("file",new Blob([png],{type:"image/png"}),"publisher-smoke-test.png");

    const upload=await fetch(baseUrl+"/api/publisher/upload",{
      method:"POST",
      headers:{cookie:cookies||csrfCookie},
      body:form
    });

    const body=await upload.text();
    console.log("Upload HTTP status:",upload.status);
    console.log(body);

    if(!upload.ok)process.exitCode=1;
  }finally{
    try{await fs.unlink(cookieFile);}catch{}
    if(child)child.kill();
  }
}

main().catch(error=>{
  console.error(error instanceof Error?error.message:error);
  process.exitCode=1;
});
