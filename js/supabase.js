// ═══════════════ SUPABASE INIT ═══════════════
const SB_URL='https://ctdleobjnzniqkqomlrq.supabase.co';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGxlb2JqbnpuaXFrcW9tbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzE4MTEsImV4cCI6MjA4NzgwNzgxMX0.AMHtY7zGPemKYCxMy2bqRTOEAp8trA_Slor9wmg7C38';
const sb=(typeof supabase!=='undefined')?supabase.createClient(SB_URL,SB_KEY):null;
// Admin check moved to server-side (verify_password RPC returns role)
function genId(){return crypto.randomUUID()}
function toast(msg,type){const t=document.createElement('div');t.textContent=msg;t.style.cssText='position:fixed;top:20px;right:20px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:12px;font-weight:600;font-family:var(--f);color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:opacity .3s;max-width:360px';t.style.background=type==='gn'||type==='ok'?'var(--gn)':type==='rd'||type==='error'?'var(--rd)':'var(--ac2)';document.body.appendChild(t);setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300)},3500)}
async function sbOp(promise,okMsg){try{const r=await promise;if(r.error)throw r.error;if(okMsg)toast(okMsg,'gn');return r}catch(e){toast(e.message||'Ошибка','rd');console.error('[sbOp]',e);return{error:e}}}
// Helper: escape HTML for safe attribute/content injection
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function safeHref(url){const s=String(url||'').trim().toLowerCase();if(s.startsWith('javascript:')||s.startsWith('data:'))return '#';return esc(url)}
// Per-user localStorage helpers
function uKey(k){const uid=currentUser&&currentUser.id?currentUser.id:'anon';const r=currentRole||'';return k+'_'+uid+(r?'_'+r:'')}
function uKeyOld(k){const uid=currentUser&&currentUser.id?currentUser.id:'anon';return k+'_'+uid}
function migrateLocalStorageKeys(newId){
  const keys=Object.keys(localStorage);
  const dataKeys=['svita_picked','svita_bm','svita_prop','svita_prop_params','svita_fp','svita_property','svita_ach','svita_images'];
  const role=currentRole||localStorage.getItem('svita_role')||'admin';
  const newSuffix='_'+newId+'_'+role;
  let migrated=0;
  dataKeys.forEach(base=>{
    const target=base+newSuffix;
    const existing=localStorage.getItem(target);
    if(existing&&existing!=='{}'&&existing!=='[]'&&existing!=='null')return;
    // Search all keys for this base with ANY other suffix that has real data
    const best=keys
      .filter(k=>k.startsWith(base+'_')&&k!==target)
      .map(k=>({k,v:localStorage.getItem(k)}))
      .filter(x=>x.v&&x.v!=='{}'&&x.v!=='[]'&&x.v!=='null'&&x.v.length>2)
      .sort((a,b)=>b.v.length-a.v.length)[0];
    if(best){localStorage.setItem(target,best.v);migrated++;console.log('[SVITA] Migrate:',best.k,'→',target,'('+best.v.length+' bytes)')}
  });
  if(migrated)console.log('[SVITA] Total migrated:',migrated,'keys');
}
function uSet(k,v){localStorage.setItem(uKey(k),v)}
function uGet(k){return localStorage.getItem(uKey(k))}
function uRemove(k){localStorage.removeItem(uKey(k))}
// Helper: extract ru name from multilingual JSON or string
function i18n(v){
  if(!v)return'—';
  if(typeof v==='string')return v;
  return v.ru||v.en||v.pl||Object.values(v)[0]||'—';
}

// ═══════════════ EQUIPMENT CATEGORY TRANSLATIONS ═══════════════
const EQUIP_CAT_RU={
  air_polisher:'Воздушный полировщик',amalgam_separator:'Амальгамосепаратор',
  apex_locator:'Апекслокатор',autoclaves:'Автоклавы',compressors:'Компрессоры',
  consumables:'Расходные материалы',contra_angle:'Угловой наконечник',
  curing_lamp:'Фотополимерная лампа',dental_assistant_cart:'Ассистентский столик',
  dental_loupes:'Стоматологические лупы',dental_microscope:'Стоматологический микроскоп',
  dental_stool:'Стоматологический стул',dental_unit:'Стоматологическая установка',
  dental_units:'Стоматологические установки',diagnostic_lamp:'Диагностическая лампа',
  endomotor:'Эндомотор',furniture:'Медицинская мебель',instruments:'Инструменты',
  intraoral_camera:'Интраоральная камера',intraoral_scanner:'Интраоральный сканер',
  lighting:'Освещение',medical_accessory:'Медицинские аксессуары',
  medical_cabinet:'Медицинский шкаф',medical_screen:'Медицинская ширма',
  medical_table:'Медицинский стол',medical_trolley:'Медицинская тележка',
  micromotor:'Микромотор',obturation_system:'Система обтурации',
  office_chair:'Офисное кресло',office_desk:'Офисный стол',
  piezosurgery:'Пьезохирургия',premises:'Помещения',
  quick_coupler:'Быстросъёмный переходник',rvg_sensor:'RVG-сенсор',
  scaler:'Скалер',sealer:'Силер',sterilization:'Стерилизация',
  straight_handpiece:'Прямой наконечник',suction_pump:'Аспиратор',
  surgical_lamp:'Хирургическая лампа',thermodisinfector:'Термодезинфектор',
  treatment_chair:'Кресло пациента',turbine:'Турбинный наконечник',
  ultrasonic_cleaner:'Ультразвуковая мойка',water_distiller:'Дистиллятор воды',
  whitening_lamp:'Лампа для отбеливания',xray:'Рентген',
  xray_protection:'Рентгенозащита',xray_unit:'Рентген-аппарат'
};

// ═══════════════ SUPABASE DATA SYNC ═══════════════
let _loadingData=false;
async function loadSupabaseData(){
  try{
    if(!sb||_loadingData)return;
    _loadingData=true;

    // 1. Categories first (needed for mapping), then everything else in parallel
    const[{data:eqCats},{data:svcCats},{data:svcSubs}]=await Promise.all([
      sb.from('equipment_categories').select('id,name,slug'),
      sb.from('service_categories').select('id,slug,name,icon,sort_order').order('sort_order'),
      sb.from('service_subcategories').select('id,category_id,slug,name').order('sort_order')
    ]);
    const catMap={},catSlugMap={};
    if(eqCats)eqCats.forEach(c=>{catMap[c.id]=i18n(c.name);catSlugMap[c.slug]=i18n(c.name)});
    const premisesCatId=eqCats?.find(c=>c.slug==='premises')?.id;

    // 2. All data in parallel
    const[{data:equip},{data:svc},{data:conceptItems},{data:contactCats},{data:profiles},{data:proposals}]=await Promise.all([
      sb.from('equipment').select('id,name,brand,model,category,category_id,price_pln,supplier_name,status,notes,images,specs,source_url').order('name'),
      sb.from('services').select('id,name,description,category_id,subcategory_id,price_per_unit,price_min,price_max,price_unit,measurement_type,difficulty,estimated_hours,status').order('name'),
      sb.from('concept_items').select('*').order('sort_order'),
      sb.from('clinic_contact_categories').select('*').order('sort_order'),
      sb.from('profiles').select('*').order('created_at'),
      sb.from('proposals').select('*').order('created_at',{ascending:false})
    ]);
    if(equip&&equip.length){
      DB.suppliers=equip
        .filter(e=>e.category_id!==premisesCatId&&e.category!=='premises')
        .map(e=>({
          id:e.id,
          name:e.name+(e.model&&!e.name.includes(e.model)?' '+e.model:''),
          category:catMap[e.category_id]||catSlugMap[e.category]||EQUIP_CAT_RU[e.category]||e.category||'Другое',
          price:e.price_pln||0,
          supplier:e.supplier_name||e.brand||'—',
          warranty:e.status||'—',
          notes:e.notes||'',
          img:e.images&&e.images.length?e.images[0]:null
        }));
    }

    // 3. Map service categories + subcategories (already loaded above)
    const svcCatMap={},svcSubMap={};
    if(svcCats)svcCats.forEach(c=>{svcCatMap[c.id]={name:i18n(c.name),icon:c.icon,slug:c.slug}});
    if(svcSubs)svcSubs.forEach(s=>{svcSubMap[s.id]={name:i18n(s.name),catId:s.category_id}});

    // 4. Services → DB.services
    if(svc&&svc.length){
      DB.services=svc.map(s=>{
        const cat=svcCatMap[s.category_id];
        const sub=svcSubMap[s.subcategory_id];
        return{
          id:s.id,
          name:i18n(s.name),
          desc:i18n(s.description),
          category:cat?cat.name:'—',
          categoryIcon:cat?cat.icon:'',
          subcategory:sub?sub.name:'',
          price:s.price_per_unit||s.price_min||0,
          priceMax:s.price_max||0,
          unit:s.price_unit||s.measurement_type||'шт',
          difficulty:s.difficulty||'—',
          hours:s.estimated_hours||0,
          time:s.measurement_type?('за '+s.measurement_type):'—',
          status:s.status||'estimate'
        };
      });
    }

    // 5. Concept items (already loaded in Promise.all)
    if(conceptItems&&conceptItems.length){
      DB.conceptItems=conceptItems.map(ci=>({
        id:ci.id,
        title:ci.title,
        desc:ci.description||'',
        type:ci.item_type||'work',
        volume:ci.volume||0,
        volumeUnit:ci.volume_unit||'шт',
        price:ci.manual_price||0,
        priceUnit:ci.manual_price_unit||'per_unit',
        status:ci.status||'planned',
        tokens:ci.tokens_total||0
      }));
    }

    // 6. Contact categories (already loaded in Promise.all)
    DB._contactCats=contactCats||[];

    // 7. Premises (filtered from equipment already loaded in Promise.all)
    const premisesArr=equip?equip.filter(e=>e.category_id===premisesCatId):[];
    DB.premises=premisesArr.map(p=>({
      id:p.id,name:p.name,price:p.price_pln||0,status:p.status||'candidate',
      notes:p.notes||'',img:p.images&&p.images.length?p.images[0]:null,
      source:p.source_url||'',specs:p.specs||{}
    }));

    // Store category maps
    DB._eqCats=eqCats||[];
    DB._svcCats=svcCats||[];
    DB._svcSubs=svcSubs||[];

    // 8. Users from profiles (already loaded in Promise.all)
    if(profiles&&profiles.length){
      const existingEmails=new Set(DB.users.map(u=>u.email));
      profiles.forEach(p=>{
        if(existingEmails.has(p.email)){
          const existing=DB.users.find(u=>u.email===p.email);
          if(existing){
            if(p.display_name)existing.name=p.display_name;
            if(p.role)existing.role=p.role;
            if(p.plan)existing.plan=p.plan;
            if(p.avatar_url)existing.avatar=p.avatar_url;
            existing.status=p.status||'Активен';
            existing.lastLogin=p.last_login;
          }
        }else{
          DB.users.push({
            id:genUserId(),
            name:p.display_name||p.email.split('@')[0],
            email:p.email,
            role:p.role||'owner',
            plan:p.plan||'trial',
            status:p.status||'Активен',
            lastLogin:p.last_login,
            created:new Date().toISOString().slice(0,10),
            avatar:p.avatar_url||''
          });
          existingEmails.add(p.email);
        }
      });
    }

    // 9. Proposals (already loaded in Promise.all)
    if(proposals)DB.proposals=proposals;

    console.log('Supabase: loaded',DB.suppliers.length,'equipment,',DB.services.length,'services,',
      DB.premises.length,'premises,',DB.users.length,'users,',DB.proposals.length,'proposals');

    // Re-render after data load
    if(document.getElementById('appContainer').style.display!=='none'){
      buildSidebar();renderAll();renderEquip();recalc();
      // Restore current section visibility
      document.querySelectorAll('.sec').forEach(s=>s.classList.remove('vis'));
      const curSec=document.getElementById('sec-'+cur);
      if(curSec)curSec.classList.add('vis');
    }
  }catch(e){console.warn('Supabase sync failed, using local DB:',e.message)}finally{_loadingData=false}
}

