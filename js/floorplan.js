// ═══════════════ FLOOR PLAN CONSTRUCTOR ═══════════════
const FP={
  rooms:[],       // each: {name,type,abbr,pts:[[x,y],...],doors:[]}
  elements:[],    // architectural elements: {type,x,y,angle,w,h}
  history:[],     // undo stack (snapshots of {rooms,elements})
  future:[],      // redo stack
  clipboard:null, // {rooms:[], elements:[]}
  showGrid:true,  // toggle grid visibility
  maxHistory:30,
  scale:20,ox:40,oy:40,
  tool:'select',sel:new Set(),selElem:-1,drag:null,resize:null,vtxDrag:null,bgImg:null,
  pan:null,       // {sx,sy,oox,ooy} — right-click pan
  polyPts:[],     // temp points while drawing polygon
  rectStart:null, // temp start while drawing rect
  elemDrag:null,  // {idx,sx,sy,ox,oy}
  elemResize:null, // {idx,sx,sy,ow,oh}
  colors:['#3b82f6','#22c55e','#f97316','#8b5cf6','#06b6d4','#ef4444','#eab308','#d946ef','#14b8a6','#f43f5e'],
  types:[
    // Лечебные кабинеты
    'Стоматологический кабинет','Хирургический кабинет','Ортодонтический кабинет',
    'Кабинет гигиениста','Детский кабинет','Кабинет имплантолога',
    'Эндодонтический кабинет','Кабинет протезирования','Пародонтологический кабинет',
    // Диагностика
    'Рентген (ОПТГ)','Рентген (КЛКТ/3D)','Кабинет диагностики',
    // Стерилизация и лаборатория
    'Стерилизационная','Зуботехническая лаборатория','Склад расходников','Склад медикаментов',
    // Приём и ожидание
    'Рецепция','Зал ожидания','Детская зона ожидания','Консультационная',
    // Санузлы
    'Туалет для персонала','Туалет для посетителей','Туалет NPS',
    // Административные
    'Кабинет директора','Кабинет главврача','Кабинет бухгалтерии','Переговорная',
    // Персонал
    'Комната отдыха персонала','Раздевалка персонала','Кухня/столовая','Душевая',
    // Технические
    'Серверная','Техническая','Электрощитовая','Вентиляционная',
    // Вспомогательные
    'Коридор','Тамбур/вход','Гардероб','Кладовая','Архив документов',
    'Прачечная','Помещение для отходов','Лифтовой холл'
  ]
};

function fpSnap(v){return Math.round(v*10)/10}
function fpToScreen(px,py){return[FP.ox+px*FP.scale,FP.oy+py*FP.scale]}
function fpToGrid(sx,sy){return[fpSnap((sx-FP.ox)/FP.scale),fpSnap((sy-FP.oy)/FP.scale)]}

// Undo/Redo system
function fpPushHistory(){
  FP.history.push(JSON.stringify({rooms:FP.rooms,elements:FP.elements}));
  if(FP.history.length>FP.maxHistory)FP.history.shift();
  FP.future=[]; // clear redo on new action
}
function fpUndo(){
  if(!FP.history.length)return;
  // Save current state to future (redo) stack
  FP.future.push(JSON.stringify({rooms:FP.rooms,elements:FP.elements}));
  const snap=JSON.parse(FP.history.pop());
  FP.rooms=(snap.rooms||[]).map(r=>fpEnsurePoly(r));
  FP.elements=snap.elements||[];
  FP.sel.clear();FP.selElem=-1;
  fpDraw();fpUpdateList();
}
function fpRedo(){
  if(!FP.future||!FP.future.length)return;
  // Save current state to history (undo) stack
  FP.history.push(JSON.stringify({rooms:FP.rooms,elements:FP.elements}));
  const snap=JSON.parse(FP.future.pop());
  FP.rooms=(snap.rooms||[]).map(r=>fpEnsurePoly(r));
  FP.elements=snap.elements||[];
  FP.sel.clear();FP.selElem=-1;
  fpDraw();fpUpdateList();
}

// Polygon area (shoelace)
function fpPolyArea(pts){
  let a=0;for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;a+=pts[i][0]*pts[j][1]-pts[j][0]*pts[i][1]}
  return Math.abs(a)/2;
}
// Polygon centroid
function fpPolyCentroid(pts){
  let cx=0,cy=0;pts.forEach(p=>{cx+=p[0];cy+=p[1]});
  return[cx/pts.length,cy/pts.length];
}
// Polygon bounding box
function fpPolyBBox(pts){
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  pts.forEach(p=>{x1=Math.min(x1,p[0]);y1=Math.min(y1,p[1]);x2=Math.max(x2,p[0]);y2=Math.max(y2,p[1])});
  return{x1,y1,x2,y2,w:x2-x1,h:y2-y1};
}
// Point in polygon (ray casting)
function fpPointInPoly(px,py,pts){
  let inside=false;
  for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const[xi,yi]=pts[i],[xj,yj]=pts[j];
    if((yi>py)!==(yj>py)&&px<(xj-xi)*(py-yi)/(yj-yi)+xi)inside=!inside;
  }return inside;
}
// Hit vertex (returns {roomIdx, vtxIdx} or null)
function fpHitVertex(mx,my){
  const r=8/FP.scale;
  for(let i=FP.rooms.length-1;i>=0;i--){
    const pts=FP.rooms[i].pts;
    for(let v=0;v<pts.length;v++){
      if(Math.abs(pts[v][0]-(mx-FP.ox)/FP.scale)<r&&Math.abs(pts[v][1]-(my-FP.oy)/FP.scale)<r)
        return{ri:i,vi:v};
    }
  }return null;
}
// Hit room polygon
function fpHitRoom(mx,my){
  const gx=(mx-FP.ox)/FP.scale,gy=(my-FP.oy)/FP.scale;
  for(let i=FP.rooms.length-1;i>=0;i--){
    if(fpPointInPoly(gx,gy,FP.rooms[i].pts))return i;
  }return-1;
}
// Convert old rect-format room to polygon
function fpEnsurePoly(r){
  if(!r.pts){r.pts=[[r.x,r.y],[r.x+r.w,r.y],[r.x+r.w,r.y+r.h],[r.x,r.y+r.h]]}
  if(r.doors)r.doors.forEach(d=>{if(!d.side)d.side='left';if(!d.dir)d.dir='in';if(!d.width)d.width=0.9});
  return r;
}

// Transform screen-space point into element's local coordinate system
// Returns [lx, ly] relative to element center, accounting for rotation
function fpElemLocalPoint(el,mx,my){
  // Element center in screen space
  const cx=FP.ox+(el.x+el.w/2)*FP.scale;
  const cy=FP.oy+(el.y+el.h/2)*FP.scale;
  // Vector from center to mouse
  const dx=mx-cx,dy=my-cy;
  // Inverse rotate
  const a=-(el.angle||0)*Math.PI/180;
  const lx=dx*Math.cos(a)-dy*Math.sin(a);
  const ly=dx*Math.sin(a)+dy*Math.cos(a);
  return[lx,ly];
}

// Hit-test element (returns index or -1) — rotation-aware OBB test
function fpHitElement(mx,my){
  for(let i=FP.elements.length-1;i>=0;i--){
    const el=FP.elements[i];
    const[lx,ly]=fpElemLocalPoint(el,mx,my);
    const hw=el.w*FP.scale/2,hh=el.h*FP.scale/2;
    if(lx>=-hw&&lx<=hw&&ly>=-hh&&ly<=hh)return i;
  }return-1;
}

// Hit-test element resize handle (bottom-right in local space)
function fpHitElemResize(mx,my){
  if(FP.selElem<0)return false;
  const el=FP.elements[FP.selElem];if(!el)return false;
  const[lx,ly]=fpElemLocalPoint(el,mx,my);
  const hw=el.w*FP.scale/2,hh=el.h*FP.scale/2;
  return Math.abs(lx-hw)<12&&Math.abs(ly-hh)<12;
}

function fpInit(){
  const c=document.getElementById('fpCanvas');
  if(!c)return;
  c.addEventListener('mousedown',fpDown);
  c.addEventListener('mousemove',fpMove);
  c.addEventListener('mouseup',fpUp);
  c.addEventListener('dblclick',fpDblClick);
  c.addEventListener('wheel',fpWheel,{passive:false});
  c.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='SELECT'||e.target.tagName==='TEXTAREA')return;
    if(e.key==='Escape'){FP.polyPts=[];FP.rectStart=null;FP.sel.clear();FP.selElem=-1;fpDraw();fpUpdateList()}
    if((e.ctrlKey||e.metaKey)&&e.key==='z'&&!e.shiftKey){e.preventDefault();fpUndo()}
    if((e.ctrlKey||e.metaKey)&&(e.key==='Z'||(e.key==='z'&&e.shiftKey))){e.preventDefault();fpRedo()}
    if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();fpRedo()}
    if((e.ctrlKey||e.metaKey)&&e.key==='c'){e.preventDefault();fpCopy()}
    if((e.ctrlKey||e.metaKey)&&e.key==='v'&&!e.shiftKey){e.preventDefault();fpPaste()}
    if((e.ctrlKey||e.metaKey)&&e.key==='d'){e.preventDefault();fpDuplicate()}
    if((e.ctrlKey||e.metaKey)&&e.key==='a'){e.preventDefault();fpSelectAll()}
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();fpSave()}
    if(!e.ctrlKey&&!e.metaKey){
      if(e.key==='v')fpSetTool('select');
      if(e.key==='r')fpSetTool('rect');
      if(e.key==='p')fpSetTool('poly');
      if(e.key==='d')fpSetTool('door');
      if(e.key==='w')fpSetTool('window');
      if(e.key==='n')fpSetTool('vertex');
      if(e.key==='l')fpSetTool('wall');
      if(e.key==='e')fpToggleElemPalette();
      if(e.key==='g'){FP.showGrid=!FP.showGrid;fpDraw()}
      if(e.key==='Delete'||e.key==='Backspace'){
        if(FP.selElem>=0){fpDelElement(FP.selElem);FP.selElem=-1}
        else if(FP.sel.size>=1){const ids=[...FP.sel].sort((a,b)=>b-a);fpPushHistory();ids.forEach(i=>FP.rooms.splice(i,1));FP.sel.clear();fpDraw();fpUpdateList()}
      }
    }
  });
  let saved=uGet('svita_floorplan');
  if(!saved){const oldKey=uKeyOld('svita_floorplan');saved=localStorage.getItem(oldKey);if(saved){uSet('svita_floorplan',saved)}}
  if(!saved){saved=localStorage.getItem('svita_floorplan');if(saved){uSet('svita_floorplan',saved);localStorage.removeItem('svita_floorplan')}}
  if(saved){try{const d=JSON.parse(saved);FP.rooms=(d.rooms||[]).map(r=>fpEnsurePoly(r));FP.elements=d.elements||[];FP.scale=d.scale||20;FP.ox=d.ox||40;FP.oy=d.oy||40;
    console.log('[SVITA] Loaded: '+FP.rooms.length+' rooms, '+FP.elements.length+' elements');
  }catch(e){console.error('[SVITA] Failed to load saved data:',e)}}
  // Auto-save every 30 seconds
  if(window._fpAutoSaveId)clearInterval(window._fpAutoSaveId);
  window._fpAutoSaveId=setInterval(()=>{if(FP.rooms.length||FP.elements.length)fpSave()},30000);
  fpDraw();fpUpdateList();
}

// Helper: primary selected room (first in set)
function fpPrimary(){return FP.sel.size?[...FP.sel][0]:-1}
function fpIsSel(i){return FP.sel.has(i)}

function fpDraw(){
  const c=document.getElementById('fpCanvas');if(!c)return;
  const W=c.parentElement.clientWidth;c.width=W;c.height=500;
  const ctx=c.getContext('2d');
  ctx.fillStyle='#f1f5f9';ctx.fillRect(0,0,W,500);
  if(FP.bgImg){ctx.globalAlpha=.3;ctx.drawImage(FP.bgImg,FP.ox,FP.oy,FP.bgImg.width*(FP.scale/20),FP.bgImg.height*(FP.scale/20));ctx.globalAlpha=1}
  // Grid
  if(FP.showGrid!==false){
    ctx.strokeStyle='rgba(0,0,0,.06)';ctx.lineWidth=1;
    const gs=FP.scale;
    for(let x=FP.ox%gs;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke()}
    for(let y=FP.oy%gs;y<500;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    // Axis origin cross
    ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(FP.ox,0);ctx.lineTo(FP.ox,500);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,FP.oy);ctx.lineTo(W,FP.oy);ctx.stroke();
  }
  // Rooms
  FP.rooms.forEach((r,i)=>{
    fpEnsurePoly(r);
    const col=FP.colors[i%FP.colors.length];
    const isSel=fpIsSel(i);
    const pts=r.pts.map(p=>fpToScreen(p[0],p[1]));
    ctx.beginPath();pts.forEach((p,j)=>j===0?ctx.moveTo(p[0],p[1]):ctx.lineTo(p[0],p[1]));ctx.closePath();
    ctx.fillStyle=col+(isSel?'30':'18');ctx.fill();
    ctx.strokeStyle=isSel?'#1e293b':col;ctx.lineWidth=isSel?2.5:1.5;ctx.stroke();
    // Label: fit text inside polygon bounds
    const area=fpPolyArea(r.pts);
    const label=r.abbr||r.name||r.type;
    const areaText=area.toFixed(1)+' м²';
    // Find largest inscribed horizontal span at centroid Y
    const bbox=fpPolyBBox(r.pts);
    const bboxSc={x1:FP.ox+bbox.x1*FP.scale,y1:FP.oy+bbox.y1*FP.scale,x2:FP.ox+bbox.x2*FP.scale,y2:FP.oy+bbox.y2*FP.scale};
    const bW=bboxSc.x2-bboxSc.x1;const bH=bboxSc.y2-bboxSc.y1;
    const cx=(bboxSc.x1+bboxSc.x2)/2,cy=(bboxSc.y1+bboxSc.y2)/2;
    // Find max horizontal width inside polygon at center Y
    const cyGrid=(cy-FP.oy)/FP.scale;
    let inLeft=bbox.x2,inRight=bbox.x1;
    for(let sx=bbox.x1;sx<=bbox.x2;sx+=0.25){
      if(fpPointInPoly(sx,cyGrid,r.pts)){inLeft=Math.min(inLeft,sx);inRight=Math.max(inRight,sx)}
    }
    const innerW=(inRight-inLeft)*FP.scale;
    const pad=8; // px padding from edges
    const availW=Math.max(20,innerW-pad*2);
    // Auto-size label font to fit
    let fontSize=Math.min(13,Math.max(7,availW/label.length*1.4,bH*0.22));
    fontSize=Math.min(fontSize,bH*0.35);
    const innerCx=FP.ox+(inLeft+inRight)/2*FP.scale;
    ctx.fillStyle=isSel?'#1e293b':col;
    ctx.font='bold '+fontSize.toFixed(1)+'px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    // Clip text to available width
    let dispLabel=label;
    while(ctx.measureText(dispLabel).width>availW&&dispLabel.length>2){dispLabel=dispLabel.slice(0,-1)}
    if(dispLabel.length<label.length)dispLabel+='…';
    const areaFontSize=Math.min(10,fontSize*0.8);
    const gap=fontSize*0.45+areaFontSize*0.45+2;
    ctx.fillText(dispLabel,innerCx,cy-gap/2);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.font=areaFontSize.toFixed(1)+'px Inter,sans-serif';
    ctx.fillText(areaText,innerCx,cy+gap/2);
    // Vertices
    if(isSel||FP.tool==='vertex'){
      r.pts.forEach(p=>{
        const s=fpToScreen(p[0],p[1]);
        ctx.fillStyle=isSel?'#1e293b':'rgba(0,0,0,.3)';ctx.beginPath();ctx.arc(s[0],s[1],4,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(s[0],s[1],2,0,Math.PI*2);ctx.fill();
      });
    }
    // Doors — architectural style with 45° swing arc
    if(r.doors)r.doors.forEach((d,di)=>{
      if(d.edge>=r.pts.length)return;
      const p1=r.pts[d.edge],p2=r.pts[(d.edge+1)%r.pts.length];
      const ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      const eLen=Math.hypot(ex,ey);if(eLen<0.01)return;
      const enx=ex/eLen,eny=ey/eLen; // edge unit vector
      // Door position on edge
      const dw=d.width||0.9; // door width in meters
      const dxPos=p1[0]+ex*d.t,dyPos=p1[1]+ey*d.t;
      // Door endpoints along edge
      const halfW=dw/2;
      const dA=[dxPos-enx*halfW,dyPos-eny*halfW];
      const dB=[dxPos+enx*halfW,dyPos+eny*halfW];
      // Normal to edge (perpendicular) — determines in/out
      let nx=-eny,ny=enx; // default: left normal
      if(d.dir==='out'){nx=eny;ny=-enx}
      // Hinge side: 'left' = hinge at dA, 'right' = hinge at dB
      const hinge=d.side==='right'?dB:dA;
      const free=d.side==='right'?dA:dB;
      const sH=fpToScreen(hinge[0],hinge[1]);
      const sF=fpToScreen(free[0],free[1]);
      // Draw door gap on wall (white break)
      ctx.strokeStyle='#f1f5f9';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(sH[0],sH[1]);ctx.lineTo(sF[0],sF[1]);ctx.stroke();
      // Door leaf at 45° from closed position
      const doorLen=dw*FP.scale;
      // Angle of edge
      const edgeAngle=Math.atan2(ey,ex);
      // Swing: from edge direction toward normal, 45°
      const swingSign=d.side==='right'?-1:1;
      const baseAngle=edgeAngle+(d.side==='right'?Math.PI:0);
      const dirSign=d.dir==='out'?-1:1;
      const leafAngle=baseAngle+swingSign*dirSign*(Math.PI/4);
      const leafEnd=[sH[0]+Math.cos(leafAngle)*doorLen,sH[1]+Math.sin(leafAngle)*doorLen];
      // Draw door leaf line
      ctx.strokeStyle='#b45309';ctx.lineWidth=2.5;
      ctx.beginPath();ctx.moveTo(sH[0],sH[1]);ctx.lineTo(leafEnd[0],leafEnd[1]);ctx.stroke();
      // Draw swing arc (from closed to 45°)
      const closedAngle=edgeAngle+(d.side==='right'?Math.PI:0);
      const arcStart=Math.min(closedAngle,leafAngle);
      const arcEnd=Math.max(closedAngle,leafAngle);
      ctx.strokeStyle='rgba(180,83,9,.35)';ctx.lineWidth=1;ctx.setLineDash([4,3]);
      ctx.beginPath();ctx.arc(sH[0],sH[1],doorLen,arcStart,arcEnd);ctx.stroke();
      ctx.setLineDash([]);
      // Hinge dot
      ctx.fillStyle='#b45309';ctx.beginPath();ctx.arc(sH[0],sH[1],3.5,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sH[0],sH[1],1.5,0,Math.PI*2);ctx.fill();
      // Door width label
      const dmx=(sH[0]+sF[0])/2,dmy=(sH[1]+sF[1])/2;
      ctx.font='bold 8px JetBrains Mono,monospace';ctx.fillStyle='#b45309';ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText((dw*100).toFixed(0)+'cm',dmx,dmy-4);
    });
    // Windows — double line with gap on wall
    if(r.windows)r.windows.forEach(w=>{
      if(w.edge>=r.pts.length)return;
      const p1=r.pts[w.edge],p2=r.pts[(w.edge+1)%r.pts.length];
      const ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      const eLen=Math.hypot(ex,ey);if(eLen<0.01)return;
      const enx=ex/eLen,eny=ey/eLen;
      const ww=w.width||1.2,halfW=ww/2;
      const wx=p1[0]+ex*w.t,wy=p1[1]+ey*w.t;
      const wA=fpToScreen(wx-enx*halfW,wy-eny*halfW);
      const wB=fpToScreen(wx+enx*halfW,wy+eny*halfW);
      // White gap
      ctx.strokeStyle='#f1f5f9';ctx.lineWidth=4;
      ctx.beginPath();ctx.moveTo(wA[0],wA[1]);ctx.lineTo(wB[0],wB[1]);ctx.stroke();
      // Double blue line (window symbol)
      const nx=-eny*3,ny=enx*3;
      ctx.strokeStyle='#3b82f6';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(wA[0]+nx,wA[1]+ny);ctx.lineTo(wB[0]+nx,wB[1]+ny);ctx.stroke();
      ctx.beginPath();ctx.moveTo(wA[0]-nx,wA[1]-ny);ctx.lineTo(wB[0]-nx,wB[1]-ny);ctx.stroke();
      // Center cross
      const wC=[(wA[0]+wB[0])/2,(wA[1]+wB[1])/2];
      ctx.beginPath();ctx.moveTo(wC[0]+nx,wC[1]+ny);ctx.lineTo(wC[0]-nx,wC[1]-ny);ctx.stroke();
    });
  });

  // Architectural elements — always on top of rooms
  FP.elements.forEach((el,i)=>{
    const def=ELEM_DEFS[el.type];if(!def)return;
    const sx=FP.ox+el.x*FP.scale,sy=FP.oy+el.y*FP.scale;
    const sw=el.w*FP.scale,sh=el.h*FP.scale;
    const isSel=(FP.selElem===i);
    ctx.save();
    ctx.translate(sx+sw/2,sy+sh/2);
    ctx.rotate((el.angle||0)*Math.PI/180);
    // Selection highlight
    if(isSel){
      ctx.strokeStyle='#3b82f6';ctx.lineWidth=1;ctx.setLineDash([4,3]);
      ctx.strokeRect(-sw/2-3,-sh/2-3,sw+6,sh+6);ctx.setLineDash([]);
    }
    // Custom draw
    def.draw(ctx,sw,sh,isSel);
    // Label below element
    ctx.font='7px Inter,sans-serif';ctx.fillStyle=isSel?'#2563eb':'#94a3b8';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(def.label,0,sh/2+2);
    // Resize handle on selected element (bottom-right corner)
    if(isSel){
      const hs=7;
      ctx.fillStyle='#3b82f6';
      ctx.fillRect(sw/2-hs,sh/2-hs,hs,hs);
      ctx.strokeStyle='#fff';ctx.lineWidth=1;
      ctx.strokeRect(sw/2-hs,sh/2-hs,hs,hs);
      // Size label
      ctx.font='bold 8px JetBrains Mono,monospace';ctx.fillStyle='#3b82f6';
      ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(el.w+'×'+el.h+'м',0,sh/2+12);
    }
    ctx.restore();
  });

  // Polygon drawing in progress
  if(FP.polyPts.length>0){
    ctx.strokeStyle='#3b82f6';ctx.lineWidth=2;ctx.setLineDash([6,4]);
    ctx.beginPath();
    FP.polyPts.forEach((p,j)=>{const s=fpToScreen(p[0],p[1]);j===0?ctx.moveTo(s[0],s[1]):ctx.lineTo(s[0],s[1])});
    if(FP._mouseGrid){const ms=fpToScreen(FP._mouseGrid[0],FP._mouseGrid[1]);ctx.lineTo(ms[0],ms[1])}
    ctx.stroke();ctx.setLineDash([]);
    FP.polyPts.forEach(p=>{const s=fpToScreen(p[0],p[1]);ctx.fillStyle='#3b82f6';ctx.beginPath();ctx.arc(s[0],s[1],5,0,Math.PI*2);ctx.fill()});
    if(FP.polyPts.length>=3&&FP._mouseGrid){
      const d=Math.hypot(FP._mouseGrid[0]-FP.polyPts[0][0],FP._mouseGrid[1]-FP.polyPts[0][1]);
      if(d<0.8){const s=fpToScreen(FP.polyPts[0][0],FP.polyPts[0][1]);ctx.strokeStyle='#22c55e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s[0],s[1],8,0,Math.PI*2);ctx.stroke()}
    }
  }
  // Multi-select hint
  if(FP.sel.size>1){
    ctx.fillStyle='rgba(59,130,246,.8)';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='top';
    ctx.fillText('Выбрано: '+FP.sel.size+' комнат  |  Нажмите «Объединить»',W-12,8);
  }
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.font='10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('1 клетка = 1 м  |  Масштаб: '+(FP.scale/20*100).toFixed(0)+'%',8,495);
}

function fpDown(e){
  const rect=e.target.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  if(e.button===2){FP.pan={sx:mx,sy:my,oox:FP.ox,ooy:FP.oy};e.target.style.cursor='grabbing';return}
  const[gx,gy]=fpToGrid(mx,my);
  const shift=e.shiftKey;

  if(FP.tool==='select'){
    // Check resize handle first
    if(fpHitElemResize(mx,my)){
      fpPushHistory();
      const el=FP.elements[FP.selElem];
      FP.elemResize={idx:FP.selElem,sx:mx,sy:my,ow:el.w,oh:el.h};
      return;
    }
    // Check elements first (they are on top)
    const elemHit=fpHitElement(mx,my);
    if(elemHit>=0){
      FP.selElem=elemHit;FP.sel.clear();
      const el=FP.elements[elemHit];
      fpPushHistory();
      FP.elemDrag={idx:elemHit,sx:mx,sy:my,ox:el.x,oy:el.y};
      fpDraw();fpUpdateList();return;
    }
    FP.selElem=-1;
    // Vertex grab on any selected room
    const pri=fpPrimary();
    if(pri>=0){
      const vh=fpHitVertex(mx,my);
      if(vh&&fpIsSel(vh.ri)){FP.vtxDrag={ri:vh.ri,vi:vh.vi};return}
    }
    const hit=fpHitRoom(mx,my);
    if(hit>=0){
      if(shift){
        // Shift+click: toggle in selection
        if(FP.sel.has(hit))FP.sel.delete(hit); else FP.sel.add(hit);
      }else{
        if(!FP.sel.has(hit)){FP.sel.clear();FP.sel.add(hit)}
      }
      // Save origPts for ALL selected rooms (group drag)
      fpPushHistory();
      const dragRooms={};
      FP.sel.forEach(idx=>{dragRooms[idx]=FP.rooms[idx].pts.map(p=>[...p])});
      FP.drag={sx:mx,sy:my,rooms:dragRooms};
      fpDraw();fpUpdateList();return;
    }
    if(!shift){FP.sel.clear()}
    fpDraw();fpUpdateList();
  }
  if(FP.tool==='rect'||FP.tool==='wall'){FP.rectStart=[gx,gy]}
  if(FP.tool==='poly'){
    if(FP.polyPts.length>=3){
      const d=Math.hypot(gx-FP.polyPts[0][0],gy-FP.polyPts[0][1]);
      if(d<0.8){
        const name='Комната '+(FP.rooms.length+1);
        FP.rooms.push({name,type:FP.types[0],pts:[...FP.polyPts],doors:[]});
        FP.sel.clear();FP.sel.add(FP.rooms.length-1);FP.polyPts=[];fpDraw();fpUpdateList();return;
      }
    }
    FP.polyPts.push([gx,gy]);fpDraw();
  }
  if(FP.tool==='vertex'){
    const vh=fpHitVertex(mx,my);
    if(vh){FP.sel.clear();FP.sel.add(vh.ri);FP.vtxDrag={ri:vh.ri,vi:vh.vi};fpDraw();fpUpdateList();return}
    const pri=fpPrimary();
    if(pri>=0){
      const r=FP.rooms[pri];
      let bestEdge=-1,bestT=0,bestDist=Infinity;
      for(let i=0;i<r.pts.length;i++){
        const j=(i+1)%r.pts.length;
        const[ax,ay]=r.pts[i],[bx,by]=r.pts[j];
        const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;if(len2<0.01)continue;
        let t=((gx-ax)*dx+(gy-ay)*dy)/len2;t=Math.max(0.05,Math.min(0.95,t));
        const px=ax+t*dx,py=ay+t*dy;const dist=Math.hypot(gx-px,gy-py);
        if(dist<bestDist){bestDist=dist;bestEdge=i;bestT=t}
      }
      if(bestEdge>=0&&bestDist<1.5){
        const[ax,ay]=r.pts[bestEdge],[bx,by]=r.pts[(bestEdge+1)%r.pts.length];
        r.pts.splice(bestEdge+1,0,[fpSnap(ax+(bx-ax)*bestT),fpSnap(ay+(by-ay)*bestT)]);fpDraw();
      }
    }
  }
  if(FP.tool==='door'){
    const pri=fpPrimary();
    if(pri>=0){
      const r=FP.rooms[pri];if(!r.doors)r.doors=[];
      let bestEdge=-1,bestT=0,bestDist=Infinity;
      for(let i=0;i<r.pts.length;i++){
        const j=(i+1)%r.pts.length;
        const[ax,ay]=r.pts[i],[bx,by]=r.pts[j];
        const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;if(len2<0.01)continue;
        let t=((gx-ax)*dx+(gy-ay)*dy)/len2;t=Math.max(0,Math.min(1,t));
        const px=ax+t*dx,py=ay+t*dy;const dist=Math.hypot(gx-px,gy-py);
        if(dist<bestDist){bestDist=dist;bestEdge=i;bestT=t}
      }
      if(bestEdge>=0&&bestDist<2){fpPushHistory();r.doors.push({edge:bestEdge,t:bestT,width:0.9,side:'left',dir:'in'});fpDraw();fpUpdateList()}
    }
  }
  if(FP.tool==='window'){
    const pri=fpPrimary();
    if(pri>=0){
      const r=FP.rooms[pri];if(!r.windows)r.windows=[];
      let bestEdge=-1,bestT=0,bestDist=Infinity;
      for(let i=0;i<r.pts.length;i++){
        const j=(i+1)%r.pts.length;
        const[ax,ay]=r.pts[i],[bx,by]=r.pts[j];
        const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;if(len2<0.01)continue;
        let t=((gx-ax)*dx+(gy-ay)*dy)/len2;t=Math.max(0,Math.min(1,t));
        const px=ax+t*dx,py=ay+t*dy;const dist=Math.hypot(gx-px,gy-py);
        if(dist<bestDist){bestDist=dist;bestEdge=i;bestT=t}
      }
      if(bestEdge>=0&&bestDist<2){fpPushHistory();r.windows.push({edge:bestEdge,t:bestT,width:1.2});fpDraw();fpUpdateList()}
    }
  }
}

function fpMove(e){
  const rect=e.target.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  if(FP.pan){FP.ox=FP.pan.oox+(mx-FP.pan.sx);FP.oy=FP.pan.ooy+(my-FP.pan.sy);fpDraw();return}
  const[gx,gy]=fpToGrid(mx,my);
  FP._mouseGrid=[gx,gy];
  document.getElementById('fpCursor').textContent=gx.toFixed(1)+' × '+gy.toFixed(1)+' м';
  if(FP.elemDrag){
    const dx=(mx-FP.elemDrag.sx)/FP.scale,dy=(my-FP.elemDrag.sy)/FP.scale;
    FP.elements[FP.elemDrag.idx].x=fpSnap(FP.elemDrag.ox+dx);
    FP.elements[FP.elemDrag.idx].y=fpSnap(FP.elemDrag.oy+dy);
    fpDraw();return;
  }
  if(FP.elemResize){
    const el=FP.elements[FP.elemResize.idx];
    // Transform screen delta into element's local axes (inverse rotation)
    const sdx=mx-FP.elemResize.sx,sdy=my-FP.elemResize.sy;
    const a=-(el.angle||0)*Math.PI/180;
    const ldx=(sdx*Math.cos(a)-sdy*Math.sin(a))/FP.scale;
    const ldy=(sdx*Math.sin(a)+sdy*Math.cos(a))/FP.scale;
    const nw=Math.max(0.1,fpSnap(FP.elemResize.ow+ldx));
    const nh=Math.max(0.1,fpSnap(FP.elemResize.oh+ldy));
    el.w=nw;el.h=nh;
    fpDraw();fpUpdateList();return;
  }
  if(FP.vtxDrag){
    FP.rooms[FP.vtxDrag.ri].pts[FP.vtxDrag.vi]=[gx,gy];fpDraw();return;
  }
  if(FP.drag){
    const dx=(mx-FP.drag.sx)/FP.scale,dy=(my-FP.drag.sy)/FP.scale;
    // Move ALL selected rooms together
    Object.keys(FP.drag.rooms).forEach(idx=>{
      FP.rooms[idx].pts=FP.drag.rooms[idx].map(p=>[fpSnap(p[0]+dx),fpSnap(p[1]+dy)]);
    });
    fpDraw();return;
  }
  if(FP.rectStart&&(FP.tool==='rect'||FP.tool==='wall')){fpDraw();
    const ctx=document.getElementById('fpCanvas').getContext('2d');
    const s1=fpToScreen(FP.rectStart[0],FP.rectStart[1]),s2=fpToScreen(gx,gy);
    ctx.strokeStyle=FP.tool==='wall'?'#475569':'#3b82f6';ctx.lineWidth=FP.tool==='wall'?3:2;ctx.setLineDash([6,4]);
    ctx.strokeRect(Math.min(s1[0],s2[0]),Math.min(s1[1],s2[1]),Math.abs(s2[0]-s1[0]),Math.abs(s2[1]-s1[1]));
    ctx.setLineDash([]);return;
  }
  if(FP.polyPts.length>0){fpDraw();return}
  const c=e.target;
  if(FP.tool==='select'){
    if(fpHitElemResize(mx,my)){c.style.cursor='nwse-resize';return}
    const vh=FP.sel.size?fpHitVertex(mx,my):null;
    c.style.cursor=vh?'grab':fpHitElement(mx,my)>=0||fpHitRoom(mx,my)>=0?'move':'default';
  }else if(FP.tool==='vertex'){
    c.style.cursor=fpHitVertex(mx,my)?'grab':'crosshair';
  }else c.style.cursor='crosshair';
}

function fpUp(e){
  if(FP.pan){FP.pan=null;e.target.style.cursor='';fpDraw();return}
  if(FP.rectStart&&(FP.tool==='rect'||FP.tool==='wall')){
    const[gx,gy]=FP._mouseGrid||FP.rectStart;
    const x1=Math.min(FP.rectStart[0],gx),y1=Math.min(FP.rectStart[1],gy);
    const x2=Math.max(FP.rectStart[0],gx),y2=Math.max(FP.rectStart[1],gy);
    if(x2-x1>=0.1&&y2-y1>=0.1){
      fpPushHistory();
      if(FP.tool==='wall'){
        // Wall segment — not a room, just structural element
        FP.elements.push({type:'wall_part',x:x1,y:y1,w:Math.round((x2-x1)*10)/10,h:Math.round((y2-y1)*10)/10,angle:0,specs:{}});
      }else{
        FP.rooms.push({name:'Комната '+(FP.rooms.length+1),type:FP.types[0],pts:[[x1,y1],[x2,y1],[x2,y2],[x1,y2]],doors:[]});
        FP.sel.clear();FP.sel.add(FP.rooms.length-1);
      }
      fpUpdateList();
    }
    FP.rectStart=null;
  }
  FP.drag=null;FP.vtxDrag=null;FP.elemDrag=null;FP.elemResize=null;fpDraw();fpUpdateList();
}

function fpDblClick(e){
  const rect=e.target.getBoundingClientRect();const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  // Elements first — they are on top
  const elemHit=fpHitElement(mx,my);
  if(elemHit>=0){FP.selElem=elemHit;FP.sel.clear();fpShowElemInfo(elemHit);fpDraw();fpUpdateList();return}
  // Doors — check before rooms
  const doorHit=fpHitDoor(mx,my);
  if(doorHit){fpShowDoorInfo(doorHit.ri,doorHit.di);return}
  const hit=fpHitRoom(mx,my);
  if(hit>=0){
    const r=FP.rooms[hit];
    const name=prompt('Название комнаты:',r.name);
    if(name!==null){r.name=name;fpDraw();fpUpdateList()}
  }
}

function fpWheel(e){e.preventDefault();fpZoom(e.deltaY<0?1.1:0.9)}
function fpZoom(f){FP.scale=Math.max(5,Math.min(80,FP.scale*f));fpDraw()}

function fpFitAll(){
  if(!FP.rooms.length)return;
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  FP.rooms.forEach(r=>{r.pts.forEach(p=>{x1=Math.min(x1,p[0]);y1=Math.min(y1,p[1]);x2=Math.max(x2,p[0]);y2=Math.max(y2,p[1])})});
  const c=document.getElementById('fpCanvas');const cw=c.width-80,ch=c.height-80;
  const sw=cw/((x2-x1)||1),sh=ch/((y2-y1)||1);FP.scale=Math.min(sw,sh,80);
  FP.ox=40-x1*FP.scale;FP.oy=40-y1*FP.scale;fpDraw();
}

function fpSetTool(t){
  FP.polyPts=[];FP.rectStart=null;FP.tool=t;
  ['select','rect','poly','door','window','vertex','wall'].forEach(k=>{
    const btn=document.getElementById('fpTool'+k.charAt(0).toUpperCase()+k.slice(1));
    if(btn){btn.style.background=k===t?'var(--acbg)':'';btn.style.borderColor=k===t?'var(--acbd)':'transparent';btn.style.color=k===t?'var(--ac2)':''}
  });
}

function fpToggleElemPalette(){
  const p=document.getElementById('fpElemPalette');
  p.style.display=p.style.display==='none'?'':'none';
}

// Hit-test door on canvas: returns {ri, di} or null
function fpHitDoor(mx,my){
  const gx=(mx-FP.ox)/FP.scale,gy=(my-FP.oy)/FP.scale;
  for(let ri=0;ri<FP.rooms.length;ri++){
    const r=FP.rooms[ri];
    if(!r.doors)continue;
    for(let di=0;di<r.doors.length;di++){
      const d=r.doors[di];
      if(d.edge>=r.pts.length)continue;
      const p1=r.pts[d.edge],p2=r.pts[(d.edge+1)%r.pts.length];
      const ex=p2[0]-p1[0],ey=p2[1]-p1[1];
      const eLen=Math.hypot(ex,ey);if(eLen<0.01)continue;
      const dxPos=p1[0]+ex*d.t,dyPos=p1[1]+ey*d.t;
      const dist=Math.hypot(gx-dxPos,gy-dyPos);
      if(dist<0.6)return{ri,di};
    }
  }
  return null;
}

// Show door edit popup on double-click
function fpShowDoorInfo(ri,di){
  const d=FP.rooms[ri].doors[di];if(!d)return;
  const sideLabel=d.side==='right'?'Правая':'Левая';
  const dirLabel=d.dir==='out'?'Наружу':'Внутрь';
  let html=`<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:20px;z-index:1100;min-width:260px;box-shadow:0 16px 48px rgba(0,0,0,.15)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;font-weight:600;color:var(--tx)">Дверь #${di+1}</span>
      <span style="cursor:pointer;font-size:16px;color:var(--tx3)" onclick="document.getElementById('doorInfoPanel').remove()">✕</span>
    </div>
    <div class="modal-field"><label>Ширина (м)</label><input type="number" step="0.1" min="0.3" max="2.5" value="${d.width||0.9}" onchange="FP.rooms[${ri}].doors[${di}].width=parseFloat(this.value)||0.9;fpDraw()" style="width:100%"></div>
    <div class="modal-field"><label>Сторона петель</label>
      <div style="display:flex;gap:6px">
        <button class="btn sm${d.side==='left'?' pr':''}" onclick="FP.rooms[${ri}].doors[${di}].side='left';fpDraw();fpShowDoorInfo(${ri},${di})">Левая</button>
        <button class="btn sm${d.side==='right'?' pr':''}" onclick="FP.rooms[${ri}].doors[${di}].side='right';fpDraw();fpShowDoorInfo(${ri},${di})">Правая</button>
      </div>
    </div>
    <div class="modal-field"><label>Открывание</label>
      <div style="display:flex;gap:6px">
        <button class="btn sm${d.dir==='in'?' pr':''}" onclick="FP.rooms[${ri}].doors[${di}].dir='in';fpDraw();fpShowDoorInfo(${ri},${di})">Внутрь</button>
        <button class="btn sm${d.dir==='out'?' pr':''}" onclick="FP.rooms[${ri}].doors[${di}].dir='out';fpDraw();fpShowDoorInfo(${ri},${di})">Наружу</button>
      </div>
    </div>
    <div style="display:flex;gap:6px;margin-top:14px;justify-content:flex-end">
      <button class="btn sm" style="color:var(--rd);border-color:rgba(239,68,68,.3)" onclick="fpDelDoor(${ri},${di});document.getElementById('doorInfoPanel').remove()">Удалить</button>
      <button class="btn sm pr" onclick="document.getElementById('doorInfoPanel').remove()">Готово</button>
    </div>
  </div><div style="position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:1099" onclick="document.getElementById('doorInfoPanel').remove()"></div>`;
  let panel=document.getElementById('doorInfoPanel');
  if(panel)panel.remove();
  panel=document.createElement('div');panel.id='doorInfoPanel';panel.innerHTML=html;
  document.body.appendChild(panel);
}

function fpAddRoom(){
  fpPushHistory();
  const name=prompt('Название комнаты:','Комната '+(FP.rooms.length+1));if(!name)return;
  const w=parseFloat(prompt('Ширина (м):','4'))||4;
  const h=parseFloat(prompt('Длина (м):','3.5'))||3.5;
  let maxX=0;FP.rooms.forEach(r=>{const bb=fpPolyBBox(r.pts);maxX=Math.max(maxX,bb.x2)});
  const sx=maxX+1,sy=1;
  FP.rooms.push({name,type:FP.types[0],pts:[[sx,sy],[sx+w,sy],[sx+w,sy+h],[sx,sy+h]],doors:[]});
  FP.sel.clear();FP.sel.add(FP.rooms.length-1);fpDraw();fpUpdateList();
}

function fpDelRoom(i){
  fpPushHistory();FP.rooms.splice(i,1);FP.sel.clear();fpDraw();fpUpdateList();
}

// Merge selected rooms into one (convex hull of all points)
function fpMergeSelected(){
  if(FP.sel.size<2){alert('Выделите 2+ комнат (Shift+клик)');return}
  fpPushHistory();
  const indices=[...FP.sel].sort((a,b)=>a-b);
  // Save originals for split
  const originals=indices.map(i=>JSON.parse(JSON.stringify(FP.rooms[i])));
  // Collect all points
  let allPts=[];
  indices.forEach(i=>allPts.push(...FP.rooms[i].pts));
  // Convex hull (Graham scan)
  const hull=fpConvexHull(allPts);
  // Take name from first room
  const first=FP.rooms[indices[0]];
  const merged={name:first.name+' (объед.)',type:first.type,abbr:first.abbr||'',pts:hull,doors:[],_merged:originals};
  // Remove old rooms (from end to preserve indices)
  for(let k=indices.length-1;k>=0;k--)FP.rooms.splice(indices[k],1);
  FP.rooms.push(merged);
  FP.sel.clear();FP.sel.add(FP.rooms.length-1);
  fpDraw();fpUpdateList();
}

// Split merged room back into original rooms
function fpSplitRoom(i){
  fpPushHistory();const r=FP.rooms[i];
  if(!r._merged||!r._merged.length){alert('Эта комната не объединённая');return}
  const originals=r._merged;
  FP.rooms.splice(i,1);
  originals.forEach(o=>{delete o._merged;FP.rooms.push(o)});
  FP.sel.clear();
  fpDraw();fpUpdateList();
}

// Convex hull (Graham scan)
function fpConvexHull(points){
  const pts=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  if(pts.length<=2)return pts;
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const lower=[];
  for(const p of pts){while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0)lower.pop();lower.push(p)}
  const upper=[];
  for(let i=pts.length-1;i>=0;i--){const p=pts[i];while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0)upper.pop();upper.push(p)}
  lower.pop();upper.pop();
  return lower.concat(upper);
}

function fpSelectRoom(i,e){
  const shift=e&&e.shiftKey;
  if(shift){if(FP.sel.has(i))FP.sel.delete(i);else FP.sel.add(i)}
  else{FP.sel.clear();FP.sel.add(i)}
  fpSetTool('select');fpDraw();fpUpdateList();
}

function fpChangeType(i,type){FP.rooms[i].type=type;fpDraw()}
function fpRename(i,name){FP.rooms[i].name=name;fpDraw()}
function fpSetAbbr(i,abbr){FP.rooms[i].abbr=abbr;fpDraw()}

// Edit area: proportionally scale room to target area
function fpSetArea(i,targetArea){
  fpPushHistory();const r=FP.rooms[i];
  const curArea=fpPolyArea(r.pts);
  if(curArea<0.01||targetArea<0.1)return;
  const ratio=Math.sqrt(targetArea/curArea);
  const c=fpPolyCentroid(r.pts);
  r.pts=r.pts.map(p=>[fpSnap(c[0]+(p[0]-c[0])*ratio),fpSnap(c[1]+(p[1]-c[1])*ratio)]);
  fpDraw();fpUpdateList();
}

// Door controls
function fpToggleDoorSide(ri,di){
  const d=FP.rooms[ri].doors[di];
  d.side=d.side==='left'?'right':'left';
  fpDraw();fpUpdateList();
}
function fpToggleDoorDir(ri,di){
  const d=FP.rooms[ri].doors[di];
  d.dir=d.dir==='in'?'out':'in';
  fpDraw();fpUpdateList();
}
function fpDelDoor(ri,di){
  FP.rooms[ri].doors.splice(di,1);
  fpDraw();fpUpdateList();
}

// ═══ WINDOWS (on wall edges, like doors) ═══
function fpAddWindow(ri,edge,t){
  const r=FP.rooms[ri];
  if(!r.windows)r.windows=[];
  r.windows.push({edge,t,width:1.2});
  fpDraw();fpUpdateList();
}
function fpDelWindow(ri,wi){FP.rooms[ri].windows.splice(wi,1);fpDraw();fpUpdateList()}

// ═══ ARCHITECTURAL ELEMENTS (placed on grid) ═══
// Architectural element definitions — ISO/GOST blueprint style
// draw(ctx,w,h,sel) — custom draw function, coordinates centered at (0,0)
const ELEM_DEFS={
  column:{label:'Кол.',w:0.4,h:0.4,draw(ctx,w,h,s){
    ctx.fillStyle=s?'rgba(30,41,59,.25)':'rgba(30,41,59,.18)';ctx.strokeStyle=s?'#1e293b':'#475569';ctx.lineWidth=1.5;
    ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.moveTo(w/2,-h/2);ctx.lineTo(-w/2,h/2);ctx.stroke();
  }},
  stairs:{label:'Лестн.',w:3,h:1.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;
    ctx.strokeRect(-w/2,-h/2,w,h);
    const steps=Math.round(w/6);for(let i=1;i<steps;i++){const x=-w/2+i*(w/steps);ctx.beginPath();ctx.moveTo(x,-h/2);ctx.lineTo(x,h/2);ctx.stroke()}
    // Arrow
    ctx.beginPath();ctx.moveTo(-w/2+4,0);ctx.lineTo(w/2-4,0);ctx.moveTo(w/2-10,-4);ctx.lineTo(w/2-4,0);ctx.lineTo(w/2-10,4);ctx.stroke();
  }},
  elevator:{label:'Лифт',w:2,h:2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(w/2,h/2);ctx.moveTo(w/2,-h/2);ctx.lineTo(-w/2,h/2);ctx.stroke();
  }},
  wall_part:{label:'Перег.',w:2,h:0.12,draw(ctx,w,h,s){
    ctx.fillStyle=s?'#1e293b':'#475569';ctx.fillRect(-w/2,-h/2,w,h);
  }},
  radiator:{label:'Рад.',w:1.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    ctx.strokeRect(-w/2,-h/2,w,h);
    const n=Math.round(w/8);for(let i=0;i<=n;i++){const x=-w/2+i*(w/n);ctx.beginPath();ctx.moveTo(x,-h/2);ctx.lineTo(x,h/2);ctx.stroke()}
  }},
  ac:{label:'Конд.',w:1,h:0.3,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.setLineDash([3,2]);ctx.beginPath();ctx.moveTo(-w/2+3,0);ctx.lineTo(w/2-3,0);ctx.stroke();ctx.setLineDash([]);
  }},
  vent:{label:'Вент.',w:0.5,h:0.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;const r=w/2;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*0.5,-r*0.5);ctx.lineTo(r*0.5,r*0.5);ctx.moveTo(r*0.5,-r*0.5);ctx.lineTo(-r*0.5,r*0.5);ctx.stroke();
  }},
  electric:{label:'ЩР',w:0.6,h:0.8,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.font='bold 9px Inter,sans-serif';ctx.fillStyle=s?'#1e293b':'#64748b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ЩР',0,0);
  }},
  socket:{label:'Роз.',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;const r=w/2;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(0,r*1.6);ctx.stroke();
  }},
  switch:{label:'Выкл.',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;const r=w/2;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r*1.4,-r*0.8);ctx.stroke();
  }},
  lamp:{label:'Св.',w:0.3,h:0.3,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;const r=w/2;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-r*0.6,-r*0.6);ctx.lineTo(r*0.6,r*0.6);ctx.moveTo(r*0.6,-r*0.6);ctx.lineTo(-r*0.6,r*0.6);ctx.stroke();
  }},
  sink:{label:'Ракв.',w:0.6,h:0.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    // Bowl shape
    ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(-w/2,h/4);ctx.quadraticCurveTo(-w/2,h/2,0,h/2);ctx.quadraticCurveTo(w/2,h/2,w/2,h/4);ctx.lineTo(w/2,-h/2);ctx.closePath();ctx.stroke();
    // Tap
    ctx.beginPath();ctx.arc(0,-h/4,2,0,Math.PI*2);ctx.fill();
  }},
  toilet:{label:'Ун.',w:0.4,h:0.65,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    // Tank
    ctx.strokeRect(-w/2,-h/2,w,h*0.3);
    // Bowl
    ctx.beginPath();ctx.moveTo(-w/2,-h/2+h*0.3);ctx.lineTo(-w/2,h/4);ctx.quadraticCurveTo(-w/2,h/2,0,h/2);ctx.quadraticCurveTo(w/2,h/2,w/2,h/4);ctx.lineTo(w/2,-h/2+h*0.3);ctx.stroke();
  }},
  shower:{label:'Душ',w:0.9,h:0.9,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.strokeRect(-w/2,-h/2,w,h);ctx.setLineDash([]);
    // Drain
    ctx.beginPath();ctx.arc(0,0,3,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,1,0,Math.PI*2);ctx.fillStyle=s?'#1e293b':'#64748b';ctx.fill();
  }},
  water:{label:'ВС',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#2563eb':'#3b82f6';ctx.fillStyle=s?'#2563eb':'#3b82f6';ctx.lineWidth=1.5;
    const r=w/2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.font='bold 7px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('В',0,0);
  }},
  drain:{label:'Кан.',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.fillStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    const r=w/2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.font='bold 7px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('К',0,0);
  }},
  camera:{label:'Кам.',w:0.25,h:0.25,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1;
    // Triangle (field of view)
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-w*0.8,-h);ctx.lineTo(w*0.8,-h);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,w/3,0,Math.PI*2);ctx.fillStyle=s?'#1e293b':'#64748b';ctx.fill();
  }},
  fire_ext:{label:'ОП',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle='#dc2626';ctx.fillStyle='#dc2626';ctx.lineWidth=1.5;
    const r=w/2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();
    ctx.font='bold 7px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('ОП',0,0);
  }},
  fire_alarm:{label:'ИП',w:0.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle='#dc2626';ctx.fillStyle='#dc2626';ctx.lineWidth=1;
    const r=w/2;ctx.beginPath();ctx.moveTo(0,-r);ctx.lineTo(r,r);ctx.lineTo(-r,r);ctx.closePath();ctx.stroke();
    ctx.font='bold 6px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('!',0,1);
  }},
  exit_sign:{label:'Выход',w:0.3,h:0.15,draw(ctx,w,h,s){
    ctx.strokeStyle='#16a34a';ctx.fillStyle='#16a34a';ctx.lineWidth=1;
    ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.beginPath();ctx.moveTo(w/4,-h/3);ctx.lineTo(w/2-2,0);ctx.lineTo(w/4,h/3);ctx.stroke();
  }},
  dental_unit:{label:'Юнит',w:1.8,h:1.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.setLineDash([4,2]);ctx.beginPath();ctx.moveTo(0,-h/2);ctx.lineTo(0,h/2);ctx.stroke();ctx.setLineDash([]);
    ctx.font='bold 8px Inter,sans-serif';ctx.fillStyle=s?'#1e293b':'#64748b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('UNIT',0,0);
  }},
  dental_chair:{label:'Кресло',w:0.7,h:1.8,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    // Seat
    ctx.strokeRect(-w/2,-h/4,w,h/2);
    // Back
    ctx.beginPath();ctx.moveTo(-w/2,-h/4);ctx.lineTo(-w/3,-h/2);ctx.lineTo(w/3,-h/2);ctx.lineTo(w/2,-h/4);ctx.stroke();
    // Headrest
    ctx.beginPath();ctx.arc(0,-h/2,w/4,0,Math.PI*2);ctx.stroke();
  }},
  autoclave:{label:'Автокл.',w:0.7,h:0.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    ctx.beginPath();const rx=w/2,ry=h/2;
    ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();
    ctx.font='bold 7px Inter,sans-serif';ctx.fillStyle=s?'#1e293b':'#64748b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('A/K',0,0);
  }},
  compressor:{label:'Компр.',w:0.8,h:0.6,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;ctx.strokeRect(-w/2,-h/2,w,h);
    ctx.beginPath();ctx.arc(0,0,Math.min(w,h)/3,0,Math.PI*2);ctx.stroke();
    ctx.font='bold 7px Inter,sans-serif';ctx.fillStyle=s?'#1e293b':'#64748b';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('К',0,0);
  }},
  xray:{label:'Рентг.',w:1.5,h:1.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;ctx.strokeRect(-w/2,-h/2,w,h);
    // Radiation symbol (3 sectors)
    const r=Math.min(w,h)/3;
    ctx.fillStyle=s?'rgba(30,41,59,.2)':'rgba(100,100,100,.1)';
    for(let a=0;a<3;a++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,a*Math.PI*2/3,(a+0.5)*Math.PI*2/3);ctx.closePath();ctx.fill();ctx.stroke()}
    ctx.beginPath();ctx.arc(0,0,r/4,0,Math.PI*2);ctx.fillStyle=s?'#1e293b':'#64748b';ctx.fill();
  }},
  suction:{label:'Асп.',w:0.5,h:0.5,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#1e293b':'#64748b';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(0,0,w/2,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(-w/4,0);ctx.lineTo(w/4,0);ctx.moveTo(0,-h/4);ctx.lineTo(0,h/4);ctx.stroke();
  }},
  arch:{label:'Арка',w:1.2,h:0.2,draw(ctx,w,h,s){
    ctx.strokeStyle=s?'#b45309':'#d97706';ctx.lineWidth=2;
    // Gap on wall
    ctx.beginPath();ctx.moveTo(-w/2,0);ctx.lineTo(w/2,0);ctx.stroke();
    // Arch curve above
    ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(-w/2,0);ctx.quadraticCurveTo(0,-w*0.4,w/2,0);ctx.stroke();
    ctx.setLineDash([]);
    // Endpoints
    ctx.fillStyle=s?'#b45309':'#d97706';
    ctx.beginPath();ctx.arc(-w/2,0,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(w/2,0,2.5,0,Math.PI*2);ctx.fill();
  }}
};

// Technical specs per element type — editable properties
const ELEM_SPECS={
  electric:{fields:[{k:'power_kw',l:'Мощность (кВт)',t:'number',v:0},{k:'phases',l:'Фазы',t:'select',opts:['1','3'],v:'3'},{k:'voltage',l:'Напряжение (В)',t:'select',opts:['220','380'],v:'380'},{k:'breakers',l:'Автоматов',t:'number',v:12}]},
  socket:{fields:[{k:'type',l:'Тип',t:'select',opts:['220В','380В','USB','Медицинская'],v:'220В'},{k:'grounded',l:'Заземление',t:'select',opts:['Да','Нет'],v:'Да'}]},
  switch:{fields:[{k:'type',l:'Тип',t:'select',opts:['Одноклавишный','Двухклавишный','Диммер','Проходной'],v:'Одноклавишный'}]},
  lamp:{fields:[{k:'type',l:'Тип',t:'select',opts:['Потолочный','Настенный','Точечный','LED-панель','Аварийный'],v:'Потолочный'},{k:'power_w',l:'Мощность (Вт)',t:'number',v:18}]},
  ac:{fields:[{k:'power_kw',l:'Мощность (кВт)',t:'number',v:2.5},{k:'type',l:'Тип',t:'select',opts:['Сплит','Кассетный','Канальный'],v:'Сплит'}]},
  vent:{fields:[{k:'flow',l:'Производительность (м³/ч)',t:'number',v:100},{k:'type',l:'Тип',t:'select',opts:['Приточная','Вытяжная','Приточно-вытяжная'],v:'Вытяжная'}]},
  radiator:{fields:[{k:'power_w',l:'Мощность (Вт)',t:'number',v:1000},{k:'sections',l:'Секций',t:'number',v:8}]},
  water:{fields:[{k:'diameter',l:'Диаметр (мм)',t:'select',opts:['15','20','25','32'],v:'20'},{k:'type',l:'Тип',t:'select',opts:['ХВС','ГВС'],v:'ХВС'}]},
  drain:{fields:[{k:'diameter',l:'Диаметр (мм)',t:'select',opts:['50','75','110'],v:'50'}]},
  camera:{fields:[{k:'angle',l:'Угол обзора (°)',t:'number',v:110},{k:'resolution',l:'Разрешение',t:'select',opts:['1080p','2K','4K'],v:'2K'},{k:'poe',l:'PoE',t:'select',opts:['Да','Нет'],v:'Да'}]},
  fire_alarm:{fields:[{k:'type',l:'Тип',t:'select',opts:['Дымовой','Тепловой','Комбинированный'],v:'Дымовой'},{k:'addressable',l:'Адресный',t:'select',opts:['Да','Нет'],v:'Да'}]},
  fire_ext:{fields:[{k:'type',l:'Тип',t:'select',opts:['ОП-4','ОП-6','ОУ-3','ОУ-5'],v:'ОП-4'}]},
  dental_unit:{fields:[{k:'model',l:'Модель',t:'text',v:''},{k:'connections',l:'Подключения',t:'select',opts:['Вода+Воздух+Электро','Вода+Электро'],v:'Вода+Воздух+Электро'},{k:'power_kw',l:'Мощность (кВт)',t:'number',v:1.5}]},
  dental_chair:{fields:[{k:'model',l:'Модель',t:'text',v:''},{k:'hydraulic',l:'Привод',t:'select',opts:['Гидравлический','Электрический'],v:'Электрический'}]},
  autoclave:{fields:[{k:'class',l:'Класс',t:'select',opts:['B','S','N'],v:'B'},{k:'volume_l',l:'Объём (л)',t:'number',v:18},{k:'power_kw',l:'Мощность (кВт)',t:'number',v:2}]},
  compressor:{fields:[{k:'power_kw',l:'Мощность (кВт)',t:'number',v:1.5},{k:'tank_l',l:'Ресивер (л)',t:'number',v:50},{k:'oilfree',l:'Безмасляный',t:'select',opts:['Да','Нет'],v:'Да'}]},
  xray:{fields:[{k:'type',l:'Тип',t:'select',opts:['Визиограф','Панорамный','КЛКТ'],v:'Визиограф'},{k:'power_kw',l:'Мощность (кВт)',t:'number',v:1.2}]},
  suction:{fields:[{k:'type',l:'Тип',t:'select',opts:['Сухая','Мокрая','Комби'],v:'Сухая'},{k:'posts',l:'Постов',t:'number',v:3}]},
  elevator:{fields:[{k:'capacity_kg',l:'Грузоподъёмность (кг)',t:'number',v:630}]},
  stairs:{fields:[{k:'width_m',l:'Ширина (м)',t:'number',v:1.2},{k:'type',l:'Тип',t:'select',opts:['Маршевая','Винтовая','Пожарная'],v:'Маршевая'}]},
  toilet:{fields:[{k:'type',l:'Тип',t:'select',opts:['Подвесной','Напольный'],v:'Подвесной'}]},
  shower:{fields:[{k:'type',l:'Тип',t:'select',opts:['Каби��а','Поддон','Безбарьерный'],v:'Кабина'}]},
  arch:{fields:[{k:'width_m',l:'Ширина проёма (м)',t:'number',v:1.2},{k:'style',l:'Стиль',t:'select',opts:['Полукруглая','Стрельчатая','Прямая'],v:'Полукруглая'}]}
};

// Show element info panel on double-click
function fpShowElemInfo(idx){
  const el=FP.elements[idx];if(!el)return;
  const def=ELEM_DEFS[el.type];if(!def)return;
  const spec=ELEM_SPECS[el.type];
  if(!el.specs)el.specs={};
  // Init default values
  if(spec){spec.fields.forEach(f=>{if(el.specs[f.k]===undefined)el.specs[f.k]=f.v})}

  let html=`<div style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:var(--bg);border:1px solid var(--bd);border-radius:12px;padding:20px;z-index:1100;min-width:300px;max-width:400px;box-shadow:0 16px 48px rgba(0,0,0,.15)">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;font-weight:600;color:var(--tx)">${def.label}</span>
      <span style="cursor:pointer;font-size:16px;color:var(--tx3)" onclick="document.getElementById('elemInfoPanel').remove()">✕</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="modal-field"><label>Ширина (м)</label><input type="number" step="0.1" min="0.1" value="${el.w}" onchange="fpResizeElem(${idx},'w',parseFloat(this.value))" style="width:100%"></div>
      <div class="modal-field"><label>Высота (м)</label><input type="number" step="0.1" min="0.1" value="${el.h}" onchange="fpResizeElem(${idx},'h',parseFloat(this.value))" style="width:100%"></div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button class="btn sm" onclick="fpRotateElement(${idx});fpShowElemInfo(${idx})">↻ Повернуть</button>
      <span style="font-size:10px;color:var(--tx3);align-self:center">${el.angle||0}°</span>
    </div>`;

  if(spec&&spec.fields.length){
    html+=`<div style="border-top:1px solid var(--bd);padding-top:10px;margin-top:4px"><span style="font-size:9px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:1px">Характеристики</span></div>`;
    spec.fields.forEach(f=>{
      const val=el.specs[f.k]!==undefined?el.specs[f.k]:f.v;
      if(f.t==='select'){
        html+=`<div class="modal-field"><label>${f.l}</label><select onchange="FP.elements[${idx}].specs['${f.k}']=this.value" style="width:100%">${f.opts.map(o=>`<option${o==val?' selected':''}>${o}</option>`).join('')}</select></div>`;
      }else if(f.t==='number'){
        html+=`<div class="modal-field"><label>${f.l}</label><input type="number" step="any" value="${val}" onchange="FP.elements[${idx}].specs['${f.k}']=parseFloat(this.value)||0" style="width:100%"></div>`;
      }else{
        html+=`<div class="modal-field"><label>${f.l}</label><input type="text" value="${val}" onchange="FP.elements[${idx}].specs['${f.k}']=this.value" style="width:100%"></div>`;
      }
    });
  }

  html+=`<div style="display:flex;gap:6px;margin-top:14px;justify-content:flex-end">
    <button class="btn sm" style="color:var(--rd);border-color:rgba(239,68,68,.3)" onclick="fpDelElement(${idx});document.getElementById('elemInfoPanel').remove()">Удалить</button>
    <button class="btn sm pr" onclick="document.getElementById('elemInfoPanel').remove()">Готово</button>
  </div></div><div style="position:fixed;inset:0;background:rgba(0,0,0,.25);z-index:1099" onclick="document.getElementById('elemInfoPanel').remove()"></div>`;

  let panel=document.getElementById('elemInfoPanel');
  if(panel)panel.remove();
  panel=document.createElement('div');panel.id='elemInfoPanel';panel.innerHTML=html;
  document.body.appendChild(panel);
}

function fpResizeElem(idx,dim,val){
  if(val<0.1)val=0.1;
  FP.elements[idx][dim]=Math.round(val*10)/10;
  fpDraw();
}

function fpAddElement(type){
  if(!type||!ELEM_DEFS[type])return;
  fpPushHistory();const def=ELEM_DEFS[type];
  // Place at center of current view
  const c=document.getElementById('fpCanvas');
  const cx=(c.width/2-FP.ox)/FP.scale,cy=(c.height/2-FP.oy)/FP.scale;
  FP.elements.push({type,x:fpSnap(cx),y:fpSnap(cy),w:def.w,h:def.h,angle:0,specs:{}});
  // Close palette after adding
  const pal=document.getElementById('fpElemPalette');if(pal)pal.style.display='none';
  fpDraw();fpUpdateList();
}

function fpDelElement(i){fpPushHistory();FP.elements.splice(i,1);fpDraw();fpUpdateList()}
function fpRotateElement(i){FP.elements[i].angle=(FP.elements[i].angle+90)%360;fpDraw()}

// Edit room shape: enter vertex editing mode for specific room
function fpEditShape(i){
  FP.sel.clear();FP.sel.add(i);
  fpSetTool('vertex');
  fpDraw();fpUpdateList();
}

// Add vertex to room at midpoint of longest edge
function fpAddVertex(i){
  fpPushHistory();const r=FP.rooms[i];
  let bestEdge=0,bestLen=0;
  for(let e=0;e<r.pts.length;e++){
    const n=(e+1)%r.pts.length;
    const len=Math.hypot(r.pts[n][0]-r.pts[e][0],r.pts[n][1]-r.pts[e][1]);
    if(len>bestLen){bestLen=len;bestEdge=e}
  }
  const a=r.pts[bestEdge],b=r.pts[(bestEdge+1)%r.pts.length];
  r.pts.splice(bestEdge+1,0,[fpSnap((a[0]+b[0])/2),fpSnap((a[1]+b[1])/2)]);
  FP.sel.clear();FP.sel.add(i);
  fpSetTool('vertex');
  fpDraw();fpUpdateList();
}

// Remove last vertex from room (min 3)
function fpRemoveVertex(i){
  fpPushHistory();const r=FP.rooms[i];
  if(r.pts.length<=3){return}
  r.pts.pop();
  fpDraw();fpUpdateList();
}

function fpUpdateList(){
  const el=document.getElementById('fpRoomList');if(!el)return;
  if(!FP.rooms.length){el.innerHTML='<span style="font-size:11px;color:var(--tx3);padding:4px">Рисуйте прямоугольником или полигоном на канвасе, или нажмите «+ Добавить комнату»</span>';return}
  // Merge button
  let html='';
  if(FP.sel.size>=2){
    html+='<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;margin-bottom:6px;background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:8px;flex-wrap:wrap"><span style="font-size:11px;color:var(--ac2);flex:1">Выбрано '+FP.sel.size+'</span><button class="btn sm pr" onclick="fpMergeSelected()">Объединить</button><button class="btn sm" onclick="fpAlignSelected(\'left\')" title="По левому краю">⫷</button><button class="btn sm" onclick="fpAlignSelected(\'top\')" title="По верхнему краю">⫠</button><button class="btn sm" onclick="fpAlignSelected(\'hcenter\')" title="По центру X">⫿</button><button class="btn sm" onclick="fpAlignSelected(\'vcenter\')" title="По центру Y">⫾</button></div>';
  }
  html+=FP.rooms.map((r,i)=>{
    const col=FP.colors[i%FP.colors.length];
    const area=fpPolyArea(r.pts);
    const typeOpts=FP.types.map(t=>`<option${t===r.type?' selected':''}>${t}</option>`).join('');
    const isSel=fpIsSel(i);
    // Door list for this room
    let doorHtml='';
    if(r.doors&&r.doors.length&&isSel){
      doorHtml='<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;padding-left:18px">'+r.doors.map((d,di)=>{
        const sideLabel=d.side==='right'?'Пр':'Лв';
        const dirLabel=d.dir==='out'?'Нар':'Вн';
        return `<span style="display:inline-flex;align-items:center;gap:3px;font-size:9px;padding:2px 6px;border-radius:4px;background:rgba(180,83,9,.08);color:#b45309" onclick="event.stopPropagation()">&#128682;${di+1}
          <button style="font-size:8px;padding:1px 4px;border:1px solid rgba(180,83,9,.2);border-radius:3px;background:rgba(180,83,9,.06);color:#b45309;cursor:pointer" onclick="fpToggleDoorSide(${i},${di})" title="Сторона петель">${sideLabel}</button>
          <button style="font-size:8px;padding:1px 4px;border:1px solid rgba(180,83,9,.2);border-radius:3px;background:rgba(180,83,9,.06);color:#b45309;cursor:pointer" onclick="fpToggleDoorDir(${i},${di})" title="Внутрь/наружу">${dirLabel}</button>
          <button style="font-size:8px;padding:1px 3px;border:1px solid rgba(220,38,38,.2);border-radius:3px;background:rgba(220,38,38,.06);color:var(--rd);cursor:pointer" onclick="fpDelDoor(${i},${di})" title="Удалить дверь">✕</button>
        </span>`;
      }).join('')+'</div>';
    }
    return `<div class="fp-row${isSel?' sel':''}" onclick="fpSelectRoom(${i},event)">
      <span class="fp-color" style="background:${col}"></span>
      <input class="fp-name-input" value="${r.name}" onclick="event.stopPropagation()" onchange="fpRename(${i},this.value)" style="border-color:transparent;background:transparent;padding:2px 4px;font-size:11px;font-weight:500;width:90px" onfocus="this.style.borderColor='var(--ac)';this.style.background='var(--sf)'" onblur="this.style.borderColor='transparent';this.style.background='transparent'">
      <input placeholder="Сокр." value="${r.abbr||''}" onclick="event.stopPropagation()" onchange="fpSetAbbr(${i},this.value)" style="border:1px solid transparent;border-radius:4px;padding:2px 4px;font-size:10px;font-family:var(--f);width:44px;color:var(--ac2);font-weight:600;background:transparent;outline:none" onfocus="this.style.borderColor='var(--ac)';this.style.background='var(--sf)'" onblur="this.style.borderColor='transparent';this.style.background='transparent'" title="Сокращение (приоритет на сетке)">
      <select class="fp-type-select" onclick="event.stopPropagation()" onchange="fpChangeType(${i},this.value)" style="max-width:130px">${typeOpts}</select>
      <input type="number" value="${area.toFixed(1)}" step="0.5" min="0.5" onclick="event.stopPropagation()" onchange="fpSetArea(${i},parseFloat(this.value))" style="border:1px solid transparent;border-radius:4px;padding:2px 4px;font-size:10px;font-family:var(--f);width:52px;text-align:right;background:transparent;outline:none;color:var(--tx)" onfocus="this.style.borderColor='var(--ac)';this.style.background='var(--sf)'" onblur="this.style.borderColor='transparent';this.style.background='transparent'" title="Площадь (м²) — изменит размер пропорционально"> <span style="font-size:9px;color:var(--tx3)">м²</span>
      <span class="fp-del" onclick="event.stopPropagation();fpDelRoom(${i})" title="Удалить из конструктора">✕</span>
      ${doorHtml}
      ${isSel?`<div style="display:flex;gap:4px;margin-top:4px;padding-left:18px;flex-wrap:wrap" onclick="event.stopPropagation()">
        <button style="font-size:8px;padding:2px 6px;border:1px solid var(--acbd);border-radius:4px;background:var(--acbg);color:var(--ac2);cursor:pointer;font-family:var(--f)" onclick="fpEditShape(${i})" title="Режим редактирования вершин">&#9699; Форма</button>
        <button style="font-size:8px;padding:2px 6px;border:1px solid var(--acbd);border-radius:4px;background:var(--acbg);color:var(--ac2);cursor:pointer;font-family:var(--f)" onclick="fpAddVertex(${i})" title="Добавить вершину на длинную сторону">+ Вершина</button>
        ${r.pts.length>3?`<button style="font-size:8px;padding:2px 6px;border:1px solid rgba(220,38,38,.15);border-radius:4px;background:rgba(220,38,38,.06);color:var(--rd);cursor:pointer;font-family:var(--f)" onclick="fpRemoveVertex(${i})" title="Удалить последнюю вершину">− Вершина</button>`:''}
        ${r._merged?`<button style="font-size:8px;padding:2px 6px;border:1px solid rgba(234,179,8,.3);border-radius:4px;background:rgba(234,179,8,.08);color:#b45309;cursor:pointer;font-family:var(--f)" onclick="fpSplitRoom(${i})" title="Разделить на исходные комнаты">&#9986; Разорвать (${r._merged.length})</button>`:''}
        <span style="font-size:8px;color:var(--tx3);align-self:center">${r.pts.length} верш.</span>
      </div>`:''}
    </div>`;
  }).join('');
  // Elements list — grouped by category
  if(FP.elements.length){
    const ELEM_GROUPS={
      'Конструктив':['column','stairs','elevator','wall_part','arch'],
      'Инженерные сети':['radiator','ac','vent','electric','socket','switch','lamp'],
      'Сантехника':['sink','toilet','shower','water','drain'],
      'Безопасность':['camera','fire_ext','fire_alarm','exit_sign'],
      'Стоматология':['dental_unit','dental_chair','autoclave','compressor','xray','suction']
    };
    const typeToGroup={};Object.entries(ELEM_GROUPS).forEach(([g,types])=>types.forEach(t=>typeToGroup[t]=g));
    // Group elements
    const groups={};
    FP.elements.forEach((el,i)=>{const g=typeToGroup[el.type]||'Другое';if(!groups[g])groups[g]=[];groups[g].push({el,i})});
    html+=`<div style="margin-top:8px;padding-top:8px;border-top:1px solid var(--bd)"><span style="font-size:9px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:1px">Элементы на чертеже (${FP.elements.length})</span></div>`;
    Object.entries(groups).forEach(([gName,items])=>{
      html+=`<div style="font-size:8px;font-weight:600;color:var(--tx3);padding:6px 8px 2px;text-transform:uppercase;letter-spacing:.5px">${gName} · ${items.length}</div>`;
      items.forEach(({el,i})=>{
        const def=ELEM_DEFS[el.type];if(!def)return;
        const isSel=(FP.selElem===i);
        return html+=`<div class="fp-row${isSel?' sel':''}" onclick="FP.selElem=${i};FP.sel.clear();fpDraw();fpUpdateList()" ondblclick="event.stopPropagation();fpShowElemInfo(${i})" style="padding:4px 8px">
          <span style="font-size:9px;font-weight:600;color:var(--tx2);width:60px">${def.label}</span>
          <span style="font-size:9px;color:var(--tx3)">${el.w}×${el.h}м${el.angle?' · '+el.angle+'°':''}</span>
          <span style="flex:1"></span>
          ${isSel?`<div style="display:flex;gap:3px;align-items:center" onclick="event.stopPropagation()">
            <button style="font-size:8px;padding:1px 5px;border:1px solid var(--acbd);border-radius:3px;background:var(--acbg);color:var(--ac2);cursor:pointer" onclick="fpRotateElement(${i});fpUpdateList()">↻</button>
            <button style="font-size:8px;padding:1px 5px;border:1px solid var(--acbd);border-radius:3px;background:var(--acbg);color:var(--ac2);cursor:pointer" onclick="fpShowElemInfo(${i})" title="Характеристики">⚙</button>
          </div>`:''}
          <span class="fp-del" onclick="event.stopPropagation();fpDelElement(${i})" title="Удалить элемент">✕</span>
        </div>`;
      });
    });
  }
  el.innerHTML=html;
}

function fpImportImage(){
  const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=e=>{
    const file=e.target.files[0];if(!file)return;
    const reader=new FileReader();reader.onload=ev=>{
      const img=new Image();img.onload=()=>{FP.bgImg=img;fpDraw()};img.src=ev.target.result;
    };reader.readAsDataURL(file);
  };inp.click();
}

function fpClear(){
  const n=FP.rooms.length+FP.elements.length;
  if(!n)return;
  if(!confirm('ВНИМАНИЕ: Это действие необратимо!\n\nБудет удалено: '+FP.rooms.length+' комнат, '+FP.elements.length+' элементов.\nВсе данные планировки будут потеряны.\n\nВы уверены?'))return;
  fpPushHistory();
  FP.rooms=[];FP.elements=[];FP.bgImg=null;FP.sel.clear();FP.selElem=-1;FP.polyPts=[];FP.history=[];FP.future=[];
  fpDraw();fpUpdateList();
}

function fpSave(){
  const data={rooms:FP.rooms,elements:FP.elements,scale:FP.scale,ox:FP.ox,oy:FP.oy,_ts:Date.now()};
  const json=JSON.stringify(data);
  // PROTECTION: never overwrite real data with empty state
  const hasData=FP.rooms.length>0||FP.elements.length>0;
  const existing=uGet('svita_floorplan');
  if(!hasData&&existing){
    try{const old=JSON.parse(existing);if((old.rooms&&old.rooms.length)||(old.elements&&old.elements.length)){
      console.warn('fpSave blocked: refusing to overwrite '+old.rooms.length+' rooms with empty state');
      return;
    }}catch(e){}
  }
  // Keep rolling backup (last 3 saves)
  if(existing){
    const bk2=uGet('svita_floorplan_bk2');
    const bk1=uGet('svita_floorplan_bk1');
    if(bk1)uSet('svita_floorplan_bk2',bk1);
    uSet('svita_floorplan_bk1',existing);
  }
  uSet('svita_floorplan',json);
  // Auto-export backup to file every 10 saves
  FP._saveCount=(FP._saveCount||0)+1;
  if(FP._saveCount%10===0){try{fpAutoBackup(data)}catch(e){}}
  // Visual feedback
  const btn=document.querySelector('[onclick*="fpSave"]');
  if(btn){btn.textContent='✓ Сохранено';btn.classList.add('gn');setTimeout(()=>{btn.textContent='Сохранить';btn.classList.remove('gn')},1500)}
}

// Silent auto-backup to IndexedDB (survives localStorage wipes)
function fpAutoBackup(data){
  try{
    const req=indexedDB.open('svita_backups',1);
    req.onupgradeneeded=e=>{e.target.result.createObjectStore('backups',{keyPath:'id'})};
    req.onsuccess=e=>{
      const db=e.target.result;
      const tx=db.transaction('backups','readwrite');
      const store=tx.objectStore('backups');
      store.put({id:'latest',data,ts:Date.now()});
      store.put({id:'backup_'+new Date().toISOString().slice(0,16),data,ts:Date.now()});
    };
  }catch(e){}
}

// Restore from backup
function fpRestoreBackup(level){
  const key=level===2?'svita_floorplan_bk2':level===1?'svita_floorplan_bk1':'svita_floorplan';
  const raw=uGet(key);
  if(!raw){alert('Бэкап '+(level||0)+' не найден');return}
  try{
    const d=JSON.parse(raw);
    if(!d.rooms||(!d.rooms.length&&!d.elements?.length)){alert('Бэкап пустой');return}
    fpPushHistory();
    FP.rooms=(d.rooms||[]).map(r=>fpEnsurePoly(r));
    FP.elements=d.elements||[];
    FP.scale=d.scale||20;FP.ox=d.ox||40;FP.oy=d.oy||40;
    FP.sel.clear();FP.selElem=-1;
    fpDraw();fpUpdateList();
    alert('Восстановлено: '+FP.rooms.length+' комнат, '+FP.elements.length+' элементов'+(d._ts?' от '+new Date(d._ts).toLocaleString():''));
  }catch(e){alert('Ошибка: '+e.message)}
}

// Try restore from IndexedDB
function fpRestoreFromIDB(){
  try{
    const req=indexedDB.open('svita_backups',1);
    req.onupgradeneeded=e=>{e.target.result.createObjectStore('backups',{keyPath:'id'})};
    req.onsuccess=e=>{
      const db=e.target.result;
      const tx=db.transaction('backups','readonly');
      const store=tx.objectStore('backups');
      const get=store.get('latest');
      get.onsuccess=()=>{
        if(!get.result||!get.result.data){alert('Бэкап в IndexedDB не найден');return}
        const d=get.result.data;
        fpPushHistory();
        FP.rooms=(d.rooms||[]).map(r=>fpEnsurePoly(r));
        FP.elements=d.elements||[];
        FP.scale=d.scale||20;FP.ox=d.ox||40;FP.oy=d.oy||40;
        FP.sel.clear();FP.selElem=-1;
        fpDraw();fpUpdateList();
        alert('Восстановлено из IndexedDB: '+FP.rooms.length+' комнат от '+new Date(get.result.ts).toLocaleString());
      };
    };
  }catch(e){alert('IndexedDB недоступен: '+e.message)}
}

// ═══ EXPORT / IMPORT PROJECT FILE ═══
function fpExportProject(){
  const data={version:1,name:'SVITA Project',date:new Date().toISOString(),rooms:FP.rooms,elements:FP.elements,scale:FP.scale,ox:FP.ox,oy:FP.oy};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download='svita-project-'+new Date().toISOString().slice(0,10)+'.json';
  a.click();URL.revokeObjectURL(a.href);
}
function fpImportProject(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const reader=new FileReader();reader.onload=ev=>{
      try{
        const d=JSON.parse(ev.target.result);
        if(!d.rooms){alert('Неверный формат файла');return}
        fpPushHistory();
        FP.rooms=(d.rooms||[]).map(r=>fpEnsurePoly(r));
        FP.elements=d.elements||[];
        FP.scale=d.scale||20;FP.ox=d.ox||40;FP.oy=d.oy||40;
        FP.sel.clear();FP.selElem=-1;
        fpDraw();fpUpdateList();fpSave();
      }catch(err){alert('Ошибка чтения файла: '+err.message)}
    };reader.readAsText(f);
  };inp.click();
}

// ═══ COPY / PASTE / DUPLICATE ═══
function fpCopy(){
  const data={rooms:[],elements:[]};
  if(FP.selElem>=0){
    data.elements.push(JSON.parse(JSON.stringify(FP.elements[FP.selElem])));
  }
  if(FP.sel.size){
    FP.sel.forEach(i=>{data.rooms.push(JSON.parse(JSON.stringify(FP.rooms[i])))});
  }
  if(!data.rooms.length&&!data.elements.length)return;
  FP.clipboard=data;
}
function fpPaste(){
  if(!FP.clipboard)return;
  fpPushHistory();
  const offset=0.5; // offset pasted items 0.5m
  if(FP.clipboard.rooms.length){
    FP.sel.clear();
    FP.clipboard.rooms.forEach(r=>{
      const copy=JSON.parse(JSON.stringify(r));
      copy.name+=' (копия)';
      copy.pts=copy.pts.map(p=>[fpSnap(p[0]+offset),fpSnap(p[1]+offset)]);
      FP.rooms.push(copy);
      FP.sel.add(FP.rooms.length-1);
    });
  }
  if(FP.clipboard.elements.length){
    FP.clipboard.elements.forEach(el=>{
      const copy=JSON.parse(JSON.stringify(el));
      copy.x=fpSnap(copy.x+offset);copy.y=fpSnap(copy.y+offset);
      FP.elements.push(copy);
      FP.selElem=FP.elements.length-1;
    });
  }
  fpDraw();fpUpdateList();
}
function fpDuplicate(){
  // Quick duplicate selection in place (Ctrl+D)
  fpCopy();fpPaste();
}
function fpSelectAll(){
  FP.sel.clear();
  FP.rooms.forEach((_,i)=>FP.sel.add(i));
  fpDraw();fpUpdateList();
}

// ═══ ALIGNMENT HELPERS ═══
function fpAlignSelected(mode){
  if(FP.sel.size<2)return;
  fpPushHistory();
  const indices=[...FP.sel];
  const bboxes=indices.map(i=>{const bb=fpPolyBBox(FP.rooms[i].pts);return{i,...bb}});
  if(mode==='left'){const minX=Math.min(...bboxes.map(b=>b.x1));bboxes.forEach(b=>{const dx=minX-b.x1;FP.rooms[b.i].pts.forEach(p=>p[0]=fpSnap(p[0]+dx))})}
  if(mode==='right'){const maxX=Math.max(...bboxes.map(b=>b.x2));bboxes.forEach(b=>{const dx=maxX-b.x2;FP.rooms[b.i].pts.forEach(p=>p[0]=fpSnap(p[0]+dx))})}
  if(mode==='top'){const minY=Math.min(...bboxes.map(b=>b.y1));bboxes.forEach(b=>{const dy=minY-b.y1;FP.rooms[b.i].pts.forEach(p=>p[1]=fpSnap(p[1]+dy))})}
  if(mode==='bottom'){const maxY=Math.max(...bboxes.map(b=>b.y2));bboxes.forEach(b=>{const dy=maxY-b.y2;FP.rooms[b.i].pts.forEach(p=>p[1]=fpSnap(p[1]+dy))})}
  if(mode==='hcenter'){
    const avgCx=bboxes.reduce((s,b)=>(s+(b.x1+b.x2)/2),0)/bboxes.length;
    bboxes.forEach(b=>{const dx=avgCx-(b.x1+b.x2)/2;FP.rooms[b.i].pts.forEach(p=>p[0]=fpSnap(p[0]+dx))});
  }
  if(mode==='vcenter'){
    const avgCy=bboxes.reduce((s,b)=>(s+(b.y1+b.y2)/2),0)/bboxes.length;
    bboxes.forEach(b=>{const dy=avgCy-(b.y1+b.y2)/2;FP.rooms[b.i].pts.forEach(p=>p[1]=fpSnap(p[1]+dy))});
  }
  fpDraw();fpUpdateList();
}

// ═══ SNAP-TO-GRID TOGGLE ═══
function fpToggleSnap(){FP.snapEnabled=!FP.snapEnabled;fpDraw()}

function renderStaff(){
  const c=document.getElementById('staffCards');
  const picked=DB.pickedStaff||{};
  const pickedIds=Object.keys(picked);
  // Show only picked staff in tab 4
  const items=pickedIds.map(id=>{const e=DB.employees.find(x=>x.id===id);if(!e)return null;const over=picked[id]||{};return {...e,...over,id:e.id}}).filter(Boolean);
  // Stats
  let totalFot=0;
  items.forEach(r=>{totalFot+=(r.salary||0)});
  const cnt=items.length;
  const avg=cnt?Math.round(totalFot/cnt):0;
  const el=id=>document.getElementById(id);
  if(el('staffCount'))el('staffCount').textContent=cnt;
  if(el('staffFot'))el('staffFot').textContent=totalFot.toLocaleString('ru');
  if(el('staffFotYear'))el('staffFotYear').textContent=(totalFot*12).toLocaleString('ru');
  if(el('staffAvg'))el('staffAvg').textContent=avg.toLocaleString('ru');
  if(el('s4Total'))el('s4Total').textContent=totalFot.toLocaleString('ru')+' PLN';
  if(!cnt){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Добавьте сотрудников из БД Сотрудников</div>';return}
  c.innerHTML=items.map(r=>{
    const statusColor=r.status==='Работает'?'var(--gn)':r.status==='Собеседование'?'var(--yl)':'var(--tx3)';
    return `<div class="c" style="padding:16px;display:flex;align-items:center;gap:12px">
<div style="flex:1;min-width:0">
<div style="font-weight:600;font-size:13px">${esc(r.name)}</div>
<div style="font-size:11px;color:var(--tx2);margin-top:2px">${esc(r.spec)}</div>
<div style="display:flex;gap:8px;margin-top:6px;align-items:center">
<span style="font-size:10px;padding:2px 8px;border-radius:6px;background:${statusColor}15;color:${statusColor};font-weight:600">${r.status||'Вакансия'}</span>
</div>
</div>
<div style="text-align:right;flex-shrink:0">
<div style="font-size:11px;color:var(--tx3)">ЗП/мес</div>
<div style="font-size:16px;font-weight:700;color:var(--ac2)">${(r.salary||0).toLocaleString('ru')} PLN</div>
</div>
<div style="display:flex;gap:4px;flex-shrink:0">
<button class="btn sm" onclick="editStaff('${r.id}')" style="font-size:10px;padding:4px 8px" title="Редактировать">&#9998;</button>
<button class="btn sm" onclick="togglePick('pickedStaff','${r.id}','employees')" style="font-size:10px;padding:4px 8px;color:var(--rd)" title="Убрать">&#10005;</button>
</div>
</div>`;
  }).join('');
}

function editStaff(id){
  const item=DB.employees.find(e=>e.id==id);
  if(!item)return;
  editingId=id;
  modalMode='staff';
  document.getElementById('modalTitle').textContent='Редактировать: '+item.name;
  const fields=MODAL_FIELDS.staff;
  document.getElementById('modalFields').innerHTML=fields.map(f=>`<div class="modal-field"><label>${f.l}</label><input id="mf_${f.k}" type="${f.t||'text'}" placeholder="${f.ph||''}" value="${item[f.k]||''}"></div>`).join('');
  document.getElementById('modalBg').classList.add('vis');
}

function deleteStaff(id){
  DB.employees=DB.employees.filter(e=>e.id!=id);
  renderStaff();buildSidebar();recalc();
}

// DB catalog of all services (sidebar БД Процедур)
function renderServices(){
  const c=document.getElementById('dbServiceCards');
  if(!c)return;
  const groups={};
  DB.services.forEach(s=>{
    const cat=s.category||'Другое';
    if(!groups[cat])groups[cat]={icon:s.categoryIcon||'',items:[]};
    groups[cat].items.push(s);
  });
  const catKeys=Object.keys(groups);
  if(!catKeys.length){c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Загрузка процедур из базы данных...</div>';return}

  const picked=DB.pickedServices||{};
  let html=`<div style="padding:8px 16px;font-size:11px;color:var(--tx2);border-bottom:1px solid var(--bd)">Каталог: <strong>${DB.services.length}</strong> процедур в <strong>${catKeys.length}</strong> категориях · Выбрано: <strong>${Object.keys(picked).length}</strong></div>`;
  catKeys.forEach(cat=>{
    const g=groups[cat];
    const subs={};
    g.items.forEach(s=>{const sc=s.subcategory||'Общие';if(!subs[sc])subs[sc]=[];subs[sc].push(s)});
    const subKeys=Object.keys(subs);
    html+=`<div class="c"><div class="ch"><h3>${g.icon} ${cat}</h3><span style="font-size:10px;color:var(--tx3)">${g.items.length} позиций</span></div><div class="cb">`;
    subKeys.forEach(sub=>{
      if(subKeys.length>1)html+=`<div style="font-size:10px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:1px;padding:8px 0 4px;border-top:1px solid var(--bd)">${sub}</div>`;
      subs[sub].forEach(r=>{
        const added=!!picked[r.id];
        html+=`<div class="ci cost-row"><div class="ct" style="flex:1;min-width:0">${r.name}<div class="ct-sub">${r.desc||''} · ${r.unit} · ${r.difficulty}</div></div><div class="cost-val" style="flex-shrink:0">${r.price} PLN/${r.unit}</div><button class="btn sm ${added?'gn':'pr'}" onclick="toggleSvcPick('${r.id}')" style="flex-shrink:0;min-width:70px">${added?'✓ Добавлено':'+ Добавить'}</button></div>`;
      });
    });
    html+=`</div></div>`;
  });
  c.innerHTML=html;
}

// Selected services in tab 5 (Прайс-лист) — show ALL categories, picked items inside
function renderSelectedServices(){
  const c=document.getElementById('serviceCards');
  const picked=DB.pickedServices||{};
  const pickedIds=Object.keys(picked);

  // Build all categories from loaded services
  const allCats={};
  DB.services.forEach(s=>{
    const cat=s.category||'Другое';
    if(!allCats[cat])allCats[cat]={icon:s.categoryIcon||'',total:0,picked:[]};
    allCats[cat].total++;
    if(picked[s.id]){const cp=picked[s.id].customPrice;allCats[cat].picked.push({...s,qty:picked[s.id].qty||1,unitPrice:cp!=null?cp:s.price,isCustom:cp!=null})}
  });

  const catKeys=Object.keys(allCats);
  if(!catKeys.length){
    c.innerHTML='<div style="padding:24px;text-align:center;color:var(--tx3);font-size:12px">Загрузка категорий...</div>';
    return;
  }

  let html='';
  catKeys.forEach(cat=>{
    const g=allCats[cat];
    const cnt=g.picked.length;
    const catTotal=g.picked.reduce((s,r)=>s+r.unitPrice*r.qty,0);
    const statusTag=cnt>0
      ?`<span style="font-size:10px;color:var(--gn);font-weight:600">${cnt} / ${g.total} выбрано · ${catTotal.toLocaleString('ru')} PLN</span>`
      :`<span style="font-size:10px;color:var(--tx3)">0 / ${g.total} — не выбрано</span>`;

    html+=`<div class="c" style="${cnt?'':'opacity:0.7'}"><div class="ch"><h3>${g.icon} ${cat}</h3><div style="display:flex;align-items:center;gap:8px">${statusTag}<button class="btn sm pr" onclick="nav('db-renovations')" style="font-size:9px">+ Добавить</button></div></div>`;

    if(cnt){
      html+='<div class="cb">';
      g.picked.forEach(r=>{
        const svcRoomId=picked[r.id].room||'';
        const svcRoomOpts=getPickedRoomsList().map(rm=>`<option value="${rm.id}" ${rm.id==svcRoomId?'selected':''}>${rm.name}</option>`).join('');
        html+=`<div class="ci cost-row" style="flex-wrap:nowrap"><div class="ct" style="flex:1;min-width:0">${r.name}<div class="ct-sub">${r.desc||''}</div></div><select onchange="assignSvcRoom('${r.id}',this.value)" style="font-size:10px;padding:3px 6px;border:1px solid var(--bd);border-radius:6px;background:var(--sf);color:var(--tx);max-width:130px;flex-shrink:0"><option value="">— кабинет</option>${svcRoomOpts}</select><div class="sel-qty" style="margin:0 4px"><button onclick="svcSelQty('${r.id}',-1)">−</button><span id="sq_${r.id}">${r.qty}</span><button onclick="svcSelQty('${r.id}',1)">+</button></div><span style="font-size:10px;color:var(--tx3);min-width:30px;text-align:center">${r.unit}</span><div style="display:flex;align-items:center;gap:2px;min-width:90px;justify-content:flex-end"><input type="number" value="${r.unitPrice}" onchange="setCustomPrice('svc','${r.id}',this.value)" style="width:55px;font-size:11px;font-weight:700;color:${r.isCustom?'var(--or)':'var(--ac2)'};text-align:right;border:1px solid var(--bd);border-radius:4px;padding:2px 4px;background:var(--sf)"><span style="font-size:9px;color:var(--tx3)">PLN</span></div><button class="btn sm" style="color:var(--rd);flex-shrink:0" onclick="removeSvcPick('${r.id}')">✕</button></div>`;
      });
      html+='</div>';
    }
    html+='</div>';
  });

  c.innerHTML=html;
  document.getElementById('svcCount').textContent=pickedIds.length;
}

function toggleSvcPick(id){
  if(!DB.pickedServices)DB.pickedServices={};
  if(DB.pickedServices[id]){delete DB.pickedServices[id]}
  else{DB.pickedServices[id]={qty:1}}
  savePicked();renderServices();renderSelectedServices();recalc();
}
function removeSvcPick(id){
  if(DB.pickedServices)delete DB.pickedServices[id];
  savePicked();renderServices();renderSelectedServices();recalc();
}
function assignSvcRoom(id,roomId){
  if(!DB.pickedServices||!DB.pickedServices[id])return;
  DB.pickedServices[id].room=roomId;
  savePicked();
}
function svcSelQty(id,d){
  if(!DB.pickedServices||!DB.pickedServices[id])return;
  DB.pickedServices[id].qty=Math.max(1,(DB.pickedServices[id].qty||1)+d);
  const sp=document.getElementById('sq_'+id);
  if(sp)sp.textContent=DB.pickedServices[id].qty;
  savePicked();recalc();
}

function toggleEquip(el){
  // Legacy — kept for compatibility
  if(event.target.classList.contains('price-edit'))return;
  const sid=parseInt(el.dataset.sid);
  if(sid)togglePickEquip(sid);
}
function eqQty(btn,d){
  const sp=btn.parentElement.querySelector('span');
  sp.textContent=Math.max(1,(parseInt(sp.textContent)||1)+d);
  recalc();
}
function updEquipPrice(inp,sid){
  const item=DB.suppliers.find(s=>s.id==sid);
  if(item)item.price=parseInt(inp.value)||0;
  recalc();
}

function delItem(table,id){
  DB[table]=DB[table].filter(r=>r.id!=id);
  if(table==='renovations')delete DB.pickedRenovations[id];
  if(table==='suppliers')delete DB.pickedEquip[id];
  if(table==='rooms')delete DB.pickedRooms[id];
  if(table==='contractors')delete DB.pickedContractors[id];
  if(table==='employees')delete DB.pickedStaff[id];
  savePicked();renderAll();buildSidebar();recalc();
}

