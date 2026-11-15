const { CONTENTFUL_SPACE_ID: space, CONTENTFUL_MANAGEMENT_TOKEN: token, CONTENTFUL_ENVIRONMENT: environment } = process.env;
if (!space || !token || !environment) throw new Error('Set Contentful space, environment and management token in .env.local');
const root = `https://api.contentful.com/spaces/${encodeURIComponent(space)}/environments/${encodeURIComponent(environment)}`;
async function request(path, method='GET', body) {
 const response = await fetch(root+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/vnd.contentful.management.v1+json'},body:body?JSON.stringify(body):undefined});
 if (!response.ok) throw new Error(`CMS setup failed: ${method} ${path} (${response.status})`);
 return response.status===204?null:response.json();
}
const field=(id,type='Symbol',required=false)=>({id,name:id,type,required,localized:false});
const image=id=>({id,name:id,type:'Link',linkType:'Asset',required:false,localized:false,validations:[{linkMimetypeGroup:['image']}]});
const media=[field('photoAlt'),field('photoSource'),field('photoPermission')];
const models={
 home:[field('text','Text',true)],
 about:[field('introduction','Text',true),field('vision','Text'),field('mission','Text'),field('philosophy','Text'),image('environmentPhoto'),...media],
 researchArea:[field('title','Symbol',true),field('description','Text',true),field('category')],
 project:[field('title','Symbol',true),field('description','Text',true),field('subtitle'),field('year','Integer'),field('category'),field('links','Object')],
 person:[field('name','Symbol',true),field('role','Symbol',true),field('studentId'),field('email'),field('nationality'),field('initials'),field('interests','Text'),field('profileUrl'),image('photo'),...media],
 publication:[field('title','Symbol',true),{...field('authors','Array',true),items:{type:'Symbol'}},field('venue','Symbol',true),field('year','Integer',true),field('paperUrl')]
};
for (const [id,fields] of Object.entries(models)) {
 const response=await fetch(root+'/content_types/'+id,{headers:{Authorization:`Bearer ${token}`}});
 if(response.status===404) {
  const model=await request('/content_types/'+id,'PUT',{name:id,displayField:fields[0].id,fields:[...fields,field('id'),field('order','Integer'),field('sourceNote','Text')]});
  const activate=await fetch(root+'/content_types/'+id+'/published',{method:'PUT',headers:{Authorization:`Bearer ${token}`,'X-Contentful-Version':String(model.sys.version)}});
  if(!activate.ok) throw new Error(`Cannot activate ${id}`);
 } else if(!response.ok) throw new Error(`Cannot inspect ${id}: ${response.status}`);
}
const local=await import('../src/data/content.ts');
const seeds=[['home','home',{text:local.homeIntroduction.text}],['about','about',local.about],...local.people.map((p,index)=>[p.id,'person',{...p,profileUrl:p.profile?.href,profile:undefined,order:index,sourceNote:p.studentId?'Member details and master’s roles supplied by project owner, 2026-11-15':'NDHU CSIE official faculty directory: https://www.csie.ndhu.edu.tw/en/professors-en/'}])];
for (const [id,type,fields] of seeds) {
 const exists=await fetch(root+'/entries/'+id,{headers:{Authorization:`Bearer ${token}`}});
 if(exists.ok) continue;
 if(exists.status!==404) throw new Error(`Cannot inspect entry ${id}`);
 const localized=Object.fromEntries(Object.entries(fields).filter(([,value])=>value!==undefined).map(([key,value])=>[key,{'en-US':value}]));
 await fetch(root+'/entries/'+id,{method:'PUT',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/vnd.contentful.management.v1+json','X-Contentful-Content-Type':type},body:JSON.stringify({fields:localized})}).then(r=>{if(!r.ok)throw new Error(`Cannot seed ${id}: ${r.status}`);});
}
console.log('Models ready. Seed entries are drafts; review and publish them in Contentful. Existing models and entries were preserved.');
