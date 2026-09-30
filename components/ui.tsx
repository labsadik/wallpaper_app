import type {ButtonHTMLAttributes, InputHTMLAttributes, ReactNode} from "react";

export function Button({children,className="",variant="default",...props}:{children:ReactNode;className?:string;variant?:"default"|"primary"|"ghost"}&ButtonHTMLAttributes<HTMLButtonElement>){
  const styles=variant==="primary"?"btn btn-primary":variant==="ghost"?"btn" :"btn";
  return <button className={styles+" "+className} {...props}>{children}</button>;
}
export function Field({label,children,help}:{label:string;children:ReactNode;help?:string}){
  return <label style={{display:"grid",gap:8}}><span style={{fontSize:13,fontWeight:700}}>{label}</span>{children}{help?<span className="muted" style={{fontSize:12}}>{help}</span>:null}</label>;
}
export function Input(props:InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} style={{padding:"12px 13px",borderRadius:12,border:"1px solid var(--line)",background:"#0d1118",color:"white",outline:"none",width:"100%",...(props.style||{})}}/>;
}