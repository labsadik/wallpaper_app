import {permanentRedirect} from "next/navigation";

export default async function LegacyWallpaperDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  permanentRedirect("/items/"+slug);
}
