import { Check,AlertCircle,HelpCircle,Clock,Minus,TriangleAlert } from 'lucide-react';
import type { CheckState } from '../../shared/model';
export const stateLabels:Record<CheckState,string>={pass:'Reviewed',fail:'Missing / fix needed',unknown:'Answer needed',needs_review:'Needs your review',not_applicable:'Not required',pending:'Processing',error:'Could not inspect'};
export function Status({state}:{state:CheckState}){const Icon=state==='pass'?Check:state==='fail'||state==='error'?AlertCircle:state==='pending'?Clock:state==='not_applicable'?Minus:state==='unknown'?HelpCircle:TriangleAlert;return <span className={`status status-${state}`}><Icon size={13}/>{stateLabels[state]}</span>;}
export const date=(value:string)=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));
export const size=(value:number)=>value>=1024*1024?`${(value/1024/1024).toFixed(1)} MB`:`${Math.max(1,Math.round(value/1024))} KB`;
