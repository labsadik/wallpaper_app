"use client";

import {FormEvent,useState} from "react";
import {signIn} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/navigation";

export default function LoginPage(){
  const router=useRouter();
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  async function submit(event:FormEvent){
    event.preventDefault();
    if(busy)return;
    setBusy(true);
    setError("");
    const result=await signIn("credentials",{email:email.trim(),password,redirect:false});
    if(result?.error){
      setError("Email or password is incorrect.");
      setBusy(false);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  return <main className="container" style={{padding:"64px 0 88px"}}>
    <div style={{maxWidth:980,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr",border:"1px solid var(--line)",borderRadius:22,overflow:"hidden",background:"var(--panel)"}}>
      <section style={{padding:34,display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:520,background:"linear-gradient(145deg,#171d27,#0e1219)"}}>
        <div>
          <span className="badge">Wallpaper SaaS</span>
          <h1 style={{fontSize:"clamp(34px,5vw,54px)",lineHeight:1.02,margin:"22px 0 14px"}}>Welcome back.</h1>
          <p className="muted" style={{maxWidth:430,fontSize:16,lineHeight:1.6}}>Sign in to save wallpapers, view download history, and access publisher tools when your account has publishing access.</p>
        </div>
        <div style={{display:"grid",gap:9}}>
          {["Secure credentials login","Saved and downloaded wallpapers","Publisher workspace for approved accounts"].map(item=><div key={item} className="card" style={{padding:12,background:"rgba(255,255,255,.03)"}}><span style={{fontSize:13}}>✓ {item}</span></div>)}
        </div>
      </section>

      <section style={{padding:34,display:"grid",alignContent:"center"}}>
        <div style={{maxWidth:420,width:"100%",margin:"0 auto"}}>
          <p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>Account access</p>
          <h2 style={{fontSize:30,margin:"0 0 8px"}}>Sign in</h2>
          <p className="muted" style={{margin:0}}>Use the email and password connected to your account.</p>

          <form onSubmit={submit} style={{display:"grid",gap:16,marginTop:26}}>
            <label style={{display:"grid",gap:8}}>
              <span style={{fontSize:13,fontWeight:700}}>Email</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" required style={{padding:"13px 14px",borderRadius:12,border:"1px solid var(--line)",background:"#0d1118",color:"white",outline:"none"}}/>
            </label>
            <label style={{display:"grid",gap:8}}>
              <span style={{fontSize:13,fontWeight:700}}>Password</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" required style={{padding:"13px 14px",borderRadius:12,border:"1px solid var(--line)",background:"#0d1118",color:"white",outline:"none"}}/>
            </label>

            {error?<div role="alert" className="card" style={{padding:12,borderColor:"#5c3030",background:"#241416",color:"#ffb2b2"}}>{error}</div>:null}

            <button className="btn btn-primary" disabled={busy} style={{minHeight:46}}>
              {busy?"Signing in...":"Sign in"}
            </button>
          </form>

          <p className="muted" style={{margin:"18px 0 0",fontSize:14}}>
            New here? <Link href="/register" style={{textDecoration:"underline"}}>Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  </main>;
}
