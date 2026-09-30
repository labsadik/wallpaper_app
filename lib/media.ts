import crypto from "node:crypto";

function mediaSecret(){
  const secret=process.env.MEDIA_SIGNING_SECRET?.trim()||process.env.NEXTAUTH_SECRET?.trim();
  if(!secret)throw new Error("Missing MEDIA_SIGNING_SECRET or NEXTAUTH_SECRET");
  return secret;
}

function signature(path:string,expires:number){
  return crypto.createHmac("sha256",mediaSecret()).update(path+"."+expires).digest("hex");
}

export function signedMediaUrl(path:string,expiresInSeconds=300){
  const cleanPath=path.replace(/^\/+,"").split("/").filter(Boolean);
  if(!cleanPath.length)throw new Error("Media path is required");
  const expires=Math.floor(Date.now()/1000)+expiresInSeconds;
  const encodedPath=cleanPath.map(encodeURIComponent).join("/");
  const token=signature("/"+cleanPath.join("/"),expires);
  return "/api/media/"+encodedPath+"?e="+expires+"&s="+token;
}

export function verifyMediaSignature(path:string,expires:number,provided:string){
  if(!Number.isFinite(expires)||expires<Math.floor(Date.now()/1000))return false;
  const expected=signature(path,expires);
  const a=Buffer.from(expected,"hex");
  const b=Buffer.from(provided||"","hex");
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
