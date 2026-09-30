const storageHostname=process.env.BUNNY_STORAGE_HOSTNAME||"storage.bunnycdn.com";
const storageZone=process.env.BUNNY_STORAGE_ZONE;
const storagePassword=process.env.BUNNY_STORAGE_PASSWORD;

export function bunnyConfigured(){return !!(storageZone&&storagePassword&&storageHostname);}

export async function uploadToBunny(path:string,body:Buffer,contentType:string){
  if(!bunnyConfigured()) throw new Error("Bunny Storage is not configured");
  const url="https://"+storageHostname+"/"+encodeURIComponent(storageZone!)+"/"+path.split("/").map(encodeURIComponent).join("/");
  const response=await fetch(url,{method:"PUT",headers:{"AccessKey":storagePassword!,"Content-Type":contentType},body});
  if(!response.ok) throw new Error("Bunny upload failed: "+response.status+" "+await response.text());
}

export function bunnyPublicUrl(path:string){
  const host=process.env.BUNNY_CDN_HOSTNAME;
  if(!host) throw new Error("Missing BUNNY_CDN_HOSTNAME");
  return "https://"+host.replace(/^https?:\/\//,"")+"/"+path.split("/").map(encodeURIComponent).join("/");
}