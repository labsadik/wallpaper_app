import type {NextConfig} from "next";

const cdnHostname=process.env.BUNNY_CDN_HOSTNAME?.replace(/^https?:\/\//,"").replace(/\/$/,"");

const remotePatterns=[
  {protocol:"https" as const,hostname:"**.b-cdn.net"}
];

if(cdnHostname){
  remotePatterns.push({protocol:"https" as const,hostname:cdnHostname});
}

const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"SAMEORIGIN"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"X-DNS-Prefetch-Control",value:"off"}
];

if(process.env.NODE_ENV==="production"){
  securityHeaders.push({
    key:"Strict-Transport-Security",
    value:"max-age=31536000; includeSubDomains; preload"
  });
}

const nextConfig:NextConfig={
  reactStrictMode:true,
  images:{
    localPatterns:[
      {pathname:"/api/media/**"}
    ],
    remotePatterns
  },
  poweredByHeader:false,
  async redirects(){
    return [
      {source:"/wallpapers",destination:"/items",permanent:true},
      {source:"/wallpapers/:slug",destination:"/items/:slug",permanent:true}
    ];
  },
  async headers(){
    return [{source:"/(.*)",headers:securityHeaders}];
  }
};

export default nextConfig;
