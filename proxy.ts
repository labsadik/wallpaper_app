import {getToken} from "next-auth/jwt";
import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export async function proxy(request:NextRequest){
  const token=await getToken({req:request,secret:process.env.NEXTAUTH_SECRET});
  if(!token){
    const login=new URL("/login",request.url);
    login.searchParams.set("callbackUrl",request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config={matcher:["/account/:path*","/publisher/:path*","/admin/:path*"]};