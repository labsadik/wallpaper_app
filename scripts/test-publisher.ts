import "dotenv/config";
import {spawn} from "node:child_process";
import sharp from "sharp";

const baseUrl=(process.env.TEST_BASE_URL||"http://localhost:3000").replace(/\/$/,"");
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
    if(!csrfRes.ok)throw new Error("NextAuth CSRF endpoint returned HTTP "+csrfRes.status);
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
      body:new URLSearchParams({
        csrfToken:String(csrf.csrfToken),
        email:String(email),
        password:String(password),
        json:"true"
      }).toString(),
      redirect:"manual"
    });

    const cookies=(signIn.headers.getSetCookie?.()||[])
      .map(value=>value.split(";",1)[0])
      .join("; ");
    if(signIn.status<200||signIn.status>=400)throw new Error("Login failed with status "+signIn.status);
    if(!cookies)throw new Error("Login did not return a session cookie");

    const seed=Date.now();
    const png=await sharp({
      create:{
        width:320,
        height:180,
        channels:3,
        background:{r:seed%256,g:(seed>>8)%256,b:(seed>>16)%256}
      }
    }).png().toBuffer();

    const form=new FormData();
    form.set("title","Publisher Smoke Test Wallpaper "+seed);
    form.set("category","Testing");
    form.set("devices","desktop");
    form.set("file",new Blob([png],{type:"image/png"}),"publisher-smoke-test.png");

    const upload=await fetch(baseUrl+"/api/publisher/upload",{
      method:"POST",
      headers:{cookie:cookies},
      body:form
    });

    const body=await upload.text();
    if(!upload.ok)throw new Error("Publisher upload failed with status "+upload.status+": "+body);

    const data=JSON.parse(body) as {devices?:string[];category?:string};
    const devices=(data.devices||[]).slice().sort().join(",");
    if(devices!=="desktop")throw new Error("Publisher upload did not persist the single selected device. Received: "+devices);
    if(data.category!=="Testing")throw new Error("Publisher upload did not persist category. Received: "+String(data.category));

    console.log("✅ Publisher upload metadata test passed");
  }finally{
    if(child)child.kill();
  }
}

main().catch(error=>{
  console.error("❌ Publisher test failed:",error instanceof Error?error.message:error);
  process.exitCode=1;
});
