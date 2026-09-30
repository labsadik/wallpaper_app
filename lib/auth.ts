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
      if(!parsed.success)return null;
      await connectDB();
      let user=await User.findOne({email:parsed.data.email.toLowerCase()}).select("+passwordHash");
      if(!user?.passwordHash)return null;

      if(user.status==="suspended"&&user.suspensionUntil&&user.suspensionUntil.getTime()<=Date.now()){
        user.status="active"; user.suspensionUntil=undefined; user.suspensionReason=undefined; await user.save();
      }

      if(user.status==="banned"||isSuspended(user))return null;
      if(!(await bcrypt.compare(parsed.data.password,user.passwordHash)))return null;

      return {
        id:String(user._id),
        name:user.name,
        email:user.email,
        username:user.username||null,
        role:user.role as "user"|"publisher"|"admin",
        status:user.status as "active"|"suspended"|"banned",
        isVerified:Boolean(user.isVerified),
        avatarKey:user.avatarKey||null
      };
    }
  })],
  callbacks:{
    async jwt({token,user}){
      if(user){
        token.role=user.role;
        token.status=user.status;
        token.username=user.username||null;
        token.isVerified=Boolean(user.isVerified);
        token.avatarKey=user.avatarKey||null;
      }
      return token;
    },
    async session({session,token}){
      if(session.user){
        session.user.id=String(token.sub);
        session.user.role=(token.role??"user") as "user"|"publisher"|"admin";
        session.user.status=(token.status??"active") as "active"|"suspended"|"banned";
        session.user.username=token.username??null;
        session.user.isVerified=Boolean(token.isVerified);
        session.user.avatarKey=token.avatarKey??null;

        if(token.sub){
          try{
            await connectDB();
            const current=await User.findById(token.sub).select("name email username role status isVerified avatarKey suspensionUntil").lean();
            if(current?.status==="suspended"&&current.suspensionUntil&&new Date(current.suspensionUntil).getTime()<=Date.now()){
              await User.updateOne({_id:token.sub},{$set:{status:"active"},$unset:{suspensionUntil:1,suspensionReason:1}});
            }
            if(current){
              session.user.name=current.name;
              session.user.email=current.email;
              session.user.username=current.username||null;
              session.user.role=current.role as "user"|"publisher"|"admin";
              session.user.status=current.status as "active"|"suspended"|"banned";
              session.user.isVerified=Boolean(current.isVerified);
              session.user.avatarKey=current.avatarKey||null;
            }
          }catch{
            // Signed JWT values remain the fallback during a database outage.
          }
        }
      }
      return session;
    }
  },
  pages:{signIn:"/login"}
};
