import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Header from "@/components/header";
import {getActiveSession} from "@/lib/admin";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wallpaper SaaS", template: "%s | Wallpaper SaaS" },
  description: "High-resolution wallpapers with secure downloads and publisher uploads."
};

export default async function RootLayout({children}:{children:React.ReactNode}){
  const session=await getActiveSession();
  return <html lang="en"><body><Header session={session}/>{children}</body></html>;
}