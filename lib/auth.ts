import CredentialsProvider from "next-auth/providers/credentials";
import type {NextAuthOptions} from "next-auth";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";

const credentialsSchema=z.object({email:z.string().email(),password:z.string().min(8).max(128)});

function isSuspended(user:{status:string;suspensionUntil?:Date|null}){
  if(user.status!=="suspended") return false;
  if(user.suspensionUntil && user.suspensionUntil.getTime()<=Date.now()) return false;
  return true;
}

export const authOptions:NextAuthOptions={
  session:{strategy:"jwt"},
  secret:process.env.NEXTAUTH_SECRET,
  providers:[CredentialsProvider({
    name:"Credentials",
    credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},
    async authorize(raw){
      const parsed=credentialsSchema.safeParse(raw);
      if(!parsed.success) return null;
      await connectDB();
      let user=await User.findOne({email:parsed.data.email.toLowerCase()}).select("+passwordHash");
      if(!user?.passwordHash) return null;

      if(user.status==="suspended" && user.suspensionUntil && user.suspensionUntil.getTime()<=Date.now()){
        user.status="active";
        user.suspensionUntil=undefined;
        user.suspensionReason=undefined;
        await user.save();
      }

      if(user.status==="banned" || isSuspended(user)) return null;
      if(!(await bcrypt.compare(parsed.data.password,user.passwordHash))) return null;

      return {id:String(user._id),name:user.name,email:user.email,role:user.role as "user"|"publisher"|"admin"};
    }
  })],
  callbacks:{
    async jwt({token,user}){
      if(user){ token.role=user.role; token.status=user.status; }
      return token;
    },
    async session({session,token}){
      if(session.user){
        session.user.id=String(token.sub);
        session.user.role=(token.role??"user") as "user"|"publisher"|"admin";
        session.user.status=(token.status??"active") as "active"|"suspended"|"banned";
        if(token.sub){
          try{
            await connectDB();
            const current=await User.findById(token.sub).select("role status suspensionUntil").lean();
            if(current?.status==="suspended" && current.suspensionUntil && new Date(current.suspensionUntil).getTime()<=Date.now()){
              await User.updateOne({_id:token.sub},{$set:{status:"active"},$unset:{suspensionUntil:1,suspensionReason:1}});
              session.user.role=current.role as "user"|"publisher"|"admin";
              session.user.status="active";
            }else if(current?.status==="active"){
              session.user.role=current.role as "user"|"publisher"|"admin";
              session.user.status="active";
            }else if(current){
              session.user.role="user";
              session.user.status=current.status as "suspended"|"banned";
            }
          }catch{
            // Keep the signed token role as a fallback during a DB outage.
          }
        }
      }
      return session;
    }
  },
  pages:{signIn:"/login"}
};
