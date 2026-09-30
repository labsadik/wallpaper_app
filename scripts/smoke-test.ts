type SmokeCheck={path:string;expected:number[];label:string};

const baseUrl=(process.env.TEST_BASE_URL||"http://localhost:3000").replace(/\/$/,"");
const deep=process.env.SMOKE_DEEP==="1";
const publicRoutes=process.env.SMOKE_PUBLIC_ROUTES==="1";

const checks:SmokeCheck[]=[
  {path:"/api/health",expected:[200],label:"health endpoint"},
  {path:"/login",expected:[200],label:"login page"},
  {path:"/register",expected:[200],label:"register page"},
  {path:"/robots.txt",expected:[200],label:"robots.txt"},
  {path:"/wallpapers",expected:[308,301],label:"legacy gallery redirect"},
  {path:"/wallpapers/example",expected:[308,301],label:"legacy wallpaper redirect"},
  {path:"/api/cron/publish",expected:[401],label:"cron authentication"}
];

if(publicRoutes){
  checks.push(
    {path:"/",expected:[200],label:"home page"},
    {path:"/items",expected:[200],label:"items page"}
  );
}

async function checkRoute(check:SmokeCheck){
  const response=await fetch(baseUrl+check.path,{redirect:"manual",cache:"no-store"});
  if(!check.expected.includes(response.status)){
    throw new Error(check.label+" returned HTTP "+response.status);
  }
}

async function main(){
  for(const check of checks)await checkRoute(check);

  const securityResponse=await fetch(baseUrl+"/login",{cache:"no-store"});
  for(const header of ["x-content-type-options","x-frame-options","referrer-policy"]){
    if(!securityResponse.headers.get(header))throw new Error("Missing security header: "+header);
  }

  const healthResponse=await fetch(baseUrl+"/api/health"+(deep?"?deep=1":""),{cache:"no-store"});
  const health=await healthResponse.json() as {ok?:boolean;database?:string};

  if(!healthResponse.ok||health.ok!==true)throw new Error("Health endpoint reported an unhealthy state.");
  if(deep&&health.database!=="ok")throw new Error("Deep health check could not reach MongoDB.");

  console.log("✅ Smoke tests passed:",checks.length+1,"checks");
}

main().catch(error=>{
  console.error("❌ Smoke test failed:",error instanceof Error?error.message:error);
  process.exitCode=1;
});

export {};
