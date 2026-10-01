"use client";

import {useState} from "react";
import {signOut} from "next-auth/react";

export default function LogoutButton(){
  const [busy,setBusy]=useState(false);
  async function logout(){if(busy)return;setBusy(true);await signOut({callbackUrl:"/"});}
  return <button className="inline-flex min-h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={logout} disabled={busy}>{busy?"Signing out…":"Logout"}</button>;
}