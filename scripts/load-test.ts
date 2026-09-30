type Result={ok:boolean;status:number;duration:number};

const baseUrl=(process.env.TEST_BASE_URL||"http://localhost:3000").replace(/\/$/,"");
const targetPath=process.env.LOAD_TEST_PATH||"/api/health";
const total=Math.max(1,Number(process.env.LOAD_TEST_REQUESTS||100));
const concurrency=Math.max(1,Math.min(total,Number(process.env.LOAD_TEST_CONCURRENCY||10)));

async function worker(results:Result[]){
  while(results.length<total){
    const index=results.length;
    if(index>=total)break;
    results.push({ok:false,status:0,duration:0});
    const started=performance.now();
    try{
      const response=await fetch(baseUrl+targetPath,{cache:"no-store"});
      const duration=performance.now()-started;
      results[index]={ok:response.ok,status:response.status,duration};
    }catch{
      results[index]={ok:false,status:0,duration:performance.now()-started};
    }
  }
}

async function main(){
  const results:Result[]=[];
  await Promise.all(Array.from({length:concurrency},()=>worker(results)));

  const durations=results.map(result=>result.duration).sort((a,b)=>a-b);
  const percentile=(p:number)=>durations[Math.min(durations.length-1,Math.ceil(durations.length*p)-1)]||0;
  const failures=results.filter(result=>!result.ok);
  const summary={
    target:baseUrl+targetPath,
    requests:results.length,
    concurrency,
    failures:failures.length,
    p50Ms:Number(percentile(0.5).toFixed(1)),
    p95Ms:Number(percentile(0.95).toFixed(1)),
    p99Ms:Number(percentile(0.99).toFixed(1))
  };

  console.log(JSON.stringify(summary,null,2));

  if(failures.length>0)throw new Error(failures.length+" requests failed");
  if(summary.p95Ms>5000)throw new Error("p95 latency exceeded 5000 ms");

  console.log("✅ Baseline load test passed");
}

main().catch(error=>{
  console.error("❌ Load test failed:",error instanceof Error?error.message:error);
  process.exitCode=1;
});

export {};
