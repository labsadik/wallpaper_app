import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function getActiveSession(){
  if(!process.env.NEXTAUTH_SECRET?.trim())return null;
  const session=await getServerSession(authOptions);
  if(!session?.user?.id || session.user.status!=="active") return null;
  return session;
}

export async function requireAdmin(){
  const session=await getActiveSession();
  if(!session) return {session:null,unauthorized:true as const};
  if(session.user.role!=="admin") return {session,forbidden:true as const};
  return {session,forbidden:false as const,unauthorized:false as const};
}
