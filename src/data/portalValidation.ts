import type {PortalField} from './portalEditorSchema';

export type PortalValidationResult={valid:boolean;errors:string[]};
export function validatePortalDraft(fields:PortalField[],draft:Record<string,string>):PortalValidationResult{
 const errors:string[]=[];
 for(const f of fields){
  const raw=(draft[f.key]??'').trim();
  if(!raw && f.kind==='url' && !f.value)continue;
  if(!raw){errors.push(`${f.label} belum diisi.`);continue}
  if(f.kind==='number'&&!Number.isFinite(Number(raw)))errors.push(`${f.label} harus berupa angka.`);
  if(f.kind==='url'){try{const u=new URL(raw);if(!['http:','https:'].includes(u.protocol))throw new Error()}catch{errors.push(`${f.label} harus berupa URL HTTP/HTTPS yang valid.`)}}
  if(f.kind==='json-list'||f.kind==='json-object'){try{const parsed=JSON.parse(raw);if(f.kind==='json-list'&&!Array.isArray(parsed))errors.push(`${f.label} harus berupa daftar.`);if(f.kind==='json-object'&&(Array.isArray(parsed)||!parsed||typeof parsed!=='object') )errors.push(`${f.label} harus berupa objek.`)}catch{errors.push(`${f.label} memiliki struktur data yang tidak valid.`)}}
 }
 return {valid:errors.length===0,errors};
}
