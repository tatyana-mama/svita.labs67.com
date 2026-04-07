// ═══════════════ UI HELPERS ═══════════════
function toggleGrp(head){
  head.querySelector('.proc-grp-arrow').classList.toggle('open');
  head.nextElementSibling.classList.toggle('open');
}
function toggleCheck(el){
  el.classList.toggle('ok');
  const txt=el.nextElementSibling;
  if(el.classList.contains('ok')){el.textContent='\u2713';if(txt)txt.classList.add('dn')}
  else{el.textContent='';if(txt)txt.classList.remove('dn')}
  recalc();
}

// ═══════════════ RENDER DB CARDS ═══════════════
function renderAll(){
  const fns=[renderProperty,renderPremises,renderContractors,renderEmployees,renderVendors,renderEquip,renderSelectedEquip,renderRenovationsCatalog,renderRenServices,renderSelectedRenovations,renderStaff,renderServices,renderSelectedServices,renderUsers,renderCabinetTypes,renderPickedRooms,renderPickedContractors,renderZones,renderDocCatalog,renderDocs,loadPropertyParams,updateRightPanel,renderOwnerProposals];
  fns.forEach(fn=>{try{fn()}catch(e){console.error('[SVITA] renderAll error in '+fn.name+':',e)}});
}

function renderOwnerProposals(){
  const c=document.getElementById('ownerProposals');if(!c)return;
  const props=DB.proposals||[];
  document.getElementById('proposalCount').textContent=props.length+' предложений';
  if(!props.length){c.innerHTML='<div style="text-align:center;color:var(--tx3);font-size:12px;padding:16px">Пока нет предложений от подрядчиков</div>';return}
  c.innerHTML=props.map(p=>{
    const statusColor=p.status==='accepted'?'var(--gn)':p.status==='rejected'?'var(--rd)':'var(--yl)';
    const statusText=p.status==='accepted'?'Принято':p.status==='rejected'?'Отклонено':'Новое';
    return `<div style="border:1px solid var(--bd);border-radius:10px;padding:14px;margin-bottom:8px">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
<div><div style="font-size:13px;font-weight:600">${esc(p.contractor_name)}</div><div style="font-size:10px;color:var(--tx3)">${esc(p.contractor_email)} · ${new Date(p.created_at).toLocaleDateString()}</div></div>
<span style="font-size:10px;padding:3px 8px;border-radius:5px;background:${statusColor}22;color:${statusColor};font-weight:600">${statusText}</span>
</div>
<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">${p.items.map(i=>`<span style="font-size:10px;padding:3px 8px;border:1px solid var(--bd);border-radius:5px">${esc(i.name)}: ${i.price.toLocaleString()} PLN</span>`).join('')}</div>
<div style="display:flex;justify-content:space-between;align-items:center">
<div style="font-size:14px;font-weight:700">${p.total.toLocaleString()} PLN</div>
<div style="display:flex;gap:4px">
${p.status==='sent'?`<button class="btn sm gn" onclick="respondProposal('${p.id}','accepted')">Принять</button><button class="btn sm" onclick="respondProposal('${p.id}','rejected')">Отклонить</button>`:''}
</div></div></div>`;
  }).join('');
}

async function respondProposal(id,status){
  const p=DB.proposals.find(x=>x.id===id);
  if(p)p.status=status;
  if(sb)await sb.from('proposals').update({status}).eq('id',id);
  renderOwnerProposals();
}

let premiseViewMode='grid';
function setPremiseView(mode){
  premiseViewMode=mode;
  document.querySelectorAll('#premiseViewToggle button').forEach(b=>b.style.background='transparent');
  const btn=document.getElementById(mode==='grid'?'pvGrid':mode==='list'?'pvList':'pvCompact');
  if(btn)btn.style.background='var(--acbg)';
  renderPremises();
}
function renderPremises(){
  const c=document.getElementById('premiseCards');if(!c)return;
  if(!DB.premises.length){c.innerHTML='<div style="padding:32px;text-align:center;color:var(--tx3);font-size:13px">Нет объектов. Добавьте помещение вручную или загрузите из каталога.</div>';return}
  // Highlight active view button
  document.querySelectorAll('#premiseViewToggle button').forEach(b=>b.style.background='transparent');
  const vBtn=document.getElementById(premiseViewMode==='grid'?'pvGrid':premiseViewMode==='list'?'pvList':'pvCompact');
  if(vBtn)vBtn.style.background='var(--acbg)';
  if(premiseViewMode==='list'){renderPremisesList(c);return}
  if(premiseViewMode==='compact'){renderPremisesCompact(c);return}
  c.innerHTML=DB.premises.map(p=>{
    const sp=p.specs||{};
    const addr=esc(sp.address||p.name||'—');
    const district=esc(sp.district||'');
    const city=sp.city?esc(sp.city)+(district?', '+district:''):'';
    const owner=esc(sp.owner_name||'');
    const phone=esc(sp.owner_phone||'');
    const area=sp.area||0;
    const floors=sp.floors||'';
    const floor=sp.floor!=null?sp.floor:'';
    const priceM2=sp.price_m2?sp.price_m2+' PLN/м²':'';
    const priceTotal=p.price?p.price.toLocaleString('ru')+' PLN/мес':'—';
    const condition=esc(sp.condition||'');
    const purpose=esc(sp.purpose||'');
    const height=sp.height||'';
    const rooms=sp.rooms||'';
    const status=p.status||'candidate';
    const statusColors={candidate:'#eab308',shortlist:'#3b82f6',ordered:'#8b5cf6',delivered:'#22c55e',rejected:'#ef4444'};
    const statusLabels={candidate:'Кандидат',shortlist:'В шортлисте',ordered:'Забронировано',delivered:'Получено',rejected:'Отклонён'};
    // Communications badges
    const comms=[];
    if(sp.has_water)comms.push('💧');
    if(sp.has_sewage)comms.push('🚿');
    if(sp.has_ventilation)comms.push('🌀');
    if(sp.has_heating)comms.push('🔥');
    if(sp.has_ac)comms.push('❄️');
    if(sp.has_parking)comms.push('🅿️');
    if(sp.has_elevator)comms.push('🛗');
    if(sp.has_display_window)comms.push('🪟');
    const pid=p.id;
    return `<div class="db-card" style="overflow:hidden">
${p.img?`<div style="background-image:url(${p.img});background-size:cover;background-position:center;min-height:140px;border-radius:8px 8px 0 0;position:relative"><div style="position:absolute;top:8px;right:8px;padding:3px 8px;border-radius:6px;font-size:9px;font-weight:700;color:#fff;background:${statusColors[status]||'#eab308'}">${statusLabels[status]||status}</div></div>`:`<div class="db-card-head" style="flex-wrap:wrap;gap:6px"><span class="db-card-name" style="font-size:14px">${addr}</span><span class="db-card-role" style="background:${statusColors[status]||'#eab308'};color:#fff;font-size:9px">${statusLabels[status]||status}</span></div>`}
<div style="padding:10px 16px 0">
${p.img?`<div style="font-size:14px;font-weight:600;color:var(--tx);margin-bottom:2px">${addr}</div>`:''}
${city?`<div style="font-size:11px;color:var(--tx3);margin-bottom:6px">${city}</div>`:''}
</div>
<div class="db-card-grid" style="grid-template-columns:repeat(3,1fr)">
<div class="db-card-field"><div class="db-card-label">Цена/мес</div><div class="db-card-val" style="color:var(--ac);font-weight:700">${priceTotal}</div></div>
<div class="db-card-field"><div class="db-card-label">Площадь</div><div class="db-card-val">${area} м²</div></div>
<div class="db-card-field"><div class="db-card-label">Этаж</div><div class="db-card-val">${floor!=''?floor+'/'+(floors||'?'):'—'}</div></div>
${priceM2?`<div class="db-card-field"><div class="db-card-label">Цена/м²</div><div class="db-card-val">${priceM2}</div></div>`:''}
${height?`<div class="db-card-field"><div class="db-card-label">Высота</div><div class="db-card-val">${height} м</div></div>`:''}
${rooms?`<div class="db-card-field"><div class="db-card-label">Комнат</div><div class="db-card-val">${rooms}</div></div>`:''}
</div>
${condition||purpose?`<div style="padding:2px 16px;display:flex;gap:6px;flex-wrap:wrap">${condition?`<span style="font-size:9px;padding:2px 8px;border-radius:4px;background:var(--sf2);color:var(--tx2)">${condition}</span>`:''}${purpose?`<span style="font-size:9px;padding:2px 8px;border-radius:4px;background:var(--acbg);color:var(--ac2)">${purpose}</span>`:''}</div>`:''}
${comms.length?`<div style="padding:4px 16px;font-size:12px;letter-spacing:2px" title="Коммуникации">${comms.join('')}</div>`:''}
${owner||phone?`<div style="padding:4px 16px;display:flex;gap:12px;font-size:10px;color:var(--tx3)">${owner?`<span>👤 ${owner}</span>`:''}${phone?`<span>📞 ${phone}</span>`:''}</div>`:''}
${p.notes?`<div style="padding:4px 16px 8px;font-size:10px;color:var(--tx3);line-height:1.4">${esc(p.notes)}</div>`:''}
<div class="db-card-actions">
<button class="btn sm pr" onclick="selectPremiseAsProperty('${pid}')">Выбрать → Таб 1</button>
${p.source?`<a href="${safeHref(p.source)}" target="_blank" rel="noopener" class="btn sm" style="text-decoration:none;text-align:center">Источник</a>`:''}
<button class="btn sm" onclick="editPremise('${pid}')">Ред.</button>
<button class="btn sm" onclick="delPremise('${pid}')">Удалить</button>
</div></div>`;
  }).join('');
}
function renderPremisesList(c){
  const statusLabels={candidate:'Кандидат',shortlist:'Шортлист',ordered:'Бронь',delivered:'Получено',rejected:'Отклонён'};
  const statusColors={candidate:'#eab308',shortlist:'#3b82f6',ordered:'#8b5cf6',delivered:'#22c55e',rejected:'#ef4444'};
  let html='<table class="dt" style="font-size:11px"><thead><tr><th>Адрес</th><th>Район</th><th>Площадь</th><th>Цена/мес</th><th>Этаж</th><th>Статус</th><th></th></tr></thead><tbody>';
  DB.premises.forEach(p=>{
    const sp=p.specs||{};const s=p.status||'candidate';
    html+=`<tr><td style="font-weight:600">${esc(sp.address||p.name||'—')}</td><td>${esc(sp.district||'')}</td><td>${sp.area||0} м²</td><td style="color:var(--ac);font-weight:600">${p.price?p.price.toLocaleString('ru')+' PLN':'—'}</td><td>${sp.floor!=null?sp.floor:''}</td><td><span style="color:${statusColors[s]};font-weight:600;font-size:10px">${statusLabels[s]||s}</span></td><td style="white-space:nowrap"><button class="btn sm pr" onclick="selectPremiseAsProperty('${p.id}')" style="padding:2px 6px;font-size:9px">→ Таб 1</button> <button class="btn sm" onclick="editPremise('${p.id}')" style="padding:2px 6px;font-size:9px">Ред.</button></td></tr>`;
  });
  html+='</tbody></table>';
  c.innerHTML=html;
}
function renderPremisesCompact(c){
  const statusLabels={candidate:'Кандидат',shortlist:'Шортлист',ordered:'Бронь',delivered:'Получено',rejected:'Отклонён'};
  const statusColors={candidate:'#eab308',shortlist:'#3b82f6',ordered:'#8b5cf6',delivered:'#22c55e',rejected:'#ef4444'};
  let html='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:8px">';
  DB.premises.forEach(p=>{
    const sp=p.specs||{};const s=p.status||'candidate';
    html+=`<div style="border:1px solid var(--bd);border-radius:8px;padding:10px;cursor:pointer" onclick="selectPremiseAsProperty('${p.id}')">
<div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:4px"><div style="font-size:12px;font-weight:600;color:var(--tx)">${esc(sp.address||p.name||'—')}</div><span style="font-size:8px;padding:2px 6px;border-radius:4px;background:${statusColors[s]||'#eab308'}22;color:${statusColors[s]||'#eab308'};font-weight:600;white-space:nowrap">${statusLabels[s]||s}</span></div>
<div style="font-size:10px;color:var(--tx3)">${esc(sp.district||'')}${sp.city?' · '+esc(sp.city):''}</div>
<div style="display:flex;gap:8px;margin-top:6px;font-size:10px"><span style="color:var(--ac);font-weight:600">${p.price?p.price.toLocaleString('ru')+' PLN':'—'}</span><span>${sp.area||0} м²</span></div>
</div>`;
  });
  html+='</div>';
  c.innerHTML=html;
}

function selectPremiseAsProperty(id){
  const p=DB.premises.find(x=>x.id===id);if(!p)return;
  const sp=p.specs||{};
  const area=sp.area||0;
  const side=Math.round(Math.sqrt(area)*10)/10;
  activeProperty={id:p.id,name:sp.address||p.name,city:sp.city+(sp.district?', '+sp.district:''),area:area,floor:sp.floor||0,floors_total:sp.floors||1,length:side,width:area?Math.round(area/side*10)/10:0,height:sp.height||2.9,type:sp.type||'Коммерческое',purpose:sp.purpose||'usługowy',price_m2:sp.price_m2||(area?Math.round(p.price/area):0),source:p.source||''};
  uSet('svita_property',JSON.stringify(activeProperty));
  renderProperty();buildSidebar();recalc();nav('s1');
}

function editPremise(id){
  const p=DB.premises.find(x=>x.id===id);if(!p)return;
  openModal('premise');
  editingId=id;
  const sp=p.specs||{};
  const vals={name:sp.address||p.name,city:sp.city||'',area:sp.area||'',owner_name:sp.owner_name||'',owner_phone:sp.owner_phone||'',floors:sp.floors||'',price:sp.price_m2||'',notes:p.notes||'',source:p.source||''};
  Object.keys(vals).forEach(k=>{const el=document.getElementById('mf_'+k);if(el)el.value=vals[k]});
}

function delPremise(id){
  if(!confirm('Удалить это помещение из базы?'))return;
  DB.premises=DB.premises.filter(x=>x.id!=id);
  if(sb)sb.from('equipment').delete().eq('id',id).then(()=>{});
  renderPremises();buildSidebar();
}

/* ── Contractor: view available works and create proposals ── */
if(!DB.proposals)DB.proposals=[];
let contractorSelected={};

function renderContractorWorks(){
  const c=document.getElementById('contractorWorksList');if(!c)return;
  // Show all renovation items that owners have picked
  const allRens=DB.renovations;
  const cats={};
  allRens.forEach(r=>{if(!cats[r.cat])cats[r.cat]=[];cats[r.cat].push(r)});
  const catKeys=Object.keys(cats).sort();
  if(!catKeys.length){c.innerHTML='<div class="c"><div class="cb" style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Нет доступных работ</div></div>';return}

  let html='';
  catKeys.forEach(cat=>{
    html+=`<div class="c" style="margin-bottom:12px"><div class="ch"><h3>${cat}</h3><span style="font-size:10px;color:var(--tx3)">${cats[cat].length} работ</span></div><div class="cb">`;
    cats[cat].forEach(r=>{
      const sel=!!contractorSelected[r.id];
      const unit=r.unit?` (${r.baseVal||''} ${r.unit})`:'';
      html+=`<div class="db-card" style="${sel?'border-color:var(--gn);background:rgba(34,197,94,.04)':''}">
<div class="db-card-head"><span class="db-card-name">${r.name}${unit}</span></div>
<div class="db-card-grid">
<div class="db-card-field"><div class="db-card-label">Категория</div><div class="db-card-val">${r.cat}</div></div>
<div class="db-card-field"><div class="db-card-label">Базовая цена</div><div class="db-card-val">${r.price.toLocaleString()} PLN</div></div>
${sel?`<div class="db-card-field" style="grid-column:1/3"><div class="db-card-label">Ваша цена (PLN)</div><input type="number" value="${contractorSelected[r.id].price||r.price}" onchange="contractorSelected['${r.id}'].price=+this.value" style="width:100%;padding:6px 8px;font-size:12px;border:1px solid var(--bd);border-radius:6px;background:var(--sf2);color:var(--tx);font-family:var(--f)"></div>
<div class="db-card-field" style="grid-column:1/3"><div class="db-card-label">Комментарий</div><input type="text" placeholder="Сроки, условия..." value="${contractorSelected[r.id].note||''}" onchange="contractorSelected['${r.id}'].note=this.value" style="width:100%;padding:6px 8px;font-size:12px;border:1px solid var(--bd);border-radius:6px;background:var(--sf2);color:var(--tx);font-family:var(--f)"></div>`:''}
</div>
<div class="db-card-actions"><button class="btn sm ${sel?'gn':'pr'}" onclick="toggleContractorWork('${r.id}',${r.price})">${sel?'&#10003; Выбрано':'+ Я делаю это'}</button></div>
</div>`;
    });
    html+='</div></div>';
  });

  const selCount=Object.keys(contractorSelected).length;
  if(selCount){
    html+=`<div style="position:sticky;bottom:0;padding:16px;background:var(--sf);border-top:1px solid var(--bd);display:flex;justify-content:space-between;align-items:center">
<div><strong>${selCount}</strong> работ выбрано · <strong>${Object.values(contractorSelected).reduce((s,v)=>s+(v.price||0),0).toLocaleString()} PLN</strong></div>
<button class="btn pr" onclick="sendProposal()" style="padding:10px 24px">&#128196; Отправить КП</button>
</div>`;
  }
  c.innerHTML=html;
}

function toggleContractorWork(id,basePrice){
  if(contractorSelected[id])delete contractorSelected[id];
  else contractorSelected[id]={price:basePrice,note:''};
  renderContractorWorks();
}

async function sendProposal(){
  const items=Object.entries(contractorSelected).map(([id,v])=>{
    const r=DB.renovations.find(x=>x.id===id);
    return{id,name:r?r.name:id,cat:r?r.cat:'',price:v.price,note:v.note};
  });
  if(!items.length)return;
  const total=items.reduce((s,i)=>s+i.price,0);
  const proposal={
    id:'prop_'+Date.now(),
    contractor_email:currentUser?.email||'',
    contractor_name:currentUser?.name||'',
    items,total,
    status:'sent',
    created_at:new Date().toISOString()
  };
  DB.proposals.push(proposal);
  if(sb){
    await sb.from('proposals').upsert(proposal).then(()=>{});
  }
  contractorSelected={};
  renderContractorWorks();
  alert('Коммерческое предложение отправлено! Сумма: '+total.toLocaleString()+' PLN');
  nav('contractor-proposals');
}

function renderContractorProposals(){
  const c=document.getElementById('contractorProposalsList');if(!c)return;
  const mine=DB.proposals.filter(p=>p.contractor_email===currentUser?.email);
  if(!mine.length){c.innerHTML='<div class="c"><div class="cb" style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Вы ещё не отправляли предложений</div></div>';return}
  c.innerHTML=mine.map(p=>{
    const statusColor=p.status==='accepted'?'var(--gn)':p.status==='rejected'?'var(--rd)':'var(--or)';
    const statusText=p.status==='accepted'?'Принято':p.status==='rejected'?'Отклонено':'На рассмотрении';
    return `<div class="c" style="margin-bottom:12px"><div class="ch"><h3>КП от ${new Date(p.created_at).toLocaleDateString()}</h3><span style="font-size:10px;padding:3px 8px;border-radius:5px;background:${statusColor}22;color:${statusColor};font-weight:600">${statusText}</span></div>
<div class="cb" style="padding:12px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
${p.items.map(i=>`<div style="padding:8px 10px;border:1px solid var(--bd);border-radius:6px;font-size:11px"><div style="font-weight:600">${esc(i.name)}</div><div style="color:var(--tx3);margin-top:2px">${esc(i.cat)} · ${i.price.toLocaleString()} PLN</div>${i.note?`<div style="color:var(--tx2);margin-top:2px;font-style:italic">${esc(i.note)}</div>`:''}</div>`).join('')}
</div><div style="text-align:right;font-size:14px;font-weight:700">Итого: ${p.total.toLocaleString()} PLN</div></div></div>`;
  }).join('');
}

function renderContractors(){
  const c=document.getElementById('contractorCards');if(!c)return;
  c.innerHTML=DB.contractors.map(r=>{
    return `<div class="db-card"><div class="db-card-head"><span class="db-card-name">${esc(r.name)}</span><span class="db-card-role" style="background:rgba(249,115,22,.1);color:var(--or)">${esc(r.spec)}</span></div><div class="db-card-grid"><div class="db-card-field"><div class="db-card-label">Город</div><div class="db-card-val">${esc(r.city)}</div></div><div class="db-card-field"><div class="db-card-label">Ставка</div><div class="db-card-val">${esc(r.price)}</div></div><div class="db-card-field"><div class="db-card-label">Рейтинг</div><div class="db-card-val">${r.rating} ★</div></div><div class="db-card-field"><div class="db-card-label">Контакт</div><div class="db-card-val">${esc(r.phone)}</div></div></div></div>`;
  }).join('');
}

function renderVendors(){
  const c=document.getElementById('vendorCards');if(!c)return;
  if(!DB.vendorCompanies.length){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Нет поставщиков</div>';return}
  c.innerHTML=DB.vendorCompanies.map(v=>{
    const tags=(v.tags||[]).map(t=>`<span style="display:inline-block;font-size:9px;padding:2px 8px;border-radius:4px;background:var(--acbg);color:var(--ac2);margin:2px">${esc(t)}</span>`).join('');
    return `<div class="db-card"><div class="db-card-head"><span class="db-card-name">${esc(v.name)}</span><span class="db-card-role" style="background:rgba(139,92,246,.1);color:#8b5cf6">${esc(v.city||'')}</span></div><div style="padding:0 16px 8px;font-size:11px;color:var(--tx2);line-height:1.4">${esc(v.desc)}</div>${tags?`<div style="padding:0 16px 8px">${tags}</div>`:''}<div class="db-card-grid"><div class="db-card-field"><div class="db-card-label">Телефон</div><div class="db-card-val">${esc(v.phone||'—')}</div></div><div class="db-card-field"><div class="db-card-label">Сайт</div><div class="db-card-val">${v.website?`<a href="${safeHref('https://'+v.website)}" target="_blank" rel="noopener" style="color:var(--ac2);text-decoration:none">${esc(v.website)}</a>`:'—'}</div></div></div><div class="db-card-actions"><button class="btn sm" onclick="delVendor('${v.id}')">Удалить</button></div></div>`;
  }).join('');
}
function delVendor(id){
  if(!confirm('Удалить поставщика?'))return;
  DB.vendorCompanies=DB.vendorCompanies.filter(v=>v.id!=id);
  renderVendors();buildSidebar();
}

function renderSuppliers(){
  const c=document.getElementById('supplierCards');
  c.innerHTML=DB.suppliers.map(r=>{
    const picked=!!DB.pickedEquip[r.id];
    const img=getItemImg('suppliers',r.id);
    const imgHtml=img?`<img class="db-card-img" src="${img}" onclick="openLightbox('suppliers','${r.id}')">`:`<div class="db-card-img-placeholder" onclick="uploadPhoto('suppliers','${r.id}')"><span>&#128247;</span><span>Добавить фото</span></div>`;
    return `<div class="db-card" style="${picked?'border-color:var(--acbd);background:var(--acbg)':''}">${imgHtml}<div class="db-card-head"><span class="db-card-name">${esc(r.name)}</span><span class="db-card-role" style="background:rgba(139,92,246,.1);color:#d946ef">${esc(r.category)}</span></div><div class="db-card-grid"><div class="db-card-field"><div class="db-card-label">Цена</div><div class="db-card-val" style="color:var(--ac2)">${r.price.toLocaleString('ru')} PLN</div></div><div class="db-card-field"><div class="db-card-label">Поставщик</div><div class="db-card-val">${esc(r.supplier)}</div></div><div class="db-card-field"><div class="db-card-label">Гарантия</div><div class="db-card-val">${esc(r.warranty)}</div></div></div><div class="db-card-actions"><button class="btn sm ${picked?'gn':'pr'}" onclick="togglePickEquip('${r.id}')">${picked?'✓ В оснащении':'+ Товар → Таб 3'}</button><button class="btn sm" onclick="delItem('suppliers','${r.id}')">Удалить</button></div></div>`;
  }).join('');
}

function editEmployee(id){
  const r=DB.employees.find(x=>x.id===id);if(!r)return;
  modalMode='employee';editingId=r.id;
  document.getElementById('modalTitle').textContent='Редактировать сотрудника';
  const fields=MODAL_FIELDS.employee;
  document.getElementById('modalFields').innerHTML=fields.map(f=>`<div class="modal-field"><label>${f.l}</label><input id="mf_${f.k}" type="${f.t||'text'}" placeholder="${f.ph||''}" value="${esc(r[f.k]!=null?r[f.k]:'')}"></div>`).join('');
  document.getElementById('modalSave').style.display='';
  document.getElementById('modalBg').classList.add('vis');
}
function renderEmployees(){
  const c=document.getElementById('employeeCards');
  c.innerHTML=DB.employees.map(r=>{
    const picked=!!DB.pickedStaff[r.id];
    const statusColor=r.status==='Вакансия'?'background:rgba(249,115,22,.1);color:var(--or)':'background:rgba(34,197,94,.1);color:var(--gn)';
    return `<div class="db-card" style="${picked?'border-color:var(--acbd);background:var(--acbg)':''}">
<div class="db-card-head"><span class="db-card-name">${esc(r.name)}</span><span class="db-card-role" style="${statusColor}">${esc(r.status)}</span></div>
<div class="db-card-grid">
<div class="db-card-field"><div class="db-card-label">Специализация</div><div class="db-card-val">${esc(r.spec)}</div></div>
<div class="db-card-field"><div class="db-card-label">ЗП</div><div class="db-card-val" style="color:var(--ac2)">${(r.salary||0).toLocaleString('ru')} PLN/мес</div></div>
</div>
<div class="db-card-actions">
<button class="btn sm ${picked?'gn':'pr'}" onclick="togglePick('pickedStaff','${r.id}','employees')">${picked?'✓ В штате':'+ Сотрудник → Таб 5'}</button>
<button class="btn sm" onclick="editEmployee('${r.id}')" style="color:var(--ac2)">Редактировать</button>
<button class="btn sm" onclick="delItem('employees','${r.id}')" style="color:var(--rd)">Удалить</button>
</div></div>`;
  }).join('');
}

// Universal pick toggle for DB → Tab
function togglePick(store,id,renderTable){
  if(DB[store][id]){delete DB[store][id]}else{DB[store][id]={qty:1}}
  savePicked();renderAll();renderPickedRooms();renderPickedContractors();recalc();
}

// Equipment pick — also syncs with tab 3 visual state
function togglePickEquip(id){
  if(DB.pickedEquip[id]){delete DB.pickedEquip[id]}else{DB.pickedEquip[id]={qty:1}}
  savePicked();renderEquip();renderSelectedEquip();renderCabinetTypes();recalc();
}

