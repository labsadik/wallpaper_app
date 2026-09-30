import "dotenv/config";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";
import {slugify} from "@/lib/images";

async function uniqueUsername(seed:string,userId:string){
  const base=(slugify(seed)||"user").slice(0,60);
  let candidate=base;
  let suffix=1;
  while(await User.exists({username:candidate,_id:{$ne:userId}})){
    suffix++;
    candidate=(base.slice(0,Math.max(1,60-String(suffix).length-1))+"-"+suffix).slice(0,80);
  }
  return candidate;
}

async function main(){
  await connectDB();
  const users=await User.find({}).select("_id name email username").lean();
  let updated=0;

  for(const user of users){
    if(user.username)continue;
    const seed=user.name||String(user.email||"").split("@")[0]||"user";
    const username=await uniqueUsername(seed,String(user._id));
    await User.updateOne({_id:user._id},{$set:{username}});
    updated++;
    console.log(String(user._id),"->",username);
  }

  console.log({updated,total:users.length});
}

void main().catch(error=>{
  console.error(error);
  process.exitCode=1;
});
