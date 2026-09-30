import type {PortalField} from './portalEditorSchema';

export type PortalValidationResult={valid:boolean;errors:string[]};

const OPTIONAL_KEYS=new Set(['logoUrl','heroImageUrl']);
const isHttps=(value:string)=>{try{return new URL(value).protocol==='https:'}catch{return false}};
const isRecord=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const positive=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>0;
const uniqueIds=(items:unknown[])=>{const ids=items.filter(isRecord).map(x=>String(x.id??'').trim()).filter(Boolean);return new Set(ids).size===ids.length};

export function validatePortalDraft(fields:PortalField[],draft:Record<string,string>,sectionKey=''):PortalValidationResult{
 const errors:string[]=[];
 for(const f of fields){
  const raw=(draft[f.key]??'').trim();
  if(!raw){if(!OPTIONAL_KEYS.has(f.key))errors.push(`${f.label} belum diisi.`);continue}
  if(f.kind==='number'){const n=Number(raw);if(!Number.isFinite(n))errors.push(`${f.label} harus berupa angka.`);else if(n<0)errors.push(`${f.label} tidak boleh negatif.`)}
  if(f.kind==='url'&&!isHttps(raw))errors.push(`${f.label} harus berupa URL HTTPS yang valid.`);
  if(f.kind==='json-list'||f.kind==='json-object'){
   try{
    const parsed=JSON.parse(raw);
    if(f.kind==='json-list'){
     if(!Array.isArray(parsed)){errors.push(`${f.label} harus berupa daftar.`);continue}
     if(!uniqueIds(parsed))errors.push(`${f.label} memiliki ID duplikat.`);
     if(sectionKey==='company'&&f.key==='imagesJson'&&(parsed.length!==5||!parsed.every((x:unknown)=>typeof x==='string'&&isHttps(x))))errors.push('Galeri Perusahaan harus berisi tepat 5 URL gambar HTTPS.');
     if(sectionKey==='equity'&&f.key==='calculatorOptionsJson'){
      if(parsed.length===0)errors.push('Opsi kalkulator minimal satu.');
      const units=new Set<number>();
      for(const item of parsed){if(!isRecord(item)||!Number.isInteger(item.units)||Number(item.units)<1||Number(item.units)>50||!positive(item.price)||typeof item.monthlyShare!=='number'||item.monthlyShare<0){errors.push('Setiap opsi kalkulator harus memiliki units 1–50, price positif, dan monthlyShare tidak negatif.');break}if(units.has(Number(item.units))){errors.push('Jumlah unit pada opsi kalkulator tidak boleh duplikat.');break}units.add(Number(item.units))}
     }
     for(const item of parsed)if(isRecord(item)&&typeof item.imageUrl==='string'&&item.imageUrl&&!isHttps(item.imageUrl)){errors.push(`${f.label} memiliki imageUrl non-HTTPS.`);break}
    }else if(!isRecord(parsed))errors.push(`${f.label} harus berupa objek.`);
   }catch{errors.push(`${f.label} memiliki struktur data yang tidak valid.`)}
  }
 }
 return {valid:errors.length===0,errors};
}
