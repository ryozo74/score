"""殿御命 2026-06-04 cmd_478: 通知設定 (D 案 — Web Push + SSE + 画面 badge の三重立て・user 別 ON/OFF)"""
import json as _json
from pathlib import Path as _Path
from threading import Lock as _Lock

from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from jinja2 import Environment, FileSystemLoader

from app.adapters.calendar_factory import get_calendar_client
from app.adapters.calendar_client import _to_calendar_uid
from app.deps import get_actor_id

router = APIRouter()
_templates = Jinja2Templates(
    env=Environment(loader=FileSystemLoader("app/templates"), cache_size=0)
)

_PREFS_STORE = _Path("/tmp/score_notif_prefs.json")
_PREFS_LOCK = _Lock()

DEFAULT_PREFS = {
    "channels": {
        "push": True,    # Web Push (OS toast)
        "sse": True,     # 在席中 banner
        "badge": True,   # sidemenu 赤丸 + 通知センター (常に True 推奨)
    },
    "categories": {
        "review_request": True,   # 📌 Review 依頼
        "qc_request": True,       # 🔍 QC 依頼
        "dm_received": True,      # 💬 DM 受信
        "shot_thread_msg": True,  # 👥 SHOT thread 投稿
        "mention": True,          # @mention 含む
    },
}


def _prefs_read() -> dict:
    if not _PREFS_STORE.exists():
        return {}
    try:
        return _json.loads(_PREFS_STORE.read_text(encoding="utf-8") or "{}")
    except Exception:
        return {}


def _prefs_write(data: dict) -> None:
    with _PREFS_LOCK:
        _PREFS_STORE.write_text(_json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def get_user_prefs(cuid: int) -> dict:
    """ユーザー (Cal uid) の 通知設定 取得 (未設定なら DEFAULT_PREFS)"""
    store = _prefs_read()
    saved = store.get(str(cuid), {})
    # 浅い merge (channels / categories 各 dict を default で補完)
    merged = {
        "channels": {**DEFAULT_PREFS["channels"], **(saved.get("channels") or {})},
        "categories": {**DEFAULT_PREFS["categories"], **(saved.get("categories") or {})},
    }
    return merged


def set_user_prefs(cuid: int, prefs: dict) -> dict:
    store = _prefs_read()
    store[str(cuid)] = prefs
    _prefs_write(store)
    return prefs


@router.get("/settings/notifications")
def get_notif_settings_page(request: Request, actor_id: str = Depends(get_actor_id)):
    """通知設定 SSR page"""
    client = get_calendar_client()
    try:
        user = client.get_me(actor_user_id=actor_id)
    except Exception:
        user = None
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        raise HTTPException(status_code=400, detail="cuid 解決不可")
    prefs = get_user_prefs(int(cuid))
    return _templates.TemplateResponse(
        request=request, name="notif_settings.html",
        context={"user": user, "active": "settings", "prefs": prefs, "cuid": int(cuid)},
    )


@router.get("/api/bff/notif/prefs")
def api_get_prefs(actor_id: str = Depends(get_actor_id)):
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        raise HTTPException(status_code=400, detail="cuid 解決不可")
    return JSONResponse(content=get_user_prefs(int(cuid)))


@router.post("/api/bff/notif/prefs")
async def api_set_prefs(request: Request, actor_id: str = Depends(get_actor_id)):
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        raise HTTPException(status_code=400, detail="cuid 解決不可")
    body = await request.json()
    if not isinstance(body, dict) or "channels" not in body or "categories" not in body:
        raise HTTPException(status_code=400, detail="channels + categories 必須")
    saved = set_user_prefs(int(cuid), {
        "channels": body.get("channels", {}),
        "categories": body.get("categories", {}),
    })
    return JSONResponse(content={"ok": True, "saved": saved})
