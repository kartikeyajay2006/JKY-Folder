import { createApp } from './app';
const port=Number(process.env.PORT||3001);const host=process.env.HOST||'127.0.0.1';
const runtime=createApp({dataDir:process.env.DATA_DIR||'.data',origin:process.env.APP_ORIGIN||'http://localhost:5173',production:process.env.NODE_ENV==='production'});
const server=runtime.app.listen(port,host,()=>console.log(`JKY-Folder API: http://${host}:${port}`));
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>server.close(()=>{runtime.close();process.exit(0);}));
