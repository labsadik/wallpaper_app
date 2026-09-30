import "next-auth";
import "next-auth/jwt";
import type {DefaultSession} from "next-auth";

declare module "next-auth"{
  interface Session{user:{id:string;role:"user"|"publisher"|"admin"}&DefaultSession["user"]}
  interface User{id:string;role:"user"|"publisher"|"admin"}
}
declare module "next-auth/jwt"{interface JWT{role?:"user"|"publisher"|"admin"}}