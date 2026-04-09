// ═══ NEWS EDIT MODE ═══
// Shared across all presentation pages.
// Reads svita_session from localStorage (set by dashboard login).
// If user is admin/superadmin — shows edit button, enables contenteditable on slides.

(function(){
  const SB_URL='https://ctdleobjnzniqkqomlrq.supabase.co';
  const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGxlb2JqbnpuaXFrcW9tbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzE4MTEsImV4cCI6MjA4NzgwNzgxMX0.AMHtY7zGPemKYCxMy2bqRTOEAp8trA_Slor9wmg7C38';

  let session=null;
  try{session=JSON.parse(localStorage.getItem('svita_session'))}catch(e){}
  if(!session||!session.isAdmin)return;

  // Inject CSS
  const style=document.createElement('style');
  style.textContent=`
    .edit-bar{position:fixed;bottom:0;left:0;right:0;height:48px;background:rgba(22,27,34,.95);backdrop-filter:blur(12px);border-top:1px solid rgba(88,166,255,.2);display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:9999;font-family:'Segoe UI',sans-serif;transform:translateY(100%);transition:transform .3s}
    .edit-bar.vis{transform:translateY(0)}
    .edit-bar .eb-left{display:flex;align-items:center;gap:12px}
    .edit-bar .eb-user{font-size:11px;color:#adbac7;opacity:.6}
    .edit-bar .eb-status{font-size:11px;color:#3fb950;font-weight:600}
    .edit-bar .eb-btn{padding:6px 16px;border-radius:6px;border:1px solid #30363d;background:transparent;color:#adbac7;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .15s}
    .edit-bar .eb-btn:hover{border-color:#58a6ff;color:#58a6ff}
    .edit-bar .eb-btn.primary{background:#58a6ff;border-color:#58a6ff;color:#0a0e14}
    .edit-bar .eb-btn.primary:hover{background:#79b8ff}
    .edit-bar .eb-btn.danger{color:#f85149;border-color:#f85149}
    .edit-bar .eb-btn.danger:hover{background:rgba(248,81,73,.1)}
    body.editing .slide [contenteditable="true"]{outline:2px dashed rgba(88,166,255,.3);outline-offset:2px;border-radius:4px;min-height:1em}
    body.editing .slide [contenteditable="true"]:focus{outline-color:#58a6ff;background:rgba(88,166,255,.05)}
    body.editing .slide [contenteditable="true"]:hover{outline-color:rgba(88,166,255,.5)}
    .edit-fab{position:fixed;bottom:20px;right:20px;width:44px;height:44px;border-radius:50%;background:#58a6ff;color:#0a0e14;border:none;font-size:18px;cursor:pointer;z-index:9998;box-shadow:0 4px 16px rgba(88,166,255,.4);display:flex;align-items:center;justify-content:center;transition:all .2s}
    .edit-fab:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(88,166,255,.6)}
    body.editing .edit-fab{display:none}
  `;
  document.head.appendChild(style);

  // FAB button
  const fab=document.createElement('button');
  fab.className='edit-fab';
  fab.innerHTML='&#9998;';
  fab.title='Edit mode';
  document.body.appendChild(fab);

  // Edit bar
  const bar=document.createElement('div');
  bar.className='edit-bar';
  bar.innerHTML=`
    <div class="eb-left">
      <span class="eb-user">${session.name||session.email}</span>
      <span class="eb-status">Edit mode</span>
    </div>
    <div style="display:flex;gap:8px">
      <button class="eb-btn danger" id="ebCancel">Cancel</button>
      <button class="eb-btn primary" id="ebSave">Save changes</button>
    </div>
  `;
  document.body.appendChild(bar);

  let originalHTML='';
  let editing=false;

  function enterEdit(){
    editing=true;
    document.body.classList.add('editing');
    bar.classList.add('vis');
    const wrapper=document.querySelector('.slides-wrapper')||document.querySelector('.news-grid')||document.querySelector('.page');
    originalHTML=wrapper.innerHTML;
    // Make all text elements editable
    const scope=document.querySelector('.slides-wrapper')?'.slide':'.page';
    document.querySelectorAll(scope+' h1, '+scope+' h2, '+scope+' h3, '+scope+' p, '+scope+' li, '+scope+' .subtitle, '+scope+' .tagline, '+scope+' div[data-lang], .news-title, .news-desc, .news-date').forEach(el=>{
      if(!el.querySelector('button')&&!el.querySelector('input')){
        el.setAttribute('contenteditable','true');
      }
    });
  }

  function exitEdit(restore){
    editing=false;
    document.body.classList.remove('editing');
    bar.classList.remove('vis');
    if(restore&&originalHTML){
      const w=document.querySelector('.slides-wrapper')||document.querySelector('.news-grid')||document.querySelector('.page');
      w.innerHTML=originalHTML;
      // Re-init slides
      if(typeof updateSlides==='function')updateSlides();
    }
    document.querySelectorAll('[contenteditable="true"]').forEach(el=>el.removeAttribute('contenteditable'));
  }

  fab.addEventListener('click',()=>enterEdit());
  document.getElementById('ebCancel').addEventListener('click',()=>exitEdit(true));
  document.getElementById('ebSave').addEventListener('click',async()=>{
    // Collect edited HTML and save to Supabase
    const page=location.pathname;
    const w=document.querySelector('.slides-wrapper')||document.querySelector('.news-grid')||document.querySelector('.page');
    const content=w.innerHTML;
    try{
      const res=await fetch(SB_URL+'/rest/v1/rpc/save_page_content',{
        method:'POST',
        headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({p_page:page,p_content:content,p_editor:session.email})
      });
      if(res.ok){
        exitEdit(false);
        showToast('Saved!','ok');
      }else{
        showToast('Save failed','err');
      }
    }catch(e){
      showToast('Network error','err');
    }
  });

  function showToast(msg,type){
    const t=document.createElement('div');
    t.textContent=msg;
    t.style.cssText='position:fixed;top:20px;right:20px;z-index:99999;padding:10px 20px;border-radius:8px;font-size:12px;font-weight:600;color:#fff;font-family:Segoe UI,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:opacity .3s';
    t.style.background=type==='ok'?'#3fb950':'#f85149';
    document.body.appendChild(t);
    setTimeout(()=>{t.style.opacity='0';setTimeout(()=>t.remove(),300)},3000);
  }

  // Keyboard shortcut: Ctrl+E to toggle edit
  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='e'){
      e.preventDefault();
      if(editing)exitEdit(true);else enterEdit();
    }
  });

  // Load saved content on page open
  (async()=>{
    try{
      const res=await fetch(SB_URL+'/rest/v1/rpc/get_page_content',{
        method:'POST',
        headers:{'apikey':SB_KEY,'Content-Type':'application/json'},
        body:JSON.stringify({p_page:location.pathname})
      });
      const data=await res.json();
      if(data&&data.content){
        const w=document.querySelector('.slides-wrapper')||document.querySelector('.news-grid')||document.querySelector('.page');
        w.innerHTML=data.content;
        if(typeof updateSlides==='function')updateSlides();
      }
    }catch(e){}
  })();
})();
