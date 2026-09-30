import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";

export async function requireAdmin(){
  const session=await getServerSession(authOptions);
  if(!session?.user?.id) return {session:null as const,unauthorized:true as const};
  if(session.user.role!=="admin") return {session,forbidden:true as const};
  return {session,forbidden:false as const,unauthorized:false as const};
}
