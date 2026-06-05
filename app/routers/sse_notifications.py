"""殿御命 2026-06-04 cmd_478: SSE (Server-Sent Events) 通知配信
在席中 user 向け banner 表示 経路 (Push 不許可 user の代替・在席時 即時通知)
リアルタイム性重視・cache 無し pass-through (殿御方針 [[feedback_realtime_priority]])"""
import asyncio
import json
from collections import defaultdict
from typing import Dict, List

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from app.adapters.calendar_client import _to_calendar_uid
from app.deps import get_actor_id

router = APIRouter()

# cuid → list[asyncio.Queue] : 同一 user の 複数 tab 接続を集合
_listeners: Dict[int, List[asyncio.Queue]] = defaultdict(list)


def push_sse_event(cuid_list: list[int], event_type: str, payload: dict) -> dict:
    """指定 cuid list に SSE event を配信。listener が無ければ skip (in-memory queue)"""
    delivered = 0
    skipped = 0
    msg = {"type": event_type, "payload": payload}
    for cuid in cuid_list:
        queues = _listeners.get(int(cuid), [])
        if not queues:
            skipped += 1
            continue
        for q in queues:
            try:
                q.put_nowait(msg)
                delivered += 1
            except asyncio.QueueFull:
                pass
    return {"delivered": delivered, "skipped_no_listener": skipped}


@router.get("/api/bff/notifications/_debug")
def debug_listeners(actor_id: str = Depends(get_actor_id)):
    """殿御命 2026-06-04: SSE listener 状態確認用 debug endpoint"""
    from fastapi.responses import JSONResponse
    return JSONResponse(content={
        "active_cuids": list(_listeners.keys()),
        "counts": {str(k): len(v) for k, v in _listeners.items()},
    })


@router.post("/api/bff/notifications/_debug_push")
def debug_push(actor_id: str = Depends(get_actor_id)):
    """殿御命 2026-06-04: 自分宛 SSE 直接発火 (uvicorn 同一プロセス内)"""
    from fastapi.responses import JSONResponse
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        return JSONResponse(content={"error": "cuid 解決不可"}, status_code=400)
    result = push_sse_event([int(cuid)], "notif", {
        "title": "SSE 直接発火デバッグ",
        "body": "uvicorn プロセス内から殿御 listener に SSE event push",
        "url": "/notification_center",
    })
    return JSONResponse(content={"cuid": int(cuid), "result": result})


@router.get("/api/bff/notifications/stream")
async def stream_notifications(request: Request, actor_id: str = Depends(get_actor_id)):
    """SSE 接続 endpoint — 殿陣営 各 user は 自分の cuid の event を待ち受け"""
    cuid = _to_calendar_uid(actor_id)
    if cuid is None:
        async def _err():
            yield "event: error\ndata: {\"reason\":\"cuid 解決不可\"}\n\n"
        return StreamingResponse(_err(), media_type="text/event-stream")

    cuid_int = int(cuid)
    queue: asyncio.Queue = asyncio.Queue(maxsize=64)
    _listeners[cuid_int].append(queue)

    async def event_stream():
        try:
            # 初回 hello (接続確認)
            yield f"event: hello\ndata: {json.dumps({'cuid': cuid_int})}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    msg = await asyncio.wait_for(queue.get(), timeout=3.0)
                    yield f"event: {msg.get('type','message')}\ndata: {json.dumps(msg.get('payload', {}), ensure_ascii=False)}\n\n"
                except asyncio.TimeoutError:
                    # keepalive (短く・reload shutdown 即応性向上)
                    yield ": keepalive\n\n"
        finally:
            try:
                _listeners[cuid_int].remove(queue)
                if not _listeners[cuid_int]:
                    del _listeners[cuid_int]
            except (ValueError, KeyError):
                pass

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
