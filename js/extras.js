// ═══════════════ ACHIEVEMENTS SYSTEM ═══════════════
const ACHIEVEMENTS=[
  {id:'prop',icon:'&#127970;',name:'Найден объект',desc:'Выбрано помещение',check:()=>!!activeProperty},
  {id:'rooms',icon:'&#128682;',name:'Планировка',desc:'Добавлены кабинеты',check:()=>FP&&FP.rooms&&FP.rooms.length>=2},
  {id:'ren3',icon:'&#128736;',name:'Начало ремонта',desc:'3+ работы в модернизации',check:()=>Object.keys(DB.pickedRenovations||{}).length>=3},
  {id:'ren10',icon:'&#127959;',name:'Полный ремонт',desc:'10+ работ в модернизации',check:()=>Object.keys(DB.pickedRenovations||{}).length>=10},
  {id:'eq5',icon:'&#129656;',name:'Первое оснащение',desc:'5+ единиц оборудования',check:()=>Object.keys(DB.pickedEquip||{}).length>=5},
  {id:'eq20',icon:'&#128230;',name:'Полная комплектация',desc:'20+ единиц оборудования',check:()=>Object.keys(DB.pickedEquip||{}).length>=20},
  {id:'svc5',icon:'&#129657;',name:'Прайс-лист',desc:'5+ процедур добавлено',check:()=>Object.keys(DB.pickedServices||{}).length>=5},
  {id:'staff3',icon:'&#129489;',name:'Команда',desc:'3+ сотрудника',check:()=>Object.keys(DB.pickedStaff||{}).length>=3},
  {id:'budget',icon:'&#128176;',name:'Бюджет',desc:'Общий бюджет > 100K',check:()=>{const t=calcTotals();return t.grand>100000}},
  {id:'profit',icon:'&#128200;',name:'Рентабельность',desc:'Доход превышает расход',check:()=>{const t=calcTotals();return t.revenue>t.expenses&&t.revenue>0}},
  {id:'all5',icon:'&#11088;',name:'Все этапы',desc:'Все 5 табов зелёные',check:()=>document.querySelectorAll('#tabBar .tab.ok').length>=5},
  {id:'roi',icon:'&#127942;',name:'Быстрый старт',desc:'Окупаемость < 24 мес',check:()=>{const t=calcTotals();const p=t.revenue-t.expenses;return p>0&&t.grand>0&&Math.ceil(t.grand/p)<24}}
];
let achUnlocked=new Set();

function updateAchievements(){
  const grid=document.getElementById('achGrid');
  if(!grid)return;
  let newUnlock=false;
  let html='';
  let count=0;
  ACHIEVEMENTS.forEach(a=>{
    const done=a.check();
    if(done&&!achUnlocked.has(a.id)){achUnlocked.add(a.id);newUnlock=true}
    if(done)count++;
    html+=`<div style="text-align:center;padding:8px 4px;border-radius:8px;background:${done?'rgba(34,197,94,.08)':'var(--sf2)'};border:1px solid ${done?'var(--gn)':'var(--bd)'};opacity:${done?'1':'0.4'}"><div style="font-size:20px">${a.icon}</div><div style="font-size:9px;font-weight:700;margin-top:4px;color:${done?'var(--gn)':'var(--tx3)'}">${a.name}</div><div style="font-size:8px;color:var(--tx3)">${a.desc}</div></div>`;
  });
  grid.innerHTML=html;
  document.getElementById('achCount').textContent=count+' / '+ACHIEVEMENTS.length;
  uSet('svita_ach',JSON.stringify([...achUnlocked]));
  if(newUnlock)showAchToast(count);
}
function showAchToast(count){
  const t=document.createElement('div');
  t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--gn);color:#fff;padding:12px 20px;border-radius:12px;font-size:12px;font-weight:700;z-index:9999;animation:fi .3s ease;box-shadow:0 4px 20px rgba(34,197,94,.3)';
  t.textContent='&#127942; Новое достижение! ('+count+'/'+ACHIEVEMENTS.length+')';
  t.innerHTML='&#127942; Новое достижение! ('+count+'/'+ACHIEVEMENTS.length+')';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

function updateBudget(){
  const t=calcTotals();
  document.getElementById('budgetGrand').textContent=t.grand.toLocaleString('ru')+' PLN';
  document.getElementById('bCatRent').textContent=t.rent.toLocaleString('ru')+' PLN';
  document.getElementById('bCatEng').textContent=t.eng.toLocaleString('ru')+' PLN';
  document.getElementById('bCatEquip').textContent=t.equip.toLocaleString('ru')+' PLN';
  document.getElementById('bCatDocs').textContent=t.docs.toLocaleString('ru')+' PLN';
  // Build itemized list from DB data (not DOM) to work even when sections are hidden
  const items=[];
  // Rent + deposit
  const rentMonth=getVal2('rent');
  const depMonths=parseInt(document.getElementById('depositMonths')?.value)||3;
  if(rentMonth>0)items.push({name:'Аренда (депозит '+depMonths+' мес)',cost:rentMonth*depMonths});
  // Renovations
  Object.keys(DB.pickedRenovations||{}).forEach(id=>{
    const c=getRenItemCost(id);if(c<=0)return;
    const item=[...DB.services,...(DB.conceptItems||[])].find(s=>s.id==id);
    items.push({name:(item?item.name:'Работа #'+id),cost:c});
  });
  // Engineering (from DOM data-cost inputs)
  ['elec_','water_','vent_','sec_'].forEach(pfx=>{
    document.querySelectorAll('[data-cost^="'+pfx+'"]').forEach(el=>{
      const v=parseInt(el.value)||0;if(v<=0)return;
      const row=el.closest('.ci,.cost-row');const ct=row?.querySelector('.ct');
      items.push({name:ct?ct.childNodes[0].textContent.trim():'Инж. сети',cost:v});
    });
  });
  // Equipment
  Object.entries(DB.pickedEquip||{}).forEach(([id,p])=>{
    const item=DB.suppliers.find(s=>s.id==id);if(!item)return;
    const price=p.customPrice!=null?p.customPrice:item.price;
    const qty=p.qty||1;if(price*qty<=0)return;
    items.push({name:esc(item.name)+(qty>1?' x'+qty:''),cost:price*qty});
  });
  // Documents
  const docTotal=getDocTotalCost();
  const docCount=Object.keys(DB.pickedDocs||{}).length;
  if(docTotal>0)items.push({name:'Документация ('+docCount+' позиций)',cost:docTotal});
  const list=document.getElementById('budgetList');
  if(!items.length){list.innerHTML='<div style="color:var(--tx3);padding:16px;text-align:center">Добавьте позиции в концепцию для расчёта бюджета</div>';return}
  items.sort((a,b)=>b.cost-a.cost);
  list.innerHTML='<table class="dt"><thead><tr><th>Позиция</th><th style="text-align:right">Стоимость</th></tr></thead><tbody>'+items.map(i=>`<tr><td>${i.name}</td><td style="text-align:right;font-weight:600;color:var(--ac2)">${i.cost.toLocaleString('ru')} PLN</td></tr>`).join('')+`<tr style="border-top:2px solid var(--bd)"><td style="font-weight:800">ИТОГО</td><td style="text-align:right;font-weight:800;color:var(--ac2);font-size:14px">${t.grand.toLocaleString('ru')} PLN</td></tr></tbody></table>`;
}

function updateProfit(){
  const t=calcTotals();
  const profit=t.revenue-t.expenses;
  const margin=t.revenue>0?Math.round(profit/t.revenue*100):0;
  const roi=t.grand>0?Math.round(profit*12/t.grand*100):0;
  const payback=profit>0?Math.ceil(t.grand/profit):0;
  document.getElementById('prInvest').textContent=t.grand.toLocaleString('ru');
  document.getElementById('prPayback').textContent=payback||'--';
  document.getElementById('prPatients').textContent=t.chairs*t.ppc;
  document.getElementById('prAvgCheck').textContent=t.avgCheck.toLocaleString('ru')+' PLN';
  document.getElementById('prRevenue').textContent=t.revenue.toLocaleString('ru')+' PLN';
  document.getElementById('prRent').textContent=t.rentMonth.toLocaleString('ru')+' PLN';
  document.getElementById('prStaff').textContent=t.staff.toLocaleString('ru')+' PLN';
  document.getElementById('prFot').textContent=t.fot.toLocaleString('ru')+' PLN';
  document.getElementById('prExpenses').textContent=t.expenses.toLocaleString('ru')+' PLN';
  document.getElementById('prProfit').textContent=profit.toLocaleString('ru')+' PLN';
  document.getElementById('prProfit').className='metric-val '+(profit>0?'pos':'neg');
  document.getElementById('prMarginBar').style.width=Math.max(0,Math.min(100,margin))+'%';
  document.getElementById('prMarginBar').style.background=margin>30?'var(--gn)':margin>15?'var(--yl)':'var(--rd)';
  document.getElementById('prMarginVal').textContent=margin+'%';
  document.getElementById('prROI').textContent=roi+'%';
  document.getElementById('prROI').className='metric-val '+(roi>50?'pos':roi>20?'neu':'neg');
  document.getElementById('prPaybackMonths').textContent=payback?payback+' мес.':'--';
  document.getElementById('prYearProfit').textContent=(profit*12).toLocaleString('ru')+' PLN';
}

function updateFormulaDisplay(){
  const t=calcTotals();
  const chairs=t.chairs,ppc=t.ppc,wd=t.wd,avg=t.avgCheck;
  const revenue=t.revenue;
  const rentM=t.rentMonth;
  const staff=t.staff;
  const fot=t.fot;
  const utils=getVal('prUtils'),mat=getVal('prMaterials'),mkt=getVal('prMarketing'),oth=getVal('prOther');
  const expenses=t.expenses;
  const profit=revenue-expenses;
  const margin=revenue>0?Math.round(profit/revenue*100):0;
  const roi=t.grand>0?Math.round(profit*12/t.grand*100):0;
  const payback=profit>0?Math.ceil(t.grand/profit):0;
  const fmt=n=>n.toLocaleString('ru');
  // Revenue
  const el=id=>document.getElementById(id);
  if(el('fmRevenueCalc'))el('fmRevenueCalc').textContent=chairs+' × '+ppc+' × '+wd+' × '+fmt(avg)+' = '+fmt(revenue)+' PLN';
  if(el('s6Revenue'))el('s6Revenue').textContent=fmt(revenue)+' PLN';
  // Expenses — total + breakdown
  if(el('fmExpensesTotal'))el('fmExpensesTotal').textContent=fmt(expenses)+' PLN';
  if(el('fmExpRent'))el('fmExpRent').textContent=fmt(rentM)+' PLN';
  if(el('fmExpStaff'))el('fmExpStaff').textContent=fmt(staff)+' PLN';
  if(el('fmExpFot'))el('fmExpFot').textContent=fmt(fot)+' PLN';
  if(el('fmExpUtils'))el('fmExpUtils').textContent=fmt(utils)+' PLN';
  if(el('fmExpMat'))el('fmExpMat').textContent=fmt(mat)+' PLN';
  if(el('fmExpMkt'))el('fmExpMkt').textContent=fmt(mkt)+' PLN';
  if(el('fmExpOther'))el('fmExpOther').textContent=fmt(oth)+' PLN';
  if(el('fmExpTotal2'))el('fmExpTotal2').textContent=fmt(expenses)+' PLN';
  if(el('fmExpensesCalc'))el('fmExpensesCalc').textContent=fmt(rentM)+' + '+fmt(staff)+' + '+fmt(fot)+' + '+fmt(utils)+' + '+fmt(mat)+' + '+fmt(mkt)+' + '+fmt(oth)+' = '+fmt(expenses)+' PLN';
  // Profit
  const pEl=el('fmProfitTotal');
  if(pEl){pEl.textContent=fmt(profit)+' PLN';pEl.style.color=profit>0?'var(--gn)':'var(--rd)'}
  if(el('fmProfitCalc'))el('fmProfitCalc').textContent=fmt(revenue)+' − '+fmt(expenses)+' = '+fmt(profit)+' PLN';
  // Payback
  if(el('fmPaybackVal'))el('fmPaybackVal').textContent=payback?payback+' мес.':'--';
  if(el('fmPaybackCalc'))el('fmPaybackCalc').textContent=fmt(t.grand)+' ÷ '+fmt(Math.max(profit,0))+' = '+(payback?payback+' мес.':'∞');
  // ROI
  if(el('fmROIVal')){el('fmROIVal').textContent=roi+'%';el('fmROIVal').style.color=roi>50?'var(--gn)':roi>20?'var(--yl)':'var(--rd)'}
  if(el('fmROICalc'))el('fmROICalc').textContent='('+fmt(profit)+' × 12 ÷ '+fmt(t.grand)+') × 100 = '+roi+'%';
  // Margin
  if(el('fmMarginVal')){el('fmMarginVal').textContent=margin+'%';el('fmMarginVal').style.color=margin>30?'var(--gn)':margin>15?'var(--yl)':'var(--rd)'}
  if(el('fmMarginBar')){el('fmMarginBar').style.width=Math.max(0,Math.min(100,margin))+'%';el('fmMarginBar').style.background=margin>30?'var(--gn)':margin>15?'var(--yl)':'var(--rd)'}
  if(el('fmMarginCalc'))el('fmMarginCalc').textContent=fmt(profit)+' ÷ '+fmt(revenue)+' × 100 = '+margin+'%';
}
// ═══════════════ RIGHT PANEL ═══════════════
function updateRightPanel(){
  aiUpdateSuggestions();
  return;
  // LEGACY: old stats panel (replaced by AI chat)
  const rp=document.getElementById('rpContent');
  if(!rp)return;
  const t=calcTotals();
  const profit=t.revenue-t.expenses;
  let html='';

  if(cur==='overview'||cur==='s6'){
    document.getElementById('rpTitle').textContent='Сводка проекта';
    html+=`<div class="rp-sec"><div class="rp-sec-title">Инвестиции</div>
    <div class="rp-mini"><div class="rp-mini-label">Общий бюджет</div><div class="rp-mini-val" style="color:var(--ac2)">${t.grand.toLocaleString('ru')} PLN</div></div>
    <div class="rp-stat"><span class="rp-stat-label">Помещение</span><span class="rp-stat-val ac">${t.rent.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Инженерия</span><span class="rp-stat-val ac">${t.eng.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Оборудование</span><span class="rp-stat-val ac">${t.equip.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Документы</span><span class="rp-stat-val ac">${t.docs.toLocaleString('ru')}</span></div>
    </div>`;
    html+=`<div class="rp-sec"><div class="rp-sec-title">Рентабельность</div>
    <div class="rp-stat"><span class="rp-stat-label">Выручка/мес.</span><span class="rp-stat-val pos">${t.revenue.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Расходы/мес.</span><span class="rp-stat-val neg">${t.expenses.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Прибыль/мес.</span><span class="rp-stat-val ${profit>0?'pos':'neg'}">${profit.toLocaleString('ru')}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Окупаемость</span><span class="rp-stat-val yl">${profit>0?Math.ceil(t.grand/profit)+' мес.':'--'}</span></div>
    </div>`;
    html+=`<div class="rp-sec"><div class="rp-sec-title">Каталог</div>
    <div class="rp-stat"><span class="rp-stat-label">Всего в каталоге</span><span class="rp-stat-val">${DB.suppliers.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Подрядчиков</span><span class="rp-stat-val">${DB.contractors.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Комнат</span><span class="rp-stat-val">${DB.rooms.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Персонал</span><span class="rp-stat-val">${DB.employees.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Процедур</span><span class="rp-stat-val">${DB.services.length}</span></div>
    </div>`;
  }

  if(cur==='s1'){
    document.getElementById('rpTitle').textContent='Помещение';
    if(activeProperty){
      html+=`<div class="rp-sec"><div class="rp-sec-title">Объект</div>
      <div class="rp-mini"><div class="rp-mini-label">Адрес</div><div class="rp-mini-val" style="font-size:14px">${activeProperty.name}</div><div class="rp-mini-sub">${activeProperty.city}</div></div>
      <div class="rp-stat"><span class="rp-stat-label">Площадь</span><span class="rp-stat-val">${activeProperty.area} м²</span></div>
      <div class="rp-stat"><span class="rp-stat-label">Этаж</span><span class="rp-stat-val">${activeProperty.floor}/${activeProperty.floors_total}</span></div>
      <div class="rp-stat"><span class="rp-stat-label">Цена/м²</span><span class="rp-stat-val ac">${activeProperty.price_m2} PLN</span></div>
      </div>`;
    }
    html+=`<div class="rp-sec"><div class="rp-sec-title">Комнаты по типам</div>`;
    const types={};
    DB.rooms.forEach(r=>{types[r.type]=(types[r.type]||0)+1});
    Object.keys(types).forEach(t=>{
      const colors={'Стоматологический':'var(--gn)','Хирургический':'var(--rd)','Ортодонтический':'var(--ac)','Техническая':'var(--yl)','Рентген':'var(--or)','Общественная':'#8b5cf6','Служебная':'var(--tx3)'};
      html+=`<div class="rp-list-item"><span class="rp-dot" style="background:${colors[t]||'var(--tx3)'}"></span><span style="flex:1;color:var(--tx2)">${t}</span><span style="font-weight:700">${types[t]}</span></div>`;
    });
    html+=`</div>`;
  }

  if(cur==='s3'){
    document.getElementById('rpTitle').textContent='Оборудование по статусам';
    let picked=0,total=0;
    document.querySelectorAll('#equipCards .sel').forEach(el=>{
      if(el.classList.contains('picked'))picked++;
      total++;
    });
    html+=`<div class="rp-sec"><div class="rp-sec-title">Статусы</div>
    <div class="rp-mini"><div class="rp-mini-label">В шорт-листе</div><div class="rp-mini-val">${picked}</div></div>
    <div class="rp-mini"><div class="rp-mini-label">Всего в каталоге</div><div class="rp-mini-val">${total}</div></div>
    <div class="rp-progress"><div class="rp-progress-fill" style="width:${total?Math.round(picked/total*100):0}%;background:var(--ac)"></div></div>
    </div>`;
    // By category
    const cats={};
    DB.suppliers.forEach(s=>{cats[s.category]=(cats[s.category]||0)+1});
    html+=`<div class="rp-sec"><div class="rp-sec-title">По категориям</div>`;
    Object.keys(cats).forEach(c=>{
      html+=`<div class="rp-list-item"><span style="flex:1;color:var(--tx2);font-size:10px">${c}</span><span style="font-weight:700;font-size:11px">${cats[c]}</span></div>`;
    });
    html+=`</div>`;
    html+=`<div class="rp-sec"><div class="rp-sec-title">Стоимость выбранного</div>
    <div class="rp-mini"><div class="rp-mini-label">Итого оборудование</div><div class="rp-mini-val" style="color:var(--ac2)">${t.equip.toLocaleString('ru')} PLN</div></div></div>`;
  }

  if(cur==='s2'){
    document.getElementById('rpTitle').textContent='Модернизация';
    html+=`<div class="rp-sec"><div class="rp-sec-title">Инженерные работы</div>
    <div class="rp-mini"><div class="rp-mini-label">Итого инженерия</div><div class="rp-mini-val" style="color:var(--ac2)">${t.eng.toLocaleString('ru')} PLN</div></div>
    </div>`;
  }

  if(cur==='s4'){
    document.getElementById('rpTitle').textContent='Персонал';
    const totalSalary=DB.employees.reduce((s,e)=>s+e.salary,0);
    const fotR=(parseFloat(document.getElementById('fotRateInput')?.value)||20.48)/100;
    const totalFot=Math.round(totalSalary*fotR);
    html+=`<div class="rp-sec"><div class="rp-sec-title">Зарплаты и налоги</div>
    <div class="rp-mini"><div class="rp-mini-label">ЗП / мес.</div><div class="rp-mini-val" style="color:var(--ac2)">${totalSalary.toLocaleString('ru')} PLN</div></div>
    <div class="rp-mini"><div class="rp-mini-label">ФОТ / мес.</div><div class="rp-mini-val" style="color:var(--yl)">${totalFot.toLocaleString('ru')} PLN</div></div>
    <div class="rp-mini"><div class="rp-mini-label">Итого / мес.</div><div class="rp-mini-val" style="color:var(--rd)">${(totalSalary+totalFot).toLocaleString('ru')} PLN</div></div>
    <div class="rp-stat"><span class="rp-stat-label">Позиций</span><span class="rp-stat-val">${DB.employees.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Ср. ЗП</span><span class="rp-stat-val">${DB.employees.length?Math.round(totalSalary/DB.employees.length).toLocaleString('ru'):0}</span></div>
    </div>`;
  }

  if(cur==='s5'){
    document.getElementById('rpTitle').textContent='Прайс-лист';
    const picked=DB.pickedServices||{};
    const pIds=Object.keys(picked);
    let total=0;
    pIds.forEach(id=>{const s=DB.services.find(x=>x.id===id);if(s)total+=(picked[id].customPrice!=null?picked[id].customPrice:s.price)*(picked[id].qty||1)});
    const avgP=pIds.length?Math.round(total/pIds.length):0;
    html+=`<div class="rp-sec"><div class="rp-sec-title">Ценообразование</div>
    <div class="rp-stat"><span class="rp-stat-label">Процедур</span><span class="rp-stat-val">${pIds.length}</span></div>
    <div class="rp-stat"><span class="rp-stat-label">Из каталога</span><span class="rp-stat-val">${DB.services.length}</span></div>
    <div class="rp-mini"><div class="rp-mini-label">Средний чек</div><div class="rp-mini-val" style="color:var(--ac2)">${avgP.toLocaleString('ru')} PLN</div></div>
    </div>`;
  }

  if(cur==='s6'){
    document.getElementById('rpTitle').textContent='Концепция';
  }

  rp.innerHTML=html;
}

// ═══════════════ AI CHAT ═══════════════
let _aiChatHistory=[];
const AI_CHAT_URL=SB_URL+'/functions/v1/ai-chat';

function aiGetContext(){
  const t=calcTotals();
  return{section:cur,budget:t.grand,revenue:t.revenue,expenses:t.expenses,
    rooms:Object.keys(DB.pickedRooms||{}).length,equipment:Object.keys(DB.pickedEquip||{}).length,
    staff:Object.keys(DB.pickedStaff||{}).length,services:Object.keys(DB.pickedServices||{}).length,
    renovations:Object.keys(DB.pickedRenovations||{}).length,docs:Object.keys(DB.pickedDocs||{}).length,
    property:activeProperty?{name:activeProperty.name,area:activeProperty.area,city:activeProperty.city}:null,
    concept:window._currentConceptName||null,bizType:currentBizType||'dental'};
}

function aiAddMessage(text,role,source){
  const el=document.getElementById('aiMessages');
  const msg=document.createElement('div');
  msg.className='ai-msg '+(role==='user'?'user':'bot');
  if(role!=='user'){const lbl=source==='jetson'?'SVITA AI \u00b7 Jetson':source==='claude'?'SVITA AI \u00b7 Claude':'SVITA AI';msg.innerHTML='<div class="ai-label">'+lbl+'</div>'+esc(text).replace(/\n/g,'<br>')}
  else msg.textContent=text;
  el.appendChild(msg);el.scrollTop=el.scrollHeight;
  _aiChatHistory.push({role,content:text});
}

function aiShowTyping(){const el=document.getElementById('aiMessages');const t=document.createElement('div');t.className='ai-typing';t.id='aiTypingIndicator';t.innerHTML='<span></span><span></span><span></span>';el.appendChild(t);el.scrollTop=el.scrollHeight}
function aiHideTyping(){const t=document.getElementById('aiTypingIndicator');if(t)t.remove()}

function aiSuggest(el){document.getElementById('aiChatInput').value=el.textContent;aiChatSend()}

function aiUpdateSuggestions(){
  const sg=document.getElementById('aiSuggestions');if(!sg)return;
  const m={overview:['Оцени концепцию','Что не хватает?','Сравни с рынком'],s1:['Помещение подходит?','Какой район лучше?','Нормы площади'],s2:['Что ремонтировать?','Сколько стоит ремонт?','Нормы SANEPID'],s3:['Какое оборудование?','Минимальный набор','Лучшие бренды'],s4:['Сколько врачей?','Средние зарплаты','Кого нанять первым?'],s5:['Топ процедуры','Средний чек?','Ценообразование'],s6:['Оцени рентабельность','Когда окупится?','Как повысить доход?'],s7:['Какие документы?','Порядок получения','Стоимость оформления']};
  const items=m[cur]||m.overview;
  sg.innerHTML=items.map(s=>'<span class="ai-sug" onclick="aiSuggest(this)">'+esc(s)+'</span>').join('');
}

async function aiChatSend(){
  const inp=document.getElementById('aiChatInput');const text=inp.value.trim();if(!text)return;
  inp.value='';inp.style.height='36px';
  aiAddMessage(text,'user');aiShowTyping();
  document.getElementById('aiChatSendBtn').disabled=true;
  const ctx=aiGetContext();
  try{
    const res=await fetch(AI_CHAT_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+SB_KEY},body:JSON.stringify({message:text,context:ctx,history:_aiChatHistory.slice(-10)})});
    aiHideTyping();
    if(res.ok){const data=await res.json();aiAddMessage(data.reply||data.message||'Ошибка ответа','bot',data.source)}
    else aiAddMessage(aiLocalReply(text,ctx),'bot');
  }catch(e){aiHideTyping();aiAddMessage(aiLocalReply(text,ctx),'bot')}
  document.getElementById('aiChatSendBtn').disabled=false;
  aiUpdateSuggestions();
}

function aiLocalReply(text,ctx){
  const q=text.toLowerCase();const t=calcTotals();
  if(q.includes('бюджет')||q.includes('стоит')||q.includes('оцени'))
    return 'Бюджет: '+t.grand.toLocaleString('ru')+' PLN\nПомещение: '+t.rent.toLocaleString('ru')+'\nОборудование: '+t.equip.toLocaleString('ru')+'\nИнженерия: '+t.eng.toLocaleString('ru')+'\n\nТипичный бюджет клиники в Варшаве: 800K\u20132M PLN.';
  if(q.includes('рентаб')||q.includes('окуп')||q.includes('roi'))
    return 'Выручка: '+t.revenue.toLocaleString('ru')+' PLN/мес\nРасходы: '+t.expenses.toLocaleString('ru')+' PLN/мес\nПрибыль: '+(t.revenue-t.expenses).toLocaleString('ru')+' PLN/мес\nОкупаемость: '+(t.revenue>t.expenses?Math.ceil(t.grand/(t.revenue-t.expenses))+' мес.':'\u2014');
  if(q.includes('оборудов')||q.includes('минимал'))
    return 'Минимум для стоматологии:\n\u2022 3\u20135 установок\n\u2022 Автоклав\n\u2022 Рентген (ОПТГ/КЛКТ)\n\u2022 Компрессор + аспиратор\n\u2022 Мебель\n\nВыбрано: '+ctx.equipment+' из '+DB.suppliers.length;
  if(q.includes('персонал')||q.includes('сотрудник')||q.includes('врач'))
    return 'Минимальный штат:\n\u2022 2\u20133 стоматолога\n\u2022 1 хирург\n\u2022 1\u20132 ассистента\n\u2022 1 администратор\n\u2022 1 гигиенист\n\nВыбрано: '+ctx.staff+' сотрудников';
  if(q.includes('помещ')||q.includes('район'))
    return ctx.property?'Объект: '+ctx.property.name+', '+ctx.property.area+' м\u00B2\n\nДля 5\u20137 кресел: 150\u2013250 м\u00B2\nЛучшие районы: Mokot\u00F3w, Wola, \u015Ar\u00F3dmie\u015Bcie':'Помещение не выбрано. Откройте раздел \u00ABПомещение\u00BB.';
  if(q.includes('документ')||q.includes('лицензи'))
    return 'Ключевые документы:\n\u2022 Wpis do RPWDL\n\u2022 SANEPID разрешение\n\u2022 NIP/REGON\n\u2022 Страхование OC\n\u2022 Пожарная безопасность\n\nОформлено: '+ctx.docs+' из 103';
  if(q.includes('не хватает')||q.includes('что дальше'))
    return 'Статус:\n'+(ctx.property?'\u2705':'\u274C')+' Помещение\n'+(ctx.renovations>0?'\u2705':'\u274C')+' Модернизация ('+ctx.renovations+')\n'+(ctx.equipment>0?'\u2705':'\u274C')+' Оборудование ('+ctx.equipment+')\n'+(ctx.staff>0?'\u2705':'\u274C')+' Персонал ('+ctx.staff+')\n'+(ctx.services>0?'\u2705':'\u274C')+' Услуги ('+ctx.services+')\n'+(ctx.docs>0?'\u2705':'\u274C')+' Документы ('+ctx.docs+')';
  return 'Могу помочь с:\n\u2022 Бюджет и рентабельность\n\u2022 Подбор оборудования\n\u2022 Рекомендации по персоналу\n\u2022 Документы и лицензии\n\u2022 Анализ помещения\n\nЗадайте вопрос!';
}

// ═══════════════ CONCEPT MATURITY ═══════════════
const MATURITY_LEVELS=[
  {id:'L1',name:'Фундамент',color:'#3b82f6',
    params:[
      {key:'property',label:'Помещение',check:()=>!!activeProperty,weight:40},
      {key:'floorplan',label:'Планировка',check:()=>FP&&FP.rooms&&FP.rooms.length>=1,weight:30},
      {key:'bizType',label:'Тип бизнеса',check:()=>!!currentBizType,weight:20},
      {key:'concept',label:'Концепция сохранена',check:()=>!!window._currentConceptId,weight:10}
    ]},
  {id:'L2',name:'Инфраструктура',color:'#8b5cf6',
    params:[
      {key:'renovations',label:'Модернизация',check:()=>Object.keys(DB.pickedRenovations||{}).length>=3,weight:35},
      {key:'equipment',label:'Оснащение',check:()=>Object.keys(DB.pickedEquip||{}).length>=5,weight:35},
      {key:'services',label:'Услуги',check:()=>Object.keys(DB.pickedServices||{}).length>=3,weight:30}
    ]},
  {id:'L3',name:'Запуск',color:'#16a34a',
    params:[
      {key:'staff',label:'Персонал',check:()=>Object.keys(DB.pickedStaff||{}).length>=2,weight:30},
      {key:'docs',label:'Документы',check:()=>Object.keys(DB.pickedDocs||{}).length>=3,weight:30},
      {key:'budget',label:'Бюджет > 0',check:()=>{const t=calcTotals();return t.grand>0},weight:20},
      {key:'profit',label:'Рентабельность',check:()=>{const t=calcTotals();return t.revenue>t.expenses&&t.revenue>0},weight:20}
    ]}
];

function conceptMaturity(){
  const levels=MATURITY_LEVELS.map(lv=>{
    let score=0,total=0;
    const items=lv.params.map(p=>{
      const done=p.check();
      total+=p.weight;
      if(done)score+=p.weight;
      return{key:p.key,label:p.label,done,weight:p.weight};
    });
    return{id:lv.id,name:lv.name,color:lv.color,score,total,pct:total?Math.round(score/total*100):0,items};
  });
  const overall=levels.reduce((a,l)=>a+l.score,0);
  const overallTotal=levels.reduce((a,l)=>a+l.total,0);
  return{levels,overall:overallTotal?Math.round(overall/overallTotal*100):0};
}

function renderMaturity(){
  const el=document.getElementById('maturityPanel');if(!el)return;
  const m=conceptMaturity();
  let html='<div style="margin-bottom:12px"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px"><span style="font-size:11px;font-weight:700">Зрелость концепции</span><span style="font-size:18px;font-weight:800;color:'+maturityColor(m.overall)+'">'+m.overall+'%</span></div>';
  html+='<div style="height:6px;border-radius:3px;background:var(--bd);overflow:hidden"><div style="height:100%;width:'+m.overall+'%;border-radius:3px;background:'+maturityColor(m.overall)+';transition:width .4s"></div></div></div>';
  m.levels.forEach((lv,i)=>{
    const prev=i>0?m.levels[i-1]:null;
    const locked=prev&&prev.pct<50;
    html+='<div style="margin-bottom:10px;opacity:'+(locked?'.4':'1')+'">';
    html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><span style="font-size:10px;font-weight:700;color:'+lv.color+'">'+lv.name+(locked?' &#128274;':'')+'</span><span style="font-size:10px;font-weight:700;color:'+lv.color+'">'+lv.pct+'%</span></div>';
    html+='<div style="height:4px;border-radius:2px;background:var(--bd);overflow:hidden;margin-bottom:6px"><div style="height:100%;width:'+lv.pct+'%;border-radius:2px;background:'+lv.color+';transition:width .4s"></div></div>';
    lv.items.forEach(it=>{
      html+='<div style="display:flex;align-items:center;gap:6px;padding:2px 0;font-size:10px;color:'+(it.done?'var(--tx)':'var(--tx3)')+'">';
      html+='<span style="font-size:11px">'+(it.done?'&#9989;':'&#9898;')+'</span>';
      html+='<span style="flex:1">'+it.label+'</span>';
      html+='<span style="font-size:9px;font-weight:600;color:'+(it.done?'var(--gn)':'var(--tx3)')+'">'+it.weight+'pt</span>';
      html+='</div>';
    });
    html+='</div>';
  });
  el.innerHTML=html;
  const sc=document.getElementById('maturityScore');
  if(sc){sc.textContent=m.overall+'%';sc.style.color=maturityColor(m.overall)}
}

function maturityColor(pct){
  if(pct>=75)return'#16a34a';
  if(pct>=40)return'#ca8a04';
  return'#dc2626';
}

// ═══════════════ TOP CONCEPT INDICATOR ═══════════════
function updateTopConcept(){
  const el=document.getElementById('topConcept');if(!el)return;
  const name=window._currentConceptName;
  if(name){
    const t=calcTotals();
    const m=conceptMaturity();
    el.innerHTML='&#128203; '+esc(name)+' &middot; '+t.grand.toLocaleString('ru')+' PLN <span style="margin-left:6px;font-size:10px;font-weight:700;color:'+maturityColor(m.overall)+'">'+m.overall+'%</span>';
    el.style.display='inline-block';
  }else{el.style.display='none'}
}

// ═══════════════ PHOTO UPLOAD ═══════════════
let itemImages={};

function uploadPhoto(table,id){
  const inp=document.createElement('input');
  inp.type='file';inp.accept='image/*';
  inp.onchange=function(){
    const file=inp.files[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=function(e){
      const key=table+'_'+id;
      itemImages[key]=e.target.result;
      uSet('svita_images',JSON.stringify(itemImages));
      renderAll();
    };
    reader.readAsDataURL(file);
  };
  inp.click();
}

function getItemImg(table,id){
  const url=itemImages[table+'_'+id]||'';
  if(url&&!url.startsWith('https://')&&!url.startsWith('data:image/'))return '';
  return url;
}

// ═══════════════ LIGHTBOX ═══════════════
function openLightbox(table,id){
  const img=getItemImg(table,id);
  if(!img)return;
  const lb=document.getElementById('lightbox');
  document.getElementById('lbImg').src=img;
  lb.dataset.table=table;
  lb.dataset.id=id;
  lb.classList.add('vis');
}
function closeLightbox(){document.getElementById('lightbox').classList.remove('vis')}
function lbReplace(){
  const lb=document.getElementById('lightbox');
  closeLightbox();
  uploadPhoto(lb.dataset.table,parseInt(lb.dataset.id));
}
function lbDelete(){
  const lb=document.getElementById('lightbox');
  const key=lb.dataset.table+'_'+lb.dataset.id;
  delete itemImages[key];
  uSet('svita_images',JSON.stringify(itemImages));
  closeLightbox();
  renderAll();
}

// ═══════════════ GUIDED TOUR ═══════════════
const TOUR_STEPS=[
  {target:'.sidebar',pos:'right',title:'Sidebar — навигация',text:'Здесь вся навигация: этапы концепции, каталоги, аналитика. Вкладки — это этапы запуска вашего заведения.'},
  {target:'[data-nav="account"]',pos:'right',title:'Личный кабинет',text:'Начните здесь — заполните профиль: имя, контакты, роль. Данные сохранятся автоматически.'},
  {target:'[data-nav="s6"]',pos:'right',title:'Концепция',text:'Заполните бизнес-модель: тип учреждения, бренд, город, формат, аудиторию. Это основа вашего проекта.'},
  {target:'.sidebar-group:last-of-type',pos:'right',title:'Каталог — базы данных',text:'Здесь каталоги: помещения, оборудование, подрядчики, сотрудники, процедуры. Выбирайте позиции — они добавятся в вашу концепцию.'},
  {target:'[data-nav="s1"]',pos:'right',title:'Таб 1 · Помещение',text:'Найдите помещение из каталога или добавьте своё. Нарисуйте план: кабинеты, стерилизаторную, ресепшен.'},
  {target:'[data-nav="s2"]',pos:'right',title:'Таб 2 · Модернизация',text:'Ремонт и подготовка помещения. Электрика, вентиляция, отделка. Добавляйте конкретные действия с ценами.'},
  {target:'[data-nav="s3"]',pos:'right',title:'Таб 3 · Оснащение',text:'Оборудование из каталога. Назначайте по кабинетам, указывайте количество.'},
  {target:'[data-nav="s4"]',pos:'right',title:'Таб 4 · Персонал',text:'Врачи, ассистенты, администраторы. Укажите ставки — ФОТ рассчитается автоматически.'},
  {target:'[data-nav="s5"]',pos:'right',title:'Таб 5 · Прайс-лист',text:'Стоматологические услуги. Формирует средний чек и прогноз выручки.'},
  {target:'[data-nav="budget"]',pos:'right',title:'Бюджет и рентабельность',text:'Итоговые цифры: стартовые вложения, ФОТ, выручка, окупаемость. Всё считается автоматически.'},
  {target:'.sidebar',pos:'right',title:'Готово!',text:'Заполняйте этапы по порядку — прогресс виден в обзоре. Удачи с проектом!'}
];
let tourCur=0;
function tourRender(){
  const s=TOUR_STEPS[tourCur];
  const tt=document.getElementById('tourTooltip');
  const hl=document.getElementById('tourHighlight');
  document.getElementById('tourStep').textContent=`Шаг ${tourCur+1} из ${TOUR_STEPS.length}`;
  document.getElementById('tourTitle').textContent=s.title;
  document.getElementById('tourText').textContent=s.text;
  document.getElementById('tourBack').style.display=tourCur>0?'inline-flex':'none';
  document.getElementById('tourNext').textContent=tourCur===TOUR_STEPS.length-1?'Начать работу':'Далее';
  document.getElementById('tourDots').innerHTML=TOUR_STEPS.map((_,i)=>`<div style="width:${i===tourCur?'12px':'5px'};height:5px;border-radius:3px;background:${i===tourCur?'var(--ac)':'var(--bd)'};transition:all .2s"></div>`).join('');
  // Position tooltip near target element
  const el=document.querySelector(s.target);
  if(el){
    const r=el.getBoundingClientRect();
    hl.style.display='block';
    hl.style.top=(r.top-4)+'px';hl.style.left=(r.left-4)+'px';
    hl.style.width=(r.width+8)+'px';hl.style.height=(r.height+8)+'px';
    tt.style.display='block';
    // Position tooltip to the right of the element
    let top=Math.max(8,r.top);
    let left=r.right+16;
    if(left+350>window.innerWidth){left=Math.max(8,r.left-360)}
    if(top+200>window.innerHeight){top=Math.max(8,window.innerHeight-220)}
    tt.style.top=top+'px';tt.style.left=left+'px';
    el.scrollIntoView({behavior:'smooth',block:'nearest'});
  }else{
    hl.style.display='none';
    tt.style.display='block';
    tt.style.top='50%';tt.style.left='50%';tt.style.transform='translate(-50%,-50%)';
  }
}
function tourNav(d){
  tourCur+=d;
  if(tourCur>=TOUR_STEPS.length){endTour();return}
  if(tourCur<0)tourCur=0;
  tourRender();
}
function endTour(){
  document.getElementById('tourTooltip').style.display='none';
  document.getElementById('tourHighlight').style.display='none';
  uSet('svita_onboarded','1');
}
function startOnboarding(){
  tourCur=0;
  tourRender();
}

// ═══════════════ COOKIE CONSENT ═══════════════
if(!localStorage.getItem('svita_cookies')){document.getElementById('cookieConsent').style.display='block'}
function cookieAccept(){localStorage.setItem('svita_cookies','accepted');document.getElementById('cookieConsent').style.display='none'}
function cookieDecline(){localStorage.setItem('svita_cookies','declined');document.getElementById('cookieConsent').style.display='none'}

// ═══════════════ INIT ═══════════════
document.getElementById('loginEmail').focus();
updateRightPanel();
