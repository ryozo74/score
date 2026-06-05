// 殿御命 2026-06-04 cmd_477: Web Push 登録 helper (詳細 log + button 再活性化版)
(function(){
  if (window._scorePushRegisterLoaded) return;
  window._scorePushRegisterLoaded = true;

  function _log(...args) { try { console.log('[score-push]', ...args); } catch(e) {} }
  function _err(...args) { try { console.error('[score-push]', ...args); } catch(e) {} }

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  function _setStatus(msg, color) {
    let st = document.getElementById('push-status-line');
    if (!st) return;
    st.textContent = msg;
    st.className = 'text-xs mt-2 font-bold ' + (color || 'text-slate-500');
  }

  window.scorePushEnable = async function() {
    _log('scorePushEnable() called');
    _setStatus('処理中... SW 登録中', 'text-indigo-600');
    if (!('serviceWorker' in navigator)) {
      _err('serviceWorker not in navigator');
      _setStatus('❌ このブラウザは Service Worker 非対応', 'text-rose-600');
      alert('このブラウザは Service Worker 非対応');
      return false;
    }
    if (!('PushManager' in window)) {
      _err('PushManager not in window');
      _setStatus('❌ このブラウザは Push API 非対応', 'text-rose-600');
      alert('このブラウザは Push API 非対応');
      return false;
    }
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      _err('insecure origin: ' + location.origin);
      _setStatus('❌ HTTPS or localhost 必須 (現状: ' + location.origin + ')', 'text-rose-600');
      alert('Web Push は HTTPS または localhost でのみ動作。現在: ' + location.origin + '\nlocalhost:8201 で開き直してくださいませ');
      return false;
    }
    try {
      // 殿御命 2026-06-04: 古い /static/sw.js scope SW を unregister (cmd_477 修正前 残置対策)
      _log('unregistering legacy SW (if any)...');
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) {
        if (r.scope && r.scope.includes('/static/')) {
          await r.unregister();
          _log('legacy SW unregistered:', r.scope);
        }
      }
      _log('registering SW at root scope...');
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      _log('SW registered:', reg.scope);
      // ready 待ちにタイムアウト付き (5 秒で進める・activate に時間が掛かる場合の保険)
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, rej) => setTimeout(() => rej(new Error('SW ready timeout 5s')), 5000)),
      ]).catch(e => { _log('ready race result:', e.message, '— proceeding anyway'); });
      _log('SW ready (or timeout)');
      _setStatus('処理中... 通知許可待ち', 'text-indigo-600');
      const perm = await Notification.requestPermission();
      _log('Notification.permission =', perm);
      if (perm !== 'granted') {
        _setStatus('❌ 通知許可が降りず (' + perm + ')', 'text-rose-600');
        alert('通知許可が降りずに候 (' + perm + ')');
        return false;
      }
      _setStatus('処理中... VAPID 取得', 'text-indigo-600');
      const metaResp = await fetch('/api/bff/push/meta');
      const meta = await metaResp.json();
      _log('meta:', meta);
      if (!meta.vapid_public_key) {
        _setStatus('❌ VAPID 鍵 未設定', 'text-rose-600');
        alert('サーバ VAPID 鍵未設定');
        return false;
      }
      _setStatus('処理中... 購読作成', 'text-indigo-600');
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(meta.vapid_public_key),
      });
      _log('subscription:', subscription.toJSON());
      _setStatus('処理中... サーバ登録', 'text-indigo-600');
      const resp = await fetch('/api/bff/push/subscribe', {
        method: 'POST', credentials: 'include',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(subscription),
      });
      const respText = await resp.text();
      _log('subscribe resp:', resp.status, respText);
      if (resp.ok) {
        _setStatus('✓ Push 通知 有効 (再 click で再登録可)', 'text-emerald-600');
        const btn = document.getElementById('push-enable-btn');
        if (btn) {
          btn.textContent = '✓ Push 通知 有効 (再登録)';
          btn.classList.remove('bg-indigo-600');
          btn.classList.add('bg-emerald-600');
        }
        const testBtn = document.getElementById('push-test-btn');
        if (testBtn) testBtn.disabled = false;
        return true;
      }
      _setStatus('❌ 登録失敗 HTTP ' + resp.status + ': ' + respText, 'text-rose-600');
      alert('購読登録に失敗 HTTP=' + resp.status + '\n' + respText);
      return false;
    } catch (e) {
      _err('exception:', e);
      _setStatus('❌ 例外: ' + e.name + ': ' + e.message, 'text-rose-600');
      alert('Push 登録 例外: ' + e.name + ': ' + e.message);
      return false;
    }
  };

  window.scorePushTest = async function() {
    _log('scorePushTest() called');
    _setStatus('テスト送信中... (Push + SSE 両方)', 'text-indigo-600');
    try {
      const resp = await fetch('/api/bff/push/test', {method:'POST', credentials:'include'});
      const data = await resp.json();
      _log('test resp:', resp.status, data);
      // 殿御命 2026-06-04 cmd_478: 新レスポンス形式 (push + sse 両方)
      const pushSent = (data.push && data.push.sent) || 0;
      const pushFailed = (data.push && data.push.failed) || 0;
      const sseDelivered = (data.sse && data.sse.delivered) || 0;
      const sseSkipped = (data.sse && data.sse.skipped_no_listener) || 0;
      const msg = `Push: sent=${pushSent} failed=${pushFailed} · SSE: delivered=${sseDelivered} skipped=${sseSkipped}`;
      const anyDelivered = pushSent > 0 || sseDelivered > 0;
      _setStatus('テスト結果: ' + msg, anyDelivered ? 'text-emerald-600' : 'text-rose-600');
      if (!anyDelivered) {
        alert('全経路 送信先 0 件:\nPush subscription: ' + pushSent + ' 件\nSSE listener: ' + sseDelivered + ' 件\n\n📣 Push 通知 を有効化 または別 tab で dashboard 開いてござるか御確認願いたく\n\n詳細: ' + JSON.stringify(data));
      }
    } catch (e) {
      _err('test exception:', e);
      _setStatus('❌ テスト例外: ' + e.message, 'text-rose-600');
      alert('test 例外: ' + e.message);
    }
  };

  _log('push-register.js loaded · origin=' + location.origin + ' · secure=' + (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'));
})();
