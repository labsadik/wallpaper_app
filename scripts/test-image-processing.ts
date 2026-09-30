import sharp from "sharp";
import {analyzeAndOptimize} from "../lib/images";

async function main(){
  const sizes=[
    [64,64],
    [320,180],
    [640,360],
    [1279,719],
    [1280,720],
    [1920,1080]
  ] as const;

  for(const [width,height] of sizes){
    const input=await sharp({
      create:{width,height,channels:3,background:{r:34,g:40,b:55}}
    }).png().toBuffer();

    const result=await analyzeAndOptimize(input);
    if(result.analysis.width!==width||result.analysis.height!==height){
      throw new Error(`Metadata mismatch for ${width}x${height}`);
    }
    if(result.analysis.qualityStatus!=="warning" && (width<1920 || height<1080)){
      throw new Error(`Expected warning quality status for ${width}x${height}`);
    }
    if(width>=1920 && height>=1080 && result.analysis.qualityStatus!=="pass"){
      throw new Error(`Expected pass quality status for ${width}x${height}`);
    }
  }

  console.log("✅ Low-resolution image processing test passed");
  console.log("   Supported images below 1280×720 are accepted and marked as warnings.");
}

main().catch(error=>{
  console.error(error instanceof Error?error.message:error);
  process.exitCode=1;
});
