"use client";

import {useState} from "react";
import {signOut} from "next-auth/react";

export default function LogoutButton(){
  const [busy,setBusy]=useState(false);

  async function logout(){
    if(busy)return;
    setBusy(true);
    await signOut({callbackUrl:"/"});
  }

  return <button className="btn header-logout" type="button" onClick={logout} disabled={busy}>
    {busy?"Signing out…":"Logout"}
  </button>;
}
