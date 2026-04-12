// ═══════════════ SVITA CROSS-SITE ANALYTICS ═══════════════
// Сквозное логирование: landing ↔ dashboard
// Пишет в Supabase таблицу svita_events, читает cookie/localStorage
// Подключать на ВСЕХ страницах: landing, dashboard, admin
(function(){
  'use strict';

  var SB_URL='https://ctdleobjnzniqkqomlrq.supabase.co';
  var SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZGxlb2JqbnpuaXFrcW9tbHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMzE4MTEsImV4cCI6MjA4NzgwNzgxMX0.AMHtY7zGPemKYCxMy2bqRTOEAp8trA_Slor9wmg7C38';

  // ── Visitor ID (persistent across pages) ──
  function getVisitorId(){
    var vid=localStorage.getItem('svita_vid');
    if(!vid){vid=crypto.randomUUID();localStorage.setItem('svita_vid',vid)}
    return vid;
  }

  // ── Session ID (per browser session) ──
  function getSessionId(){
    var sid=sessionStorage.getItem('svita_sid');
    if(!sid){sid=crypto.randomUUID();sessionStorage.setItem('svita_sid',sid)}
    return sid;
  }

  // ── Get user_id from Supabase auth cookie (cross-subdomain) ──
  function getUserId(){
    try{
      var raw=localStorage.getItem('sb-ctdleobjnzniqkqomlrq-auth-token');
      if(raw){var d=JSON.parse(raw);return d.user&&d.user.id||null}
    }catch(e){}
    return null;
  }

  // ── Page context ──
  function getPage(){
    var p=location.pathname.replace(/\/$/,'').split('/').pop()||'index';
    return p.replace('.html','');
  }

  // ── Log event to Supabase ──
  function logEvent(eventName, meta){
    var payload={
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      user_id: getUserId(),
      event: eventName,
      page: getPage(),
      referrer: document.referrer||null,
      lang: localStorage.getItem('labs67lang')||'en',
      ua: navigator.userAgent,
      screen_w: screen.width,
      screen_h: screen.height,
      meta: meta?JSON.stringify(meta):null,
      ts: new Date().toISOString()
    };

    // Fire-and-forget POST
    fetch(SB_URL+'/rest/v1/svita_events',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'apikey':SB_KEY,
        'Authorization':'Bearer '+SB_KEY,
        'Prefer':'return=minimal'
      },
      body:JSON.stringify(payload)
    }).catch(function(){});
  }

  // ── Auto-log page view ──
  logEvent('page_view');

  // ── Track CTA clicks ──
  document.addEventListener('click',function(e){
    var a=e.target.closest('a.btn-cta,a.btn-primary');
    if(a){
      logEvent('cta_click',{href:a.href,text:a.textContent.trim().substring(0,50)});
    }
  });

  // ── Track signup link clicks ──
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href*="signup"]');
    if(a){
      logEvent('signup_click',{href:a.href});
    }
  });

  // ── Track language changes ──
  window.addEventListener('storage',function(e){
    if(e.key==='labs67lang'&&e.newValue){
      logEvent('lang_change',{from:e.oldValue,to:e.newValue});
    }
  });

  // ── Expose for dashboard/custom events ──
  window.svitaLog=logEvent;

})();
