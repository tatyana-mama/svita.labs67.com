// ═══════════════ RENOVATIONS (Tab 2) ═══════════════
function toggleCustomRenForm(){
  const f=document.getElementById('customRenForm');
  f.style.display=f.style.display==='none'?'block':'none';
}
function addCustomRen(){
  const name=document.getElementById('crName').value.trim();
  if(!name)return;
  const cat=document.getElementById('crCat').value||'Другое';
  const price=Math.max(0,parseFloat(document.getElementById('crPrice').value)||0);
  const val=parseFloat(document.getElementById('crVal').value)||0;
  const unit=document.getElementById('crUnit').value.trim();
  const id='custom_'+Date.now();
  DB.renovations.push({id,name,cat,price,unit:unit||'',baseVal:val||0,custom:true});
  DB.pickedRenovations[id]={qty:1,done:false};
  document.getElementById('crName').value='';
  document.getElementById('crPrice').value='';
  document.getElementById('crVal').value='';
  document.getElementById('crUnit').value='';
  document.getElementById('customRenForm').style.display='none';
  renderRenovationsCatalog();renderSelectedRenovations();recalc();
}
function togglePickRenovation(id){
  if(DB.pickedRenovations[id]){delete DB.pickedRenovations[id]}else{DB.pickedRenovations[id]={qty:1,done:false}}
  savePicked();renderRenovationsCatalog();renderSelectedRenovations();recalc();
}
function renSelQty(id,d){
  if(!DB.pickedRenovations[id])return;
  DB.pickedRenovations[id].qty=Math.max(1,(DB.pickedRenovations[id].qty||1)+d);
  savePicked();renderSelectedRenovations();recalc();
}
function toggleRenDone(id){
  if(!DB.pickedRenovations[id])return;
  DB.pickedRenovations[id].done=!DB.pickedRenovations[id].done;
  savePicked();renderSelectedRenovations();recalc();
}
function renderRenovationsCatalog(){
  const c=document.getElementById('renCatalogCards');
  if(!c)return;
  const openCats=new Set();
  c.querySelectorAll('[id^="renCatDBBody"]').forEach(el=>{if(el.style.display!=='none')openCats.add(el.id.replace('renCatDBBody',''))});
  const cats={};
  DB.renovations.forEach(r=>{
    const cat=r.cat||'Другое';
    if(!cats[cat])cats[cat]=[];
    cats[cat].push(r);
  });
  const catIcons={'Электрика':'&#9889;','Водоснабжение и канализация':'&#128167;','Вентиляция и кондиционирование':'&#127744;','Видеонаблюдение и безопасность':'&#128249;','Отделка и строительные работы':'&#127959;','Двери, окна, фасад':'&#128682;','IT-инфраструктура':'&#128421;','Медицинские коммуникации':'&#127973;','Мебель и встроенные конструкции':'&#129681;','Уборка и санитария':'&#129529;','Вывеска и навигация':'&#128276;','Доступность':'&#9855;','Противопожарная безопасность':'&#128293;'};
  const catKeys=Object.keys(cats);
  let html='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">';
  catKeys.forEach((cat,ci)=>{
    const items=cats[cat];
    const pickedCnt=items.filter(r=>!!DB.pickedRenovations[r.id]).length;
    const icon=catIcons[cat]||'&#128736;';
    const isOpen=openCats.has(String(ci));
    html+=`<div class="c" style="margin:0">`;
    html+=`<div class="ch" style="cursor:pointer;user-select:none" onclick="toggleRenCatDB(${ci})"><div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0"><span style="font-size:16px">${icon}</span><div style="min-width:0"><h3 style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${cat}</h3><div style="font-size:10px;color:${pickedCnt?'var(--gn)':'var(--tx3)'};font-weight:600">${pickedCnt} / ${items.length} добавлено</div></div></div><span id="renCatDBArrow${ci}" style="font-size:10px;color:var(--tx3);transition:transform .2s;transform:rotate(${isOpen?'90':'0'}deg)">&#9654;</span></div>`;
    html+=`<div id="renCatDBBody${ci}" style="display:${isOpen?'block':'none'};border-top:1px solid var(--bd)">`;
    items.forEach(r=>{
      const picked=!!DB.pickedRenovations[r.id];
      html+=`<div class="ci" style="padding:8px 12px;display:flex;align-items:center;gap:8px;${picked?'background:var(--acbg)':''}"><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:${picked?'600':'400'}">${r.name}</div><div style="font-size:10px;color:var(--ac2)">${r.price.toLocaleString('ru')} PLN</div></div><button class="btn sm ${picked?'gn':'pr'}" style="flex-shrink:0;min-width:100px;font-size:10px" onclick="togglePickRenovation('${r.id}')">${picked?'✓ Добавлено':'+ В модернизацию'}</button></div>`;
    });
    html+='</div></div>';
  });
  html+='</div>';
  c.innerHTML=html;
}
function renderRenServices(){
  const c=document.getElementById('renServiceCards');
  if(!c)return;
  const openCats=new Set();
  c.querySelectorAll('[id^="renSvcBody"]').forEach(el=>{if(el.style.display!=='none')openCats.add(el.id.replace('renSvcBody',''))});
  const groups={};
  DB.services.forEach(s=>{const cat=s.category||'Другое';if(!groups[cat])groups[cat]=[];groups[cat].push(s)});
  const catKeys=Object.keys(groups);
  if(!catKeys.length){c.innerHTML='<div style="padding:12px;text-align:center;font-size:11px;color:var(--tx3)">Загрузка...</div>';return}
  let html='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">';
  catKeys.forEach((cat,ci)=>{
    const items=groups[cat];
    const pickedCnt=items.filter(s=>!!DB.pickedServices[s.id]).length;
    const isOpen=openCats.has(String(ci));
    html+=`<div class="c" style="margin:0"><div class="ch" style="cursor:pointer;user-select:none" onclick="toggleRenSvcCat(${ci})"><div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0"><span style="font-size:16px">&#129657;</span><div style="min-width:0"><h3 style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(cat)}</h3><div style="font-size:10px;color:${pickedCnt?'var(--gn)':'var(--tx3)'};font-weight:600">${pickedCnt} / ${items.length}</div></div></div><span id="renSvcArrow${ci}" style="font-size:10px;color:var(--tx3);transition:transform .2s;transform:rotate(${isOpen?'90':'0'}deg)">&#9654;</span></div>`;
    html+=`<div id="renSvcBody${ci}" style="display:${isOpen?'block':'none'};border-top:1px solid var(--bd)">`;
    items.forEach(s=>{
      const picked=!!DB.pickedServices[s.id];
      html+=`<div class="ci" style="padding:8px 12px;display:flex;align-items:center;gap:8px;${picked?'background:var(--acbg)':''}"><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:${picked?'600':'400'}">${esc(s.name)}</div><div style="font-size:10px;color:var(--ac2)">${(s.price||0).toLocaleString('ru')} PLN · ${s.time||''}</div></div><button class="btn sm ${picked?'gn':'pr'}" style="flex-shrink:0;min-width:100px;font-size:10px" onclick="togglePickSvc('${s.id}')">${picked?'✓ Добавлено':'+ В перечень'}</button></div>`;
    });
    html+='</div></div>';
  });
  html+='</div>';
  c.innerHTML=html;
}
function toggleRenSvcCat(i){const b=document.getElementById('renSvcBody'+i);const a=document.getElementById('renSvcArrow'+i);if(!b)return;const open=b.style.display!=='none';b.style.display=open?'none':'block';if(a)a.style.transform=open?'rotate(0deg)':'rotate(90deg)'}
function togglePickSvc(id){if(DB.pickedServices[id]){delete DB.pickedServices[id]}else{DB.pickedServices[id]={qty:1}};savePicked();renderServices();renderSelectedServices();renderRenServices();recalc()}
function toggleRenCatDB(i){
  const b=document.getElementById('renCatDBBody'+i);
  const a=document.getElementById('renCatDBArrow'+i);
  if(!b)return;
  const open=b.style.display!=='none';
  b.style.display=open?'none':'block';
  if(a)a.style.transform=open?'rotate(0deg)':'rotate(90deg)';
}
function getRenDisplayName(r,p){
  const val=p&&p.customVal!=null?p.customVal:(r.baseVal||'');
  const unit=r.unit||'';
  return val?r.name+' — '+val+' '+unit:r.name;
}
function setRenVal(id,val){
  if(!DB.pickedRenovations[id])return;
  DB.pickedRenovations[id].customVal=Math.max(0,parseFloat(val)||0);
  renderSelectedRenovations();recalc();
}
// ── Renovation actions (sub-tasks) ──
function addRenAction(renId){
  const p=DB.pickedRenovations[renId];if(!p)return;
  if(!p.actions)p.actions=[];
  const nameEl=document.getElementById('raName_'+renId);
  const name=(nameEl?nameEl.value:'').trim();
  if(!name)return;
  p.actions.push({name,price:0,done:false});
  if(nameEl)nameEl.value='';
  savePicked();renderSelectedRenovations();recalc();
}
function removeRenAction(renId,ai){
  const p=DB.pickedRenovations[renId];if(!p||!p.actions)return;
  p.actions.splice(ai,1);
  savePicked();renderSelectedRenovations();recalc();
}
function toggleRenActionDone(renId,ai){
  const p=DB.pickedRenovations[renId];if(!p||!p.actions||!p.actions[ai])return;
  p.actions[ai].done=!p.actions[ai].done;
  savePicked();renderSelectedRenovations();recalc();
}
function setRenActionPrice(renId,ai,val){
  const p=DB.pickedRenovations[renId];if(!p||!p.actions||!p.actions[ai])return;
  p.actions[ai].price=Math.max(0,parseFloat(val)||0);
  savePicked();renderSelectedRenovations();recalc();
}
function getRenItemCost(id){
  const p=DB.pickedRenovations[id];if(!p)return 0;
  if(p.actions&&p.actions.length)return p.actions.reduce((s,a)=>s+a.price,0);
  const r=DB.renovations.find(x=>x.id===id);
  return(p.customPrice!=null?p.customPrice:(r?r.price:0))*(p.qty||1);
}
function toggleRenExpand(renId){
  const el=document.getElementById('renActions_'+renId);
  const arrow=document.getElementById('renArrow_'+renId);
  if(!el)return;
  const open=el.style.display==='none';
  el.style.display=open?'block':'none';
  if(arrow)arrow.style.transform=open?'rotate(90deg)':'rotate(0deg)';
}

function renderSelectedRenovations(){
  const c=document.getElementById('selectedRenCards');
  if(!c)return;
  const picked=DB.pickedRenovations||{};
  const pickedIds=Object.keys(picked);
  if(!pickedIds.length){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Добавьте работы из каталога</div>';document.getElementById('renCount').textContent='0';document.getElementById('renTotal').textContent='0';document.getElementById('renCats').textContent='0 категорий';document.getElementById('renDone').textContent='0';return}
  const groups={};
  let totalCost=0,doneCount=0;
  pickedIds.forEach(id=>{
    const r=DB.renovations.find(x=>x.id===id);if(!r)return;
    const cat=r.cat||'Другое';
    if(!groups[cat])groups[cat]=[];
    const p=picked[id];
    const actions=p.actions||[];
    const itemCost=getRenItemCost(id);
    totalCost+=itemCost;
    const allDone=actions.length?actions.every(a=>a.done):!!p.done;
    if(allDone&&actions.length)doneCount++;
    else if(p.done&&!actions.length)doneCount++;
    groups[cat].push({...r,actions,itemCost,allDone,p});
  });
  let html='';
  Object.keys(groups).forEach(cat=>{
    const items=groups[cat];
    const catTotal=items.reduce((s,r)=>s+r.itemCost,0);
    html+=`<div class="c"><div class="ch"><h3 style="font-size:12px">${cat}</h3><span style="font-size:10px;color:var(--gn);font-weight:600">${items.length} работ · ${catTotal.toLocaleString('ru')} PLN</span></div><div class="cb">`;
    items.forEach(r=>{
      const actCnt=r.actions.length;
      const actDone=r.actions.filter(a=>a.done).length;
      const pct=actCnt?Math.round(actDone/actCnt*100):0;
      const costColor=r.itemCost>0?'var(--gn)':'var(--tx3)';
      // Header row — clickable to expand
      html+=`<div style="border-bottom:1px solid var(--bd)">`;
      html+=`<div style="display:flex;align-items:center;gap:8px;padding:10px 12px;cursor:pointer" onclick="toggleRenExpand('${r.id}')">`;
      html+=`<span id="renArrow_${r.id}" style="font-size:10px;color:var(--tx3);transition:transform .2s;transform:rotate(0deg);flex-shrink:0">&#9654;</span>`;
      html+=`<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;${r.allDone?'text-decoration:line-through;opacity:.5':''}">${esc(r.name)}</div>`;
      if(actCnt){
        html+=`<div style="display:flex;align-items:center;gap:6px;margin-top:4px"><div style="flex:1;max-width:120px;height:3px;background:var(--bd);border-radius:2px;overflow:hidden"><div style="width:${pct}%;height:100%;background:var(--gn);border-radius:2px"></div></div><span style="font-size:9px;color:var(--tx3)">${actDone}/${actCnt}</span></div>`;
      }
      html+=`</div><div style="text-align:right;flex-shrink:0"><div style="font-size:14px;font-weight:700;color:${costColor}">${r.itemCost.toLocaleString('ru')} PLN</div><div style="font-size:9px;color:var(--tx3)">${actCnt} действий</div></div><button class="btn sm" style="color:var(--rd);padding:2px 6px;flex-shrink:0" onclick="event.stopPropagation();togglePickRenovation('${r.id}')">&#10005;</button></div>`;
      // Expandable actions panel
      html+=`<div id="renActions_${r.id}" style="display:none;padding:0 12px 10px;background:var(--sf)">`;
      r.actions.forEach((a,ai)=>{
        html+=`<div style="display:flex;align-items:center;gap:6px;padding:5px 0;border-bottom:1px solid var(--bd);${a.done?'opacity:.5':''}">`;
        html+=`<input type="checkbox" ${a.done?'checked':''} onchange="toggleRenActionDone('${r.id}',${ai})" style="flex-shrink:0">`;
        html+=`<div style="flex:1;font-size:11px;${a.done?'text-decoration:line-through':''}">${esc(a.name)}</div>`;
        html+=`<div style="display:flex;align-items:center;gap:2px;flex-shrink:0"><input type="number" value="${a.price}" onchange="setRenActionPrice('${r.id}',${ai},this.value)" style="width:60px;font-size:11px;font-weight:600;color:var(--ac2);text-align:right;border:1px solid var(--bd);border-radius:4px;padding:2px 4px;background:var(--bg)"><span style="font-size:9px;color:var(--tx3)">PLN</span></div>`;
        html+=`<button onclick="removeRenAction('${r.id}',${ai})" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:12px;padding:2px">&#10005;</button>`;
        html+=`</div>`;
      });
      // Add new action input
      html+=`<div style="display:flex;align-items:center;gap:6px;padding:8px 0"><input id="raName_${r.id}" type="text" placeholder="Новое действие..." onkeydown="if(event.key==='Enter')addRenAction('${r.id}')" style="flex:1;font-size:11px;border:1px solid var(--bd);border-radius:6px;padding:6px 8px;background:var(--bg);color:var(--tx)"><button class="btn sm gn" onclick="addRenAction('${r.id}')" style="padding:4px 10px;font-size:10px">+ Добавить</button></div>`;
      html+=`</div></div>`;
    });
    html+='</div></div>';
  });
  c.innerHTML=html;
  document.getElementById('renCount').textContent=pickedIds.length;
  document.getElementById('renTotal').textContent=totalCost.toLocaleString('ru');
  document.getElementById('renCats').textContent=Object.keys(groups).length+' категорий';
  document.getElementById('renDone').textContent=doneCount;
}

// Render picked items inside tabs
// ═══ ДОКУМЕНТАЦИЯ (sec-docs) ═══
const DOC_CATS=['Регистрация компании','Медицинская регистрация (RPWDL)','Санэпиднадзор (PSSE)','Пожарная безопасность','Помещение и строительство','Защита данных (RODO)','Отходы и экология (BDO)','Страхование','НФЗ / Частная практика','Персонал и лицензии','Оборудование и сертификация','Радиационная безопасность (RTG)','Фармацевтика и препараты','Доступность','Прочее'];
const ADMIN_DOC_ITEMS=[
{cat:'Регистрация компании',name:'Регистрация ООО в KRS',desc:'Судебный реестр (KRS) — акт нотариуса, устав, подача',price:1500,required:true},
{cat:'Регистрация компании',name:'Запись в CEIDG (для ИП)',desc:'Центральный реестр — альтернатива KRS, бесплатно онлайн',price:0,required:false},
{cat:'Регистрация компании',name:'NIP — налоговый номер',desc:'Выдаётся налоговой автоматически при регистрации',price:0,required:true},
{cat:'Регистрация компании',name:'REGON — статистический номер',desc:'Выдаётся ГУС автоматически',price:0,required:true},
{cat:'Регистрация компании',name:'VAT-R — регистрация НДС',desc:'Подача в налоговую. Стоматология может быть освобождена от НДС',price:170,required:true},
{cat:'Регистрация компании',name:'Расчётный счёт',desc:'Банковский счёт + терминал. Обязательно для ООО',price:200,required:true},
{cat:'Регистрация компании',name:'Печать компании',desc:'Круглая печать с NIP, REGON, названием и адресом',price:120,required:true},
{cat:'Регистрация компании',name:'Бухгалтерские услуги (год)',desc:'Бухгалтерское бюро — обязательное ведение бухгалтерии',price:12000,required:true},
{cat:'Медицинская регистрация (RPWDL)',name:'Запись в RPWDL',desc:'Реестр медицинских учреждений. Через воеводу',price:500,required:true},
{cat:'Медицинская регистрация (RPWDL)',name:'Организационный регламент',desc:'Структура клиники, виды услуг, права пациентов',price:2000,required:true},
{cat:'Медицинская регистрация (RPWDL)',name:'Медицинский руководитель',desc:'Врач с мин. 5 лет стажа. Подаётся в RPWDL',price:0,required:true},
{cat:'Медицинская регистрация (RPWDL)',name:'Декларация соответствия условиям',desc:'Декларация соответствия помещения и оборудования',price:0,required:true},
{cat:'Медицинская регистрация (RPWDL)',name:'Юридическая консультация RPWDL',desc:'Юрист по медицинскому праву — подготовка документов',price:3000,required:false},
{cat:'Санэпиднадзор (PSSE)',name:'Технологический проект кабинета',desc:'Архитектурный план: зоны, потоки, вентиляция, водоснабжение',price:6000,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Санитарное заключение PSSE',desc:'Инспекция помещения перед открытием. Без этого нельзя RPWDL',price:0,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Анализ воды',desc:'Бактериология, химия. Аккредитованная лаборатория. Раз в год',price:800,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Анализ воздуха',desc:'Чистота воздуха в кабинетах. Обязательно при кондиционировании',price:700,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Программа гигиены PPC',desc:'Процедуры мытья, дезинфекции, стерилизации по зонам',price:3500,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Договор на стирку мед. одежды',desc:'Профессиональная прачечная с сертификатом',price:500,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Договор ДДД (дезинсекция)',desc:'Периодическая обработка от насекомых и грызунов',price:1200,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Журнал санитарного контроля',desc:'Журнал для фиксации проверок санэпиднадзора',price:50,required:true},
{cat:'Санэпиднадзор (PSSE)',name:'Проверка вентиляции',desc:'Ежегодный протокол эффективности вентиляции',price:1500,required:true},
{cat:'Пожарная безопасность',name:'Инструкция пожарной безопасности',desc:'Обязательна для помещений >1000 м³ или >50 человек',price:2500,required:true},
{cat:'Пожарная безопасность',name:'Проверка огнетушителей',desc:'Ежегодный осмотр. Мин. 1 огнетушитель на 100 м²',price:500,required:true},
{cat:'Пожарная безопасность',name:'Эвакуационная разметка',desc:'Фотолюминесцентные знаки, план эвакуации, аварийное освещение',price:1500,required:true},
{cat:'Пожарная безопасность',name:'Обучение пожарной безопасности',desc:'Обучение персонала пожарной безопасности. Раз в год',price:800,required:true},
{cat:'Пожарная безопасность',name:'Приёмка пожарной охраны',desc:'Инспекция при смене назначения помещения',price:0,required:false},
{cat:'Помещение и строительство',name:'Договор аренды (нотариальный)',desc:'Нотариальное заверение для RPWDL. Мин. 5-10 лет',price:1500,required:true},
{cat:'Помещение и строительство',name:'Изменение назначения помещения',desc:'Если помещение не было медицинским — строительный надзор',price:2000,required:false},
{cat:'Помещение и строительство',name:'Разрешение на строительство',desc:'При перепланировке / изменении несущих конструкций',price:500,required:false},
{cat:'Помещение и строительство',name:'Строительный проект адаптации',desc:'Проект перепланировки: электрика, вода, вентиляция',price:15000,required:true},
{cat:'Помещение и строительство',name:'Технический приём',desc:'Протокол от руководителя стройки после ремонта',price:2000,required:true},
{cat:'Помещение и строительство',name:'Проверка электроустановки',desc:'Заземление, изоляция, УЗО. Протокол от электрика',price:1500,required:true},
{cat:'Помещение и строительство',name:'Протокол дымохода/вентиляции',desc:'Проверка вентиляции, дымоходов. Ежегодный',price:500,required:true},
{cat:'Помещение и строительство',name:'Энергетический сертификат',desc:'С 2023 обязателен при аренде',price:800,required:false},
{cat:'Защита данных (RODO)',name:'Политика защиты данных',desc:'Реестр процессов, DPIA для медданных, политика конфиденциальности',price:3000,required:true},
{cat:'Защита данных (RODO)',name:'Инспектор защиты данных (IOD)',desc:'Обязателен для медучреждений (ст. 9 RODO)',price:4000,required:true},
{cat:'Защита данных (RODO)',name:'Реестр операций обработки данных',desc:'Ст. 30 RODO. Список всех процессов обработки данных',price:0,required:true},
{cat:'Защита данных (RODO)',name:'Договоры поручения данных',desc:'С лабораториями, IT, бухгалтерией, облачными сервисами',price:1500,required:true},
{cat:'Защита данных (RODO)',name:'Обучение RODO',desc:'Ежегодное обучение персонала с протоколом',price:1000,required:true},
{cat:'Защита данных (RODO)',name:'IT-система по RODO',desc:'Шифрование, контроль доступа, бэкапы, логирование',price:5000,required:true},
{cat:'Защита данных (RODO)',name:'Уведомление в UODO',desc:'При назначении IOD — уведомление в орган защиты данных',price:0,required:true},
{cat:'Отходы и экология (BDO)',name:'Запись в BDO',desc:'База данных об отходах. Обязателен для медотходов',price:0,required:true},
{cat:'Отходы и экология (BDO)',name:'Договор на вывоз мед. отходов',desc:'Инфекционные отходы, амальгама, RTG-отходы',price:6000,required:true},
{cat:'Отходы и экология (BDO)',name:'Контейнеры для отходов',desc:'Красные (инфекционные), жёлтые (острые), чёрные (прочие)',price:2000,required:true},
{cat:'Отходы и экология (BDO)',name:'Учёт отходов (год)',desc:'Карты передачи, годовой отчёт до 15 марта',price:500,required:true},
{cat:'Отходы и экология (BDO)',name:'Сепаратор амальгамы',desc:'Обязателен с 2019 (EU 2017/852). ISO 11143, >95%',price:4000,required:true},
{cat:'Страхование',name:'ОС медучреждения',desc:'Обязательное: мин. 75 000 EUR/событие, 350 000 EUR/год',price:5000,required:true},
{cat:'Страхование',name:'ОС стоматолога',desc:'Индивидуальный полис для каждого врача. Мин. 75 000 EUR',price:2500,required:true},
{cat:'Страхование',name:'Страхование имущества',desc:'Оборудование, ремонт, запасы. Рекомендуется all-risk',price:3000,required:false},
{cat:'Страхование',name:'Страхование от потери дохода',desc:'Покрытие простоя: пожар, затопление, эпидемия',price:2000,required:false},
{cat:'Страхование',name:'ОС работодателя',desc:'Несчастные случаи на производстве',price:1500,required:false},
{cat:'Страхование',name:'Киберстрахование',desc:'Утечки медданных, ransomware, штрафы RODO',price:2000,required:false},
{cat:'НФЗ / Частная практика',name:'Прейскурант услуг (обязательный)',desc:'Прейскурант вывешен в приёмной — по закону о мед. деятельности',price:500,required:true},
{cat:'НФЗ / Частная практика',name:'Контракт с НФЗ',desc:'Конкурсная процедура. Для частной клиники необязателен',price:3000,required:false},
{cat:'НФЗ / Частная практика',name:'eWUŚ — система расчётов НФЗ',desc:'Только при контракте с НФЗ',price:2000,required:false},
{cat:'НФЗ / Частная практика',name:'Электронная мед. документация (EDM)',desc:'Обязательна с 2021. P1, э-рецепт, э-направление',price:5000,required:true},
{cat:'НФЗ / Частная практика',name:'Доступ к P1/P2',desc:'Платформа э-здоровье. Сертификат ZUS, доверенный профиль',price:0,required:true},
{cat:'НФЗ / Частная практика',name:'Онлайн-касса',desc:'Обязательна для стоматологии с 01.07.2021',price:3500,required:true},
{cat:'НФЗ / Частная практика',name:'Информационная табличка',desc:'Название, адрес, NIP, часы работы, телефон, руководитель',price:500,required:true},
{cat:'Персонал и лицензии',name:'Право на врачебную деятельность (PWZ)',desc:'Окружная врачебная палата',price:0,required:true},
{cat:'Персонал и лицензии',name:'Членство в OIL',desc:'Членский взнос ~120 PLN/мес на врача',price:1440,required:true},
{cat:'Персонал и лицензии',name:'Медосмотры сотрудников',desc:'Первичные и периодические. Медицина труда',price:2500,required:true},
{cat:'Персонал и лицензии',name:'Санитарная книжка',desc:'Для контактирующих с пациентами',price:1500,required:true},
{cat:'Персонал и лицензии',name:'Вводный инструктаж по охране труда',desc:'До начала работы. Общий + на рабочем месте',price:800,required:true},
{cat:'Персонал и лицензии',name:'Периодический инструктаж по охране труда',desc:'Раз в 5 лет для мед., раз в 3 года для остальных',price:600,required:true},
{cat:'Персонал и лицензии',name:'Обучение первой помощи',desc:'Сертификат AED/BLS для мед. персонала',price:1200,required:true},
{cat:'Персонал и лицензии',name:'Трудовые договоры / Б2Б',desc:'Трудовые договоры, регламент труда и оплаты',price:2000,required:true},
{cat:'Персонал и лицензии',name:'Нострификация диплома',desc:'Для врачей с дипломом не из ЕС',price:3500,required:false},
{cat:'Оборудование и сертификация',name:'Технические паспорта оборудования',desc:'Паспорт + инструкция на польском для каждого устройства',price:0,required:true},
{cat:'Оборудование и сертификация',name:'Проверка автоклава (год)',desc:'Валидация стерилизации. Bowie-Dick, биологические тесты',price:2500,required:true},
{cat:'Оборудование и сертификация',name:'Поверка и калибровка',desc:'Автоклав, установка, компрессор, полимеризационная лампа',price:3000,required:true},
{cat:'Оборудование и сертификация',name:'Декларация соответствия CE',desc:'Маркировка CE обязательна. Проверить при покупке',price:0,required:true},
{cat:'Оборудование и сертификация',name:'ТО стоматологической установки (год)',desc:'Ежегодное обслуживание + калибровка',price:4000,required:true},
{cat:'Оборудование и сертификация',name:'ТО компрессора (год)',desc:'Безмасляный компрессор. Проверка раз в 6 мес + фильтры',price:1500,required:true},
{cat:'Оборудование и сертификация',name:'Журнал проверок оборудования',desc:'Журнал проверок для каждого устройства',price:200,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Разрешение PAA на рентген',desc:'Государственное агентство атомистики. Заявление/разрешение',price:500,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Проект радиологических экранов',desc:'Расчёты стен, пола, потолка. Медицинский физик',price:3000,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Инспектор радиационной защиты (IOR)',desc:'Обязательное назначение. Может быть внешний',price:3000,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Приёмочные испытания рентгена',desc:'Испытания нового аппарата. Медицинский физик',price:2000,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Специализированные тесты рентгена (год)',desc:'Ежегодные для поддержания разрешения',price:1500,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Персональные дозиметры',desc:'TLD-дозиметры. Считывание каждые 1-3 мес',price:1200,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Обучение радиологической защите',desc:'Для работающих с рентгеном. Обновление каждые 5 лет',price:1500,required:true},
{cat:'Радиационная безопасность (RTG)',name:'Таблицы доз и предупреждения',desc:'Знаки излучения, инструкции на стенах рентген-кабинета',price:300,required:true},
{cat:'Радиационная безопасность (RTG)',name:'CBCT/Панорама — 3D разрешение',desc:'Доп. разрешение PAA для CBCT. Усиленные экраны',price:5000,required:false},
{cat:'Фармацевтика и препараты',name:'Аптечка кабинета',desc:'Адреналин, атропин, гидрокортизон, глюкоза, AED',price:3000,required:true},
{cat:'Фармацевтика и препараты',name:'Учёт лекарств и анестетиков',desc:'Лидокаин, артикаин, мепивакаин — учёт, сроки годности',price:500,required:true},
{cat:'Фармацевтика и препараты',name:'Договор с фарм. складом',desc:'Закупки только из лицензированного склада',price:0,required:true},
{cat:'Фармацевтика и препараты',name:'Фарм. холодильник (с регистратором)',desc:'Фармацевтический холодильник 2-8°C. Ежедневная запись',price:2500,required:true},
{cat:'Фармацевтика и препараты',name:'Разрешение на седацию',desc:'N2O или внутривенная седация. Доп. требования + обучение',price:5000,required:false},
{cat:'Доступность',name:'Архитектурная доступность',desc:'Пандус/лифт, двери >90 см, WC для инвалидов',price:8000,required:true},
{cat:'Доступность',name:'Цифровая доступность',desc:'Сайт WCAG 2.1 AA. Рекомендуется для частных',price:3000,required:false},
{cat:'Доступность',name:'Информационная доступность',desc:'Пиктограммы, крупный шрифт, SMS/email для глухих',price:1500,required:false},
{cat:'Доступность',name:'Координатор по доступности',desc:'Обязательно для публичных. Рекомендуется при НФЗ',price:0,required:false},
{cat:'Доступность',name:'Индукционная петля',desc:'Для слабослышащих на ресепшн',price:2500,required:false},
{cat:'Прочее',name:'Вывеска + информационная табличка',desc:'Вывеска + данные. Согласование с управляющим здания',price:3000,required:true},
{cat:'Прочее',name:'Видеонаблюдение (по RODO)',desc:'В зале ожидания, коридорах (не в кабинетах!)',price:5000,required:false},
{cat:'Прочее',name:'Охранная сигнализация',desc:'Система охраны + охранная компания',price:3000,required:false},
{cat:'Прочее',name:'Домен + сайт',desc:'ZnanyLekarz, Google Business, регламент, RODO, прейскурант',price:5000,required:true},
{cat:'Прочее',name:'Телефон и интернет (год)',desc:'Мин. 100 Мбит/с + резерв LTE для EDM, э-рецепт, P1',price:3600,required:true},
{cat:'Прочее',name:'Медицинское ПО (год)',desc:'EDM, график, э-рецепты. Mediporta/Dental4Windows/KS-Medis',price:8000,required:true},
{cat:'Прочее',name:'Музыка в зале ожидания (ZAiKS)',desc:'Абонемент за музыку в публичном помещении',price:600,required:false},
{cat:'Прочее',name:'Ящик для жалоб',desc:'Ящик для жалоб — по закону о правах пациента',price:100,required:true},
];
// ═══ DOC CATALOG + PICK SYSTEM ═══
function togglePickDoc(idx){
  const key='doc_'+idx;
  if(DB.pickedDocs[key]){delete DB.pickedDocs[key]}
  else{const d=ADMIN_DOC_ITEMS[idx];DB.pickedDocs[key]={name:d.name,cat:d.cat,desc:d.desc,price:d.price,required:d.required,done:false,items:[]}}
  savePicked();renderDocCatalog();renderDocs();recalc();
}
function addCustomDoc(){
  const name=prompt('Название документа:');if(!name)return;
  const cat=prompt('Категория:','Прочее')||'Прочее';
  const price=Math.max(0,parseFloat(prompt('Стоимость (PLN):','0'))||0);
  const key='cdoc_'+Date.now();
  DB.pickedDocs[key]={name,cat,desc:'',price,required:false,done:false,items:[],custom:true};
  savePicked();renderDocCatalog();renderDocs();recalc();
}
function removePickedDoc(key){
  delete DB.pickedDocs[key];
  savePicked();renderDocCatalog();renderDocs();recalc();
}
function toggleDocDone(key){
  if(!DB.pickedDocs[key])return;
  DB.pickedDocs[key].done=!DB.pickedDocs[key].done;
  savePicked();renderDocs();recalc();
}
function addDocSubItem(key){
  if(!DB.pickedDocs[key])return;
  if(!DB.pickedDocs[key].items)DB.pickedDocs[key].items=[];
  DB.pickedDocs[key].items.push({name:'Новая позиция',price:0});
  savePicked();renderDocs();recalc();
}
function removeDocSubItem(key,idx){
  if(!DB.pickedDocs[key]||!DB.pickedDocs[key].items)return;
  DB.pickedDocs[key].items.splice(idx,1);
  savePicked();renderDocs();recalc();
}
function setDocSubName(key,idx,val){
  if(!DB.pickedDocs[key]||!DB.pickedDocs[key].items||!DB.pickedDocs[key].items[idx])return;
  DB.pickedDocs[key].items[idx].name=val;
  savePicked();
}
function setDocSubPrice(key,idx,val){
  if(!DB.pickedDocs[key]||!DB.pickedDocs[key].items||!DB.pickedDocs[key].items[idx])return;
  DB.pickedDocs[key].items[idx].price=Math.max(0,parseFloat(val)||0);
  savePicked();recalc();
}
function setDocBasePrice(key,val){
  if(!DB.pickedDocs[key])return;
  DB.pickedDocs[key].price=Math.max(0,parseFloat(val)||0);
  savePicked();recalc();
}
function getDocTotalCost(){
  let total=0;
  Object.values(DB.pickedDocs||{}).forEach(d=>{
    total+=d.price||0;
    (d.items||[]).forEach(it=>{total+=it.price||0});
  });
  return total;
}
function renderDocCatalog(){
  const c=document.getElementById('docCatalogCards');if(!c)return;
  // Save open category state before re-render
  const openCats=new Set();
  c.querySelectorAll('[id^="docCatDBBody"]').forEach(el=>{if(el.style.display!=='none')openCats.add(el.id.replace('docCatDBBody',''))});
  const groups={};
  ADMIN_DOC_ITEMS.forEach((d,i)=>{if(!groups[d.cat])groups[d.cat]=[];groups[d.cat].push({...d,idx:i})});
  let html='';
  const catKeys=Object.keys(groups);
  html+='<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px">';
  catKeys.forEach((cat,ci)=>{
    const items=groups[cat];
    const pickedCnt=items.filter(d=>!!DB.pickedDocs['doc_'+d.idx]).length;
    const isOpen=openCats.has(String(ci));
    html+=`<div class="c" style="margin:0">`;
    html+=`<div class="ch" style="cursor:pointer;user-select:none" onclick="toggleDocCatDB(${ci})"><div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0"><span style="font-size:16px">&#128203;</span><div style="min-width:0"><h3 style="font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(cat)}</h3><div style="font-size:10px;color:${pickedCnt?'var(--gn)':'var(--tx3)'};font-weight:600">${pickedCnt} / ${items.length} добавлено</div></div></div><span id="docCatDBArrow${ci}" style="font-size:10px;color:var(--tx3);transition:transform .2s;transform:rotate(${isOpen?'90':'0'}deg)">&#9654;</span></div>`;
    html+=`<div id="docCatDBBody${ci}" style="display:${isOpen?'block':'none'};border-top:1px solid var(--bd)">`;
    items.forEach(d=>{
      const picked=!!DB.pickedDocs['doc_'+d.idx];
      html+=`<div class="ci" style="padding:8px 12px;display:flex;align-items:center;gap:8px;${picked?'background:var(--acbg)':''}"><div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:${picked?'600':'400'}">${esc(d.name)}${d.required?'<span style="color:var(--rd);font-size:9px"> *</span>':''}</div><div style="font-size:10px;color:var(--tx3)">${esc(d.desc||'')}</div><div style="font-size:10px;color:var(--ac2)">${d.price.toLocaleString('ru')} PLN</div></div><button class="btn sm ${picked?'gn':'pr'}" style="flex-shrink:0;min-width:100px;font-size:10px" onclick="togglePickDoc(${d.idx})">${picked?'✓ Добавлено':'+ В документы'}</button></div>`;
    });
    html+='</div></div>';
  });
  html+='</div>';
  c.innerHTML=html;
}
function toggleDocCatDB(i){const b=document.getElementById('docCatDBBody'+i);const a=document.getElementById('docCatDBArrow'+i);if(!b)return;const open=b.style.display!=='none';b.style.display=open?'none':'block';if(a)a.style.transform=open?'rotate(0deg)':'rotate(90deg)'}
function renderDocs(){
  const c=document.getElementById('docCards');if(!c)return;
  const el=id=>document.getElementById(id);
  const keys=Object.keys(DB.pickedDocs||{});
  if(!keys.length){
    c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Добавьте документы из <a href="#" onclick="nav(\'db-docs\');return false" style="color:var(--ac2)">каталога</a></div>';
    if(el('docCount'))el('docCount').textContent='0';if(el('docDone'))el('docDone').textContent='0';if(el('docCostStat'))el('docCostStat').textContent='0';if(el('s7Total'))el('s7Total').textContent='0 PLN';if(el('docBar'))el('docBar').style.width='0%';return;
  }
  const groups={};let total=0,done=0;
  keys.forEach(key=>{
    const d=DB.pickedDocs[key];
    const cat=d.cat||'Прочее';
    if(!groups[cat])groups[cat]=[];
    groups[cat].push({key,...d});
    total+=d.price||0;
    (d.items||[]).forEach(it=>{total+=it.price||0});
    if(d.done)done++;
  });
  let html='';
  Object.keys(groups).forEach(cat=>{
    const g=groups[cat];
    const catCost=g.reduce((s,d)=>{let c=d.price||0;(d.items||[]).forEach(it=>{c+=it.price||0});return s+c},0);
    const req=g.some(d=>d.required);
    html+=`<div class="c"><div class="ch"><h3 style="font-size:13px">${esc(cat)}</h3>${req?'<span style="font-size:9px;color:var(--rd);font-weight:600">ОБЯЗАТЕЛЬНО</span>':''}<span style="font-size:10px;color:var(--gn);font-weight:600;margin-left:auto">${catCost.toLocaleString('ru')} PLN</span></div><div class="cb">`;
    g.forEach(d=>{
      const subTotal=(d.items||[]).reduce((s,it)=>s+(it.price||0),0);
      html+=`<div style="border-bottom:1px solid var(--bd);padding:10px 12px;${d.done?'opacity:.5':''}">
<div class="ci cost-row" style="padding:0">
<input type="checkbox" ${d.done?'checked':''} onchange="toggleDocDone('${d.key}')" style="flex-shrink:0">
<div class="ct" style="flex:1;min-width:0;font-size:11px;${d.done?'text-decoration:line-through':''}">${esc(d.name)}${d.required?'<span style="color:var(--rd);font-size:9px"> *</span>':''}${d.desc?'<div class="ct-sub" style="text-decoration:none">'+esc(d.desc)+'</div>':''}</div>
<div style="display:flex;align-items:center;gap:2px;flex-shrink:0"><input type="number" value="${d.price||0}" onchange="setDocBasePrice('${d.key}',this.value)" style="width:60px;font-size:11px;font-weight:700;color:var(--ac2);text-align:right;border:1px solid var(--bd);border-radius:4px;padding:2px 4px;background:var(--sf)"><span style="font-size:9px;color:var(--tx3)">PLN</span></div>
<button onclick="addDocSubItem('${d.key}')" style="background:none;border:none;color:var(--ac);cursor:pointer;font-size:14px;padding:2px;flex-shrink:0" title="Добавить строку">&#43;</button>
<button onclick="removePickedDoc('${d.key}')" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:12px;padding:2px;flex-shrink:0">&#10005;</button>
</div>`;
      // Sub-items
      if(d.items&&d.items.length){
        html+='<div style="margin-left:28px;margin-top:6px;display:flex;flex-direction:column;gap:4px">';
        d.items.forEach((it,idx)=>{
          html+=`<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:var(--sf2);border-radius:6px;border:1px solid var(--bd)">
<input value="${esc(it.name)}" onchange="setDocSubName('${d.key}',${idx},this.value)" style="flex:1;font-size:11px;border:none;background:transparent;color:var(--tx);font-family:var(--f);outline:none" placeholder="Описание позиции">
<input type="number" value="${it.price||0}" onchange="setDocSubPrice('${d.key}',${idx},this.value)" style="width:55px;font-size:11px;font-weight:600;color:var(--ac2);text-align:right;border:1px solid var(--bd);border-radius:4px;padding:2px 4px;background:var(--sf)">
<span style="font-size:9px;color:var(--tx3)">PLN</span>
<button onclick="removeDocSubItem('${d.key}',${idx})" style="background:none;border:none;color:var(--rd);cursor:pointer;font-size:10px;padding:2px">&#10005;</button>
</div>`;
        });
        html+='</div>';
      }
      html+='</div>';
    });
    html+='</div></div>';
  });
  c.innerHTML=html;
  if(el('docCount'))el('docCount').textContent=keys.length;
  if(el('docDone'))el('docDone').textContent=done;
  if(el('docCostStat'))el('docCostStat').textContent=total.toLocaleString('ru');
  if(el('s7Total'))el('s7Total').textContent=total.toLocaleString('ru')+' PLN';
  const pct=keys.length?Math.round(done/keys.length*100):0;
  if(el('docBar'))el('docBar').style.width=pct+'%';
}

function renderPickedRooms(){
  const c=document.getElementById('pickedRoomsCards');
  if(!c)return;
  const ids=Object.keys(DB.pickedRooms);
  if(!ids.length){c.innerHTML='<div style="padding:12px;text-align:center;font-size:11px;color:var(--tx3)">Добавьте комнаты из БД Помещений</div>';return}
  let html='';
  ids.forEach(id=>{
    const r=DB.rooms.find(x=>x.id===id);
    if(!r)return;
    html+=`<div class="ci cost-row"><div class="ct" style="flex:1">${r.name}<div class="ct-sub">${r.type} · ${r.area} м²</div></div><button class="btn sm" style="color:var(--rd)" onclick="togglePick('pickedRooms','${r.id}','rooms')">✕</button></div>`;
  });
  c.innerHTML=html;
}
function renderPickedContractors(){
  const c=document.getElementById('pickedContractorCards');
  if(!c)return;
  const ids=Object.keys(DB.pickedContractors);
  if(!ids.length){c.innerHTML='<div style="padding:12px;text-align:center;font-size:11px;color:var(--tx3)">Назначьте подрядчиков из БД</div>';return}
  let html='';
  ids.forEach(id=>{
    const r=DB.contractors.find(x=>x.id===id);
    if(!r)return;
    html+=`<div class="ci cost-row"><div class="ct" style="flex:1">${r.name}<div class="ct-sub">${r.spec} · ${r.city} · ${r.price}</div></div><button class="btn sm" style="color:var(--rd)" onclick="togglePick('pickedContractors','${r.id}','contractors')">✕</button></div>`;
  });
  c.innerHTML=html;
}

// Zone colors for dynamic categories
const ZONE_COLORS=[
  {color:'var(--gn)',bg:'rgba(34,197,94,.08)'},
  {color:'#8b5cf6',bg:'rgba(139,92,246,.08)'},
  {color:'var(--ac2)',bg:'rgba(59,130,246,.08)'},
  {color:'#06b6d4',bg:'rgba(6,182,212,.08)'},
  {color:'var(--or)',bg:'rgba(249,115,22,.08)'},
  {color:'var(--rd)',bg:'rgba(239,68,68,.08)'},
  {color:'var(--yl)',bg:'rgba(234,179,8,.08)'},
  {color:'#d946ef',bg:'rgba(217,70,239,.08)'},
  {color:'#14b8a6',bg:'rgba(20,184,166,.08)'},
  {color:'#a3a3a3',bg:'rgba(163,163,163,.08)'}
];
const ZONE_ICONS={
  'Стоматологические установки':'&#129463;','Автоклавы':'&#129514;','Рентген / Радиология':'&#9762;',
  'Компрессоры':'&#9881;','Инструменты':'&#128295;','Медицинская мебель':'&#128186;',
  'Стерилизация':'&#129514;','Освещение':'&#128161;','Расходные материалы':'&#128230;',
  'Помещения / Недвижимость':'&#127970;'
};

let equipFilter=null;
function setEquipFilter(cat){
  equipFilter=cat||null;
  renderEquip();
}
function navToEquip(cat){
  equipFilter=cat||null;
  nav('db-suppliers');
  renderEquip();
}
function renderEquip(){
  const c=document.getElementById('equipCards');
  if(!c)return;
  if(!DB.suppliers.length){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Загрузка оборудования из базы данных...</div>';return}
  const openZones=new Set();
  c.querySelectorAll('[id^="zoneBody"]').forEach(el=>{if(el.classList.contains('open'))openZones.add(el.id.replace('zoneBody',''))});
  const allGroups={};
  DB.suppliers.forEach(r=>{const cat=r.category||'Другое';if(!allGroups[cat])allGroups[cat]=[];allGroups[cat].push(r)});
  const allCatKeys=Object.keys(allGroups).sort((a,b)=>allGroups[b].length-allGroups[a].length);

  // Filter bar
  const fb=document.getElementById('equipFilterBar');
  if(fb){
    let fhtml=`<button class="btn sm ${!equipFilter?'pr':''}" onclick="setEquipFilter(null)" style="font-size:10px;padding:4px 10px">Все (${DB.suppliers.length})</button>`;
    allCatKeys.forEach(cat=>{
      const active=equipFilter===cat;
      fhtml+=`<button class="btn sm ${active?'pr':''}" onclick="setEquipFilter('${esc(cat).replace(/'/g,"\\'")}')" style="font-size:10px;padding:4px 10px">${esc(cat)} (${allGroups[cat].length})</button>`;
    });
    fb.innerHTML=fhtml;
  }

  const groups=equipFilter?{[equipFilter]:allGroups[equipFilter]||[]}:allGroups;
  const catKeys=Object.keys(groups).sort((a,b)=>(groups[b]||[]).length-(groups[a]||[]).length);
  const picked=DB.pickedEquip||{};
  const pickedCount=Object.keys(picked).length;
  const shown=catKeys.reduce((s,k)=>s+(groups[k]||[]).length,0);

  let html=`<div style="padding:8px 16px;font-size:11px;color:var(--tx2);border-bottom:1px solid var(--bd)">${equipFilter?'Фильтр: <strong>'+esc(equipFilter)+'</strong> · ':''}<strong>${shown}</strong> позиций в <strong>${catKeys.length}</strong> категориях · Добавлено в оснащение: <strong>${pickedCount}</strong></div>`;

  catKeys.forEach((cat,zi)=>{
    const items=groups[cat];
    const zc=ZONE_COLORS[zi%ZONE_COLORS.length];
    const icon=ZONE_ICONS[cat]||'&#128230;';
    const catPicked=items.filter(r=>!!picked[r.id]).length;
    const zOpen=openZones.has(String(zi));

    html+=`<div class="zone-card" id="zone-${zi}">`;
    html+=`<div class="zone-head" onclick="toggleZone(${zi})">`;
    html+=`<div class="zone-icon" style="background:${zc.bg};color:${zc.color}">${icon}</div>`;
    html+=`<div class="zone-info"><div class="zone-name">${cat}</div><div class="zone-desc">${items.length} позиций</div></div>`;
    html+=`<div class="zone-meta"><div class="zone-count">${catPicked} / ${items.length} добавлено</div></div>`;
    html+=`<span class="zone-arrow${zOpen?' open':''}" id="zoneArrow${zi}">&#9654;</span>`;
    html+=`</div>`;
    html+=`<div class="zone-bar"><div class="zone-bar-fill" id="zoneBar${zi}" style="width:${items.length?Math.round(catPicked/items.length*100):0}%;background:${zc.color}"></div></div>`;
    html+=`<div class="zone-body${zOpen?' open':''}" id="zoneBody${zi}"><div class="zone-items">`;
    items.forEach(r=>{
      const added=!!picked[r.id];
      html+=`<div class="ci cost-row" style="padding:8px 0"><div class="ct" style="flex:1;min-width:0">${esc(r.name)}<div class="ct-sub">${esc(r.supplier)} · ${esc(r.warranty)}</div></div><div class="cost-val" style="flex-shrink:0">${r.price.toLocaleString('ru')} PLN</div><button class="btn sm ${added?'gn':'pr'}" onclick="togglePickEquip('${r.id}')" style="flex-shrink:0;min-width:90px">${added?'✓ Добавлено':'+ В оснащение'}</button></div>`;
    });
    html+=`</div></div></div>`;
  });

  c.innerHTML=html;
  // Auto-expand when filtered to single category
  if(equipFilter&&catKeys.length===1){const b=document.getElementById('zoneBody0');const a=document.getElementById('zoneArrow0');if(b&&!b.classList.contains('open')){b.classList.add('open');if(a)a.classList.add('open')}}
}

// Tab 3: show only picked equipment, grouped by category
function renderSelectedEquip(){
  const c=document.getElementById('selectedEquipCards');
  if(!c)return;
  const picked=DB.pickedEquip||{};
  const pickedIds=Object.keys(picked);

  const allCats={};
  DB.suppliers.forEach(s=>{
    const cat=s.category||'Другое';
    if(!allCats[cat])allCats[cat]={total:0,picked:[]};
    allCats[cat].total++;
    if(picked[s.id]){const cp=picked[s.id].customPrice;allCats[cat].picked.push({...s,qty:picked[s.id].qty||1,unitPrice:cp!=null?cp:s.price})}
  });

  const catKeys=Object.keys(allCats);
  if(!catKeys.length){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Загрузка каталога...</div>';return}

  let totalCost=0;
  let html='';
  catKeys.forEach(cat=>{
    const g=allCats[cat];
    const cnt=g.picked.length;
    const catTotal=g.picked.reduce((s,r)=>s+r.unitPrice*r.qty,0);
    totalCost+=catTotal;
    const statusTag=cnt>0
      ?`<span style="font-size:10px;color:var(--gn);font-weight:600">${cnt} / ${g.total} выбрано · ${catTotal.toLocaleString('ru')} PLN</span>`
      :`<span style="font-size:10px;color:var(--tx3)">0 / ${g.total} — не выбрано</span>`;

    html+=`<div class="c" style="${cnt?'':'opacity:0.7'}"><div class="ch"><h3>${cat}</h3><div style="display:flex;align-items:center;gap:8px">${statusTag}<button class="btn sm pr" onclick="navToEquip('${esc(cat).replace(/'/g,"\\'")}')" style="font-size:9px">+ Добавить</button></div></div>`;
    if(cnt){
      html+='<div class="cb">';
      g.picked.forEach(r=>{
        const roomId=picked[r.id].room||'';
        const roomOpts=getPickedRoomsList().map(rm=>`<option value="${rm.id}" ${rm.id==roomId?'selected':''}>${rm.name}</option>`).join('');
        const isCustom=picked[r.id].customPrice!=null;
        html+=`<div class="ci cost-row" style="flex-wrap:nowrap"><div class="ct" style="flex:1;min-width:0">${r.name}<div class="ct-sub">${r.supplier}</div></div><select onchange="assignEquipRoom('${r.id}',this.value)" style="font-size:10px;padding:3px 6px;border:1px solid var(--bd);border-radius:6px;background:var(--sf);color:var(--tx);max-width:130px;flex-shrink:0"><option value="">— комната</option>${roomOpts}</select><div class="sel-qty" style="margin:0 4px"><button onclick="eqSelQty('${r.id}',-1)">−</button><span id="eq_${r.id}">${r.qty}</span><button onclick="eqSelQty('${r.id}',1)">+</button></div><div style="display:flex;align-items:center;gap:2px;min-width:100px;justify-content:flex-end"><input type="number" value="${r.unitPrice}" onchange="setCustomPrice('equip','${r.id}',this.value)" style="width:60px;font-size:11px;font-weight:700;color:${isCustom?'var(--or)':'var(--ac2)'};text-align:right;border:1px solid var(--bd);border-radius:4px;padding:2px 4px;background:var(--sf)"><span style="font-size:10px;color:var(--tx3)">PLN</span></div><button class="btn sm" style="color:var(--rd);flex-shrink:0" onclick="togglePickEquip('${r.id}')">✕</button></div>`;
      });
      html+='</div>';
    }
    html+='</div>';
  });
  c.innerHTML=html;

  // Update stats
  const prices=pickedIds.map(id=>{const s=DB.suppliers.find(x=>x.id===id);const p=picked[id];return p&&p.customPrice!=null?p.customPrice:s?s.price:0});
  document.getElementById('eqCount').textContent=pickedIds.length;
  document.getElementById('eqTotal').textContent=totalCost.toLocaleString('ru');
  document.getElementById('eqCats').textContent=catKeys.filter(cat=>allCats[cat].picked.length>0).length;
  document.getElementById('eqAvg').textContent=pickedIds.length?Math.round(totalCost/pickedIds.length).toLocaleString('ru'):'0';
}

function eqSelQty(id,d){
  if(!DB.pickedEquip||!DB.pickedEquip[id])return;
  DB.pickedEquip[id].qty=Math.max(1,(DB.pickedEquip[id].qty||1)+d);
  const sp=document.getElementById('eq_'+id);
  if(sp)sp.textContent=DB.pickedEquip[id].qty;
  savePicked();renderSelectedEquip();recalc();renderCabinetTypes();
}
function getPickedRoomsList(){
  // Из каталога БД
  const fromDB=Object.keys(DB.pickedRooms).map(id=>DB.rooms.find(r=>r.id==id)).filter(Boolean);
  // Из конструктора планировки
  const fromFP=(FP&&FP.rooms||[]).map((r,i)=>{
    const bb=fpPolyBBox(r.pts);
    const w=+(bb.x2-bb.x1).toFixed(1),h=+(bb.y2-bb.y1).toFixed(1);
    return{id:'fp_'+i,name:r.name||'Комната '+(i+1),type:r.type||'Без типа',area:+(w*h).toFixed(1),w,h,source:'constructor'};
  });
  // Объединяем, убирая дубли по имени
  const dbNames=new Set(fromDB.map(r=>r.name));
  const unique=fromFP.filter(r=>!dbNames.has(r.name));
  return [...fromDB,...unique];
}
function addCabinetFromList(){
  const fpRooms=(FP&&FP.rooms||[]);
  if(!fpRooms.length){alert('Сначала добавьте комнаты в конструкторе планировки (Таб 1)');return}
  let html='<div style="font-size:12px;color:var(--tx2);margin-bottom:8px">Комнаты из конструктора планировки автоматически отображаются в стоимости кабинетов.</div>';
  html+='<div style="font-size:11px;color:var(--tx3);margin-bottom:12px">Всего в конструкторе: <strong>'+fpRooms.length+'</strong> комнат</div>';
  fpRooms.forEach((r,i)=>{
    const bb=fpPolyBBox(r.pts);const w=+(bb.x2-bb.x1).toFixed(1),h=+(bb.y2-bb.y1).toFixed(1);
    html+=`<div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--bd)"><div style="flex:1"><div style="font-weight:600;font-size:12px">${r.name||'Комната '+(i+1)}</div><div style="font-size:10px;color:var(--tx3)">${r.type||'Без типа'} · ${(w*h).toFixed(1)} м²</div></div><span style="font-size:10px;color:var(--gn)">✓ В кабинетах</span></div>`;
  });
  document.getElementById('modalTitle').textContent='Комнаты конструктора';
  document.getElementById('modalFields').innerHTML=html;
  document.getElementById('modalSave').style.display='none';
  document.getElementById('modalBg').classList.add('vis');
}
function assignEquipRoom(equipId,roomId){
  if(!DB.pickedEquip[equipId])return;
  DB.pickedEquip[equipId].room=roomId||null;
  savePicked();renderCabinetTypes();
}
function setCustomPrice(type,id,val){
  const v=Math.max(0,parseFloat(val)||0);
  if(type==='equip'){if(DB.pickedEquip[id])DB.pickedEquip[id].customPrice=v;renderSelectedEquip();}
  else if(type==='ren'){if(DB.pickedRenovations[id])DB.pickedRenovations[id].customPrice=v;renderSelectedRenovations();}
  else if(type==='svc'){if(DB.pickedServices[id])DB.pickedServices[id].customPrice=v;renderSelectedServices();}
  savePicked();recalc();
}

function toggleZone(zi){
  const body=document.getElementById('zoneBody'+zi);
  const arrow=document.getElementById('zoneArrow'+zi);
  body.classList.toggle('open');
  arrow.classList.toggle('open');
}

function updateZoneStats(){}

