import type {Metadata} from "next";
import {getActiveSession} from "@/lib/admin";
import Header from "@/components/header";
import ImageProtection from "@/components/image-protection";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const appUrl=process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000";
export const metadata:Metadata={metadataBase:new URL(appUrl),title:{default:"Wallpaper SaaS",template:"%s | Wallpaper SaaS"},description:"High-resolution wallpapers with secure downloads and publisher uploads."};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const session=await getActiveSession();
  return <html lang="en"><body className="min-h-screen bg-[var(--bg)] font-sans text-[var(--text)] antialiased"><Header session={session}/><ImageProtection/>{children}<SiteFooter/></body></html>;
}
