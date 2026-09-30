"use client";
import {FormEvent,useState} from "react";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function LoginPage(){
  const router=useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const result=await signIn("credentials",{email,password,redirect:false});if(result?.error){setError("Invalid email or password.");}else{router.push("/account");}setBusy(false);}
  return <main className="container" style={{padding:"70px 0"}}><div className="card" style={{maxWidth:460,margin:"0 auto",padding:28}}>
    <h1 style={{fontSize:32,margin:"0 0 8px"}}>Login</h1><p className="muted">Access your saves, downloads and publishing tools.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" required style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      {error&&<p style={{color:"#ff7a7a"}}>{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy?"Signing in...":"Sign in"}</button>
    </form>
    <p className="muted" style={{marginTop:16}}>No account? <Link href="/register" style={{textDecoration:"underline"}}>Create one</Link></p>
  </div></main>;
}