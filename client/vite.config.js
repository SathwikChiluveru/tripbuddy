import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const target = process.env.API_PROXY_TARGET || 'http://127.0.0.1:3001';
const proxy = {'/api':{target,changeOrigin:true},'/uploads':{target,changeOrigin:true},'/socket.io':{target,ws:true}};
const headers = {
  'Content-Security-Policy': "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: https://lh3.googleusercontent.com; font-src 'self' data:; script-src 'self' https://accounts.google.com/gsi/client; style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style; connect-src 'self' ws: https://accounts.google.com/gsi/; frame-src https://accounts.google.com/gsi/",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  ...(process.env.NODE_ENV === 'production' ? {'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'} : {})
};
export default defineConfig({plugins:[react()],resolve:{preserveSymlinks:true},server:{host:'127.0.0.1',port:5173,strictPort:true,proxy,headers},preview:{host:'127.0.0.1',port:5173,strictPort:true,proxy,headers}});
