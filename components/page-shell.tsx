import type {ReactNode} from "react";

export default function PageShell({eyebrow,title,description,actions,children}:{eyebrow?:string;title:string;description?:string;actions?:ReactNode;children:ReactNode}){
  return <main className="container" style={{padding:"42px 0 80px"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap",marginBottom:28}}>
      <div>
        {eyebrow?<p className="muted" style={{margin:"0 0 6px",fontWeight:700}}>{eyebrow}</p>:null}
        <h1 style={{fontSize:"clamp(34px,5vw,48px)",lineHeight:1.05,margin:0}}>{title}</h1>
        {description?<p className="muted" style={{maxWidth:760,margin:"12px 0 0",fontSize:16}}>{description}</p>:null}
      </div>
      {actions}
    </div>
    {children}
  </main>;
}