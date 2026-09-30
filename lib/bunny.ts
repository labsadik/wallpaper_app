import crypto from "node:crypto";

function required(name:string){
  const value=process.env[name]?.trim();
  if(!value) throw new Error("Missing "+name);
  return value;
}

function storageObjectUrl(path:string){
  const hostname=required("BUNNY_STORAGE_HOSTNAME").replace(/^https?:\/\//,"").replace(/\/$/,"");
  const zone=encodeURIComponent(required("BUNNY_STORAGE_ZONE"));
  const cleanPath=path.replace(/^\/+/,"").split("/").map(encodeURIComponent).join("/");
  return "https://"+hostname+"/"+zone+"/"+cleanPath;
}

export function bunnyConfigured(){
  return Boolean(
    process.env.BUNNY_STORAGE_ZONE?.trim() &&
    process.env.BUNNY_STORAGE_PASSWORD?.trim() &&
    process.env.BUNNY_STORAGE_HOSTNAME?.trim()
  );
}

export async function uploadToBunny(path:string,body:Buffer,contentType:string){
  const accessKey=required("BUNNY_STORAGE_PASSWORD");
  const url=storageObjectUrl(path);
  const checksum=crypto.createHash("sha256").update(body).digest("hex").toUpperCase();
  const response=await fetch(url,{
    method:"PUT",
    headers:{
      AccessKey:accessKey,
      "Content-Type":contentType,
      Checksum:checksum
    },
    body:body as unknown as BodyInit,
    cache:"no-store"
  });
  if(!response.ok){
    const detail=(await response.text()).slice(0,500);
    throw new Error("Bunny upload failed ("+response.status+"): "+detail);
  }
  return {url};
}

export async function deleteFromBunny(path:string){
  const accessKey=required("BUNNY_STORAGE_PASSWORD");
  const response=await fetch(storageObjectUrl(path),{
    method:"DELETE",
    headers:{AccessKey:accessKey},
    cache:"no-store"
  });
  if(!response.ok&&response.status!==404){
    const detail=(await response.text()).slice(0,500);
    throw new Error("Bunny delete failed ("+response.status+"): "+detail);
  }
}

export function bunnyPublicUrl(path:string){
  const host=required("BUNNY_CDN_HOSTNAME").replace(/^https?:\/\//,"").replace(/\/$/,"");
  const cleanPath=path.replace(/^\/+/,"").split("/").map(encodeURIComponent).join("/");
  return "https://"+host+"/"+cleanPath;
}

export function bunnySignedUrl(path:string,expirationSeconds=300){
  const host=required("BUNNY_CDN_HOSTNAME").replace(/^https?:\/\//,"").replace(/\/$/,"");
  const securityKey=required("BUNNY_CDN_TOKEN_KEY");
  const cleanPath="/"+path.replace(/^\/+/,"").split("/").map(encodeURIComponent).join("/");
  const expires=Math.floor(Date.now()/1000)+expirationSeconds;
  const hashableBase=securityKey+cleanPath+expires;
  const token=crypto.createHash("sha256").update(hashableBase).digest("base64").replace(/\n/g,"").replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  return "https://"+host+cleanPath+"?token="+encodeURIComponent(token)+"&expires="+expires;
}
