import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "jsr:@supabase/supabase-js@2";

const allowedOrigins=new Set(["https://www.nuzultrip.click","https://nuzultrip-equity.vercel.app"]);
function cors(req:Request){const o=req.headers.get("origin")||"";return{"Access-Control-Allow-Origin":allowedOrigins.has(o)?o:"https://www.nuzultrip.click","Vary":"Origin","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}}

Deno.serve(async(req)=>{
 const ch=cors(req);if(req.method==="OPTIONS")return new Response("ok",{headers:ch});
 if(req.method!=="POST")return json({error:"Method not allowed"},405,ch);
 const url=Deno.env.get("SUPABASE_URL")!,anon=Deno.env.get("SUPABASE_ANON_KEY")!,service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const auth=req.headers.get("Authorization")||"";
 const caller=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false}});
 const {data:{user}}=await caller.auth.getUser();if(!user)return json({error:"Authentication required"},401,ch);
 let body:any;try{body=await req.json()}catch{return json({error:"Invalid JSON"},400,ch)}
 const documentId=String(body.document_id||"");if(!documentId)return json({error:"document_id required"},400,ch);
 // RLS on documents is the authorization boundary: public/investor documents are visible
 // to eligible investors, while restricted documents require an active per-investor grant.
 const visible=await caller.from("documents").select("id,title,status,visibility,published_version_id").eq("id",documentId).eq("status","published").maybeSingle();
 if(visible.error||!visible.data)return json({error:"Dokumen tidak tersedia untuk akun ini"},404,ch);
 const db=createClient(url,service,{auth:{persistSession:false}});
 const {data,error}=await db.from("document_versions").select("id,file_asset:media_assets!document_versions_file_asset_id_fkey(bucket,path,original_filename,mime_type)").eq("id",visible.data.published_version_id).eq("document_id",documentId).eq("status","published").maybeSingle();
 if(error||!data)return json({error:"Versi dokumen tidak tersedia"},404,ch);
 const asset=(data as any).file_asset;if(!asset||asset.mime_type!=="application/pdf"||asset.bucket!=="company-documents")return json({error:"PDF tidak valid"},404,ch);
 const signed=await db.storage.from(asset.bucket).createSignedUrl(asset.path,60,{download:asset.original_filename});
 if(signed.error)return json({error:"Gagal membuat tautan unduhan"},500,ch);
 return json({title:visible.data.title,file_name:asset.original_filename,url:signed.data.signedUrl},200,ch);
});
function json(v:unknown,s=200,h:Record<string,string>={}){return new Response(JSON.stringify(v),{status:s,headers:{...h,"Content-Type":"application/json","Cache-Control":"no-store"}})}
