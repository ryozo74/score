"""書込BFF 10EP — calender_api_complete_list.md §8 実在EPのみ (捏造ゼロ)"""
import os as _os
import json as _json
from pathlib import Path as _Path
from threading import Lock as _Lock

from fastapi import APIRouter, Depends, Path, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import JSONResponse
from typing import Optional

from app.adapters.calendar_factory import get_calendar_client
from app.deps import get_actor_id

# 殿御命 2026-06-04 cmd_477: Web Push subscription store (簡易 file-based)
_PUSH_STORE = _Path("/tmp/score_push_subs.json")
_PUSH_LOCK = _Lock()


def _push_store_read() -> dict:
    if not _PUSH_STORE.exists():
        return {}
    try:
        return _json.loads(_PUSH_STORE.read_text(encoding="utf-8") or "{}")
    except Exception:
        return {}


def _push_store_write(data: dict) -> None:
    with _PUSH_LOCK:
        _PUSH_STORE.write_text(_json.dumps(data, ensure_ascii=False), encoding="utf-8")


def _send_web_push(subscription: dict, payload: dict) -> tuple[bool, str]:
    """単一 subscription に Web Push 配信。成否 + メッセージ返却。"""
    try:
        from pywebpush import webpush, WebPushException
    except ImportError:
        return False, "pywebpush 未導入"
    priv = _os.environ.get("VAPID_PRIVATE_KEY", "")
    sub_email = _os.environ.get("VAPID_CLAIM_SUB", "mailto:noreply@example.com")
    if not priv:
        return False, "VAPID_PRIVATE_KEY 未設定"
    try:
        webpush(
            subscription_info=subscription,
            data=_json.dumps(payload, ensure_ascii=False),
            vapid_private_key=priv,
            vapid_claims={"sub": sub_email},
            ttl=60,
        )
        return True, "sent"
    except Exception as e:
        return False, str(e)[:200]


def _push_to_cuids(cuid_list: list[int], payload: dict) -> dict:
    """Calendar uid list に対応する全 subscription に push 配信。結果 dict 返却。"""
    store = _push_store_read()
    sent = 0
    failed = 0
    details = []
    for cuid in cuid_list:
        subs = store.get(str(cuid), [])
        for sub in subs:
            ok, msg = _send_web_push(sub, payload)
            if ok: sent += 1
            else: failed += 1
            details.append({"cuid": cuid, "ok": ok, "msg": msg})
    return {"sent": sent, "failed": failed, "details": details}

router = APIRouter()


@router.post("/api/bff/retakes")
def post_retakes(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_retakes(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/shots/{id}/approve")
def post_shot_approve(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_shot_approve(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/look_distributions")
def post_look_distributions(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_look_distributions(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/timecards/clock_out")
def post_timecard_clock_out(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_timecard_clock_out(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/routines")
def post_routines(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_routines(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/change_requests")
def post_change_requests(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_change_requests(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/troubles")
def post_troubles(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_troubles(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/troubles/{id}/resolve")
def patch_trouble_resolve(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.patch_trouble_resolve(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/messages")
def post_messages(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.post_messages(body, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/notifications/{id}/read")
def patch_notification_read(
    id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    client = get_calendar_client()
    result = client.patch_notification_read(id, body or {}, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/look_distributions/{id}/accept")
def patch_look_distribution_accept(
    id: int = Path(...),
    actor_id: str = Depends(get_actor_id),
):
    """Look 配布 受諾 (nibu 殿御回答 2026-06-01 F 高)"""
    client = get_calendar_client()
    result = client.patch_look_distribution_accept(id, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/look_distributions/{id}/complete")
def patch_look_distribution_complete(
    id: int = Path(...),
    actor_id: str = Depends(get_actor_id),
):
    """Look 配布 完了通知 (nibu 殿御回答 2026-06-01 F 高)"""
    client = get_calendar_client()
    result = client.patch_look_distribution_complete(id, actor_user_id=actor_id)
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/assets")
async def post_asset_upload(
    file: UploadFile = File(...),
    task_id: Optional[int] = Form(None),
    shot_id: Optional[int] = Form(None),
    version: Optional[str] = Form(None),
    submission_type: Optional[str] = Form(None),   # 殿御命 2026-06-03: 'qc' | 'review'
    mentions: Optional[str] = Form(None),           # 殿御命 2026-06-03: カンマ区切り uid/email
    actor_id: str = Depends(get_actor_id),
):
    """QC/review asset upload (殿御命 2026-06-01)
    multipart pass-through → Calendar POST /api/assets
    殿御命 2026-06-03: submission_type (qc/review) + mentions を受領 (Phase 1: log のみ・Phase 2 cmd で通知作成)
    殿御命 2026-06-03: QC/review は 500MB 上限 (実データ納品は別経路)"""
    client = get_calendar_client()
    content = await file.read()
    # server side size check (client side JS と二重防壁)
    if len(content) > 500 * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large: {len(content)//1024//1024}MB > 500MB (QC/review max・実データ納品は別経路)")
    result = client.post_asset(
        file_data=content,
        filename=file.filename or "upload.bin",
        content_type=file.content_type or "application/octet-stream",
        actor_user_id=actor_id,
        task_id=task_id,
        shot_id=shot_id,
        version=version,
    )
    # 殿御命 2026-06-04 (cmd_476): review/QC 提出時 SHOT 関係者全員 thread に依頼 自動投稿
    # 御方針: QC=Director 自動 + PM 必須 / Review=mention 主体 + PM 必須
    #         SHOT thread = PM + Director + Lighting Lead + その SHOT の task assignee 全員
    #         (殿御指摘 2026-06-04: 個別 DM ではなく SHOT 関係者 全員に届くべき)
    # 暫定 hardcode: Calendar 側に project.director_id / pm_id 解決 EP 不在 (Phase 2 nibu 殿差替)
    if submission_type in ("qc", "review"):
        # project / seq / shot / task 階層解決 (殿御命 2026-06-04: タイトル階層化)
        proj_name = ""
        seq_code = ""
        shot_code = ""
        task_type = ""
        shot_assignee_uids: set[int] = set()
        if shot_id:
            try:
                shot_info = client.get_shot_detail(shot_id, actor_user_id=actor_id)
                shot_code = shot_info.get("shotID") or shot_info.get("name") or f"SHOT_{shot_id:03d}"
                seq_code = shot_info.get("seqID") or shot_info.get("seq_code") or shot_info.get("sequence") or ""
                pid = shot_info.get("project_id")
                if pid is not None:
                    try:
                        for p in (client.get_projects(actor_user_id=actor_id) or []):
                            if isinstance(p, dict) and p.get("id") == pid:
                                proj_name = p.get("name") or ""
                                break
                    except Exception:
                        pass
                # SHOT 内 全 task の assignee + 対象 task の type 取得
                for tk in (shot_info.get("task_list") or shot_info.get("tasks") or []):
                    if isinstance(tk, dict):
                        a = tk.get("assignee_id") or tk.get("assigned_to")
                        if a is not None:
                            try: shot_assignee_uids.add(int(a))
                            except (ValueError, TypeError): pass
                        if task_id and (tk.get("id") == task_id or tk.get("task_id") == task_id):
                            task_type = tk.get("type") or tk.get("task_type") or ""
            except Exception:
                pass

        # mention 列 → uid 解決
        def _resolve_uids(raw_csv: str | None) -> set[int]:
            uids: set[int] = set()
            if not raw_csv:
                return uids
            for token in (m.strip() for m in raw_csv.split(",") if m.strip()):
                if token.isdigit():
                    uids.add(int(token))
                elif "@" in token:
                    try:
                        for u in (client.get_users(actor_user_id=actor_id) or []):
                            if isinstance(u, dict) and (u.get("email") or "").lower() == token.lower():
                                uid = u.get("id") or u.get("user_id")
                                if uid is not None:
                                    uids.add(int(uid))
                                break
                    except Exception:
                        pass
            return uids

        mention_uids = _resolve_uids(mentions)

        # SHOT 関係者 base (memory 御方針: PM=Tanaka, Director=Yamada, Lighting Lead=Kato)
        # 暫定 hardcode: Score uid→Cal uid: 1→52, 10→53, 20→54
        SHOT_BASE_PM_CUID = 52
        SHOT_BASE_DIRECTOR_CUID = 53
        SHOT_BASE_LIGHTING_LEAD_CUID = 54
        from app.adapters.calendar_client import _to_calendar_uid
        sender_cuid = _to_calendar_uid(actor_id)
        sender_cuid_int = int(sender_cuid) if sender_cuid is not None else None

        # SHOT thread participants: PM + Director + Lead + task assignees + mention + sender
        shot_member_uids: set[int] = set()
        shot_member_uids |= {SHOT_BASE_PM_CUID, SHOT_BASE_DIRECTOR_CUID, SHOT_BASE_LIGHTING_LEAD_CUID}
        shot_member_uids |= shot_assignee_uids
        shot_member_uids |= mention_uids
        if sender_cuid_int is not None:
            shot_member_uids.add(sender_cuid_int)
        participants = sorted(shot_member_uids)

        # sender display name (本文末尾 署名用)
        sender_name = actor_id
        try:
            me = client.get_me(actor_user_id=actor_id)
            nm = getattr(me, "name", "") or (getattr(me, "email", "") or "").split("@")[0]
            if nm: sender_name = nm
        except Exception:
            pass

        # QC ビューアリンク (殿御命: 所定の review 対象リンク必須)
        import os as _os
        public_base = _os.environ.get("SCORE_PUBLIC_URL", "").rstrip("/")
        qc_link = ""
        if shot_id:
            path = f"/qc/{shot_id}"
            qc_link = (public_base + path) if public_base else path

        if len(participants) >= 2 and hasattr(client, "post_dm_thread"):
            try:
                thread_resp = client.post_dm_thread(
                    participant_ids=participants,
                    task_id=task_id,
                    actor_user_id=actor_id,
                )
                thread_id = thread_resp.get("thread_id") or thread_resp.get("id")
                if thread_id and hasattr(client, "post_dm"):
                    fname = result.get("filename", file.filename or "asset")
                    ver = version or "version 未指定"
                    head = "🔍 QC 依頼" if submission_type == "qc" else "📌 Review 依頼"
                    # mention 表示
                    mention_text = ""
                    if mention_uids:
                        names = []
                        try:
                            users = client.get_users(actor_user_id=actor_id) or []
                            uid_to_name = {int(u.get("id") or u.get("user_id") or 0): (u.get("name") or (u.get("email") or "").split("@")[0]) for u in users if isinstance(u, dict)}
                            names = [uid_to_name.get(u, f"uid {u}") for u in sorted(mention_uids)]
                        except Exception:
                            names = [f"uid {u}" for u in sorted(mention_uids)]
                        mention_text = "宛先: " + ", ".join(names)
                    # 殿御命 2026-06-04: タイトル階層化 (proj / seq / shot / task)
                    hier = [p for p in (proj_name, seq_code, shot_code, task_type) if p]
                    title_line = " / ".join(hier) if hier else "(対象未指定)"
                    lines = [
                        f"{head}",
                        title_line,
                        "",
                        f"{ver} を提出致しました。御手隙の際に御確認願います。",
                        f"ファイル: {fname}",
                    ]
                    if mention_text:
                        lines.append(mention_text)
                    if qc_link:
                        # 殿御命 2026-06-04: 本文末尾は URL のみ (Score 側 JS で button 化)
                        lines.append("")
                        lines.append(qc_link)
                    lines.append("")
                    lines.append(f"— {sender_name}")
                    body_text = "\n".join(lines)
                    client.post_dm(int(thread_id), body_text, actor_user_id=actor_id)
                    # 殿御命 2026-06-04 cmd_478: D 案 — user 設定で Push / SSE 振り分け配信
                    from app.routers.pages_notif_settings import get_user_prefs
                    from app.routers.sse_notifications import push_sse_event
                    push_payload = {
                        "title": f"{head}: {title_line}",
                        "body": f"{ver} 提出 by {sender_name}",
                        "url": f"/qc/{shot_id}" if shot_id else "/messages",
                        "tag": f"score-review-{thread_id}",
                    }
                    cat_key = "qc_request" if submission_type == "qc" else "review_request"
                    push_targets = []
                    sse_targets = []
                    skipped_by_pref = []
                    for cuid in participants:
                        if sender_cuid_int is not None and cuid == sender_cuid_int:
                            continue  # sender 除外
                        prefs = get_user_prefs(int(cuid))
                        if not prefs.get("categories", {}).get(cat_key, True):
                            skipped_by_pref.append(cuid)
                            continue  # この種別が OFF
                        if prefs.get("channels", {}).get("push", True):
                            push_targets.append(cuid)
                        if prefs.get("channels", {}).get("sse", True):
                            sse_targets.append(cuid)
                    push_result = _push_to_cuids(push_targets, push_payload) if push_targets else {"sent": 0, "failed": 0, "details": []}
                    sse_result = push_sse_event(sse_targets, "notif", push_payload) if sse_targets else {"delivered": 0, "skipped_no_listener": 0}
                    result = {**result, "review_thread_id": thread_id, "shot_thread_participants": participants, "push_result": push_result, "sse_result": sse_result, "skipped_by_pref": skipped_by_pref}
            except Exception as e:
                result = {**result, "review_thread_error": str(e)}
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.patch("/api/bff/tasks/{task_id}")
def patch_task(
    task_id: int = Path(...),
    body: dict = None,
    actor_id: str = Depends(get_actor_id),
):
    """殿御命 2026-06-03: task status / progress 更新
    Calendar PATCH /api/tasks/{id} pass-through (status: todo/in-progress/review/completed/delayed, progress: 0-100)"""
    client = get_calendar_client()
    payload = body or {}
    # validation
    if "status" in payload and payload["status"] not in ("todo", "in-progress", "review", "completed", "delayed"):
        raise HTTPException(status_code=400, detail=f"Invalid status: {payload['status']}")
    if "progress" in payload:
        try:
            p = int(payload["progress"])
            if p < 0 or p > 100:
                raise ValueError("range")
        except (ValueError, TypeError):
            raise HTTPException(status_code=400, detail="progress must be 0-100")
    if not payload:
        raise HTTPException(status_code=400, detail="empty body")
    result = client.patch_task(task_id, payload, actor_user_id=actor_id) if hasattr(client, "patch_task") else {"ok": False, "reason": "client method not implemented"}
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/dm/threads")
def post_dm_thread(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    """殿御命 2026-06-04: 手動 DM thread 作成 (nibu 殿 2026-06-03 実装 pass-through)
    actor を participant_ids に自動 include (Score UI 簡素化)"""
    client = get_calendar_client()
    pids = list(body.get("participant_ids") or [])
    tid = body.get("task_id")
    # 殿御命: actor を participant に自動含める (Score UX 改善)
    from app.adapters.calendar_client import _to_calendar_uid
    actor_cuid = _to_calendar_uid(actor_id)
    if actor_cuid is not None and int(actor_cuid) not in [int(p) for p in pids if str(p).isdigit() or isinstance(p, int)]:
        pids.append(int(actor_cuid))
    if not pids or len(pids) < 2:
        raise HTTPException(status_code=400, detail="participant_ids must contain >= 2 users (incl self)")
    result = client.post_dm_thread(pids, task_id=tid, actor_user_id=actor_id) if hasattr(client, "post_dm_thread") else {"ok": False, "reason": "client method not implemented"}
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/dm")
def post_dm(
    body: dict,
    actor_id: str = Depends(get_actor_id),
):
    """殿御命 2026-06-04: DM thread 内 message 送信 (nibu 殿 POST /api/dm pass-through)"""
    client = get_calendar_client()
    tid = body.get("thread_id")
    bd = (body.get("body") or "").strip()
    if not tid or not bd:
        raise HTTPException(status_code=400, detail="thread_id and body required")
    result = client.post_dm(int(tid), bd, actor_user_id=actor_id) if hasattr(client, "post_dm") else {"ok": False, "reason": "client method not implemented"}
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.get("/api/bff/push/meta")
def push_meta():
    """殿御命 2026-06-04 cmd_477: VAPID 公開鍵 配布 (Service Worker 購読登録時に使用)"""
    return JSONResponse(content={
        "vapid_public_key": _os.environ.get("VAPID_PUBLIC_KEY", ""),
    })


@router.post("/api/bff/push/subscribe")
async def push_subscribe(request: Request, actor_id: str = Depends(get_actor_id)):
    """殿御命 2026-06-04 cmd_477: Service Worker subscription 受領
    cuid 別に保存 (同一 endpoint は重複登録防止)"""
    from app.adapters.calendar_client import _to_calendar_uid
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        raise HTTPException(status_code=400, detail="actor_id → Calendar uid 解決不可")
    body = await request.json()
    if not body or "endpoint" not in body:
        raise HTTPException(status_code=400, detail="subscription endpoint 必須")
    store = _push_store_read()
    key = str(cuid)
    subs = store.get(key, [])
    if not any(s.get("endpoint") == body.get("endpoint") for s in subs):
        subs.append(body)
        store[key] = subs
        _push_store_write(store)
    return JSONResponse(content={"ok": True, "cuid": int(cuid), "total_subs": len(subs)})


@router.post("/api/bff/push/test")
def push_test(actor_id: str = Depends(get_actor_id)):
    """殿御命 2026-06-04 cmd_477/478: 自分宛 テスト 配信 (Push + SSE 両方発火)"""
    from app.adapters.calendar_client import _to_calendar_uid
    from app.routers.sse_notifications import push_sse_event
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        raise HTTPException(status_code=400, detail="cuid 解決不可")
    payload = {
        "title": "Score テスト通知",
        "body": "通知配信 動作確認 — 本将軍より 御確認願いたく",
        "url": "/notification_center",
        "tag": "score-test",
    }
    push_result = _push_to_cuids([int(cuid)], payload)
    sse_result = push_sse_event([int(cuid)], "notif", payload)
    return JSONResponse(content={"push": push_result, "sse": sse_result})


@router.get("/api/bff/dm/threads_meta")
def get_dm_threads_meta(actor_id: str = Depends(get_actor_id)):
    """殿御命 2026-06-04: sidemenu 未読 badge 用 軽量 endpoint
    全 page で 1 fetch で済むよう thread_id + updated_at のみ返却
    (リアルタイム性重視・cache 無し pass-through)"""
    client = get_calendar_client()
    threads = []
    if hasattr(client, "get_my_dm_threads"):
        try:
            raw = client.get_my_dm_threads(actor_user_id=actor_id) or []
            for t in raw:
                if isinstance(t, dict):
                    threads.append({
                        "thread_id": t.get("thread_id") or t.get("id"),
                        "updated_at": t.get("updated_at") or "",
                    })
        except Exception:
            pass
    return JSONResponse(content={"threads": threads}, headers={"X-Actor-User-Id": actor_id})


@router.delete("/api/bff/assets/{asset_id}")
def delete_asset_endpoint(
    asset_id: int = Path(...),
    actor_id: str = Depends(get_actor_id),
):
    """殿御命 2026-06-03: asset 削除 (nibu 殿 DELETE /api/assets/{id} pass-through)
    本人 or admin のみ可 (Calendar 側で 403 enforce)"""
    client = get_calendar_client()
    result = client.delete_asset(asset_id, actor_user_id=actor_id) if hasattr(client, "delete_asset") else {"ok": False, "reason": "client method not implemented"}
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})


@router.post("/api/bff/me/avatar")
async def upload_my_avatar(
    file: UploadFile = File(...),
    actor_id: str = Depends(get_actor_id),
):
    """Avatar image upload → Calendar POST /api/me/avatar pass-through"""
    client = get_calendar_client()
    content = await file.read()
    result = client.post_my_avatar(
        file_data=content,
        filename=file.filename or "avatar",
        content_type=file.content_type or "application/octet-stream",
        actor_user_id=actor_id,
    )
    return JSONResponse(content=result, headers={"X-Actor-User-Id": actor_id})
