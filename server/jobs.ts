import { fork,type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Store } from './store';
import type { DocumentRecord,Packet } from '../shared/model';
export function startJobs(store:Store){
 let running=false,stopped=false,child:ChildProcess|undefined;
 store.db.prepare("UPDATE jobs SET status='queued' WHERE status='processing'").run();
 const timer=setInterval(()=>void tick(),300);timer.unref();
 async function tick(){
  if(running||stopped)return;
  const row=store.db.prepare("SELECT j.id,j.packetId,d.objectKey,d.payload FROM jobs j JOIN documents d ON d.id=j.id WHERE j.status='queued' ORDER BY j.rowid LIMIT 1").get() as {id:string;packetId:string;objectKey:string;payload:string}|undefined;
  if(!row)return;running=true;store.db.prepare("UPDATE jobs SET status='processing' WHERE id=?").run(row.id);
  try{
   const result=await new Promise<{ok:boolean;result?:Partial<DocumentRecord>;error?:string}>((resolve)=>{
    const proc=fork(fileURLToPath(new URL('./inspect-worker.mjs',import.meta.url)),[join(store.objects,row.objectKey)],{execArgv:['--max-old-space-size=192'],env:{PATH:process.env.PATH},stdio:['ignore','ignore','ignore','ipc']});child=proc;
    let finished=false;
    const finish=(value:{ok:boolean;result?:Partial<DocumentRecord>;error?:string})=>{if(finished)return;finished=true;clearTimeout(timeout);resolve(value);};
    const timeout=setTimeout(()=>{proc.kill('SIGKILL');finish({ok:false,error:'Inspection reached its time limit. Try a smaller supported file.'});},15000);
    proc.once('message',value=>{finish(value as Parameters<typeof finish>[0]);proc.kill();});
    proc.once('error',()=>finish({ok:false,error:'The inspection worker is unavailable.'}));
    proc.once('exit',()=>finish({ok:false,error:'The inspection worker stopped before completing.'}));
   });
   if(stopped)return;
   store.db.transaction(()=>{
    const current=store.db.prepare('SELECT payload FROM documents WHERE id=? AND packetId=?').get(row.id,row.packetId) as {payload:string}|undefined;
    const packetRow=store.db.prepare('SELECT payload FROM packets WHERE id=?').get(row.packetId) as {payload:string}|undefined;
    if(!current||!packetRow)return; // deletion wins; never recreate removed records
    const doc:DocumentRecord=JSON.parse(current.payload);
    const updated={...doc,...(result.result||{}),status:result.ok?'ready':'error',error:result.ok?undefined:result.error};
    store.db.prepare('UPDATE documents SET payload=? WHERE id=?').run(JSON.stringify(updated),row.id);
    store.db.prepare("UPDATE jobs SET status='done' WHERE id=?").run(row.id);
    const packet:Packet=JSON.parse(packetRow.payload);packet.revision++;packet.updatedAt=new Date().toISOString();store.savePacket(packet);
   })();
  }finally{running=false;child=undefined;}
 }
 void tick();
 return ()=>{stopped=true;clearInterval(timer);child?.kill('SIGKILL');};
}
