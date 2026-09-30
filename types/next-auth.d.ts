import "next-auth";
import "next-auth/jwt";
import type {DefaultSession} from "next-auth";

declare module "next-auth"{
  interface Session{user:{id:string;role:"user"|"publisher"|"admin";status:"active"|"suspended"|"banned"}&DefaultSession["user"]}
  interface User{id:string;role:"user"|"publisher"|"admin";status:"active"|"suspended"|"banned"}
}
declare module "next-auth/jwt"{interface JWT{role?:"user"|"publisher"|"admin";status?:"active"|"suspended"|"banned"}}
