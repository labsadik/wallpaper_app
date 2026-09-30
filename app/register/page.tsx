"use client";
import {FormEvent,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function RegisterPage(){
  const router=useRouter(); const [name,setName]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setBusy(true);setError("");const r=await fetch("/api/auth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,email,password})});const data=await r.json();if(!r.ok){setError(data.error||"Registration failed");setBusy(false);return;}router.push("/login");}
  return <main className="container" style={{padding:"70px 0"}}><div className="card" style={{maxWidth:460,margin:"0 auto",padding:28}}>
    <h1 style={{fontSize:32,margin:"0 0 8px"}}>Create account</h1><p className="muted">Start as a user. Publisher access can be granted by an admin.</p>
    <form onSubmit={submit} style={{display:"grid",gap:14,marginTop:24}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required minLength={2} style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"var(--input)",color:"var(--text)"}}/>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" required style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (8+ characters)" type="password" required minLength={8} style={{padding:12,borderRadius:10,border:"1px solid var(--line)",background:"#0d1118",color:"white"}}/>
      {error&&<p style={{color:"#ff7a7a"}}>{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy?"Creating...":"Create account"}</button>
    </form>
    <p className="muted" style={{marginTop:16}}>Already registered? <Link href="/login" style={{textDecoration:"underline"}}>Login</Link></p>
  </div></main>;
}