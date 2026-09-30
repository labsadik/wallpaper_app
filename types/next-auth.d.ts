import "next-auth";
import "next-auth/jwt";
import type {DefaultSession} from "next-auth";

declare module "next-auth"{
  interface Session{user:{id:string;username?:string|null;role:"user"|"publisher"|"admin";status:"active"|"suspended"|"banned";isVerified:boolean;avatarKey?:string|null}&DefaultSession["user"]}
  interface User{id:string;username?:string|null;role:"user"|"publisher"|"admin";status:"active"|"suspended"|"banned";isVerified:boolean;avatarKey?:string|null}
}
declare module "next-auth/jwt"{interface JWT{role?:"user"|"publisher"|"admin";status?:"active"|"suspended"|"banned";username?:string|null;isVerified?:boolean;avatarKey?:string|null}}
