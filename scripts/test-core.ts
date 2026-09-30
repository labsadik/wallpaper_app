import {signedMediaUrl,verifyMediaSignature} from "../lib/media";
import {slugify} from "../lib/images";

process.env.MEDIA_SIGNING_SECRET="test-secret-test-secret-test-secret-test-secret";

function assert(condition:boolean,message:string){
  if(!condition)throw new Error(message);
}

async function main(){
  assert(slugify("  Misty Mountain — Sunrise!  ")==="misty-mountain-sunrise","slugify normalization failed");

  const url=signedMediaUrl("/feature_wallpapers/pc/test.webp",60);
  const parsed=new URL("http://localhost"+url);
  const path=decodeURIComponent(parsed.pathname.replace("/api/media/","/"));
  const expires=Number(parsed.searchParams.get("e"));
  const signature=parsed.searchParams.get("s")||"";

  assert(path==="/feature_wallpapers/pc/test.webp","signed media path mismatch");
  assert(verifyMediaSignature(path,expires,signature),"valid media signature rejected");

  const tampered=signature.slice(0,-1)+(signature.endsWith("0")?"1":"0");
  assert(!verifyMediaSignature(path,expires,tampered),"tampered media signature accepted");
  assert(!verifyMediaSignature(path,expires-120,signature),"expired media signature accepted");

  console.log("✅ Core utility/security tests passed");
}

main().catch(error=>{
  console.error("❌ Core test failed:",error instanceof Error?error.message:error);
  process.exitCode=1;
});
