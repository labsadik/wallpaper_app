import type {NextConfig} from "next";

const cdnHostname=process.env.BUNNY_CDN_HOSTNAME?.replace(/^https?:\/\//,"").replace(/\/$/,"");

const remotePatterns=[
  {protocol:"https" as const,hostname:"**.b-cdn.net"}
];

if(cdnHostname){
  remotePatterns.push({protocol:"https" as const,hostname:cdnHostname});
}

const nextConfig:NextConfig={
  images:{
    remotePatterns
  },
  poweredByHeader:false
};

export default nextConfig;
