// ═══════════════ USERS ═══════════════
function genUserId(){const n=DB.users.length?Math.max(...DB.users.map(u=>{const m=(u.id||'').toString().match(/(\d+)$/);return m?+m[1]:0}))+1:1;return 'USR-'+String(n).padStart(3,'0')}
function renderUsers(){
  const c=document.getElementById('userCards');
  if(!c)return;
  const q=(document.getElementById('userSearch')?.value||'').toLowerCase().trim();
  const roleColors={admin:'#3b82f6',owner:'#22c55e',contractor:'#f59e0b',supplier:'#8b5cf6',employee:'#06b6d4',viewer:'#64748b'};
  const roleGradients={admin:'linear-gradient(135deg,#3b82f6,#1d4ed8)',owner:'linear-gradient(135deg,#22c55e,#15803d)',contractor:'linear-gradient(135deg,#f59e0b,#d97706)',supplier:'linear-gradient(135deg,#8b5cf6,#6d28d9)',employee:'linear-gradient(135deg,#06b6d4,#0891b2)',viewer:'linear-gradient(135deg,#64748b,#475569)'};
  const roleNames={admin:'Администратор',owner:'Владелец',contractor:'Подрядчик',supplier:'Поставщик',employee:'Сотрудник',viewer:'Наблюдатель'};
  const filtered=DB.users.filter(u=>{
    if(!q)return true;
    return (u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)||(u.id||'').toString().toLowerCase().includes(q)||(u.phone||'').includes(q);
  });
  let html=q&&!filtered.length?'<div style="text-align:center;padding:40px;color:var(--tx3);font-size:13px">Ничего не найдено</div>':'';
  html+='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px">';
  filtered.forEach(u=>{
    const rc=roleColors[u.role]||'#64748b';
    const rg=roleGradients[u.role]||roleGradients.viewer;
    const initials=(u.name||'').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
    const planLabel=u.role==='admin'?'FULL ACCESS':u.plan==='paid'?'PRO':u.plan==='unlimited'?'UNLIMITED':'TRIAL';
    const planColor=u.role==='admin'||u.plan==='paid'||u.plan==='unlimited'?'#3b82f6':'#eab308';
    const isOnline=u.status==='Активен';
    html+=`<div style="background:var(--sf);border:1px solid var(--bd);border-radius:16px;overflow:hidden;transition:all .2s;position:relative" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.08)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
<div style="height:4px;background:${rg}"></div>
<div style="padding:20px 20px 0">
<div style="display:flex;gap:14px;align-items:center">
<div style="position:relative">
<div style="width:56px;height:56px;border-radius:16px;background:${rg};display:flex;align-items:center;justify-content:center;font-size:20px;color:#fff;font-weight:700;letter-spacing:1px;box-shadow:0 4px 12px ${rc}40">${initials||'?'}</div>
<div style="position:absolute;bottom:-2px;right:-2px;width:14px;height:14px;border-radius:50%;background:${isOnline?'#22c55e':'#94a3b8'};border:2.5px solid var(--sf)"></div>
</div>
<div style="flex:1;min-width:0">
<div style="font-weight:700;font-size:15px;line-height:1.3">${esc(u.name)}</div>
<div style="font-size:11px;color:var(--tx2);margin-top:2px">${esc(u.email)}</div>
<div style="font-size:10px;color:var(--tx3);margin-top:3px;font-family:monospace;letter-spacing:.5px">${esc(u.id)}</div>
</div>
</div>
</div>
<div style="padding:14px 20px;display:flex;gap:6px;flex-wrap:wrap">
<span style="font-size:10px;padding:4px 10px;border-radius:8px;background:${rc}15;color:${rc};font-weight:700;letter-spacing:.3px">${roleNames[u.role]||u.role}</span>
<span style="font-size:10px;padding:4px 10px;border-radius:8px;background:${planColor}15;color:${planColor};font-weight:700;letter-spacing:.3px">${planLabel}</span>
<span style="font-size:10px;padding:4px 10px;border-radius:8px;background:${isOnline?'rgba(34,197,94,.08)':'rgba(148,163,184,.08)'};color:${isOnline?'#22c55e':'#94a3b8'};font-weight:600">${u.status||'Неактивен'}</span>
${u.created?`<span style="font-size:10px;padding:4px 10px;border-radius:8px;background:rgba(100,116,139,.06);color:var(--tx3)">c ${u.created}</span>`:''}
</div>
${u.phone?`<div style="padding:0 20px 8px;font-size:11px;color:var(--tx2)">${esc(u.phone)}</div>`:''}
${u.notes?`<div style="padding:0 20px 12px;font-size:11px;color:var(--tx3);line-height:1.5">${esc(u.notes)}</div>`:''}
<div style="border-top:1px solid var(--bd);padding:12px 20px;display:flex;gap:8px;justify-content:space-between;align-items:center">
<div style="display:flex;gap:6px;flex-wrap:wrap">
<select onchange="changeUserRole('${u.id}',this.value)" style="font-size:10px;padding:4px 8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);cursor:pointer;font-family:var(--f)">
<option value="admin" ${u.role==='admin'?'selected':''}>Админ</option>
<option value="owner" ${u.role==='owner'?'selected':''}>Владелец</option>
<option value="contractor" ${u.role==='contractor'?'selected':''}>Подрядчик</option>
<option value="supplier" ${u.role==='supplier'?'selected':''}>Поставщик</option>
<option value="employee" ${u.role==='employee'?'selected':''}>Сотрудник</option>
<option value="viewer" ${u.role==='viewer'?'selected':''}>Наблюдатель</option>
</select>
${u.role!=='admin'?`<select onchange="changeUserPlan('${u.id}',this.value)" style="font-size:10px;padding:4px 8px;border:1px solid var(--bd);border-radius:8px;background:var(--bg);color:var(--tx);cursor:pointer;font-family:var(--f)">
<option value="trial" ${u.plan==='trial'?'selected':''}>Триал</option>
<option value="paid" ${u.plan==='paid'?'selected':''}>PRO</option>
<option value="unlimited" ${u.plan==='unlimited'?'selected':''}>Unlimited</option>
</select>`:''}
</div>
<div style="display:flex;gap:4px">
<button onclick="editUser('${u.id}')" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s" onmouseenter="this.style.background='var(--ac2)';this.style.color='#fff';this.style.borderColor='var(--ac2)'" onmouseleave="this.style.background='var(--bg)';this.style.color='inherit';this.style.borderColor='var(--bd)'" title="Редактировать">&#9998;</button>
<button onclick="changePassword('${u.id}','${esc(u.name)}')" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;transition:all .15s" onmouseenter="this.style.background='var(--or)';this.style.color='#fff';this.style.borderColor='var(--or)'" onmouseleave="this.style.background='var(--bg)';this.style.color='inherit';this.style.borderColor='var(--bd)'" title="Сменить пароль">&#128273;</button>
<button onclick="deleteUser('${u.id}')" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--bd);background:var(--bg);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:var(--rd);transition:all .15s" onmouseenter="this.style.background='var(--rd)';this.style.color='#fff';this.style.borderColor='var(--rd)'" onmouseleave="this.style.background='var(--bg)';this.style.color='var(--rd)';this.style.borderColor='var(--bd)'" title="Удалить">&#10005;</button>
</div>
</div>
</div>`;
  });
  html+='</div>';
  c.innerHTML=html;
  renderRoleCabinets();
  document.getElementById('usersTotal').textContent=DB.users.length;
  document.getElementById('usersAdmins').textContent=DB.users.filter(u=>u.role==='admin').length;
  document.getElementById('usersOwners').textContent=DB.users.filter(u=>u.role==='owner').length;
  document.getElementById('usersOther').textContent=DB.users.filter(u=>!['admin','owner'].includes(u.role)).length;
}
function renderRoleCabinets(){
  const c=document.getElementById('roleCabinets');
  if(!c)return;
  let html='';
  Object.entries(DB.rolePlans).forEach(([role,p])=>{
    const cur=p.currency||'PLN';
    const usersInRole=DB.users.filter(u=>u.role===role);
    const trialCount=usersInRole.filter(u=>u.plan==='trial').length;
    const paidCount=usersInRole.filter(u=>u.plan==='paid'||u.plan==='unlimited').length;
    html+=`<div class="c" style="padding:0;overflow:hidden;margin-bottom:16px">
<div style="padding:16px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--bd)">
<div style="font-size:24px">${p.icon}</div>
<div style="flex:1"><div style="font-weight:700;font-size:14px">${p.name}</div>
<div style="font-size:11px;color:var(--tx2)">${usersInRole.length} пользователей \u00b7 ${trialCount} триал \u00b7 ${paidCount} PRO</div></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">
<div style="padding:16px;border-right:1px solid var(--bd)">
<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
<span style="font-size:10px;padding:2px 8px;border-radius:6px;background:var(--ylbg);color:var(--yl);font-weight:700">ТРИАЛ</span>
<span style="font-size:11px;color:var(--tx2)">${p.trial.label}</span></div>
<div style="font-size:22px;font-weight:800;color:var(--tx)">Бесплатно</div>
<div style="font-size:10px;color:var(--tx3);margin-bottom:10px">${p.trial.days} дней</div>
<div style="display:flex;flex-direction:column;gap:4px">${p.trial.features.map(f=>`<div style="font-size:11px;color:var(--tx2)">\u2713 ${f}</div>`).join('')}</div>
</div>
<div style="padding:16px;border-right:1px solid var(--bd);background:rgba(59,130,246,.02)">
<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
<span style="font-size:10px;padding:2px 8px;border-radius:6px;background:var(--acbg);color:var(--ac2);font-weight:700">PRO</span>
<span style="font-size:11px;color:var(--tx2)">${p.paid.label}</span></div>
<div style="font-size:22px;font-weight:800;color:var(--ac2)">${p.paid.price} ${cur}<span style="font-size:12px;font-weight:400;color:var(--tx3)">/${p.paid.period}</span></div>
<div style="font-size:10px;color:var(--tx3);margin-bottom:10px">полный доступ</div>
<div style="display:flex;flex-direction:column;gap:4px">${p.paid.features.map(f=>`<div style="font-size:11px;color:var(--ac2)">\u2713 ${f}</div>`).join('')}</div>
</div>
<div style="padding:16px;background:rgba(201,169,110,.04)">
<div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
<span style="font-size:10px;padding:2px 8px;border-radius:6px;background:linear-gradient(135deg,#c9a96e,#e8c97a);color:#000;font-weight:700">UNLIMITED</span>
<span style="font-size:11px;color:var(--tx2)">${p.unlimited.label}</span></div>
<div style="font-size:22px;font-weight:800;color:#c9a96e">${p.unlimited.price} ${cur}<span style="font-size:12px;font-weight:400;color:var(--tx3)">/${p.unlimited.period}</span></div>
<div style="font-size:10px;color:var(--tx3);margin-bottom:10px">максимум возможностей</div>
<div style="display:flex;flex-direction:column;gap:4px">${p.unlimited.features.map(f=>`<div style="font-size:11px;color:#c9a96e">\u2713 ${f}</div>`).join('')}</div>
</div>
</div></div>`;
  });
  c.innerHTML=html;
}

function changeUserRole(id,role){
  const u=DB.users.find(x=>x.id===id);
  if(u){u.role=role;if(role==='admin')u.plan='admin';else if(!u.plan||u.plan==='admin')u.plan='trial';}
  renderUsers();buildSidebar();
}
function changeUserPlan(id,plan){
  const u=DB.users.find(x=>x.id===id);
  if(u)u.plan=plan;
  renderUsers();
}
function editUser(id){
  const item=DB.users.find(e=>e.id==id);
  if(!item)return;
  editingId=id;
  modalMode='user';
  document.getElementById('modalTitle').textContent='Редактировать: '+item.name;
  const fields=MODAL_FIELDS.user;
  document.getElementById('modalFields').innerHTML=fields.map(f=>`<div class="modal-field"><label>${f.l}</label><input id="mf_${f.k}" type="${f.t||'text'}" placeholder="${f.ph||''}" value="${item[f.k]||''}"></div>`).join('');
  document.getElementById('modalBg').classList.add('vis');
}
async function changePassword(id,name){
  if(!currentUser||!currentUser.isAdmin){alert('Только администратор может менять пароли');return}
  const newPass=prompt('Новый пароль для '+esc(name)+' (мин. 8 символов):');
  if(!newPass||newPass.length<8){if(newPass)alert('Пароль минимум 8 символов');return}
  if(!sb){alert('Supabase не загружен');return}
  const{data,error}=await sb.rpc('change_user_password',{p_user_id:id,p_new_password:newPass,p_caller_id:currentUser.id});
  if(error){alert('Ошибка: '+error.message);return}
  if(data&&data.ok){alert('Пароль изменён!')}else{alert('Ошибка: '+(data?.error||'неизвестная'))}
}
async function deleteUser(id){
  if(!confirm('Удалить пользователя? Это действие необратимо.'))return;
  if(sb){
    const{error}=await sb.from('profiles').delete().eq('id',id);
    if(error){alert('Ошибка удаления: '+error.message);return}
  }
  DB.users=DB.users.filter(e=>e.id!=id);
  renderUsers();buildSidebar();
}

// ═══════════════ ZONES & ZONALITIES ═══════════════
function renderZones(){
  // 1. Zone summary — group picked rooms by zone type
  const zs=document.getElementById('zoneSummary');
  if(!zs)return;
  const rooms=getPickedRoomsList();
  const zoneMap={};
  // Map room types to zones
  const typeToZone={'Стоматологический':'medical','Хирургический':'medical','Ортодонтический':'medical','Рентген':'medical',
    'Общественная':'public','Ресепшен':'public',
    'Техническая':'technical','Стерилизаторная':'technical','Серверная':'technical',
    'Служебная':'service'};
  DB.zones.forEach(z=>{zoneMap[z.id]={...z,rooms:[],area:0}});

  rooms.forEach(rm=>{
    const zid=typeToZone[rm.type]||'service';
    if(zoneMap[zid]){zoneMap[zid].rooms.push(rm);zoneMap[zid].area+=rm.area||0}
  });

  let zsHtml='';
  DB.zones.forEach(z=>{
    const d=zoneMap[z.id];
    zsHtml+=`<div class="st" style="border-left:3px solid ${z.color}"><div class="st-l">${z.icon} ${z.name}</div><div class="st-v" style="font-size:18px">${d.area.toFixed(0)} м²</div><div style="font-size:10px;color:var(--tx3)">${d.rooms.length} помещений</div></div>`;
  });
  zs.innerHTML=zsHtml;

  // 2. Zonalities per room type
  const zc=document.getElementById('zonalityCards');
  if(!zc)return;

  // Collect unique room types from picked rooms
  const roomTypes={};
  rooms.forEach(rm=>{
    if(!roomTypes[rm.type])roomTypes[rm.type]=[];
    roomTypes[rm.type].push(rm);
  });

  let html='';
  Object.keys(roomTypes).forEach(type=>{
    const rms=roomTypes[type];
    const zonalities=DB.zonalities[type]||[];
    if(!zonalities.length)return;

    html+=`<div class="c" style="padding:0;overflow:hidden;margin-bottom:12px">
<div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between">
<div>
<div style="font-weight:700;font-size:14px">${type}</div>
<div style="font-size:11px;color:var(--tx2);margin-top:2px">${rms.length} помещений · ${zonalities.length} зональностей</div>
</div>
<div style="font-size:10px;color:var(--tx3)">Применяется к: ${rms.map(r=>r.name).join(', ')}</div>
</div>
<div style="border-top:1px solid var(--bd);display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:1px;background:var(--bd)">`;

    zonalities.forEach(zn=>{
      html+=`<div style="padding:12px 14px;background:var(--sf)">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
<span style="font-size:16px">${zn.icon}</span>
<span style="font-size:12px;font-weight:600">${zn.name}</span>
</div>
<div style="font-size:10px;color:var(--tx3);line-height:1.4">${zn.desc}</div>
</div>`;
    });

    html+='</div></div>';
  });

  // Room types without zonalities
  const noZonTypes=Object.keys(roomTypes).filter(t=>!DB.zonalities[t]);
  if(noZonTypes.length){
    html+=`<div class="c" style="padding:16px;text-align:center">
<div style="font-size:11px;color:var(--tx3)">Зональности ещё не определены для: <strong>${noZonTypes.join(', ')}</strong></div>
<div style="font-size:10px;color:var(--tx3);margin-top:4px">Будет добавлено позже</div>
</div>`;
  }

  if(!html&&!rooms.length){
    html='<div style="padding:24px;text-align:center;font-size:12px;color:var(--tx3)">Добавьте помещения, чтобы увидеть зональности</div>';
  }

  zc.innerHTML=html;
}

// ═══════════════ CABINET COSTS (per room) ═══════════════
function renderCabinetTypes(){
  const c=document.getElementById('cabinetTypeCards');
  if(!c)return;
  const rooms=getPickedRoomsList();
  const picked=DB.pickedEquip||{};

  // Group equipment by assigned room
  const byRoom={};  // roomId -> [{item, qty, cost}]
  const unassigned=[];
  let totalAssigned=0,grandTotal=0;

  Object.entries(picked).forEach(([id,p])=>{
    const item=DB.suppliers.find(s=>s.id==id);
    if(!item)return;
    const qty=p.qty||1;
    const cost=item.price*qty;
    grandTotal+=cost;
    const entry={...item,qty,cost};
    if(p.room){
      if(!byRoom[p.room])byRoom[p.room]=[];
      byRoom[p.room].push(entry);
      totalAssigned++;
    }else{
      unassigned.push(entry);
    }
  });

  // Stats
  const cntEl=document.getElementById('cabRoomCnt');
  const assEl=document.getElementById('cabAssigned');
  const totEl=document.getElementById('cabTotalCost');
  if(cntEl)cntEl.textContent=rooms.length;
  if(assEl)assEl.textContent=totalAssigned+' / '+Object.keys(picked).length;
  if(totEl)totEl.textContent=grandTotal.toLocaleString('ru');

  if(!rooms.length&&!unassigned.length){
    c.innerHTML='<div style="padding:40px;text-align:center;color:var(--tx3);font-size:12px">Добавьте помещения и оборудование, чтобы увидеть стоимость по комнатам</div>';
    return;
  }

  let html='';

  // Each room card
  rooms.forEach(rm=>{
    const items=byRoom[rm.id]||[];
    const roomCost=items.reduce((s,e)=>s+e.cost,0);
    const costColor=roomCost>0?'var(--gn)':'var(--tx3)';

    html+=`<div class="c" style="padding:0;overflow:hidden;margin-bottom:12px">
<div style="padding:14px 16px;display:flex;align-items:center;gap:12px">
<div style="flex:1">
<div style="font-weight:700;font-size:14px">${rm.name}</div>
<div style="font-size:11px;color:var(--tx2);margin-top:2px">${rm.type} · ${rm.area} м²</div>
</div>
<div style="text-align:right">
<div style="font-size:20px;font-weight:800;color:${costColor}">${roomCost>0?roomCost.toLocaleString('ru')+' PLN':'—'}</div>
<div style="font-size:10px;color:var(--tx3)">${items.length} позиций</div>
</div>
</div>`;

    if(items.length){
      html+='<div style="border-top:1px solid var(--bd)">';
      items.forEach(e=>{
        html+=`<div style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-bottom:1px solid var(--bd)">
<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500">${e.name}</div><div style="font-size:10px;color:var(--tx3)">${e.category}</div></div>
<div style="font-size:10px;color:var(--tx2);flex-shrink:0">×${e.qty}</div>
<div style="font-size:12px;font-weight:700;color:var(--ac2);flex-shrink:0">${e.cost.toLocaleString('ru')} PLN</div>
</div>`;
      });
      html+='</div>';
    }else{
      html+='<div style="padding:16px;text-align:center;font-size:11px;color:var(--tx3);border-top:1px solid var(--bd)">Назначьте оборудование из Оснащения</div>';
    }
    html+='</div>';
  });

  // Unassigned equipment
  if(unassigned.length){
    const unCost=unassigned.reduce((s,e)=>s+e.cost,0);
    html+=`<div class="c" style="padding:0;overflow:hidden;margin-bottom:12px;border-color:var(--ylbg)">
<div style="padding:14px 16px;display:flex;align-items:center;gap:12px;background:var(--ylbg)">
<div style="flex:1">
<div style="font-weight:700;font-size:14px;color:var(--yl)">⚠ Не назначено</div>
<div style="font-size:11px;color:var(--tx2);margin-top:2px">Оборудование без привязки к помещению</div>
</div>
<div style="text-align:right">
<div style="font-size:20px;font-weight:800;color:var(--yl)">${unCost.toLocaleString('ru')} PLN</div>
<div style="font-size:10px;color:var(--tx3)">${unassigned.length} позиций</div>
</div>
</div>
<div style="border-top:1px solid var(--bd)">`;
    unassigned.forEach(e=>{
      html+=`<div style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-bottom:1px solid var(--bd)">
<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:500">${e.name}</div><div style="font-size:10px;color:var(--tx3)">${e.category}</div></div>
<div style="font-size:10px;color:var(--tx2)">×${e.qty}</div>
<div style="font-size:12px;font-weight:700;color:var(--yl)">${e.cost.toLocaleString('ru')} PLN</div>
</div>`;
    });
    html+='</div></div>';
  }

  c.innerHTML=html;
}

