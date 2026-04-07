// ═══════════════ MODAL ═══════════════
let modalMode='';
let editingId=null;
const MODAL_FIELDS={
  property:[{k:'name',l:'Адрес / Название',ph:'ул. Гданьская 15'},{k:'city',l:'Город',ph:'Быдгощ'},{k:'area',l:'Площадь (м²)',ph:'180',t:'number'},{k:'length',l:'Длина (м)',ph:'18.5',t:'number'},{k:'width',l:'Ширина (м)',ph:'9.7',t:'number'},{k:'height',l:'Высота потолков (м)',ph:'2.9',t:'number'},{k:'floor',l:'Этаж',ph:'1',t:'number'},{k:'floors_total',l:'Этажей в здании',ph:'3',t:'number'},{k:'type',l:'Тип',ph:'Коммерческое'},{k:'purpose',l:'Назначение',ph:'Стоматология'},{k:'price_m2',l:'Цена за м²/мес (PLN)',ph:'67',t:'number'},{k:'source',l:'Источник',ph:'OLX / Otodom'}],
  room:[{k:'name',l:'Название',ph:'Кабинет 8'},{k:'type',l:'Тип',ph:'Стоматологический'},{k:'w',l:'Ширина (м)',ph:'4.0',t:'number'},{k:'l',l:'Длина (м)',ph:'3.5',t:'number'},{k:'h',l:'Высота (м)',ph:'2.9',t:'number'}],
  contractor:[{k:'name',l:'Компания',ph:'Название'},{k:'spec',l:'Специализация',ph:'Электрика'},{k:'city',l:'Город',ph:'Быдгощ'},{k:'price',l:'Цена',ph:'от 80 PLN/м'},{k:'phone',l:'Телефон',ph:'+48 500 000 000'}],
  supplier:[{k:'name',l:'Товар',ph:'Название'},{k:'category',l:'Категория',ph:'Стом. кресла'},{k:'price',l:'Цена (PLN)',ph:'0',t:'number'},{k:'supplier',l:'Поставщик',ph:'Компания'},{k:'warranty',l:'Гарантия',ph:'24 мес'}],
  employee:[{k:'name',l:'Должность',ph:'Стоматолог'},{k:'spec',l:'Специализация',ph:'Терапия'},{k:'salary',l:'ЗП/мес (PLN)',ph:'0',t:'number'},{k:'status',l:'Статус',ph:'Вакансия'}],
  equip:[{k:'name',l:'Название',ph:'Оборудование'},{k:'category',l:'Категория',ph:'Категория'},{k:'price',l:'Цена (PLN)',ph:'0',t:'number'},{k:'supplier',l:'Поставщик',ph:'Компания'},{k:'warranty',l:'Гарантия',ph:'24 мес'}],
  staff:[{k:'name',l:'Должность',ph:'Должность'},{k:'spec',l:'Описание',ph:'Полная ставка'},{k:'salary',l:'ЗП/мес (PLN)',ph:'0',t:'number'},{k:'status',l:'Статус',ph:'Вакансия'}],
  service:[{k:'name',l:'Процедура',ph:'Название'},{k:'time',l:'Время',ph:'30 мин'},{k:'price',l:'Цена (PLN)',ph:'0',t:'number'}],
  user:[{k:'name',l:'Имя',ph:'Иван Иванов'},{k:'email',l:'Email',ph:'user@clinic.com'},{k:'phone',l:'Телефон',ph:'+48 500 000 000'},{k:'position',l:'Должность',ph:'Врач-стоматолог'},{k:'role',l:'Роль',ph:'owner'},{k:'status',l:'Статус',ph:'Активен'},{k:'notes',l:'Заметки',ph:'Доп. информация'}],
  cabinetType:[{k:'name',l:'Название типа',ph:'Стоматологический'},{k:'icon',l:'Иконка',ph:'🦷'},{k:'desc',l:'Описание',ph:'Стандартный кабинет'},{k:'minArea',l:'Мин. площадь (м²)',ph:'12',t:'number'}],
  renovation:[{k:'name',l:'Название работы',ph:'Монтаж перегородок'},{k:'cat',l:'Категория',ph:'Отделка и строительные работы'},{k:'price',l:'Стоимость (PLN)',ph:'10000',t:'number'}],
  premise:[{k:'name',l:'Адрес / Название',ph:'ул. Гданьская 15'},{k:'city',l:'Город',ph:'Быдгощ'},{k:'area',l:'Площадь (м²)',ph:'180',t:'number'},{k:'floors',l:'Этажей',ph:'3',t:'number'},{k:'price',l:'Цена за м²/мес (PLN)',ph:'67',t:'number'},{k:'owner_name',l:'Владелец',ph:'Иван Иванов'},{k:'owner_phone',l:'Телефон владельца',ph:'+48 500 000 000'},{k:'notes',l:'Описание',ph:'Угловое помещение, витринные окна'},{k:'source',l:'Источник (URL)',ph:'https://otodom.pl/...'}],
  vendor:[{k:'name',l:'Название компании',ph:'DentPro.pl'},{k:'desc',l:'Описание',ph:'Дистрибьютор стоматологического оборудования'},{k:'city',l:'Город',ph:'Warszawa'},{k:'phone',l:'Телефон',ph:'+48 22 123 4567'},{k:'website',l:'Сайт',ph:'dentpro.pl'},{k:'tags',l:'Теги (через запятую)',ph:'Установки, Кресла, Рентген'}]
};

function openModal(mode){
  modalMode=mode;
  editingId=null;
  const titles={property:'Карточка помещения',premise:'Добавить помещение',room:'Добавить комнату',contractor:'Заявка подрядчика',supplier:'Добавить товар',employee:'Добавить сотрудника',equip:'Добавить оборудование',staff:'Добавить должность',service:'Добавить процедуру',user:'Пригласить пользователя',cabinetType:'Добавить тип кабинета',vendor:'Добавить поставщика'};
  document.getElementById('modalTitle').textContent=titles[mode]||'Добавить';
  const fields=MODAL_FIELDS[mode]||[];
  document.getElementById('modalFields').innerHTML=fields.map(f=>{
    const val=(mode==='property'&&activeProperty)?activeProperty[f.k]||'':'';
    return `<div class="modal-field"><label>${f.l}</label><input id="mf_${f.k}" type="${f.t||'text'}" placeholder="${f.ph||''}" value="${val}"></div>`;
  }).join('');
  document.getElementById('modalBg').classList.add('vis');
}

function closeModal(){document.getElementById('modalBg').classList.remove('vis');const ms=document.getElementById('modalSave');if(ms){ms.style.display='';ms.textContent='Сохранить';ms.onclick=saveModal}}

function saveModal(){
  const fields=MODAL_FIELDS[modalMode]||[];
  const obj={};
  fields.forEach(f=>{
    const el=document.getElementById('mf_'+f.k);
    obj[f.k]=f.t==='number'?parseFloat(el.value)||0:el.value;
  });
  if(!obj.name){closeModal();return}

  // Property is special — sets activeProperty
  if(modalMode==='property'){
    obj.id=editingId||++nextId;
    activeProperty=obj;
    closeModal();
    renderProperty();
    return;
  }

  // Premise — full property object for DB
  if(modalMode==='premise'){
    const premiseObj={id:editingId||++nextId,name:obj.name,price:obj.price||0,status:'candidate',notes:obj.notes||'',img:null,source:obj.source||'',specs:{address:obj.name,city:obj.city||'',area:obj.area||0,floors:obj.floors||0,owner_name:obj.owner_name||'',owner_phone:obj.owner_phone||''}};
    if(editingId){
      const idx=DB.premises.findIndex(x=>x.id===editingId);
      if(idx!==-1)Object.assign(DB.premises[idx],premiseObj);
    }else{
      DB.premises.push(premiseObj);
    }
    // Sync to Supabase equipment table
    if(sb){
      const premisesCatId=DB._eqCats?.find(c=>c.slug==='premises')?.id;
      if(premisesCatId){
        const row={name:obj.name,price_pln:obj.price||0,status:'candidate',notes:obj.notes||'',source_url:obj.source||'',specs:premiseObj.specs,category_id:premisesCatId};
        if(editingId)sb.from('equipment').update(row).eq('id',editingId).then(()=>{});
        else sb.from('equipment').insert(row).then(()=>{});
      }
    }
    editingId=null;
    closeModal();
    renderPremises();buildSidebar();
    return;
  }

  if(modalMode==='vendor'){
    const v={id:editingId||'v'+(++nextId),name:obj.name,desc:obj.desc||'',city:obj.city||'',phone:obj.phone||'',website:obj.website||'',tags:(obj.tags||'').split(',').map(t=>t.trim()).filter(Boolean)};
    if(editingId){const idx=DB.vendorCompanies.findIndex(x=>x.id===editingId);if(idx!==-1)Object.assign(DB.vendorCompanies[idx],v)}
    else DB.vendorCompanies.push(v);
    editingId=null;closeModal();renderVendors();buildSidebar();return;
  }

  const tableMap={room:'rooms',contractor:'contractors',supplier:'suppliers',employee:'employees',equip:'suppliers',staff:'employees',service:'services',user:'users',cabinetType:'cabinetTypes',renovation:'renovations'};
  const table=tableMap[modalMode];

  // Edit existing item
  if(editingId&&table){
    const arr=DB[table];
    const idx=arr.findIndex(x=>x.id==editingId);
    if(idx!==-1){
      Object.assign(arr[idx],obj);
      // Persist staff edits in pickedStaff so they survive reload
      if(modalMode==='staff'&&DB.pickedStaff[editingId]){
        Object.assign(DB.pickedStaff[editingId],obj);
        savePicked();
      }
      editingId=null;
      closeModal();
      renderAll();buildSidebar();recalc();
      return;
    }
  }

  // Add new item
  obj.id=modalMode==='user'?genUserId():++nextId;
  if(modalMode==='user'){obj.plan='trial';obj.status='Активен';obj.created=new Date().toISOString().slice(0,10)}
  if(modalMode==='room')obj.area=Math.round((obj.w||0)*(obj.l||0)*100)/100;
  if(modalMode==='contractor')obj.rating=0;
  if(modalMode==='cabinetType')obj.equipCats=[];
  DB[table].push(obj);
  // Auto-pick new staff members and persist
  if(modalMode==='staff'){
    DB.pickedStaff[obj.id]={qty:1,...obj};
    savePicked();
  }
  editingId=null;
  closeModal();
  renderAll();buildSidebar();recalc();
}

// ═══════════════ COST ENGINE ═══════════════
function getVal(id){return parseInt(document.getElementById(id)?.value)||0}
function getAllCosts(prefix){
  let sum=0;
  document.querySelectorAll('[data-cost^="'+prefix+'"]').forEach(el=>{sum+=parseInt(el.value)||0});
  return sum;
}

function calcTotals(){
  const rentMonth=getVal2('rent');
  const depMonths=parseInt(document.getElementById('depositMonths')?.value)||3;
  const deposit=rentMonth*depMonths;
  let renovation=0;
  Object.keys(DB.pickedRenovations||{}).forEach(id=>{renovation+=getRenItemCost(id)});
  const rent=deposit+renovation;
  const eng=getAllCosts('elec_')+getAllCosts('water_')+getAllCosts('vent_')+getAllCosts('sec_');
  let equip=0;
  Object.entries(DB.pickedEquip||{}).forEach(([id,p])=>{
    const item=DB.suppliers.find(s=>s.id==id);
    if(item)equip+=(p.customPrice!=null?p.customPrice:item.price)*(p.qty||1);
  });
  const docs=getDocTotalCost();
  // ЗП из DB.pickedStaff (не из DOM — DOM может быть скрыт)
  let staff=0;
  Object.entries(DB.pickedStaff||{}).forEach(([id,p])=>{
    const e=DB.employees.find(x=>x.id===id);
    if(e)staff+=(e.salary||0)*(p.qty||1);
  });
  // ФОТ — налоги работодателя (ZUS) поверх ЗП
  const fotRate=(parseFloat(document.getElementById('fotRateInput')?.value)||20.48)/100;
  const fot=Math.round(staff*fotRate);
  const avgCheck=getVal('avgCheck');
  const ppc=getVal('patientsPerChair');
  const wd=getVal('workDays');
  const chairs=parseInt(document.getElementById('chairsCount')?.value)||7;
  const revenue=chairs*ppc*wd*avgCheck;
  const expenses=staff+fot+rentMonth+getVal('prUtils')+getVal('prMaterials')+getVal('prMarketing')+getVal('prOther');
  const grand=rent+eng+equip+docs;
  // Update S1 cost total
  const s1el=document.getElementById('s1CostTotal');
  if(s1el)s1el.textContent=rent.toLocaleString('ru')+' PLN';
  const renDisp=document.getElementById('renCostDisplay');
  if(renDisp)renDisp.textContent=renovation.toLocaleString('ru');
  return{rent,renovation,eng,equip,docs,staff,fot,grand,revenue,expenses,chairs,ppc,wd,avgCheck,rentMonth};
}
function getVal2(costKey){
  const el=document.querySelector('[data-cost="'+costKey+'"]');
  return parseInt(el?.value)||0;
}

let _recalcTimer;
function recalc(){
  clearTimeout(_recalcTimer);
  _recalcTimer=setTimeout(_recalcNow,50);
}
function _recalcNow(){
  const t=calcTotals();
  // s2Total removed — renTotal is updated by renderSelectedRenovations()
  document.getElementById('s4Total').textContent=t.staff.toLocaleString('ru')+' PLN';
  document.getElementById('s7Total').textContent=t.docs.toLocaleString('ru')+' PLN';
  const el6r=document.getElementById('s6Revenue');if(el6r)el6r.textContent=t.revenue.toLocaleString('ru')+' PLN';
  const profit=t.revenue-t.expenses;
  document.getElementById('ovROI').textContent=profit>0&&t.grand>0?Math.ceil(t.grand/profit):'--';
  document.getElementById('totalItems').textContent=Object.keys(DB.pickedEquip||{}).length;
  updateSumbar();
  updateZoneStats();
  updateOverviewStats();
  if(cur==='budget')updateBudget();
  if(cur==='profit')updateProfit();
  if(cur==='s6')updateFormulaDisplay();
  updateTabCosts(t);
  updateAchievements();
  updateTopConcept();
}
function updateTabCosts(t){
  // Tab 1: Помещение — аренда + депозит
  const tc1=document.getElementById('tabCost1');
  if(tc1)tc1.textContent=t.rent>0?t.rent.toLocaleString('ru')+' PLN':'';
  // Tab 2: Модернизация — только ремонт
  const tc2=document.getElementById('tabCost2');
  if(tc2)tc2.textContent=t.renovation>0?t.renovation.toLocaleString('ru')+' PLN':'';
  // Tab 3: Оснащение — оборудование
  const tc3=document.getElementById('tabCost3');
  if(tc3)tc3.textContent=t.equip>0?t.equip.toLocaleString('ru')+' PLN':'';
  // Tab 4: Персонал — ФОТ/мес
  let fot=0;
  Object.entries(DB.pickedStaff||{}).forEach(([id,p])=>{
    const e=DB.employees.find(x=>x.id===id);
    if(e)fot+=(e.salary||0)*(p.qty||1);
  });
  const tc4=document.getElementById('tabCost4');
  if(tc4)tc4.textContent=fot>0?fot.toLocaleString('ru')+'/мес':'';
  // Tab 5: Прайс-лист — процедуры/услуги для клиентов
  let svcTotal=0;
  const svcPicked=DB.pickedServices||{};
  Object.entries(svcPicked).forEach(([id,p])=>{
    const s=DB.services.find(x=>x.id===id);
    if(s)svcTotal+=(p.customPrice!=null?p.customPrice:s.price)*(p.qty||1);
  });
  const tc5=document.getElementById('tabCost5');
  if(tc5)tc5.textContent=svcTotal>0?svcTotal.toLocaleString('ru')+' PLN':'';
  // Tab 5 stats
  const svcCountEl=document.getElementById('svcCount');
  const svcCatsEl=document.getElementById('svcCats');
  const svcAvgEl=document.getElementById('svcAvgPrice');
  const svcRevEl=document.getElementById('svcRevenue');
  const svcPickedCount=Object.keys(svcPicked).length;
  if(svcCountEl)svcCountEl.textContent=svcPickedCount;
  if(svcCatsEl){const cats=new Set();Object.keys(svcPicked).forEach(id=>{const s=DB.services.find(x=>x.id===id);if(s)cats.add(s.category||s.category_id||'Другое')});svcCatsEl.textContent=cats.size}
  if(svcAvgEl)svcAvgEl.textContent=svcPickedCount>0?Math.round(svcTotal/svcPickedCount).toLocaleString('ru'):'0';
  if(svcRevEl){const chairs=parseInt(document.getElementById('chairsCount')?.value||7);const ppd=parseInt(document.getElementById('patientsPerChair')?.value||6);const wd=parseInt(document.getElementById('workDays')?.value||22);const avgP=svcPickedCount>0?svcTotal/svcPickedCount:0;svcRevEl.textContent=Math.round(avgP*chairs*ppd*wd).toLocaleString('ru')}
  const s5t=document.getElementById('s5Total');
  if(s5t)s5t.textContent=(svcPickedCount>0?Math.round(svcTotal/svcPickedCount).toLocaleString('ru'):'0')+' PLN';
  // Tab 6: Концепция
  const tc6=document.getElementById('tabCost6');
  if(tc6)tc6.textContent='';
  // Tab 7: Документация
  const tc7=document.getElementById('tabCost7');
  if(tc7)tc7.textContent=t.docs>0?t.docs.toLocaleString('ru')+' PLN':'';
  // Tab status: red (0) → orange (wip) → green (ok)
  const tabs=document.querySelectorAll('#tabBar .tab');
  const renP=Object.keys(DB.pickedRenovations||{}).length;
  const svcP=svcPickedCount;
  const eqP=Object.keys(DB.pickedEquip||{}).length;
  const stP=Object.keys(DB.pickedStaff||{}).length;
  // progress: 0=none, 1=started, 2=complete
  const progress=[
    t.rent>0&&activeProperty?(activeProperty.area>0&&FP&&FP.rooms&&FP.rooms.length>=2?2:1):0,
    renP>=10?2:(renP>0?1:0),
    eqP>=10?2:(eqP>0?1:0),
    stP>=3?2:(stP>0?1:0),
    svcP>=5?2:(svcP>0?1:0),
    0,
    t.docs>0?2:(Object.keys(DB.pickedDocs||{}).length>0?1:0)
  ];
  tabs.forEach((tab,i)=>{
    tab.classList.remove('ok','wip');
    if(progress[i]===2)tab.classList.add('ok');
    else if(progress[i]===1)tab.classList.add('wip');
  });
}

function updateOverviewStats(){
  // Stage progress based on real data
  const stages=document.querySelectorAll('#stagesGrid .stg');
  if(!stages.length)return;
  const t=calcTotals();

  // S1: Помещение — has property + rooms
  const s1prog=activeProperty?50:0;
  const s1rooms=FP&&FP.rooms?FP.rooms.length:0;
  const s1full=Math.min(100,s1prog+(s1rooms>0?50:0));
  updateStage(stages[0],s1full,activeProperty?activeProperty.area+' м²':'—');

  // S2: Модернизация (только ремонт)
  const renPicked=Object.keys(DB.pickedRenovations||{}).length;
  const s2prog=renPicked>0?Math.min(100,Math.round(renPicked/10*100)):0;
  updateStage(stages[1],s2prog,renPicked+' работ');

  // S3: Оснащение — equipment from Supabase
  const eqPicked=Object.keys(DB.pickedEquip||{}).length;
  const s3prog=eqPicked>0?Math.min(100,Math.round(eqPicked/20*100)):0;
  updateStage(stages[2],s3prog,eqPicked+' / '+DB.suppliers.length);

  // S4: Персонал
  const staffPicked=Object.keys(DB.pickedStaff||{}).length;
  const s4prog=staffPicked>0?Math.min(100,Math.round(staffPicked/5*100)):0;
  updateStage(stages[3],s4prog,staffPicked+' сотр.');

  // S5: Перечень услуг
  const svcPicked=Object.keys(DB.pickedServices||{}).length;
  const s5prog=svcPicked>0?Math.min(100,Math.round(svcPicked/10*100)):0;
  updateStage(stages[4],s5prog,svcPicked+' услуг');

  // S6: Концепция
  const s6prog=0; // Концепция заполняется вручную
  if(stages[5])updateStage(stages[5],s6prog,'—');

  // S7: Документация
  const docsDone=Object.values(DB.pickedDocs||{}).filter(d=>d.done).length;
  const docsAll=Object.keys(DB.pickedDocs||{}).length;
  const s7prog=docsAll?Math.round(docsDone/docsAll*100):0;
  if(stages[6])updateStage(stages[6],s7prog,docsDone+'/'+docsAll+' док.');

  // Overall progress
  const overall=Math.round((s1full+s2prog+s3prog+s4prog+s5prog+s6prog+s7prog)/7);
  document.getElementById('ovProgress').innerHTML=overall+'<span style="font-size:14px;color:var(--tx2)">%</span>';
  const pb=document.getElementById('ovProgressBar');
  if(pb)pb.style.width=overall+'%';

  // Current stage
  const progs=[s1full,s2prog,s3prog,s4prog,s5prog,s6prog,s7prog];
  let curStage=1;
  for(let i=0;i<progs.length;i++){if(progs[i]<100){curStage=i+1;break}if(i===6)curStage=7}
  document.getElementById('ovStage').textContent='Этап '+curStage+' из 7';
}

function updateStage(el,pct,meta){
  const pf=el.querySelector('.stg-pf');
  if(pf){pf.style.width=pct+'%';if(pct>0)pf.style.background='var(--ac)'}
  const m=el.querySelector('.stg-m');
  if(m){
    const sp=m.querySelector('span');
    const st=m.querySelector('strong');
    if(sp)sp.textContent=meta;
    if(st)st.textContent=pct+'%';
  }
  // Update tag
  const tag=el.querySelector('.tag');
  if(tag){
    if(pct>=100){tag.textContent='Готово';tag.className='tag t-ok'}
    else if(pct>0){tag.textContent='В работе';tag.className='tag t-wip'}
    else{tag.textContent='Ожидает';tag.className='tag t-w'}
  }
}

function updateSumbar(){}

