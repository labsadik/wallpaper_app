import type {MetadataRoute} from "next";
import {connectDB} from "@/lib/mongodb";
import Wallpaper from "@/models/Wallpaper";

export const dynamic="force-dynamic";

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const base=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
  await connectDB();
  const rows=await Wallpaper.find({status:"published"},{slug:1,updatedAt:1}).lean();
  return [{url:base,lastModified:new Date()},{url:base+"/wallpapers",lastModified:new Date()},...rows.map(w=>({url:base+"/wallpaper/"+w.slug,lastModified:w.updatedAt||new Date()}))];
}