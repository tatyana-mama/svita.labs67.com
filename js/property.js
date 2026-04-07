// ═══════════════ PROPERTY (S1) ═══════════════
let activeProperty=null;
// Property loaded per-user in enterApp()
const DEFAULT_PROPERTY={id:1,name:'ул. Гданьская 15',city:'Быдгощ',area:180,floor:1,floors_total:3,length:18.5,width:9.7,height:2.9,type:'Коммерческое',purpose:'Стоматология',price_m2:67,source:'OLX'};

function renderProperty(){
  const wrap=document.getElementById('propertyCardWrap');
  const b=document.getElementById('propertyCardBody');
  if(!activeProperty){
    wrap.style.display='none';
    const addBtn=document.getElementById('addPropertyBtn');if(addBtn)addBtn.style.display='flex';
    const costBlk=document.getElementById('propertyCostBlock');if(costBlk)costBlk.style.display='none';
    document.getElementById('propArea').textContent='—';
    document.getElementById('propUsable').textContent='—';
    document.getElementById('propCabinets').textContent='—';
    document.getElementById('propFloor').textContent='—';
    document.getElementById('propFloorSub').textContent='';
    const rentEl=document.querySelector('[data-cost="rent"]');if(rentEl)rentEl.value=0;
    const depVal=document.getElementById('depositVal');if(depVal)depVal.textContent='—';
    const s1el=document.getElementById('s1CostTotal');if(s1el)s1el.textContent='— PLN';
    return;
  }
  wrap.style.display='';
  const addBtn=document.getElementById('addPropertyBtn');if(addBtn)addBtn.style.display='none';
  const costBlk=document.getElementById('propertyCostBlock');if(costBlk)costBlk.style.display='';
  const p=activeProperty;
  const propInp=(k,v,t,sfx)=>`<input class="prop-edit" data-prop="${k}" type="${t||'text'}" value="${esc(v)}" onchange="fpPropEdit('${k}',this.value)" style="width:100%;background:transparent;border:1px solid transparent;border-radius:4px;padding:2px 4px;font-size:12px;color:var(--tx);font-family:var(--f);outline:none" onfocus="this.style.borderColor='var(--ac)';this.style.background='var(--sf)'" onblur="this.style.borderColor='transparent';this.style.background='transparent'">${sfx||''}`;
  b.innerHTML=`<div class="db-card" style="margin:0;border:none;padding:0"><div class="db-card-head" style="margin-bottom:12px"><span class="db-card-name" style="font-size:16px">${propInp('name',p.name)}</span><span class="db-card-role" style="background:var(--gnbg);color:var(--gn)">${propInp('type',p.type)}</span></div><div class="db-card-grid" style="grid-template-columns:repeat(3,1fr);gap:12px"><div class="db-card-field"><div class="db-card-label">Город</div><div class="db-card-val">${propInp('city',p.city)}</div></div><div class="db-card-field"><div class="db-card-label">Площадь</div><div class="db-card-val">${propInp('area',p.area,'number',' м²')}</div></div><div class="db-card-field"><div class="db-card-label">Этаж</div><div class="db-card-val" style="display:flex;gap:2px;align-items:center">${propInp('floor',p.floor,'number')} / ${propInp('floors_total',p.floors_total,'number')}</div></div><div class="db-card-field"><div class="db-card-label">Длина</div><div class="db-card-val">${propInp('length',p.length,'number',' м')}</div></div><div class="db-card-field"><div class="db-card-label">Ширина</div><div class="db-card-val">${propInp('width',p.width,'number',' м')}</div></div><div class="db-card-field"><div class="db-card-label">Высота</div><div class="db-card-val">${propInp('height',p.height,'number',' м')}</div></div><div class="db-card-field"><div class="db-card-label">Назначение</div><div class="db-card-val">${propInp('purpose',p.purpose)}</div></div><div class="db-card-field"><div class="db-card-label">Цена/м²</div><div class="db-card-val" style="color:var(--ac2)">${propInp('price_m2',p.price_m2,'number',' PLN')}</div></div><div class="db-card-field"><div class="db-card-label">Источник</div><div class="db-card-val">${propInp('source',p.source||'')}</div></div></div></div>`;
  // Update area block
  const usable=Math.round(p.area*0.85);
  const cabinets=Math.floor(usable/14);
  document.getElementById('propArea').textContent=p.area;
  document.getElementById('propUsable').textContent=usable;
  document.getElementById('propCabinets').textContent=cabinets;
  document.getElementById('propFloor').textContent=p.floor;
  document.getElementById('propFloorSub').textContent=p.floor===1?'Удобно для пациентов':'Нужен лифт/пандус';
  // Update rent from price_m2
  const rentEl=document.querySelector('[data-cost="rent"]');
  if(rentEl&&!rentEl._userEdited){rentEl.value=p.area*p.price_m2}
  calcDeposit();
  recalc();
}

function fpPropEdit(key,val){
  if(!activeProperty)return;
  const numFields=['area','floor','floors_total','length','width','height','price_m2'];
  activeProperty[key]=numFields.includes(key)?parseFloat(val)||0:val;
  uSet('svita_property',JSON.stringify(activeProperty));
  // Re-render dependent stats without full re-render (avoid losing focus)
  const usable=Math.round(activeProperty.area*0.85);
  const cabinets=Math.floor(usable/14);
  document.getElementById('propArea').textContent=activeProperty.area;
  document.getElementById('propUsable').textContent=usable;
  document.getElementById('propCabinets').textContent=cabinets;
  document.getElementById('propFloor').textContent=activeProperty.floor;
  document.getElementById('propFloorSub').textContent=activeProperty.floor===1?'Удобно для пациентов':'Нужен лифт/пандус';
  const rentEl=document.querySelector('[data-cost="rent"]');
  if(rentEl&&!rentEl._userEdited){rentEl.value=activeProperty.area*activeProperty.price_m2}
  calcDeposit();recalc();
}

function clearProperty(){
  if(!confirm('Удалить помещение? Все привязанные данные (планировка, комнаты, оборудование по комнатам, работы по модернизации) будут сброшены.'))return;
  activeProperty=null;
  uRemove('svita_property');
  // Каскадное обнуление — источник правды = помещение
  // 1. Планировка
  if(FP){FP.rooms=[];FP.elements=[];fpSave();fpDraw();fpUpdateList()}
  // 2. Привязка комнат
  DB.pickedRooms={};
  // 3. Снять привязку оборудования к комнатам (оборудование остаётся, но без room)
  Object.values(DB.pickedEquip||{}).forEach(p=>{delete p.room});
  // 4. Работы по модернизации (привязаны к помещению)
  DB.pickedRenovations={};
  // 5. Параметры помещения (chips)
  uRemove('svita_prop_params');
  // Re-render всё
  renderProperty();buildSidebar();renderAll();recalc();
}
function restoreProperty(p){
  const wasOther=activeProperty&&activeProperty.id!==p.id;
  activeProperty=p;
  uSet('svita_property',JSON.stringify(p));
  if(wasOther){
    // Новое помещение — сброс привязок старого
    if(FP){FP.rooms=[];FP.elements=[];fpSave();fpDraw();fpUpdateList()}
    DB.pickedRooms={};
    DB.pickedRenovations={};
    Object.values(DB.pickedEquip||{}).forEach(pe=>{delete pe.room});
    uRemove('svita_prop_params');
    buildSidebar();renderAll();
  }
  renderProperty();recalc();
}
// ═══ PERSIST PICKED DATA ═══
const PICKED_KEYS=['pickedEquip','pickedRenovations','pickedStaff','pickedServices','pickedRooms','pickedContractors','pickedDocs'];
function savePicked(){
  const obj={};
  PICKED_KEYS.forEach(k=>{obj[k]=DB[k]||{}});
  const json=JSON.stringify(obj);
  const hasData=Object.values(obj).some(v=>Object.keys(v).length>0);
  const existing=uGet('svita_picked');
  if(!hasData&&existing&&!isPickedEmpty(existing))return;
  uSet('svita_picked',json);
}
function isPickedEmpty(raw){
  if(!raw||raw==='{}'||raw==='null')return true;
  try{const o=JSON.parse(raw);return!Object.values(o).some(v=>v&&typeof v==='object'&&Object.keys(v).length>0)}catch(e){return true}
}
function loadPicked(){
  PICKED_KEYS.forEach(k=>{DB[k]={}});
  try{
    let raw=uGet('svita_picked');
    if(isPickedEmpty(raw)){const oldKey=uKeyOld('svita_picked');const v=localStorage.getItem(oldKey);if(!isPickedEmpty(v)){raw=v;uSet('svita_picked',raw)}}
    if(isPickedEmpty(raw)){const v=localStorage.getItem('svita_picked');if(!isPickedEmpty(v)){raw=v;uSet('svita_picked',raw)}}
    // Cross-user fallback removed — security: never load another user's data
    if(isPickedEmpty(raw)){console.log('[SVITA] No picked data found. Keys:',Object.keys(localStorage).filter(k=>k.includes('svita_picked')));return}
    const obj=JSON.parse(raw);
    PICKED_KEYS.forEach(k=>{if(obj[k])DB[k]=obj[k]});
  }catch(e){console.error('[SVITA] loadPicked error',e)}
}

const BM_FIELDS=['cType','cBrand','cCity','cDate','cFormat','cAudience','cUsp','cTech'];
const LOAD_PARAMS=['chairsCount','patientsPerChair','workDays','avgCheck','prUtils','prMaterials','prMarketing','prOther'];
function saveLoadParams(){
  try{const raw=uGet('svita_bm');const bm=raw?JSON.parse(raw):{};LOAD_PARAMS.forEach(k=>{const el=document.getElementById(k);if(el)bm[k]=el.value});uSet('svita_bm',JSON.stringify(bm))}catch(e){}
}
function saveBusinessModel(){
  const bm={};
  BM_FIELDS.forEach(k=>{const el=document.getElementById(k);if(el)bm[k]=el.value});
  // Save load parameters alongside business model
  LOAD_PARAMS.forEach(k=>{const el=document.getElementById(k);if(el)bm[k]=el.value});
  uSet('svita_bm',JSON.stringify(bm));
  const btn=document.getElementById('bmSaveBtn');
  if(btn){const old=btn.textContent;btn.textContent='✓ Сохранено';setTimeout(()=>btn.textContent=old,1500)}
}
const BM_DEFAULTS={cType:'Стоматологическая клиника',cBrand:'Свитлица',cCity:'Быдгощ, Польша',cDate:'Сентябрь 2026',cFormat:'Премиум-сегмент',cAudience:'Средний+ класс, 25-55 лет',cUsp:'AI-клиника нового поколения',cTech:'ŠČYRA.AI + Jetson Edge'};
function loadBusinessModel(){
  try{
    let raw=uGet('svita_bm');
    if(!raw||raw==='{}'){const oldKey=uKeyOld('svita_bm');raw=localStorage.getItem(oldKey);if(raw&&raw!=='{}'){uSet('svita_bm',raw)}}
    if(!raw||raw==='{}'){raw=localStorage.getItem('svita_bm');if(raw&&raw!=='{}'){uSet('svita_bm',raw)}}
    // Cross-user fallback removed — security: never load another user's data
    if(!raw||raw==='{}'){
      const vals=currentRole==='admin'?BM_DEFAULTS:{};
      BM_FIELDS.forEach(k=>{const el=document.getElementById(k);if(el)el.value=vals[k]||''});
      return;
    }
    const bm=JSON.parse(raw);
    BM_FIELDS.forEach(k=>{const el=document.getElementById(k);if(el)el.value=bm[k]||''});
    // Restore load parameters (chairsCount, patientsPerChair, workDays, avgCheck)
    LOAD_PARAMS.forEach(k=>{const el=document.getElementById(k);if(el&&bm[k])el.value=bm[k]});
  }catch(e){}
}

function saveProperty(){
  if(!activeProperty)return;
  uSet('svita_property',JSON.stringify(activeProperty));
  const b=document.querySelector('#propertyCardWrap .ch h3');
  if(b){const old=b.textContent;b.textContent='✓ Сохранено!';setTimeout(()=>b.textContent=old,1500)}
}
function openAddPropertyModal(){
  const html=`<div class="modal-field"><label>Название</label><input id="mf_pName" placeholder="Например: ул. Длуга 12" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Город</label><input id="mf_pCity" value="Быдгощ" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
<div class="modal-field"><label>Площадь, м²</label><input id="mf_pArea" type="number" value="180" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Этаж</label><input id="mf_pFloor" type="number" value="1" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Всего этажей</label><input id="mf_pFloors" type="number" value="3" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
<div class="modal-field"><label>Длина, м</label><input id="mf_pLen" type="number" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Ширина, м</label><input id="mf_pWid" type="number" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Высота, м</label><input id="mf_pH" type="number" value="2.9" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
<div class="modal-field"><label>Тип</label><input id="mf_pType" value="Коммерческое" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
<div class="modal-field"><label>Цена/м² (PLN)</label><input id="mf_pPrice" type="number" value="55" style="background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:10px;color:var(--tx);font-family:var(--f);font-size:13px;width:100%"></div>
</div>`;
  document.getElementById('modalTitle').textContent='Новое помещение';
  document.getElementById('modalFields').innerHTML=html;
  document.getElementById('modalSave').style.display='';
  document.getElementById('modalSave').textContent='Добавить';
  document.getElementById('modalSave').onclick=()=>{
    const name=document.getElementById('mf_pName').value.trim();
    if(!name)return alert('Укажите название');
    const p={
      id:'custom_'+Date.now(),name,
      city:document.getElementById('mf_pCity').value.trim(),
      area:parseFloat(document.getElementById('mf_pArea').value)||0,
      floor:parseInt(document.getElementById('mf_pFloor').value)||1,
      floors_total:parseInt(document.getElementById('mf_pFloors').value)||1,
      length:parseFloat(document.getElementById('mf_pLen').value)||0,
      width:parseFloat(document.getElementById('mf_pWid').value)||0,
      height:parseFloat(document.getElementById('mf_pH').value)||2.9,
      type:document.getElementById('mf_pType').value.trim(),
      price_m2:parseFloat(document.getElementById('mf_pPrice').value)||0,
      purpose:'Стоматология',source:'Ручной ввод'
    };
    restoreProperty(p);
    document.getElementById('modalBg').classList.remove('vis');
  };
  document.getElementById('modalBg').classList.add('vis');
}

function openPremisePicker(){
  if(!DB.premises.length){nav('db-premises');return}
  const mb=document.getElementById('modalBg');
  document.getElementById('modalTitle').textContent='Выбрать помещение';
  const statusLabels={candidate:'Кандидат',shortlist:'Шортлист',ordered:'Забронировано',delivered:'Получено',rejected:'Отклонён'};
  let html='<div style="max-height:60vh;overflow-y:auto;display:flex;flex-direction:column;gap:8px">';
  DB.premises.forEach(p=>{
    const sp=p.specs||{};
    const addr=esc(sp.address||p.name||'—');
    const city=esc(sp.city||'');
    const area=sp.area||0;
    const price=p.price?p.price.toLocaleString('ru')+' PLN/мес':'—';
    const st=statusLabels[p.status]||p.status;
    const pid=p.id;
    html+=`<div style="display:flex;gap:10px;padding:10px;border:1px solid var(--bd);border-radius:10px;cursor:pointer;transition:border-color .15s" onmouseover="this.style.borderColor='var(--ac)'" onmouseout="this.style.borderColor='var(--bd)'" onclick="selectPremiseAsProperty('${pid}');closeModal()">`;
    if(p.img)html+=`<img src="${esc(p.img)}" style="width:80px;height:56px;object-fit:cover;border-radius:6px;flex-shrink:0">`;
    html+=`<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${addr}</div>`;
    if(city)html+=`<div style="font-size:10px;color:var(--tx3)">${city}</div>`;
    html+=`<div style="display:flex;gap:8px;margin-top:4px;font-size:11px;color:var(--tx2)"><span>${area} м²</span><span style="color:var(--ac)">${price}</span><span style="font-size:9px;opacity:.7">${esc(st)}</span></div></div></div>`;
  });
  html+='</div>';
  html+=`<div style="margin-top:12px;text-align:center"><span style="font-size:11px;color:var(--ac2);cursor:pointer" onclick="closeModal();nav('db-premises')">Открыть полный каталог →</span></div>`;
  document.getElementById('modalFields').innerHTML=html;
  const ms=document.getElementById('modalSave');if(ms)ms.style.display='none';
  mb.classList.add('vis');
}

function calcDeposit(){
  const rent=parseInt(document.querySelector('[data-cost="rent"]')?.value)||0;
  const months=parseInt(document.getElementById('depositMonths')?.value)||3;
  const total=rent*months;
  document.getElementById('depositVal').textContent=total.toLocaleString('ru');
  recalc();
}

function toggleChip(el){
  el.classList.toggle('on');
  savePropertyParams();
}

function savePropertyParams(){
  // Save chips and params to localStorage
  const params={};
  ['propHeating','propWindows','propEntrance','propWater','propElectric','propVent','propCondition','propParking','propAccess'].forEach(id=>{
    params[id]=[];
    document.querySelectorAll('#'+id+' .param-chip.on').forEach(c=>{params[id].push(c.dataset.val)});
  });
  params.ceilMin=document.getElementById('propCeilMin')?.value;
  params.ceilMax=document.getElementById('propCeilMax')?.value;
  params.notes=document.getElementById('propNotes')?.value;
  uSet('svita_prop_params',JSON.stringify(params));
}

function loadPropertyParams(){
  try{
    const raw=uGet('svita_prop_params');
    if(!raw)return;
    const p=JSON.parse(raw);
    Object.keys(p).forEach(k=>{
      if(k==='ceilMin'){const el=document.getElementById('propCeilMin');if(el)el.value=p[k]}
      else if(k==='ceilMax'){const el=document.getElementById('propCeilMax');if(el)el.value=p[k]}
      else if(k==='notes'){const el=document.getElementById('propNotes');if(el)el.value=p[k]}
      else if(Array.isArray(p[k])){
        p[k].forEach(v=>{
          const chip=document.querySelector('#'+k+' [data-val="'+v+'"]');
          if(chip)chip.classList.add('on');
        });
      }
    });
  }catch(e){}
}

