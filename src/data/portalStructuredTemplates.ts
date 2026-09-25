export type StructuredTemplate={label:string;fields:Record<string,string|number|string[]>;imageFields?:string[]};
export const STRUCTURED_TEMPLATES:Record<string,StructuredTemplate>={
 'about.metricsJson':{label:'Metrik',fields:{id:'',value:0,prefix:'',suffix:'',label:'',description:''}},
 'equity.metricsJson':{label:'Metrik Equity',fields:{id:'',value:0,prefix:'',suffix:'',label:''}},
 'company.imagesJson':{label:'Gambar Galeri',fields:{imageUrl:''},imageFields:['imageUrl']},
 'company.metricsJson':{label:'Metrik Perusahaan',fields:{id:'',value:0,prefix:'',suffix:'',label:''}},
 'services.itemsJson':{label:'Layanan',fields:{id:'',code:'',title:'',tagline:'',description:'',iconName:''}},
 'process.stepsJson':{label:'Tahapan',fields:{id:'',stepNumber:'',title:'',description:'',duration:'',output:''}},
 'roadmap.phasesJson':{label:'Fase Roadmap',fields:{step:'',phaseNumber:1,period:'',title:'',status:'upcoming',statusLabel:'',summary:'',highlights:[],kpiLabel:'',kpiValue:''}},
 'network.partnersJson':{label:'Mitra',fields:{id:'',title:'',description:'',iconName:''}},
 'investor.itemsJson':{label:'Informasi Investor',fields:{id:'',title:'',description:'',details:'',imageUrl:''},imageFields:['imageUrl']},
 'articles.itemsJson':{label:'Artikel',fields:{id:'',category:'',title:'',description:'',readTime:'',imageUrl:'',date:''},imageFields:['imageUrl']}
};
