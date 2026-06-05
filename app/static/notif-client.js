// 殿御命 2026-06-04 cmd_478: 全 page 共通 SSE 受信 + Push onboarding (D 案)
(function(){
  if (window._scoreNotifClientLoaded) return;
  window._scoreNotifClientLoaded = true;

  function _log(...a){ try{ console.log('[score-notif]', ...a);}catch(e){} }
  function _safeOrigin(){ return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'; }

  // ===== Toast 表示 (SSE 受信時) =====
  let _toastContainer = null;
  function _ensureToastContainer(){
    if (_toastContainer) return _toastContainer;
    _toastContainer = document.createElement('div');
    _toastContainer.id = 'score-toast-container';
    _toastContainer.style.cssText = 'position:fixed!important;bottom:20px!important;right:20px!important;z-index:2147483647!important;display:flex!important;flex-direction:column;gap:8px;max-width:380px;pointer-events:none;';
    document.body.appendChild(_toastContainer);
    return _toastContainer;
  }
  function _showToast(title, body, url){
    console.warn('[score-notif] _showToast called:', title, body);
    const c = _ensureToastContainer();
    const t = document.createElement('div');
    t.style.cssText = 'background:white!important;border-left:6px solid #6366f1!important;border-radius:12px;padding:14px 18px;box-shadow:0 8px 32px rgba(0,0,0,0.25)!important;cursor:pointer;font-family:system-ui,sans-serif;animation:scoreToastIn .25s ease;min-width:280px;pointer-events:auto;color:#1e293b!important;';
    t.innerHTML = `<div style="font-weight:900;font-size:13px;color:#1e293b;margin-bottom:4px;">${_esc(title||'通知')}</div><div style="font-size:11px;color:#64748b;white-space:pre-wrap;max-height:60px;overflow:hidden;">${_esc((body||'').slice(0,200))}</div>`;
    if (url) t.onclick = () => { window.location.href = url; };
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(), 350); }, 8000);
  }
  // 殿御命 2026-06-04: window 公開 (手動 console テスト用)
  window._showScoreToast = _showToast;
  function _esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  // ===== SSE 接続 =====
  let _es = null;
  async function _connectSSE(){
    if (_es) return;
    try {
      const prefs = await _loadPrefs();
      if (!(prefs.channels && prefs.channels.sse)) { _log('SSE disabled by user prefs'); return; }
      _es = new EventSource('/api/bff/notifications/stream');
      _es.addEventListener('hello', (e) => console.warn('[score-notif] SSE hello:', e.data));
      _es.addEventListener('notif', (e) => {
        console.warn('[score-notif] SSE notif event received:', e.data);
        try {
          const d = JSON.parse(e.data);
          _showToast(d.title, d.body, d.url);
        } catch (err) { console.error('[score-notif] SSE parse err:', err, e.data); }
      });
      // generic message fallback (event 名が default の場合)
      _es.onmessage = (e) => console.warn('[score-notif] SSE generic message:', e.data);
      _es.onerror = (ev) => {
        _log('SSE error · readyState=' + _es.readyState);
        if (_es.readyState === EventSource.CLOSED) {
          _es = null;
          setTimeout(_connectSSE, 5000);  // 自動再接続
        }
      };
    } catch (e) { _log('SSE connect exception:', e); }
  }

  async function _loadPrefs(){
    try {
      const r = await fetch('/api/bff/notif/prefs', {credentials:'include'});
      if (r.ok) return await r.json();
    } catch (e) {}
    return { channels: { push: true, sse: true, badge: true } };
  }

  // ===== Push onboarding banner =====
  function _showOnboardBanner(){
    if (localStorage.getItem('score_push_onboarded') === 'dismissed') return;
    if (!_safeOrigin()) return;
    if (Notification.permission !== 'default') return;
    const b = document.createElement('div');
    b.id = 'score-push-onboard';
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:white;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:16px;z-index:9998;font-family:system-ui,sans-serif;font-size:13px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.15);';
    b.innerHTML = '<span>🔔 重要通知を OS で受け取る</span><button id="score-push-yes" style="background:white;color:#6366f1;border:none;padding:6px 14px;border-radius:8px;font-weight:900;cursor:pointer;">有効化</button><button id="score-push-no" style="background:rgba(255,255,255,0.2);color:white;border:none;padding:6px 12px;border-radius:8px;cursor:pointer;">あとで</button>';
    document.body.appendChild(b);
    document.getElementById('score-push-yes').onclick = async () => {
      if (window.scorePushEnable) {
        const ok = await window.scorePushEnable();
        if (ok) { localStorage.setItem('score_push_onboarded', 'dismissed'); b.remove(); }
      } else { alert('push-register.js 未ロード'); }
    };
    document.getElementById('score-push-no').onclick = () => {
      localStorage.setItem('score_push_onboarded', 'dismissed'); b.remove();
    };
  }

  // ===== granted user は silent re-subscribe =====
  async function _silentResub(){
    if (!_safeOrigin()) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      const prefs = await _loadPrefs();
      if (!(prefs.channels && prefs.channels.push)) return;
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const m = await (await fetch('/api/bff/push/meta')).json();
        if (!m.vapid_public_key) return;
        const k = m.vapid_public_key;
        const padding = '='.repeat((4 - k.length % 4) % 4);
        const b64 = (k + padding).replace(/-/g,'+').replace(/_/g,'/');
        const raw = atob(b64);
        const arr = new Uint8Array(raw.length);
        for (let i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
        sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: arr });
        await fetch('/api/bff/push/subscribe', {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(sub)});
        _log('silent re-subscribed');
      }
    } catch (e) { _log('silent resub exception:', e); }
  }

  // ===== keyframes 注入 =====
  const sty = document.createElement('style');
  sty.textContent = '@keyframes scoreToastIn{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}';
  document.head.appendChild(sty);

  // ===== 起動 =====
  function _init(){
    _showOnboardBanner();
    _silentResub();
    _connectSSE();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _init);
  else _init();
  _log('notif-client loaded · origin=' + location.origin);
})();
