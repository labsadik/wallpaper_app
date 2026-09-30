import type { Metadata } from "next";
import {getActiveSession} from "@/lib/admin";
import Header from "@/components/header";
import ImageProtection from "@/components/image-protection";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wallpaper SaaS", template: "%s | Wallpaper SaaS" },
  description: "High-resolution wallpapers with secure downloads and publisher uploads."
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const session=await getActiveSession();
  return <html lang="en"><body><Header session={session}/><ImageProtection/>{children}<SiteFooter/></body></html>;
}
