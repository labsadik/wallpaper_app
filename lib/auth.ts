import CredentialsProvider from "next-auth/providers/credentials";
import type {NextAuthOptions} from "next-auth";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {connectDB} from "@/lib/mongodb";
import User from "@/models/User";

const credentialsSchema=z.object({email:z.string().email(),password:z.string().min(8).max(128)});

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
      const user=await User.findOne({email:parsed.data.email.toLowerCase()}).select("+passwordHash").lean();
      if(!user?.passwordHash||user.status!=="active") return null;
      if(!(await bcrypt.compare(parsed.data.password,user.passwordHash))) return null;
      return {id:String(user._id),name:user.name,email:user.email,role:user.role as "user"|"publisher"|"admin"};
    }
  })],
  callbacks:{
    async jwt({token,user}){if(user) token.role=user.role; return token;},
    async session({session,token}){
      if(session.user){session.user.id=String(token.sub); session.user.role=(token.role??"user") as "user"|"publisher"|"admin";}
      return session;
    }
  },
  pages:{signIn:"/login"}
};