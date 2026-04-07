// ═══════════════ NAVIGATION ═══════════════
function getSecNames(){
  const isCoffee=currentBizType&&currentBizType!=='dental';
  return{overview:'Обзор',s1:'Помещение',s2:'Модернизация',s3:'Оснащение',s4:'Персонал',s5:isCoffee?'Меню':'Перечень услуг',s6:'Концепция',s7:'Документация',account:'Личный кабинет',budget:'Бюджет',profit:'Рентабельность',zones:'Зоны','db-premises':'БД Помещений','db-renovations':'Модернизация и услуги','db-services':isCoffee?'Меню':'Каталог услуг','db-docs':'Каталог документов','db-contractors':'БД Подрядчиков','db-suppliers':'Каталог оборудования','db-employees':'БД Сотрудников','db-vendor-companies':'Поставщики',users:'Пользователи','cabinet-types':isCoffee?'Стоимость помещений':'Типы кабинетов','contractor-works':'Доступные работы','contractor-proposals':'Мои предложения'};
}
const secNames=getSecNames();
const stageOrder=['s1','s2','s3','s4','s5','s6','s7'];
let cur='overview';

function nav(id){
  if(id==='upgrade-gate'){showUpgradeModal();return}
  // Close mobile sidebar
  const _sb=document.getElementById('sidebar');if(_sb)_sb.classList.remove('mob-open');
  const _mo=document.getElementById('mobOverlay');if(_mo)_mo.classList.remove('vis');
  cur=id;
  document.querySelectorAll('.sec').forEach(s=>s.classList.remove('vis'));
  const el=document.getElementById('sec-'+id);
  if(el)el.classList.add('vis');
  // Sidebar items
  document.querySelectorAll('.si').forEach(s=>s.classList.remove('act'));
  const si=document.querySelector('.si[data-nav="'+id+'"]');
  if(si)si.classList.add('act');
  // Tab bar
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('act'));
  const tab=document.querySelector('.tab[data-nav="'+id+'"]');
  if(tab)tab.classList.add('act');
  // If navigating to overview or analytics, deactivate tabs
  if(!id.startsWith('s'))document.querySelectorAll('.tab').forEach(t=>t.classList.remove('act'));
  document.getElementById('bc').textContent=getSecNames()[id]||id;
  window.scrollTo(0,0);
  if(id==='budget')updateBudget();
  if(id==='profit')updateProfit();
  if(id==='s6')updateFormulaDisplay();
  if(id==='contractor-works')renderContractorWorks();
  if(id==='contractor-proposals')renderContractorProposals();
  if(id==='account')renderAccount();
  updateSumbar();
  updateRightPanel();
}

function nextStage(){
  const i=stageOrder.indexOf(cur);
  if(i>=0&&i<stageOrder.length-1)nav(stageOrder[i+1]);
  else nav(stageOrder[0]);
}

// ═══════════════ ЛИЧНЫЙ КАБИНЕТ ═══════════════
let userConcepts=[];
let userSubscription={plan:'trial',concepts_limit:1,contractors_access:false};

async function renderAccount(){
  if(!currentUser)return;
  const u=currentUser;
  const initials=u.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const bg=ROLE_COLORS[currentRole]||'var(--ac)';
  // Profile section
  const av=document.getElementById('accAvatar');if(av){av.style.background=bg;av.textContent=initials}
  const an=document.getElementById('accName');if(an)an.textContent=esc(u.name);
  const ae=document.getElementById('accEmail');if(ae)ae.textContent=u.email;
  const ar=document.getElementById('accRoleBadge');if(ar){ar.textContent=ROLE_NAMES[currentRole]||currentRole;ar.style.background=currentRole==='admin'?'rgba(59,130,246,.1)':'var(--acbg)'}
  // Form fields
  document.getElementById('acc_name').value=u.name||'';
  document.getElementById('acc_phone').value=u.phone||'';
  document.getElementById('acc_company').value=u.company||'';
  document.getElementById('acc_city').value=u.city||'';
  // Auth method
  const am=document.getElementById('accAuthMethod');
  if(am){
    const{data:{session}}=await sb.auth.getSession();
    const provider=session?.user?.app_metadata?.provider||'email';
    am.textContent=provider==='email'?'Email + пароль':provider.charAt(0).toUpperCase()+provider.slice(1)+' (OAuth)';
  }
  // Last login
  const ll=document.getElementById('accLastLogin');
  if(ll){
    const{data:prof}=await sb.from('profiles').select('last_login').eq('email',u.email).single();
    ll.textContent=prof?.last_login?new Date(prof.last_login).toLocaleString('ru'):'—';
  }
  // Load subscription
  if(sb&&u.id){
    const{data:sub}=await sb.from('subscriptions').select('*').eq('user_id',u.id).single();
    if(sub)userSubscription=sub;
  }
  renderPlanDetails();
  loadConcepts();
}

function renderPlanDetails(){
  const s=userSubscription;
  const plans={trial:{name:'Пробный план',desc:'1 концепция, базовые функции',bg:'var(--sf2)',c:'var(--tx3)'},pro:{name:'Pro',desc:'5 концепций, полный прайс-лист',bg:'linear-gradient(135deg,#3b82f6,#6366f1)',c:'#fff'},unlimited:{name:'Unlimited',desc:'∞ концепций, все функции',bg:'linear-gradient(135deg,#c9a96e,#e8c97a)',c:'#000'}};
  const p=plans[s.plan]||plans.trial;
  const badge=document.getElementById('accPlanBadge');
  if(badge){badge.textContent=s.plan.toUpperCase();badge.style.background=p.bg;badge.style.color=p.c}
  const pn=document.getElementById('accPlanName');if(pn)pn.textContent=p.name;
  const pd=document.getElementById('accPlanDesc');if(pd)pd.textContent=p.desc;
  const pc=document.getElementById('accPlanConcepts');if(pc)pc.textContent=userConcepts.length+' / '+(s.concepts_limit||1);
  const pa=document.getElementById('accPlanContractors');if(pa)pa.textContent=s.contractors_access?'Да':'Нет';
  const pe=document.getElementById('accPlanExpiry');if(pe)pe.textContent=s.current_period_end?new Date(s.current_period_end).toLocaleDateString('ru'):'∞';
}

// ═══════════════ CONCEPTS (Supabase) ═══════════════
function serializeWorkspace(){
  return{
    employees:DB.employees,services:DB.services,rooms:DB.rooms,
    suppliers:DB.suppliers,renovations:DB.renovations,
    cabinetTypes:DB.cabinetTypes,zones:DB.zones,
    vendorCompanies:DB.vendorCompanies,
    pickedRooms:DB.pickedRooms||{},pickedRenovations:DB.pickedRenovations||{},
    pickedServices:DB.pickedServices||{},pickedEquip:DB.pickedEquip||{},
    pickedStaff:DB.pickedStaff||{},pickedDocs:DB.pickedDocs||{},
    property:activeProperty,bizType:currentBizType,bizSubtype:currentBizSubtype,
    floorPlan:typeof FP!=='undefined'&&FP?{rooms:FP.rooms,elements:FP.elements,scale:FP.scale}:null
  };
}

function hydrateWorkspace(d){
  if(d.employees)DB.employees=d.employees;
  if(d.services)DB.services=d.services;
  if(d.rooms)DB.rooms=d.rooms;
  if(d.suppliers)DB.suppliers=d.suppliers;
  if(d.renovations)DB.renovations=d.renovations;
  if(d.cabinetTypes)DB.cabinetTypes=d.cabinetTypes;
  if(d.zones)DB.zones=d.zones;
  if(d.vendorCompanies)DB.vendorCompanies=d.vendorCompanies;
  DB.pickedRooms=d.pickedRooms||{};DB.pickedRenovations=d.pickedRenovations||{};
  DB.pickedServices=d.pickedServices||{};DB.pickedEquip=d.pickedEquip||{};
  DB.pickedStaff=d.pickedStaff||{};DB.pickedDocs=d.pickedDocs||{};
  if(d.property&&typeof restoreProperty==='function')restoreProperty(d.property);
  if(d.bizType){currentBizType=d.bizType;localStorage.setItem('svita_biz_type',d.bizType)}
  if(d.bizSubtype){currentBizSubtype=d.bizSubtype;localStorage.setItem('svita_biz_subtype',d.bizSubtype)}
  if(d.floorPlan&&typeof FP!=='undefined'&&FP){FP.rooms=d.floorPlan.rooms||[];FP.elements=d.floorPlan.elements||[];FP.scale=d.floorPlan.scale||20;if(typeof fpDraw==='function')fpDraw();if(typeof fpUpdateList==='function')fpUpdateList()}
}

async function loadConcepts(){
  if(!sb||!currentUser){userConcepts=[];renderConceptsList();return}
  try{
    // Query by user_id (try UUID, fallback to selecting all user's concepts)
    const uid=currentUser.id;
    const{data,error}=await sb.from('concepts').select('id,name,status,stage,data,created_at,updated_at').eq('user_id',uid).order('updated_at',{ascending:false});
    if(error)throw error;
    userConcepts=data||[];
  }catch(e){console.error('[concepts]',e);userConcepts=[]}
  const cc=document.getElementById('conceptsCount');
  if(cc)cc.textContent=userConcepts.length+' концепций';
  renderConceptsList();
}

function renderConceptsList(){
  const c=document.getElementById('conceptsList');if(!c)return;
  if(!userConcepts.length){
    c.innerHTML='<div style="text-align:center;padding:24px"><div style="font-size:32px;margin-bottom:8px">&#128209;</div><div style="font-size:12px;color:var(--tx3);margin-bottom:12px">У вас пока нет сохранённых концепций</div><div style="font-size:10px;color:var(--tx3)">Создайте через AI-генератор или выберите шаблон</div></div>';
    return;
  }
  let html='';
  userConcepts.forEach(cp=>{
    const date=new Date(cp.updated_at||cp.created_at).toLocaleDateString('ru');
    const isCurrent=window._currentConceptId===cp.id;
    const d=cp.data||{};
    const empCount=d.employees?.length||0;
    const svcCount=d.services?.length||0;
    const bizIcon=d.bizType&&BIZ_TYPES[d.bizType]?BIZ_TYPES[d.bizType].icon:'📝';
    html+=`<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--bd);${isCurrent?'background:var(--acbg);margin:0 -12px;padding:10px 12px;border-radius:8px':''}">
<div style="flex:1;min-width:0">
<div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${bizIcon} ${esc(cp.name)}${isCurrent?' <span style="font-size:9px;color:var(--gn);font-weight:700">● АКТИВНАЯ</span>':''}</div>
<div style="font-size:10px;color:var(--tx3)">${empCount} сотр. · ${svcCount} услуг · ${date}</div>
</div>
<div style="display:flex;gap:4px;flex-shrink:0">
<button class="btn sm pr" onclick="loadConceptById('${cp.id}')">${isCurrent?'Обновить':'Открыть'}</button>
<button class="btn sm" onclick="duplicateConcept('${cp.id}')">&#128203;</button>
<button class="btn sm" style="color:var(--rd)" onclick="deleteConcept('${cp.id}')">✕</button>
</div>
</div>`;
  });
  c.innerHTML=html;
}

async function createConcept(name,source){
  if(!name){name=prompt('Название концепции:','Моя концепция');if(!name)return null}
  const conceptData=serializeWorkspace();
  const uid=currentUser?String(currentUser.id||currentUser.email||'anon'):'anon';
  // Try Supabase first
  if(sb){
    try{
      const{data,error}=await sb.from('concepts').insert({
        user_id:uid,name,data:conceptData,
        stage:stageOrder.indexOf(cur)+1||1,status:source==='ai'?'active':'draft'
      }).select().single();
      if(error)throw error;
      window._currentConceptId=data.id;
      window._currentConceptName=name;
      logAction('concept_create','concept',data.id,{name,source});
      await loadConcepts();
      toast('✓ «'+name+'» сохранена','gn');
      return data.id;
    }catch(e){
      console.error('[concept save]',e);
      toast('Ошибка БД: '+e.message,'rd');
    }
  }
  // Fallback: localStorage
  const id='local_'+Date.now();
  const concepts=JSON.parse(localStorage.getItem('svita_concepts_fallback')||'[]');
  concepts.unshift({id,user_id:uid,name,data:conceptData,status:'draft',stage:1,created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
  localStorage.setItem('svita_concepts_fallback',JSON.stringify(concepts));
  window._currentConceptId=id;
  window._currentConceptName=name;
  toast('✓ «'+name+'» сохранена (локально)','gn');
  await loadConcepts();
  return id;
}

async function loadConceptById(id){
  if(!sb){toast('Нет подключения к БД','rd');return}
  const{data,error}=await sb.from('concepts').select('*').eq('id',id).single();
  if(error||!data){toast('Концепция не найдена','rd');return}
  hydrateWorkspace(data.data||{});
  window._currentConceptId=id;
  window._currentConceptName=data.name;
  updateBizUI();
  logAction('concept_load','concept',id,{name:data.name});
  nav('overview');
  buildSidebar();renderAll();recalc();
  toast('Загружена: '+data.name,'gn');
}

async function saveCurrentConcept(){
  const id=window._currentConceptId;
  if(!id||!sb||!currentUser)return;
  const conceptData=serializeWorkspace();
  const si=stageOrder.indexOf(cur);
  await sb.from('concepts').update({data:conceptData,stage:si>=0?si+1:1,updated_at:new Date().toISOString()}).eq('id',id);
  logAction('concept_save','concept',id);
}

async function duplicateConcept(id){
  if(!sb||!currentUser)return;
  const{data:orig}=await sb.from('concepts').select('name,data,stage').eq('id',id).single();
  if(!orig)return;
  await sb.from('concepts').insert({user_id:currentUser.id,name:orig.name+' (копия)',data:orig.data,stage:orig.stage});
  logAction('concept_duplicate','concept',id);
  await loadConcepts();
  toast('Копия создана','gn');
}

async function deleteConcept(id){
  const cp=userConcepts.find(c=>c.id===id);
  if(!cp)return;
  if(!confirm('Удалить концепцию «'+cp.name+'»?'))return;
  await sb.from('concepts').delete().eq('id',id);
  if(window._currentConceptId===id){window._currentConceptId=null;window._currentConceptName=null}
  logAction('concept_delete','concept',id,{name:cp.name});
  await loadConcepts();
  toast('Удалена','rd');
}

async function saveAccountProfile(){
  if(!sb||!currentUser)return;
  const name=document.getElementById('acc_name').value.trim();
  const phone=document.getElementById('acc_phone').value.trim();
  const company=document.getElementById('acc_company').value.trim();
  const city=document.getElementById('acc_city').value.trim();
  if(!name){alert('Имя обязательно');return}
  currentUser.name=name;currentUser.phone=phone;currentUser.company=company;currentUser.city=city;
  await sb.from('profiles').upsert({email:currentUser.email,display_name:name,phone,company,city,last_login:new Date().toISOString()},{onConflict:'email'});
  await sb.auth.updateUser({data:{name}});
  updateTopUser();
  const _sa3=document.getElementById('sideAvatar');if(_sa3)_sa3.textContent=name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
  const _sn3=document.getElementById('sideName');if(_sn3)_sn3.textContent=name;
  logAction('profile_update','profile',null,{name,phone,company,city});
  // Visual feedback
  const btn=document.querySelector('#sec-account .ch .btn.gn');
  if(btn){const old=btn.textContent;btn.textContent='✓ Сохранено';setTimeout(()=>btn.textContent=old,2000)}
}

function showChangePassword(){
  const html=`<div class="modal-field"><label>Текущий пароль</label><input id="mf_curPass" type="password" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Новый пароль</label><input id="mf_newPass" type="password" placeholder="Минимум 8 символов" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Повторите новый</label><input id="mf_newPass2" type="password" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>`;
  document.getElementById('modalTitle').textContent='Смена пароля';
  document.getElementById('modalFields').innerHTML=html;
  document.getElementById('modalSave').style.display='';
  document.getElementById('modalSave').textContent='Сменить';
  document.getElementById('modalSave').onclick=async()=>{
    const np=document.getElementById('mf_newPass').value;
    const np2=document.getElementById('mf_newPass2').value;
    if(np.length<8){alert('Минимум 8 символов');return}
    if(np!==np2){alert('Пароли не совпадают');return}
    const{error}=await sb.auth.updateUser({password:np});
    if(error){alert(error.message);return}
    logAction('password_change','auth');
    closeModal();
    alert('Пароль изменён');
  };
  document.getElementById('modalBg').classList.add('vis');
}

async function confirmDeleteAccount(){
  if(!confirm('ВНИМАНИЕ! Все ваши данные, концепции и настройки будут безвозвратно удалены. Продолжить?'))return;
  if(!confirm('Вы абсолютно уверены? Это действие НЕЛЬЗЯ отменить.'))return;
  // Delete user data
  if(sb&&currentUser.id){
    await sb.from('concepts').delete().eq('user_id',currentUser.id);
    await sb.from('subscriptions').delete().eq('user_id',currentUser.id);
    await sb.from('profiles').delete().eq('email',currentUser.email);
  }
  logAction('account_delete','auth');
  logout();
}

async function loadAuditLog(){
  if(!sb||!currentUser)return;
  const el=document.getElementById('auditLogList');
  el.innerHTML='<div style="text-align:center;padding:8px;font-size:11px;color:var(--tx3)">Загрузка...</div>';
  const{data}=await sb.from('audit_logs').select('action,entity_type,metadata,created_at').eq('user_id',currentUser.id).order('created_at',{ascending:false}).limit(50);
  if(!data||!data.length){el.innerHTML='<div style="text-align:center;padding:16px;font-size:12px;color:var(--tx3)">Нет записей</div>';return}
  const actionNames={login:'Вход',logout:'Выход',concept_create:'Создание концепции',concept_load:'Загрузка концепции',concept_save:'Сохранение',concept_delete:'Удаление концепции',concept_duplicate:'Дублирование',profile_update:'Обновление профиля',password_change:'Смена пароля',account_delete:'Удаление аккаунта',payment_success:'Оплата'};
  let html='';
  data.forEach(l=>{
    const date=new Date(l.created_at).toLocaleString('ru');
    const name=actionNames[l.action]||l.action;
    const meta=l.metadata?.name?(' — '+esc(l.metadata.name)):'';
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--bd);font-size:11px"><span style="color:var(--tx3);min-width:120px;flex-shrink:0">${date}</span><span style="font-weight:600;color:var(--tx)">${name}</span><span style="color:var(--tx2)">${meta}</span></div>`;
  });
  el.innerHTML=html;
}

// Auto-save concept every 2 minutes
if(window._conceptAutoSaveId)clearInterval(window._conceptAutoSaveId);
window._conceptAutoSaveId=setInterval(()=>{if(window._currentConceptId&&document.getElementById('appContainer').style.display!=='none')saveCurrentConcept()},120000);

function showUpgradeModal(){
  document.getElementById('topUser').classList.remove('open');
  const html=`<div style="text-align:center;padding:8px 0 16px">
<div style="font-size:24px;margin-bottom:8px">&#9889;</div>
<div style="font-size:14px;font-weight:700;color:var(--tx);margin-bottom:4px">Тарифные планы SVITA</div>
<div style="font-size:11px;color:var(--tx3);margin-bottom:16px">Выберите подходящий план для вашего проекта</div>
<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:left">
<div style="padding:12px;border:1px solid var(--bd);border-radius:10px;background:var(--sf2);display:flex;flex-direction:column">
<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.5px">Trial</div>
<div style="font-size:18px;font-weight:800;color:var(--tx);margin:4px 0">Бесплатно</div>
<div style="font-size:10px;color:var(--tx3);line-height:1.5;flex:1">1 концепция<br>Базовые функции<br>Без подрядчиков</div>
<button onclick="selectPlan('trial')" style="margin-top:10px;width:100%;padding:8px;border-radius:8px;border:1px solid var(--bd);background:var(--sf);color:var(--tx2);font-size:11px;font-weight:600;cursor:pointer;font-family:var(--f);transition:all .15s" onmouseover="this.style.background='var(--sf2)'" onmouseout="this.style.background='var(--sf)'">${userSubscription.plan==='trial'?'✓ Текущий':'Выбрать'}</button>
</div>
<div style="padding:12px;border:2px solid var(--ac);border-radius:10px;background:var(--acbg);display:flex;flex-direction:column">
<div style="font-size:11px;font-weight:700;color:var(--ac2);text-transform:uppercase;letter-spacing:.5px">Pro</div>
<div style="font-size:18px;font-weight:800;color:var(--tx);margin:4px 0">99 PLN<span style="font-size:10px;color:var(--tx3)">/мес</span></div>
<div style="font-size:10px;color:var(--tx3);line-height:1.5;flex:1">5 концепций<br>Полный прайс-лист<br>Без подрядчиков</div>
<button onclick="selectPlan('pro')" style="margin-top:10px;width:100%;padding:8px;border-radius:8px;border:none;background:var(--ac);color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--f);transition:all .15s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">${userSubscription.plan==='pro'?'✓ Текущий':'Перейти на Pro'}</button>
</div>
<div style="padding:12px;border:2px solid #c9a96e;border-radius:10px;background:rgba(201,169,110,.08);display:flex;flex-direction:column">
<div style="font-size:11px;font-weight:700;color:#c9a96e;text-transform:uppercase;letter-spacing:.5px">Unlimited</div>
<div style="font-size:18px;font-weight:800;color:var(--tx);margin:4px 0">299 PLN<span style="font-size:10px;color:var(--tx3)">/мес</span></div>
<div style="font-size:10px;color:var(--tx3);line-height:1.5;flex:1">∞ концепций<br>Все функции<br>Подрядчики и КП</div>
<button onclick="selectPlan('unlimited')" style="margin-top:10px;width:100%;padding:8px;border-radius:8px;border:none;background:linear-gradient(135deg,#c9a96e,#e8c97a);color:#000;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--f);transition:all .15s" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='none'">${userSubscription.plan==='unlimited'?'✓ Текущий':'Перейти на Unlimited'}</button>
</div>
</div>
</div>`;
  document.getElementById('modalTitle').textContent='Тарифы';
  document.getElementById('modalFields').innerHTML=html;
  document.getElementById('modalSave').style.display='none';
  document.getElementById('modalBg').classList.add('vis');
}

async function selectPlan(plan){
  const planNames={trial:'Trial',pro:'Pro',unlimited:'Unlimited'};
  if(plan===userSubscription.plan){closeModal();return}
  if(plan!=='trial'){
    // Платные тарифы заблокированы до подключения оплаты
    alert('Оплата тарифа '+planNames[plan]+' будет доступна позже. Пока доступен пробный план.');
    return;
  }
  closeModal();
  if(typeof renderAccount==='function')renderAccount();
  if(typeof renderPlanDetails==='function')renderPlanDetails();
  buildSidebar();
}

